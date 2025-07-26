import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Spinner from './Spinner';
import { Eye, EyeOff, ChevronDown } from 'lucide-react';
import { useNavbar } from './NavbarContext';

const SitterProfile = () => {
  const { handleShowComponent, userRole } = useNavbar();
  const [showPassword, setShowPassword] = useState(false);
  const [sitterData, setSitterData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    phone: '',
    city: '',
    sitterAddress: '',
    password: '',
    confirmPassword: '',
  });

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/auth/sitter/profile', {
          withCredentials: true,
        });
        setSitterData(response.data.sitter);
        setFormData({
          phone: response.data.sitter.phone || '',
          email: response.data.sitter.email || '',
          city: response.data.sitter.city || '',
          sitterAddress: response.data.sitter.sitterAddress || '',
          password: '',
          confirmPassword: '',
          name: response.data.sitter.name || '',
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  const handleSave = async () => {
    if (!validateEmail(formData.email)) {
      setError('Invalid email format.');
      return;
    }

    try {
      setIsLoading(true);
      console.log("Sending formData:", formData);

      const filteredData = {};

      Object.keys(formData).forEach((key) => {
        if (formData[key] !== "") {
          filteredData[key] = formData[key];
        }
      });

      await axios.put('http://localhost:5000/auth/sitter/update-profile', filteredData, { withCredentials: true });
      setIsEditing(false);
      if (formData.email !== sitterData.email) {
        handleShowComponent('verifyOTP', 'email', formData.email, '', 'sitter', true);
      }
      setError('');
      setSitterData({
        ...sitterData,
        phone: formData.phone,
        email: formData.email,
        name: formData.name,
        city: formData.city,
        sitterAddress: formData.sitterAddress,
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setError(''); // Clear errors when toggling edit mode
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData({ ...formData, [name]: value });

    if (name === 'phone') {
      if (!/^03\d{9}$/.test(value)) {
        setError('Invalid phone number format. Example: 03001234567');
      } else {
        setError(''); // Clear error if the phone number is valid
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

    if (name === 'confirmPassword') {
      if (value.length === 0) {
        setError('');
      } else if (value !== formData.password) {
        setError('Passwords do not match.');
      } else {
        setError('');
      }
    }

    if (name === 'email') {
      if (!validateEmail(value)) {
        setError('Invalid email format.');
      } else {
        setError('');
      }
    }
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

  return (
    <div className="max-w-4xl mx-auto my-10 p-5 bg-orange-200 shadow-lg rounded-lg">
      {!sitterData ? (
        <div className="flex justify-center items-center p-4 m-20">
          <Spinner />
        </div>
      ) : (
        <>
          <h2 className="text-2xl font-bold text-teal-700 mb-6 text-center">Profile</h2>
          <div className="max-w-2xl mx-auto">
            <div>
              <label className="block text-md font-medium text-black">Name</label>
              <input
                type="text"
                name="name"
                value={isEditing ? formData.name : sitterData.name}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="mt-1 mb-4 p-2 w-full bg-white border rounded-md"
              />
            </div>
            <div>
              <label className="block text-md font-medium text-black">Phone</label>
              <input
                type="number"
                name="phone"
                value={isEditing ? formData.phone : sitterData.phone}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="mt-1 mb-4 p-2 w-full bg-white border rounded-md"
              />
            </div>
            <div>
              <label className="block text-md font-medium text-black">Email</label>
              <input
                type="email"
                name="email"
                value={isEditing ? formData.email : sitterData.email}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="mt-1 mb-4 p-2 w-full bg-white border rounded-md"
              />
            </div>
            <div className="relative">
                <label className="block text-md font-medium text-black">City</label>
                <select
                    name="city"
                    value={isEditing ? formData.city : sitterData.city}
                    onChange={handleInputChange}
                    className="w-full p-2 mt-1 mb-4 border border-gray-600 rounded focus:outline-none focus:border-orange-500 appearance-none bg-white"
                    disabled={!isEditing}
                    required
                >
                    <option value="">Select City</option>
                    <option value="Islamabad">Islamabad</option>
                    <option value="Rawalpindi">Rawalpindi</option>
                    <option value="Karachi">Karachi</option>
                    <option value="Lahore">Lahore</option>
                </select>
                <span className="absolute inset-y-0 top-3 right-3 flex items-center pointer-events-none text-gray-600">
                    <ChevronDown />
                </span>
            </div>

            <div>
              <label className="block text-md font-medium text-black">Address</label>
              <textarea
                name="sitterAddress"
                value={isEditing ? formData.sitterAddress : sitterData.sitterAddress}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="mt-1 mb-4 p-2 w-full bg-white border rounded-md"
              />
            </div>
            {isEditing && (
              <>
                <div>
                  <label className="block text-md font-medium text-black">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="mt-1 mb-4 p-2 w-full bg-white border rounded-md"
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
                  <label className="block text-md font-medium text-black">Confirm Password</label>
                  <div className="relative">
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="mt-1 mb-4 p-2 w-full bg-white border rounded-md"
                    />
                  </div>
                </div>
              </>
            )}
          </div>
          {error && <p className="text-red-500 text-md text-center mt-1">{error}</p>}
          <div className="max-w-2xl mx-auto mt-6 flex justify-between items-center">
            <button
              onClick={handleEditToggle}
              className={`px-4 py-2 w-1/3 text-white rounded-lg ${
                isEditing
                  ? 'bg-gray-500 hover:bg-gray-600'
                  : 'bg-gradient-to-r from-orange-500 to-orange-800 hover:from-orange-400 hover:to-orange-700'
              }`}
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>

            {isEditing && (
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="px-4 py-2 w-1/3 bg-gradient-to-r from-teal-500 to-teal-800 hover:from-teal-400 hover:to-teal-700 text-white rounded-lg"
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default SitterProfile;
