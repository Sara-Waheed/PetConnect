import React, { useState } from "react";
import axios from "axios";
import petImage from '../assets/pet.webp'
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();  // Initialize navigate

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {  
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:5000/auth/admin/login",
        { email, password },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      navigate('/admin');  // Navigate to the admin dashboard
    } catch (err) {
      alert(err.response.data.message);
    }
  };

  return (
    <div className="min-h-screen bg-teal-50 flex flex-col md:flex-row">
      <div className="flex flex-col justify-center items-center w-full md:w-1/2">
        <div className="bg-white border border-gray-300 shadow-md rounded-lg w-full md:max-w-md h-full md:h-auto p-4 sm:p-6 pt-4 sm:pt-6">
          <form onSubmit={handleSubmit}>
            <div className="flex justify-center pt-3">
              <span className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-orange-700 bg-clip-text text-transparent mb-4">
                Admin Login
              </span>
            </div>
            <div className="mb-4">
              <label className="text-gray-700">Enter your email:</label>
              <input
                type="email"
                value={email}
                placeholder="Email"
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-2 border border-gray-600 rounded focus:outline-none focus:border-orange-500"
              />
            </div>
            <div className="mb-4">
              <label className="text-gray-700">Enter your password:</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full p-2 border border-gray-600 rounded pr-10 focus:outline-none focus:border-orange-500"
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
            <div className="flex justify-center">
              <button
                type="submit"
                className="bg-teal-600 text-white p-2 w-full max-w-xs mt-2 rounded hover:bg-teal-700 transition duration-300"
              >
                Login
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Right Side - Image */}
      <div
        className="hidden md:flex w-full md:w-1/2 bg-cover bg-center"
        style={{ backgroundImage: `url(${petImage})` }}
      ></div>
    </div>
  );
};

export default AdminLogin;
