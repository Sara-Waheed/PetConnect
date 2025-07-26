import React, { useState } from 'react';
import axios from 'axios';
import { Eye, EyeOff } from "lucide-react";

const ResetPassword = ({ otp, onResetSuccessful, onClose, role}) => {
  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(''); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);
    try {

      const response = await axios.post('http://localhost:5000/auth/reset-password',
        { token: otp, newPassword: formData.password, role }
      );
      if (response.data.success) {
        onResetSuccessful();
      } else {
        setError(response.data.message || 'Error resetting password. Please try again.');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      setError('An error occurred. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-sm px-8 pt-6 pb-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-500 text-2xl"
          aria-label="Close"
        >
          &times;
        </button>
        <div className="text-center m-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-orange-700 bg-clip-text text-transparent">
            Reset Password
          </h2>
        </div>
        <p className="text-gray-800 my-3">Please provide a new password.</p>
        <form onSubmit={handleSubmit} className="space-y-5 text-gray-800">
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="New Password"
              className={`w-full p-3 border ${
                error ? 'border-red-500' : 'border-gray-600'
              } rounded pr-10 focus:outline-none focus:border-orange-500`}
              required
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute inset-y-0 right-3 flex items-center"
              tabIndex="-1"
            >
              {showPassword ? <Eye className="w-5 h-5 text-gray-600" /> : <EyeOff className="w-5 h-5 text-gray-600" />}
            </button>
          </div>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm Password"
              className={`w-full p-3 border ${
                error ? 'border-red-500' : 'border-gray-600'
              } rounded pr-10 focus:outline-none focus:border-orange-500`}
              required
            />
            <button
              type="button"
              onClick={toggleConfirmPasswordVisibility}
              className="absolute inset-y-0 right-3 flex items-center"
              tabIndex="-1"
            >
              {showConfirmPassword ? <Eye className="w-5 h-5 text-gray-500" /> : <EyeOff className="w-5 h-5 text-gray-500" />}
            </button>
          </div>
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          <button
            type="submit"
            className={`w-full p-3 mt-4 text-white font-medium bg-gradient-to-r from-teal-600 to-teal-800 hover:from-teal-500 hover:to-teal-700 rounded ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;  