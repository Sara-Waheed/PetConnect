// PetDetail.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import Spinner from "./Spinner";
import { useNavbar } from "./NavbarContext";
import InfoModal from "./InfoModal";

const PetAdoptionDetail = () => {
  const { id } = useParams(); // Get pet ID from URL
  const [pet, setPet] = useState(null);
  const navigate = useNavigate();
  const { isLoggedIn } = useNavbar();
  const [showModal, setShowModal] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [isUserAdoptionAd, setIsUserAdoptionAd] = useState(false);

  // Fetch pet details
  useEffect(() => {
    axios
      .get(`http://localhost:5000/auth/get-adoption-ads/${id}`)
      .then((res) => {
        setPet(res.data);
      })
      .catch((err) => {
        console.error(err);
      });
  }, [id]);

  // Check if the logged-in user has already applied for this pet.
  useEffect(() => {
    if (isLoggedIn) {
      axios
        .get(`http://localhost:5000/auth/check-application/${id}`, {
          withCredentials: true,
        })
        .then((res) => {
          if (res.data.applied) {
            setHasApplied(true);
          } else {
            setHasApplied(false);
          }
        })
        .catch((err) => {
          console.error("Error checking application status:", err);
        });
    }
  }, [id, isLoggedIn]);

  // Check if the current pet is part of the user's adoption ads.
  useEffect(() => {
    if (isLoggedIn && pet) {
      axios
        .get("http://localhost:5000/auth/user-adoption-ads", { withCredentials: true })
        .then((res) => {
          const userAdoptionAds = res.data.adoptionAds;
          const found = userAdoptionAds.some((ad) => ad._id === pet._id);
          setIsUserAdoptionAd(found);
        })
        .catch((err) => {
          console.error("Error fetching user's adoption ads:", err);
        });
    }
  }, [isLoggedIn, pet]);

  const handleApplication = () => {
    if (isLoggedIn) {
      // If the pet is either already applied for or is part of the user's own adoption ads, disable application.
      if (hasApplied || isUserAdoptionAd) {
        return;
      }
      navigate(`/pet-listing/${id}/adoption-application`);
    } else {
      setShowModal(true);
    }
  };

  if (!pet) {
    return <div className="flex justify-center items-center mx-auto"><Spinner /></div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* PHOTOS SECTION (Full Width) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-5 mb-6">
        {pet.photos?.map((photo, index) => (
          <img
            key={index}
            src={photo || "placeholder.jpg"}
            alt={`${pet.name} - ${index}`}
            className="w-full h-64 object-cover rounded-md"
          />
        ))}
      </div>

      {/* PET NAME, BREED, AND AGE (Full Width) */}
      <div className="mb-6 mt-10 shadow-md max-w-2xl p-4">
        <h1 className="text-3xl text-gray-800 font-semibold mb-2">
          {pet.name}
        </h1>
        <p className="text-gray-600 text-base pb-7">
          {pet.breed} | <span className="text-orange-600">{pet.age} old</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* LEFT COLUMN (2/3) -> Pet Details */}
        <div className="md:col-span-2">
          {/* PET DESCRIPTION SECTION */}
          <div className="mb-6 shadow-md max-w-2xl p-4">
            <h2 className="text-xl text-gray-800 font-semibold mb-4">
              {pet.name} Description
            </h2>
            <div className="text-sm text-gray-500">
              <h3>Personality:</h3>
              <p className="mb-2">{pet.personalityDescription || "Unknown"}</p>
              <h3>Activity:</h3>
              <p className="mb-2">{pet.playDescription || "Unknown"}</p>
              <h3>Diet:</h3>
              <p className="pb-3">{pet.dietDescription || "Unknown"}</p>
            </div>
          </div>

          {/* CURRENT HOME LIFE SECTION */}
          <div className="mb-6 max-w-2xl p-4 shadow-md">
            <h2 className="text-xl text-gray-800 font-semibold mb-4">
              Current Home Life
            </h2>
            <div className="space-y-2 pb-4">
              <div className="flex justify-between text-sm shadow-sm pb-2 shadow-gray-200">
                <span className="text-gray-500">Household Activity:</span>
                <span className="text-gray-800">
                  {pet.householdActivityLevel || "Unknown"}
                </span>
              </div>
              <div className="flex justify-between text-sm shadow-sm pb-2 shadow-gray-200">
                <span className="text-gray-500">Household Environment:</span>
                <span className="text-gray-800">
                  {pet.householdEnvironment || "Unknown"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Other Pets:</span>
                <span className="text-gray-800">
                  {pet.otherPets?.join(", ") || "No other pets"}
                </span>
              </div>
            </div>
          </div>

          {/* PET PROFILE SUMMARY SECTION */}
          <div className="mb-6 max-w-2xl p-4 shadow-md">
            <h2 className="text-xl text-gray-800 font-semibold mb-4">
              {pet.name} Profile Summary
            </h2>
            <div className="space-y-3 pb-4">
              {/* First Column */}
              <div className="flex justify-between text-sm shadow-sm pb-2 shadow-gray-200">
                <span className="text-gray-500">Colour:</span>
                <span className="text-gray-800">
                  {pet.colors?.join(", ") || "Unknown"}
                </span>
              </div>
              <div className="flex justify-between text-sm shadow-sm pb-2 shadow-gray-200">
                <span className="text-gray-500">Breed:</span>
                <span className="text-gray-800">{pet.breed || "Unknown"}</span>
              </div>
              <div className="flex justify-between text-sm shadow-sm pb-2 shadow-gray-200">
                <span className="text-gray-500">Sex:</span>
                <span className="text-gray-800">{pet.gender || "Unknown"}</span>
              </div>
              <div className="flex justify-between text-sm shadow-sm pb-2 shadow-gray-200">
                <span className="text-gray-500">Size:</span>
                <span className="text-gray-800">{pet.size || "Unknown"}</span>
              </div>
              <div className="flex justify-between text-sm shadow-sm pb-2 shadow-gray-200">
                <span className="text-gray-500">Age:</span>
                <span className="text-gray-800">{pet.age || "Unknown"}</span>
              </div>
              <div className="flex justify-between text-sm shadow-sm pb-2 shadow-gray-200">
                <span className="text-gray-500">Microchipped:</span>
                <span className="text-gray-800">
                  {pet.microchipped || "Unknown"}
                </span>
              </div>
              {/* Second Column */}
              <div className="flex justify-between text-sm shadow-sm pb-2 shadow-gray-200">
                <span className="text-gray-500">Spayed / Neutered:</span>
                <span className="text-gray-800">
                  {pet.spayedNeutered || "Unknown"}
                </span>
              </div>
              <div className="flex justify-between text-sm shadow-sm pb-2 shadow-gray-200">
                <span className="text-gray-500">Time at Current Home:</span>
                <span className="text-gray-800">
                  {pet.ownedDuration || "Unknown"}
                </span>
              </div>
              <div className="flex justify-between text-sm shadow-sm pb-2 shadow-gray-200">
                <span className="text-gray-500">Reason for Rehoming:</span>
                <span className="text-gray-800">
                  {pet.reasonsForRehoming?.join(", ") || "Unknown"}
                </span>
              </div>
              <div className="flex justify-between text-sm shadow-sm pb-2 shadow-gray-200">
                <span className="text-gray-500">Keep Duration:</span>
                <span className="text-gray-800">
                  {pet.keepDuration || "Unknown"}
                </span>
              </div>
              <div className="flex justify-between text-sm shadow-sm pb-2 shadow-gray-200">
                <span className="text-gray-500">Flea Treatment:</span>
                <span className="text-gray-800">
                  {pet.upToDateFleaWorm || "Unknown"}
                </span>
              </div>
              <div className="flex justify-between text-sm shadow-sm pb-2 shadow-gray-200">
                <span className="text-gray-500">Dental Checks:</span>
                <span className="text-gray-800">
                  {pet.upToDateDental || "Unknown"}
                </span>
              </div>
              <div className="flex justify-between text-sm shadow-sm pb-2 shadow-gray-200">
                <span className="text-gray-500">Medication:</span>
                <span className="text-gray-800">
                  {pet.hasMedication || "Unknown"}
                </span>
              </div>
              <div className="flex justify-between text-sm shadow-sm pb-2 shadow-gray-200">
                <span className="text-gray-500">Medication Detail:</span>
                <span className="text-gray-800">
                  {pet.healthDetails || "Unknown"}
                </span>
              </div>
            </div>
          </div>

          <div className="mb-6 max-w-2xl mt-8">
            <h2 className="text-xl text-gray-800 font-semibold mb-4">
              {pet.name} Current Owner's Description
            </h2>
            <ol className="list-decimal list-inside text-gray-700 leading-relaxed">
              {pet.species === "Cat" &&
                pet.catCharacteristics?.map((item, index) => (
                  <li key={index} className="mb-2">
                    {item}
                  </li>
                ))}
              {pet.species === "Dog" &&
                pet.dogCharacteristics?.map((item, index) => (
                  <li key={index} className="mb-2">
                    {item}
                  </li>
                ))}
              {pet.species === "Rabbit" &&
                pet.rabbitCharacteristics?.map((item, index) => (
                  <li key={index} className="mb-2">
                    {item}
                  </li>
                ))}
              {!pet.catCharacteristics?.length &&
                !pet.dogCharacteristics?.length &&
                !pet.rabbitCharacteristics?.length && (
                  <li>No characteristics available.</li>
                )}
            </ol>
          </div>
        </div>

        {/* RIGHT COLUMN (1/3) -> Sticky Side Panel */}
        <div>
          <div className="sticky top-16 p-4 border shadow-md bg-white text-gray-600">
            <h3 className="mb-2">I am being cared by Private Owner</h3>
            <p>Location: {pet.city}</p>
            <button 
              className={`mt-4 px-4 w-full py-2 ${
                hasApplied || isUserAdoptionAd
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-teal-600 hover:bg-teal-700"
              } text-white rounded-md shadow-lg focus:outline-none focus:ring-2 focus:ring-teal-500`}
              onClick={handleApplication}
              disabled={hasApplied || isUserAdoptionAd}
            >
              {hasApplied || isUserAdoptionAd 
                ? "Application Disabled" 
                : `Apply for ${pet.name}`}
            </button>
          </div>
        </div>

        {showModal && (
          <InfoModal
            title="Login Required"
            message="Please log in with your pet owner account to apply for this pet."
            onClose={() => setShowModal(false)}
          />
        )}
      </div>
    </div>
  );
};

export default PetAdoptionDetail;
