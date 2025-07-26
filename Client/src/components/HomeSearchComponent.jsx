import React, { useState } from 'react';
import { LocateFixed, MapPin, ChevronDown } from 'lucide-react';
import vetPic from '../assets/Veterinary-Specialties.jpg';
import SearchNearbyServices from './SearchNearbyServices';

const HomeSearchComponent = () => {
  const [location, setLocation] = useState(() => {
    return localStorage.getItem('userCity') || 'Islamabad';
  });
  
  const [showSearchOverlay, setShowSearchOverlay] = useState(false);

  const openSearch = () => setShowSearchOverlay(true);
  const closeSearch = () => setShowSearchOverlay(false);

  return (
    <>
      {/* Main Hero */}
      <div className="flex flex-row items-stretch justify-between bg-gradient-to-r from-teal-500 to-teal-800 mt-4 w-full
         mx-auto lg:max-w-6xl custom-lg:max-w-4xl max-w-xs custom-xs:max-w-md sm:max-w-xl md:max-w-2xl rounded-3xl overflow-hidden relative">
        
        {/* Left Section */}
        <div className="flex flex-col justify-center items-start p-3 md:p-8 w-full sm:w-3/4 custom-lg:w-2/3">
          <h1 className="text-sm md:text-base lg:text-3xl text-white">
            Find and Book the<br />
            <span className="text-black">Best Pet Services</span> near you
          </h1>

          {/* Location Picker (mobile only) */}
          <div className="flex items-center cursor-pointer lg:hidden mt-2" onClick={openSearch}>
            <MapPin className="h-4 sm:h-5 w-4 sm:w-5 mr-1 text-red-700" />
            <span className="text-sm md:text-base text-white" >{location}</span>
            <ChevronDown className="text-white h-5 w-5" />
          </div>

          {/* Search Bar */}
          <div 
            className="flex flex-col custom-lg:flex-row items-center mt-2 lg:mt-6 bg-gray-200 shadow-md 
            rounded-md w-full max-w-5xl custom-lg:max-w-2xl p-1 cursor-pointer"
            onClick={openSearch}
          >
            
            {/* City & Detect (desktop only) */}
            <div className="hidden lg:flex bg-white items-center p-2 mr-0.5">
              <span
                className="text-gray-500"
              >
                {location}
              </span>
              <button
                className="ml-16 mr-2 text-teal-900 flex items-center font-medium"
              >
                <LocateFixed className="h-5 w-5 mr-1" />
                <span>Detect</span>
              </button>
            </div>

            {/* Category & Search */}
            <div className="w-full flex-1 flex items-center bg-white pl-1 md:pl-4">
              <span
                className="text-gray-400 flex-grow text-xs md:text-base"
              >
                Consultation, Grooming, Sitting
              </span>
              <button
                className="bg-orange-400 hover:bg-orange-500 text-xs md:text-base text-white py-2 px-2 md:px-6 rounded-md"
              >
                Search
              </button>
            </div>
          </div>
        </div>

        {/* Right Section (Image) */}
        <div className="hidden sm:block custom-lg:w-1/3 w-1/4">
          <img
            src={vetPic}
            alt="Doctor"
            className="w-full h-full object-cover rounded-r-3xl"
          />
        </div>
      </div>

      {/* Overlay + Backdrop */}
      {showSearchOverlay && (
        <>
          {/* Darken background */}
          <div
            className="fixed inset-0 bg-black bg-opacity-40 z-40"
            onClick={closeSearch}
          />

          {/* SearchNearbyServices Modal */}
          <div>
            <SearchNearbyServices onClose={closeSearch} />
          </div>
        </>
      )}
    </>
  );
};

export default HomeSearchComponent;
