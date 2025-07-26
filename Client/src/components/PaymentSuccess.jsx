import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaCheckCircle } from "react-icons/fa";

export default function PaymentSuccess() {
  const { search } = useLocation();
  const navigate = useNavigate();
  const session_id = new URLSearchParams(search).get("session_id");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .post(
        "http://localhost:5000/auth/appointments/confirm",
        { session_id },
        { withCredentials: true }
      )
      .then(() => {
        setTimeout(() => setLoading(false), 1000); // Delay for animation effect
      })
      .catch(() => {
        alert("Confirmation failed");
        navigate("/");
      });
  }, [session_id, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <p className="text-lg font-medium text-gray-600">Confirming payment…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4 text-center">
      <FaCheckCircle className="text-teal-600 text-6xl mb-4" />
      <h2 className="text-2xl font-semibold text-gray-800 mb-2">Payment Successful!</h2>
      <p className="text-gray-600 mb-6">
        Thank you! Your appointment has been confirmed and payment received.
      </p>
      <button
        onClick={() => navigate("/appointments")}
        className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-6 rounded shadow"
      >
        View Appointment
      </button>
    </div>
  );
}
