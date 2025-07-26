// ClientAppointments.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const ClientAppointments = () => {
  const navigate = useNavigate();

  // Dummy data for appointments
  const appointments = [
    { roomID: 'ROOM123', doctor: 'Dr. John Doe', time: '2025-04-26 10:00 AM' },
    { roomID: 'ROOM124', doctor: 'Dr. Jane Smith', time: '2025-04-26 11:00 AM' },
    { roomID: 'ROOM125', doctor: 'Dr. Emily White', time: '2025-04-26 02:00 PM' },
  ];

  const handleJoinConsultation = (roomID) => {
    navigate(`/video?roomID=${roomID}&mode=join`);
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Upcoming Appointments</h2>
      <ul className="space-y-4">
        {appointments.map((appt) => (
          <li key={appt.roomID} className="border p-4 rounded-lg shadow-md">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium">{appt.doctor}</h3>
                <p className="text-gray-600">{appt.time}</p>
              </div>
              <button
                onClick={() => handleJoinConsultation(appt.roomID)}
                className="px-4 py-2 bg-green-500 text-white rounded"
              >
                Join Consultation
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ClientAppointments;
