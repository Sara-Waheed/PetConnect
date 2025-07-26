import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Spinner from "./Spinner"; // Import your loading spinner component

const PendingSitterRequests = () => {
  const [sitter, setSitter] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const fetchSitters = async () => {
    try {
      const response = await axios.get("http://localhost:5000/auth/admin/pending-sitters");

      if (response.data.success) {
        setSitter(response.data.sitters);
      } else {
        console.warn("No pending requests found:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching vets and groomers:", error);
    } finally {
      setIsLoading(false);
    }
  };


  useEffect(() => {
    fetchSitters();
  }, []);

  const handleStatusUpdate = async (sitterId, status) => {
    try {
      const response = await axios.post("http://localhost:5000/auth/admin/update-sitter-status", {
        sitterId,
        status,
      });

      if (response.data.success) {
        fetchSitters(); // Refresh the list
      }
    } catch (error) {
      console.error(`Error updating Sitter status:`, error);
    }
  };

  const handleSitterClick = (sitterId) => {
    navigate(`/admin/requests/sitter/${sitterId}`);
  };

  return (
    <div className="p-4 mx-auto max-w-4xl">
      <h2 className="text-xl md:text-2xl font-bold mb-6">Pending Pet Sitter Requests</h2>
      <div className="mb-8">
        <div className="overflow-auto">
          {/* Table for medium and larger screens */}
          <div className="hidden md:block">
            <table className="table-auto w-full border-collapse border border-gray-200 shadow-md">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-200 px-4 py-2 text-teal-800 text-center">Name</th>
                  <th className="border border-gray-200 px-4 py-2 text-teal-800 text-center">City</th>
                  <th className="border border-gray-200 px-4 py-2 text-teal-800 text-center">Phone</th>
                  <th className="border border-gray-200 px-4 py-2 text-teal-800 text-center">Years of Experience</th>
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
                  sitter.map((sitter) => (
                    <tr
                      key={sitter._id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleSitterClick(sitter._id)}
                    >
                      <td className="border border-gray-200 px-4 py-2 text-center">{sitter.name}</td>
                      <td className="border border-gray-200 px-4 py-2 text-center">{sitter.city}</td>
                      <td className="border border-gray-200 px-4 py-2 text-center">{sitter.phone}</td>
                      <td className="border border-gray-200 px-4 py-2 text-center">{sitter.yearsOfExperience}</td>
                      <td className="border border-gray-200 px-4 py-2 text-center">
                        <div className="flex justify-center space-x-2">
                          <button
                            className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusUpdate(sitter._id, "verified");
                            }}
                          >
                            Approve
                          </button>
                          <button
                            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusUpdate(sitter._id, "rejected");
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
                sitter.map((sitter) => (
                <div
                    key={sitter._id}
                    className="border-b border-gray-200 p-4 mb-4 hover:bg-gray-50"
                >
                    <div className="flex justify-between">
                    <div className="font-bold text-orange-800">Name:</div>
                    <div>{sitter.name}</div>
                    </div>
                    <div className="flex justify-between">
                    <div className="font-bold text-orange-800">City:</div>
                    <div>{sitter.city}</div>
                    </div>
                    <div className="flex justify-between">
                    <div className="font-bold text-orange-800">Phone:</div>
                    <div>{sitter.phone}</div>
                    </div>
                    <div className="flex justify-between">
                    <div className="font-bold text-orange-800">Experience:</div>
                    <div>{sitter.yearsOfExperience}</div>
                    </div>
                    <div className="flex justify-evenly mt-2 space-x-2">
                    <button
                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition"
                        onClick={(e) => {
                        e.stopPropagation(); 
                        handleStatusUpdate(sitter._id, "verified");
                        }}
                    >
                        Approve
                    </button>
                    <button
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                        onClick={(e) => {
                        e.stopPropagation();
                        handleStatusUpdate(sitter._id, "rejected");
                        }}
                    >
                        Reject
                    </button>
                    </div>
                </div>
                ))
            )}
          </div>
        </div>
        {sitter.length === 0 && !isLoading && (
          <p className="text-center text-gray-500 mt-4">No pending Sitters requests available.</p>
        )}
      </div>
    </div>
  );
};

export default PendingSitterRequests;
