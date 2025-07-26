import { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import axios from 'axios';

function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Formats an ISO string or JS Date into “May 15, 2025 • 01:30 AM”
const formatDate = (value) => {
  if (!value) return 'N/A';
  try {
    // parseISO handles strings like "2025-05-14T20:30:43.272Z"
    const date = typeof value === 'string' ? parseISO(value) : value;
    // 12-hour clock with AM/PM
    return format(date, 'MMM dd, yyyy • hh:mm a');
  } catch {
    return 'Invalid Date';
  }
};



  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const { data } = await axios.get(
          'http://localhost:5000/auth/admin/appointments',
          { withCredentials: true, headers: { Accept: 'application/json' } }
        );
        setAppointments(data);
        console.log(appointments);

      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500" />
      </div>
    );

  if (error)
    return (
      <div className="p-4 text-center text-red-600 bg-red-50 rounded-lg mx-4 my-8">
        Error: {error}
      </div>
    );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Appointment Tracking</h2>
      <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">User</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Provider</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Category</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Consultation</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Scheduled</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Started</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Completed</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Duration</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {appointments.length === 0 ? (
              <tr>
                <td colSpan="9" className="px-4 py-6 text-center text-gray-500">
                  No appointments found
                </td>
              </tr>
            ) : (
              appointments.map((appt) => (
                <AppointmentRow key={appt._id} appt={appt} formatDate={formatDate} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const AppointmentRow = ({ appt, formatDate }) => {
  const statusStyles = {
    booked: 'bg-blue-50 text-blue-600',
    'in-progress': 'bg-amber-50 text-amber-600',
    completed: 'bg-green-50 text-green-600',
    cancelled: 'bg-red-50 text-red-600',
  };

  const calculateDuration = () => {
  // 1) If we have real timestamps, use those:
  if (appt.startedAt && appt.completedAt) {
    try {
      const start = parseISO(appt.startedAt);
      const end = parseISO(appt.completedAt);
      const diffMinutes = Math.round((end - start) / 60000);
      if (isNaN(diffMinutes)) throw new Error();
      const hrs = Math.floor(diffMinutes / 60);
      const mins = diffMinutes % 60;
      return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
    } catch {
      return 'N/A';
    }
  }

  // 2) Fallback: compute from slot strings “HH:mm”
  const { slot } = appt;
  if (slot?.startTime && slot?.endTime) {
    const [h1s, m1s] = slot.startTime.trim().split(':');
    const [h2s, m2s] = slot.endTime.trim().split(':');

    const h1 = parseInt(h1s, 10);
    const m1 = parseInt(m1s, 10);
    const h2 = parseInt(h2s, 10);
    const m2 = parseInt(m2s, 10);

    // if any parse failed, bail out
    if ([h1, m1, h2, m2].some((n) => Number.isNaN(n))) {
      return 'N/A';
    }

    let diff = (h2 * 60 + m2) - (h1 * 60 + m1);
    // handle midnight wrap
    if (diff < 0) diff += 24 * 60;

    const hrs = Math.floor(diff / 60);
    const mins = diff % 60;
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  }

  return 'N/A';
};

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-3 text-sm text-gray-900">{appt.user?.name || 'N/A'}</td>
      <td className="px-4 py-3 text-sm text-gray-900">{appt.provider?.name || 'N/A'}</td>
      <td className="px-4 py-3 text-sm text-gray-500 capitalize">{appt.type}</td>
      <td className="px-4 py-3 text-sm text-gray-500 capitalize">{appt.consultationType || 'N/A'}</td>
      <td className="px-4 py-3 text-sm text-gray-500">
        <div className="flex flex-col">
          <span>{formatDate(appt.date)}</span>
          <span className="text-xs text-gray-400">
            {appt.slot?.startTime || 'N/A'} – {appt.slot?.endTime || 'N/A'}
          </span>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-gray-500">{appt.startedAt ? formatDate(appt.startedAt) : 'N/A'}</td>
      <td className="px-4 py-3 text-sm text-gray-500">{appt.completedAt ? formatDate(appt.completedAt) : 'N/A'}</td>
      <td className="px-4 py-3 text-sm text-gray-500">{calculateDuration()}</td>
      <td className="px-4 py-3">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            statusStyles[appt.status] || 'bg-gray-50 text-gray-600'
          }`}
        >
          {appt.status}
        </span>
      </td>
    </tr>
  );
};

export default AdminAppointments;
