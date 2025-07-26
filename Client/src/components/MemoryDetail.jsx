import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { CircularProgress } from "@mui/material";
import { Pencil, Camera, Save } from "lucide-react";  
import backgroundImage from "../assets/BgMemoryhd.jpg";

const MemoryDetail = () => {
  const { petId, bookId, memoryId } = useParams();
  const [memory, setMemory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editField, setEditField] = useState(null);
  const [formData, setFormData] = useState({});
  const [mediaFile, setMediaFile] = useState(null);
  const navigate = useNavigate();
  const fileInputRef = useRef(null); // Ref for the file input

  useEffect(() => {
    const fetchMemory = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/memory-books/${petId}/${bookId}/memories/${memoryId}`
        );
        setMemory(response.data);
        setFormData(response.data); // Populate initial formData
      } catch (err) {
        setError(err.response?.data?.error || "Failed to fetch memory details");
      } finally {
        setLoading(false);
      }
    };

    fetchMemory();
  }, [bookId, memoryId]);

  const handleEdit = (field) => {
    setEditField(field);
    if (field === "media") {
      fileInputRef.current.click(); // Trigger file input click on edit
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMediaFile(file);
    }
  };

  const handleSave = async () => {
    try {
      const updatedData = new FormData();
      Object.keys(formData).forEach((key) => {
        updatedData.append(key, formData[key]);
      });

      if (mediaFile) {
        updatedData.append("media", mediaFile);
      }

      const response = await axios.put(
        `http://localhost:5000/api/memory-books/${petId}/${bookId}/memories/${memoryId}`,
        updatedData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setMemory(response.data);
      setFormData(response.data); // Update the local state
      setMediaFile(null); // Reset the media file state
      setEditField(null);
    } catch (err) {
      console.error(err);
      alert("Failed to update memory.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <CircularProgress color="primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  if (!memory) {
    return null;
  }

  return (
    <div className="min-h-screen bg-fixed"
            style={{
              backgroundImage: `url(${backgroundImage})`, // Adjust the path to your image
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}>
    <div className="flex items-center justify-center py-14">
      <div className="w-full md:w-1/2 bg-white px-5 pb-5 flex flex-col border border-gray-300 shadow-md rounded-lg mx-20 my-10">
        <h2 className="text-3xl font-bold text-center text-orange-700 my-3">Memory Details</h2>
        <div className="flex flex-col space-y-2 mb-5 border border-gray-300 rounded-lg text-gray-600  relative">
          {/* Media Display (Image or Video) */}
          {console.log("Memory Media Path:", memory.media)}
          {memory.mediaType?.includes("video") || memory.media?.endsWith(".mp4") || memory.media?.endsWith(".webm") || memory.media?.endsWith(".ogg") ? (
            <video
              src={mediaFile ? URL.createObjectURL(mediaFile) : `http://localhost:5000/${memory.media}`}
              className="max-h-80 max-w-full object-contain"
              controls
            />
          ) : (
            <img
              src={mediaFile ? URL.createObjectURL(mediaFile) : `http://localhost:5000/${memory.media}`}
              alt={memory.caption}
              className="max-h-80 max-w-full object-contain"
            />
          )}

          {/* Hidden file input for uploading new media */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Edit and Save Buttons */}
          <div className="absolute top-4 right-4 flex space-x-2">
            {editField === "media" ? (
              <button
                className="bg-gradient-to-r from-orange-400 to-orange-700 text-white hover:from-orange-500 hover:to-orange-800 transition duration-200 p-2 rounded-full shadow"
                onClick={handleSave}
                style={{ transform: "translate(-1px, -10px)" }}
                title="Save"  // Tooltip text
              >
                <Save />
              </button>


            ) : (
              <button
                className="bg-gradient-to-r from-orange-400 to-orange-700 text-white hover:from-orange-500 hover:to-orange-800 transition duration-200 p-2 rounded-full shadow"
                onClick={() => handleEdit("media")}
                style={{ transform: "translate(-1px, -10px)" }}
                title="Edit Media"
              >
                <Camera />
              </button>
            )}
          </div>
        </div>

        {/* Caption Section with Border */}

        {/* Caption Section with Label */}
        <label className="pl-1 block text-lg font-medium text-gray-700 mb-2">Caption</label>
        <div className="flex items-center justify-between mb-5 border border-gray-300 shadow-md rounded-lg text-gray-600 p-4">
          {editField === "caption" ? (
            <div className="w-full flex flex-col space-y-2">
              <textarea
                value={formData.caption}
                onChange={(e) => {
                  const caption = e.target.value;
                  if (caption.length <= 200) {
                    setFormData({ ...formData, caption });
                  }
                }}
                rows="5"
                className="w-full text-lg font-medium border border-gray-300 rounded p-2"
                placeholder="Enter caption (max 200 characters)"
              />
              <span className="text-sm text-gray-600">
                {formData.caption.length}/200 characters
              </span>
            </div>
          ) : (
            <p className="text-md text-black break-words overflow-hidden text-ellipsis">
              {memory.caption}
            </p>
          )}
          <button
            className="self-end text-orange-700 hover:text-orange-600"
            onClick={() =>
              editField === "caption" ? handleSave() : handleEdit("caption")
            }
            title={editField === "caption" ? "Save" : "Edit"}  // Dynamic tooltip based on the icon
          >
            {editField === "caption" ? <Save /> : <Pencil />}
          </button>

        </div>

        {/* Date Section with Label */}
        <label className="pl-1 block text-lg font-medium text-gray-700 mb-2">Date of Memory</label>
        <div className="flex items-center justify-between border border-gray-300 shadow-md rounded-lg text-gray-600 p-4 mb-4">
          {editField === "date" ? (
            <input
              type="date"
              value={new Date(formData.date).toISOString().split("T")[0]}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              className="border border-gray-300 rounded p-2"
            />
          ) : (
            <p className="text-sm text-black">
              {new Date(memory.date).toLocaleDateString()}
            </p>
          )}
          <button
            className="text-orange-700 hover:text-orange-600"
            onClick={() =>
              editField === "date" ? handleSave() : handleEdit("date")
            }
            title={editField === "caption" ? "Save" : "Edit"}
          >
            {editField === "date" ? <Save /> : <Pencil />}
          </button>
        </div>


        {/* Back to Memories Button */}

        <button
          className="w-full p-2 mt-4 bg-gradient-to-r from-teal-600 to-teal-800 hover:from-teal-500 hover:to-teal-700 text-white font-semibold rounded-lg hover:bg-gray-900 transition duration-200"
          onClick={() => navigate(-1)}
        >
          Back to Memories
        </button>

      </div>
    </div>
    </div>
  );

};

export default MemoryDetail;