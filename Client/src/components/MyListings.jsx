import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Spinner from "./Spinner";
import backgroundImage from "../assets/BgMemoryhd.jpg";
import { Edit3, Users } from "lucide-react";

const MyListings = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmStatusData, setConfirmStatusData] = useState(null); // { petId, newStatus }
  const navigate = useNavigate();

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await axios.get("http://localhost:5000/auth/user-adoption-ads", {
          withCredentials: true,
        });
        setListings(response.data.adoptionAds);
      } catch (error) {
        console.error("Error fetching listings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  const handleCardClick = (petId) => {
    navigate(`/profile/edit-adoption/${petId}`);
  };

  // Function to update the status on the backend and update local state
  const updateStatus = async (petId, newStatus) => {
    try {
      await axios.put(
        `http://localhost:5000/auth/applications/${petId}/status`,
        { status: newStatus },
        { withCredentials: true }
      );
      setListings((prevListings) =>
        prevListings.map((pet) =>
          pet._id === petId ? { ...pet, status: newStatus } : pet
        )
      );
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status. Please try again.");
    }
  };

  // When dropdown changes, if status requires confirmation then show the modal.
  const handleStatusChange = (petId, newStatus) => {
    if (newStatus === "Pending" || newStatus === "Adopted") {
      setConfirmStatusData({ petId, newStatus });
      setShowConfirmModal(true);
    } else {
      updateStatus(petId, newStatus);
    }
  };

  // Called when the user confirms in the modal
  const handleConfirmStatus = async () => {
    if (confirmStatusData) {
      await updateStatus(confirmStatusData.petId, confirmStatusData.newStatus);
      setShowConfirmModal(false);
      setConfirmStatusData(null);
    }
  };

  // Called when the user cancels the modal
  const handleCancelStatus = () => {
    setShowConfirmModal(false);
    setConfirmStatusData(null);
  };

  // Navigate to edit page via the edit button
  const handleEditClick = (petId, e) => {
    e.stopPropagation();
    navigate(`/profile/edit-adoption/${petId}`);
  };

  // Navigate to view applications page via the applications button
  const handleViewAppsClick = (petId, e) => {
    e.stopPropagation();
    navigate(`/profile/view-applications/${petId}`);
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div
      className="min-h-screen bg-fixed flex items-center justify-center"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="container rounded-lg shadow-gray-400 mb-96 md:bg-orange-200 md:shadow-md max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-semibold text-center mb-6 text-orange-700">
          Your Adoption Listings
        </h1>

        {listings.length === 0 ? (
          <p className="text-center text-gray-700">
            You haven't listed any pets for adoption yet.
          </p>
        ) : (
          <div className="space-y-4">
            {listings.map((pet) => (
              <div
                key={pet._id}
                className="relative bg-slate-200 md:bg-white mx-auto md:mx-10 shadow-lg rounded-lg overflow-hidden p-4 border-l-8 border-orange-600 cursor-pointer hover:bg-slate-100"
                onClick={() => handleCardClick(pet._id)}
              >
                {/* Edit & Applications Buttons */}
                <div className="absolute top-2 right-2 flex space-x-2 z-10">
                  <button
                    onClick={(e) => handleEditClick(pet._id, e)}
                    className="flex items-center px-3 py-1 bg-teal-500 rounded hover:bg-teal-600 text-white text-sm"
                  >
                    <Edit3 size={18} className="mr-1" />
                    Edit
                  </button>
                  <button
                    onClick={(e) => handleViewAppsClick(pet._id, e)}
                    className="flex items-center px-3 py-1 bg-green-500 rounded hover:bg-green-600 text-white text-sm"
                  >
                    <Users size={18} className="mr-1" />
                    View Requests
                  </button>
                </div>

                <div className="flex flex-row justify-between">
                  <div className="flex flex-col space-y-2">
                    <h2 className="text-xl font-semibold text-teal-700">{pet.name}</h2>
                    <p className="text-sm text-gray-600">
                      {pet.breed || "Unknown Breed"}
                    </p>
                    <p className="mt-2 text-lg font-bold text-orange-600">
                      Age: {pet.age || "Unknown"}
                    </p>
                    {/* Status Dropdown */}
                    <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                      <label className="text-sm font-semibold text-gray-700">
                        Status:
                      </label>
                      <select
                        value={pet.status || "Available"}
                        onChange={(e) =>
                          handleStatusChange(pet._id, e.target.value)
                        }
                        className="ml-2 p-1 border rounded-md text-gray-700"
                      >
                        <option value="Available">Available</option>
                        <option value="Pending">Pending</option>
                        <option value="Adopted">Adopted</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center mt-8">
                    {pet.photos && pet.photos.length > 0 ? (
                      <img
                        src={pet.photos[0]}
                        alt={pet.name}
                        className="w-40 h-28 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-gray-300 flex items-center justify-center rounded-lg">
                        No Image
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Custom Confirmation Modal */}
      {showConfirmModal && confirmStatusData && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full">
            <h2 className="text-xl text-center font-semibold mb-4 text-orange-700">
              {confirmStatusData.newStatus === "Pending"
                ? "Set pet to Pending"
                : "Mark pet as Adopted"}
            </h2>
            <p className="mb-4 text-base text-justify text-gray-600">
              {confirmStatusData.newStatus === "Pending"
                ? "Setting this pet to Pending means that no more people can apply for this pet for now."
                : "Marking this pet as Adopted will remove the listing from the system permanently which cannot be undone."}
            </p>
            <div className="flex justify-end mt-2 space-x-4">
              <button
                onClick={handleCancelStatus}
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmStatus}
                className="px-4 py-2 rounded bg-lime-600 hover:bg-lime-700 text-white text-sm"
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

export default MyListings;
