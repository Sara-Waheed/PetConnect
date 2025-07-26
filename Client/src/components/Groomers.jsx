import React, { useEffect, useState, useMemo, useRef } from 'react';
import axios from 'axios';
import { Video, MapPin, Home, ChevronRight, Scissors } from 'lucide-react';
import { Link, useNavigate, useSearchParams, useParams } from 'react-router-dom';
import Spinner from './Spinner.jsx';
import { detectCityByGeo } from '../utils/geolocation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const Groomers = () => {
const [groomers, setGroomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortOptions, setSortOptions] = useState([]);
  const [isNearMeActive, setIsNearMeActive] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState([]);        // holds keys: 'experience','fee','availability','home-visit','salon-visit'
  const [city, setCity] = useState('');

  const [searchParams] = useSearchParams();

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalServices, setModalServices] = useState([]);
  const [modalGroomerId, setModalGroomerId] = useState(null);
  const [modalGroomerName, setModalGroomerName] = useState('');
  const [modalClinicName, setModalClinicName] = useState('');
  const [modalClinicCity, setModalClinicCity] = useState('');

  const [groomerInfo, setGroomerInfo] = useState('');
  const navigate = useNavigate();

  // Read city from URL ?city= on mount / query-change
  useEffect(() => {
    const c = searchParams.get('city');
    if (c) {
      setCity(c);
    }
  }, [searchParams]);

  // Load grooming info markdown
  useEffect(() => {
    fetch('/pet_groomer_info.md')
      .then(r => r.text())
      .then(setGroomerInfo)
      .catch(console.error);
  }, []);

  // Fetch groomers list
  useEffect(() => {
    axios.get('http://localhost:5000/auth/groomers', { withCredentials: true })
      .then(({ data }) => setGroomers(data.groomers || []))
      .catch(err => {
        console.error('Failed to load groomers:', err);
        setGroomers([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // Toggle a sort option on/off
  const toggleSort = (opt) =>
    setSortOptions(s => s.includes(opt) ? s.filter(x => x !== opt) : [...s, opt]);

  // Toggle a service filter on/off
  const toggleFilter = (key) =>
    setSelectedFilters(f => f.includes(key) ? f.filter(x => x !== key) : [...f, key]);

  // Activate "Near Me"
  const handleNearMe = async () => {
    try {
      const detected = await detectCityByGeo();
      setCity(detected);
      setIsNearMeActive(true);
    } catch {
      alert('Could not determine your city');
    }
  };

  // Map our filter keys to the actual deliveryMethod strings
  const mapFilterToMethod = {
    'home-visit': 'Home Visit',
    'salon-visit': 'In-Clinic',
  };

  // Filter + sort groomers
  const filtered = useMemo(() => {
    const cityKey = city.trim().toLowerCase();

    return groomers
      .filter(g => {
        // 1) Near-me
        if (isNearMeActive && g.clinicId?.city?.toLowerCase() !== cityKey) {
          return false;
        }
        // 2) service filters
        if (selectedFilters.length) {
          return selectedFilters.every(key =>
            g.services.some(s => s.deliveryMethod === mapFilterToMethod[key])
          );
        }
        return true;
      })
      .sort((a, b) => {
        for (let opt of sortOptions) {
          let diff = 0;
          switch (opt) {
            case 'experience':
              diff = (b.yearsOfExperience || 0) - (a.yearsOfExperience || 0);
              break;
            case 'fee':
              const minA = Math.min(...(a.services||[]).map(s => s.price||Infinity));
              const minB = Math.min(...(b.services||[]).map(s => s.price||Infinity));
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
  }, [groomers, isNearMeActive, city, selectedFilters, sortOptions]);


  const handleBookClick = groomer => {
    const services = groomer.services || [];
    if (services.length === 1) {
      const svc = services[0];
      let path = '';
      if (svc.deliveryMethod === 'In-Clinic') {
        path = `/appointment/at-salon/groomer/${groomer._id}`;
      } else if (svc.deliveryMethod === 'Home Visit') {
        path = `/appointment/home-visit/groomer/${groomer._id}`;
      }
      navigate(path);
    } else {
      setModalServices(services);
      setModalGroomerId(groomer._id);
      setModalGroomerName(groomer.name);
      setModalClinicName(groomer.clinicId?.clinicName);
      setModalClinicCity(groomer.clinicId?.city);
      setIsModalOpen(true);
    }
  };

  const isActive = (type) => selectedFilters.includes(type);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-xl font-medium text-gray-800 mb-2">
        {filtered.length} Groomer
        {filtered.length !== 1 && 's'}{' '}
         in {city}
      </h1>
      <p className="text-gray-700 mb-6 text-xs">
        Professional pet grooming services near you
      </p>

      <div className="max-w-[58rem] flex gap-2 mb-6 text-xs font-medium text-lime-700 overflow-x-auto pb-2">
        <p className='text-lg mr-4'>Apply Filters: </p>
        <button 
          className={`px-3 py-2 border rounded-full text-lime-700 border-lime-700 whitespace-nowrap
            ${isNearMeActive ? 'bg-lime-200' : 'bg-white'}`}
          onClick={handleNearMe}
        >
          Groomers Near Me
        </button>
        <button 
          className={`px-3 border rounded-full text-lime-700 border-lime-700 whitespace-nowrap
            ${sortOptions.includes('experience') ? 'bg-lime-200' : 'bg-white'}`}
          onClick={() => toggleSort('experience')}
        >
          Most Experienced
        </button>
        <button 
          className={`px-3 border rounded-full text-lime-700 border-lime-700 whitespace-nowrap
            ${sortOptions.includes('fee') ? 'bg-lime-200' : 'bg-white'}`}
          onClick={() => toggleSort('fee')}
        >
          Lowest Fee
        </button>
        <button 
          className={`px-3 border rounded-full text-lime-700 border-lime-700 whitespace-nowrap
            ${sortOptions.includes('availability') ? 'bg-lime-200' : 'bg-white'}`}
          onClick={() => toggleSort('availability')}
        >
          Available Today
        </button>
        
        <button 
          className={`px-3 border rounded-full text-lime-700 border-lime-700 whitespace-nowrap
            ${isActive('home-visit') ? 'bg-lime-200' : 'bg-white'}`}
          onClick={() => toggleFilter('home-visit')}
        >
          Home Visit
        </button>
        <button
          className={`px-3 border rounded-full text-lime-700 border-lime-700 whitespace-nowrap
            ${isActive('salon-visit') ? 'bg-lime-200' : 'bg-white'
          }`}
          onClick={() => toggleFilter('salon-visit')}
        >
          Salon Visit
        </button>
      </div>

      {loading ? (
        <Spinner className="text-center py-4" />
      ) : (
        <div className="space-y-6">
          {filtered.map(groomer => (
            <div
              key={groomer._id}
              className="max-w-[58rem] bg-white border border-gray-200 rounded-lg p-6 shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-4">
                  <img
                    src={groomer.profilePhotoUrl || '/avatar.png'}
                    alt={`Dr. ${groomer.name}`}
                    className="w-[5rem] h-[5rem] rounded-full object-cover border border-gray-200"
                  />
                  <div>
                    <h2 className="text-lg text-gray-800">{groomer.name}</h2>
                    <p className="text-sm text-gray-600">{groomer.clinicId?.clinicName}</p>
                    <div className="mt-6 flex gap-8 text-xs">
                      <div>
                        <div className="font-medium text-gray-900">
                          {groomer.yearsOfExperience || 5} Years
                        </div>
                        <div className="text-gray-500">Experience</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end space-y-2">
                  <button
                    onClick={() => handleBookClick(groomer)}
                    className="px-4 py-3 w-48 bg-orange-600 text-white text-sm rounded-sm hover:bg-orange-500 transition"
                  >
                    Book Appointment
                  </button>
                </div>
              </div>

              <div className="flex gap-1.5 overflow-x-auto mt-4 pb-2">
                {groomer.services?.map((s, idx) => {
                  let Icon, label, borderColor;
                  switch (s.deliveryMethod) {
                    case 'In-Clinic':
                      Icon = Scissors; label = groomer.clinicId?.clinicName; borderColor = 'blue';
                      break;
                    case 'Home Visit':
                      Icon = Home; label = 'Home Visit'; borderColor = 'purple';
                      break;
                    default:
                      return null;
                  }
                  return (
                    <Link
                      key={idx}
                      to={`/appointment/${s.deliveryMethod.toLowerCase().replace(/\s/g, '-')}/groomer/${groomer._id}`}
                      className={`min-w-[18rem] p-3 rounded-md border border-${borderColor}-800 hover:bg-gray-100 block`}
                    >
                      <div className="flex justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className={`w-4 h-4 text-${borderColor}-700`} />
                          <span className="font-medium text-gray-700 text-sm">{label}</span>
                        </div>
                        <span className="font-normal text-xs">Rs. {s.price}</span>
                      </div>
                      <div className="mt-1 text-xs text-green-600 flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-600 rounded-full" />
                        {s.availableToday 
                          ? 'Available today' 
                          : 'Not Available today'}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

          {groomerInfo && (
            <div className="prose lg:prose-lg mx-auto px-4 py-20 text-[#1a1a1a]">
            <ReactMarkdown
                children={groomerInfo}
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
                Book appointment with {modalGroomerName}
              </h2>
              <p className="text-gray-500 text-xs">Please select one</p>
            </div>

            <div className="space-y-1">
              {modalServices.map((s, idx) => {
                let Icon, serviceName;
                console.log("deilvery method: ", s.deliveryMethod);
                if (s.deliveryMethod === 'In-Clinic') {
                  Icon = MapPin;
                  serviceName = 'In Clinic';
                  console.log("modal clinic name: ", serviceName);
                } else if (s.deliveryMethod === 'Home Visit') {
                  Icon = Home;
                  serviceName = 'Home Visit';
                }

                return (
                  <Link
                    key={idx}
                    to={`/appointment/${serviceName.toLowerCase().replace(/\s/g, '-')}/groomer/${modalGroomerId}`}
                    className="block p-2 border rounded-lg hover:bg-gray-50 transition-colors"
                    onClick={() => setIsModalOpen(false)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-3">
                        <Icon className="w-5 h-5 text-teal-800 mt-1" />
                        <div>
                          <h3 className="font-semibold text-gray-800 text-sm">
                            {serviceName}
                          </h3>
                          {s.deliveryMethod === 'At Salon' && modalClinicCity && (
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
                            <div className="flex items-center gap-1 mt-1 text-green-600">
                              <span className="w-2 h-2 bg-green-600 rounded-full" />
                              {s.availableToday ? 'Available today' : `Available ${s.nextAvailable}`}
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

export default Groomers;