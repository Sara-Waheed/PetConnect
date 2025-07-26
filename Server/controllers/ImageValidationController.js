// controllers/imageValidation.controller.js
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY;

export const validateHomeImages = async (req, res) => {
  try {
    if (!req.files?.length) {
        console.log("no images provided");
      return res.status(400).json({ valid: false, error: "No images provided" });
    }

    // instantiate your client exactly like getRecommendation  
    const genAI = new GoogleGenerativeAI(API_KEY);

    // grab the vision+text model  
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        temperature: 0.0,     // deterministic yes/no
        maxOutputTokens: 5,   // only “yes” or “no”
      },
    });

    // the yes/no prompt
    const validationPrompt = `
Analyze this image carefully.
Does it show a legitimate residential home environment?
Look for clear evidence of living spaces, furniture, yards, or other residential features.
Respond only with "yes" or "no".
`.trim();

    // validate each upload
    const validationResults = await Promise.all(
      req.files.map(async (file) => {
        try {
          // **IMPORTANT**: pass the image part exactly as `{ inlineData: { data, mimeType } }`
          const imagePart = {
            inlineData: {
              data: file.buffer.toString("base64"),
              mimeType: file.mimetype,
            },
          };

          // pass [ promptString, imagePart ] per the SDK quickstart
          const result = await model.generateContent([validationPrompt, imagePart]);
          const answer = result.response.text(); // e.g. “yes” or “no”
          return answer.trim().toLowerCase() === "yes";
        } catch (err) {
          console.error("Gemini validation error:", err);
          return false;
        }
      })
    );

    if (validationResults.every(Boolean)) {
      return res.json({ valid: true });
    } else {
      return res.status(400).json({
        valid: false,
        error:
          "Some images don't appear to show valid home environments. " +
          "Please upload clear photos of your living space.",
      });
    }
  } catch (err) {
    console.error("Image validation error:", err);
    return res.status(500).json({ valid: false, error: err.toString() });
  }
};
