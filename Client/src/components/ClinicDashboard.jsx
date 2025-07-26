import React, { useState, useEffect, useRef } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import PendingProvidersRequests from "./PendingProvidersRequest";
import ClinicNavbar from "./ClinicNavbar";
import ClinicSidePanel from "./ClinicSidePanel";
import ProviderDetails from "./ProvidersDetails";
import RegisteredClinicStaff from "./RegisteredClinicStaff";
import ClinicHome from "./ClinicHome";

const ClinicDashboard = () => {
  const location = useLocation();
  const storedActiveSection = localStorage.getItem("activeSection");
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(true);
  const [activeSection, setActiveSection] = useState(storedActiveSection);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef(null);
  const profileButtonRef = useRef(null);

  const toggleSidePanel = () => setIsSidePanelOpen((prev) => !prev);
  const toggleProfileDropdown = () => setIsProfileDropdownOpen((prev) => !prev);

  const handleSectionChange = (section) => {
    setActiveSection(section);
    localStorage.setItem("activeSection", section); // Store the active section in localStorage
  };

  // Synchronize `activeSection` with the URL
  useEffect(() => {
    const path = location.pathname;
    if (path.startsWith("/clinic/requests")) {
      setActiveSection("requests");
    } else if (path.startsWith("/clinic/staff")) {
      setActiveSection("staff");
    } else if (path === "/clinic/dashboard" || path === "/clinic") {
      setActiveSection("dashboard");
    }
    localStorage.setItem("activeSection", activeSection);
  }, [location.pathname]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 992) {
        setIsSidePanelOpen(false); // Close side panel on smaller screens
      } else {
        setIsSidePanelOpen(true);
      }
    };

    const handleClickOutside = (event) => {
      // Profile Dropdown
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target) &&
        !profileButtonRef.current.contains(event.target)
      ) {
        setIsProfileDropdownOpen(false);
      }
    };

    // Add event listeners
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("resize", handleResize);

    // Call the resize handler on mount to set the initial state
    handleResize();

    // Cleanup the event listeners on component unmount
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <>
      <ClinicNavbar
        toggleSidePanel={toggleSidePanel}
        isSidePanelOpen={isSidePanelOpen}
        isProfileDropdownOpen={isProfileDropdownOpen}
        toggleProfileDropdown={toggleProfileDropdown}
        profileDropdownRef={profileDropdownRef}
        profileButtonRef={profileButtonRef}
      />

      <div className="flex h-screen">
        <ClinicSidePanel
          activeSection={activeSection}
          handleSectionChange={handleSectionChange}
          isSidePanelOpen={isSidePanelOpen}
          setIsSidePanelOpen={setIsSidePanelOpen}
        />

        <div className={`transition-all duration-300 ${isSidePanelOpen ? "w-3/4" : "w-full"} bg-gray-100 overflow-auto hide-scrollbar`}>
      <Routes>
        <Route path="/dashboard" element={<ClinicHome />} />
        <Route path="/" element={<ClinicHome />} /> {/* Default route */}
            <Route path="/requests" element={<PendingProvidersRequests />} />
            <Route path="/requests/:role/:provider_id" element={<ProviderDetails />} />
            <Route path="/staff/:role/:provider_id" element={<ProviderDetails />} />
            <Route path="/staff" element={<RegisteredClinicStaff />} />
          </Routes>
        </div>
      </div>
    </>
  );
};

export default ClinicDashboard;
