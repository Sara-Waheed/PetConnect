import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, ChevronDown, X} from "lucide-react";
import axios from 'axios';

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

export default function ProviderRegister({onRegisterSuccess, onClose}) {
  const [step, setStep] = useState(1);
  const [errorMessage, setErrorMessage] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    city: '',
    role: '',
    yearsOfExperience: '',
    vetResume: null,
    vetLicenseFile: null,
    vetDegree: null,
    clinic: '',
    groomerCertificate: null,
    groomingSpecialties: '',
    sitterAddress: '',
    sitterCertificate: null,
    sittingExperience: '',
    profilePhoto: null,
  });

  const [clinics, setClinics] = useState([]); // Stores fetched clinics based on city
  const [profilePreview, setProfilePreview] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [e.target.name]: e.target.value }); 
    if (name === 'email') {
      if (!validateEmail(value)) {
        setError('Please enter a valid email address.');
      } else {
        setError('');
      }
    }
    if (name === 'password') {
        if (value.length < 6) {
          setError('Password must be at least 6 characters long.');
        } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
          setError('Password must contain at least one special character.');
        } else {
          setError('');
        }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return (
      emailRegex.test(email) &&                 // Check basic email format
      !/\.\./.test(email) &&                   // Reject consecutive dots
      !email.endsWith('.') &&                  // Reject trailing dot
      !/(\.[a-zA-Z]{2,63})\1/.test(email)      // Reject repeated TLD-like segments (e.g., `.com.com`)
    );
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    const fileName = e.target.name;
    
    if (fileName === 'profilePhoto' && selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }

    if (selectedFile) {
      setFormData({ ...formData, [fileName]: selectedFile });
    }
  };

  const removeProfilePhoto = () => {
    setProfilePreview(null);
    setFormData({ ...formData, profilePhoto: null });
  };

  const handleNext = async () => {
    setLoading(true); // Set loading to true to show a loading state
    if (validateStep1()) {
      if (formData.role === 'vet' || formData.role === 'groomer') {
        try {
          const response = await axios.get(`http://localhost:5000/auth/clinics/${formData.city}`);
          if (response.status === 204) {
            setClinics([]); 
            setErrorMessage(`No clinics found for the city "${formData.city}". Select another city or try again later.`);
          } else {
            setClinics(response.data.clinics || []);
            setErrorMessage(null); 
          }
        } catch (error) {
          console.error('Error fetching clinics:', error);
          setErrorMessage("An error occurred. Please try again.");
        }
      }
      
      setLoading(false); // Set loading to false once the request is complete
      setStep(2); // Move to the next step
    } else {
      setLoading(false); // If validation fails, stop loading
    }
  };  

  const validateStep1 = () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.password || !formData.city || !formData.role) {
      setErrorMessage('Please fill out all required fields.');
      return false;
    }
    setErrorMessage('');
    return true;
  };


  const handlePrevious = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const formDataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      formDataToSend.append(key, value);
    });
  
    try {
      setLoading(true);
      const response = await axios.post('http://localhost:5000/auth/provider-register', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (response.status === 200) {
        console.log("role in provider register:", formData.role);
        onRegisterSuccess(formData.email, formData.role); 
      }
    }  catch (error) {
      if (error.response) {
        // Extracting the message from the response object
        const errorMsg = error.response.data.message || 'An unknown error occurred';
        setErrorMessage(errorMsg); // Only set the string, not the entire object
        console.error('Error Response:', error.response.data);
      }
    } finally {
      setLoading(false); // Set loading state to false after request is complete
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg w-full md:max-w-2xl h-full md:h-auto px-4 sm:px-6 pt-4 sm:pt-6 relative">
        <div className="absolute top-0 left-0 w-full flex justify-end">
          <button onClick={onClose} className="w-full text-gray-500 text-2xl py-2 px-4 text-right"> &times; </button>
        </div>

        <div className="flex justify-center pt-4">
          <span className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-orange-700 bg-clip-text text-transparent">
            PetConnect
          </span>
        </div>

        <div>
          <div className="text-gray-800 my-5 mx-4">
            <p className="mb-2">Please provide details below.</p>
            <form onSubmit={handleSubmit} className="space-y-4 text-gray-800">
              {step === 1 && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Full Name"
                      className="w-full p-2 border border-gray-600 rounded-lg focus:outline-none focus:border-orange-500 shadow-sm"
                      required
                    />
                    
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="eg. 03001234567"
                      className="w-full p-2 border border-gray-600 rounded-lg focus:outline-none focus:border-orange-500 shadow-sm"
                      pattern="^03\d{9}$"
                      title="Phone number must be exactly 11 digits."
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Email"
                      className="w-full p-2 border border-gray-600 rounded-lg focus:outline-none focus:border-orange-500 shadow-sm"
                      required
                    />
                    
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Password (at least 6 characters)"
                        className={`w-full p-2 border ${error ? 'border-red-500' : 'border-gray-600'} rounded-lg pr-10 focus:outline-none focus:border-orange-500 shadow-sm`}
                        pattern="^(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{5,}$"
                        title="Password must be at least 5 characters long and include at least 1 special character."
                        required
                      />
                      <button 
                        type="button" 
                        onClick={togglePasswordVisibility} 
                        className="absolute inset-y-0 right-0 flex items-center pr-3"
                        tabIndex="-1"
                      >
                        {showPassword ? (
                          <Eye className="w-5 h-5 text-gray-600" />
                        ) : (
                          <EyeOff className="w-5 h-5 text-gray-600" />
                        )}
                      </button>
                    </div>
                  </div>
                  {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

                  <div className="relative">
                    <select
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-600 rounded-lg focus:outline-none focus:border-orange-500 shadow-sm appearance-none"
                      required
                    >
                      <option value="" disabled>Select City</option>
                      {majorCitiesPakistan.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                    <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-600">
                      <ChevronDown />
                    </span>
                  </div>

                  <div className="relative">
                    <select 
                      name="role" 
                      value={formData.role} 
                      onChange={handleInputChange} 
                      className="w-full p-2 border border-gray-600 rounded-lg focus:outline-none focus:border-orange-500 shadow-sm appearance-none" 
                      required
                    >
                      <option value="" disabled>Select your role</option>
                      <option value="vet">Veterinarian</option>
                      <option value="groomer">Pet Groomer</option>
                      <option value="sitter">Pet Sitter</option>
                    </select>
                    <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-600">
                      <ChevronDown />
                    </span>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Profile Photo {!profilePreview && '(optional)'}
                    </label>
                    
                    {profilePreview ? (
                      <div className="relative w-24 h-24">
                        <img 
                          src={profilePreview} 
                          alt="Profile preview" 
                          className="w-full h-full rounded-full object-cover border-2 border-orange-200"
                        />
                        <button
                          type="button"
                          onClick={removeProfilePhoto}
                          className="absolute -top-2 -right-2 bg-white rounded-full p-0.5 shadow-sm border border-gray-200 hover:bg-gray-50"
                        >
                          <X className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-orange-500 transition-colors">
                        <div className="text-center">
                          <p className="text-sm text-gray-600">
                            Click to upload photo<br />
                            <span className="text-xs text-gray-500">(JPEG, PNG, max 5MB)</span>
                          </p>
                        </div>
                        <input 
                          type="file" 
                          name="profilePhoto" 
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden" 
                        />
                      </label>
                    )}
                  </div>
                    {errorMessage && <p className="text-red-500 text-center mt-2">{errorMessage}</p>}

                    <div className="flex justify-center mt-8">
                      <button 
                        type="button" 
                        onClick={handleNext} 
                        disabled={loading} 
                        className="w-1/2 p-2 text-white font-medium bg-gradient-to-r from-teal-600 to-teal-800 hover:from-teal-500 hover:to-teal-700 rounded-lg shadow-md">
                        {loading ? 'Processing...' : 'Continue'} 
                      </button>
                    </div>

                </>
              )}
              
              {step === 2 && (
                <>
                  <input 
                    type="number" 
                    name="yearsOfExperience" 
                    value={formData.yearsOfExperience} 
                    onChange={handleInputChange}
                    placeholder="Years of Experience" 
                    className="w-full p-2 border border-gray-600 rounded focus:outline-none focus:border-orange-500"
                    required 
                  />

                  <div>
                    {formData.role === 'vet' && (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-800 font-medium">Veterinary License</label>
                            <input
                              type="file"
                              id="vetLicenseFile"
                              name="vetLicenseFile"
                              accept=".pdf, .png, .jpg, .jpeg"
                              onChange={handleFileChange}
                              className="w-full p-1.5 border border-gray-600 rounded focus:outline-none focus:border-orange-500"
                              required
                            />
                          </div>

                          <div className="relative md:mt-6">
                            <select
                              name="clinic"  
                              value={formData.clinic} 
                              onChange={handleInputChange}
                              className="w-full p-2 border border-gray-600 rounded focus:outline-none focus:border-orange-500 appearance-none"
                              required
                            >
                              <option value="" disabled>Select Clinic</option>
                              {clinics.map((clinic) => (
                                <option key={clinic._id} value={clinic._id}> 
                                  {clinic.clinicName}
                                </option>
                              ))}
                            </select>
                            <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-600">
                              <ChevronDown />
                            </span>
                          </div>

                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-gray-800 font-medium mt-3">Upload Your Resume</label>
                            <input
                              type="file"
                              id="vetResume"
                              name="vetResume"
                              accept=".pdf, .png, .jpg, .jpeg"
                              onChange={handleFileChange}
                              className="w-full p-1.5 border border-gray-600 rounded focus:outline-none focus:border-orange-500"
                            />
                          </div>

                          <div>
                            <label className="block text-gray-800 font-medium md:mt-3">Upload Your Veterinary Degree</label>
                            <input
                              type="file"
                              id="vetDegree"
                              name="vetDegree"
                              accept=".pdf, .png, .jpg, .jpeg"
                              onChange={handleFileChange}
                              className="w-full p-1.5 border border-gray-600 rounded focus:outline-none focus:border-orange-500"
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {formData.role === 'groomer' && (
                      <>
                        <div className="relative">
                          <select
                            name="clinic"
                            value={formData.clinic}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-600 rounded focus:outline-none focus:border-orange-500 appearance-none"
                            required
                          >
                          <option value="">Select Clinic</option>
                          {clinics.map((clinic) => (
                            <option key={clinic._id} value={clinic._id}>
                              {clinic.clinicName}
                            </option>
                          ))}
                          </select>
                          <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-600">
                            <ChevronDown />
                          </span>
                        </div>

                        <div>
                          <label className="block text-gray-800 font-medium mt-3">Grooming Certificate</label>
                          <input
                            type="file"
                            id="groomerCertificate"
                            name="groomerCertificate"
                            accept=".pdf, .png, .jpg, .jpeg"
                            onChange={handleFileChange}
                            className="w-full p-1.5 mb-4 border border-gray-600 rounded focus:outline-none focus:border-orange-500"
                            required
                          />
                        </div>

                        <input
                          type="text"
                          name="groomingSpecialties"
                          value={formData.groomingSpecialties}
                          onChange={handleInputChange}
                          placeholder="Specialties (e.g., dogs, cats, etc.)"
                          className="w-full p-2 border border-gray-600 rounded focus:outline-none focus:border-orange-500"
                          required
                        />
                      </>
                    )}

                    {formData.role === 'sitter' && (
                      <>
                        <input
                          type="text"
                          name="sitterAddress"
                          value={formData.sitterAddress}
                          onChange={handleInputChange}
                          placeholder="Address"
                          className="w-full p-2 border border-gray-600 rounded focus:outline-none focus:border-orange-500"
                          required
                        />

                        <div >
                          <label className="block text-gray-800 font-medium mt-2">Sitter Certification</label>
                          <input
                            type="file"
                            id="sitterCertificate"
                            name="sitterCertificate"
                            accept=".pdf, .png, .jpg, .jpeg"
                            onChange={handleFileChange}
                            className="w-full p-1.5 mb-4 border border-gray-600 rounded focus:outline-none focus:border-orange-500"
                            required
                          />
                        </div>

                        <input
                          type="text"
                          name="sittingExperience"
                          value={formData.sittingExperience}
                          onChange={handleInputChange}
                          placeholder="Experience (e.g., dogs, cats)"
                          className="w-full p-2 border border-gray-600 rounded focus:outline-none focus:border-orange-500"
                          required
                        />
                      </>
                    )}

                  </div>
                  {errorMessage && <p className="text-red-500 text-center mt-2">{errorMessage}</p>}
                  <p className="text-base text-gray-600 mb-4">By signing up, you agree to PetConnect's Terms of use and Privacy Policy.</p>

                  <div className="flex justify-between mt-8">
                    <button 
                      type="button" 
                      onClick={() => {setErrorMessage(''); handlePrevious();}} 
                      className="w-1/3 p-2 text-white font-medium bg-gradient-to-r from-orange-700 to-orange-900 hover:from-orange-700 hover:to-orange-900 rounded mb-4">
                      Back  
                    </button>

                    <input 
                      type="submit" 
                      value={loading ? "Signing Up..." : "Sign Up"} // Change text when loading
                      className="w-1/3 p-2 text-white font-medium bg-gradient-to-r from-teal-600 to-teal-800 hover:from-teal-500 hover:to-teal-700 rounded mb-4"
                      disabled={loading} // Disable the button while loading
                    />
                  </div>
                </> 
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
