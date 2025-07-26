import React, { useState } from 'react';
import { Link } from "react-router-dom";
import vetMobile from '../assets/vetMobile.jpg';
import vetPicture from '../assets/vetPicture.webp';
import petSitting from '../assets/pet sitting.avif';
import petGrooming from '../assets/pet grooming.jpg';
import SearchNearbyServices from './SearchNearbyServices';


const ServiceCards = () => {
    const [searchOverlay, setSearchOverlay] = useState({
      isOpen: false,
      cardName: '' 
    });
    
    const openSearch = (cardName) => {
      setSearchOverlay({ isOpen: true, cardName });
    };
    const closeSearch = () => {
      setSearchOverlay({ isOpen: false, cardName: '' });
    };
    return (
        <div className="container grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 w-full mx-auto lg:max-w-6xl mb-8
        custom-lg:max-w-4xl max-w-xs custom-xs:max-w-md sm:max-w-xl md:max-w-2xl rounded-3xl mt-4 md:mt-7">
            {/* Online Now Card */}
            <Link to="/vets/video-consultation" className="custom-lg:w-full cursor-pointer">
                <div className="relative bg-blue-50 rounded-lg shadow-md h-full sm:h-64">
                    <div className="relative h-2/3 flex items-center justify-center">
                    <img
                        src={vetMobile}
                        alt="Consult Online Now"
                        className="w-full h-full mx-auto object-cover rounded-lg"
                        fetchpriority="high"
                    />
                    <div className="absolute inset-x-0 bottom-2 flex items-center justify-center bg-orange-500 text-white text-xs md:text-sm font-semibold h-8">
                        <span
                        className="w-2 h-2 bg-green-800 rounded-full mr-2"
                        style={{
                            animation: "ping 2s cubic-bezier(0, 0, 0.3, 1) infinite",
                        }}
                        ></span>
                        3 Doctors Online Now
                    </div>
                    </div>
                    <div className="h-1/3 py-1 sm:py-4 px-4 bg-white flex flex-col justify-between">
                    <h2 className="text-base sm:text-lg font-semibold">Consult Online Now</h2>
                    <p className="text-gray-600 text-sm pb-2 hidden lg:block">
                        Instantly connect with Vets through Video call.
                    </p>
                    </div>
                </div>
            </Link>

            {/* In-Clinic Appointments Card */}
            <div onClick={() => openSearch('Veterinary In-Clinic Consultation')} className="custom-lg:w-full cursor-pointer">
                <div className="bg-orange-100 rounded-lg shadow-md overflow-hidden h-full sm:h-64">
                <div className="h-2/3 flex items-center justify-center">
                    <img
                    src={vetPicture}
                    alt="In-clinic appointments"
                    className="w-full h-full mx-auto object-cover rounded-lg"
                    />
                </div>
                <div className="h-1/3 py-1 sm:py-4 px-4 bg-white flex flex-col justify-between">
                    <h2 className="text-base sm:text-lg font-semibold">In-Clinic Appointments</h2>
                    <p className="text-gray-600 text-sm pb-2 hidden lg:block">
                    Book an In-Person visit to doctor's clinic.
                    </p>
                </div>
                </div>
            </div>

            {/* Pet Grooming Card */}
            <div onClick={() => openSearch('Pet Grooming')} className="custom-lg:w-full  cursor-pointer ">
                <div className="bg-blue-100 rounded-lg shadow-md overflow-hidden h-full sm:h-64">
                <div className="h-2/3 flex items-center justify-center">
                    <img
                    src={petGrooming}
                    alt="Pet Grooming"
                    className="w-full h-full mx-auto object-cover rounded-lg"
                    />
                </div>
                <div className="h-1/3 py-1 sm:py-4 px-4 bg-white flex flex-col justify-between">
                    <h2 className="text-base sm:text-lg font-semibold">Pet Grooming</h2>
                    <p className="text-gray-600 text-sm pb-2 hidden lg:block">
                    Treat your pet with the best grooming services
                    </p>
                </div>
                </div>
            </div>

            {/* Pet Sitting Card */}
            <div onClick={() => openSearch('Pet Sitting')} className="custom-lg:w-full  cursor-pointer">
                <div className="bg-red-100 rounded-lg shadow-md overflow-hidden h-full sm:h-64">
                <div className="h-2/3 flex items-center justify-center">
                    <img
                    src={petSitting}
                    alt="Pet Sitting"
                    className="w-full h-full mx-auto object-cover rounded-lg"
                    />
                </div>
                <div className="h-1/3 py-1 sm:py-4 px-4 bg-white flex flex-col justify-between">
                    <h2 className="text-base sm:text-lg font-semibold">Pet Sitting</h2>
                    <p className="text-gray-600 text-sm pb-2 hidden lg:block">
                    Professional care for your pets while you're away
                    </p>
                </div>
                </div>
            </div>
            {searchOverlay.isOpen && (
                <>
                    {/* Darken background */}
                    <div
                    className="fixed inset-0 bg-black bg-opacity-40 z-40"
                    onClick={closeSearch}
                    />
        
                    {/* SearchNearbyServices Modal */}
                    <div>
                    <SearchNearbyServices 
                        onClose={closeSearch} 
                        initialService={searchOverlay.cardName}
                    />
                    </div>
                </>
            )}
        </div>
    );
};

export default ServiceCards;
