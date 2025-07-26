import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import {
  Button,
  Typography,
  Paper,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  TextField,
  Box,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import ReactMarkdown from "react-markdown";
import image1 from "../assets/image1.jpg";

const EmotionPrediction = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [predictionResult, setPredictionResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pets, setPets] = useState([]);
  const [selectedPet, setSelectedPet] = useState("");
  const [activityInput, setActivityInput] = useState("");
  const [showActivityPrompt, setShowActivityPrompt] = useState(false);
  const [activitySubmitted, setActivitySubmitted] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [isFetchingRecommendations, setIsFetchingRecommendations] = useState(false);

  const allowedFileTypes = ["image/jpeg", "image/png", "image/jpg"];

  // Example emotion classes with emojis
  const emotionClasses = {
    0: { label: "Angry", emoji: "😡" },
    1: { label: "Happy", emoji: "😊" },
    2: { label: "Relaxed", emoji: "😌" },
    3: { label: "Sad", emoji: "😢" },
  };

  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchPets = async () => {
      try {
        const response = await axios.get("http://localhost:5000/auth/get-user-pets", {
          withCredentials: true,
        });
        if (response.data.success) {
          setPets(response.data.pets);
        } else {
          setErrorMessage(response.data.message);
        }
      } catch (error) {
        console.error("Failed to fetch pets", error);
      }
    };
    fetchPets();
  }, []);

  const resetUI = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setPredictionResult(null);
    setActivityInput("");
    setShowActivityPrompt(false);
    setActivitySubmitted(false);
    // If you want to keep recommendations visible, comment out the next line
    // setRecommendations([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileChange = (e) => {
    setErrorMessage("");
     setPredictionResult(null);
     setShowActivityPrompt(false);
     setActivitySubmitted(false);
     setRecommendations([]);
    const file = e.target.files[0];
    if (file) {
      setPredictionResult(null);
      setErrorMessage("");
      if (!allowedFileTypes.includes(file.type)) {
        setErrorMessage("Only JPG, JPEG, and PNG files are allowed.");
        setSelectedFile(null);
        setImagePreview(null);
      } else {
        setSelectedFile(file);
        setImagePreview(URL.createObjectURL(file));
      }
    }
  };

  // Updated fetchRecommendations function that passes petType if available.
  const fetchRecommendations = async (emotion, activity) => {
    setIsFetchingRecommendations(true);
    try {
      let petType = "";
      if (selectedPet) {
        const pet = pets.find((p) => p._id === selectedPet);
        if (pet && pet.type) {
          petType = pet.type;
        }
      }
      // Prepare payload; "activity" can be an array (for sad/angry) or empty string
      const payload = { emotion, activity, petType };
      const response = await axios.post("http://localhost:5000/pets/emotion-recommendations", payload);
      if (response.data.success) {
        const rawText = response.data.recommendation || "";
        // Parse the returned text into an array of bullet points.
        const lines = rawText
          .split(/[\n\r]+/)
          .map((line) => line.trim())
          .filter((line) => line.length > 0);
        setRecommendations(lines);
      } else {
        console.error("Error:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    } finally {
      setIsFetchingRecommendations(false);
    }
  };  

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMessage("Please select a valid image file.");
      return;
    }
    const formData = new FormData();
    formData.append("file", selectedFile);
    if (selectedPet) {
      formData.append("petId", selectedPet);
    }
    try {
      setIsLoading(true);
      setPredictionResult(null);
      setShowActivityPrompt(false);
      setActivitySubmitted(false);
      setRecommendations([]);
      const response = await axios.post("http://127.0.0.1:8000/predict/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setPredictionResult(response.data);
      const emotion = response.data.emotion;
      if (selectedPet) {
        if (emotion === "Happy" || emotion === "Relaxed") {
          // For positive emotions, show the activity prompt (user may input an activity)
          setShowActivityPrompt(true);
        } else if (emotion === "Sad" || emotion === "Angry") {
          // For negative emotions, fetch previous activities and pass them with the emotion
          fetchPreviousActivities(emotion);
        } else {
          // For any other emotion, store prediction without activity and fetch recommendations normally.
          await axios.post("http://localhost:5000/pets/store-prediction", {
            petId: selectedPet,
            emotion,
            confidence: response.data.probabilities[0],
            activity: "",
          });
          fetchRecommendations(emotion, "");
        }
      } else {
        // If no pet is selected, simply fetch recommendations with an empty activity
        fetchRecommendations(emotion, "");
      }
    } catch (error) {
      if (error.response && error.response.status === 500) {
        setErrorMessage("Prediction failed.");
      } else {
        setErrorMessage("Failed to predict emotion. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleActivitySubmit = async () => {
    const activityToSend = activityInput.trim() || "No specific activity";
    try {
      setIsLoading(true);
      await axios.post("http://localhost:5000/pets/store-prediction", {
        petId: selectedPet,
        emotion: predictionResult.emotion,
        confidence: predictionResult.probabilities[0],
        activity: activityToSend,
      });
      setActivitySubmitted(true);
      setShowActivityPrompt(false);
      // For Happy/Relaxed, we send just the emotion (or you can pass the activity if needed)
      fetchRecommendations(predictionResult.emotion, "");
    } catch (error) {
      console.error("Failed to store prediction with activity", error);
      setErrorMessage("Failed to save activity. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to fetch previous activities from the pet's profile for "Sad"/"Angry"
  const fetchPreviousActivities = async (emotion) => {
    try {
      // const petId = selectedPet;
      const response = await axios.get(`http://localhost:5000/auth/pets/${selectedPet}`);
      const petData = response.data.pet;
      // Extract previous activities stored when the pet was Happy or Relaxed
      const previousActivities = petData.emotions
        .filter((entry) => entry.emotion === "Happy" || entry.emotion === "Relaxed")
        .map((entry) => entry.activity);
      // Use fallback if no previous activity exists
      const activitiesToSend = previousActivities.length > 0 ? previousActivities : ["No previous activity"];
      // Call fetchRecommendations with the previous activities array
      fetchRecommendations(emotion, activitiesToSend);
    } catch (error) {
      console.error("Failed to fetch previous activities", error);
      setErrorMessage("Failed to fetch previous activities. Please try again.");
    }
  };
  

  // Determine whether to show the right column for prediction details.
  const showRightColumn = predictionResult || showActivityPrompt ;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundImage: `url(${image1})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        position: "relative",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        pt: showRightColumn ? 2 : 10,
      }}
    >
      <Paper
        elevation={12}
        sx={{
          position: "relative",
          zIndex: 1,
          px: 4,
          pt: 2,
          pb: 4,
          maxWidth: showRightColumn ? "1024px" : "600px",
          width: "90%",
          borderRadius: 3,
          backgroundColor: "rgba(255, 255, 255, 0.92)",
          backdropFilter: "blur(6px)",
        }}
      >
        <Typography
          component="h1"
          variant="h4"
          align="center"
          sx={{ fontWeight: "bold", mb: 3, color: "#c2410c" }}
        >
          Pet Emotion Predictor
        </Typography>

        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 4,
            justifyContent: showRightColumn ? "flex-start" : "center",
          }}
        >
          {/* LEFT COLUMN */}
          <Box
            sx={{
              flex: showRightColumn ? "1 1 300px" : "0 0 450px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <form onSubmit={handleSubmit} style={{ width: "100%" }}>
              <FormControl fullWidth variant="outlined" sx={{ mb: 1, "& .MuiInputBase-root": { minHeight: 32 } }}>
                <InputLabel id="pet-select-label" sx={{ color: "#424242", fontSize: "0.875rem" }}>
                  Select Pet
                </InputLabel>
                <Select
                  labelId="pet-select-label"
                  value={selectedPet}
                  onChange={(e) => setSelectedPet(e.target.value)}
                  label="Select Pet"
                  size="medium"
                  sx={{
                    backgroundColor: "white",
                    borderRadius: 1,
                    "& .MuiOutlinedInput-input": { py: 1 },
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: "#BDBDBD" },
                  }}
                >
                  <MenuItem value="">None</MenuItem>
                  {pets.map((pet) => (
                    <MenuItem key={pet._id} value={pet._id}>
                      {pet.name} {pet.type ? `(${pet.type})` : ""}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Typography variant="caption" sx={{ mb: 1, display: "block", lineHeight: 1.5, textAlign: "justify", color: "#4d7c0f" }}>
                Select your pet's profile to track their mood over time. This helps us deliver personalized insights and tailored recommendations.
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body1" sx={{ mb: 1, color: "#424242" }}>
                  Upload an Image
                </Typography>
                <input
                  type="file"
                  id="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #BDBDBD",
                    borderRadius: "4px",
                    backgroundColor: "white",
                  }}
                />
                {errorMessage && (
                  <Typography variant="body2" sx={{ color: "#D32F2F", mt: 1 }}>
                    {errorMessage}
                  </Typography>
                )}
              </Box>

              <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={isLoading}
              sx={{
                py: 1.5,
                background: "linear-gradient(45deg, #00897B, #00796B)",
                fontWeight: "bold",
                color: "white", // <-- use `color` not `text`
                "&:hover": {
                  background: "linear-gradient(45deg, #00796B, #00695C)",
                },
                // Override the disabled styles:
                "&.Mui-disabled": {
                  color: "white",                // keep label white
                  background: "linear-gradient(45deg, #00897B, #00796B)", // keep same bg
                  opacity: 0.8,                  // or whatever opacity you like
                },
              }}
            >
              {isLoading ? "Processing..." : "Predict Emotion"}
            </Button>
            </form>

            {imagePreview && (
              <Box sx={{ position: "relative", mt: 3, textAlign: "center" }}>
                <Button
                  onClick={() => {
                    setImagePreview(null);
                    setSelectedFile(null);
                    setPredictionResult(null);
                    setErrorMessage("");
                    setShowActivityPrompt(false);
                    setActivityInput("");
                    setRecommendations([]);
                    fileInputRef.current.value = "";
                  }}
                  sx={{
                    position: "absolute",
                    top: "-12px",
                    right: "calc(50% - 100px)",
                    backgroundColor: "#616161",
                    color: "white",
                    minWidth: "32px",
                    minHeight: "32px",
                    borderRadius: "50%",
                    "&:hover": { backgroundColor: "#424242" },
                  }}
                >
                  &#x2715;
                </Button>
                <Box
                  component="img"
                  src={imagePreview}
                  alt="Preview"
                  sx={{
                    width: 180,
                    height: 180,
                    objectFit: "cover",
                    borderRadius: 2,
                    boxShadow: "0px 4px 10px rgba(0,0,0,0.3)",
                  }}
                />
              </Box>
            )}
          </Box>

          {/* RIGHT COLUMN: Prediction Result & Activity Prompt */}
          {showRightColumn && (
            <Box sx={{ flex: "1 1 300px", display: "flex", flexDirection: "column", gap: 2 }}>
              {predictionResult && (
                <Box sx={{ p: 2, backgroundColor: "#FFE0B2", borderRadius: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
                    Prediction Result:
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    Emotion: <strong>{predictionResult.emotion}</strong>
                  </Typography>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    Confidence Level:
                  </Typography>
                  <Box component="ul" sx={{ pl: 4, m: 0 }}>
                    {predictionResult.probabilities[0].map((prob, index) => (
                      <li key={index} style={{ marginBottom: "4px" }}>
                        <span style={{ marginRight: "8px" }}>{emotionClasses[index].emoji}</span>
                        {`${emotionClasses[index].label}: ${(prob * 100).toFixed(2)}%`}
                      </li>
                    ))}
                  </Box>
                </Box>
              )}

              {showActivityPrompt && !activitySubmitted && (
                <Box sx={{ p: 3, backgroundColor: "#C8E6C9", borderRadius: 2, position: "relative" }}>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    Your pet seems {predictionResult?.emotion.toLowerCase()}!
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    Please share what activity helped your pet feel this way.
                  </Typography>
                  <TextField
                    label="Activity"
                    variant="outlined"
                    fullWidth
                    value={activityInput}
                    onChange={(e) => setActivityInput(e.target.value)}
                    placeholder="Describe the activity..."
                    sx={{ mb: 2 }}
                  />
                  <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
                    <Button variant="text" onClick={() => {
                      setActivityInput("No specific activity");
                      handleActivitySubmit();
                    }}>
                      No specific activity
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleActivitySubmit}
                      disabled={isLoading}
                      sx={{ backgroundColor: "#388E3C", "&:hover": { backgroundColor: "#2E7D32" } }}
                    >
                      {isLoading ? "Submitting..." : "Submit Activity"}
                    </Button>
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </Box>

        {/* RECOMMENDATIONS SECTION: Full-width below columns */}
        {(isFetchingRecommendations || recommendations.length > 0) && (
          <Box
            sx={{
              p: 2,
              backgroundColor: "#e0f7fa",
              borderRadius: 2,
              mt: 2,
              position: "relative",
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
              {isFetchingRecommendations ? "Loading recommendations..." : "Recommendations"}
            </Typography>
            <IconButton
              size="small"
              onClick={() => setRecommendations([])}
              sx={{ position: "absolute", top: 8, right: 8 }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
            {!isFetchingRecommendations && recommendations.length > 0 && (
              <List dense>
                {recommendations.map((rec, idx) => (
                  <ListItem key={idx}>
                    <ListItemText primary={<ReactMarkdown>{rec}</ReactMarkdown>} />
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default EmotionPrediction;
