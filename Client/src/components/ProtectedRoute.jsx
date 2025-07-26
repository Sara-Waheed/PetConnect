import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";

const ProtectedRoute = ({ component: Component, ...rest }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null: unknown, true/false: known
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      try {
        // Make a request to the backend to verify the token
        await axios.get("http://localhost:5000/auth/admin/verify", {
          withCredentials: true, // Send cookies
        });
        setIsAuthenticated(true);
      } catch (err) {
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    verifyToken();
  }, []);

  // Show a loader or placeholder while checking authentication
  if (loading) return <div>Loading...</div>;

  // Redirect to login if not authenticated
  return isAuthenticated ? <Component {...rest} /> : <Navigate to="/admin/login" />;
};

export default ProtectedRoute;
