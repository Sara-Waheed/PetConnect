import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Spinner from "./Spinner"; // Import your loading spinner component

const PendingProvidersRequests = () => {
  const [vets, setVets] = useState([]);
  const [groomers, setGroomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const fetchVetsAndGroomers = async () => {
    try {
      const response = await axios.get("http://localhost:5000/auth/clinic/vets-groomers", {
        withCredentials: true,
      });
      

      if (response.data.success) {
        setVets(response.data.vets);
        setGroomers(response.data.groomers);
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
    fetchVetsAndGroomers();
  }, []);

  const handleStatusUpdate = async (providerId, type, status) => {
    try {
      const response = await axios.post("http://localhost:5000/auth/clinic/update-provider-status", {
        providerId,
        status,
        type,
      });

      if (response.data.success) {
        fetchVetsAndGroomers(); // Refresh the list
      }
    } catch (error) {
      console.error(`Error updating ${type} status:`, error);
    }
  };

  const handleProviderClick = (provider_id, role) => {
    navigate(`/clinic/requests/${role}/${provider_id}`);
  };

  const renderTable = (providers, type) => (
    <div className="mb-8">
      <h3 className="text-xl font-semibold mb-4 text-orange-800 capitalize">{type} Requests</h3>
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
              {providers.map((provider) => (
                <tr key={provider._id} className="hover:bg-gray-50 cursor-pointer"
                onClick={() => handleProviderClick(provider._id, type)}>
                  <td className="border border-gray-200 px-4 py-2 text-center">{provider.name}</td>
                  <td className="border border-gray-200 px-4 py-2 text-center">{provider.city}</td>
                  <td className="border border-gray-200 px-4 py-2 text-center">{provider.phone}</td>
                  <td className="border border-gray-200 px-4 py-2 text-center">{provider.yearsOfExperience}</td>
                  <td className="border border-gray-200 px-4 py-2 text-center">
                    <div className="flex justify-center space-x-2">
                      <button
                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusUpdate(provider._id, type, "verified");
                        }}
                      >
                        Approve
                      </button>
                      <button
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusUpdate(provider._id, type, "rejected");
                        }}
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Stacked details for small screens */}
        <div className="md:hidden">
          {providers.map((provider) => (
            <div
              key={provider._id}
              className="border-b border-gray-200 p-4 mb-4 hover:bg-gray-50"
            >
              <div className="flex justify-between">
                <div className="font-bold text-orange-800">Name:</div>
                <div>{provider.name}</div>
              </div>
              <div className="flex justify-between">
                <div className="font-bold text-orange-800">City:</div>
                <div>{provider.city}</div>
              </div>
              <div className="flex justify-between">
                <div className="font-bold text-orange-800">Phone:</div>
                <div>{provider.phone}</div>
              </div>
              <div className="flex justify-between">
                <div className="font-bold text-orange-800">Experience:</div>
                <div>{provider.yearsOfExperience}</div>
              </div>
              <div className="flex justify-evenly mt-2 space-x-2">
                <button
                  className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition"
                  onClick={(e) => {
                    e.stopPropagation(); 
                    handleStatusUpdate(provider._id, type, "verified");
                  }}
                >
                  Approve
                </button>
                <button
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStatusUpdate(provider._id, type, "rejected");
                  }}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {providers.length === 0 && !isLoading && (
        <p className="text-center text-gray-500 mt-4">No pending {type} requests available.</p>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="p-4 mx-auto max-w-4xl">
      <h2 className="text-xl md:text-2xl font-bold mb-6">Pending Service Providers Requests</h2>
      {renderTable(vets, "vet")}
      {renderTable(groomers, "groomer")}
    </div>
  );
};

export default PendingProvidersRequests;
