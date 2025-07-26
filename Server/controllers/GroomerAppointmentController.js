import Stripe from "stripe";
import jwt from "jsonwebtoken";
import { Appointment } from "../models/GroomerAppointment.js"; // Adjust path if needed
import { UserModel } from "../models/User.js";
import { GroomerModel } from "../models/Groomer.js"; // Assuming you have this model
import Notification from "../models/Notifications.js";
import schedule from "node-schedule";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2022-11-15",
});

// Create a groomer appointment
export const CreateGroomerAppointment = async (req, res) => {
  const token = req.cookies.pet_ownerToken;
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const { id: userId } = jwt.verify(token, process.env.JWT_SECRET);
    const { groomerId } = req.params;
    const { date, startTime, endTime, fee, consultationType } = req.body;

    if (!groomerId || !date || !startTime || !endTime || !fee) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const groomer = await GroomerModel.findById(groomerId);
    if (!groomer) {
      return res.status(404).json({ message: "Groomer not found" });
    }

    const appointment = await Appointment.create({
      groomerId,
      userId,
      date: new Date(date),
      slot: { startTime, endTime, status: 'pending' },
      fee,
      consultationType,
      status: "pending",
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
              name: `Grooming with ${groomer.name}`,
              description: `On ${date} from ${startTime}–${endTime}`,
            },
            unit_amount: Math.round(fee * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      metadata: {
    appointmentId: appointment._id.toString(),
    providerType:   "groomer",
    providerId:     appointment.groomerId.toString()
  },
      success_url: `${process.env.FRONTEND_URL}/appointments/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/appointments/cancel?appointmentId=${appointment._id}`,
    });

    appointment.stripeSessionId = session.id;
    await appointment.save();

    await Notification.create({
      userId: appointment.userId,
      appointmentId: appointment._id,
      type: 'appointment',
      message: `Your grooming appointment with Groomer ${groomer.name} is booked.`,
      date: new Date()
    });

    const remindAt = new Date(appointment.date.getTime() - 60 * 60 * 1000);
    schedule.scheduleJob(remindAt, async () => {
      await Notification.create({
        userId: appointment.userId,
        appointmentId: appointment._id,
        type: 'appointment',
        message: `Reminder: Grooming appointment with ${groomer.name} today`,
        date: new Date()
      });
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("Error in CreateGroomerAppointment:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const GetUserGroomerAppointments = async (req, res) => {
  const token = req.cookies.pet_ownerToken;
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    // verify token and extract userId
    const { id: userId } = jwt.verify(token, process.env.JWT_SECRET);

    // fetch appointments that are paid and in a valid status
    const appointments = await Appointment.find({
      userId,
      paymentStatus: "paid",
      status: { $in: ["booked", "in-progress", "completed"] }
    })
      .populate("groomerId", "name")   // bring in groomer’s name
      .sort({ date: 1, "slot.startTime": 1 })
      .lean();

    res.json(appointments);
  } catch (err) {
    console.error("Error in GetUserGroomerAppointments:", err);
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};
// Confirm groomer appointment payment
export const ConfirmGroomerAppointment = async (req, res) => {
  const { session_id } = req.body;

  if (!session_id) {
    return res.status(400).json({ error: "session_id is required" });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);
    const apptId = session.metadata?.appointmentId;

    if (!apptId) {
      return res.status(400).json({ error: "Missing appointmentId in session metadata" });
    }

    const updatedAppt = await Appointment.findById(apptId);
    if (!updatedAppt) return res.status(404).json({ error: "Appointment not found" });

    updatedAppt.status = "booked";
    updatedAppt.paymentStatus = "paid";
    updatedAppt.slot.status = "booked";
    await updatedAppt.save();

    res.json({ success: true });
  } catch (err) {
    console.error("Error in ConfirmGroomerAppointment:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Webhook handler (same logic can be reused)
export const GroomerStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const apptId = session.metadata.appointmentId;

    if (!apptId) {
      return res.status(400).send("Appointment ID not found");
    }

    try {
      await Appointment.findByIdAndUpdate(apptId, {
        paymentStatus: "paid",
        status: "booked",
        'slot.status': 'booked',
      });

      console.log(`Groomer appointment ${apptId} has been booked and paid.`);
    } catch (err) {
      console.error("Error updating appointment status:", err);
      return res.status(500).send("Failed to update appointment status");
    }
  }

  res.json({ received: true });
};

// Mark groomer appointment as completed
export const CompleteGroomerAppointment = async (req, res) => {
  const token = req.cookies.groomerToken; // Adjust token name if needed
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const { id: groomerId } = jwt.verify(token, process.env.JWT_SECRET);
    const { appointmentId } = req.params;

    const appt = await Appointment.findById(appointmentId);
    if (!appt) return res.status(404).json({ message: "Appointment not found" });

    if (appt.groomerId.toString() !== groomerId)
      return res.status(403).json({ message: "Not allowed to complete this appointment" });

    if (appt.status !== "in-progress")
      return res.status(400).json({ message: "Only in-progress appointments can be completed" });

    appt.status = "completed";
    await appt.save();

    res.json({ success: true, message: "Appointment completed" });
  } catch (err) {
    console.error("Error in CompleteGroomerAppointment:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Fetch groomer’s booked/in-progress/completed appointments
export const GetGroomerAppointments = async (req, res) => {
  const token = req.cookies.groomerToken;
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const { id: groomerId } = jwt.verify(token, process.env.JWT_SECRET);

    const appointments = await Appointment.find({
      groomerId,
      paymentStatus: "paid",
      status: { $in: ["booked", "in-progress", "completed"] },
    })
      .populate("userId", "name email")
      .sort({ date: 1, "slot.startTime": 1 })
      .lean();

    res.json(appointments);
  } catch (err) {
    console.error("Error in GetGroomerAppointments:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const GetGroomerById = async (req, res) => {
  // 1) verify token
  const token = req.cookies.pet_ownerToken;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try {
    jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }

  // 2) fetch groomer
  try {
    const groomer = await GroomerModel.findById(req.params.groomerId).lean();
    if (!groomer) return res.status(404).json({ message: 'Groomer not found' });
    res.json(groomer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Check-in for home services
export const CheckInGroomerAppointment = async (req, res) => {
  const token = req.cookies.groomerToken;
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const { id: groomerId } = jwt.verify(token, process.env.JWT_SECRET);
    const { appointmentId } = req.params;

    const appt = await Appointment.findById(appointmentId);
    if (!appt) return res.status(404).json({ message: "Appointment not found" });

    if (appt.groomerId.toString() !== groomerId)
      return res.status(403).json({ message: "Not allowed to check in this appointment" });

    if (appt.status !== "booked")
      return res.status(400).json({ message: "Only booked appointments can be checked in" });

    appt.status = "in-progress";
    await appt.save();

    // Send notification to user
    const groomer = await GroomerModel.findById(groomerId);
    await Notification.create({
      userId: appt.userId,
      appointmentId: appt._id,
      type: 'appointment',
      message: `${groomer.name} has checked in for your home grooming appointment`,
      date: new Date()
    });

    res.json({ success: true, message: "Checked in successfully" });
  } catch (err) {
    console.error("Error in CheckInGroomerAppointment:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Check-out for home services
export const CheckOutGroomerAppointment = async (req, res) => {
  const token = req.cookies.groomerToken;
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const { id: groomerId } = jwt.verify(token, process.env.JWT_SECRET);
    const { appointmentId } = req.params;

    const appt = await Appointment.findById(appointmentId);
    if (!appt) return res.status(404).json({ message: "Appointment not found" });

    if (appt.groomerId.toString() !== groomerId)
      return res.status(403).json({ message: "Not allowed to check out this appointment" });

    if (appt.status !== "in-progress")
      return res.status(400).json({ message: "Only in-progress appointments can be checked out" });

    appt.status = "completed";
    await appt.save();

    // Send notification to user
    const groomer = await GroomerModel.findById(groomerId);
    await Notification.create({
      userId: appt.userId,
      appointmentId: appt._id,
      type: 'appointment',
      message: `${groomer.name} has completed your home grooming appointment`,
      date: new Date()
    });

    res.json({ success: true, message: "Checked out successfully" });
  } catch (err) {
    console.error("Error in CheckOutGroomerAppointment:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Start salon appointments
export const StartGroomerAppointment = async (req, res) => {
  const token = req.cookies.groomerToken;
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const { id: groomerId } = jwt.verify(token, process.env.JWT_SECRET);
    const { appointmentId } = req.params;

    const appt = await Appointment.findById(appointmentId);
    if (!appt) return res.status(404).json({ message: "Appointment not found" });

    if (appt.groomerId.toString() !== groomerId)
      return res.status(403).json({ message: "Not allowed to start this appointment" });

    if (appt.status !== "booked")
      return res.status(400).json({ message: "Only booked appointments can be started" });

    appt.status = "in-progress";
    await appt.save();

    // Send notification to user
    const groomer = await GroomerModel.findById(groomerId);
    await Notification.create({
      userId: appt.userId,
      appointmentId: appt._id,
      type: 'appointment',
      message: `Your salon grooming appointment with ${groomer.name} has started`,
      date: new Date()
    });

    res.json({ success: true, message: "Appointment started" });
  } catch (err) {
    console.error("Error in StartGroomerAppointment:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

