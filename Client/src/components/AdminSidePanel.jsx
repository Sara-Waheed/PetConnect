// SidePanel.js
import React from "react";
import { useNavigate } from "react-router-dom";

const AdminSidePanel = ({ activeSection, handleSectionChange, isSidePanelOpen, setIsSidePanelOpen }) => {
  const navigate = useNavigate();

  // In AdminSidePanel.js
const handleNavigation = (section) => {
  if (window.innerWidth < 768) {
    setIsSidePanelOpen(false);
  }
  handleSectionChange(section);
  // Navigate to the section's path
  navigate(`/admin/${section === 'dashboard' ? '' : section}`);
};
  return (
    <div
      className={`bg-black text-white h-full transition-all duration-300 ease-in-out ${isSidePanelOpen ? "absolute top-14 md:top-0 left-0 w-full md:relative md:w-1/5" : "hidden"
        }`}
    >
      <nav className="flex flex-col gap-2 p-4">
        {/* <button
        onClick={() => handleNavigation("dashboard")}
        className={`p-2 text-left rounded hover:bg-gray-500 hover:text-orange-300 transition ${
          activeSection === "dashboard" ? "bg-gray-500" : ""
        }`}
      >
        Dashboard
      </button> */}
      <button
          onClick={() => handleNavigation("users")}
          className={`p-2 text-left rounded hover:bg-orange-700 hover:text-white transition ${activeSection === "users" ? "bg-orange-600" : ""
            }`}
        >
          All Users
        </button>
        <button
          onClick={() => handleNavigation("requests/clinic")}
          className={`p-2 text-left rounded hover:bg-orange-700 hover:text-white transition ${activeSection === "requests/clinic" ? "bg-orange-600" : ""
            }`}
        >
          Pending Clinic Requests
        </button>
        <button
          onClick={() => handleNavigation("requests/sitter")}
          className={`p-2 text-left rounded hover:bg-orange-700 hover:text-white transition ${activeSection === "requests/sitter" ? "bg-orange-600" : ""
            }`}
        >
          Pending Sitter Requests
        </button>
        
        <button
          onClick={() => handleNavigation("service-providers")}
          className={`p-2 text-left rounded hover:bg-orange-700 hover:text-white transition ${activeSection === "service-providers" ? "bg-orange-600" : ""
            }`}
        >
          All Service Providers
        </button>
      <button
          onClick={() => handleNavigation("appointments")}
          className={`p-2 text-left rounded hover:bg-orange-700 hover:text-white transition ${activeSection === "appointments" ? "bg-orange-600" : ""
            }`}
        >
          Track Appointment services
        </button>

        <button
          onClick={() => handleNavigation("blogs")}
          className={`p-2 text-left rounded hover:bg-orange-700 hover:text-white transition ${activeSection === "blogs" ? "bg-orange-600" : ""
            }`}
        >
          Blog Library
        </button>
      </nav>
    </div>
  );
};

export default AdminSidePanel;
