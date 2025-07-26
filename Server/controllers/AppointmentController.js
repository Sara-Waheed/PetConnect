import Stripe from "stripe";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { Appointment as VetAppt  } from "../models/Appointment.js";
// rename the GroomerAppointment export to avoid collision with the other Appointment model
import { Appointment as GroomerAppointment } from "../models/GroomerAppointment.js";
import { SitterAppointment }  from "../models/SitterAppointment.js";

import { UserModel } from "../models/User.js";
import { VetModel } from "../models/Vet.js";
import Notification from '../models/Notifications.js';
import schedule from 'node-schedule';
import { VeterinarianService,PetSitterService,
  PetGroomerService } from "../models/Services.js"; import Review  from '../models/Review.js';

export const GetAppointmentById = async (req, res) => {
  // Try both cookie names
  const token = req.cookies.vetToken || req.cookies.pet_ownerToken;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized – no token" });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized – invalid token" });
  }

  const requesterId = decoded.id;
  const appointmentId = req.params.appointmentId;

  try {
    const appt = await VetAppt 
      .findById(appointmentId)
      .populate("vetId", "name roomID")
      .populate("userId", "name email")
      .lean();

    if (!appt) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Only the assigned vet or the booking user may fetch this
    if (
      appt.vetId._id.toString() !== requesterId &&
      appt.userId._id.toString() !== requesterId
    ) {
      return res.status(403).json({ message: "Forbidden – access denied" });
    }

    res.json(appt);
  } catch (err) {
    console.error("Error in GetAppointmentById:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2022-11-15",
});

export const CreateAppointment = async (req, res) => {
  const token = req.cookies.pet_ownerToken;
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const { id: userId } = jwt.verify(token, process.env.JWT_SECRET);
    const { vetId } = req.params;
    const { date, startTime, endTime, fee, consultationType } = req.body;
    const vet = await VetModel.findById(vetId);
    if (!vet) {
      return res.status(404).json({ message: "Vet not found" });
    }

    if (!vetId || !date || !startTime || !endTime || !fee) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // only video slots get a roomID
    let roomID = null;
    if (consultationType === "video") {
      roomID = uuidv4();
    }

    // 1) Create appointment in Mongo with pending payment
    const appointment = await VetAppt .create({
      vetId,
      userId,
      date: new Date(date),
      slot: { startTime, endTime, status: 'pending' },
      fee,
      consultationType: consultationType,
      roomID,
      status: "pending",
      paymentStatus: "pending",
    });

    // 2) Lookup the user’s email for the Stripe receipt
    const user = await UserModel.findById(userId);

    // 3) Create a Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer_email: user.email,
      line_items: [
        {
          price_data: {
            currency: "pkr",
            product_data: {
              name: `Consultation with Dr. ${vet.name}`,
              description: `On ${date} at ${startTime}–${endTime}`,
            },
            unit_amount: Math.round(fee * 100), // Stripe expects cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      metadata: { 
    appointmentId: appointment._id.toString(),
    providerType: "vet",          // Add this
    providerId: vetId.toString()  // Add this
  },
      success_url: `${process.env.FRONTEND_URL}/appointments/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/appointments/cancel?appointmentId=${appointment._id}`,
    });

    // 4) Save the session ID on the appointment (optional)
    appointment.stripeSessionId = session.id;
    await appointment.save();

    // controllers/appointmentController.js (in CreateAppointment function)

// 1) Create an immediate “booked” notification
await Notification.create({
  userId: appointment.userId,
  appointmentId: appointment._id,
  type: 'appointment',
  message: `Your appointment with Dr. ${vet.name} is booked.`, // Add vet name
  date: new Date() // Remove originalDate
});

// 2) Schedule reminder (optional - keep or remove based on requirements)
const remindAt = new Date(appointment.date.getTime() - 60 * 60 * 1000);
schedule.scheduleJob(remindAt, async () => {
  await Notification.create({
    userId: appointment.userId,
    appointmentId: appointment._id,
    type: 'appointment',
    message: `Reminder: Appointment with Dr. ${vet.name} today`, // Optional: Update reminder message
    date: new Date()
  });
});


    // 5) Send back the URL for the front‐end to redirect the user
    res.json({ url: session.url });
  } catch (err) {
    console.error("Error in CreateAppointment:", err);
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

export const ConfirmAppointment = async (req, res) => {
  const { session_id } = req.body;
  if (!session_id) {
    return res.status(400).json({ error: "session_id is required" });
  }

  try {
    // 1) Retrieve the Stripe session
    const session = await stripe.checkout.sessions.retrieve(session_id);

    // 2) Destructure our metadata
    const {
      appointmentId,
      providerType,   // "vet" | "groomer" | "sitter"
      providerId
    } = session.metadata || {};

    if (!appointmentId || !providerType || !providerId) {
      return res
        .status(400)
        .json({ error: "Missing appointmentId/providerType/providerId in session metadata" });
    }

    // 3) Load the right Appointment document
    let apptModel;
    if (providerType === "groomer") {
      apptModel = GroomerAppointment;
    } else if (providerType === "sitter") {
      apptModel = SitterAppointment;
    } else {
      apptModel = VetAppt ; // vet or default
    }
    const appt      = await apptModel.findById(appointmentId);
    if (!appt) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    // 4) Mark the appointment & payment as booked/paid
    appt.status        = "booked";
    appt.paymentStatus = "paid";
    appt.slot.status   = "booked";
    await appt.save();

    // 5) Pick service model & ID field for availability update
    // pick service model based on providerType
let ServiceModel;
switch (providerType) {
  case "vet":
    ServiceModel = VeterinarianService;
    break;
  case "sitter":
    ServiceModel = PetSitterService;
    break;
  case "groomer":
  default:
    ServiceModel = PetGroomerService;
    break;
}

    // 6) Build dayName and slotStart to match your availability schema
    const dayName   = appt.date.toLocaleDateString("en-US", { weekday: "long" });
    const slotStart = appt.slot.startTime; // e.g. "2:00 PM"

    // 7) Update that provider’s availability slot to “booked”
    await ServiceModel.updateOne(
      { providerId: providerId },
      {
        $set: {
          "availability.$[dayElem].slots.$[slotElem].status": "booked"
        }
      },
      {
        arrayFilters: [
          { "dayElem.day": dayName },
          { "slotElem.startTime": slotStart }
        ]
      }
    );

    return res.json({ success: true });
  } catch (err) {
    console.error("Error in ConfirmAppointment:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const StripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    // Construct event to verify the signature
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    // If the webhook signature is invalid, return a 400 error
    console.error("Webhook signature error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    // Check if appointmentId exists in session metadata
    const apptId = session.metadata.appointmentId;
    if (!apptId) {
      console.error("No appointmentId in session metadata");
      return res.status(400).send("Appointment ID not found");
    }

    try {
      // Update appointment status in your database
      await VetAppt .findByIdAndUpdate(apptId, {
        paymentStatus: "paid",
        status: "booked",
        'slot.status': 'booked',
      });

      console.log(`Appointment ${apptId} has been booked and paid.`);
    } catch (err) {
      console.error("Error updating appointment status:", err);
      return res.status(500).send("Failed to update appointment status");
    }
  } else {
    console.log(`Unhandled event type: ${event.type}`);
  }

  // Send response to acknowledge receipt of webhook
  res.json({ received: true });
};

export const CompleteAppointment = async (req, res) => {
  const token = req.cookies.vetToken;
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const { id: vetId } = jwt.verify(token, process.env.JWT_SECRET);
    const { appointmentId } = req.params;

    const appt = await VetAppt .findById(appointmentId);
    if (!appt) return res.status(404).json({ message: "Appointment not found" });

    if (appt.vetId.toString() !== vetId)
      return res.status(403).json({ message: "Not allowed to complete this appointment" });

    if (appt.status !== "in-progress")
      return res.status(400).json({ message: "Only in-progress appointments can be completed" });

    appt.status = "completed";
    appt.completedAt = new Date();
    await appt.save();

    res.json({ success: true, message: "Appointment marked as completed." });
  } catch (err) {
    console.error("Error in CompleteAppointment:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// helper to normalize any appointment doc into a common shape
function normalize(appt, type) {
  let providerId, providerName;
  switch (type) {
    case "vet":
      providerId   = appt.vetId._id;
      providerName = appt.vetId.name;
      break;
    case "sitter":
      providerId   = appt.sitterId._id;
      providerName = appt.sitterId.name;
      break;
    case "groomer":
      providerId   = appt.groomerId._id;
      providerName = appt.groomerId.name;
      break;
  }

  return {
    _id:              appt._id,
    date:             appt.date,
    slot:             appt.slot,
    status:           appt.status,
    paymentStatus:    appt.paymentStatus,
    consultationType: appt.consultationType,
    startedAt: appt.startedAt,
    completedAt: appt.completedAt,
    providerType:     type,
    providerId,
    roomID:           appt.roomID, 
    providerName,
    hasReview:        appt.hasReview || false
  };
}

export const GetUserAppointments = async (req, res) => {
  const token = req.cookies.pet_ownerToken;
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  let userId;
  try {
    ({ id: userId } = jwt.verify(token, process.env.JWT_SECRET));
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized – invalid token" });
  }

  try {
    // 1) fetch reviews by this user (any appointment type)
    const reviews = await Review.find({ user: userId }).select("appointment").lean();
    const reviewedSet = new Set(reviews.map(r => r.appointment.toString()));

    // 2) fetch each type of appointment
    const [vetAppts, sitterAppts, groomerAppts] = await Promise.all([
      VetAppt.find({ userId, paymentStatus: "paid", status: { $in: ["booked","in-progress","completed"] } })
        .populate("vetId", "name roomID").lean(),
      SitterAppointment.find({ userId, paymentStatus: "paid", status: { $in: ["booked","in-progress","completed"] } })
        .populate("sitterId", "name").lean(),
      GroomerAppointment.find({ userId, paymentStatus: "paid", status: { $in: ["booked","in-progress","completed"] } })
        .populate("groomerId", "name").lean()
    ]);
    console.log(vetAppts[0].vetId);
// Should print something like { _id: "...", name: "Dr. Smith", roomID: "abc123" }


    // 3) normalize and tag hasReview
    const all = [
      ...vetAppts.map(a => ({ ...normalize(a, "vet"),    hasReview: reviewedSet.has(a._id.toString()) })),
      ...sitterAppts.map(a => ({ ...normalize(a, "sitter"),hasReview: reviewedSet.has(a._id.toString()) })),
      ...groomerAppts.map(a=> ({ ...normalize(a, "groomer"),hasReview: reviewedSet.has(a._id.toString()) }))
    ];

    // 4) sort by date ascending
    all.sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json(all);
  } catch (err) {
    console.error("Error in GetUserAppointments:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const GetVetAppointments = async (req, res) => {
  const token = req.cookies.vetToken;
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const { id: vetId } = jwt.verify(token, process.env.JWT_SECRET);
    const appointments = await VetAppt .find({
      vetId,
      paymentStatus: "paid",
      status: { $in: ["booked", "in-progress", "completed"] }
    })
      .populate("userId", "name email")
      .sort({ date: 1, "slot.startTime": 1 })
      .lean();

    res.json(appointments);
  } catch (err) {
    console.error("Error in GetVetAppointments:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const StartAppointment = async (req, res) => {
  const token = req.cookies.vetToken;
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const { id: vetId } = jwt.verify(token, process.env.JWT_SECRET);
    const { appointmentId } = req.params;

    const appt = await VetAppt .findById(appointmentId);
    if (!appt) return res.status(404).json({ message: "Appointment not found" });
    if (appt.vetId.toString() !== vetId)
      return res.status(403).json({ message: "Not allowed" });

    appt.status = 'in-progress';
    appt.startedAt = new Date();
    await appt.save();
    res.json({ success: true });
  } catch (err) {
    console.error("Error in StartAppointment:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// 1. Check-In for Home Consultations
export const CheckInHomeAppointment = async (req, res) => {
  const token = req.cookies.vetToken;
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const { id: vetId } = jwt.verify(token, process.env.JWT_SECRET);
    const { appointmentId } = req.params;

    const appt = await VetAppt .findById(appointmentId);
    if (!appt) return res.status(404).json({ message: "Appointment not found" });

    if (appt.vetId.toString() !== vetId) {
      return res.status(403).json({ message: "Not authorized for this appointment" });
    }

    if (appt.consultationType !== "home") {
      return res.status(400).json({ message: "Check-in only available for home consultations" });
    }

    if (appt.status !== "booked") {
      return res.status(400).json({ message: "Only booked appointments can be checked in" });
    }

    appt.status = "in-progress";
    appt.startedAt = new Date();
    await appt.save();

    // Send notification
    const vet = await VetModel.findById(vetId);
    await Notification.create({
      userId: appt.userId,
      appointmentId: appt._id,
      type: 'appointment',
      message: `${vet.name} has checked in for your home consultation`,
      date: new Date()
    });

    res.json({ success: true, message: "Checked in successfully" });
  } catch (err) {
    console.error("Error in CheckInHomeAppointment:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// 2. Check-Out for Home Consultations
export const CheckOutHomeAppointment = async (req, res) => {
  const token = req.cookies.vetToken;
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const { id: vetId } = jwt.verify(token, process.env.JWT_SECRET);
    const { appointmentId } = req.params;

    const appt = await VetAppt .findById(appointmentId);
    if (!appt) return res.status(404).json({ message: "Appointment not found" });

    if (appt.vetId.toString() !== vetId) {
      return res.status(403).json({ message: "Not authorized for this appointment" });
    }

    if (appt.consultationType !== "home") {
      return res.status(400).json({ message: "Check-out only available for home consultations" });
    }

    if (appt.status !== "in-progress") {
      return res.status(400).json({ message: "Only in-progress appointments can be checked out" });
    }

    appt.status = "completed";
    appt.completedAt = new Date();
    await appt.save();

    // Send notification
    const vet = await VetModel.findById(vetId);
    await Notification.create({
      userId: appt.userId,
      appointmentId: appt._id,
      type: 'appointment',
      message: `${vet.name} has completed your home consultation`,
      date: new Date()
    });

    res.json({ success: true, message: "Checked out successfully" });
  } catch (err) {
    console.error("Error in CheckOutHomeAppointment:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// 3. Cancel Appointment
export const CancelAppointment = async (req, res) => {
  const token = req.cookies.pet_ownerToken || req.cookies.vetToken;
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { appointmentId } = req.params;

    const appt = await VetAppt .findById(appointmentId);
    if (!appt) return res.status(404).json({ message: "Appointment not found" });

    // Authorization check
    if (decoded.role === 'vet' && appt.vetId.toString() !== decoded.id) {
      return res.status(403).json({ message: "Not authorized to cancel this appointment" });
    }

    if (decoded.role === 'user' && appt.userId.toString() !== decoded.id) {
      return res.status(403).json({ message: "Not authorized to cancel this appointment" });
    }

    // Update status
    appt.status = "cancelled";
    appt.paymentStatus = "refunded"; // or keep as paid depending on policy
    await appt.save();

    // Send notification
    await Notification.create({
      userId: appt.userId,
      appointmentId: appt._id,
      type: 'appointment',
      message: `Appointment with ${appt.vetId.name} has been cancelled`,
      date: new Date()
    });

    res.json({ success: true, message: "Appointment cancelled" });
  } catch (err) {
    console.error("Error in CancelAppointment:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const GetAdminAppointments = async (req, res) => {
  const token = req.cookies.adminToken;
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') return res.status(403).json({ message: "Forbidden" });

    const [vetAppts, sitterAppts, groomerAppts] = await Promise.all([
      VetAppt.find({})
        .populate("vetId", "name")
        .populate("userId", "name email")
        .lean(),
      SitterAppointment.find({})
        .populate("sitterId", "name")
        .populate("userId", "name email")
        .lean(),
      GroomerAppointment.find({})
        .populate("groomerId", "name")
        .populate("userId", "name email")
        .lean()
    ]);

    const normalizeAdmin = (appt, type) => ({
      _id: appt._id,
      type: type,
      date: appt.date,
      slot: appt.slot,
      status: appt.status,
      startedAt: appt.startedAt,
      completedAt: appt.completedAt,
      consultationType: appt.consultationType,
      provider: {
        id: appt[`${type}Id`]._id,
        name: appt[`${type}Id`].name
      },
      user: {
        id: appt.userId._id,
        name: appt.userId.name,
        email: appt.userId.email
      },
      paymentStatus: appt.paymentStatus
    });

    const allAppointments = [
      ...vetAppts.map(a => normalizeAdmin(a, 'vet')),
      ...sitterAppts.map(a => normalizeAdmin(a, 'sitter')),
      ...groomerAppts.map(a => normalizeAdmin(a, 'groomer'))
    ];

    res.json(allAppointments);
  } catch (err) {
    console.error("Error in GetAdminAppointments:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};