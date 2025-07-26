import React from "react";
import { Link } from "react-router-dom";

export default function PaymentCancel() {
  return (
    <div className="p-8 text-center">
      <h1 className="text-2xl font-bold mb-4">Payment Canceled</h1>
      <p className="mb-6">Your payment was not completed.</p>
      <Link
        to="/appointments"
        className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700"
      >
        Return to Appointments
      </Link>
    </div>
  );
}
