// SuccessModal.jsx
import React from "react";

const SuccessModal = ({ message, onClose }) => {
  if (!message) return null;
  
  return (
    <>
      {/* Modal Backdrop */}
      <div className="fixed inset-0 bg-black opacity-20 z-40"></div>
      
      {/* Modal Content */}
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="relative bg-white rounded-lg shadow-xl p-6 w-11/12 md:w-2/3 lg:w-1/3 ">
          <button 
            onClick={onClose}
            className="absolute top-1 right-3 text-gray-500 hover:text-gray-700 text-2xl"
          >
            &times;
          </button>
          <div className="flex flex-col items-center">
            <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <h2 className="mt-4 text-xl font-bold text-green-600">Success!</h2>
            <p className="mt-2 text-gray-600 text-center">{message}</p>
            <button 
              onClick={onClose}
              className="mt-6 px-4 py-2 w-1/2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SuccessModal;
