import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { Video, MapPin, Home, ChevronRight } from 'lucide-react';
import { Link, useNavigate, useSearchParams, useParams } from 'react-router-dom';
import Spinner from "./Spinner.jsx";
import { detectCityByGeo } from '../utils/geolocation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const Vets = () => {
  const [vets, setVets] = useState([]);
  const [loading, setLoading] = useState(true);
  const { serviceType: routeServiceType } = useParams();
  const [searchParams] = useSearchParams();
  const [sortOptions, setSortOptions] = useState([]);
  
  const [isNearMeActive, setIsNearMeActive] = useState(false);

  const [selectedServiceTypes, setSelectedServiceTypes] = useState(() => {
    const queryTypes = searchParams.getAll('serviceType');
    return queryTypes.length
      ? queryTypes
      : routeServiceType
        ? [routeServiceType]
        : [];
  });
  const [city, setCity] = useState(searchParams.get('city') || '');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalServices, setModalServices] = useState([]);
  const [modalVetId, setModalVetId] = useState(null);
  const [modalVetName, setModalVetName] = useState('');
  const [modalClinicName, setModalClinicName] = useState('');
  const [modalClinicCity, setModalClinicCity] = useState('');

  const navigate = useNavigate();

  const [vetInfo, setVetInfo] = useState('');

  useEffect(() => {
    fetch('/vet_info.md')
      .then((res) => res.text())
      .then((data) => setVetInfo(data))
      .catch((err) => console.error('Failed to load vet info:', err));
  }, []);

  useEffect(() => {
    const paramCity = searchParams.get('city');
    if (paramCity) {
      setCity(paramCity);
      setIsNearMeActive(true);
    }
  }, []);

  useEffect(() => {
    const fetchVets = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/auth/vets', {
          withCredentials: true,
        });
        setVets(data.vets);
      } catch (err) {
        console.error('Failed to load vets:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchVets();
  }, []);

  const toggleSortOption = (option) => {
    setSortOptions(prev => 
      prev.includes(option)
        ? prev.filter(opt => opt !== option)
        : [...prev, option]
    );
  };  

  const getDeliveryMethod = (serviceType) => {
    switch (serviceType) {
      case 'video-consultation':
        return 'Video Consultation';
      case 'in-clinic':
        return 'In-Clinic';
      case 'home-visit':
        return 'Home Visit';
      default:
        return '';
    }
  };
    
  useEffect(() => {
    const storedCity = searchParams.get('city');
    if (storedCity) {
      setCity(storedCity);
    } else {
      setCity(localStorage.getItem('userCity'));
    }
  }, [searchParams]);

    const handleFilter = async (type) => {
      let newTypes = [...selectedServiceTypes];
      // Toggle the clicked filter
      if (newTypes.includes(type)) newTypes = newTypes.filter(t => t !== type);
      else newTypes.push(type);

       if (type === 'video-consultation') {
        setIsNearMeActive(false);
      }

      // If adding in-clinic or home-visit, ensure city is set
      if (['home-visit', 'in-clinic'].includes(type) && !city) {
        const detected = await detectCityByGeo();
        if (!detected) {
          alert('Could not detect a nearby service city');
          return;
        }
        setCity(detected);
        localStorage.setItem('userCity', detected);
      }

      setSelectedServiceTypes(newTypes);
      // NOTE: we no longer call navigate here — URL stays as-is
  };

  const handleDoctorsNearMe = async () => {
    setIsNearMeActive(prev => !prev);
    setSelectedServiceTypes(prev => prev.filter(t => t !== 'video-consultation'));

    if (!city) {
      const detected = await detectCityByGeo();
      if (detected) {
        setCity(detected);
        localStorage.setItem('userCity', detected);
      }
    }
  };

  const isActive = type => selectedServiceTypes.includes(type);

  const effectiveServiceTypes = useMemo(() => {
    return selectedServiceTypes.length
      ? selectedServiceTypes
      : (routeServiceType ? [routeServiceType] : []);
  }, [selectedServiceTypes, routeServiceType]);

  const filteredVets = useMemo(() => {
    const cityKey = city.trim().toLowerCase();
    const hasCityFilter = Boolean(cityKey) && isNearMeActive;
    const hasServiceFilter = effectiveServiceTypes.length > 0;

    return vets
      .filter(vet => {
        // service match
        if (hasServiceFilter) {
          return effectiveServiceTypes.some(type => 
            vet.services?.some(s => 
              s.deliveryMethod.toLowerCase().replace(/\s+/g,'-') === type
            )
          );
        }
        return true;
      })
      .filter(vet => {
        if (hasCityFilter) {
          return vet.clinicId?.city?.toLowerCase() === cityKey;
        }
        return true;
      })
      .sort((a, b) => {
        for (const opt of sortOptions) {
          let diff = 0;
          switch (opt) {
            case 'experience':
              diff = (b.yearsOfExperience || 0) - (a.yearsOfExperience || 0);
              break;

            case 'fee':
              // find the cheapest service price for each vet
              const minA = Math.min(...(a.services || []).map(s => s.price || Infinity));
              const minB = Math.min(...(b.services || []).map(s => s.price || Infinity));
              diff = minA - minB;
              break;

            case 'availability': 
              diff = (b.availableToday ? 1 : 0) - (a.availableToday ? 1 : 0);
              break;
          }
          if (diff) return diff;
        }
        return 0;
      });
  }, [vets, effectiveServiceTypes, city, sortOptions, isNearMeActive]);

  const handleBookClick = (vet) => {
    const services = vet.services || [];
    if (services.length === 1) {
      const svc = services[0];
      let path = '';
      if (svc.deliveryMethod === 'Video Consultation') {
        path = `/consultation/video-consultation/vet/${vet._id}`;
      } else if (svc.deliveryMethod === 'In-Clinic') {
        path = `/consultation/in-clinic/vet/${vet._id}`;
      } else if (svc.deliveryMethod === 'Home Visit') {
        path = `/consultation/home-visit/vet/${vet._id}`;
      }
      navigate(path);
    } else {
      setModalServices(services);
      setModalVetId(vet._id);
      setModalVetName(vet.name);
      setModalClinicName(vet.clinicId.clinicName);
      setModalClinicCity(vet.clinicId.city);
      setIsModalOpen(true);
    }
  };

  return (
    
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-xl font-medium text-gray-800 mb-2">
        {filteredVets.length}{' '}
        Best Veterinarian{filteredVets.length !== 1 ? 's' : ''}{' '}
        {selectedServiceTypes.length === 1 && selectedServiceTypes[0] === 'video-consultation'
          ? 'available for video consultation'
          : `in ${city}`}
      </h1>
      <p className="text-gray-700 mb-6 text-xs">
        Also known as Animal Specialist, Pet Doctor, and Veterinary Physician
      </p>

      <div className="max-w-[58rem] flex gap-2 mb-6 text-xs font-medium text-lime-700 overflow-x-auto pb-2">
        <p className='text-lg mr-4'>Apply Filters: </p>
        <button 
          className={`px-3 py-2 border rounded-full text-lime-700 border-lime-700 whitespace-nowrap
            ${isNearMeActive ? 'bg-lime-200' : 'bg-white'
          }`}
          onClick={handleDoctorsNearMe}
        >
          Doctors Near Me
        </button>
        <button 
          className={`px-3 border rounded-full text-lime-700 border-lime-700 whitespace-nowrap
            ${sortOptions.includes('experience') ? 'bg-lime-200' : 'bg-white'}`}
            onClick={() => toggleSortOption('experience')}
        >
          Most Experienced
        </button>
        <button 
          className={`px-3 border rounded-full text-lime-700 border-lime-700 whitespace-nowrap
            ${sortOptions.includes('fee') ? 'bg-lime-200' : 'bg-white'}`}
            onClick={() => toggleSortOption('fee')}
        >
          Lowest Fee
        </button>
        <button 
          className={`px-3 border rounded-full text-lime-700 border-lime-700 whitespace-nowrap
            ${sortOptions.includes('availability') ? 'bg-lime-200' : 'bg-white'}`}
            onClick={() => toggleSortOption('availability')}
        >
          Available Today
        </button>
        <button 
          className={`px-3 border rounded-full text-lime-700 border-lime-700 whitespace-nowrap
            ${isActive('video-consultation')
              ? 'bg-lime-200 '
              : 'bg-white'
            }`}
          onClick={() => handleFilter('video-consultation')}
        >
          Video Consultation
        </button>
        <button 
          className={`px-3 border rounded-full text-lime-700 border-lime-700 whitespace-nowrap
            ${isActive('home-visit')
              ? 'bg-lime-200 '
              : 'bg-white'
            }`}
          onClick={() => handleFilter('home-visit')}
        >
          Home Visit
        </button>
      </div>

      {loading ? (
        <Spinner className="text-center py-4" />
      ) : (
        <div className="space-y-6">
          {filteredVets.map((vet) => (
            <div
              key={vet._id}
              className="max-w-[58rem] bg-white border border-gray-200 rounded-lg p-6 shadow-md shadow-gray-300"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-4">
                  <img
                    src={vet.profilePhotoUrl || '/avatar.png'}
                    alt={`Dr. ${vet.name}`}
                    className="w-[5rem] h-[5rem] rounded-full object-cover border border-gray-200"
                  />
                  <div>
                    <h2 className="text-lg text-gray-800">Dr. {vet.name}</h2>
                    <p className="text-sm text-gray-600">
                      {vet.specialization || 'Veterinarian'}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {vet.qualifications ||
                        'DVM (Doctor of Veterinary Medicine)'}
                    </p>
                    <div className="mt-6 flex gap-8">
                      <div>
                        <div className="font-medium text-sm text-gray-900">
                          {vet.yearsOfExperience || '10'} Years
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          Experience
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end space-y-2">
                  <Link
                    to={`/consultation/video-consultation/vet/${vet._id}`}
                    className="px-4 py-3 w-48 bg-white font-semibold rounded-sm text-teal-800 border border-teal-800 text-xs hover:bg-teal-700 hover:text-white transition flex items-center justify-center gap-2"
                  >
                    <Video className="w-4 h-4" />
                    Video Consultation
                  </Link>
                  <button
                    onClick={() => handleBookClick(vet)}
                    className="px-4 py-3 w-48 bg-orange-600 text-white text-sm rounded-sm hover:bg-orange-500 transition"
                  >
                    Book Appointment
                  </button>
                </div>
              </div>

              <div className="flex gap-1.5 overflow-x-auto mt-4 pb-2">
                {vet.services?.some(
                  (s) => s.deliveryMethod === 'Video Consultation'
                ) && (
                  <Link
                    to={`/consultation/video-consultation/vet/${vet._id}`}
                    className="min-w-[18rem] p-3 rounded-md border border-teal-800 hover:bg-gray-100 block"
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Video className="w-4 h-4 text-teal-700" />
                          <span className="font-medium text-gray-700 text-sm">
                            Online Video Consultation
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        {vet.services.find(s => s.deliveryMethod === 'Video Consultation')?.availableToday ? (
                          <span className="flex items-center text-xs text-green-600">
                            <span className="w-2 h-2 bg-green-600 rounded-full mr-2" />
                            Available today
                          </span>
                        ) : (
                          <span className="flex items-center text-xs text-green-600">
                            <span className="w-2 h-2 bg-green-600 rounded-full mr-2" />
                            Not available today
                          </span>
                        )}
                        <span className="font-normal text-xs">
                          Rs. {vet.services.find(s => s.deliveryMethod === 'Video Consultation')?.price}
                        </span>
                      </div>
                    </div>
                  </Link>
                )}

                {vet.services?.some((s) => s.deliveryMethod === 'In-Clinic') && (
                  <Link
                    to={`/consultation/in-clinic/vet/${vet._id}`}
                    className="min-w-[18rem] p-3 rounded-md border border-blue-800 hover:bg-gray-100 block"
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-blue-700" />
                          <span className="font-medium text-gray-700 text-sm">
                            {vet.clinicId?.clinicName} ({vet.clinicId?.city})
                          </span>
                        </div>
                      </div>
                       <div className="flex justify-between items-center">
        {vet.services.find(s => s.deliveryMethod === 'In-Clinic')?.availableToday ? (
          <span className="flex items-center text-xs text-green-600">
            <span className="w-2 h-2 bg-green-600 rounded-full mr-2" />
            Available today
          </span>
        ) : (
          <span className="flex items-center text-xs text-green-600">
            <span className="w-2 h-2 bg-green-600 rounded-full mr-2" />
            Not available today
          </span>
        )}
        <span className="font-normal text-xs">
          Rs. {vet.services.find(s => s.deliveryMethod === 'In-Clinic')?.price}
        </span>
      </div>
                    </div>
                  </Link>
                )}

                {vet.services?.some((s) => s.deliveryMethod === 'Home Visit') && (
                  <Link
                    to={`/consultation/home-visit/vet/${vet._id}`}
                    className="min-w-[18rem] p-3 rounded-md border border-purple-800 hover:bg-gray-100 block"
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Home className="w-4 h-4 text-purple-700" />
                          <span className="font-medium text-gray-700 text-sm">
                            Home Visit
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
        {vet.services.find(s => s.deliveryMethod === 'Home Visit')?.availableToday ? (
          <span className="flex items-center text-xs text-green-600">
            <span className="w-2 h-2 bg-green-600 rounded-full mr-2" />
            Available today
          </span>
        ) : (
          <span className="flex items-center text-xs text-green-600">
            <span className="w-2 h-2 bg-green-600 rounded-full mr-2" /> {/* Fixed color here */}
            Not available today
          </span>
        )}
        <span className="font-normal text-xs">
          Rs. {vet.services.find(s => s.deliveryMethod === 'Home Visit')?.price}
        </span>
      </div>
    </div>
                  </Link>
                )}
              </div>
            </div>
          ))}
          {vetInfo && (
            <div className="prose lg:prose-lg mx-auto px-4 py-20 text-[#1a1a1a]">
              <ReactMarkdown
                children={vetInfo}
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ node, ...props }) => <h2 className="text-base font-medium text-teal-800 my-6" {...props} />,
                  h2: ({ node, ...props }) => <h3 className="text-base font-normal text-teal-700 mt-6 mb-4" {...props} />,
                  p: ({ node, ...props }) => <p className="mb-4 leading-relaxed text-justify text-sm text-gray-600" {...props} />,
                  ul: ({ node, ...props }) => <ul className="list-disc ml-6 space-y-2 text-sm text-gray-700" {...props} />,
                  ol: ({ node, ...props }) => <ol className="list-decimal ml-5 space-y-2 text-sm text-gray-700" {...props} />, 
                  li: ({ node, ...props }) => <li className="leading-snug" {...props} />,
                  blockquote: ({ node, ...props }) => (
                    <blockquote className="border-l-4 border-blue-400 italic pl-4 text-teal-700 bg-blue-50 py-2 my-4" {...props} />
                  ),
                  strong: ({ node, ...props }) => <strong className="font-semibold text-gray-800" {...props} />
                }}              
              />
            </div>
          )}
        </div>
      )}

      {/* Modal Overlay */}
      {isModalOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg w-full max-w-md p-6 relative">
      <button
        onClick={() => setIsModalOpen(false)}
        className="absolute top-6 right-6 font-semibold text-gray-500 hover:text-gray-600 text-xs"
      >
        ✕
      </button>

      <div className="text-center mb-6">
        <h2 className="text-sm font-semibold text-gray-800">
          Book appointment with Dr. {modalVetName}
        </h2>
        <p className="text-gray-500 text-xs">Please select one</p>
      </div>

      <div className="space-y-1">
        {modalServices.map((s, idx) => {
          let Icon, serviceName;
          if (s.deliveryMethod === 'Video Consultation') {
            Icon = Video;
            serviceName = 'video-consultation';
          } else if (s.deliveryMethod === 'In-Clinic') {
            Icon = MapPin;
            serviceName = 'in-clinic';
          } else if (s.deliveryMethod === 'Home Visit') {
            Icon = Home;
            serviceName = 'home-visit';
          }

          return (
            <Link
              key={idx}
              to={`/consultation/${serviceName}/vet/${modalVetId}`}
              className="block p-2 border rounded-lg hover:bg-gray-50 transition-colors"
              onClick={() => setIsModalOpen(false)}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-3">
                  <Icon className="w-5 h-5 text-teal-800 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-800 text-sm capitalize">
                      {serviceName.replace('-', ' ')}
                    </h3>
                    {s.deliveryMethod === 'In-Clinic' && modalClinicCity && (
                      <p className="text-xs text-orange-700 mt-1">
                        Location: {modalClinicCity}
                      </p>
                    )}
                    <div className="mt-2 text-xs text-gray-600">
                      {s.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {s.location}
                        </div>
                      )}
                      <div className={`flex items-center gap-1 mt-1 ${
                        s.availableToday ? 'text-green-600' : 'text-red-600'
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${
                          s.availableToday ? 'bg-green-600' : 'bg-red-600'
                        }`} />
                        {s.availableToday 
                          ? 'Available today' 
                          : s.nextAvailable 
                            ? `Available ${new Date(s.nextAvailable).toLocaleDateString()}`
                            : 'Not available'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-right flex flex-col items-end">
                  <span className="font-semibold text-gray-800 text-sm">
                    <span className='text-xs'>Rs. </span>{s.price}
                  </span>
                  <span className='w-5 h-5 flex items-center justify-center bg-gray-200 rounded-full mt-1'>
                    <ChevronRight className="w-3.5 h-3.5 text-bold text-cyan-950" />
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default Vets;
