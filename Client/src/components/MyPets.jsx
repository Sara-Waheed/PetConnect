import React, { useState, useRef, useEffect } from "react";
import { Trash2, Pencil, Camera, Save } from "lucide-react";
import { useNavigate, useParams } from 'react-router-dom';
import axios from "axios";
import Papa from "papaparse";
import backgroundImage from "../assets/BgMemoryhd.jpg";

const MyPets = () => {
  const [pets, setPets] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [petData, setPetData] = useState({
    name: "",
    petType: "",
    age: "",
    gender: "",
    size: "",
    breed: "",
    
  });
  const [file, setFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("pets");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [petToDelete, setPetToDelete] = useState(null);
  const [selectedPet, setSelectedPet] = useState(null);
  const [isEditing, setIsEditing] = useState(false); // To toggle editing mode
  const [updatedPet, setUpdatedPet] = useState({});
  const [breeds, setBreeds] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
  
  const { petId } = useParams();

  const navigate = useNavigate();

  // Fetch pets on component mount
  useEffect(() => {
    const fetchPets = async () => {
      try {
        const response = await axios.get("http://localhost:5000/auth/get-user-pets", {
          withCredentials: true,
        });
    
        if (response.data.success) {
          const petsData = response.data.pets;
          setPets(petsData);
    
          if (petsData.length === 0) {
            setPets([]);
          }
        }
      } catch (error) {
        console.error("Error fetching pets:", error);
      }
    };
    
    fetchPets();
    if (selectedPet) {
      setUpdatedPet({
        name: selectedPet.name || "",
        petType: selectedPet.petType || "",
        age: selectedPet.age || "",
        breed: selectedPet.breed || "",
        gender: selectedPet.gender || "",
        size: selectedPet.size || "",
      });
    }
    fetch("/breeds.csv")
      .then((response) => response.text())
      .then((csvText) => {
        Papa.parse(csvText, {
          header: true, // First row contains pet types
          skipEmptyLines: true,
          complete: (result) => {
            // Transform rows into a usable breeds object
            const parsedBreeds = {};
            result.data.forEach((row) => {
              for (const [PetType, breed] of Object.entries(row)) {
                if (!parsedBreeds[PetType]) {
                  parsedBreeds[PetType] = [];
                }
                if (breed) parsedBreeds[PetType].push(breed);
              }
            });
            setBreeds(parsedBreeds);
          },
        });
      })
      .catch((error) => console.error("Error loading CSV:", error));
  }, [selectedPet]);

  useEffect(() => {
    if (petId) {
      const pet = pets.find((pet) => pet._id === petId); // Find the pet by ID
      setSelectedPet(pet);
    } else {
      setSelectedPet(null);
    }
  }, [petId, pets]);

  const handleInputChange = (e) => {
    setErrorMessage('');
    const { name, value } = e.target;
    setPetData({
      ...petData,
      [name]: value,
    });
    if (name === 'age') {
      const ageValue = parseFloat(value);
      if (ageValue <= 0 && value !== '') {
        setErrorMessage('Age must be greater than zero');
      } else if (isNaN(ageValue)) {
        setErrorMessage('Please enter a valid number');
      } else {
        setErrorMessage('');
      }
    }
  };

  const handlePetTypeChange = (e) => {
    const { name, value } = e.target;
    setPetData((prev) => ({
      ...prev,
      [name]: value,
      breed: "",
      customPetType: value === "Other" ? "" : undefined, 
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0]; // Get the file from the input
    if (file) {
      // Create a preview URL for the image
      const fileReader = new FileReader();
      fileReader.onloadend = () => {
        setImagePreview(fileReader.result); // Set the image preview
        setFile(file); // Set the file state
        setErrorMessage('');
      };
      fileReader.readAsDataURL(file); // Start reading the file
    }
  };

  const handleMemoryButtonClick = (petId) => {
    navigate(`/memory-books/${petId}`); // Send the petId as part of the URL
  };

  const handleEmotionTrendsButtonClick = (petName) => {
    navigate(`/pet/${petName}/emotions`); // Send the petId as part of the URL
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (petData.name.trim() === "") {
      console.warn("Pet name is empty. Form not submitted.");
      return;
    }

    const formData = new FormData();
    formData.append("name", petData.name);
    formData.append("petType", petData.petType);
    formData.append("breed", petData.breed);
    formData.append("age", petData.age);
    formData.append("gender", petData.gender);
    formData.append("size", petData.size);
    if (!file){
      setErrorMessage('Please Upload Pet Image');
      return;
    } else{
      if (file) formData.append("photo", file);
    }

    try {
      setLoading(true);
      const response = await axios.post("http://localhost:5000/auth/create-pet",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      if (response.status === 201) {
        const savedPet = response.data.pet;
        setPets((prevPets) => [...prevPets, savedPet]);
        setPetData({
          name: "",
          petType: "",
          breed: "",
          age: "",
          gender: "",
          size: "",
        });
        setFile(null);
        setImagePreview("");
        setContent("pets");
      }
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || 'An error occurred. Please try again.'
      );
      return;
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    const formData = new FormData();
    formData.append("name", updatedPet.name);
    formData.append("petType", updatedPet.petType);
    formData.append("breed", updatedPet.breed);
    formData.append("age", updatedPet.age);
    formData.append("gender", updatedPet.gender);
    formData.append("size", updatedPet.size);
    if (file) formData.append("photo", file); // Include photo if provided
  
    try {
      const response = await axios.put(
        `http://localhost:5000/auth/update-pet/${selectedPet._id}`, // Use the pet's ID
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true, // Ensure cookies/session are included
        }
      );
  
      if (response.status === 201) {
        const updatedPetData = response.data.pet; // Get updated pet data from the response
  
        // Update the pets array with the updated pet
        setPets((prevPets) =>
          prevPets.map((pet) =>
            pet._id === selectedPet._id ? updatedPetData : pet
          )
        );
  
        // Update selected pet state with the latest data
        setSelectedPet(updatedPetData);
        setIsEditing(false);
        setErrorMessage('');
        setFile(null);
      }
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || 'An error occurred. Please try again.'
      );
      return;
    }
  };

  const handleDeletePet = async () => {
    try {
      const response = await axios.delete(`http://localhost:5000/auth/pets/${petToDelete._id}`, {
        withCredentials: true,
      });

      if (response.data.success) {
        setPets((prevPets) => prevPets.filter(pet => pet._id !== petToDelete._id));
        setShowDeleteConfirm(false);  // Close confirmation dialog
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error('Error deleting pet:', error);
      alert('Failed to delete pet profile');
    }
  };

  const renderContent = () => (
    <div className="relative flex justify-center items-start mt-2">
      <div className="w-full max-w-3xl sm:min-w-max p-2 border border-x-2 border-y-2 shadow-md shadow-gray-400 h-auto bg-white rounded-lg">
        <>
          {content === "pets" && !selectedPet && (
            <>
              <p className="text-2xl font-semibold mb-6 text-left text-orange-700">
                My Pets
              </p>
              {pets.length > 0 ? (
                pets.map((pet, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center border mb-6 p-2 bg-slate-200 rounded-lg cursor-pointer hover:bg-slate-300 transition-colors duration-200"
                    onClick={() => navigate(`/myPets/${pet._id}`)} // Set the selected pet
                  >
                    <div className=" flex items-center">
                      {pet.photo && (
                        <img
                          src={pet.photo}
                          alt={`${pet.name}`}
                          className="w-20 h-20 rounded-lg border mr-4"
                        />
                      )}
                      <span className="text-lg text-orange-700">{pet.name}</span>
                    </div>
                    <button
                      className="text-red-600 pr-2"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent click event propagation
                        setPetToDelete(pet); // Set pet to delete
                        setShowDeleteConfirm(true); // Show confirmation dialog
                      }}
                    >
                      <Trash2 />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-gray-600 text-md text-left">
                  No pets added yet.
                </p>
              )}
              <div className="flex justify-end my-8 mr-3">
                <button
                  className="sm:w-1/3 px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-700 hover:from-teal-500 hover:to-teal-600 text-white font-semibold rounded-3xl shadow-md transition-colors duration-200"
                  onClick={() => setContent("addPet")}
                >
                  Create Pet Profile
                </button>
              </div>
            </>
          )}

          {selectedPet && (
            <div className="bg-white p-6 md:p-8 rounded-lg max-w-3xl mx-auto relative">
              <div className="flex flex-col">
                {/* Memory Book Button */}
                <div className="absolute top-2 md:top-4 space-y-3 md:space-y-0 space-x-4 right-4 z-10">
                  <button
                    onClick={() => handleMemoryButtonClick(selectedPet._id)}
                    className="px-6 py-2 font-semibold bg-gradient-to-r from-orange-400 to-orange-700 text-white rounded-lg hover:from-orange-500 hover:to-orange-800 transition duration-200 shadow-md"
                  >
                    {`${selectedPet.name.charAt(0).toUpperCase()}${selectedPet.name.slice(1)}'s Memory Books`}
                  </button>
                  <button
                    onClick={() => handleEmotionTrendsButtonClick(selectedPet.name)}
                    className="px-6 py-2 font-semibold bg-gradient-to-r from-orange-400 to-orange-700 text-white rounded-lg hover:from-orange-500 hover:to-orange-800 transition duration-200 shadow-md"
                  >
                    {`${selectedPet.name.charAt(0).toUpperCase()}${selectedPet.name.slice(1)}'s Emotional Trends`}
                  </button>
                  
                </div>
                
                {/* Main Content */}
                <div className="flex flex-row justify-between items-center space-y-6 sm:space-y-0 space-x-4 sm:space-x-6 md:mt-10 mt-24"> {/* Add mt-20 to create space */}
                  {/* Pet Photo */}
                  <div className="relative mr-4 sm:mr-8">
                    <div className="w-28 h-28 md:w-36 md:h-36 rounded-full border overflow-hidden flex items-center justify-center bg-gray-100">
                      {updatedPet.photo || selectedPet.photo ? (
                        <img
                          src={updatedPet.photo || selectedPet.photo}
                          alt={`${updatedPet.name || selectedPet.name}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-gray-400">No Photo</span>
                      )}
                    </div>
                    <div className="absolute bottom-1 right-1">
                      <label
                        htmlFor="change-photo"
                        className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center text-white cursor-pointer shadow-md hover:bg-teal-600 transition duration-200"
                      >
                        <Camera size={16} />
                      </label>
                      <input
                        type="file"
                        id="change-photo"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setFile(file);
                            const reader = new FileReader();
                            reader.onload = () => {
                              setUpdatedPet({ ...updatedPet, photo: reader.result });
                            };
                            reader.readAsDataURL(file);
                            setIsEditing(true);
                          }
                        }}
                      />
                    </div>
                  </div>

                  {/* Pet Name and Type */}
                  <div className="flex-1">
                    {/* Name Section */}
                    <div className="flex flex-row items-center space-x-10">
                      <h3 className="text-xl md:text-3xl font-bold text-teal-700">
                        {isEditing ? (
                          <input
                            type="text"
                            value={updatedPet.name}
                            onChange={(e) => {
                              setUpdatedPet({ ...updatedPet, name: e.target.value })
                              setErrorMessage('');
                            }}
                            className="border border-gray-300 rounded-md pl-2 text-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 w-full sm:w-60"
                          />
                        ) : (
                          selectedPet.name || updatedPet.name
                        )}
                      </h3>
                      <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="text-orange-700"
                      >
                        <Pencil className="w-5 h-5 md:w-6 md:h-6" />
                      </button>
                    </div>

                    {/* Styled Pet Type */}
                    <div className="mt-2 flex flex-wrap items-center w-full sm:w-auto border border-gray-300 rounded-md p-1 bg-slate-200 shadow-sm">
                      <span className="inline-flex items-center w-full text-gray-600 md:px-4 py-1 font-semibold">
                        {`Pet: ${selectedPet.petType || "N/A"}`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pet Details */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                {[{ label: "Age", value: "age", type: "number" },
                  { label: "Breed", value: "breed", type: "select", options: breeds[selectedPet.petType] || [] },
                  { label: "Gender", value: "gender", type: "select", options: ["Male", "Female"] },
                  { label: "Size", value: "size", type: "select", options: ["Small", "Medium", "Large"] },
                ].map(({ label, value, type, options }) => (
                  <div key={value} className="flex flex-col">
                    <label className="font-medium text-gray-600">{label}</label>
                    {isEditing ? (
                      type === "select" ? (
                        <select
                          value={updatedPet[value]}
                          onChange={(e) =>
                            setUpdatedPet({ ...updatedPet, [value]: e.target.value })
                          }
                          className="border border-gray-300 bg-slate-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-teal-500 w-full"
                        >
                          <option value="" disabled>
                            Select {label.toLowerCase()}
                          </option>
                          {options.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={type}
                          value={updatedPet[value]}
                          onChange={(e) => {
                            const newValue = parseFloat(e.target.value); 

                            if (newValue <= 0) {
                              setErrorMessage('Age must be greater than zero.');
                            } else {
                              setErrorMessage('');
                            }
                            setUpdatedPet({ ...updatedPet, [value]: e.target.value });
                          }}
                          className="border border-gray-300 bg-slate-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-teal-500 w-full"
                        />

                      )
                    ) : (
                      <div className="border border-gray-300 bg-slate-300 rounded-md p-2">
                        {selectedPet[value] || "N/A"}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {errorMessage && (
                <p className="text-red-500 text-center mt-3">{errorMessage}</p>
              )}

              {/* Action Buttons */}
              <div className="mt-8 flex justify-end space-x-4">
                {isEditing && (
                  <>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setUpdatedPet(selectedPet);
                        setErrorMessage('');
                      }}
                      className="px-6 py-2 bg-gray-300 text-gray-800 font-semibold rounded-lg hover:bg-gray-400 transition duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSaveChanges()}
                      className="px-6 py-2 font-semibold bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition duration-200"
                    >
                      Save Changes
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </>
        {content === "addPet" && (
          <>
            <p className="text-2xl font-semibold md:mb-6 text-left text-orange-700">
              Add a Pet
            </p>
            <form onSubmit={handleSubmit} className="max-w-xl mx-auto">
              <div className="flex flex-col-reverse md:flex-row md:justify-between items-center md:items-start">
                {/* Form Fields */}
                <div className="w-full md:w-4/5 md:mr-10">
                  {/* Pet Name */}
                  <label className="block text-gray-500 font-medium">Pet Name</label>
                  <input
                    type="text"
                    name="name"
                    value={petData.name}
                    onChange={handleInputChange}
                    placeholder="Enter pet name"
                    className="w-full p-2.5 mb-4 border border-gray-300 rounded-lg"
                    required
                  />
                  
                  {/* Pet Type */}
                  <label className="block text-gray-500 font-medium">Pet Type</label>
                  <select
                    name="petType"
                    value={petData.petType}
                    onChange={handlePetTypeChange}
                    className="w-full p-2.5 mb-4 border border-gray-300 rounded-lg text-gray-600"
                    required
                  >
                    <option value="" disabled>Select your pet</option>
                    <option value="Dog">Dog</option>
                    <option value="Cat">Cat</option>
                    <option value="Rabbit">Rabbit</option>
                    <option value="Parrot">Parrot</option>
                    <option value="Other">Other</option>
                  </select>

                  {/* Breed Selection */}
                  {petData.petType && petData.petType !== "Other" && (
                    <>
                      <label className="block text-gray-500 font-medium">Breed</label>
                      <select
                        name="breed"
                        value={petData.breed}
                        onChange={handleInputChange}
                        className="w-full p-2.5 mb-4 border border-gray-300 rounded-lg text-gray-600"
                        required
                      >
                        <option value="" disabled>Select breed</option>
                        {breeds[petData.petType]?.map((breed, index) => (
                          <option key={index} value={breed}>{breed}</option>
                        ))}
                      </select>
                    </>
                  )}

                  {petData.petType === "Other" && (
                    <>
                      <label className="block text-gray-500 font-medium">Specify Pet Type</label>
                      <input
                        type="text"
                        name="customPetType"
                        value={petData.customPetType || ""}
                        onChange={handleInputChange}
                        placeholder="Specify your pet type"
                        className="w-full p-2.5 mb-4 border border-gray-300 rounded-lg text-gray-600"
                        required
                      />
                      <label className="block text-gray-500 font-medium">Breed</label>
                      <input
                        type="text"
                        name="breed"
                        value={petData.breed}
                        onChange={handleInputChange}
                        placeholder="Enter pet breed"
                        className="w-full p-2.5 mb-4 border border-gray-300 rounded-lg text-gray-600"
                      />
                    </>
                  )}

                  {/* Pet Age */}
                  <label className="block text-gray-500 font-medium">Pet Age</label>
                  <input
                    type="number"
                    name="age"
                    value={petData.age}
                    onChange={handleInputChange}
                    placeholder="Enter pet age"
                    className="w-full p-2.5 mb-4 border border-gray-300 rounded-lg"
                    required
                  />

                  {/* Gender */}
                  <div className="flex items-center mb-4 text-gray-700">
                    <p className="text-gray-500 font-medium mr-4">Gender:</p>
                    {["Male", "Female"].map((gender) => (
                      <label key={gender} className="mr-4 flex items-center">
                        <input
                          type="radio"
                          name="gender"
                          value={gender}
                          checked={petData.gender === gender}
                          onChange={handleInputChange}
                          className="mr-2"
                          required={gender === "Male"} // add required to only one
                        />
                        {gender}
                      </label>
                    ))}
                  </div>

                  {/* Pet Size */}
                  <div className="flex items-center mb-4 text-gray-700">
                    <p className="text-gray-500 font-medium mr-4">Pet size:</p>
                    {["Small", "Medium", "Large"].map((size) => (
                      <label key={size} className="mr-4 flex items-center">
                        <input
                          type="radio"
                          name="size"
                          value={size}
                          checked={petData.size === size}
                          onChange={handleInputChange}
                          className="mr-2"
                          required={size === "Small"} // only one input needs 'required'
                        />
                        {size}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Pet Picture */}
                <div className="relative w-32 h-32 md:w-40 md:h-36 rounded-full border flex items-center justify-center bg-gray-300 mb-6 md:mb-0">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-full" 
                    />
                  ) : (
                    <span className="text-gray-500 text-sm flex flex-col justify-center items-center">
                      <span className="text-xs">Upload Picture</span>
                    </span>
                  )}

                  <div className="absolute bottom-1 right-1 md:bottom-2 md:right-2">
                    <label
                      htmlFor="photo"
                      className="w-9 h-9 rounded-full bg-teal-500 flex items-center justify-center text-neutral-800 cursor-pointer shadow-md hover:bg-teal-600 transition duration-200"
                    >
                      <Camera size={18} />
                    </label>
                    <input
                      id="photo"
                      type="file"
                      name="photo"
                      className="hidden"
                      onChange={handleFileChange}
                      accept="image/*"
                    />
                  </div>
                </div>
              </div>
              {errorMessage && (
                <p className="text-red-500 text-center mb-2">{errorMessage}</p>
              )}

              {/* Submit Button */}
              <div className="flex justify-center">
                <button
                  type="submit"
                  className="p-2 my-2 w-1/2 justify-center text-white font-medium bg-gradient-to-r from-teal-400 to-teal-700 hover:from-teal-300 hover:to-teal-600 rounded"
                >
                  Save Pet
                </button>
              </div>
            </form>
          </>
        )}
      </div>
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-xl px-2 py-3 md:p-6 max-w-sm md:max-w-md w-full">
            <h3 className="text-xl md:text-2xl font-semibold text-red-600 mb-4 text-center">
              Confirm Deletion
            </h3>
            <p className="text-gray-700 text-center mb-6">
              Are you sure you want to delete this pet? This action is
              <span className="font-semibold text-red-500"> irreversible </span>
              and will delete all data associated with the pet.
            </p>
            <div className="flex justify-around items-center">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-6 py-3 bg-gray-300 text-gray-700 font-medium rounded-lg shadow-md hover:bg-gray-400 transition duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePet}
                className="px-6 py-3 bg-red-600 text-white font-medium rounded-lg shadow-md hover:bg-red-700 transition duration-200"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );

  return (
    <div className="min-h-screen bg-fixed"
    style={{
      backgroundImage: `url(${backgroundImage})`, // Adjust the path to your image
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    }}>
     <div className="relative flex justify-center items-start" >
      <div className="w-full max-w-3xl sm:min-w-max p-3 md:p-10 bg-white">
        {/* Breadcrumbs */}
        <nav>
          <ol className="list-reset flex font-semibold">
            <li>
              <a
                href="#"
                className="text-teal-600 hover:text-teal-700 hover:underline"
                onClick={() => {
                  navigate(`/myPets`);
                  setContent("pets");
                  setIsEditing(false);
                  setSelectedPet(null); // Reset selected pet when navigating back to My Pets
                  setPetData({
                    name: "",
                    petType: "",
                    breed: "",
                    age: "",
                    gender: "",
                    size: "",
                  });
                  setFile(null);
                  setImagePreview("");
                }}
              >
                My Pets
              </a>
            </li>
            {content === "addPet" && (
              <>
                <li className="mx-2">/</li>
                <li>
                  <a
                    href="#"
                    className="text-teal-600 hover:text-teal-700 hover:underline"
                    onClick={() => setContent("addPet")}
                  >
                    Add Pet
                  </a>
                </li>
              </>
            )}
            {selectedPet && (
              <>
                <li className="mx-2">/</li>
                <li>
                  <span className="text-gray-700">{selectedPet.name}</span>
                </li>
              </>
            )}
          </ol>
        </nav>

        {/* Main Content */}
        {renderContent()}
      </div>
    </div>
    </div>
  );
  
};

export default MyPets;
