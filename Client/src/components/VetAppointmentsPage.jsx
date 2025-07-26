import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Spinner from "./Spinner";
import { CalendarCheck } from "lucide-react";

const getDateTime = (dateString, timeString) => {
  const [time, mer] = timeString.split(" ");
  let [h, m] = time.split(":").map(Number);
  if (mer === "PM" && h !== 12) h += 12;
  if (mer === "AM" && h === 12) h = 0;
  const dt = new Date(dateString);
  dt.setHours(h, m, 0, 0);
  return dt;
};

export default function VetAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [now, setNow] = useState(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:5000/auth/appointments/vet", { withCredentials: true })
      .then(({ data }) => {
        // Modified sorting logic here
        const activeAppointments = data
          .filter(appt => ['booked', 'in-progress'].includes(appt.status))
          .sort((a, b) => {
            const bStart = getDateTime(b.date, b.slot.startTime);
            const aStart = getDateTime(a.date, a.slot.startTime);
            return bStart - aStart; // Newest first
          });

        const completedAppointments = data
          .filter(appt => appt.status === "completed")
          .sort((a, b) => {
            const bStart = getDateTime(b.date, b.slot.startTime);
            const aStart = getDateTime(a.date, a.slot.startTime);
            return bStart - aStart; // Newest first
          });

        setAppointments([...activeAppointments, ...completedAppointments]);
      })
      .catch(err => setError(err.response?.data?.message || err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const handleVideoStart = async (appt, endDT) => {
    try {
      await axios.post(
        `http://localhost:5000/auth/appointments/${appt._id}/start`,
        {},
        { withCredentials: true }
      );

      const vetName = appt.vetId?.name || "your vet";
      await axios.post(
        'http://localhost:5000/auth/notifications',
        {
          userId: appt.userId._id,
          message: `Your ${appt.consultationType} consultation with ${vetName} has started!`,
          type: 'appointment'
        },
        { withCredentials: true }
      );

      navigate(
        `/video?roomID=${appt.roomID}` +
        `&mode=start` +
        `&scheduledEnd=${encodeURIComponent(endDT.toISOString())}` +
        `&role=vet`
      );
    } catch (err) {
      console.error("Could not start:", err);
      alert("Failed to start consultation");
    }
  };

  const handleStartInClinic = async (appointmentId) => {
    try {
      await axios.post(
        `http://localhost:5000/auth/appointments/${appointmentId}/start`,
        {},
        { withCredentials: true }
      );

      setAppointments(prev =>
        prev.map(appt =>
          appt._id === appointmentId ? { ...appt, status: "in-progress" } : appt
        )
      );

      const appt = appointments.find(a => a._id === appointmentId);
      const vetName = appt.vetId?.name || "your vet";
      await axios.post(
        'http://localhost:5000/auth/notifications',
        {
          userId: appt.userId._id,
          message: `Your in-clinic consultation with ${vetName} has started!`,
          type: 'appointment'
        },
        { withCredentials: true }
      );
    } catch (err) {
      console.error("Could not start:", err);
      alert("Failed to start in-clinic consultation");
    }
  };

  const handleComplete = async (appointmentId) => {
    try {
      await axios.post(
        `http://localhost:5000/auth/appointments/${appointmentId}/complete`,
        {},
        { withCredentials: true }
      );
      
      setAppointments(prev =>
        prev.map(appt =>
          appt._id === appointmentId ? { ...appt, status: "completed" } : appt
        )
      );

      const appt = appointments.find(a => a._id === appointmentId);
      const vetName = appt.vetId?.name || "your vet";
      await axios.post(
        'http://localhost:5000/auth/notifications',
        {
          userId: appt.userId._id,
          message: `Your ${appt.consultationType} consultation with ${vetName} has been completed!`,
          type: 'appointment'
        },
        { withCredentials: true }
      );
    } catch (err) {
      console.error("Completion failed:", err);
      alert("Failed to complete appointment");
    }
  };

  if (loading) return <Spinner className="w-8 h-8 mx-auto my-8" />;
  if (error) return <p className="text-center text-red-600 my-8">Error: {error}</p>;

  const activeAppointments = appointments.filter(appt => ['booked', 'in-progress'].includes(appt.status));
  const completedAppointments = appointments.filter(appt => appt.status === "completed");

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-orange-50">
        <h1 className="text-3xl font-bold mb-6 flex items-center gap-3 text-orange-800">
          <CalendarCheck className="w-8 h-8 text-orange-600" />
          Vet Appointments
          <span className="text-lg font-medium text-orange-600 ml-2">
            ({appointments.length})
          </span>
        </h1>

        <div className="space-y-4">
          {activeAppointments.map(appt => {
            const startDT = getDateTime(appt.date, appt.slot.startTime);
            const endDT = getDateTime(appt.date, appt.slot.endTime);
            const isVideo = appt.consultationType === "video";
            const isClinic = appt.consultationType === "in-clinic";
            const canAct = now >= startDT && now <= endDT;
            const isOverdue = now >= endDT;

            return (
              <div
                key={appt._id}
                className="p-5 rounded-xl shadow-sm flex flex-col sm:flex-row sm:justify-between sm:items-center bg-orange-50 border border-orange-100"
              >
                <div className="space-y-1 flex-1">
                  <p className="text-gray-900 text-xl font-semibold mb-2">
                    Client: {appt.userId.name}
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-orange-700">Date:</span>
                      <span className="text-sm text-gray-700">
                        {startDT.toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-orange-700">Time:</span>
                      <span className="text-sm text-gray-700">
                        {appt.slot.startTime} - {appt.slot.endTime}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-orange-700">Type:</span>
                      <span className="text-sm px-2 py-1 rounded-full bg-orange-100 text-orange-700 capitalize">
                        {appt.consultationType}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-sm font-medium text-orange-700">Status:</span>
                    <span className={`text-sm px-3 py-1 rounded-full ${
                      appt.status === "booked" ? "bg-yellow-100 text-yellow-800" :
                      appt.status === "in-progress" ? "bg-green-100 text-green-800" :
                      "bg-teal-100 text-teal-800"
                    }`}>
                      {appt.status === "booked" ? "Upcoming" : appt.status}
                    </span>
                  </div>
                </div>

                <div className="mt-4 sm:mt-0 flex flex-col gap-2 items-end">
                  {isVideo ? (
                    <>
                      {now < startDT && (
                        <span className="text-sm text-orange-600 italic">
                          Starts at {appt.slot.startTime}
                        </span>
                      )}

                      {canAct && appt.status === "booked" && (
                        <button
                          onClick={() => handleVideoStart(appt, endDT)}
                          className="px-4 py-2 bg-gradient-to-r from-teal-400 to-teal-600 text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
                        >
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className="h-5 w-5" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2"
                          >
                            <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11a6.002 6.002 0 0 0-4-5.659V5a2 2 0 1 0-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 0 1-6 0v-1m6 0H9"/>
                          </svg>
                          Start Video Call
                        </button>
                      )}

                      {canAct && appt.status === "in-progress" && (
                        <button
                          onClick={() => { 
                            const endDT = getDateTime(appt.date, appt.slot.endTime);
                            navigate(`/video?roomID=${appt.roomID}` +
                            `&mode=join` +
                            `&scheduledEnd=${encodeURIComponent(endDT.toISOString())}` +
                            `&role=vet`);
                          }}
                          className="px-4 py-2 bg-gradient-to-r from-teal-400 to-teal-600 text-white rounded-lg hover:opacity-90 transition-opacity"
                        >
                          Join Video Call
                        </button>
                      )}
                    </>
                  ) : isClinic && (
                    <>
                      {appt.status === "booked" && canAct && (
                        <button
                          onClick={() => handleStartInClinic(appt._id)}
                          className="px-4 py-2 bg-gradient-to-r from-green-400 to-green-600 text-white rounded-lg hover:opacity-90 transition-opacity"
                        >
                          Start In-Clinic
                        </button>
                      )}

                      {appt.status === "in-progress" && (
                        <button
                          onClick={() => handleComplete(appt._id)}
                          className="px-4 py-2 bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-lg hover:opacity-90 transition-opacity"
                        >
                          {isOverdue ? "Mark Completed" : "Complete Now"}
                        </button>
                      )}
                    </>
                  )}

                  {(isVideo || isClinic) && isOverdue && appt.status === "in-progress" && (
                    <button
                      onClick={() => handleComplete(appt._id)}
                      className="px-4 py-2 bg-gradient-to-r from-purple-400 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity"
                    >
                      Mark Completed
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {completedAppointments.length > 0 && (
            <div className="mt-12 pt-8 border-t border-orange-200">
              <h2 className="text-2xl font-bold mb-6 text-orange-800">Completed Appointments</h2>
              <div className="space-y-4">
                {completedAppointments.map(appt => {
                  const startDT = getDateTime(appt.date, appt.slot.startTime);
                  const endDT = getDateTime(appt.date, appt.slot.endTime);
                  
                  return (
                    <div
                      key={appt._id}
                      className="p-5 rounded-xl shadow-sm bg-orange-50 border border-orange-100"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-lg font-semibold text-gray-900">{appt.userId.name}</p>
                          <div className="flex flex-wrap gap-4 mt-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-orange-700">Date:</span>
                              <span className="text-sm text-gray-700">
                                {startDT.toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-orange-700">Time:</span>
                              <span className="text-sm text-gray-700">
                                {appt.slot.startTime} - {appt.slot.endTime}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-orange-700">Type:</span>
                              <span className="text-sm text-gray-700 capitalize">
                                {appt.consultationType}
                              </span>
                            </div>
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-sm">
                          Completed
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}