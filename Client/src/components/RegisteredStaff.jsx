import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Phone, User, Mail, MapPin } from "lucide-react";
import Spinner from "./Spinner";

const RegisteredStaff = () => {
  const [users, setUsers] = useState({ vets: [], groomers: [], sitters: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showRestrictConfirm, setShowRestrictConfirm] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const [vetResponse, groomerResponse, sitterResponse] = await Promise.all([
          axios.get("http://localhost:5000/auth/admin/get-vets"),
          axios.get("http://localhost:5000/auth/admin/get-groomers"),
          axios.get("http://localhost:5000/auth/admin/get-sitters"),
        ]);

        setUsers({
          vets: vetResponse.data.vets,
          groomers: groomerResponse.data.groomers,
          sitters: sitterResponse.data.sitters,
        });
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleRestrict = async () => {
    try {
      const response = await axios.post(
        `http://localhost:5000/auth/admin/restrict/${selectedUser._id}`,
        { userType: selectedUser.type }
      );
  
      setMessage(response.data.message);
  
      setUsers((prevUsers) => ({
        ...prevUsers,
        [selectedUser.type]: prevUsers[selectedUser.type].map((user) =>
          user._id === selectedUser._id ? { ...user, restricted: !user.restricted } : user
        ),
      }));
  
      setShowRestrictConfirm(false);
    } catch (error) {
      console.error("Error restricting user:", error);
    }
  };
  
  const handleRestrictClick = (user, userType) => {
    setSelectedUser({ ...user, type: userType });
    setShowRestrictConfirm(true);
  };

  const handleUserClick = (userId, userType) => {
    if(userType === "sitters"){
      navigate(`/admin/service-providers/sitter/${userId}`);
    } else if(userType === "groomers"){
      navigate(`/admin/service-providers/groomer/${userId}`);
    } else{
      navigate(`/admin/service-providers/vet/${userId}`);
    }
  };

  const renderTableSection = (title, userList, userType) => (
    <div className="mb-6">
      <h2 className="hidden md:block text-lg font-semibold text-orange-800">{title}</h2>
      <div className="hidden md:block">
        <table className="table-auto w-full border-collapse border border-gray-200 shadow-md">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-200 px-4 py-2 text-teal-800 text-left">Name</th>
              <th className="border border-gray-200 px-4 py-2 text-teal-800 text-left">Email</th>
              <th className="border border-gray-200 px-4 py-2 text-teal-800 text-left">Phone</th>
              <th className="border border-gray-200 px-4 py-2 text-teal-800 text-left">City</th>
              <th className="border border-gray-200 px-4 py-2 text-teal-800 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="5" className="text-center">
                  <Spinner />
                </td>
              </tr>
            ) : (
              userList.map((user) => (
                <tr key={user._id} onClick={() => handleUserClick(user._id, userType)} className="hover:bg-gray-50 cursor-pointer">
                  <td className="border px-4 py-2">
                    <div className="inline-flex items-center">
                      <User className="mr-2 text-teal-600" /> {user.name}
                    </div>
                  </td>
                  <td className="border px-2 py-2">
                    <div className="inline-flex items-center">
                      <Mail className="mr-2 text-orange-600" /> {user.email}
                    </div>
                  </td>
                  <td className="border px-4 py-2">
                    <div className="inline-flex items-center">
                      <Phone className="mr-2 text-blue-600" /> {user.phone}
                    </div>
                  </td>
                  <td className="border px-4 py-2">
                    <div className="inline-flex items-center">
                      <MapPin className="mr-2 text-red-600" /> {user.city}
                    </div>
                  </td>
                  <td className="border border-gray-200 px-4 py-2">
                    <button
                      onClick={() => handleRestrictClick(user, userType)}
                      className={`text-sm font-medium px-3 py-1 rounded ${
                        user.restricted
                         ? "bg-teal-600 text-white hover:bg-teal-700"
                          : "bg-red-500 text-white hover:bg-red-600"
                      }`}
                    >
                      {user.restricted ? "Unrestrict" : "Restrict"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {userList.length === 0 && !isLoading && (
          <p className="text-center text-gray-500 m-4">No {title} available.</p>
        )}
      </div>
    </div>
  );

  const renderMobileSection = (title, userList, userType) => (
    <div>
      <h2 className="text-lg font-semibold text-orange-800 mt-4 mb-2">{title}</h2>
      {userList.map((user) => (
        <div key={user._id} className="border border-gray-200 rounded-lg p-4 mb-4 shadow-sm hover:bg-gray-50">
          <div className="flex justify-start space-x-2 mb-2">
            <div className="font-bold text-teal-800">Name:</div>
            <div>{user.name}</div>
          </div>
          <div className="flex justify-start space-x-2 mb-2">
            <div className="font-bold text-teal-800">Email:</div>
            <div>{user.email}</div>
          </div>
          <div className="flex justify-start space-x-2 mb-2">
            <div className="font-bold text-teal-800">Phone:</div>
            <div>{user.phone}</div>
          </div>
          <div className="flex justify-start space-x-2 mb-2">
            <div className="font-bold text-teal-800">City:</div>
            <div>{user.city}</div>
          </div>
          <button
            onClick={() => handleRestrictClick(user, userType)}
            className={`mt-2 text-sm font-medium px-3 py-1 rounded ${
              user.restricted
                ? "bg-teal-600 text-white hover:bg-teal-700"
                : "bg-red-500 text-white hover:bg-red-600"
            }`}
          >
            {user.restricted ? "Unrestrict" : "Restrict"}
          </button>
        </div>
      ))}
    </div>
  );

  return (
    <div className="overflow-auto p-4 max-w-4xl mx-auto">
      <h1 className="text-xl md:text-2xl font-bold text-gray-800 md:mb-4 lg:mb-6">
        Registered Service Providers
      </h1>

      {/* Table Sections */}
      {renderTableSection("Vets", users.vets, "vets")}
      {renderTableSection("Groomers", users.groomers, "groomers")}
      {renderTableSection("Sitters", users.sitters, "sitters")}

      {/* Mobile Sections */}
      <div className="block md:hidden">
        {renderMobileSection("Vets", users.vets, "vets")}
        {renderMobileSection("Groomers", users.groomers, "groomers")}
        {renderMobileSection("Sitters", users.sitters, "sitters")}
      </div>

      {/* Restrict Confirmation Modal - Show on all screen sizes */}
      {showRestrictConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-xl px-2 py-3 md:p-6 max-w-sm md:max-w-md w-full">
            <h3 className="text-xl md:text-2xl font-semibold text-red-600 mb-4 text-center">Confirm Restriction</h3>
            <p className="text-gray-700 text-center mb-6">
              Are you sure you want to{" "}
              <span className="font-semibold text-red-500">
                {selectedUser.restricted ? "unrestrict" : "restrict"}
              </span>{" "}
              the account of {selectedUser.name}? This will{" "}
              {selectedUser.restricted
                ? "restore access to all services."
                : "prevent the user from accessing services of your system."}
            </p>
            <div className="flex justify-around items-center">
            <button
                onClick={() => setShowRestrictConfirm(false)}
                className="px-6 py-3 bg-gray-300 text-gray-700 font-medium rounded-lg shadow-md hover:bg-gray-400 transition duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleRestrict}
                className="px-6 py-3 bg-red-600 text-white font-medium rounded-lg shadow-md hover:bg-red-700 transition duration-200"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisteredStaff;
