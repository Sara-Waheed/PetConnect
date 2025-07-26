import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { Star } from "lucide-react";

const ratingLabels = {
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Very Good",
  5: "Excellent",
};

export default function SubmitFeedbackPage() {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const appointmentId = params.get("appointmentId");
  const vetId = params.get("vetId");

  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    
    try {
      await axios.post(
        "http://localhost:5000/auth/create-review",
        { appointmentId, vetId, rating, review },
        { withCredentials: true }
      );
      navigate("/thank-you");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-teal-600 mb-3">
            How was your appointment?
          </h1>
          <p className="text-lg text-gray-600">
            Your feedback helps us improve our services
          </p>
        </div>

        <form 
          onSubmit={handleSubmit}
          className="bg-white shadow-xl rounded-2xl p-6 sm:p-8 space-y-8 transition-all duration-200 hover:shadow-2xl"
        >
          {error && (
            <div className="bg-red-50 p-4 rounded-lg flex items-center gap-3">
              <span className="text-red-600 font-medium">{error}</span>
            </div>
          )}

          <div className="space-y-6">
            {/* Rating Section */}
            <div>
              <label className="block text-xl font-semibold text-gray-600 mb-4">
                Rate your experience
              </label>
              <div className="flex justify-center gap-2 sm:gap-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`transform transition-all duration-200 ${
                      rating >= star 
                        ? "text-orange-500 scale-110"
                        : "text-gray-300 hover:text-orange-300"
                    }`}
                  >
                    <Star 
                      size={40} 
                      className="fill-current"
                      strokeWidth={rating >= star ? 2 : 1}
                    />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-center mt-3 text-lg font-medium text-gray-700">
                  {ratingLabels[rating]}
                </p>
              )}
            </div>

            {/* Review Section */}
            <div>
              <label className="block text-xl font-semibold text-gray-600 mb-4">
                Share your thoughts
              </label>
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl 
                          focus:ring-2 focus:ring-orange-500 focus:border-orange-500 
                          transition-all resize-none text-lg"
                placeholder="Tell us about your experience..."
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-900 hover:opacity-85 text-white 
                      font-semibold text-lg rounded-xl transition-all
                      disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </span>
            ) : (
              "Submit Feedback"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}