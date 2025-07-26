import Stripe from "stripe";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import schedule from "node-schedule";

import { SitterAppointment }   from "../models/SitterAppointment.js";
import { UserModel }           from "../models/User.js";
import { SitterModel }         from "../models/Sitter.js";  // assuming your combined-service file
import Notification            from "../models/Notifications.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2022-11-15",
});

// 1) Create a sitter appointment
export const CreateSitterAppointment = async (req, res) => {
  const token = req.cookies.pet_ownerToken;
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const { id: userId } = jwt.verify(token, process.env.JWT_SECRET);
    const { sitterId }   = req.params;
    const { date, startTime, endTime, fee, consultationType } = req.body;

    // validation
    if (!sitterId || !date || !startTime || !endTime || !fee || !consultationType) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    if (!["drop-off", "home"].includes(consultationType)) {
      return res.status(400).json({ message: "Invalid consultationType" });
    }

    const sitter = await SitterModel.findById(sitterId);
    if (!sitter) return res.status(404).json({ message: "Sitter not found" });

    const appointment = await SitterAppointment.create({
      sitterId,
      userId,
      date: new Date(date),
      slot: { startTime, endTime, status: "pending" },
      fee,
      consultationType,
      status:        "pending",
      paymentStatus: "pending",
    });

    const user = await UserModel.findById(userId);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer_email: user.email,
      line_items: [
        {
          price_data: {
            currency: "pkr",
            product_data: {
              name: `Sitting with ${sitter.name}`,
              description: `On ${date} (${consultationType}) from ${startTime}–${endTime}`,
            },
            unit_amount: Math.round(fee * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      metadata: {
        appointmentId: appointment._id.toString(),
        providerType:  "sitter",
        providerId:    appointment.sitterId.toString()
      },
      success_url: `${process.env.FRONTEND_URL}/appointments/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${process.env.FRONTEND_URL}/appointments/cancel?appointmentId=${appointment._id}`,
    });

    // save session id
    appointment.stripeSessionId = session.id;
    await appointment.save();

    // notify user
    await Notification.create({
      userId:        appointment.userId,
      appointmentId: appointment._id,
      type:          "appointment",
      message:       `Your pet-sitting appointment with ${sitter.name} is booked.`,
      date:          new Date()
    });

    // schedule a 1-hour-before reminder
    const remindAt = new Date(appointment.date.getTime() - 60 * 60 * 1000);
    schedule.scheduleJob(remindAt, async () => {
      await Notification.create({
        userId:        appointment.userId,
        appointmentId: appointment._id,
        type:          "appointment",
        message:       `Reminder: Pet-sitting appointment with ${sitter.name} today`,
        date:          new Date()
      });
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("Error in CreateSitterAppointment:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// 2) Get a user's sitter appointments
export const GetUserSitterAppointments = async (req, res) => {
  const token = req.cookies.pet_ownerToken;
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const { id: userId } = jwt.verify(token, process.env.JWT_SECRET);

    const appointments = await SitterAppointment.find({
      userId,
      paymentStatus: "paid",
      status: { $in: ["booked", "in-progress", "completed"] }
    })
      .populate("sitterId", "name")
      .sort({ date: 1, "slot.startTime": 1 })
      .lean();

    res.json(appointments);
  } catch (err) {
    console.error("Error in GetUserSitterAppointments:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// 3) Confirm sitter appointment payment
export const ConfirmSitterAppointment = async (req, res) => {
  const { session_id } = req.body;
  if (!session_id) {
    return res.status(400).json({ error: "session_id is required" });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);
    const apptId  = session.metadata?.appointmentId;

    if (!apptId) {
      return res.status(400).json({ error: "Missing appointmentId in session metadata" });
    }

    // mark the sitter appointment paid/booked
    const appt = await SitterAppointment.findById(apptId);
    if (!appt) return res.status(404).json({ error: "Appointment not found" });

    appt.status        = "booked";
    appt.paymentStatus = "paid";
    appt.slot.status   = "booked";
    await appt.save();

    // update the sitter’s availability array
    const dayName   = appt.date.toLocaleDateString("en-US", { weekday: "long" });
    const slotStart = appt.slot.startTime;

    await PetSitterService.updateOne(
      { providerId: appt.sitterId },
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

    res.json({ success: true });
  } catch (err) {
    console.error("Error in ConfirmSitterAppointment:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// 4) Stripe webhook handler (optional reuse)
export const SitterStripeWebhook = async (req, res) => {
  const sig   = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Sitter Webhook signature error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const apptId  = session.metadata.appointmentId;
    if (apptId) {
      await SitterAppointment.findByIdAndUpdate(apptId, {
        paymentStatus: "paid",
        status:        "booked",
        "slot.status": "booked",
      });
      console.log(`Sitter appointment ${apptId} marked booked/paid.`);
    }
  }

  res.json({ received: true });
};

// 5) Complete sitter appointment (provider marks done)
// Updated CompleteSitterAppointment with notifications
export const CompleteSitterAppointment = async (req, res) => {
  const token = req.cookies.sitterToken;
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const { id: sitterId } = jwt.verify(token, process.env.JWT_SECRET);
    const { appointmentId } = req.params;

    const appt = await SitterAppointment.findById(appointmentId);
    if (!appt) return res.status(404).json({ message: "Appointment not found" });

    if (appt.sitterId.toString() !== sitterId) {
      return res.status(403).json({ message: "Not allowed to complete this appointment" });
    }
    
    if (appt.status !== "in-progress") {
      return res.status(400).json({ message: "Only in-progress appointments can be completed" });
    }

    appt.status = "completed";
    await appt.save();

    // Add notification
    const sitter = await SitterModel.findById(sitterId);
    await Notification.create({
      userId: appt.userId,
      appointmentId: appt._id,
      type: "appointment",
      message: `Drop-off service with ${sitter.name} has been completed`,
      date: new Date()
    });

    res.json({ success: true, message: "Appointment completed" });
  } catch (err) {
    console.error("Error in CompleteSitterAppointment:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
// 6) Fetch all sitter’s upcoming/completed appointments
export const GetSitterAppointments = async (req, res) => {
  const token = req.cookies.sitterToken;
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const { id: sitterId } = jwt.verify(token, process.env.JWT_SECRET);

    const appts = await SitterAppointment.find({
      sitterId,
      paymentStatus: "paid",
      status: { $in: ["booked", "in-progress", "completed"] }
    })
      .populate("userId", "name email")
      .sort({ date: 1, "slot.startTime": 1 })
      .lean();

    res.json(appts);
  } catch (err) {
    console.error("Error in GetSitterAppointments:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// 7) Fetch sitter profile (for frontend calendar & details)
export const GetSitterById = async (req, res) => {
  const token = req.cookies.pet_ownerToken;
  if (!token) return res.status(401).json({ message: "Unauthorized" });
  try {
    jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }

  try {
    const sitter = await SitterModel.findById(req.params.sitterId).lean();
    if (!sitter) return res.status(404).json({ message: "Sitter not found" });
    res.json(sitter);
  } catch (err) {
    console.error("Error in GetSitterById:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 8) Check-in for home visits
export const CheckInSitterAppointment = async (req, res) => {
  const token = req.cookies.sitterToken;
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const { id: sitterId } = jwt.verify(token, process.env.JWT_SECRET);
    const { appointmentId } = req.params;

    const appt = await SitterAppointment.findById(appointmentId);
    if (!appt) return res.status(404).json({ message: "Appointment not found" });

    if (appt.sitterId.toString() !== sitterId) {
      return res.status(403).json({ message: "Not authorized for this appointment" });
    }

    if (appt.status !== "booked") {
      return res.status(400).json({ message: "Only booked appointments can be checked in" });
    }

    if (appt.consultationType !== "home") {
      return res.status(400).json({ message: "Check-in only available for home visits" });
    }

    appt.status = "in-progress";
    await appt.save();

    // Send notification to user
    const sitter = await SitterModel.findById(sitterId);
    await Notification.create({
      userId: appt.userId,
      appointmentId: appt._id,
      type: "appointment",
      message: `${sitter.name} has checked in for your home pet-sitting appointment`,
      date: new Date()
    });

    res.json({ success: true, message: "Checked in successfully" });
  } catch (err) {
    console.error("Error in CheckInSitterAppointment:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// 9) Check-out for home visits
export const CheckOutSitterAppointment = async (req, res) => {
  const token = req.cookies.sitterToken;
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const { id: sitterId } = jwt.verify(token, process.env.JWT_SECRET);
    const { appointmentId } = req.params;

    const appt = await SitterAppointment.findById(appointmentId);
    if (!appt) return res.status(404).json({ message: "Appointment not found" });

    if (appt.sitterId.toString() !== sitterId) {
      return res.status(403).json({ message: "Not authorized for this appointment" });
    }

    if (appt.status !== "in-progress") {
      return res.status(400).json({ message: "Only in-progress appointments can be checked out" });
    }

    if (appt.consultationType !== "home") {
      return res.status(400).json({ message: "Check-out only available for home visits" });
    }

    appt.status = "completed";
    await appt.save();

    // Send notification to user
    const sitter = await SitterModel.findById(sitterId);
    await Notification.create({
      userId: appt.userId,
      appointmentId: appt._id,
      type: "appointment",
      message: `${sitter.name} has completed your home pet-sitting appointment`,
      date: new Date()
    });

    res.json({ success: true, message: "Checked out successfully" });
  } catch (err) {
    console.error("Error in CheckOutSitterAppointment:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// 10) Start drop-off service
export const StartSitterAppointment = async (req, res) => {
  const token = req.cookies.sitterToken;
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const { id: sitterId } = jwt.verify(token, process.env.JWT_SECRET);
    const { appointmentId } = req.params;

    const appt = await SitterAppointment.findById(appointmentId);
    if (!appt) return res.status(404).json({ message: "Appointment not found" });

    if (appt.sitterId.toString() !== sitterId) {
      return res.status(403).json({ message: "Not authorized for this appointment" });
    }

    if (appt.consultationType !== "drop-off") {
      return res.status(400).json({ message: "Start service only for drop-off appointments" });
    }

    if (appt.status !== "booked") {
      return res.status(400).json({ message: "Only booked appointments can be started" });
    }

    appt.status = "in-progress";
    await appt.save();

    // Send notification to user
    const sitter = await SitterModel.findById(sitterId);
    await Notification.create({
      userId: appt.userId,
      appointmentId: appt._id,
      type: "appointment",
      message: `Your drop-off service with ${sitter.name} has started`,
      date: new Date()
    });

    res.json({ success: true, message: "Service started successfully" });
  } catch (err) {
    console.error("Error in StartSitterAppointment:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
