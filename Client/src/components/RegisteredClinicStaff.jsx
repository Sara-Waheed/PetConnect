import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Phone, User, Mail, MapPin } from "lucide-react";
import Spinner from "./Spinner";

const RegisteredClinicStaff = () => {
  const [vets, setVets] = useState([]);
  const [groomers, setGroomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // New state for loading
  const navigate = useNavigate();

  // Fetch vets and groomers data for a specific clinic
  useEffect(() => {
    const fetchClinicStaff = async () => {
      try {
        setIsLoading(true); // Start loading
        const response = await axios.get(`http://localhost:5000/auth/clinic/staff`, {
          withCredentials: true,
        });

        const { vets, groomers } = response.data;
        setVets(vets);
        setGroomers(groomers);
      } catch (error) {
        console.error("Error fetching clinic staff:", error);
      } finally {
        setIsLoading(false); // End loading
      }
    };

    fetchClinicStaff();
  }, []);

  const handleGroomerClick = (userId) => {
    navigate(`/clinic/staff/groomer/${userId}`);
  };

  const handleVetClick = (userId) => {
    navigate(`/clinic/staff/vet/${userId}`);
  };

  return (
    <div className="overflow-auto p-4 max-w-4xl mx-auto">
      <h1 className="text-xl md:text-2xl font-bold text-gray-800 md:mb-4 lg:mb-6">
        Registered Clinic Staff
      </h1>

      {/* Display Vets */}
      <div>
        <h2 className="text-lg font-semibold text-orange-800 mb-2">Vets</h2>
        {isLoading ? (
          <div className="flex justify-center items-center py-4">
            <Spinner className="flex justify-center text-center p-4" />
          </div>
        ) : vets.length > 0 ? (
          <div>
            {/* Table for medium and larger screens */}
            <div className="hidden md:block">
              <table className="table-auto w-full border-collapse border border-gray-200 shadow-md">
                <thead>
                  <tr className="bg-gray-100 space-y-2">
                    <th className="border border-gray-200 px-4 py-2 text-teal-800 text-center">Name</th>
                    <th className="border border-gray-200 px-4 py-2 text-teal-800 text-center">Email</th>
                    <th className="border border-gray-200 px-4 py-2 text-teal-800 text-center">Phone</th>
                    <th className="border border-gray-200 px-4 py-2 text-teal-800 text-center">City</th>
                  </tr>
                </thead>
                <tbody>
                  {vets.map((vet) => (
                    <tr key={vet._id} onClick={() => handleVetClick(vet._id)} className="hover:bg-gray-50 cursor-pointer">
                      <td className="border border-gray-200 px-4 py-2">
                        <div className="flex items-center">
                          <User className="mr-2 text-teal-600" />
                          {vet.name}
                        </div>
                      </td>
                      <td className="border border-gray-200 px-4 py-2">
                        <div className="flex items-center">
                          <Mail className="mr-2 text-orange-600" />
                          {vet.email}
                        </div>
                      </td>
                      <td className="border border-gray-200 px-4 py-2">
                        <div className="flex items-center">
                          <Phone className="mr-2 text-blue-600" />
                          {vet.phone}
                        </div>
                      </td>
                      <td className="border border-gray-200 px-4 py-2">
                        <div className="flex items-center">
                            <MapPin className="mr-2 text-orange-600" />
                            {vet.city}
                        </div>
                        </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">No registered vets available for this clinic.</p>
        )}
      </div>

      <hr className="my-6 border-t border-gray-300" />

      {/* Display Groomers */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold text-orange-800 mb-2">Groomers</h2>
        {isLoading ? (
          <div className="flex justify-center items-center py-4">
            <Spinner className="flex justify-center text-center p-4" />
          </div>
        ) : groomers.length > 0 ? (
          <div>
            <div className="hidden md:block">
              <table className="table-auto w-full border-collapse border border-gray-200 shadow-md">
                <thead>
                  <tr className="bg-gray-100 space-y-2">
                    <th className="border border-gray-200 px-4 py-2 text-teal-800 text-center">Name</th>
                    <th className="border border-gray-200 px-4 py-2 text-teal-800 text-center">Email</th>
                    <th className="border border-gray-200 px-4 py-2 text-teal-800 text-center">Phone</th>
                    <th className="border border-gray-200 px-4 py-2 text-teal-800 text-center">City</th>
                  </tr>
                </thead>
                <tbody>
                  {groomers.map((groomer) => (
                    <tr key={groomer._id} onClick={() => handleGroomerClick(groomer._id)} className="hover:bg-gray-50 cursor-pointer">
                      <td className="border border-gray-200 px-4 py-2">
                        <div className="flex items-center">
                          <User className="mr-2 text-teal-600" />
                          {groomer.name}
                        </div>
                      </td>
                      <td className="border border-gray-200 px-4 py-2">
                        <div className="flex items-center">
                          <Mail className="mr-2 text-orange-600" />
                          {groomer.email}
                        </div>
                      </td>
                      <td className="border border-gray-200 px-4 py-2">
                        <div className="flex items-center">
                          <Phone className="mr-2 text-blue-600" />
                          {groomer.phone}
                        </div>
                      </td>
                      <td className="border border-gray-200 px-4 py-2">
                      <div className="flex items-center">
                            <MapPin className="mr-2 text-red-600" />
                            {groomer.city}
                        </div>
                        </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">No registered groomers available for this clinic.</p>
        )}
      </div>
    </div>
  );
};

export default RegisteredClinicStaff;
