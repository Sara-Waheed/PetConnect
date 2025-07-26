import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const NavbarContext = createContext();

export const NavbarProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const [activeComponent, setActiveComponent] = useState(null); // Track the active component (modal)
  const [otpType, setOtpType] = useState(''); // Store OTP type for verification
  const [userEmail, setUserEmail] = useState(''); // Store email for OTP
  const [otpCode, setOtpCode] = useState('');
  const [role, setRole] = useState('');
  const [userRole, setUserRole] = useState('');
  const [update, setUpdate] = useState(false);

  const checkLoginStatus = async () => {
    try {
      const response = await axios.get('http://localhost:5000/auth/profile', {
        withCredentials: true,
      });
  
      if (response.data.success === false && response.data.message === "User not authenticated") {
        setIsLoggedIn(false);
      } else if (response.data.success === true) {
        setIsLoggedIn(true);
        setUserRole(response.data.user.role);
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        setIsLoggedIn(false);
      } else {
        console.warn("Server unreachable or unexpected error:", error.message);
      }
    }
  };


  useEffect(() => {
    checkLoginStatus();
  }, []);

  const handleShowComponent = (component, type = '', email = '', otpCode = '', role = '', update) => {
    console.log('setting role to:', role);
    setActiveComponent(component);
    setOtpType(type); // Set OTP type if passed (for OTP components)
    setUserEmail(email); // Set user email if passed (for OTP components)
    setOtpCode(otpCode);
    setRole(role);
    setUpdate(update);
  };

  const handleHideComponents = () => {
    setActiveComponent(null); // Hide the modal
  };

  return (
    <NavbarContext.Provider value={{ isLoggedIn, update, userRole, setIsLoggedIn, activeComponent, checkLoginStatus, handleShowComponent, handleHideComponents, otpType, userEmail, otpCode, role }}>
      {children}
    </NavbarContext.Provider>
  );
};

// Custom hook to use Navbar context
export const useNavbar = () => {
  return useContext(NavbarContext);
};
