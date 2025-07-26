import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Camera } from 'lucide-react'; 
import backgroundImage from "../assets/BgMemoryhd.jpg";
import { useParams, useNavigate, useLocation  } from "react-router-dom";
import SuccessModal from "./SuccessModal";

const MAX_PHOTOS = 4;

const AdoptionForm = () => {
  const { id } = useParams(); // Get pet ID from URL
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [error, setError] = useState('');
  const [previews, setPreviews] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const [successMessage, setSuccessMessage] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    adopterCity: '',
    dailyActivityLevel: '',
    over18: false,
    livingSituation: '',
    landlordPermission: '',
    householdSetting: '',
    homeImages: [], // Files stored here
    numberOfAdults: '',
    numberOfKids: '',
    youngestChildAge: '',
    visitingChildren: '',
    flatmates: '',
    petAllergies: '',
    otherAnimals: '',
    lifestyle: '',
    movingSoon: '',
    holidaysPlanned: '',
    ownTransport: '',
    experience: '',
  });

  // Check login status
  const checkLoginStatus = async () => {
    try {
      const response = await axios.get('http://localhost:5000/auth/profile', {
        withCredentials: true,
      });
      if (response.data.success === false && response.data.message === "User not authenticated") {
        setIsLoggedIn(false);
      } else if (response.data.success === true) {
        setIsLoggedIn(true);
        setUserRole(response.data.user.role);
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        setIsLoggedIn(false);
      } else {
        console.warn("Server unreachable or unexpected error:", error.message);
      }
    }
  };

  useEffect(() => {
    checkLoginStatus();
  }, []);

  // If logged in, fetch user data to pre-fill profile fields.
  useEffect(() => {
    if (isLoggedIn) {
      const fetchUserData = async () => {
        try {
          const response = await axios.get('http://localhost:5000/auth/user/profile', {
            withCredentials: true,
          });
          const user = response.data.user;
          setFormData((prevData) => ({
            ...prevData,
            fullName: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            dailyActivityLevel: user.dailyActivityLevel || '',
            adopterCity: user.city,
          }));
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      };
      fetchUserData();
    }
  }, [isLoggedIn]);

  // Generic change handler.
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Handle file input and generate previews.
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    // Check overall limit (max MAX_PHOTOS)
    if (formData.homeImages.length + files.length > MAX_PHOTOS) {
      setError(`You can upload a maximum of ${MAX_PHOTOS} images.`);
      return;
    }
    const newPhotos = [...formData.homeImages, ...files];
    setFormData({ ...formData, homeImages: newPhotos });
    // Revoke old preview URLs
    previews.forEach((url) => URL.revokeObjectURL(url));
    const newPreviews = [...new Set([...previews, ...files.map((file) => URL.createObjectURL(file))])];
    setPreviews(newPreviews);
    setError('');
  };

  // Remove image and update previews.
  const removeImage = (index) => {
    const updatedPhotos = formData.homeImages.filter((_, i) => i !== index);
    setFormData({ ...formData, homeImages: updatedPhotos });
    previews.forEach((url) => URL.revokeObjectURL(url));
    const updatedPreviews = updatedPhotos.map((file) => URL.createObjectURL(file));
    setPreviews(updatedPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Ensure minimum 2 photos are uploaded.
    if (formData.homeImages.length < 2) {
      setError("Please upload at least 2 images.");
      return;
    }
    try {
      setError('');

      // First validate images with Gemini
      const validationFormData = new FormData();
      formData.homeImages.forEach(file => {
        validationFormData.append('homeImages', file);
      });

      let validationResponse;
      try {
        validationResponse = await axios.post(
          'http://localhost:5000/api/validate-home-images',
          validationFormData,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );
      } catch (err) {
        if (err.response && err.response.status === 400) {
          // validation failed, show specific Gemini error message
          setError(err.response.data?.error || "Some home images are not acceptable. Please upload better ones.");
          return;
        } else {
          console.error('Image validation request failed:', err);
          setError('Something went wrong during image validation. Please try again.');
          return;
        }
      }

      if (!validationResponse.data.valid) {
        setError(validationResponse.data.error || "Invalid home images detected");
        return;
      }
      // Create a new FormData object.
      const data = new FormData();
      
      // Append text fields.
      data.append("fullName", formData.fullName);
      data.append("email", formData.email);
      data.append("phone", formData.phone);
      data.append("adopterCity", formData.adopterCity);
      data.append("dailyActivityLevel", formData.dailyActivityLevel);
      data.append("over18", formData.over18);
      data.append("livingSituation", formData.livingSituation);
      data.append("landlordPermission", formData.landlordPermission);
      data.append("householdSetting", formData.householdSetting);
      data.append("numberOfAdults", formData.numberOfAdults);
      data.append("numberOfKids", formData.numberOfKids);
      data.append("youngestChildAge", formData.youngestChildAge);
      data.append("visitingChildren", formData.visitingChildren);
      data.append("flatmates", formData.flatmates);
      data.append("petAllergies", formData.petAllergies);
      data.append("otherAnimals", formData.otherAnimals);
      data.append("lifestyle", formData.lifestyle);
      data.append("movingSoon", formData.movingSoon);
      data.append("holidaysPlanned", formData.holidaysPlanned);
      data.append("ownTransport", formData.ownTransport);
      data.append("experience", formData.experience);
  
      // Append image files
      formData.homeImages.forEach((file) => {
        data.append("homeImages", file);
      });
  
      // Send multipart/form-data request
      const response = await axios.post(`http://localhost:5000/auth/adoption-application/${id}`, data, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      setSuccessMessage('Your adoption application has been successfully submitted! After reviewing your application, the pet owner who is rehoming the pet will get in touch with you. We appreciate your interest.');
      console.log('Application saved successfully:', response.data);
      // Handle success (redirect, show a message, etc.)
    } catch (err) {
      console.error('Error saving application:', err);
      setError('Failed to submit application. Please try again.');
    }
  };

  const handleBack = () => {
    // Navigate back dynamically based on state or fallback to browser history
    if (location.state?.from) {
      navigate(location.state.from); // Navigate to the specific previous route
    } else {
      navigate(-1); // Fallback to browser history if no state is available
    }
  };

  return (
    <div
      className="min-h-screen bg-fixed bg-gray-100"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="max-w-4xl mx-auto p-6 bg-orange-200 shadow-xl rounded-lg">
        <h2 className="text-3xl font-semibold text-center text-teal-800 mt-7 mb-4">
          Pet Adoption Request
        </h2>
        <p className="mb-6 text-gray-600">
          This information is vital when enquiring about a pet. It will allow the pet's current owner to learn about the type of home you are offering and help them decide whether to consider your application further. Please note, ALL of the following sections must be completed to apply for a pet.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* YOUR DETAILS */}
          <div>
            <h3 className="text-lg font-semibold text-orange-700 mb-2">
              Your details
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block mb-1 text-gray-700">
                  Full Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  placeholder="Type here..."
                  value={formData.fullName}
                  required
                  onChange={handleChange}
                  className="mb-4 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:border-teal-500 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block mb-1 text-gray-700">
                  Email <span className="text-red-600">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="Type here..."
                  value={formData.email}
                  required
                  onChange={handleChange}
                  className="mb-4 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:border-teal-500 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block mb-1 text-gray-700">
                  Phone <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="phone"
                  placeholder="Type here..."
                  value={formData.phone}
                  required
                  onChange={handleChange}
                  className="mb-4 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:border-teal-500 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block mb-1 text-gray-700">
                  Your household's typical activity level <span className="text-red-600">*</span>
                </label>
                <select
                  name="dailyActivityLevel"
                  value={formData.dailyActivityLevel}
                  onChange={handleChange}
                  required
                  className="mb-4 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:border-teal-500 focus:ring-teal-500"
                >
                  <option value="">Please select</option>
                  <option value="Moderate comings and goings">Moderate comings and goings</option>
                  <option value="Quiet with occasional guests">Quiet with occasional guests</option>
                  <option value="Busy/ noisy">Busy/ noisy</option>
                </select>
              </div>
            </div>
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                name="over18"
                checked={formData.over18}
                onChange={handleChange}
                required
                className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
              />
              <label className="ml-2 text-gray-700">
                I am over 18 years old
              </label>
            </div>
          </div>

          <hr className="border-gray-600" />

          {/* ABOUT YOUR HOME */}
          <div>
            <h3 className="text-lg font-semibold text-orange-700 mb-2">
              About your home
            </h3>

            <label className="block mb-1 text-gray-700">
              Please describe your living/home situation <span className="text-red-600">*</span>
            </label>
            <select
              name="livingSituation"
              value={formData.livingSituation}
              onChange={handleChange}
              required
              className="mb-4 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:border-teal-500 focus:ring-teal-500"
            >
              <option value="">Please select</option>
              <option value="own">Own your home</option>
              <option value="rent">Rent your home</option>
              <option value="other">Other</option>
            </select>

            {formData.livingSituation === 'rent' && (
              <>
                <label className="block mb-1 text-gray-700">
                  Do you have permission from your landlord to have pets? <span className="text-red-600">*</span>
                </label>
                <select
                  name="landlordPermission"
                  value={formData.landlordPermission}
                  onChange={handleChange}
                  required
                  className="mb-4 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:border-teal-500 focus:ring-teal-500"
                >
                  <option value="">Please select</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                  <option value="notAsked">Haven't asked yet</option>
                </select>
              </>
            )}

            <label className="block mb-1 text-gray-700">
              Please describe your household setting <span className="text-red-600">*</span>
            </label>
            <select
              name="householdSetting"
              value={formData.householdSetting}
              onChange={handleChange}
              required
              className="mb-4 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:border-teal-500 focus:ring-teal-500"
            >
              <option value="">Please select</option>
              <option value="rural">Rural</option>
              <option value="suburban">Suburban</option>
              <option value="town">Town</option>
              <option value="city">City</option>
            </select>
          </div>

          <hr className="border-gray-600" />

          {/* IMAGES */}
          <div>
            <h3 className="text-lg font-semibold text-orange-700 mb-2">
              Images of your home <span className="text-red-600">*</span>
            </h3>
            <div className="mb-4">
              <label className="block text-gray-800 mb-1">
                You can add up to 4 images (.jpg, .png, .jpeg).
              </label>
              <p className='text-teal-700 mb-3'>
                Please add 4 photos of your home and any outside space as it helps the pet's current owner to visualize the home you are offering. (A minimum of 2 photos are required but uploading 4 is better!)
              </p>
              <div className="flex flex-wrap gap-2 mb-2">
                {previews.map((src, index) => (
                  <div
                    key={index}
                    className="relative w-32 h-32 border-2 border-orange-500 rounded-lg overflow-hidden flex items-center justify-center"
                  >
                    <img
                      src={src}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                      onClick={() => removeImage(index)}
                    >
                      ✕
                    </button>
                  </div>
                ))}

                {previews.length < MAX_PHOTOS && (
                  <label className="cursor-pointer w-32 h-32 border-2 border-dashed border-orange-500 rounded-lg flex items-center justify-center bg-gray-100">
                    <input
                      type="file"
                      name="homeImages"
                      className="hidden"
                      onChange={handleFileChange}
                      multiple
                      accept="image/*"
                    />
                    <div className="text-center text-orange-500 flex flex-col items-center">
                      <Camera size={30} />
                      <span className="text-sm mt-1.5">Upload</span>
                    </div>
                  </label>
                )}
              </div>
            </div>
          </div>

          <hr className="border-gray-600" />

          {/* WHO LIVES AT HOME */}
          <div>
            <h3 className="text-lg font-semibold text-orange-700 mb-2">
              Who lives at home?
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block mb-1 text-gray-700">
                  Number of adults <span className="text-red-600">*</span>
                </label>
                <input
                  type="number"
                  name="numberOfAdults"
                  placeholder="Type here..."
                  required
                  min='0'
                  value={formData.numberOfAdults}
                  onChange={handleChange}
                  className="mb-4 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:border-teal-500 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block mb-1 text-gray-700">
                  Number of children <span className="text-red-600">*</span>
                </label>
                <input
                  type="number"
                  name="numberOfKids"
                  placeholder="Type here..."
                  required
                  min='0'
                  value={formData.numberOfKids}
                  onChange={handleChange}
                  className="mb-4 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:border-teal-500 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block mb-1 text-gray-700">
                  Age of youngest child <span className="text-red-600">*</span>
                </label>
                <input
                  type="number"
                  name="youngestChildAge"
                  placeholder="Type here..."
                  required
                  min='1'
                  value={formData.youngestChildAge}
                  onChange={handleChange}
                  className="mb-4 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:border-teal-500 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block mb-1 text-gray-700">
                  Any visiting children? <span className="text-red-600">*</span>
                </label>
                <select
                  name="visitingChildren"
                  value={formData.visitingChildren}
                  onChange={handleChange}
                  required
                  className="mb-4 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:border-teal-500 focus:ring-teal-500"
                >
                  <option value="">Please select</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>

              <div>
                <label className="block mb-1 text-gray-700">
                  Do you have any flatmates or lodgers? <span className="text-red-600">*</span>
                </label>
                <select
                  name="flatmates"
                  value={formData.flatmates}
                  onChange={handleChange}
                  required
                  className="mb-4 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:border-teal-500 focus:ring-teal-500"
                >
                  <option value="">Please select</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>

              <div>
                <label className="block mb-1 text-gray-700">
                  Anyone in the house have any allergies to pets? <span className="text-red-600">*</span>
                </label>
                <select
                  name="petAllergies"
                  value={formData.petAllergies}
                  onChange={handleChange}
                  required
                  className="mb-4 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:border-teal-500 focus:ring-teal-500"
                >
                  <option value="">Please select</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="block mb-1 text-gray-700">
                  How many other animals do you have at your home? <span className="text-red-600">*</span>
                </label>
                <select
                  name="otherAnimals"
                  value={formData.otherAnimals}
                  onChange={handleChange}
                  required
                  className="mb-4 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:border-teal-500 focus:ring-teal-500"
                >
                  <option value="">Please select</option>
                  <option value="none">None</option>
                  <option value="one">One</option>
                  <option value="two">Two</option>
                  <option value="three">Three</option>
                </select>
              </div>
            </div>
          </div>

          <hr className="border-gray-600" />

          {/* YOUR LIFESTYLE */}
          <div>
            <h3 className="text-lg font-semibold text-orange-700 mb-2">
              Your lifestyle
            </h3>

            <label className="block mb-1 text-gray-700">
              The rehomer will want to know that you have plenty of time to care for the pet. So please tell us about your lifestyle (work pattern/time at home) <span className="text-red-600">*</span>
            </label>
            <textarea
              name="lifestyle"
              rows="2"
              placeholder="Type here..."
              required
              value={formData.lifestyle}
              onChange={handleChange}
              className="mb-4 w-full p-2 border border-gray-300 rounded-md shadow-sm focus:border-teal-500 focus:ring-teal-500"
            ></textarea>

            <label className="block mb-1 text-gray-700">
              Are you planning to move home in the next 6 months? <span className="text-red-600">*</span>
            </label>
            <select
              name="movingSoon"
              value={formData.movingSoon}
              onChange={handleChange}
              required
              className="mb-4 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:border-teal-500 focus:ring-teal-500"
            >
              <option value="">Please select</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>

            <label className="block mb-1 text-gray-700">
              Do you have any holidays planned in the next 3 months? <span className="text-red-600">*</span>
            </label>
            <select
              name="holidaysPlanned"
              value={formData.holidaysPlanned}
              onChange={handleChange}
              required
              className="mb-4 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:border-teal-500 focus:ring-teal-500"
            >
              <option value="">Please select</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>

            <label className="block mb-1 text-gray-700">
              Do you have your own transport suitable for an animal? <span className="text-red-600">*</span>
            </label>
            <select
              name="ownTransport"
              value={formData.ownTransport}
              onChange={handleChange}
              required
              className="mb-4 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:border-teal-500 focus:ring-teal-500"
            >
              <option value="">Please select</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>

          <hr className="border-gray-600" />

          {/* YOUR EXPERIENCE WITH ANIMALS */}
          <div>
            <h3 className="text-lg font-semibold text-orange-700 mb-2">
              Your experience with animals
            </h3>
            <label className="block mb-1 text-gray-700">
              Please describe your experience of any previous pet ownership and tell us about the type of home you plan to offer your new pet <span className="text-red-600">*</span>
            </label>
            <textarea
              name="experience"
              rows="2"
              placeholder="Type here..."
              required
              value={formData.experience}
              onChange={handleChange}
              className="mb-4 p-2 w-full border border-gray-300 rounded-md shadow-sm focus:border-teal-500 focus:ring-teal-500"
            ></textarea>
          </div>

          {error && <p className="text-red-600 text-center font-medium mb-2">{error}</p>}
          <div className="flex justify-center">
            <button
              type="submit"
              className="w-1/2 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-md shadow-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              Submit Application
            </button>
          </div>
        </form>
      </div>
      {successMessage && (
        <SuccessModal 
          message={successMessage} 
          onClose={() => {handleBack();setSuccessMessage("");}} 
        />
      )}
    </div>
  );
};

export default AdoptionForm;
