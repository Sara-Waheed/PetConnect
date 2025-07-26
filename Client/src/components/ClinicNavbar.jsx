import { Menu, X,  User, House, CircleHelp } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ClinicNavbar = ({ toggleSidePanel, isSidePanelOpen, isProfileDropdownOpen, toggleProfileDropdown, profileDropdownRef, profileButtonRef }) => {
  const navigate = useNavigate();

  const handleHomeClick = () => {
    toggleProfileDropdown();
    navigate('/');
  }

  return (
    <nav className="flex justify-between items-center p-6 shadow-md bg-black opacity-75 sticky text-white top-0 z-50 py-3 backdrop-blur-lg border-b border-neutral-700/80">
      <div className="flex items-center sm:items-start">
      <button onClick={toggleSidePanel} className="mr-4">
        <span className="md:hidden">
          {isSidePanelOpen ? (
            <X className="w-6 h-6 text-white" /> 
          ) : (
            <Menu className="w-6 h-6 text-white" /> 
          )}
        </span>
        
        <Menu className="hidden md:block w-6 h-6 text-white" />
      </button>
        <span className="text-2xl mr-4 font-bold bg-gradient-to-r from-orange-500 to-orange-800 bg-clip-text text-transparent">PetConnect</span>
      </div>

      <div className="flex items-center space-x-4 text-sm">
        <button className="relative py-2 px-2 space-x-2" onClick={toggleProfileDropdown} ref={profileButtonRef}>
          <User className="w-5 h-5" />
        </button>
        {isProfileDropdownOpen && (
          <div className="absolute right-0 top-12 z-30 shadow-lg bg-neutral-800 w-48 p-4 rounded-lg" ref={profileDropdownRef}>
            <ul className="space-y-4">
              <li className="flex items-center hover:text-orange-500">
                <House className="w-5 h-5 mr-3 text-orange-500" />
                <button onClick={handleHomeClick}>Home</button>
              </li>
              <li className="flex items-center hover:text-orange-500">
                <User className="w-5 h-5 mr-3 text-orange-500" />
                <button>Profile</button>
              </li>
              <li className="flex items-center hover:text-orange-500">
                <CircleHelp className="w-5 h-5 mr-3 text-orange-500" />
                <button>Help</button>
              </li>
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
};

export default ClinicNavbar;
