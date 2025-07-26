import React, { useState, useEffect } from "react";
import axios from "axios";
import { Phone, User, Mail } from "lucide-react";

const RegisteredUsers = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showRestrictConfirm, setShowRestrictConfirm] = useState(false);

  // Fetch users data
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:5000/auth/admin/users");
        setUsers(response.data.users);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  // Restrict user function
  const handleRestrict = async () => {
    try {
      const response = await axios.post(`http://localhost:5000/auth/admin/restrict-user/${selectedUser._id}`, {
        userType: "user",
      });

      // Update user's restriction status locally
      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u._id === selectedUser._id ? { ...u, restricted: !u.restricted } : u
        )
      );
      setShowRestrictConfirm(false); // Hide confirmation modal after success
    } catch (error) {
      console.error("Error toggling user restriction:", error);
      setShowRestrictConfirm(false); // Hide confirmation modal after failure
    }
  };

  // Handle Restrict button click, shows confirmation dialog
  const handleRestrictClick = (user) => {
    setSelectedUser(user);
    setShowRestrictConfirm(true); // Show confirmation modal
  };

  return (
    <div className="overflow-auto p-4 max-w-4xl mx-auto">
      <h1 className="text-xl md:text-2xl font-bold text-gray-800 md:mb-4 lg:mb-6">Registered Users</h1>

      {/* Table for medium and larger screens */}
      <div className="hidden md:block">
        <table className="table-auto w-full border-collapse border border-gray-200 shadow-md">
          <thead>
            <tr className="bg-gray-100 space-y-2">
              <th className="border border-gray-200 px-4 py-2 text-teal-800 text-left">Name</th>
              <th className="border border-gray-200 px-4 py-2 text-teal-800 text-left">Email</th>
              <th className="border border-gray-200 px-4 py-2 text-teal-800 text-left">Phone</th>
              <th className="border border-gray-200 px-4 py-2 text-teal-800 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className="hover:bg-gray-50">
                <td className="border border-gray-200 px-4 py-2">
                  <div className="flex items-center">
                    <User className="mr-2 text-teal-600" />
                    {user.name}
                  </div>
                </td>
                <td className="border border-gray-200 px-4 py-2">
                  <div className="flex items-center">
                    <Mail className="mr-2 text-orange-600" />
                    {user.email}
                  </div>
                </td>
                <td className="border border-gray-200 px-4 py-2">
                  <div className="flex items-center">
                    <Phone className="mr-2 text-blue-600" />
                    {user.phone}
                  </div>
                </td>
                <td className="border border-gray-200 px-4 py-2">
                  <button
                    onClick={() => handleRestrictClick(user)}
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
            ))}
          </tbody>
        </table>
      </div>

      {/* Stacked details for small screens */}
      <div className="md:hidden">
        {users.map((user, index) => (
          <div key={user._id}>
            <div className="border-b border-gray-200 p-4 hover:bg-gray-50 cursor-pointer">
              <div className="flex justify-start space-x-2">
                <div className="font-bold text-teal-800">Name:</div>
                <div>{user.name}</div>
              </div>
              <div className="flex justify-start space-x-2">
                <div className="font-bold text-teal-800">Email:</div>
                <div>{user.email}</div>
              </div>
              <div className="flex justify-start space-x-2">
                <div className="font-bold text-teal-800">Phone:</div>
                <div>{user.phone}</div>
              </div>
              <button
                onClick={() => handleRestrictClick(user)}
                className={`mt-2 text-sm font-medium px-3 py-1 rounded ${
                  user.restricted
                    ? "bg-teal-600 text-white hover:bg-teal-700"
                    : "bg-red-500 text-white hover:bg-red-600"
                }`}
              >
                {user.restricted ? "Unrestrict" : "Restrict"}
              </button>
            </div>
            {index < users.length - 1 && <hr className="border-gray-500 text-bold" />}
          </div>
        ))}
      </div>

      {/* Confirmation Modal */}
      {showRestrictConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
         <div className="bg-white rounded-lg shadow-xl px-2 py-3 md:p-6 max-w-sm md:max-w-md w-full">
            <h3
              className={`text-xl md:text-2xl font-semibold mb-4 text-center ${
                selectedUser.restricted ? "text-teal-700" : "text-red-600"
              }`}
            >
              {selectedUser.restricted ? "Confirm Restriction" : "Confirm Unrestriction"}
            </h3>
            <p className="text-gray-700 text-center mb-6">
              Are you sure you want to{" "}
              <span
                className={`font-semibold ${
                  selectedUser.restricted ? "text-teal-500" : "text-red-500"
                }`}
              >
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
                className={`px-6 py-3 font-medium rounded-lg shadow-md transition duration-200 ${
                  selectedUser.restricted ? "bg-teal-600 text-white hover:bg-teal-700" :"bg-red-600 text-white hover:bg-red-700" 
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {users.length === 0 && (
        <p className="text-center text-gray-500 mt-4">No registered users available.</p>
      )}
    </div>
  );
};

export default RegisteredUsers;
