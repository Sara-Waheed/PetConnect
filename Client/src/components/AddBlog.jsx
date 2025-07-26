import React, { useState, useRef } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


const AddBlog = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Dog Care");
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const fileInputRef = useRef();

  // Clear preview & file on re-click
  const handleFileClick = () => {
    fileInputRef.current.value = null;
    setFile(null);
    setPreviewUrl(null);
  };

  // When user picks a file, show preview
  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
    } else {
      setFile(null);
      setPreviewUrl(null);
    }
  };

  // Helper to convert File → Base64
  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (err) => reject(err);
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      alert("Please choose an image.");
      return;
    }

    try {
      const imageBase64 = await fileToBase64(file);

      await axios.post(
        "http://localhost:5000/api/blogs",
        {
          Title: title,
          Content: content,
          Images: imageBase64,   // send base64 string
          Category: category,
        },
        { withCredentials: true }
      );

      toast.success("Blog created!");


      // reset all fields
      setTitle("");
      setContent("");
      setCategory("Dog Care");
      fileInputRef.current.value = null;
      setFile(null);
      setPreviewUrl(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to add blog");
    }
  };

  return (
    <div className="p-6">
        
      <h1 className="text-2xl font-bold mb-4">Add New Blog</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">

        {/* Title */}
        <div>
          <label className="block mb-1 font-medium">Title</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Content */}
        <div>
          <label className="block mb-1 font-medium">Content</label>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            required
            className="w-full p-2 border rounded h-32"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block mb-1 font-medium">Choose Category</label>
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            required
            className="w-full p-2 border rounded"
          >
            {[
              "Dog Care",
              "Cat Care",
              "Pet Nutrition",
              "General Pet Care",
              "Pet Health",
            ].map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Image Picker */}
        <div>
          <label className="block mb-1 font-medium">Upload Image</label>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            required
            onClick={handleFileClick}
            onChange={handleFileChange}
            className="w-full p-2 border rounded"
          />
        </div>

        {previewUrl && (
  <div className="relative mt-2 w-full max-w-md">
    <img
      src={previewUrl}
      alt="Preview"
      className="w-full max-h-64 object-contain rounded border"
    />
    <button
      type="button"
      onClick={() => {
        setPreviewUrl(null);
        setFile(null);
        fileInputRef.current.value = null;
      }}
      className="absolute top-2 right-2 bg-black bg-opacity-60 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-opacity-80"
      title="Remove image"
    >
      &times;
    </button>
  </div>
)}


        {/* Submit */}
        <button
          type="submit"
          className="px-4 py-2 bg-teal-700 text-white rounded hover:bg-teal-800"
        >
          Create Blog
        </button>
      </form>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default AddBlog;
