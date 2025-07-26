import React, { useState } from 'react';
import { Eye, EyeOff } from "lucide-react";
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

export default function UserRegister({ onRegisterSuccess, onClose }) {
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    city: ''
  });

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (name === 'email') {
      if (!validateEmail(value)) {
        setError('Please enter a valid email address.');
      } else {
        setError('');
      }
    }
    if (name === 'password') {
      if (value.length === 0) {
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

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,63}$/;
    return emailRegex.test(email) && !/\.\./.test(email) && !email.endsWith('.') && !/(\.[a-zA-Z]{2,63})\1/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setIsLoading(true);

      const response = await axios.post('http://localhost:5000/auth/register', formData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        onRegisterSuccess(formData.email);
      } else {
        setErrorMessage(response.data.message || 'Failed to register. Please try again.');
      }
    } catch (error) {
      console.error('Error sending data:', error);
      setErrorMessage(error.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-md shadow-lg w-full md:max-w-md px-4 h-full md:h-auto sm:px-6 pt-4 sm:pt-6 relative">
        
        <div className="absolute top-0 left-0 w-full flex justify-end">
          <button
            onClick={onClose}
            className="w-full text-gray-600 hover:text-gray-500 text-2xl py-2 px-4 text-right"
          >
            &times;
          </button>
        </div>
        <div className="flex justify-center pt-4"> 
          <span className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-orange-700 bg-clip-text text-transparent">
            PetConnect
          </span>
        </div>

        <div> 
          <div className="text-gray-800 my-5 mx-4">
            {errorMessage && ( 
              <p className="text-red-500 text-left mt-2">
                {errorMessage}
              </p> 
            )}
            <p className="mb-2">Please provide details below.</p>
            <form onSubmit={handleSubmit} className="space-y-4 text-gray-700">
              <input 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                placeholder="Name" 
                className="w-full p-2 border border-gray-600 rounded focus:outline-none focus:border-orange-500" 
                required 
              />

              <input 
                type="tel" 
                name="phone" 
                value={formData.phone} 
                pattern="^03\d{9}$"
                onChange={handleChange} 
                placeholder="eg. 03001234567" 
                className="w-full p-2 border border-gray-600 rounded focus:outline-none focus:border-orange-500" 
                required 
              />

              <input 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                placeholder="Email" 
                className="w-full p-2 border border-gray-600 rounded focus:outline-none focus:border-orange-500" 
                onFocus={() => setErrorMessage('')} 
                required 
              />

              {/* City Dropdown */}
              <select 
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full p-2 border border-gray-600 rounded focus:outline-none focus:border-orange-500"
                required
              >
                <option value="" disabled>Select your city</option>
                {majorCitiesPakistan.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>

              <div className="relative">
                <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Password (at least 6 characters)"
                    className={`w-full p-2 border ${error ? 'border-red-500' : 'border-gray-600'} rounded pr-10 focus:outline-none focus:border-orange-500`}
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
              {error && <p className="text-red-500 text-sm mt-1">{error}</p>}

              <p>By signing up, you agree to PetConnect's Terms of use and Privacy Policy.</p>

              <input 
                type="submit" 
                value={isLoading ? "Signing Up..." : "Sign Up As Pet Owner"} 
                className="w-full p-2 cursor-pointer text-white font-medium bg-gradient-to-r from-teal-600 to-teal-800 hover:from-teal-500 hover:to-teal-700 rounded"
                disabled={isLoading} 
              />
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
