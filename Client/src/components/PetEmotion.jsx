import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import backgroundImage from "../assets/BgMemoryhd.jpg";

const PetEmotions = () => {
  const { petName } = useParams(); // Get petName from the URL parameters
  const [emotions, setEmotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEmotions = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/pets/emotions/${petName}`
        );
        if (response.data.success) {
          setEmotions(response.data.emotions);
        } else {
          setError(response.data.message);
        }
      } catch (err) {
        console.error("Error fetching emotions:", err);
        setError("Could not fetch emotions.");
      } finally {
        setLoading(false);
      }
    };

    if (petName) {
      fetchEmotions();
    }
  }, [petName]);

  if (loading) {
    return <p className="text-center text-gray-500">Loading emotions...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500 font-semibold">{error}</p>;
  }

  return (
    <div
      className="min-h-screen bg-fixed flex justify-center"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="p-6 max-w-4xl mx-auto bg-white bg-opacity-90 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-center mb-6 mt-14 text-orange-700">
          {`${petName.charAt(0).toUpperCase()}${petName.slice(1)}'s Emotional Trends`}
        </h2>
        {emotions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg border border-gray-200 shadow-lg">
              <thead className="bg-blue-50 text-teal-700 text-sm uppercase">
                <tr>
                  <th className="py-3 px-6 text-center border-r border-gray-200">
                    Emotion
                  </th>
                  <th className="py-3 px-6 text-center border-r border-gray-200">
                    Activity
                  </th>
                  <th className="py-3 px-6 text-center border-r border-gray-200">
                    Date
                  </th>
                  <th className="py-3 px-6 text-center">Time</th>
                </tr>
              </thead>
              <tbody>
                {emotions.map((emotion, index) => {
                  const dateObj = new Date(emotion.timestamp);
                  const date = dateObj.toLocaleDateString();
                  const time = dateObj.toLocaleTimeString();
                  return (
                    <tr
                      key={index}
                      className={`border-b ${
                        index % 2 === 0 ? "bg-blue-50" : "bg-white"
                      }`}
                    >
                      <td className="py-3 px-6 text-center border-r border-gray-200">
                        {emotion.emotion}
                      </td>
                      <td className="py-3 px-6 text-center border-r border-gray-200">
                        {emotion.activity ? emotion.activity : "N/A"}
                      </td>
                      <td className="py-3 px-6 text-center border-r border-gray-200">
                        {date}
                      </td>
                      <td className="py-3 px-6 text-center">{time}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-20 text-center text-gray-500">
            No emotions recorded for this pet.
          </p>
        )}
      </div>
    </div>
  );
};

export default PetEmotions;
