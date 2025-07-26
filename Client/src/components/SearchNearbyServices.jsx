import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { MapPin, Search, X, LocateFixed } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { detectCityByGeo } from '../utils/geolocation';

const SearchNearbyServices = ({ onClose, initialService = '' }) => {
  // Pre-select in-clinic vet & start in city if serviceCard is true
  const [selectedService, setSelectedService] = useState(initialService);

  const defaultField = initialService === 'Veterinary In-Clinic Consultation' || 'Pet Grooming' || 'Pet Sitting'
    ? 'city'
    : 'service';

  const [activeField, setActiveField] = useState(defaultField);
  const [selectedCity, setSelectedCity] = useState(() => {
    return localStorage.getItem('userCity') || 'Islamabad'
  });
  const [locationError, setLocationError] = useState('');

  const cityInputRef = useRef(null);
  const serviceInputRef = useRef(null);
  const navigate = useNavigate();

  const cities = [
    'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad',
    'Peshawar', 'Quetta', 'Multan', 'Hyderabad', 'Sialkot',
    'Gujranwala', 'Sargodha', 'Bahawalpur'
  ];
  const services = [
    'Veterinary Online Consultation',
    'Veterinary In-Clinic Consultation',
    'Pet Grooming',
    'Pet Sitting',
    'Home Services'
  ];

  // On mount: just focus the correct input (no IP lookup)
  useEffect(() => {
    if (defaultField === 'city') {
      cityInputRef.current?.focus();
    } else {
      serviceInputRef.current?.focus();
    }
  }, [defaultField]);

  const handleDetect = async () => {
    setLocationError('');
  
    try {
      const detectedCity = await detectCityByGeo();
      
      if (detectedCity) {
        setSelectedCity(detectedCity);
        localStorage.setItem('userCity', detectedCity);
        return;
      }
      
      setLocationError('Detected location not in service area');
    } catch (error) {
      handleGeolocationError(error);
    }
  };
  
  // Separate error handler
  const handleGeolocationError = (error) => {
    switch(error.message) {
      case 'PERMISSION_DENIED':
        setLocationError('Please enable location permissions in browser settings');
        break;
      case 'POSITION_UNAVAILABLE':
        setLocationError('Location information unavailable - check network connection');
        break;
      case 'TIMEOUT':
        setLocationError('Location detection timed out - please try again');
        break;
      case 'GEOLOCATION_NOT_SUPPORTED':
        setLocationError('Geolocation not supported by your browser');
        break;
      case 'GEOCODING_FAILED':
        setLocationError('Failed to interpret location data');
        break;
      default:
        setLocationError('Unable to detect location - please enter manually');
    }
  };

  const goToSelected = (overrideCity) => {
    const cityToUse = overrideCity ?? selectedCity;
    if (!selectedService || !cityToUse) return;
 
    const cityParam = encodeURIComponent(cityToUse);
  
    if (selectedService === 'Veterinary Online Consultation') {
      navigate('/vets/video-consultation');
    } else if (selectedService === 'Veterinary In-Clinic Consultation') {
      navigate(`/vets/in-clinic?city=${cityParam}`);
    } else if (selectedService === 'Pet Grooming') {
      navigate(`/groomers?city=${cityParam}`);
    } else if (selectedService === 'Pet Sitting') {
      navigate(`/sitters?city=${cityParam}`);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-start justify-center pt-16 z-50">
      <div className="relative w-full max-w-lg">
        {/* Close */}
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-50"
          onClick={onClose}
        >
          <X size={15} />
        </button>

        {/* Inputs */}
        <div className="bg-white rounded-sm p-3 shadow-xl">
          <h2 className="text-center text-base font-medium text-gray-700 mb-2.5">
            Search for vets/services
          </h2>
          <div className="space-y-2">
            {/* City Field */}
            <div
              className="flex items-center gap-2 px-2 py-2 border border-gray-300 rounded-md"
              onClick={() => setActiveField('city')}
            >
              <MapPin className="text-red-600" size={16} />
              <input
                ref={cityInputRef}
                type="text"
                placeholder="Enter locality or city"
                value={selectedCity}
                onChange={e => setSelectedCity(e.target.value)}
                onFocus={() => setActiveField('city')}
                className="flex-1 text-sm text-gray-700 placeholder-gray-400 bg-transparent focus:outline-none"
              />
              <button
                onClick={handleDetect}
                className="flex items-center gap-1"
                type="button"
              >
                <LocateFixed className="text-teal-800 h-4 w-4" />
                <span className="text-teal-800 font-medium text-sm">Detect</span>
              </button>
            </div>
            {locationError && (
              <p className="text-xs text-red-600 px-2">{locationError}</p>
            )}

            {/* Service Field */}
            <div
              className="flex items-center gap-2 px-2 py-2 border border-gray-300 rounded-md"
              onClick={() => setActiveField('service')}
            >
              <Search className="text-lime-600" size={16} />
              <input
                ref={serviceInputRef}
                type="text"
                placeholder="Search for pet services"
                value={selectedService}
                onChange={e => setSelectedService(e.target.value)}
                onFocus={() => setActiveField('service')}
                className="flex-1 text-sm text-gray-700 placeholder-gray-400 bg-transparent focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Spacer */}
        <div className="h-[6px] bg-transparent" />

        {/* Results panel */}
        <div className="bg-white shadow-xl h-[14.5rem] overflow-auto">
          <div className="p-1 pt-2">
            {activeField === 'city' && (
              <ul className="space-y-2">
                {cities.map((city, i) => (
                  <li
                    key={i}
                    className={`flex items-center gap-2 px-3 py-2 border-b border-gray-300 cursor-pointer hover:bg-gray-100 ${
                      selectedCity === city ? 'bg-indigo-100' : ''
                    }`}
                    onClick={() => {
                      setSelectedCity(city);
                      goToSelected(city);
                    }}
                  >
                    <MapPin size={14} className="text-gray-500" />
                    <span className="text-sm text-gray-700">{city}</span>
                  </li>
                ))}
              </ul>
            )}
            {activeField === 'service' && (
              <ul className="space-y-2">
                {services.map((service, i) => (
                  <li
                    key={i}
                    className="flex justify-between items-center px-3 py-2 border-b border-gray-300 cursor-pointer hover:bg-gray-100"
                    onMouseDown={() => {
                      setSelectedService(service);
                      goToSelected();
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <Search size={14} className="text-gray-500" />
                      <span className="text-sm text-gray-700">{service}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchNearbyServices;
