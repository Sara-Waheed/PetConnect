
// src/pages/GoodbyePage.jsx
import React from "react";
import { useNavigate, useLocation, Link } from 'react-router-dom';

export default function GoodbyePage() {
  const navigate  = useNavigate();
  const location  = useLocation();

  // Parse roomID and mode from the query string: ?roomID=…&mode=…
  const params  = new URLSearchParams(location.search);
  const roomID  = params.get("roomID");
  const mode    = params.get("mode");

  return (
    <div className="h-screen max-w-full flex flex-col justify-center items-center bg-orange-200 text-black">
      <p className="text-3xl font-semibold mb-4 pb-6">Meeting Ended</p>

      <div className="flex gap-6">

        <button
          onClick={() => navigate("/")}
          className="px-6 py-3 bg-orange-500 rounded-full hover:bg-orange-600 transition"
        >
          Return to home screen
        </button>
      </div>

      {/* Submit Feedback link */}
      <Link 
        to={`/submit-feedback?appointmentId=${encodeURIComponent(roomID)}`}
        className="mt-7 text-lg text-teal-700 hover:underline"
      >
        Submit Feedback
      </Link>
    </div>
  );
}

