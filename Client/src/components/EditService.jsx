import React, { useState, useEffect, useRef } from "react";
import axios from 'axios';
import { useNavigate, useParams } from "react-router-dom";
import { useNavbar } from './NavbarContext';
import Spinner from './Spinner';
import { ChevronLeft, ChevronDown, ChevronUp } from 'lucide-react';

const EditService = () => {
  const { userRole } = useNavbar();
  const { serviceId } = useParams();
  const navigate = useNavigate();

  // refs for dropdowns
  const dropdownRef = useRef(null);
  const servicesDropdownRef = useRef(null);

  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [priceError, setPriceError] = useState('');
  const [durationError, setDurationError] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [serviceDropdownOpen, setServiceDropdownOpen] = useState(false);
  const [expandedDays, setExpandedDays] = useState({});

  // Toggle day expansion
  const toggleDayExpansion = (day) => {
    setExpandedDays(prev => ({ ...prev, [day]: !prev[day] }));
  };

  // form data
  const [formData, setFormData] = useState({
    description: "",
    price: "",
    duration: "",
    isPackage: false,
    customService: "",
    services: [],
    maxPets: 1,
    availability: [],
    deliveryMethod: "",
    days: [],
    startTime: "",
    endTime: "",
  });

  // list of services per role
  const roleServices = {
    vet: [/* same as AddService array */
      "General Consultation", "Health Check-ups", "Vaccinations", "Microchipping", "Prescription Services",
      "Dental Care (Cleanings, Exams)", "Dentistry (Extractions, Advanced Treatments)", "Spaying/Neutering",
      "General Surgery", "Emergency Surgery", "Diagnostic Imaging (X-rays, Ultrasounds)",
      "Lab Tests (Bloodwork, Urinalysis)", "Emergency Care", "Other"
    ],
    groomer: [
      "Bathing", "Nail Trimming", "Haircuts/Styling", "Ear Cleaning", "Flea & Tick Treatment",
      "Deshedding Services", "Anal Gland Cleaning", "Teeth Brushing", "Full Grooming Packages", "Other"
    ],
    sitter: [
      "Pet Sitting at Home", "Boarding Services", "Walking Services", "Feeding & Medication Administration",
      "Playtime & Exercise", "Overnight Stay", "House Visits", "Special Needs Care (e.g., senior or disabled pets)", "Other"
    ],
  };

  // delivery options
  const deliveryOptions = [
    ...(userRole === 'vet'
      ? [{ value: 'Video Consultation', label: 'Video Consultation', description: 'Connect via secure video calls.' }]
      : []),
    { value: 'In-Clinic', label: 'In-Clinic', description: 'Host pets at your clinic.' },
    { value: 'Home Visit', label: 'Home Visit', description: 'On-site visits at owner’s home.' },
  ];

  // fetch existing service
  useEffect(() => {
    const fetchService = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`http://localhost:5000/auth/service/${serviceId}`, {
          params: { userRole }, withCredentials: true
        });
        const svc = res.data.data;
        setFormData({
          description: svc.description || "",
          price: svc.price || "",
          duration: svc.duration || "",
          isPackage: svc.isPackage || false,
          customService: svc.customService || "",
          services: svc.services || [],
          maxPets: svc.maxPets || 1,
          availability: svc.availability || [],
          deliveryMethod: svc.deliveryMethod || "",
          days: [],
          startTime: "",
          endTime: "",
        });
      } catch (err) {
        setError('Error fetching service data.');
      } finally {
        setLoading(false);
      }
    };
    fetchService();
  }, [serviceId, userRole]);

  // close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (servicesDropdownRef.current && !servicesDropdownRef.current.contains(e.target)) {
        setServiceDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // toggle service selection
  const toggleService = (service) => {
    setFormData(prev => {
      const has = prev.services.includes(service);
      return {
        ...prev,
        services: has
          ? prev.services.filter(s => s !== service)
          : [...prev.services, service],
        customService: !has && service === 'Other' ? '' : prev.customService
      };
    });
  };

  // handle changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // price validation
    if (name === 'price') {
      const val = Number(value);
      if (value === '' || isNaN(val)) setPriceError('');
      else if (val < 500) setPriceError('Price must be at least 500 PKR.');
      else if (val > 10000) setPriceError('Price must not exceed 10,000 PKR.');
      else setPriceError('');
    }
    // duration validation
    if (name === 'duration') {
      const dur = Number(value);
      if (value === '' || isNaN(dur)) setDurationError('');
      else if (dur < 15 || dur > 30) setDurationError('Duration must be between 15 and 30 minutes.');
      else setDurationError('');
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  // add availability slots
  const handleAddAvailability = () => {
    const { days, startTime, endTime, duration } = formData;
    setError('');
    if (!days || days.length === 0) return setError('Please select at least one day.');
    if (!startTime) return setError('Please select a start time.');
    if (!endTime) return setError('Please select an end time.');
    if (!duration) return setError('Please enter the duration.');

    const start = new Date(`1970-01-01T${startTime}:00`);
    let end = new Date(`1970-01-01T${endTime}:00`);
    if (end <= start) end = new Date(end.getTime() + 24*60*60*1000);

    const slotMs = duration * 60000;
    const totalMs = end - start;
    if (slotMs > totalMs) {
      const maxMin = totalMs/60000;
      return setError(`Maximum duration is ${maxMin} minutes for that range.`);
    }

    const fmt = t => {
      const h = t.getHours();
      const m = String(t.getMinutes()).padStart(2,'0');
      const ap = h>=12?'PM':'AM';
      const hr = h%12||12;
      return `${hr}:${m} ${ap}`;
    };
    const slots = [];
    let cur = start;
    while (cur < end) {
      const s = fmt(cur);
      cur = new Date(cur.getTime()+slotMs);
      if (cur> end) break;
      slots.push({ startTime: s, endTime: fmt(cur) });
    }

    const newEntries = formData.days.map(d => ({ day: d, slots }));
    setFormData(prev => ({
      ...prev,
      availability: [...prev.availability, ...newEntries],
      days: [], startTime: '', endTime: '', duration: ''
    }));
  };

  // delete slot
  const handleDeleteSlot = (day, slotIndex) => {
    const updatedAvailability = formData.availability.map(item => {
      if (item.day === day) {
        const updatedSlots = item.slots.filter((_, idx) => idx !== slotIndex);
        return { ...item, slots: updatedSlots };
      }
      return item;
    }).filter(item => item.slots.length > 0);

    setFormData(prev => ({ ...prev, availability: updatedAvailability }));
  };

  const groupedAvailability = formData.availability.reduce((acc, item) => {
    if (!acc[item.day]) acc[item.day] = [];
    acc[item.day].push(...item.slots);
    return acc;
  }, {});


  // submit updated data
  const handleSubmit = async e => {
    e.preventDefault();
    if (formData.availability.length === 0) {
      setError('Please add a slot');
      return;
    }
    if(formData.deliveryMethod.length === 0){
      setError('Please add a delivery method');
      return;
    }
    try {
      await axios.put(`http://localhost:5000/auth/edit-service/${serviceId}`, formData, {
        params: { userRole }, withCredentials: true
      });
      navigate('/services');
    } catch (err) {
      console.error(err);
      setError('Failed to update the service.');
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="max-w-4xl mx-auto bg-orange-200 mt-5 mb-10 p-8 rounded-lg shadow-lg">
      {loading ? (
        <div className="flex justify-center items-center p-4 m-20"><Spinner /></div>
      ) : (
        <>  
          <button onClick={handleBack} className="flex items-center mb-2 font-semibold hover:underline">
            <ChevronLeft className="w-5 h-5"/> Back
          </button>
          <h2 className="text-2xl font-semibold text-center text-teal-600 mb-8">
            {userRole==='vet'? 'Edit Veterinary Service'
             : userRole==='groomer'? 'Edit Grooming Service'
             : 'Edit Sitting Service'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {/* Services dropdown */}
              <div className="relative" ref={servicesDropdownRef}>
                <label className="block text-gray-700 font-semibold mb-2">Service Name</label>
                <button type="button" onClick={()=>setServiceDropdownOpen(o=>!o)}
                  className="w-full text-left px-4 py-2 bg-white border border-gray-300 rounded-lg flex justify-between items-center">
                  Select one or more services
                  {serviceDropdownOpen ? <ChevronUp/> : <ChevronDown/>}
                </button>
                {serviceDropdownOpen && (
                  <div className="absolute z-10 mt-1 w-full bg-white border rounded-lg shadow-lg max-h-60 overflow-auto">
                    {(roleServices[userRole]||[]).map(svc=> (
                      <label key={svc} className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer">
                        <input type="checkbox" className="form-checkbox h-4 w-4 text-teal-600 mr-2"
                          checked={formData.services.includes(svc)}
                          onChange={()=>toggleService(svc)} />
                        <span>{svc}</span>
                      </label>
                    ))}
                    {formData.services.includes('Other') && (
                      <div className="px-4 py-2 border-t">
                        <input type="text" name="customService" placeholder="Describe your custom service"
                          value={formData.customService} onChange={handleInputChange}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-teal-500" />
                      </div>
                    )}
                  </div>
                )}
                {formData.services.length>0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {formData.services.map(s=> <span key={s} className="inline-flex items-center px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-sm">{s}</span>)}
                  </div>
                )}

              </div>
              {/* Price */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Price</label>
                <input type="number" name="price" min="500" max="10000"
                  value={formData.price} onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-teal-500" required />
                {priceError && <p className="text-red-500 text-sm mt-1">{priceError}</p>}
              </div>
            </div>

            {/* Delivery Methods */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">How will you deliver these services?</label>
              <div className="flex flex-col space-y-3">
                {deliveryOptions.map(opt => (
                  <label 
                    key={opt.value} 
                    className="flex items-start px-4 py-2 border bg-white rounded-lg"
                  >
                    <input 
                      type="radio" 
                      name="deliveryMethod"
                      className="form-radio h-5 w-5 accent-gray-500 mt-1"
                      checked={formData.deliveryMethod === opt.value}
                    />
                    <div className="ml-3">
                      <span className="font-medium text-teal-700">{opt.label}</span>
                      <p className="text-gray-500 text-sm">{opt.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Description</label>
              <textarea name="description" rows="4"
                value={formData.description} onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-teal-500" />
            </div>

            {/* Duration & Conditional fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Duration (minutes)</label>
                <input type="number" name="duration" min="15" max="30" step="5"
                  value={formData.duration} onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-teal-500" />
                {durationError && <p className="text-red-500 text-sm mt-1">{durationError}</p>}
              </div>
              {userRole==='groomer' && (
                <div>
                  <label className="block text-gray-700 font-semibold my-2">Package Service?</label>
                  <input type="checkbox" name="isPackage"
                    checked={formData.isPackage} onChange={handleCheckboxChange}
                    className="w-5 h-5 accent-teal-600 focus:ring-teal-500" />
                </div>
              )}
              {userRole==='sitter' && (
                <div>
                  <label className="block text-gray-700 font-semibold my-2">Maximum Number of Pets</label>
                  <input type="number" name="maxPets" min="1"
                    value={formData.maxPets} onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-teal-500" />
                </div>
              )}
            </div>

            {/* Availability */}
            <div>
              <h3 className="text-lg font-semibold text-teal-600 mb-4">Add Availability</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="relative" ref={dropdownRef}>
                  <label className="block text-gray-700 font-semibold mb-2">Day(s)</label>
                  <div onClick={()=>setDropdownOpen(o=>!o)} className="w-full px-4 py-2 border rounded-lg bg-white cursor-pointer focus:ring-teal-500">
                    {formData.days && formData.days.length>0
                      ? formData.days.includes('All Days') ? 'All Days' : formData.days.join(', ')
                      : 'Select Days'
                    }
                  </div>
                  {dropdownOpen && (
                    <div className="absolute z-10 w-full bg-white border rounded-lg shadow-lg mt-1 max-h-60 overflow-auto">
                      <label className="flex items-center px-4 py-2 hover:bg-gray-100">
                        <input type="checkbox" checked={formData.days.length===7}
                          onChange={()=> setFormData(prev=> ({ ...prev, days: prev.days.length===7 ? [] : ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'] }))}
                          className="mr-2"/>
                        Select All
                      </label>
                      {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map(day=>(
                        <label key={day} className="flex items-center px-4 py-2 hover:bg-gray-100">
                          <input type="checkbox" checked={formData.days.includes(day)}
                            onChange={()=>{
                              const sel = formData.days.includes(day)
                                ? formData.days.filter(d=>d!==day)
                                : [...formData.days, day];
                              setFormData(prev=> ({ ...prev, days: sel }));
                            }} className="mr-2"/>
                          {day}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Start Time</label>
                  <input type="time" name="startTime" value={formData.startTime}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-teal-500" />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">End Time</label>
                  <input type="time" name="endTime" value={formData.endTime}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-teal-500" />
                </div>
              </div>
              <button type="button" onClick={handleAddAvailability}
                className="w-1/4 mt-4 px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 focus:ring-teal-500">
                Add Slot
              </button>
            </div>

            {/* Render availability slots */}
            {Object.entries(groupedAvailability).length > 0 && (
              <div className="mt-6">
                <h4 className="text-lg font-semibold text-orange-600 mb-4">Availability Slots</h4>
                <div className="space-y-3">
                  {Object.entries(groupedAvailability).map(([day, slots]) => {
                    // Parse and sort function
                    const parseTime = timeStr => {
                      const [time, modifier] = timeStr.split(' ');
                      let [h, m] = time.split(':');
                      h = parseInt(h);
                      m = parseInt(m || '00');
                      if (modifier === 'PM' && h !== 12) h += 12;
                      if (modifier === 'AM' && h === 12) h = 0;
                      return h * 60 + m;
                    };

                    // Format function
                    const formatTime = minutes => {
                      const h = Math.floor(minutes / 60);
                      const m = minutes % 60;
                      const modifier = h >= 12 ? 'PM' : 'AM';
                      const hr = h % 12 || 12;
                      return `${hr}:${m.toString().padStart(2, '0')} ${modifier}`;
                    };

                    // Sort all slots by start time (AM first)
                    const sortedSlots = [...slots].sort((a, b) => 
                      parseTime(a.startTime) - parseTime(b.startTime)
                    );

                    // Merge contiguous slots for collapsed view
                    const mergedBlocks = (() => {
                      const timeSlots = sortedSlots.map(s => ({ 
                        start: parseTime(s.startTime), 
                        end: parseTime(s.endTime) 
                      }));

                      let merged = [];
                      let current = timeSlots[0];
                      
                      for (let i = 1; i < timeSlots.length; i++) {
                        const next = timeSlots[i];
                        if (next.start <= current.end) {
                          current.end = Math.max(current.end, next.end);
                        } else {
                          merged.push(current);
                          current = next;
                        }
                      }
                      merged.push(current);

                      return merged.map(b => ({
                        startTime: formatTime(b.start),
                        endTime: formatTime(b.end)
                      }));
                    })();

                    return (
                      <div key={day} className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <button
                          className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
                          onClick={(e) => {
                            e.preventDefault();
                            toggleDayExpansion(day);
                          }}
                        >
                          <div className="flex items-center gap-x-3">
                            <span className="text-teal-700 font-semibold">{day}</span>
                            <div className="flex flex-wrap items-center gap-x-1">
                              {mergedBlocks.map((block, i) => (
                                <React.Fragment key={i}>
                                  <span className="text-gray-500 text-sm">
                                    {block.startTime} - {block.endTime}
                                  </span>
                                  {i < mergedBlocks.length - 1 && (
                                    <span className="text-sm font-bold text-orange-700 mx-1">
                                      and
                                    </span>
                                  )}
                                </React.Fragment>
                              ))}
                            </div>
                          </div>
                          <ChevronDown
                            className={`w-5 h-5 text-gray-600 transform transition-transform ${
                              expandedDays[day] ? 'rotate-180 bg-gray-200' : ''
                            }`}
                          />
                        </button>
                        
                        {expandedDays[day] && (
                          <ul className="px-4 pb-3 space-y-2 bg-gray-100">
                            {sortedSlots.map((slot, slotIndex) => {
                              // Find original index for delete functionality
                              const originalIndex = slots.findIndex(s => 
                                s.startTime === slot.startTime && 
                                s.endTime === slot.endTime
                              );
                              
                              return (
                                <li
                                  key={slotIndex}
                                  className="flex items-center justify-between border-b border-b-gray-300 bg-gray-100 px-3 py-2"
                                >
                                  <span className="text-gray-600 text-sm">
                                    {slot.startTime} - {slot.endTime}
                                  </span>
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      handleDeleteSlot(day, originalIndex);
                                    }}
                                    className="text-red-500 hover:text-red-600 focus:outline-none text-sm"
                                  >
                                    Remove
                                  </button>
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {error && <p className="text-red-600 text-center text-md font-medium mt-4">{error}</p>}

            <div className="flex justify-center">
              <button type="submit"
                className="w-1/3 px-3 py-2 bg-gradient-to-r from-orange-500 to-orange-700 text-white text-lg font-semibold rounded-lg hover:opacity-95">
                Save Service
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default EditService;
