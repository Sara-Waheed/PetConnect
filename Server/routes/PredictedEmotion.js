import express from 'express'; 
import {PetModel} from '../models/Pet.js';
import {getRecommendation} from '../services/geminiService.js'

const router = express.Router(); // Pet model (MongoDB schema)

// Route: Store predicted emotion for a pet
router.post("/store-prediction", async (req, res) => {
  const { petId, emotion, confidence, activity } = req.body;

  if (!petId || !emotion || !confidence) {
    return res
      .status(400)
      .json({ success: false, message: "Missing data fields." });
  }

  try {
    // Find the pet by ID
    const pet = await PetModel.findById(petId);
    if (!pet) {
      return res
        .status(404)
        .json({ success: false, message: "Pet not found." });
    }

    console.log("activity: " , activity);

    // Store the emotion prediction along with the activity
    pet.emotions.push({
      emotion,
      confidence, // Array of probabilities
      activity: activity || "", // Store the activity or default to an empty string
      timestamp: new Date(),
    });

    await pet.save();

    return res
      .status(200)
      .json({ success: true, message: "Prediction stored successfully." });
  } catch (error) {
    console.error("Error storing prediction:", error);
    return res.status(500).json({
      success: false,
      message: "Server error. Could not store prediction.",
    });
  }
});

// Route: Get all emotions for a pet by name
router.get("/emotions/:petName", async (req, res) => {
    const { petName } = req.params;
  
    try {
      // Find the pet by name and select the emotions field
      const pet = await PetModel.findOne({ name: petName }).select('emotions');
      if (!pet) {
        return res.status(404).json({ success: false, message: "Pet not found." });
      }
  
      // Return the emotions associated with the pet
      return res.status(200).json({ success: true, emotions: pet.emotions });
    } catch (error) {
      console.error("Error fetching emotions:", error);
      return res.status(500).json({ success: false, message: "Server error. Could not fetch emotions." });
    }
  });
  
  router.post("/emotion-recommendations", async (req, res) => {
    try {
      const { emotion, activity, petType } = req.body;
      
      // Convert activity into a string.
      let activityText = "";
      if (Array.isArray(activity)) {
        activityText = activity.join(", ");
      } else if (typeof activity === "string" && activity.trim().length > 0) {
        activityText = activity.trim();
      }
      
      // Compose the prompt using the emotion, petType, and (if provided) the previous activities.
      const prompt =
        `The pet is currently experiencing the emotion "${emotion}"` +
        (petType ? ` and it is a ${petType}` : " ") +
        (activityText
          ? `. Previously, the pet responded positively to the activity: "${activityText}". Use this experience to suggest ways to recreate a similarly calming or uplifting environment.`
          : ".") +
        ` Provide 3-5 concise, actionable recommendations with clear headings and bullet points to help improve the pet's mood. Do not include any extraneous commentary.`;

        
      const recommendation = await getRecommendation(prompt);
      
      return res.status(200).json({
        success: true,
        recommendation, // e.g. "Heading: Tips\n• Tip 1\n• Tip 2\n• Tip 3"
      });
    } catch (err) {
      console.error("Error fetching recommendation:", err);
      return res.status(500).json({
        success: false,
        message: "Error fetching recommendation"
      });
    }
  });  
  

export default router;
