import React, { useState } from 'react';
import {ChevronDown } from "lucide-react";
import axios from 'axios';

const ForgotPassword = ({ notVerified, onMailSuccess, onClose }) => {
  const [formData, setFormData] = useState({
    email: '',
    role: '',
  });  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
      
    try {
      const response = await axios.post('http://localhost:5000/auth/forgot-password', formData);
  
      if (response.data.success) {
        onMailSuccess(formData.email, formData.role);
      } else {
        setMessage('Email not found. Try again!');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('An error occurred. Please try again later.');
      if (error.response.status === 403) {
        notVerified(email);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white  rounded-lg shadow-lg w-full min-h-96 max-w-xs sm:max-w-sm md:max-w-sm px-4 sm:px-6 pt-4 sm:pt-6 relative">
        <div className="absolute top-0 left-0 w-full flex justify-end">
          <button onClick={onClose} className="w-full text-gray-600 hover:text-gray-500 text-2xl py-2 px-4 text-right">
            &times;
          </button>
        </div>
        <div className="flex justify-center pt-6">
        <span className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-orange-700 bg-clip-text text-transparent">
              PetConnect
            </span>
        </div>
        <div>
          <div className="text-gray-800 my-5">
            <p className="mb-4">Please provide email to reset password.</p>
            <form onSubmit={handleSubmit} className="space-y-6">
              <input
                type="email"
                id="email"
                name='email'
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                className="w-full p-2 border border-gray-600 rounded focus:outline-none focus:border-orange-500"
                required
              />
              <div className="relative">
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-600 rounded bg-white focus:outline-none focus:border-orange-500 appearance-none"
                  required
                >
                  <option value="" disabled>
                    Select Role
                  </option>
                  <option value="pet_owner">Pet Owner</option>
                  <option value="clinic">Clinic</option>
                  <option value="vet">Vet</option>
                  <option value="groomer">Groomer</option>
                  <option value="sitter">Sitter</option>
                </select>
                <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-600">
                  <ChevronDown />
                </span>
              </div>
              
              <button
                type="submit"
                className={`w-full p-2 text-white font-medium bg-gradient-to-r from-teal-600 to-teal-800 hover:from-teal-500 hover:to-teal-700 rounded ${
                    isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                }`}
                disabled={isSubmitting}
                >
                {isSubmitting ? 'Processing...' : 'Send Reset Link'}
                </button>

            </form>
            {message && <p className="mt-4 text-red-500">{message}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
