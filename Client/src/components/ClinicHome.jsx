// src/pages/ClinicHome.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

const ClinicHome = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-3xl font-bold text-gray-700 mb-6">Clinic Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Pending Requests */}
        <div className="bg-gray-200 p-4 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-gray-800 mb-3">Pending Requests</h3>
          <p className="text-gray-600">You have 3 pending pet service requests.</p>
        </div>

        {/* Registered Staff */}
        <div className="bg-green-200 p-4 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-gray-800 mb-3">Registered Staff</h3>
          <p className="text-gray-600">You have 10 registered staff members.</p>
        </div>
      </div>

      <div className="mt-10">
        {/* Quick Actions */}
        <h3 className="text-2xl font-semibold text-gray-700 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* View Staff */}
          <div className="bg-yellow-300 p-6 rounded-lg shadow-md hover:bg-yellow-400 transition">
            <h4 className="text-xl text-gray-800 mb-3">View Staff Details</h4>
            <button
              onClick={() => navigate("/clinic/staff")}
              className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
            >
              View Staff
            </button>
          </div>

          {/* Manage Requests */}
          <div className="bg-teal-300 p-6 rounded-lg shadow-md hover:bg-teal-400 transition">
            <h4 className="text-xl text-gray-800 mb-3">Manage Requests</h4>
            <button
              onClick={() => navigate("/clinic/requests")}
              className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition"
            >
              Manage Requests
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClinicHome;
