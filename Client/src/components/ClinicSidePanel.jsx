// SidePanel.js
import React from "react";
import { useNavigate } from "react-router-dom";

const ClinicSidePanel = ({ activeSection, handleSectionChange, isSidePanelOpen, setIsSidePanelOpen }) => {
  const navigate = useNavigate();

  const handleNavigation = (section) => {
    if (window.innerWidth < 768) {
      setIsSidePanelOpen(false);
    }
    handleSectionChange(section);
    navigate(`/clinic/${section}`);
  };

  return (
    <div
    className={`bg-gray-700 text-white h-full transition-all duration-300 ease-in-out ${
    isSidePanelOpen ? "absolute top-14 md:top-0 left-0 w-full md:relative md:w-1/5" : "hidden"
    }`}
    >
     
    <nav className="flex flex-col gap-2 p-4">
      <button
        onClick={() => handleNavigation("dashboard")}
        className={`p-2 text-left rounded hover:bg-gray-500 hover:text-orange-300 transition ${
          activeSection === "dashboard" ? "bg-gray-500" : ""
        }`}
      >
        Dashboard
      </button>
      <button
        onClick={() => handleNavigation("requests")}
        className={`p-2 text-left rounded hover:bg-gray-500 hover:text-orange-300 transition ${
          activeSection === "requests" ? "bg-gray-500" : ""
        }`}
      >
        Pending Requests
      </button>
      <button
        onClick={() => handleNavigation("staff")}
        className={`p-2 text-left rounded hover:bg-gray-500 hover:text-orange-300 transition ${
          activeSection === "staff" ? "bg-gray-500" : ""
        }`}
      >
        Registered Staff
      </button>
      {/* <button
        onClick={() => handleNavigation("settings")}
        className={`p-2 text-left rounded hover:bg-gray-500 hover:text-orange-300 transition ${
          activeSection === "settings" ? "bg-gray-500" : ""
        }`}
      >
        Settings
      </button> */}
    </nav>
  </div> 
  );
};

export default ClinicSidePanel;
