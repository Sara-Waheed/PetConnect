// FilePredictor.jsx
import React, { useState } from "react";
import axios from "axios";

const FilePredictor = () => {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState("");

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handlePredict = async () => {
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await axios.post("http://localhost:5000/api/ml/predict", formData);
      setResult(response.data.label);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handlePredict}>Predict</button>
      {result && <p>Prediction: {result}</p>}
    </div>
  );
};

export default FilePredictor;