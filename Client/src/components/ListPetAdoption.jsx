import React, { useState, useEffect, useRef } from "react";
import { Camera, Dog, Cat, Rabbit, Save} from "lucide-react";
import axios from "axios";
import { useNavigate, useParams } from 'react-router-dom';
import backgroundImage from "../assets/BgMemoryhd.jpg";
import Papa from "papaparse";

const MAX_PHOTOS = 5;
const MIN_PHOTOS = 4;

const majorCitiesPakistan = [
  "Karachi",
  "Lahore",
  "Islamabad",
  "Rawalpindi",
  "Faisalabad",
  "Peshawar",
  "Quetta",
  "Multan",
  "Hyderabad",
  "Sialkot",
  "Gujranwala",
  "Sargodha",
  "Bahawalpur"
];

const petColorsList = [
  "Black",
  "Brown / Chocolate",
  "Blue",
  "Cream / Fawn / Yellow",
  "Gold / Apricot",
  "Other",
  "Mixed Colour",
  "Red / Ginger",
  "Silver / Grey",
  "White",
];

// List of reasons for rehoming (displayed as checkboxes)
const rehomingReasonsList = [
  "Behavioural Issues",
  "Busy Schedule",
  "Change in Family Circumstances",
  "Does not get along with another Pet",
  "Fostered",
  "Found or Abandoned",
  "Human Health Issue (e.g. allergy, sickness)",
  "Infant, young children or pregnancy",
  "Landlord permission issue",
  "Ongoing costs (e.g. lost job)",
  "Pet Medical expenses (e.g. vet procedure)",
];

// Age options (drop-down)
const petAgeOptions = [
  "Under 1 year",
  "1 year",
  "2 years",
  "3 years",
  "4 years",
  "5 years",
  "6 years",
  "7 years",
  "8 years",
  "9 years",
  "10 years",
  "11 years",
  "12 years",
  "13 years",
  "14 years",
  "15+ years",
];

// Where did you get your pet from? (radio)
const acquiredFromOptions = [
  "Breeder",
  "Friend/Family",
  "Found",
  "Fostered",
  "Charity/RescueCenter",
  "PetShop",
  "Online Seller / Marketplace",
  "Other",
];

// Step 4: Dog/Cat/Rabbit characteristics
const dogCharacteristicsList = [
  "Good with adults",
  "Good with children",
  "Good with other dogs",
  "Needs to be the ONLY PET in the home",
  "Has lived with dogs - it was fine",
  "Has lived with dogs - it didn't go well",
  "Has lived with cats - it was fine",
  "Has lived with cats - it didn't go well",
  "Is fairly relaxed",
  "Is active and lively",
  "Is only walked on the leash",
  "Can be left alone for short to medium periods",
  "Has good recall",
  "Travels well in cars",
  "Needs more exercise than most dogs",
];

const catCharacteristicsList = [
  "Good with people in general",
  "Good with children",
  "Needs to be the ONLY PET in the home",
  "Has lived with dogs - it didn't go well",
  "Has lived with dogs - it was fine",
  "Has lived with cats - it was fine",
  "Has lived with cats - it didn't go well",
  "Is an INDOOR ONLY cat",
  "Likes to have their own space",
  "Enjoys going outside / needs a garden",
  "Uses a cat flap",
  "Is a 'lap cat'",
  "Is active and playful",
  "Accepts being handled/stroked",
];

const rabbitCharacteristicsList = [
  "Lives with other rabbits",
  "Lives alone",
  "Lives outdoors",
  "Lives indoors",
  "Lives indoors and spends time outdoors",
  "Accepts being handled/stroked",
  "Does not like being handled/stroked",
  "Is friendly",
  "Is good with children",
  "Accepts being picked up and held",
  "Does not like being picked up and held",
];

// Step 4: Social issues
const dogSocialIssuesList = [
  "Reacts badly to people",
  "Reacts badly to other dogs",
  "Is aggressive",
  "Is a barker (problematic)",
  "Has separation anxiety",
  "Bites or nips",
  "Has no or limited recall",
  "Cannot be walked off the leash",
  "Pulls on the lead (problematic)",
  "Jumps up or lunges (problematic)",
  "Can demonstrate resource guarding at times",
];

const catSocialIssuesList = [
  "Not yet house trained",
  "Sprays around the house",
  "Unfriendly towards people",
  "Is aggressive",
];

// For rabbits, no social issues question is shown

const ListPetAdoption = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();
  

  // Consolidated form data
  const [formData, setFormData] = useState({
    // Step 1
    species: "",                // "Dog" | "Cat" | "Rabbit"
    reasonsForRehoming: [],     // Array of strings (checkbox)
    keepDuration: "",           // "Less than 1 month" | "1 month" | ...
    city: "",                   // major city radio

    // Step 2
    householdActivityLevel: "", // radio
    otherPets: [],              // checkboxes
    householdEnvironment: "",   // radio

    // Step 3
    name: "",                   // Pet name
    age: "",                    // e.g. "Under 1 year", "2 years"
    breed: "",                  // from modal or text
    size: "",                   // "Small" | "Medium" | "Large"
    gender: "",                 // "Male" | "Female" | "Unknown"
    spayedNeutered: "",         // "Yes" | "No" | "Unknown"
    microchipped: "",           // "Yes" | "No"
    photos: [],
    ownedDuration: "",          // "under 6 months", "6months-1 year", ...
    acquiredFrom: "",           // "Breeder", "Friend/Family", ...
    colors: [],                 // multiple color checkboxes

    // Step 4
    dogCharacteristics: [],
    catCharacteristics: [],
    rabbitCharacteristics: [],
    dogSocialIssues: [],
    catSocialIssues: [],

    // Step 5
    upToDateVaccinations: "",   // "Yes" | "No" | "Unsure"
    upToDateFleaWorm: "",       // "Yes" | "No" | "Unsure"
    upToDateDental: "",         // "Yes" | "No" | "Unsure"
    hasHealthIssues: "",        // "Yes" | "No"
    hasMedication: "",          // "Yes" | "No"
    healthDetails: "",          // text area

    // Step 6
    personalityDescription: "",
    playDescription: "",
    dietDescription: "",

    // Final (contact info, etc.)
    phone: "",
  });

  const [previews, setPreviews] = useState([]);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const initialFormDataRef = useRef(formData);
  const hasUnsavedChanges = useRef(false);
  const [breeds, setBreeds] = useState({});
  const [showBreedModal, setShowBreedModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [tempSelectedBreeds, setTempSelectedBreeds] = useState([]);
  const [acceptTerms, setAcceptTerms] = useState(false);

  useEffect(() => {
    hasUnsavedChanges.current =
      JSON.stringify(formData) !== JSON.stringify(initialFormDataRef.current);

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
  }, [formData]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // Generic change handler (for radio, text, etc.)
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setError('');
    if(name === 'species'){
      setFormData((prev) => ({ ...prev, breed: '' }));
    }
    // Special case: phone input validation
    if (name === "phone") {
      let newValue = value.replace(/[^0-9]/g, ""); // remove non-numeric
      if (newValue.length > 11) {
        setError("Phone number cannot exceed 11 digits.");
      } else if (newValue.length >= 2 && !/^03/.test(newValue)) {
        setError("Phone number must start with 03.");
      } else {
        setError("");
      }
      setFormData((prev) => ({ ...prev, phone: newValue }));
      return;
    }

    // For normal radio or text
    if (type === "checkbox") {
      // For checkboxes that produce arrays
      // name might be 'reasonsForRehoming', 'otherPets', 'colors', etc.
      if (Array.isArray(formData[name])) {
        const currentArray = formData[name];
        // If checked, add to array, else remove
        let updatedArray;
        if (checked) {
          updatedArray = [...currentArray, value];
        } else {
          updatedArray = currentArray.filter((item) => item !== value);
        }
        setFormData((prev) => ({ ...prev, [name]: updatedArray }));
      } else {
        // single boolean checkbox (unlikely in this scenario)
        setFormData((prev) => ({ ...prev, [name]: checked }));
      }
    } else {
      // normal text or radio
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // ---------------------------
  // Breed Modal
  // ---------------------------
  const openBreedModal = () => {
    // Temp store the existing selected breed(s) so we can show them checked
    setTempSelectedBreeds([...formData.breed]);
    setSearchTerm("");
    setShowBreedModal(true);
  };

  const closeBreedModal = () => {
    setShowBreedModal(false);
  };

  const handleBreedCheckbox = (breedName) => {
    // Max 3 selection
    let updated = [...tempSelectedBreeds];
    if (updated.includes(breedName)) {
      updated = updated.filter((b) => b !== breedName);
    } else {
      if (updated.length >= 3) {
        alert("You can select up to 3 breeds only.");
        return;
      }
      updated.push(breedName);
    }
    setTempSelectedBreeds(updated);
  };

  const saveBreedSelection = () => {
    // Save to formData
    setFormData((prev) => ({ ...prev, breed: tempSelectedBreeds }));
    setShowBreedModal(false);
  };

  // For Step 4: handling dog/cat/rabbit characteristics and social issues
  const handleCharacteristicsChange = (e, listName) => {
    const { value, checked } = e.target;
    setFormData((prev) => {
      const currentValues = prev[listName];
      let updatedValues;
      if (checked) {
        updatedValues = [...currentValues, value];
      } else {
        updatedValues = currentValues.filter((item) => item !== value);
      }
      return { ...prev, [listName]: updatedValues };
    });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);

    // Check overall limit (max 5)
    if (formData.photos.length + files.length > MAX_PHOTOS) {
      setError(`You can upload a maximum of ${MAX_PHOTOS} images.`);
      return;
    }

    const newPhotos = [...formData.photos, ...files];
    setFormData({ ...formData, photos: newPhotos });

    previews.forEach((url) => URL.revokeObjectURL(url));

    const newPreviews = [...previews, ...files.map((file) => URL.createObjectURL(file))];
    setPreviews(newPreviews);

  };

  const removeImage = (index) => {
    const updatedPhotos = formData.photos.filter((_, i) => i !== index);
    setFormData({ ...formData, photos: updatedPhotos });
    const updatedPreviews = updatedPhotos.map((file) => URL.createObjectURL(file));
    setPreviews(updatedPreviews);
  };

  const handleNext = () => {
    // Clear any existing error
    setError("");
  
    // Step 1 validation
    if (currentStep === 1) {
      if (!formData.species || formData.reasonsForRehoming.length === 0 || !formData.keepDuration || !formData.city) {
        setError("Please fill out all required fields (*).");
        return;
      }
    }
  
    // Step 2 validation
    if (currentStep === 2) {
      if (!formData.householdActivityLevel || formData.otherPets.length === 0 || !formData.householdEnvironment) {
        setError("Please fill out all required fields (*).");
        return;
      }
    }
  
    // Step 3 validation
    if (currentStep === 3) {
      if (
        !formData.name ||
        !formData.age ||
        !formData.breed ||
        !formData.size ||
        !formData.gender ||
        !formData.spayedNeutered ||
        !formData.microchipped ||
        formData.photos.length < MIN_PHOTOS ||
        !formData.ownedDuration ||
        !formData.acquiredFrom ||
        formData.colors.length === 0
      ) {
        setError("Please fill out all required fields (*).");
        return;
      }
    }
  
    // Step 5 validation
    if (currentStep === 5) {
      if (
        !formData.upToDateVaccinations ||
        !formData.upToDateFleaWorm ||
        !formData.upToDateDental ||
        !formData.hasHealthIssues ||
        !formData.hasMedication
      ) {
        setError("Please fill out all required fields (*).");
        return;
      }
    }
  
    // Step 6 validation
    if (currentStep === 6) {
      if (!formData.dietDescription) {
        setError("Please fill out all required fields (*).");
        return;
      }
    }
  
    // Final step (contact info) validation
    if (currentStep === 7) {
      if (!formData.phone) {
        setError("Please fill out all required fields (*).");
        return;
      }
    }
  
    // If all validations pass, move to the next step
    setCurrentStep((prev) => prev + 1);
  };

  const handlePrev = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting form with data:", formData);
  
    try {
      // Create a new FormData object to send files properly
      const submissionData = new FormData();
  
      // Append non-file fields to FormData
      Object.keys(formData).forEach((key) => {
        if (key !== "photos") {
          const value = formData[key];
          if (Array.isArray(value)) {
            value.forEach((item) => {
              submissionData.append(key, item);
            });
          } else {
            submissionData.append(key, value);
          }
        }
      });
  
      // Append photos one by one
      formData.photos.forEach((file) => {
        submissionData.append("photos", file);
      });
  
      // Debug: Log FormData content
      for (let pair of submissionData.entries()) {
        console.log(pair[0], pair[1]);
      }
  
      // Send request to backend
      const response = await axios.post(
        "http://localhost:5000/auth/addAdoptionAd",
        submissionData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );
  
      if (response.data.success) {
        console.log("Adoption ad submitted successfully:", response.data);
        setSuccessMessage(
          "Your Adoption Ad has been successfully posted on our Adoption Portal!"
        );
  
        // Reset form data
        const emptyForm = {
          species: "",
          reasonsForRehoming: [],
          keepDuration: "",
          city: "",
          householdActivityLevel: "",
          otherPets: [],
          householdEnvironment: "",
          name: "",
          age: "",
          breed: "",
          size: "",
          gender: "",
          spayedNeutered: "",
          microchipped: "",
          photos: [],
          ownedDuration: "",
          acquiredFrom: "",
          colors: [],
          dogCharacteristics: [],
          catCharacteristics: [],
          rabbitCharacteristics: [],
          dogSocialIssues: [],
          catSocialIssues: [],
          upToDateVaccinations: "",
          upToDateFleaWorm: "",
          upToDateDental: "",
          hasHealthIssues: "",
          hasMedication: "",
          healthDetails: "",
          personalityDescription: "",
          playDescription: "",
          dietDescription: "",
          phone: "",
        };
  
        setFormData(emptyForm);
        setPreviews([]);
        setCurrentStep(1);
        initialFormDataRef.current = emptyForm;
        hasUnsavedChanges.current = false;
      } else {
        console.error("Error submitting form:", response.data.message);
        alert(`Error: ${response.data.message}`);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Failed to submit adoption ad. Please try again.");
    }
  };  

  const relevantBreeds =
    formData.species && breeds[formData.species] ? breeds[formData.species] : [];
  const filteredBreeds = relevantBreeds.filter((breedName) =>
    breedName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSuccesListing= () => {
    navigate(`/find-a-pet`); 
  };

  // Render steps conditionally
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <h2 className="text-2xl font-semibold text-orange-700 mb-4">
              Step 1: Basic Pet Info
            </h2>

            {/* Species (3 squares) */}
            <div className="mb-6">
              <label className="block mb-3 text-lg font-semibold">
                What type of pet are you rehoming? <span className="text-red-600">*</span>
              </label>

              <div className="flex gap-6">
                {["Dog", "Cat", "Rabbit"].map((spec) => {
                  const selected = formData.species === spec;

                  return (
                    <label
                      key={spec}
                      className={`relative w-36 h-40 flex flex-col items-center justify-center cursor-pointer transition-all
                        border-2 rounded-lg p-4 text-gray-800 font-medium
                        ${
                          selected
                            ? "border-teal-600 bg-orange-100"
                            : "border-gray-300 bg-white hover:bg-gray-50"
                        }
                      `}
                    >
                      {/* Hidden Radio Input */}
                      <input
                        type="radio"
                        name="species"
                        value={spec}
                        id={spec}
                        checked={selected}
                        onChange={handleChange}
                        className="hidden"
                      />

                      {/* Circular Icon Background */}
                      <div className="w-16 h-16 rounded-full flex items-center justify-center">
                        {spec === "Dog" && <Dog size={40} />}
                        {spec === "Cat" && <Cat size={40} />}
                        {spec === "Rabbit" && <Rabbit size={40} />}
                      </div>

                      {/* Pet Name */}
                      <span className="mt-3 text-base">{spec}</span>

                      {/* Selection Indicator (Top-Right Corner) */}
                      <div
                        className={`absolute top-3 right-3 w-5 h-5 border-2 rounded-full flex items-center justify-center
                          ${selected ? "border-teal-600" : "border-gray-400"}
                        `}
                      >
                        {selected && <div className="w-3 h-3 bg-teal-600 rounded-full"></div>}
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Reason for Rehoming (checkboxes) */}
            <div className="mb-4">
              <label className="block mb-2 font-medium">
                Reason(s) for Rehoming (select all that apply)<span className="text-red-600"> *</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {rehomingReasonsList.map((reason) => (
                  <label
                    key={reason}
                    className="flex items-center bg-orange-100 p-2 border border-gray-300 rounded hover:border-orange-500 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      name="reasonsForRehoming"
                      value={reason}
                      checked={formData.reasonsForRehoming.includes(reason)}
                      onChange={handleChange}
                      className="form-checkbox h-5 w-5 accent-teal-600 "
                    />
                    
                    <span className="ml-2 text-gray-700">{reason}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* How long can keep? (radio) */}
            <div className="mb-4">
              <label className="block mb-2 font-medium">
                How long are you able to keep your pet while we help find a new home?<span className="text-red-600"> *</span>
              </label>
              <div className="space-y-2">
                {["Less than 1 month", "1 month", "2 months", "Until a home is found"].map(
                  (dur) => (
                    <label
                      key={dur}
                      className="flex items-center p-2 border bg-orange-100 border-gray-300 rounded hover:border-orange-500 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="keepDuration"
                        value={dur}
                        checked={formData.keepDuration === dur}
                        onChange={handleChange}
                        className="form-radio h-5 w-5 accent-teal-600"
                      />
                      <span className="ml-2 text-gray-700">{dur}</span>
                    </label>
                  )
                )}
              </div>
              <p className="text-sm text-gray-600 mt-2">To list your pet with us, you need to be able to keep your pet for a 
                minimum of one month. We cannot deal with emergency rehoming. </p>
            </div>

            {/* City (radio) */}
            <div className="mb-4">
              <label className="block mb-2 font-medium">Select City<span className="text-red-600"> *</span></label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {majorCitiesPakistan.map((ct) => (
                  <label
                    key={ct}
                    className="flex items-center bg-orange-100 p-2 border border-gray-300 rounded hover:border-orange-500 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="city"
                      value={ct}
                      checked={formData.city === ct}
                      onChange={handleChange}
                      className="form-radio h-5 w-5 accent-teal-600"
                    />
                    <span className="ml-2 text-gray-700">{ct}</span>
                  </label>
                ))}
              </div>
            </div>
          </>
        );
      case 2:
        return (
          <>
            <h2 className="text-2xl font-semibold text-orange-700 mb-4">
              Step 2: Your Household
            </h2>

            {/* Household Activity Level (radio) */}
            <div className="mb-4">
              <label className="block mb-2 font-medium">
                What best describes the household's typical activity level?<span className="text-red-600"> *</span>
              </label>
              <div className="space-y-2">
                {[
                  "Moderate comings and goings",
                  "Quiet with occasional guests",
                  "Busy / noisy",
                ].map((activity) => (
                  <label
                    key={activity}
                    className="flex items-center bg-orange-100 p-2 border border-gray-300 rounded hover:border-orange-500 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="householdActivityLevel"
                      value={activity}
                      checked={formData.householdActivityLevel === activity}
                      onChange={handleChange}
                      className="form-radio h-5 w-5 accent-teal-600"
                    />
                    <span className="ml-2 text-gray-700">{activity}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Other pets (checkboxes) */}
            <div className="mb-4">
              <label className="block mb-2 font-medium">
                Does your pet currently live with any other pets? <span className="text-red-600"> *</span>
              </label>
              <div className="space-y-2">
                {[
                  "Yes, my pet lives with dogs",
                  "Yes, my pet lives with cats",
                  "Yes, my pet lives with rabbits",
                  "Yes, my pet lives with other small furries (such as hamsters, mice etc.)",
                  "No, my pet lives as an ONLY pet in the household",
                ].map((opt) => (
                  <label
                    key={opt}
                    className="flex items-center bg-orange-100 p-2 border border-gray-300 rounded hover:border-orange-500 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      name="otherPets"
                      value={opt}
                      checked={formData.otherPets.includes(opt)}
                      onChange={handleChange}
                      className="form-checkbox h-5 w-5 accent-teal-600"
                    />
                    <span className="ml-2 text-gray-700">{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Household Environment (radio) */}
            <div className="mb-4">
              <label className="block mb-2 font-medium">
                What best describes the household environment the pet is used to?<span className="text-red-600"> *</span>
              </label>
              <div className="space-y-2">
                {["Town", "Rural", "City", "Suburban"].map((env) => (
                  <label
                    key={env}
                    className="flex items-center bg-orange-100 p-2 border border-gray-300 rounded hover:border-orange-500 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="householdEnvironment"
                      value={env}
                      checked={formData.householdEnvironment === env}
                      onChange={handleChange}
                      className="form-radio h-5 w-5 accent-teal-600"
                    />
                    <span className="ml-2 text-gray-700">{env}</span>
                  </label>
                ))}
              </div>
            </div>
          </>
        );
      case 3:
        return (
          <>
            <h2 className="text-2xl font-semibold text-orange-700 mb-4">
              Step 3: Pet Details
            </h2>

            {/* Pet name, age, breed */}
            <div className="mb-4">
              <label className="block mb-2 font-medium">Pet Name<span className="text-red-600"> *</span></label>
              <input
                type="text"
                name="name"
                placeholder="Enter pet name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-2 bg-orange-100 border rounded"
              />
            </div>

            {/* Age dropdown */}
            <div className="mb-4">
              <label className="block mb-2 font-medium">Pet Age<span className="text-red-600"> *</span></label>
              <select
                name="age"
                value={formData.age}
                onChange={handleChange}
                className="w-full p-2 bg-orange-100 border rounded"
              >
                <option value="">Select Age</option>
                {petAgeOptions.map((ageOpt) => (
                  <option key={ageOpt} value={ageOpt}>
                    {ageOpt}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block mb-2 font-medium">Breed (up to 3)<span className="text-red-600"> *</span></label>
              <button
                type="button"
                onClick={openBreedModal}
                className="px-3 py-2 w-1/3 bg-teal-600 text-white rounded hover:bg-teal-700"
                disabled={!formData.species} // only enable if species is chosen
              >
                Select Breed
              </button>
              {/* Show currently selected breeds */}
              {formData.breed.length > 0 && (
                <div className="mt-2 text-sm">
                  Selected: {formData.breed.join(", ")}
                </div>
              )}
            </div>

            {/* Size (radio) */}
            <div className="mb-4">
              <label className="block mb-2 font-medium">
                Size of Pet<span className="text-red-600"> *</span>
              </label>
              
              <div className="grid grid-cols-3 gap-2">
                {["Small", "Medium", "Large"].map((sz) => (
                  <label
                    key={sz}
                    className="flex items-center bg-orange-100 p-2.5 border border-gray-300 rounded hover:border-orange-500 cursor-pointer w-full"
                  >
                    <input
                      type="radio"
                      name="size"
                      value={sz}
                      checked={formData.size === sz}
                      onChange={handleChange}
                      className="h-5 w-5 accent-teal-600"
                    />
                    <span className="ml-2 text-gray-700">{sz}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Gender (radio) */}
            <div className="mb-4">
              <label className="block mb-2 font-medium">Sex<span className="text-red-600"> *</span></label>
              <div className="grid grid-cols-3 gap-2">
                {["Male", "Female", "Unknown"].map((g) => (
                  <label
                    key={g}
                    className="flex items-center bg-orange-100 p-2.5 border border-gray-300 rounded hover:border-orange-500 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="gender"
                      value={g}
                      checked={formData.gender === g}
                      onChange={handleChange}
                      className="form-radio h-5 w-5 accent-teal-600"
                    />
                    <span className="ml-2 text-gray-700">{g}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Neutered (radio) */}
            <div className="mb-4">
              <label className="block mb-2 font-medium">Is your pet neutered?<span className="text-red-600"> *</span></label>
              <div className="grid grid-cols-3 gap-2">
                {["Yes", "No", "Unknown"].map((val) => (
                  <label
                    key={val}
                    className="flex items-center bg-orange-100 p-2.5 border border-gray-300 rounded hover:border-orange-500 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="spayedNeutered"
                      value={val}
                      checked={formData.spayedNeutered === val}
                      onChange={handleChange}
                      className="form-radio h-5 w-5 accent-teal-600"
                    />
                    <span className="ml-2 text-gray-700">{val}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Microchipped (radio) */}
            <div className="mb-4">
              <label className="block mb-2 font-medium">Is your pet microchipped?<span className="text-red-600"> *</span></label>
              <div className="grid grid-cols-2 gap-2">
                {["Yes", "No"].map((val) => (
                  <label
                    key={val}
                    className="flex items-center bg-orange-100 p-2.5 border border-gray-300 rounded hover:border-orange-500 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="microchipped"
                      value={val}
                      checked={formData.microchipped === val}
                      onChange={handleChange}
                      className="form-radio h-5 w-5 text-orange-600"
                    />
                    <span className="ml-2 text-gray-700">{val}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Pet Photos */}
            <div className="mb-4">
              <label className="block mb-2 font-medium">Pet Photos (min 4, max 5)<span className="text-red-600"> *</span></label>
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
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                      onClick={() => removeImage(index)}
                    >
                      ✕
                    </button>
                  </div>
                ))}

                {/* Upload Box */}
                {previews.length < MAX_PHOTOS && (
                  <label className="cursor-pointer w-32 h-32 border-2 border-dashed border-orange-500 rounded-lg flex items-center justify-center bg-gray-100">
                    <input
                      type="file"
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

            {/* How long have you owned your pet? (radio) */}
            <div className="mb-4">
              <label className="block mb-2 font-medium">
                How long have you owned your pet?<span className="text-red-600"> *</span>
              </label>
              <div className="space-y-2">
                {[
                  "Under 6 months",
                  "6 months - 1 year",
                  "1 - 2 years",
                  "3 - 4 years",
                  "5+ years",
                ].map((od) => (
                  <label
                    key={od}
                    className="flex items-center bg-orange-100 p-2.5 border border-gray-300 rounded hover:border-orange-500 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="ownedDuration"
                      value={od}
                      checked={formData.ownedDuration === od}
                      onChange={handleChange}
                      className="form-radio h-5 w-5 accent-teal-600"
                    />
                    <span className="ml-2 text-gray-700">{od}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Where did you get your pet from? (radio) */}
            <div className="mb-4">
              <label className="block mb-2 font-medium">
                Where did you get your pet from? <span className="text-red-600"> *</span>
              </label>
              <div className="space-y-2">
                {acquiredFromOptions.map((opt) => (
                  <label
                    key={opt}
                    className="flex items-center bg-orange-100 p-2.5 border border-gray-300 rounded hover:border-orange-500 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="acquiredFrom"
                      value={opt}
                      checked={formData.acquiredFrom === opt}
                      onChange={handleChange}
                      className="form-radio h-5 w-5 accent-teal-600"
                    />
                    <span className="ml-2 text-gray-700">{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Pet Colors (checkboxes) */}
            <div className="mb-4">
              <label className="block mb-2 font-medium text-gray-900">
                Pet Color(s)<span className="text-red-600"> *</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-2 gap-2">
                {petColorsList.map((color) => {
                  // Adjusted color shades
                  const colorMapping = {
                    Black: "#000000",
                    "Brown / Chocolate": "#944300", // Lighter brown
                    Blue: "#456789", // Tailwind blue-500 (softer blue)
                    "Cream / Fawn / Yellow": "#F3c188", // Tailwind yellow-300
                    "Gold / Apricot": "#F3901c", // Tailwind orange-500
                    Other: "#D3D3D3",
                    "Mixed Colour": "#A9A9A9",
                    "Red / Ginger": "#e1621d", // Tailwind red-600 (less intense)
                    "Silver / Grey": "#cccccc", // Tailwind gray-500
                    White: "#FFFFFF",
                  };

                  // Check if the background is dark to change text color
                  const isDarkColor = ["Black", "Brown / Chocolate", "Blue", "Red / Ginger"].includes(color);

                  // Determine if the color is selected
                  const isSelected = formData.colors.includes(color);

                  return (
                    <label
                      key={color}
                      className="flex items-center p-2 border border-gray-300 rounded cursor-pointer transition-all"
                      style={{
                        backgroundColor: isSelected
                          ? colorMapping[color] || "#EA580C" // Orange-700 when selected
                          : "#FEF3C7", // Light orange background (orange-100)
                        color: isSelected && isDarkColor ? "#FFFFFF" : "#1F2937", // White text for selected dark colors
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = colorMapping[color] || "#EA580C";
                        e.currentTarget.style.color = isDarkColor ? "#FFFFFF" : "#1F2937"; // Change text color on hover for dark colors
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = isSelected
                          ? colorMapping[color] || "#EA580C"
                          : "#FEF3C7";
                        e.currentTarget.style.color = isSelected && isDarkColor ? "#FFFFFF" : "#1F2937"; // Revert to appropriate text color
                      }}
                    >
                      <input
                        type="checkbox"
                        name="colors"
                        value={color}
                        checked={isSelected}
                        onChange={handleChange}
                        className="form-checkbox h-5 w-5 accent-orange-700"
                      />
                      <span className="ml-2">{color}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </>
        );
      case 4:
        return (
          <>
            <h2 className="text-2xl font-semibold text-orange-700 mb-4">
              Step 4: Describe Your Pet
            </h2>

            {/* Conditional checkboxes based on species */}
            {formData.species === "Dog" && (
              <>
                <h3 className="font-bold mb-2">Dog Characteristics</h3>
                <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {dogCharacteristicsList.map((char) => (
                    <label
                      key={char}
                      className="flex items-center bg-orange-100 p-2.5 border border-gray-300 rounded hover:border-orange-500 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        value={char}
                        checked={formData.dogCharacteristics.includes(char)}
                        onChange={(e) => handleCharacteristicsChange(e, "dogCharacteristics")}
                        className="form-checkbox h-5 w-5 accent-teal-600"
                      />
                      <span className="ml-2 text-gray-700">{char}</span>
                    </label>
                  ))}
                </div>

                <h3 className="font-bold mb-2">Dog Social Issues</h3>
                <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {dogSocialIssuesList.map((issue) => (
                    <label
                      key={issue}
                      className="flex items-center bg-orange-100 p-2.5 border border-gray-300 rounded hover:border-orange-500 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        value={issue}
                        checked={formData.dogSocialIssues.includes(issue)}
                        onChange={(e) => handleCharacteristicsChange(e, "dogSocialIssues")}
                        className="form-checkbox h-5 w-5 accent-teal-600"
                      />
                      <span className="ml-2 text-gray-700">{issue}</span>
                    </label>
                  ))}
                </div>
              </>
            )}

            {formData.species === "Cat" && (
              <>
                <h3 className="font-bold mb-2">Cat Characteristics</h3>
                <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {catCharacteristicsList.map((char) => (
                    <label
                      key={char}
                      className="flex items-center bg-orange-100 p-2.5 border border-gray-300 rounded hover:border-orange-500 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        value={char}
                        checked={formData.catCharacteristics.includes(char)}
                        onChange={(e) => handleCharacteristicsChange(e, "catCharacteristics")}
                        className="form-checkbox h-5 w-5 accent-teal-600"
                      />
                      <span className="ml-2 text-gray-700">{char}</span>
                    </label>
                  ))}
                </div>

                <h3 className="font-bold mb-2">Cat Social Issues</h3>
                <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {catSocialIssuesList.map((issue) => (
                    <label
                      key={issue}
                      className="flex items-center bg-orange-100 p-2.5 border border-gray-300 rounded hover:border-orange-500 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        value={issue}
                        checked={formData.catSocialIssues.includes(issue)}
                        onChange={(e) => handleCharacteristicsChange(e, "catSocialIssues")}
                        className="form-checkbox h-5 w-5 accent-teal-600"
                      />
                      <span className="ml-2 text-gray-700">{issue}</span>
                    </label>
                  ))}
                </div>
              </>
            )}

            {formData.species === "Rabbit" && (
              <>
                <h3 className="font-bold mb-2">Rabbit Characteristics</h3>
                <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {rabbitCharacteristicsList.map((char) => (
                    <label
                      key={char}
                      className="flex items-center bg-orange-100 p-2.5 border border-gray-300 rounded hover:border-orange-500 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        value={char}
                        checked={formData.rabbitCharacteristics.includes(char)}
                        onChange={(e) =>
                          handleCharacteristicsChange(e, "rabbitCharacteristics")
                        }
                        className="form-checkbox h-5 w-5 accent-teal-600"
                      />
                      <span className="ml-2 text-gray-700">{char}</span>
                    </label>
                  ))}
                </div>
              </>
            )}

            {/* If species is not selected or something else, you can handle accordingly */}
          </>
        );
      case 5:
        return (
          <>
            <h2 className="text-2xl font-semibold text-orange-700 mb-4">Step 5: Pet Health</h2>

            {/* Up to date vaccinations */}
            <div className="mb-4">
              <label className="block mb-2 font-medium">
                Is {formData.name || "your pet"} up to date with vaccinations?<span className="text-red-600"> *</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {["Yes", "No", "Unsure"].map((val) => (
                  <label
                    key={val}
                    className="flex items-center bg-orange-100 p-2.5 border border-gray-300 rounded hover:border-orange-500 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="upToDateVaccinations"
                      value={val}
                      checked={formData.upToDateVaccinations === val}
                      onChange={handleChange}
                      className="form-radio h-5 w-5 accent-teal-600"
                    />
                    <span className="ml-2 text-gray-700">{val}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Flea treatments */}
            <div className="mb-4">
              <label className="block mb-2 font-medium">
                Is {formData.name || "your pet"} up to date with flea &amp; worming treatments?<span className="text-red-600"> *</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {["Yes", "No", "Unsure"].map((val) => (
                  <label
                    key={val}
                    className="flex items-center bg-orange-100 p-2.5 border border-gray-300 rounded hover:border-orange-500 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="upToDateFleaWorm"
                      value={val}
                      checked={formData.upToDateFleaWorm === val}
                      onChange={handleChange}
                      className="form-radio h-5 w-5 accent-teal-600"
                    />
                    <span className="ml-2 text-gray-700">{val}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Dental checks */}
            <div className="mb-4">
              <label className="block mb-2 font-medium">
                Is {formData.name || "your pet"} up to date with dental checks?<span className="text-red-600"> *</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {["Yes", "No", "Unsure"].map((val) => (
                  <label
                    key={val}
                    className="flex items-center bg-orange-100 p-2.5 border border-gray-300 rounded hover:border-orange-500 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="upToDateDental"
                      value={val}
                      checked={formData.upToDateDental === val}
                      onChange={handleChange}
                      className="form-radio h-5 w-5 accent-teal-600"
                    />
                    <span className="ml-2 text-gray-700">{val}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Health issues */}
            <div className="mb-4">
              <label className="block mb-2 font-medium">
                Does {formData.name || "your pet"} have any current health issues?<span className="text-red-600"> *</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {["Yes", "No"].map((val) => (
                  <label
                    key={val}
                    className="flex items-center bg-orange-100 p-2.5 border border-gray-300 rounded hover:border-orange-500 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="hasHealthIssues"
                      value={val}
                      checked={formData.hasHealthIssues === val}
                      onChange={handleChange}
                      className="form-radio h-5 w-5 accent-teal-600"
                    />
                    <span className="ml-2 text-gray-700">{val}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Medication */}
            <div className="mb-4">
              <label className="block mb-2 font-medium">
                Is {formData.name || "your pet"} prescribed any medication?<span className="text-red-600"> *</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {["Yes", "No"].map((val) => (
                  <label
                    key={val}
                    className="flex items-center bg-orange-100 p-2.5 border border-gray-300 rounded hover:border-orange-500 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="hasMedication"
                      value={val}
                      checked={formData.hasMedication === val}
                      onChange={handleChange}
                      className="form-radio h-5 w-5 accent-teal-600"
                    />
                    <span className="ml-2 text-gray-700">{val}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Health details */}
            <div className="mb-4">
              <label className="block mb-2 font-medium">
                Details of any health/medical conditions or prescribed medication
              </label>
              <textarea
                name="healthDetails"
                value={formData.healthDetails}
                onChange={handleChange}
                rows={3}
                className="w-full p-2 border rounded"
                placeholder="Enter any relevant health info"
              />
            </div>
          </>
        );
      case 6:
        return (
          <>
            <h2 className="text-2xl font-semibold text-orange-700 mb-4">Step 6: Your Pet Story</h2>

            {/* Personality */}
            <div className="mb-4">
              <label className="block mb-2 font-medium">
                How would you describe {formData.name || "your pet"}'s personality?
              </label>
              <textarea
                name="personalityDescription"
                value={formData.personalityDescription}
                onChange={handleChange}
                rows={3}
                className="w-full p-2 border rounded"
                placeholder="Are they friendly, loving, energetic, laid back, etc.?"
              />
            </div>

            {/* Play */}
            <div className="mb-4">
              <label className="block mb-2 font-medium">
                Does {formData.name || "your pet"} like to play? Any favorite toy or activity?
              </label>
              <textarea
                name="playDescription"
                value={formData.playDescription}
                onChange={handleChange}
                rows={3}
                className="w-full p-2 border rounded"
                placeholder="What does your pet love to do?"
              />
            </div>

            {/* Diet */}
            <div className="mb-4">
              <label className="block mb-2 font-medium">
                What foods and treats does {formData.name || "your pet"} like? Any special dietary
                needs?<span className="text-red-600"> *</span>
              </label>
              <textarea
                name="dietDescription"
                value={formData.dietDescription}
                onChange={handleChange}
                rows={3}
                className="w-full p-2 border rounded"
                placeholder="Tell us about your pet's diet, likes/dislikes"
              />
            </div>
          </>
        );
      case 7:
        return (
          <>
            <h2 className="text-2xl font-semibold text-orange-700 mb-4">
              Final Step: Contact Info
            </h2>
            {/* Phone */}
            <div className="mb-4">
              <label className="block mb-2 font-medium">
                Phone Number<span className="text-red-600"> *</span>
              </label>
              <input
                type="text"
                name="phone"
                placeholder="03001234567"
                value={formData.phone}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>
      
            {/* Terms and Conditions */}
            <div className="mb-24 mt-5">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="acceptTerms"
                  checked={acceptTerms} // Local state for terms acceptance
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="form-checkbox h-5 w-5 accent-teal-600"
                  required
                />
                <span className="ml-2 text-gray-700">
                  I accept the{" "}
                  <a
                    href="/terms-and-conditions" // Link to your terms and conditions page
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-600 hover:underline"
                  >
                    Terms and Conditions<span className="text-red-600"> *</span>
                  </a>
                </span>
              </label>
            </div>
          </>
        );
      default:
        return null;
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
      <form
        onSubmit={handleSubmit}
        className="max-w-4xl mx-auto md:p-6 bg-orange-200 rounded-2xl shadow-xl border border-gray-200 mb-8"
      >
        <div className="p-4">
          {/* Title */}
          <h1 className="text-3xl font-semibold text-teal-800 mb-6 text-center">
            List a Pet for Adoption
          </h1>

          {/* Render the current step */}
          {renderStep()}

          {/* Error message (if any) */}
          {error && currentStep !== 7 && (
            <p className="text-red-600 text-center font-medium">{error}</p>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handlePrev}
                className="bg-gray-400 w-1/3 text-white px-4 py-2 rounded hover:bg-gray-500"
              >
                Back
              </button>
            )}

            {currentStep < 7 && (
              <button
                type="button"
                onClick={handleNext}
                className="bg-orange-700 w-1/3 text-white px-4 py-2 rounded hover:bg-orange-800"
              >
                Next
              </button>
            )}

            {currentStep === 7 && (
              <button
                type="submit"
                className="bg-orange-700 w-1/3 text-white px-4 py-2 rounded hover:bg-orange-800"
              >
                Submit Adoption Listing
              </button>
            )}
          </div>
        </div>
      </form>

      {/* Success Modal */}
      {successMessage && (
        <>
          {/* Modal Backdrop */}
          <div className="fixed inset-0 bg-black opacity-20 z-40"></div>

          {/* Modal Content */}
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="relative bg-white rounded-lg shadow-xl p-6 w-80">
              <button
                onClick={() => setSuccessMessage("")}
                className="absolute top-1 right-3 text-gray-500 hover:text-gray-700 text-2xl"
              >
                &times;
              </button>
              <div className="flex flex-col items-center">
                <svg
                  className="w-12 h-12 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <h2 className="mt-4 text-xl font-bold text-green-600">Success!</h2>
                <p className="mt-2 text-gray-600 text-center">{successMessage}</p>
                <button
                  onClick={() => {setSuccessMessage(""); handleSuccessListing();}}
                  className="mt-6 px-4 py-2 w-1/2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </>
      )}
      {showBreedModal && (
        <>
          <div className="fixed inset-0 bg-black opacity-20 z-40"></div>
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="relative bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
              <button
                onClick={closeBreedModal}
                className="absolute top-1 right-3 text-gray-500 hover:text-gray-700 text-2xl"
              >
                &times;
              </button>

              <h2 className="text-xl font-bold mb-4">Select up to 3 breeds</h2>

              {/* Search */}
              <input
                type="text"
                placeholder="Search Breeds..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 border rounded mb-4"
              />

              {/* Breed checkboxes */}
              <div className="max-h-64 overflow-y-auto mb-4">
                {filteredBreeds.map((breedName) => (
                  <label
                    key={breedName}
                    className="flex items-center p-2 border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={tempSelectedBreeds.includes(breedName)}
                      onChange={() => handleBreedCheckbox(breedName)}
                      className="form-checkbox h-5 w-5 text-orange-600"
                    />
                    <span className="ml-2 text-gray-700">{breedName}</span>
                  </label>
                ))}

                {filteredBreeds.length === 0 && (
                  <p className="text-sm text-gray-500">No breeds found.</p>
                )}
              </div>

              {/* Centered Save Button with Icon */}
              <div className="flex justify-center">
                <button
                  onClick={saveBreedSelection}
                  className="flex items-center px-4 py-2 bg-gradient-to-r from-teal-500 to-teal-800 text-white rounded hover:opacity-90"
                >
                  <Save className="w-5 h-5 mr-2" /> {/* Lucide Check icon */}
                  Save Breeds
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ListPetAdoption;
