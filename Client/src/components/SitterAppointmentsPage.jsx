import React, { useEffect, useState } from "react";
import axios from "axios";
import Spinner from "./Spinner";
import { CalendarCheck } from "lucide-react";

const getDateTime = (date, timeString) => {
  const [time, mer] = timeString.split(" ");
  let [h, m] = time.split(":").map(Number);
  if (mer === "PM" && h !== 12) h += 12;
  if (mer === "AM" && h === 12) h = 0;
  const dt = new Date(date);
  dt.setHours(h, m, 0, 0);
  return dt;
};

export default function PetSitterAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    axios
      .get("http://localhost:5000/auth/appointments/sitter", { 
        withCredentials: true 
      })
      .then(({ data }) => {
        const activeAppointments = data
          .filter(appt => ['booked', 'in-progress'].includes(appt.status))
          .sort((a, b) => {
            const aStart = getDateTime(a.date, a.slot.startTime);
            const bStart = getDateTime(b.date, b.slot.startTime);
            return aStart - bStart;
          });

        const completedAppointments = data
          .filter(appt => appt.status === 'completed')
          .sort((a, b) => {
            const aEnd = getDateTime(a.date, a.slot.endTime);
            const bEnd = getDateTime(b.date, b.slot.endTime);
            return bEnd - aEnd;
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

  const handleStatusUpdate = async (apptId, newStatus, endpoint) => {
    const originalState = appointments;
    try {
      setAppointments(prev =>
        prev.map(appt => 
          appt._id === apptId ? { ...appt, status: newStatus } : appt
        )
      );
      
      await axios.post(
        `http://localhost:5000/auth/appointments/sitter/${apptId}/${endpoint}`,
        {},
        { withCredentials: true }
      );
    } catch (err) {
      console.error("Operation failed:", err);
      alert(`Failed to ${endpoint}`);
      setAppointments(originalState);
    }
  };

  const activeAppointments = appointments
    .filter(appt => ['booked', 'in-progress'].includes(appt.status))
    .sort((a, b) => {
      const aStart = getDateTime(a.date, a.slot.startTime);
      const bStart = getDateTime(b.date, b.slot.startTime);
      return bStart - aStart;
    });

  const completedAppointments = appointments
    .filter(appt => appt.status === 'completed')
    .sort((a, b) => {
      const aEnd = getDateTime(a.date, a.slot.endTime);
      const bEnd = getDateTime(b.date, b.slot.endTime);
      return bEnd - aEnd;
    });

  if (loading) return <Spinner className="w-8 h-8 mx-auto my-8" />;
  if (error) return <p className="text-center text-red-600 my-8">Error: {error}</p>;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-orange-50">
        <h1 className="text-3xl font-bold mb-6 flex items-center gap-3 text-orange-800">
          <CalendarCheck className="w-8 h-8 text-orange-600" />
          Pet Sitting Appointments
          <span className="text-lg font-medium text-orange-600 ml-2">
            ({activeAppointments.length + completedAppointments.length})
          </span>
        </h1>

        <div className="space-y-4">
          {activeAppointments.map(appt => {
            const startDT = getDateTime(appt.date, appt.slot.startTime);
            const endDT = getDateTime(appt.date, appt.slot.endTime);
            const isHomeService = appt.consultationType === 'home';
            const canStart = now >= startDT && now <= endDT;
            const canComplete = now >= endDT;

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
                        {appt.consultationType === 'home' ? 'Home Visit' : 'Drop Off'}
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
                  {isHomeService ? (
                    <>
                      {appt.status === "booked" && canStart && (
                        <button
                          onClick={() => handleStatusUpdate(appt._id, 'in-progress', 'checkin')}
                          className="px-4 py-2 bg-gradient-to-r from-green-400 to-green-600 text-white rounded-lg hover:opacity-90 transition-opacity"
                        >
                          Check-In
                        </button>
                      )}
                      {appt.status === "in-progress" && canComplete && (
                        <button
                          onClick={() => handleStatusUpdate(appt._id, 'completed', 'checkout')}
                          className="px-4 py-2 bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-lg hover:opacity-90 transition-opacity"
                        >
                          Check-Out
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      {appt.status === "booked" && canStart && (
                        <button
                          onClick={() => handleStatusUpdate(appt._id, 'in-progress', 'start')}
                          className="px-4 py-2 bg-gradient-to-r from-green-400 to-green-600 text-white rounded-lg hover:opacity-90 transition-opacity"
                        >
                          Start Service
                        </button>
                      )}
                      {appt.status === "in-progress" && canComplete && (
                        <button
                          onClick={() => handleStatusUpdate(appt._id, 'completed', 'complete')}
                          className="px-4 py-2 bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-lg hover:opacity-90 transition-opacity"
                        >
                          Complete Service
                        </button>
                      )}
                    </>
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
                              <span className="text-sm text-gray-700">
                                {appt.consultationType === 'home' ? 'Home Visit' : 'Facility Drop-off'}
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