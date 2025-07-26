import React from "react";

const InfoModal = ({ title, message, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-11/12 md:w-2/3 lg:w-1/3 p-6">
        {/* Title */}
        <h2 className="text-2xl font-bold text-green-800 mb-4 text-center">
          {title}
        </h2>

        {/* Message */}
        <p className="text-gray-700 text-center mb-6">{message}</p>

        {/* Close Button */}
        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-6 rounded-lg shadow-md transform hover:scale-105 transition-transform duration-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default InfoModal;
