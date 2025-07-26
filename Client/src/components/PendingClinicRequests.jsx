import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Spinner from "./Spinner"; // Import your loading spinner component

export const PendingClinicRequests = () => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Add loading state
  const navigate = useNavigate();

  const fetchPendingRequests = async () => {
    try {
      const response = await axios.get("http://localhost:5000/auth/admin/pending-clinics");
      setPendingRequests(response.data.clinics);
    } catch (error) {
      console.error("Error fetching pending requests:", error);
    } finally {
      setIsLoading(false); // Set loading to false once the data is fetched
    }
  };

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const handleClinicClick = (clinicName) => {
    navigate(`/admin/requests/clinic/${clinicName}`);
  };

  const handleStatusUpdate = async (clinicId, status) => {
    try {
      const response = await axios.post("http://localhost:5000/auth/admin/update-clinic-status", {
        clinicId,
        status,
      });

      if (response.data.success) {
      }
      fetchPendingRequests();
    } catch (error) {
      console.error("Error updating clinic status:", error);
    }
  };

  return (
    <div className="overflow-auto p-4 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Pending Clinic Requests</h2>

      {/* Table for medium and larger screens */}
      <div className="hidden md:block">
        <table className="table-auto w-full border-collapse border border-gray-200 shadow-md">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-200 px-4 py-2 text-teal-800 text-center">Clinic Name</th>
              <th className="border border-gray-200 px-4 py-2 text-teal-800 text-center">City</th>
              <th className="border border-gray-200 px-4 py-2 text-teal-800 text-center">Phone</th>
              <th className="border border-gray-200 px-4 py-2 text-teal-800 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="4">
                  <Spinner /> 
                </td>
              </tr>
            ) : (
              pendingRequests.map((clinic) => (
                <tr
                  key={clinic._id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleClinicClick(clinic.clinicName)}
                >
                  <td className="border border-gray-200 px-4 py-2 text-center">{clinic.clinicName}</td>
                  <td className="border border-gray-200 px-4 py-2 text-center">{clinic.city}</td>
                  <td className="border border-gray-200 px-4 py-2 text-center">{clinic.phone}</td>
                  <td className="border border-gray-200 px-4 py-2 text-center">
                    <div className="flex justify-center space-x-2">
                      <button
                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent row click
                          handleStatusUpdate(clinic._id, "verified");
                        }}
                      >
                        Approve
                      </button>
                      <button
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent row click
                          handleStatusUpdate(clinic._id, "rejected");
                        }}
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Stacked details for small screens */}
      <div className="md:hidden">
        {isLoading ? (
          <div className="text-center">
            <Spinner /> {/* Show spinner when loading */}
          </div>
        ) : (
          pendingRequests.map((clinic) => (
            <div
              key={clinic._id}
              className="border-b border-gray-200 p-4 mb-4 hover:bg-gray-50 cursor-pointer"
              onClick={() => handleClinicClick(clinic.clinicName)}
            >
              <div className="flex space-x-2">
                <div className="font-bold text-orange-800">Clinic Name:</div>
                <div>{clinic.clinicName}</div>
              </div>
              <div className="flex space-x-2">
                <div className="font-bold text-orange-800">City:</div>
                <div>{clinic.city}</div>
              </div>
              <div className="flex space-x-2">
                <div className="font-bold text-orange-800">Phone:</div>
                <div>{clinic.phone}</div>
              </div>
              <div className="flex justify-evenly mt-2 space-x-2">
                <button
                  className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent row click
                    handleStatusUpdate(clinic._id, "verified");
                  }}
                >
                  Approve
                </button>
                <button
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent row click
                    handleStatusUpdate(clinic._id, "rejected");
                  }}
                >
                  Reject
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {pendingRequests.length === 0 && !isLoading && (
        <p className="text-center text-gray-500 mt-4">No pending requests available.</p>
      )}
    </div>
  );
};

export default PendingClinicRequests;
