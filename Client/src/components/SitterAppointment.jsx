import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Calendar, ThumbsUp, Star, ChevronLeft, ChevronRight, MapPin, Home } from 'lucide-react';
import { useParams } from 'react-router-dom';
import sunrise from '../assets/sunrise.png';
import sunset from '../assets/sunset.png';
import eveningIcon from '../assets/evening.png';
import Spinner  from "./Spinner.jsx";

const WINDOW_SIZE = 4;

const SitterAppointment = () => {
  const { sitterId, serviceType } = useParams();

  const [nextAvailableDate, setNextAvailableDate] = useState(null);
  const [sitter, setSitter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [availableDates, setAvailableDates] = useState([]);
  const [windowStart, setWindowStart] = useState(0);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const [selectedDate, setSelectedDate] = useState('Today');
  const [selectedIsoDate, setSelectedIsoDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState(null);

  const providerType = 'sitter';
  const providerId = sitterId;

  //fetch reviews
  useEffect(() => {
    // don’t even try if we’re missing data
    if (!providerType || !sitterId) return;

    const fetchReviews = async () => {
      setLoading(true);
      setError(null);

      try {
        const url = `http://localhost:5000/auth/reviews/${providerType}/${providerId}`;
        const res = await axios.get(url);

        setReviews(res.data.reviews || []);
      } catch (err) {
        console.error('Error loading reviews:', err);
        setError(
          err.response?.data?.message 
            ? err.response.data.message 
            : err.message || 'Something went wrong'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [providerType, providerId]);

  const [timeSlots, setTimeSlots] = useState({
    morning: [],
    afternoon: [],
    evening: []
  });

  useEffect(() => {
    const initialize = async () => {
      try {
        setLoading(true);

        // fetch sitter + services (each service has its own availability)
        const { data } = await axios.get(
          `http://localhost:5000/auth/sitters/${sitterId}`,
          {
            params: {
              serviceType: serviceType.toLowerCase().replace(' ', '-')
            },
            withCredentials: true
          }
        );

        if (!data) throw new Error('No data received from server');
        setSitter(data);

       // Change UTC date generation to LOCAL date with UTC conversion
        // Correct UTC date generation
      const today = new Date();
      const nextDates = Array.from({ length: 30 }).map((_, i) => {
        const dt = new Date(today);
        dt.setDate(today.getDate() + i); // Local date manipulation
        
        // Convert to UTC date at midnight
        const utcDate = new Date(Date.UTC(
          dt.getFullYear(),
          dt.getMonth(),
          dt.getDate()
        ));
        
        return {
          display: i === 0 ? 'Today' : 
            dt.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric'
            }),
          isoDate: utcDate.toISOString().split('T')[0],
          dayName: dt.toLocaleDateString('en-US', { weekday: 'long' }) // Local day name
        };
      });
        setAvailableDates(nextDates);

      } catch (err) {
        console.error('AxiosError:', err);
        if (err.response) {
          console.group('⬇️ server response (500) ⬇️');
          console.error('status:', err.response.status);
          console.error('body:', err.response.data);
          console.groupEnd();
        }
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, [sitterId, serviceType]);

  // once availableDates is ready, load slots for Today exactly once
  useEffect(() => {
    if (availableDates.length > 0) {
      handleDateSelect('Today', availableDates);
    }
  }, [availableDates]);

  const normalizeMeridiem = m => m.trim().toUpperCase().replace(/\./g, '');

  // 2) Updated fetchSlotsForDate()
  const fetchSlotsForDate = async (isoDate, dayName) => {
    if (!sitter || !Array.isArray(sitter.services) || sitter.services.length === 0) {
      return [];
    }
  
    try {
        console.log("service  type in sitter app: ", serviceType);
      const { data } = await axios.get(
        `http://localhost:5000/auth/sitters/${sitterId}`,
        {
          params: { date: isoDate, serviceType },
          withCredentials: true
        }
      );
  
      // pick the first (and only) service for this sitter
      const svc = (data.services && data.services[0]) || {};
  
      // **collect all blocks matching this day** and flatten their slots**
      const matchingBlocks = Array.isArray(svc.availability)
        ? svc.availability.filter(a =>
            a.day.toLowerCase() === dayName.toLowerCase()
          )
        : [];
  
      // flatten all the slots from each block
      const allSlots = matchingBlocks.reduce(
        (acc, block) => acc.concat(block.slots),
        []
      );

      // ** NEW: only keep slots that are neither booked nor pending **
      const freeSlots = allSlots.filter(
        slot => slot.status !== "booked" && slot.status !== "pending"
      );
  
      console.log(`Free slots for ${dayName} (${isoDate}):`, freeSlots);
      return freeSlots;
  
    } catch (err) {
      console.error('Error fetching slots:', err);
      return [];
    }
  };  

  const handleDateSelect = async (display, list = availableDates) => {
    if (slotsLoading) return;
    setSlotsLoading(true);
    
    setSelectedDate(display);
    setSelectedSlot(null);
    setNextAvailableDate(null);

    const dateObj = list.find(d => d.display === display);
    if (!dateObj) {
      setSlotsLoading(false);
      return;
    }

    const dayName = dateObj.dayName;
    const iso = dateObj.isoDate;
    setSelectedIsoDate(iso);

    try {
      let slots = await fetchSlotsForDate(iso, dayName);
      // In your handleDateSelect function, update the slot filtering logic:
if (display === 'Today') {
  const now = new Date();
  
  // Create date in local timezone for comparison
  const localDateStr = now.toISOString().split('T')[0];
  
  slots = slots.filter(s => {
    const [t, mer] = s.startTime.split(' ');
    const normalizedMer = normalizeMeridiem(mer);
    let [h, m] = t.split(':').map(Number);

    // Convert to 24h format
    if (normalizedMer === 'PM' && h !== 12) h += 12;
    if (normalizedMer === 'AM' && h === 12) h = 0;

    // Create slot date in LOCAL timezone
    const slotDate = new Date(`${localDateStr}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`);
    
    // Compare against current local time
    return slotDate > now;
  });
}

    //   if (display === 'Today') {
    //   const now = new Date();
    //   const localMidnight = new Date(now);
    //   localMidnight.setHours(0, 0, 0, 0); // Local midnight
    //   const localMidnightUTC = Date.UTC(
    //     localMidnight.getFullYear(),
    //     localMidnight.getMonth(),
    //     localMidnight.getDate()
    //   );

    //   slots = slots.filter(s => {
    //     const [t, mer] = s.startTime.split(' ');
    //     const normalizedMer = normalizeMeridiem(mer);
    //     let [h, m] = t.split(':').map(Number);

    //     if (normalizedMer === 'PM' && h !== 12) h += 12;
    //     if (normalizedMer === 'AM' && h === 12) h = 0;

    //     // Create slot date in UTC
    //     const slotUTCDate = new Date(`${iso}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00Z`);
        
    //     // Compare against local day in UTC
    //     return slotUTCDate.getTime() >= localMidnightUTC && 
    //            slotUTCDate.getTime() > Date.now();
    //   });
    // }
      const uniqueSlots = Array.from(new Set(slots.map(s => s.startTime)))
        .map(startTime => slots.find(s => s.startTime === startTime));

      const categorized = categorizeSlots(uniqueSlots);
      setTimeSlots(categorized);

      if (Object.values(categorized).every(arr => arr.length === 0)) {
        const nextDate = await findNextAvailableDate(display, list);
        setNextAvailableDate(nextDate);
      }
    } catch (err) {
      console.error("Failed to fetch slots:", err);
      setTimeSlots({ morning: [], afternoon: [], evening: [] });
      const nextDate = await findNextAvailableDate(display, list);
      setNextAvailableDate(nextDate);
    } finally {
      setSlotsLoading(false);
    }

    const idx = list.findIndex(d => d.display === display);
    if (idx < windowStart) setWindowStart(idx);
    else if (idx >= windowStart + WINDOW_SIZE) setWindowStart(idx - WINDOW_SIZE + 1);
  };
  
  const categorizeSlots = (slots) => {
    const categorized = {
      morning: [],
      afternoon: [],
      evening: []
    };

    slots.forEach(s => {
      let [t, mer] = s.startTime.split(' ');
      mer = normalizeMeridiem(mer);
      let [h] = t.split(':').map(Number);
      if (mer === 'PM' && h !== 12) h += 12;
      if (mer === 'AM' && h === 12) h = 0;

      if (h < 12) categorized.morning.push(s);
      else if (h < 17) categorized.afternoon.push(s);
      else categorized.evening.push(s);
    });

    return categorized;
  };

  const findNextAvailableDate = async (currentDisplay, dateList) => {
    const currentIdx = dateList.findIndex(d => d.display === currentDisplay);
  
    for (let i = currentIdx + 1; i < dateList.length; i++) {
      const { isoDate, dayName, display, formatted } = dateList[i];
  
      // pass both isoDate and dayName
      const nextSlots = await fetchSlotsForDate(isoDate, dayName);
  
      if (nextSlots.length > 0) {
        const d = new Date(isoDate);
        return {
          display,
          formatted: formatted || d.toLocaleDateString('en-US', {
            weekday: 'short',
            month:   'short',
            day:     'numeric'
          }),
          isoDate
        };
      }
    }
    
    return null;
  };  

  const handlePrev = () => {
    const idx = availableDates.findIndex(d => d.display === selectedDate);
    if (idx > 0) handleDateSelect(availableDates[idx - 1].display);
  };

  const handleNext = () => {
    const idx = availableDates.findIndex(d => d.display === selectedDate);
    if (idx < availableDates.length - 1) handleDateSelect(availableDates[idx + 1].display);
  };

  const handleBooking = async () => {
    if (!selectedIsoDate || !selectedSlot) {
      return alert("Please select both a date and a time slot");
    }

    try {
      const allSlots = [...timeSlots.morning, ...timeSlots.afternoon, ...timeSlots.evening];
      const slotObj = allSlots.find(s => s.startTime === selectedSlot);

      if (!slotObj) return alert("Invalid time slot selected");

      let consultationType;

     if(serviceType === 'in-clinic'){
        consultationType = 'drop-off';
        console.log("cllinic");
      } else if(serviceType === 'home-visit'){
        consultationType = 'home';
        console.log("home");

      }

      const payload = {
        date: selectedIsoDate,
        startTime: slotObj.startTime,
        endTime: slotObj.endTime,
        fee: sitter.services?.[0]?.price,
        consultationType,
      };

      const { data } = await axios.post(
        `http://localhost:5000/auth/appointments/sitter/${sitterId}`,
        payload,
        { withCredentials: true }
      );

      window.location.href = data.url;
    } catch (err) {
      console.error("Booking error:", err);
      alert(err.response?.data?.message || "Booking failed due to a server error");
    }
  };

  if (!sitter) return <Spinner className="text-center py-4" />;

  const windowDates = availableDates.slice(windowStart, windowStart + WINDOW_SIZE);

  return (
    <div className="min-h-screen bg-gray-50 pt-10">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold">{sitter.name}</h2>
        <div className="flex items-center gap-2 text-gray-600 mt-2 text-sm">
          
          {serviceType === 'in-clinic' && (
            <>
              <MapPin className="w-4 h-4 text-blue-600" />
              <span>At-Sitter Home</span>
            </>
          )}
          {serviceType === 'home-visit' && (
            <>
              <Home className="w-4 h-4 text-purple-600" />
              <span>Home Visit</span>
            </>
          )}
        </div>

        <p className="mt-2 text-lg font-semibold">Fee: Rs. {sitter.services?.[0]?.price}</p>
      </div>

      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6 mt-5">
        <div className="flex items-center border-b pb-2 gap-2">
          <button onClick={handlePrev} className="p-2"><ChevronLeft /></button>
          <div className="flex-1 min-w-0 overflow-x-auto scrollbar-thin scrollbar-thumb-teal-500 scrollbar-track-gray-200 scrollbar-thumb-rounded-full">
            <div className="flex gap-2 whitespace-nowrap px-1">
              {windowDates.map(d => (
                <button
                  key={d.display}
                  onClick={() => handleDateSelect(d.display)}
                  className={`flex-shrink-0 w-36 py-2 text-sm flex items-center justify-center gap-1 ${
                    selectedDate === d.display
                      ? 'text-orange-400 border-b-4 border-orange-400 transition-all duration-300'
                      : 'text-gray-600'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  {d.display}
                </button>
              ))}
            </div>
          </div>
          <button onClick={handleNext} className="p-2"><ChevronRight /></button>
        </div>

        {selectedDate && (
          <div className="mt-6 space-y-6">
            {slotsLoading ? (
              <Spinner className="text-center py-4" />
            ) : (
              <>
                {timeSlots.morning.length > 0 && (
                  <div>
                    <p className="flex items-center text-xs text-gray-400 mb-2">
                      <img src={sunrise} className="w-6 h-6 mr-2" alt="sunrise" /> Morning Slots
                    </p>
                    <div className="grid grid-cols-5 ml-7 gap-2">
                      {timeSlots.morning.map((s, i) => (
                        <button
                          key={`morning-${i}-${s.startTime}`}
                          onClick={() => setSelectedSlot(s.startTime)}
                          className={`px-3 py-2 border rounded-lg text-sm ${
                            selectedSlot === s.startTime
                              ? 'text-orange-400 border-orange-400 bg-orange-50'
                              : 'border-gray-200 hover:text-orange-400 hover:border-orange-400 hover:bg-orange-100 transition-all duration-500'
                          }`}
                        >
                          {s.startTime}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {timeSlots.afternoon.length > 0 && (
                  <div>
                    <p className="flex items-center text-xs text-gray-400 mb-2">
                      <img src={sunset} className="w-6 h-6 mr-2" alt="sunset" /> Afternoon Slots
                    </p>
                    <div className="grid grid-cols-5 ml-7 gap-2">
                      {timeSlots.afternoon.map((s, i) => (
                        <button
                          key={`afternoon-${i}-${s.startTime}`}
                          onClick={() => setSelectedSlot(s.startTime)}
                          className={`px-3 py-2 border rounded-lg text-sm ${
                            selectedSlot === s.startTime
                              ? 'text-orange-400 border-orange-400 bg-orange-50'
                              : 'border-gray-200 hover:text-orange-400 hover:border-orange-400 hover:bg-orange-100 transition-all duration-500'
                          }`}
                        >
                          {s.startTime}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {timeSlots.evening.length > 0 && (
                  <div>
                    <p className="flex items-center text-xs text-gray-400 mb-2">
                      <img src={eveningIcon} className="w-5 h-5 mr-3" alt="evening" /> Evening Slots
                    </p>
                    <div className="grid grid-cols-5 ml-7 gap-2">
                      {timeSlots.evening.map((s, i) => (
                        <button
                          key={`evening-${i}-${s.startTime}`}
                          onClick={() => setSelectedSlot(s.startTime)}
                          className={`px-3 py-2 border rounded-lg text-sm ${
                            selectedSlot === s.startTime
                              ? 'text-orange-400 border-orange-400 bg-orange-50'
                              : 'border-gray-200 hover:text-orange-400 hover:border-orange-400 hover:bg-orange-100 transition-all duration-500'
                          }`}
                        >
                          {s.startTime}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {timeSlots.morning.length === 0 && 
                 timeSlots.afternoon.length === 0 && 
                 timeSlots.evening.length === 0 && (
                  <div className="text-center py-4">
                    <p className="text-sm font-medium mb-3 text-gray-700">
                      No free slots available for selected date
                    </p>

                    {nextAvailableDate && (
                      <button
                        onClick={() => handleDateSelect(nextAvailableDate.display)}
                        className="inline-block px-16 py-3.5 border border-teal-700 text-teal-700 text-sm font-normal rounded-sm hover:bg-teal-50 transition"
                      >
                        Next Availability on {nextAvailableDate.formatted}
                      </button>
                    )}
                  </div>
                )}

                <div className="flex justify-center">
                  <button
                    onClick={handleBooking}
                    disabled={!selectedSlot}
                    className={`w-1/3 py-2 mt-4 bg-gradient-to-r from-teal-500 to-teal-700 text-white rounded-lg font-medium hover:opacity-90 ${
                      !selectedSlot ? 'cursor-not-allowed' : ''
                    }`}
                  >
                    Book Appointment
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        <div className="mt-8 border-t border-gray-100 pt-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500" />
            Reviews About {sitter.name.split(" ")[0]} 
            <span className="text-amber-600">({reviews.length})</span>
          </h3>

          {reviews.length === 0 ? (
            <div className="mt-4 p-6 text-center bg-gray-50 rounded-xl">
              <p className="text-gray-500 italic">No reviews yet - be the first to share your experience!</p>
            </div>
          ) : (
            <div className="mt-6 space-y-5">
              {reviews.map((review) => (
                <div 
                  key={review._id}
                  className="p-5 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {review.user?.name || "Anonymous User"}
                        <span className="ml-2 text-xs font-normal text-gray-400">
                          • {new Date(review.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </h4>
                      {review.text && (
                        <p className="mt-2 text-gray-600 leading-relaxed">
                          "{review.text}"
                        </p>
                      )}
                    </div>
                    
                    <div className="flex flex-col items-end pl-4">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < review.rating ? 'text-amber-500 fill-amber-500' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                      {review.rating >= 4 && (
                        <div className="mt-2 flex items-center gap-1 text-xs font-medium text-teal-600">
                          <ThumbsUp className="w-4 h-4" />
                          Recommended
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SitterAppointment;