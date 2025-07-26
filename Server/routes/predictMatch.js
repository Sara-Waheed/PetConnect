// routes/prediction.js
import express from "express";
import axios from "axios";

const router = express.Router();

router.post("/predict-match", async (req, res) => {
  try {
    // Expect the client to send the required feature data as JSON
    const inputData = req.body;
    
    // Call the Python ML API
    const response = await axios.post("http://localhost:5001/matchPets", inputData);
    
    // Forward the prediction response to the client
    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error during prediction:", error);
    res.status(500).json({ message: "Error in prediction", error: error.message });
  }
});

export default router;
