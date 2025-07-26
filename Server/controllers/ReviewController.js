// controllers/reviews.js
import jwt         from "jsonwebtoken";
import Review      from "../models/Review.js";
import {Appointment} from "../models/Appointment.js";

export const CreateReview = async (req, res) => {
  // 1) Auth: pet-owner token
  const token = req.cookies.pet_ownerToken;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized – please log in" });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized – invalid token" });
  }
  const userId = decoded.id;

  // 2) Body params
  const { appointmentId, vetId, rating, review: text } = req.body;
  if (!appointmentId || !vetId || !rating) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  if (rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Rating must be between 1 and 5" });
  }

  try {
    // 3) Check appointment
    const appt = await Appointment.findById(appointmentId);
    if (!appt) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    if (appt.userId.toString() !== userId) {
      return res.status(403).json({ message: "You did not book this appointment" });
    }
    if (appt.vetId.toString() !== vetId) {
      return res.status(400).json({ message: "Invalid vet for this appointment" });
    }
    if (appt.status !== "completed") {
      return res.status(400).json({ message: "You can only review completed appointments" });
    }

    // 4) Prevent duplicate
    const existing = await Review.findOne({ appointment: appointmentId });
    if (existing) {
      return res.status(409).json({ message: "You have already reviewed this appointment" });
    }

    // 5) Create & save
    const newReview = new Review({
      appointment: appointmentId,
      vet:         vetId,
      user:        userId,
      rating,
      text
    });
    await newReview.save();

    res.status(201).json({ message: "Review submitted successfully" });
  } catch (err) {
    console.error("Error in CreateReview:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const GetReviewsByProvider = async (req, res) => {
  const { providerType, providerId } = req.params;
  console.log("role: ", providerType);
  console.log("id: ", providerId);

  if (!providerId) {
    return res.status(400).json({ message: "Missing providerId parameter" });
  }

  try {
    // 2) Build dynamic filter
    //    e.g. if providerType === "groomer", it will filter { groomer: providerId }
    const filter = { [providerType]: providerId };

    // 3) Query & populate
    const reviews = await Review.find(filter)
      .sort({ createdAt: -1 })               // newest-first
      .populate("user", "name email")        // reviewer info
      .populate("appointment", "date")       // (optional) when the appt happened
      .lean();

    return res.status(200).json({ reviews });
  } catch (err) {
    console.error("Error in GetReviewsByProvider:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
