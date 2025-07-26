import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarClock, Stethoscope, PawPrint, Scissors } from "lucide-react";

const getDateTime = (dateString, timeString) => {
  const [time, mer] = timeString.split(" ");
  let [h, m] = time.split(":").map(Number);
  if (mer === "PM" && h !== 12) h += 12;
  if (mer === "AM" && h === 12) h = 0;
  const dt = new Date(dateString);
  dt.setHours(h, m, 0, 0);
  return dt;
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [selectedType, setSelectedType] = useState("vet");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [now, setNow] = useState(new Date());
  const navigate = useNavigate();

  const appointmentCounts = {
    vet: appointments.filter(appt => appt.providerType === "vet").length,
    sitter: appointments.filter(appt => appt.providerType === "sitter").length,
    groomer: appointments.filter(appt => appt.providerType === "groomer").length,
  };

  // Sort and filter appointments
  const filteredAndSortedAppointments = appointments
    .filter((appt) => appt.providerType === selectedType)
    .slice()
    .sort((a, b) => {
      const aStart = getDateTime(a.date, a.slot.startTime);
      const bStart = getDateTime(b.date, b.slot.startTime);
      return bStart - aStart; // Newest first
    });

  const activeAppointments = filteredAndSortedAppointments.filter(
    (appt) => appt.status !== "completed"
  );
  const completedAppointments = filteredAndSortedAppointments.filter(
    (appt) => appt.status === "completed"
  );

  useEffect(() => {
    fetch("http://localhost:5000/auth/appointments", {
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error((await res.json()).message || "Fetch failed");
        return res.json();
      })
      .then((data) => setAppointments(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const handleJoinConsultation = (roomID, endDT) => {
    navigate(
       `/video?roomID=${roomID}` +
        `&mode=join` +
        `&scheduledEnd=${encodeURIComponent(endDT.toISOString())}` +
        `&role=client`
    );
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-orange-600 text-lg">Loading your appointments...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-red-600 text-lg">Error: {error}</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 flex flex-col md:flex-row gap-8 min-h-screen">
      {/* Side Panel */}
      <div className="w-full md:w-72 flex-shrink-0 h-full">
        <div className="bg-orange-50 rounded-xl p-6 shadow-lg border border-orange-100 h-full flex flex-col">
          <h2 className="text-xl font-bold text-orange-800 mb-6 flex items-center gap-3">
            <CalendarClock className="w-6 h-6 text-orange-600" />
            Filter Appointments
          </h2>
          
          <nav className="space-y-2 flex-1">
            {[
              { 
                type: "vet", 
                label: "Veterinarian", 
                icon: <Stethoscope className="w-5 h-5" />,
                count: appointmentCounts.vet
              },
              { 
                type: "sitter", 
                label: "Pet Sitter", 
                icon: <PawPrint className="w-5 h-5" />,
                count: appointmentCounts.sitter
              },
              { 
                type: "groomer", 
                label: "Groomer", 
                icon: <Scissors className="w-5 h-5" />,
                count: appointmentCounts.groomer
              },
            ].map(({ type, label, icon, count }) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200
                  ${selectedType === type 
                    ? "bg-white shadow-md ring-1 ring-orange-200 text-orange-700 font-semibold"
                    : "bg-transparent hover:bg-orange-100 text-gray-600 hover:text-orange-600"}
                `}
              >
                <div className="flex items-center gap-3">
                  {React.cloneElement(icon, {
                    className: `${
                      selectedType === type ? "text-orange-600" : "text-gray-500"
                    } w-5 h-5`
                  })}
                  <span>{label}</span>
                </div>
                <span className={`text-sm px-2 py-1 rounded-full ${
                  selectedType === type 
                    ? "bg-orange-100 text-orange-700" 
                    : "bg-gray-100 text-gray-500"
                }`}>
                  {count}
                </span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 h-full">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-orange-50 h-full flex flex-col">
          <h1 className="text-3xl font-bold mb-6 flex items-center gap-3 text-orange-800">
            <CalendarClock className="w-8 h-8 text-orange-600" />
            My Appointments
            <span className="text-lg font-medium text-orange-600 ml-2">
              ({filteredAndSortedAppointments.length})
            </span>
          </h1>

          <div className="flex-1 overflow-auto">
            {activeAppointments.length === 0 && completedAppointments.length === 0 ? (
              <div className="text-center py-8 bg-orange-50 rounded-lg h-full flex items-center justify-center">
                <div>
                  <p className="text-orange-700 font-medium text-lg">
                    No {selectedType.replace(/^\w/, c => c.toUpperCase())} appointments found
                  </p>
                  <p className="text-sm text-orange-600 mt-2">
                    Book a new appointment to see it here
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {activeAppointments.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold text-orange-800 mb-4">
                      Upcoming Appointments
                    </h2>
                    <div className="space-y-4">
                      {activeAppointments.map((appt) => {
                        const startDT = getDateTime(appt.date, appt.slot.startTime);
                        const endDT = getDateTime(appt.date, appt.slot.endTime);
                        const isVideo = appt.consultationType === "video";
                        const canJoin = isVideo && appt.roomID && now >= startDT && now <= endDT;

                        return (
                          <div
                            key={appt._id}
                            className="p-5 rounded-xl shadow-sm flex flex-col sm:flex-row sm:justify-between sm:items-center bg-orange-50 border border-orange-100"
                          >
                            <div className="space-y-1 flex-1">
                              <p className="text-gray-900 text-xl font-semibold mb-2">
                                <span className="text-orange-700">
                                  {appt.providerType === "vet" ? "Dr." : 
                                  appt.providerType === "groomer" ? "Groomer" : "Sitter"}
                                </span>{" "}
                                {appt.providerName}
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
                                  {appt.status}
                                </span>
                              </div>
                            </div>

                            <div className="mt-4 sm:mt-0 flex flex-col gap-2 items-end">
                              {appt.status === "completed" && !appt.hasReview && (
                                <button
                                  onClick={() => navigate(`/submit-feedback?appointmentId=${appt._id}`)}
                                  className="px-4 py-2 bg-gradient-to-r from-orange-400 to-orange-600 text-white rounded-lg hover:opacity-90 transition-opacity"
                                >
                                  Leave Review
                                </button>
                              )}

                             
                              {isVideo && canJoin && (
  <button
    onClick={() => handleJoinConsultation(appt.roomID, endDT)}
    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
  >
    <span>Join Now</span>
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 8.5V15.5C22 19 20 21 16.5 21H7.5C4 21 2 19 2 15.5V8.5C2 5 4 3 7.5 3H16.5C20 3 22 5 22 8.5Z" />
      <path d="M12.4 15.8L15.7 12.5L12.4 9.2M7.7 12.5H15.6" />
    </svg>
  </button>
)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {completedAppointments.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold text-orange-800 mb-4">
                      Completed Appointments
                    </h2>
                    <div className="space-y-4">
                      {completedAppointments.map((appt) => {
                        const startDT = getDateTime(appt.date, appt.slot.startTime);
                        const endDT = getDateTime(appt.date, appt.slot.endTime);

                        return (
                          <div
                            key={appt._id}
                            className="p-5 rounded-xl shadow-sm flex flex-col sm:flex-row sm:justify-between sm:items-center bg-orange-50 border border-orange-100"
                          >
                            <div className="space-y-1 flex-1">
                              <p className="text-gray-900 text-xl font-semibold mb-2">
                                <span className="text-orange-700">
                                  {appt.providerType === "vet" ? "Dr." : 
                                  appt.providerType === "groomer" ? "Groomer" : "Sitter"}
                                </span>{" "}
                                {appt.providerName}
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
                                <span className="text-sm px-3 py-1 rounded-full bg-teal-100 text-teal-800">
                                  {appt.status}
                                </span>
                              </div>
                            </div>

                            <div className="mt-4 sm:mt-0 flex flex-col gap-2 items-end">
                              {!appt.hasReview && (
                                <button
                                  onClick={() => navigate(`/submit-feedback?appointmentId=${appt._id}`)}
                                  className="px-4 py-2 bg-gradient-to-r from-orange-400 to-orange-600 text-white rounded-lg hover:opacity-90 transition-opacity"
                                >
                                  Leave Review
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}