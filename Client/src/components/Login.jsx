import React, { useState } from 'react';
import { Eye, EyeOff, ChevronDown } from "lucide-react";
import axios from 'axios';

const Login = ({ notVerified, onUserRegisterClick, onForgotPasswordClick, onLoginSuccessful, onClose }) => {
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: '',
  });

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };


const handleLogin = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  try {
    console.log("role on fronend login: ", formData.role);
    const response = await axios.post('http://localhost:5000/auth/login', formData, {
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });

    if (response.status === 200) {
      onLoginSuccessful();
    } else {
      setErrorMessage('Invalid email or password');
    }
  } catch (error) {
    if (error.response) {
      setErrorMessage(error.response.data.message || 'Invalid email or password');
  
      // Check if the error is a 403 (email not verified)
      if (error.response.status === 403) {
        if (error.response.data.message === 'email_not_verified') {
          notVerified(formData.email, formData.role); // Trigger the email verification flow
        } else if (error.response.data.message === 'account_restricted') {
          setErrorMessage('Your account has been restricted. Please contact support.'); // Show account restricted message
        }
      }
    } else {
      // Other errors (network, timeout, etc.)
      setErrorMessage('Something went wrong, try again later.');
    }
  }  
  setIsLoading(false);
};


  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white rounded-md shadow-lg w-full md:max-w-md h-full md:h-auto px-4 sm:px-6 pt-4 sm:pt-6 relative">
          <div className="absolute top-0 left-0 w-full flex justify-end">
            <button
              className="text-gray-600 text-2xl py-2 px-4 text-right hover:text-gray-500"
              onClick={onClose}
            >
              &times;
            </button>
            </div>
            <div className="flex justify-center pt-6">
              <span className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-orange-700 bg-clip-text text-transparent">
                PetConnect
              </span>
            </div>

            <div>
              <div className="text-gray-800 my-7 mx-4">
                <p className="mb-2">Please provide login credentials below.</p>
                <form onSubmit={handleLogin} className="space-y-4 text-gray-800">
                  <div className="relative">
                    <input
                      type="text"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Email"
                      className="w-full p-2 border border-gray-600 rounded focus:outline-none focus:border-orange-500"
                      required
                    />
                  </div>

                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
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

                  {/* Role Dropdown Field */}
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

                  <div className="flex justify-end">
                    <button
                      type="button"
                      className="text-teal-600 hover:text-teal-500"
                      onClick={onForgotPasswordClick}
                    >
                      Forgot Password?
                    </button>
                  </div>

                  {errorMessage && (
                    <p className="text-red-500 text-center">{errorMessage}</p>
                  )}

                  <button
                    type="submit"
                    className={`w-full p-2 text-white font-medium bg-gradient-to-r from-teal-600 to-teal-800 
                      hover:from-teal-500 hover:to-teal-700 rounded ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                    disabled={isLoading}
                    onClick={handleLogin}
                  >
                    {isLoading ? "Logging in..." : "Login"}
                  </button>

                  <button
                    type="button"
                    className="my-4 pb-10 text-teal-600 hover:text-teal-500"
                    onClick={onUserRegisterClick}
                  >
                    Don't have an account? Register
                  </button>
                </form>
              </div>
            </div>

        </div>
      </div>
    </>
  );
};

export default Login;
