import React from "react";
import { useNavigate } from "react-router-dom";
import dogImage from "../assets/dogImage.png"; 
import { Search, Home } from "lucide-react";
import { useNavbar } from "./NavbarContext";

const AdoptionOrRehome = () => {
  const navigate = useNavigate();
  const { isLoggedIn, handleShowComponent } = useNavbar();
  
  const handleAdoption = () => {
    navigate(`/find-a-pet`);
  };

  const handleRehome = () => {
    if (isLoggedIn) {
      navigate(`/profile/post-adoption`);
    } else {
      handleShowComponent("login");
    }
  };

  return (
    <div
      className="container grid grid-cols-1 lg:grid-cols-2 gap-6 w-full mx-auto lg:max-w-6xl mb-8 custom-lg:max-w-4xl max-w-xs 
      custom-xs:max-w-md sm:max-w-xl md:max-w-2xl rounded-3xl mt-2 bg-lime-50 p-6"
    >
      {/* LEFT COLUMN: Cards */}
      <div className="flex flex-col space-y-6">
        <div
          onClick={handleAdoption}
          className="flex-1 cursor-pointer flex items-center p-5 rounded-lg shadow-md 
                     bg-orange-200 border-l-4 border-orange-600
                     hover:shadow-lg transition-transform hover:scale-105"
        >
          <Search size={30} className="text-orange-600 mr-4 flex-shrink-0" />
          <div>
            <h2 className="text-xl font-bold text-orange-700 mb-1">
              I want to adopt a pet
            </h2>
            <p className="text-gray-700 text-sm">
              Search available dogs, cats, and rabbits on PetConnect.
            </p>
          </div>
        </div>

        <div
          onClick={handleRehome}
          className="flex-1 cursor-pointer flex items-center p-5 rounded-lg shadow-md 
                     bg-teal-100 border-l-4 border-teal-600
                     hover:shadow-lg transition-transform hover:scale-105"
        >
          <Home size={30} className="text-teal-600 mr-4 flex-shrink-0" />
          <div>
            <h2 className="text-xl font-bold text-teal-700 mb-1">
              I need to rehome my pet
            </h2>
            <p className="text-gray-700 text-sm">
              List your pet for free on PetConnect and find them a loving home.
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Image */}
      <div className="flex items-center justify-center">
        <img
          src={dogImage}
          alt="Woman hugging a dog"
          className="w-full h-auto object-cover rounded-lg shadow-md"
        />
      </div>
    </div>
  );
};

export default AdoptionOrRehome;
