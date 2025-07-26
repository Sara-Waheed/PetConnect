import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Papa from 'papaparse';
import SuccessModal from "./SuccessModal";
import { Eye, EyeOff } from 'lucide-react';
import { useNavbar } from './NavbarContext';
import isEqual from "lodash.isequal";


// Mapping for Existing Pet options based on pet type
const existingPetOptions = ['None', 'Cat', 'Dog', 'Rabbit', 'Mix of Above', 'Other'];

const UserProfile = () => {
  const { handleShowComponent, userRole } = useNavbar();
  const [showPassword, setShowPassword] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDetailedProfile, setShowDetailedProfile] = useState(false);
  
  // State to hold breed options loaded from CSV.
  // This mapping will have keys: cat, dog, parrot, rabbit, other.
  const [breedOptions, setBreedOptions] = useState({
    cat: [],
    dog: [],
    parrot: [],
    rabbit: [],
    other: [] // for "other", we keep it empty
  });
  
  // State for controlling the breed dropdown visibility.
  const [isBreedDropdownOpen, setIsBreedDropdownOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Updated formData – budget removed and new fields added.
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    phone: '',
    city: '',
    password: '',
    confirmPassword: '',
    // Detailed fields
    housingType: '',
    spaceAvailable: '',
    existingPet: '',
    petFriendly: false,
    accessOutdoor: false,
    // Pet type and related details
    preferredPetType: '', // cat, dog, parrot, rabbit, other
    energyLevelPreference: '',
    highMaintenance: false,
    dailyActivityLevel: '',
    securityNeeds: false,
    // Additional info
    petOwner: 'SELF',           // SELF or FAMILY
    kidsAtHome: 'NO',           // NO or YES
    kidsAge: '',                // YOUNGER, OLDER, BOTH (if kidsAtHome is YES)
    petOwnershipType: 'FIRST_TIME', // FIRST_TIME, PREVIOUS, CURRENT
    // Ideal pet details
    idealAgePreference: 'NONE',      // NONE, BABY, YOUNG, ADULT, SENIOR
    idealGenderPreference: 'NONE',   // NONE, FEMALE, MALE
    idealSizePreference: 'NONE',     // NONE, SMALL, MEDIUM, LARGE, EXTRA_LARGE
    idealCoatLength: 'NONE',         // NONE, SHORT, MEDIUM, LONG (only for cat/dog)
    idealNeeds: [],                  // e.g., ALLERGY_FRIENDLY, LITTER_BOX_TRAINED
    idealSpecialNeedsReceptiveness: 'YES', // YES or NO
    idealBreed: []                   // multi-select based on CSV-loaded data
  });

  const [initialDetailData, setInitialDetailData] = useState(null);
  const [showWarning, setShowWarning] = useState(false);

  // Load breed options from CSV using PapaParse.
  useEffect(() => {
    fetch('/breeds.csv')
      .then(response => response.text())
      .then(csvText => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (result) => {
            const mapping = {};
            // Iterate over every row and each column (like your working component)
            result.data.forEach(row => {
              for (const [PetType, breed] of Object.entries(row)) {
                const normalizedPetType = PetType.toLowerCase();
                if (!mapping[normalizedPetType]) {
                  mapping[normalizedPetType] = [];
                }
                if (breed) {
                  mapping[normalizedPetType].push(breed);
                }
              }
            });
            // Ensure required pet types exist and prepend "None"
            ['cat', 'dog', 'parrot', 'rabbit', 'other'].forEach(pet => {
              if (!mapping[pet]) mapping[pet] = [];
              mapping[pet] = ['None', ...mapping[pet]];
            });
            setBreedOptions(mapping);
          }
        });
      })
      .catch(err => {
        console.error("Error loading breed CSV:", err);
      });
  }, []);

  // When pet type "other" is selected, disable breed selection.
  useEffect(() => {
    if (formData.preferredPetType === 'other') {
      setFormData(prev => ({ ...prev, idealBreed: ['None'] }));
    }
  }, [formData.preferredPetType]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

useEffect(() => {
  if (!userData) return;

  // 1) Build the formData object based on userData
  const initialForm = {
    email:            userData.email            || '',
    name:             userData.name             || '',
    phone:            userData.phone            || '',
    city:             userData.city             || '',
    password:         '',      // always start blank
    confirmPassword:  '',      // always start blank

    // Detailed profile fields:
    housingType:                       userData.housingType                       || '',
    spaceAvailable:                    userData.spaceAvailable                    || '',
    existingPet:                       userData.existingPet                       || '',
    petFriendly:                       userData.petFriendly                       || false,
    accessOutdoor:                     userData.accessOutdoor                     || false,
    preferredPetType:                  userData.preferredPetType                  || '',
    energyLevelPreference:             userData.energyLevelPreference             || '',
    highMaintenance:                   userData.highMaintenance                   || false,
    dailyActivityLevel:                userData.dailyActivityLevel                || '',
    securityNeeds:                     userData.securityNeeds                     || false,
    petOwner:                          userData.petOwner                          || 'SELF',
    kidsAtHome:                        userData.kidsAtHome                        || 'NO',
    kidsAge:                           userData.kidsAge                           || '',
    petOwnershipType:                  userData.petOwnershipType                  || 'FIRST_TIME',
    idealAgePreference:                userData.idealAgePreference                || 'NONE',
    idealGenderPreference:             userData.idealGenderPreference             || 'NONE',
    idealSizePreference:               userData.idealSizePreference               || 'NONE',
    idealCoatLength:                   userData.idealCoatLength                   || 'NONE',
    idealNeeds:                        userData.idealNeeds                        || [],
    idealSpecialNeedsReceptiveness:    userData.idealSpecialNeedsReceptiveness    || 'YES',
    idealBreed:                        userData.idealBreed                        || []
  };

  // 2) Populate formData state
  setFormData(initialForm);

  // 3) Take a deep-cloned snapshot for change-comparison
  setInitialDetailData(structuredClone(initialForm));
}, [userData]);


const toggleDetailedProfileView = () => {
  // Debug logging (you can remove these once it behaves)
  console.log(
    "[toggleDetailedProfileView] showDetailed:", showDetailedProfile,
    "initialSnapshot:", initialDetailData,
    "currentForm:", formData
  );

  if (showDetailedProfile) {
    // We're trying to hide it → check for unsaved changes
    let unsaved = false;
    if (initialDetailData) {
      unsaved = !isEqual(formData, initialDetailData);
    }
    if (unsaved) {
      setShowWarning(true);
      return;               // stop here, user must confirm
    }
    // no unsaved changes → hide it
    setShowWarning(false);
    setShowDetailedProfile(false);
  } else {
    // We're opening it → take a fresh snapshot & clear warnings
    setShowWarning(false);
    // deep-copy formData into initialDetailData
    setInitialDetailData(
      typeof structuredClone === "function"
        ? structuredClone(formData)
        : JSON.parse(JSON.stringify(formData))
    );
    setShowDetailedProfile(true);
  }
};


  const confirmHideDetails = (confirm) => {
    if (confirm) {
      setShowDetailedProfile(false);
    }
    setShowWarning(false);
  };

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      // Check if there are unsaved changes
      if (JSON.stringify(formData) !== JSON.stringify(initialDetailData)) {
        e.preventDefault();
        e.returnValue = ''; // required for Chrome
        return '';
      }
    };
  
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [formData, initialDetailData]);
  

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/auth/user/profile', {
          params: { userRole },
          withCredentials: true,
        });
        const user = response.data.user;
        setUserData(user);
        setFormData({
          phone: user.phone || '',
          email: user.email || '',
          password: '',
          confirmPassword: '',
          name: user.name || '',
          housingType: user.housingType || '',
          spaceAvailable: user.spaceAvailable || '',
          existingPet: user.existingPet || '',
          petFriendly: user.petFriendly || false,
          accessOutdoor: user.accessOutdoor || false,
          preferredPetType: user.preferredPetType || '',
          energyLevelPreference: user.energyLevelPreference || '',
          highMaintenance: user.highMaintenance || false,
          dailyActivityLevel: user.dailyActivityLevel || '',
          securityNeeds: user.securityNeeds || false,
          petOwner: user.petOwner || 'SELF',
          kidsAtHome: user.kidsAtHome || 'NO',
          kidsAge: user.kidsAge || '',
          petOwnershipType: user.petOwnershipType || 'FIRST_TIME',
          idealAgePreference: user.idealAgePreference || 'NONE',
          idealGenderPreference: user.idealGenderPreference || 'NONE',
          idealSizePreference: user.idealSizePreference || 'NONE',
          idealCoatLength: user.idealCoatLength || 'NONE',
          idealNeeds: user.idealNeeds || [],
          idealSpecialNeedsReceptiveness: user.idealSpecialNeedsReceptiveness || 'YES',
          idealBreed: user.idealBreed || []
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    fetchUserData();
  }, [userRole]);

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

  const handleSave = async () => {
    if (!validateEmail(formData.email)) {
      setError('Invalid email format.');
      return;
    }
    try {
      setIsLoading(true);
      await axios.put('http://localhost:5000/auth/user/update-profile', formData, {
        params: { userRole },
        withCredentials: true,
      });
      setIsEditing(false);
      if (formData.email !== userData.email) {
        handleShowComponent('verifyOTP', 'email', formData.email, '', userRole, true);
      }
      setError('');
      setUserData({
        ...userData,
        phone: formData.phone,
        email: formData.email,
        name: formData.name,
        city: formData.city,
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

const handleSaveDetails = async () => {
  try {
    setIsLoading(true);

    await axios.put(
      'http://localhost:5000/auth/user/update-detail-profile',
      formData,
      { params: { userRole }, withCredentials: true }
    );

    // 1) Update your userData state
    setUserData({
      ...userData,
      housingType: formData.housingType,
      spaceAvailable: formData.spaceAvailable,
      existingPet: formData.existingPet,
      petFriendly: formData.petFriendly,
      accessOutdoor: formData.accessOutdoor,
      preferredPetType: formData.preferredPetType,
      energyLevelPreference: formData.energyLevelPreference,
      highMaintenance: formData.highMaintenance,
      dailyActivityLevel: formData.dailyActivityLevel,
      securityNeeds: formData.securityNeeds,
      petOwner: formData.petOwner,
      kidsAtHome: formData.kidsAtHome,
      kidsAge: formData.kidsAge,
      petOwnershipType: formData.petOwnershipType,
      idealAgePreference: formData.idealAgePreference,
      idealGenderPreference: formData.idealGenderPreference,
      idealSizePreference: formData.idealSizePreference,
      idealCoatLength: formData.idealCoatLength,
      idealNeeds: formData.idealNeeds,
      idealSpecialNeedsReceptiveness: formData.idealSpecialNeedsReceptiveness,
      idealBreed: formData.idealBreed,
    });

    // 2) Reset your “initial” snapshot so no false unsaved warning
    setInitialDetailData(structuredClone(formData));

    // 3) Exit editing mode & show success
    setIsEditing(false);
    setError('');
    setSuccessMessage('Your detailed information has been updated successfully!');
  } catch (error) {
    console.error('Error updating profile details:', error);
    setError('Failed to update profile details. Please try again.');
  } finally {
    setIsLoading(false);
  }
};


  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setError('');
  };

  // Handle both text and checkbox inputs.
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    let updatedValue = type === 'checkbox' ? checked : value;
    if (name === 'preferredPetType') {
      // Reset the idealBreed array when pet type changes.
      setFormData((prev) => ({
        ...prev,
        preferredPetType: value,
        idealBreed: [],
      }));
    }
    if (name === 'phone') {
      updatedValue = updatedValue.replace(/[^0-9]/g, '');
      if (updatedValue && !/^03\d{9}$/.test(updatedValue)) {
        setError("Invalid phone number format. Example: 03001234567");
      } else {
        setError("");
      }
    }
    if (name === 'password') {
      if (updatedValue.length === 0) {
        setError('');
      } else if (updatedValue.length < 6) {
        setError('Password must be at least 6 characters long.');
      } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(updatedValue)) {
        setError('Password must contain at least one special character.');
      } else {
        setError('');
      }
    }
    if (name === 'confirmPassword') {
      if (updatedValue.length === 0) {
        setError('');
      } else if (updatedValue !== formData.password) {
        setError('Passwords do not match.');
      } else {
        setError('');
      }
    }
    if (name === 'email') {
      if (!validateEmail(updatedValue)) {
        setError('Invalid email format.');
      } else {
        setError('');
      }
    }
    setFormData({ ...formData, [name]: updatedValue });
  };

  useEffect(() => {
    setFormData(prev => ({ ...prev, idealBreed: [] }));
  }, [formData.preferredPetType]);

  // Handler for multi-select checkbox fields.
  const handleMultiSelectChange = (e, fieldName) => {
    const { value, checked } = e.target;
    const currentArray = formData[fieldName] || [];
    let newArray;
    if (checked) {
      newArray = [...currentArray, value];
    } else {
      newArray = currentArray.filter(item => item !== value);
    }
    setFormData({ ...formData, [fieldName]: newArray });
  };

  const toggleBreedDropdown = () => {
    setIsBreedDropdownOpen(prev => !prev);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return (
      emailRegex.test(email) &&
      !/\.\./.test(email) &&
      !email.endsWith('.') &&
      !/(\.[a-zA-Z]{2,63})\1/.test(email)
    );
  };

  // For easier use in JSX.
  const petType = formData.preferredPetType;

  return (
    <div className={`mx-auto my-10 ${showDetailedProfile ? "max-w-7xl" : "max-w-2xl"}`}>
      {/* Basic Profile view */}
      {!showDetailedProfile && (
        <div className="bg-orange-200 py-6 px-14 shadow-lg rounded-lg w-full transition-all duration-500">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-teal-700">Profile</h2>
            <button
              onClick={toggleDetailedProfileView}
              className="px-4 py-2 bg-gradient-to-r from-teal-500 to-teal-800 hover:opacity-90 text-white rounded-md transition-colors"
            >
              My Adopter Profile
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-700">Name</label>
              <input
                type="text"
                name="name"
                value={isEditing ? formData.name : userData?.name}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-300"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700">Phone</label>
              <input
                type="tel"
                name="phone"
                value={isEditing ? formData.phone : userData?.phone}
                onChange={handleInputChange}
                pattern="[0-9]{11}"
                disabled={!isEditing}
                className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-300"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                value={isEditing ? formData.email : userData?.email}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-300"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700">City</label>
              <select
                name="city"
                value={isEditing ? formData.city : userData?.city}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-300"
              >
                <option value="" disabled>Select a city</option>
                {majorCitiesPakistan.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            {isEditing && (
              <>
                <div>
                  <label className="block text-sm text-gray-700">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-300"
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute inset-y-0 right-3 flex items-center"
                    >
                      {showPassword ? <Eye className="w-5 h-5 text-gray-600" /> : <EyeOff className="w-5 h-5 text-gray-600" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-700">Confirm Password</label>
                  <div className="relative">
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-300"
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute inset-y-0 right-3 flex items-center"
                    >
                      {showPassword ? <Eye className="w-5 h-5 text-gray-600" /> : <EyeOff className="w-5 h-5 text-gray-600" />}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
          {error && <p className="mt-2 text-sm text-red-500 text-center">{error}</p>}
          <div className="flex justify-between items-center mt-6 w-full">
            <button
              onClick={handleEditToggle}
              className={`px-4 py-2 w-1/3 rounded-md transition-colors text-white ${isEditing ? 'bg-gray-500 hover:bg-gray-600' : 'bg-gradient-to-r from-orange-500 to-orange-800 hover:opacity-90'}`}
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
            {isEditing && (
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="px-4 py-2 w-1/3 bg-gradient-to-r from-teal-600 to-teal-900 hover:opacity-90 text-white rounded-md transition-colors"
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Detailed Profile view */}
      {showDetailedProfile && (
        <div className="flex gap-4 transition-all duration-500">
          {/* Left Panel: Basic Profile */}
          <div className="bg-orange-200 p-6 shadow-lg rounded-lg w-1/3 transition-all duration-500">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-teal-700">Profile</h2>
              <button
                onClick={toggleDetailedProfileView}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-md transition-colors"
              >
                Hide Detail
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700">Name</label>
                <input
                  type="text"
                  name="name"
                  value={isEditing ? formData.name : userData?.name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-300"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={isEditing ? formData.phone : userData?.phone}
                  onChange={handleInputChange}
                  pattern="[0-9]{11}"
                  disabled={!isEditing}
                  className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-300"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  value={isEditing ? formData.email : userData?.email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-300"
                />
              </div>
              <div className="mt-4">
                {/* City Dropdown */}
                <label className="block text-sm text-gray-700">City</label>
                <select
                  name="city"
                  value={isEditing ? formData.city : userData?.city}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-300"
                >
                  <option value="" disabled>Select a city</option>
                  {majorCitiesPakistan.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>
              {isEditing && (
                <>
                  <div>
                    <label className="block text-sm text-gray-700">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-300"
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute inset-y-0 right-3 flex items-center"
                      >
                        {showPassword ? <Eye className="w-5 h-5 text-gray-600" /> : <EyeOff className="w-5 h-5 text-gray-600" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700">Confirm Password</label>
                    <div className="relative">
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-300"
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute inset-y-0 right-3 flex items-center"
                      >
                        {showPassword ? <Eye className="w-5 h-5 text-gray-600" /> : <EyeOff className="w-5 h-5 text-gray-600" />}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
            {error && <p className="mt-2 text-sm text-red-500 text-center">{error}</p>}
            <div className="flex justify-around items-center mt-6">
              <button
                onClick={handleEditToggle}
                className={`px-4 py-2 rounded-md transition-colors text-white ${isEditing ? 'bg-gray-500 hover:bg-gray-600' : 'bg-orange-500 hover:bg-orange-600'}`}
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
              {isEditing && (
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-md transition-colors"
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              )}
            </div>
          </div>

          {/* Right Panel: Dynamic Detailed Profile */}
          <div className="bg-orange-200 p-6 shadow-lg rounded-lg w-2/3 transition-all duration-500">
            <h3 className="text-xl font-bold text-teal-700 mb-4">Adopter Profile</h3>
            <p className="text-sm text-gray-700 mb-4">
              This information will help us find the best pet that suits your needs.
            </p>

            {/* Preferred Pet Type */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1">
                <label className="block text-sm text-gray-700">Preferred Pet Type</label>
                <select
                  name="preferredPetType"
                  value={formData.preferredPetType}
                  onChange={handleInputChange}
                  className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select Type</option>
                  <option value="cat">Cat</option>
                  <option value="dog">Dog</option>
                  <option value="rabbit">Rabbit</option>
                </select>
              </div>
              {petType && (
                <div className="flex-1">
                  <label className="block text-sm text-gray-700">Existing Pet(s)</label>
                  <select
                    name="existingPet"
                    value={formData.existingPet}
                    onChange={handleInputChange}
                    className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                  >
                    {(existingPetOptions || ['None']).map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {petType && (
              <>
                {/* Housing and Space */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm text-gray-700">Housing Type</label>
                    <select
                      name="housingType"
                      value={formData.housingType}
                      onChange={handleInputChange}
                      className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select Housing</option>
                      <option value="Apartment">Apartment</option>
                      <option value="House with Yard">House with Yard</option>
                      <option value="Farm">Farm</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700">Space Available</label>
                    <select
                      name="spaceAvailable"
                      value={formData.spaceAvailable}
                      onChange={handleInputChange}
                      className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select Space</option>
                      <option value="Small">Small</option>
                      <option value="Medium">Medium</option>
                      <option value="Large">Large</option>
                    </select>
                  </div>
                </div>

                {/* Environment Options */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="petFriendly"
                      checked={formData.petFriendly}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    <label className="text-sm text-gray-700">Pet-Friendly Environment</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="accessOutdoor"
                      checked={formData.accessOutdoor}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    <label className="text-sm text-gray-700">Access to Outdoor</label>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm text-gray-700">Pet Energy Level Preference</label>
                    <select
                      name="energyLevelPreference"
                      value={formData.energyLevelPreference}
                      onChange={handleInputChange}
                      className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select Energy</option>
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center mt-7">
                      <input
                        type="checkbox"
                        name="highMaintenance"
                        checked={formData.highMaintenance}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      <label className="text-sm text-gray-700">High Maintenance</label>
                    </div>

                    {/* Security Needs (for dogs only) */}
                    {petType === 'dog' && (
                      <div className="flex items-center mt-7">
                        <input
                          type="checkbox"
                          name="securityNeeds"
                          checked={formData.securityNeeds}
                          onChange={handleInputChange}
                          className="mr-2"
                        />
                        <label className="text-sm text-gray-700">Security Needs</label>
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Info Section (common) */}
                <div className="mt-8">
                  <h4 className="text-lg font-bold text-teal-700 mb-2">Additional Info</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-700">Pet Owner(s)</label>
                      <select
                        name="petOwner"
                        value={formData.petOwner}
                        onChange={handleInputChange}
                        className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                      >
                        <option value="SELF">Myself</option>
                        <option value="FAMILY">My Family</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700">Kids at Home</label>
                      <select
                        name="kidsAtHome"
                        value={formData.kidsAtHome}
                        onChange={handleInputChange}
                        className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                      >
                        <option value="NO">No Kids</option>
                        <option value="YES">Kids</option>
                      </select>
                    </div>
                    {formData.kidsAtHome === 'YES' && (
                      <div className="col-span-2">
                        <label className="block text-sm text-gray-700">Age of Kids</label>
                        <select
                          name="kidsAge"
                          value={formData.kidsAge}
                          onChange={handleInputChange}
                          className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                        >
                          <option value="">Select Age</option>
                          <option value="YOUNGER">Younger (under 8)</option>
                          <option value="OLDER">Older (over 8)</option>
                          <option value="BOTH">Younger and Older</option>
                        </select>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm text-gray-700">Type of Pet Owner</label>
                      <select
                        name="petOwnershipType"
                        value={formData.petOwnershipType}
                        onChange={handleInputChange}
                        className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                      >
                        <option value="FIRST_TIME">First-time</option>
                        <option value="PREVIOUS">Previous</option>
                        <option value="CURRENT">Current</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700">Your Household Activity Level</label>
                      <select
                        name="dailyActivityLevel"
                        value={formData.dailyActivityLevel}
                        onChange={handleInputChange}
                        className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                      >
                        <option value="Moderate comings and goings">Moderate comings and goings</option>
                        <option value="Quiet with occasional guests">Quiet with occasional guests</option>
                        <option value="Busy / noisy">Busy / noisy</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Ideal Pet Section */}
                <div className="mt-8">
                  <h4 className="text-lg font-bold text-teal-700 mb-2">
                    My Ideal {petType.charAt(0).toUpperCase() + petType.slice(1)}
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-700">Age Preference</label>
                      <select
                        name="idealAgePreference"
                        value={formData.idealAgePreference}
                        onChange={handleInputChange}
                        className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                      >
                        <option value="NONE">(No Age Preference)</option>
                        <option value="BABY">{petType === 'dog' ? 'Puppy' : 'Baby'}</option>
                        <option value="YOUNG">Young</option>
                        <option value="ADULT">Adult</option>
                        <option value="SENIOR">Senior</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700">Gender Preference</label>
                      <select
                        name="idealGenderPreference"
                        value={formData.idealGenderPreference}
                        onChange={handleInputChange}
                        className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                      >
                        <option value="NONE">(No Gender Preference)</option>
                        <option value="FEMALE">Female</option>
                        <option value="MALE">Male</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700">Size Preference</label>
                      <select
                        name="idealSizePreference"
                        value={formData.idealSizePreference}
                        onChange={handleInputChange}
                        className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                      >
                        <option value="NONE">(No Size Preference)</option>
                        <option value="SMALL">Small</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="LARGE">Large</option>
                        <option value="EXTRA_LARGE">Extra Large</option>
                      </select>
                    </div>
                    {(petType === 'cat' || petType === 'dog') && (
                      <div>
                        <label className="block text-sm text-gray-700">Coat Length Preference</label>
                        <select
                          name="idealCoatLength"
                          value={formData.idealCoatLength}
                          onChange={handleInputChange}
                          className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                        >
                          <option value="NONE">(No Coat Preference)</option>
                          <option value="SHORT">Short</option>
                          <option value="MEDIUM">Medium</option>
                          <option value="LONG">Long</option>
                        </select>
                      </div>
                    )}
                    <div className="col-span-2 relative">
                      <label className="block text-sm text-gray-700">Aspirational Breed</label>
                      {petType === 'other' ? (
                        <p className="text-sm text-gray-600">Breed selection disabled for "other".</p>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={toggleBreedDropdown}
                            className="mt-1 w-full p-2 border bg-white border-gray-300 rounded-md text-left"
                          >
                            {formData.idealBreed.length > 0
                              ? formData.idealBreed.join(', ')
                              : "Click to Select Breed(s)"}
                          </button>
                          {isBreedDropdownOpen && (
                            <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md max-h-60 overflow-auto">
                              <div className="grid grid-cols-2 gap-2 p-2">
                                {breedOptions[petType]?.length > 0 ? (
                                  breedOptions[petType].map((breed) => (
                                    <label key={breed} className="flex items-center px-2 py-1 hover:bg-gray-100">
                                      <input
                                        type="checkbox"
                                        value={breed}
                                        checked={formData.idealBreed.includes(breed)}
                                        onChange={(e) => handleMultiSelectChange(e, 'idealBreed')}
                                        className="mr-2"
                                      />
                                      <span>{breed}</span>
                                    </label>
                                  ))
                                ) : (
                                  <p className="px-2 py-1 text-sm text-gray-600">No breed options available.</p>
                                )}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700">Special Needs Receptiveness</label>
                      <select
                        name="idealSpecialNeedsReceptiveness"
                        value={formData.idealSpecialNeedsReceptiveness}
                        onChange={handleInputChange}
                        className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                      >
                        <option value="YES">Open</option>
                        <option value="NO">Not Open</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm text-gray-700">Ideal Needs</label>
                      <div className="mt-1 flex gap-4">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            value="ALLERGY_FRIENDLY"
                            checked={formData.idealNeeds.includes('ALLERGY_FRIENDLY')}
                            onChange={(e) => handleMultiSelectChange(e, 'idealNeeds')}
                            className="mr-2"
                          />
                          <span>Allergy-friendly</span>
                        </label>
                        {(petType === 'cat' || petType === 'dog') && (
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              value="LITTER_BOX_TRAINED"
                              checked={formData.idealNeeds.includes('LITTER_BOX_TRAINED')}
                              onChange={(e) => handleMultiSelectChange(e, 'idealNeeds')}
                              className="mr-2"
                            />
                            <span>Litter box–trained</span>
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSaveDetails}
                disabled={isLoading}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-md transition-colors"
              >
                {isLoading ? 'Saving...' : 'Save Detailed Info'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showWarning && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-2xl shadow-lg max-w-sm text-center relative">
            <div className="flex justify-center">
              <svg className="w-16 h-16 text-orange-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.94-1.04 3.307-2.533l2.932-11.732C20.586 4.733 18.94 3 17 3H7C5.06 3 3.414 4.733 3.793 6.735l2.932 11.732C7.06 19.96 8.46 21 10 21z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mt-4">Unsaved Changes</h2>
            <p className="mt-2 text-gray-600">
              You have unsaved changes. If you leave now, your updates will be lost.
              Are you sure you want to continue?
            </p>
            <div className="mt-6 flex justify-center space-x-4">
              <button 
                className="px-5 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
                onClick={() => confirmHideDetails(false)}
              >
                Go Back
              </button>
              <button 
                className="px-5 py-2 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition"
                onClick={() => confirmHideDetails(true)}
              >
                Discard Changes
              </button>
            </div>
          </div>
        </div>
      )}
      {successMessage && (
        <SuccessModal 
          message={successMessage} 
          onClose={() => setSuccessMessage("")} 
        />
      )}
    </div>
  );
};

export default UserProfile;
