import React, { useState } from 'react';
import { Eye, EyeOff, ChevronDown } from "lucide-react";
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

export default function ClinicRegister({ onRegisterSuccess, onClose }) {
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // Manage the current step
  const [formData, setFormData] = useState({
    clinicName: '',
    phone: '',
    email: '',
    password: '',
    city: '',
    address: '',
    clinicRegistrationFile: null,
    NICFile: null,
    vetLicenseFile: null,
    proofOfAddressFile: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === 'password') {
      if(value.length == 0){
        setError('');
      } else if (value.length < 6) {
        setError('Password must be at least 6 characters long.');
      } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
        setError('Password must contain at least one special character.');
      } else {
        setError('');
      }
    }
  };

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files?.[0];
    const fileName = e.target.name;
    if (selectedFile) {
      setFormData({ ...formData, [fileName]: selectedFile });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      const response = await axios.post('http://localhost:5000/auth/clinic-register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        onRegisterSuccess(formData.email);
      } else {
        setErrorMessage(response.data.message || 'Failed to register. Please try again.');
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
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
  
  const nextStep = (event) => {
    event.preventDefault(); // Prevent form submission
  
    // Validate email
    if (!validateEmail(formData.email)) {
      setError("Invalid email format");
      return; // Stop execution if email is invalid
    }
  
    // Clear error and proceed to the next step
    setError("");
    setCurrentStep(2);
  };

  const prevStep = () => {
    setCurrentStep(1);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-md shadow-lg w-full md:max-w-2xl px-4 h-full md:h-auto sm:px-6 pt-4 sm:pt-6 relative">
        <div className="absolute top-0 left-0 w-full flex justify-end">
          <button onClick={onClose} className="w-full text-gray-600 hover:text-gray-500 text-2xl py-2 px-4 text-right">
            &times;
          </button>
        </div>
        <div className="flex justify-center pt-4">
          <span className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-orange-700 bg-clip-text text-transparent">
            Clinic Registration
          </span>
        </div>

        {currentStep === 1 && (
          <form onSubmit={nextStep} className="space-y-4 my-5 text-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                name="clinicName"
                value={formData.clinicName}
                onChange={handleChange}
                placeholder="Clinic Name"
                className="w-full p-2 border border-gray-600 rounded focus:outline-none focus:border-orange-500"
                required
              />
              <input
                type="tel"
                name="phone"
                pattern="^03\d{9}$"
                value={formData.phone}
                onChange={handleChange}
                placeholder="eg. 03001234567"
                className="w-full p-2 border border-gray-600 rounded focus:outline-none focus:border-orange-500"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                className="w-full p-2 border border-gray-600 rounded focus:outline-none focus:border-orange-500"
                required
              />
              <div className="relative">
                <select
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-600 rounded focus:outline-none focus:border-orange-500 appearance-none"
                  required
                >
                  <option value="">Select City</option>
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
            </div>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Clinic Address"
              className="w-full p-2 border border-gray-600 rounded focus:outline-none focus:border-orange-500"
              required
            />
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                className={`w-full p-2 border ${error ? 'border-red-500' : 'border-gray-600'} rounded pr-10 focus:outline-none focus:border-orange-500`}
                required
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 flex items-center pr-3"
                tabIndex="-1"
              >
                {showPassword ? <Eye className="w-5 h-5 text-gray-600" /> : <EyeOff className="w-5 h-5 text-gray-600" />}
              </button>
            </div>
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            <div className="flex justify-center">
              <button
                type="submit"
                disabled={isLoading}
                className="bg-gradient-to-r from-teal-600 to-teal-800 hover:from-teal-500 hover:to-teal-700 text-white p-2 rounded w-1/2"
              >
                {isLoading ? 'Loading...' : 'Next'}
              </button>
            </div>
              
          </form>
        )}

        {currentStep === 2 && (
          <form onSubmit={handleSubmit} className="space-y-4 my-5 text-gray-700">
            {/* Section for Clinic Documents */}
            <div>
              <h2 className="text-lg font-semibold text-orange-700 text-center">Clinic Documents</h2>

              <div>
                <label className="block text-gray-800 font-semibold">Clinic Registration Document</label>
                <input
                  type="file"
                  name="clinicRegistrationFile"
                  accept=".jpg, .jpeg, .png, .pdf"
                  onChange={handleFileChange}
                  className="w-full p-2 border border-gray-600 rounded focus:outline-none focus:border-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-800 font-semibold">Veterinary License</label>
                <input
                  type="file"
                  name="vetLicenseFile"
                  accept=".jpg, .jpeg, .png, .pdf"
                  onChange={handleFileChange}
                  className="w-full p-2 border border-gray-600 rounded focus:outline-none focus:border-orange-500"
                  required
                />
                <p className="text-sm text-gray-600 mt-1">
                  Upload a valid veterinary license to verify licensed professionals.
                </p>
              </div>
            </div>

            {/* Section for Owner Verification */}
            <div>
              <h2 className="text-lg font-semibold text-orange-700 text-center">Owner Verification</h2>

              <div>
                <label className="block text-gray-800 font-semibold">National Identity Card</label>
                <input
                  type="file"
                  name="NICFile"
                  accept=".jpg, .jpeg, .png, .pdf"
                  onChange={handleFileChange}
                  className="w-full p-2 border border-gray-600 rounded focus:outline-none focus:border-orange-500"
                  required
                />
                <p className="text-sm text-gray-600 mt-1">
                  Upload a valid NIC to verify the clinic owner’s identity.
                </p>
              </div>

              <div>
                <label className="block text-gray-800 font-semibold">Proof of Address</label>
                <input
                  type="file"
                  name="proofOfAddressFile"
                  accept=".jpg, .jpeg, .png, .pdf"
                  onChange={handleFileChange}
                  className="w-full p-2 border border-gray-600 rounded focus:outline-none focus:border-orange-500"
                  required
                />
                <p className="text-sm text-gray-600 mt-1">
                  Upload any government-issued document verifying the clinic's location.
                </p>
              </div>
            </div>

            {errorMessage && <p className="text-red-500 text-sm mt-1">{errorMessage}</p>}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={prevStep}
                className="w-1/3 bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 focus:outline-none"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="w-1/2 bg-gradient-to-r from-teal-600 to-teal-800 hover:from-teal-500 hover:to-teal-700 text-white px-6 py-2 rounded-md focus:outline-none"
              >
                {isLoading ? 'Signing Up...' : 'Sign Up'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
