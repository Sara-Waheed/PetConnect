import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import axios from "axios";
import Spinner from "./Spinner";

const SitterDetails = () => {
  const { sitterId } = useParams(); 
  const [sitterDetails, setSitterDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fileURL, setFileURL] = useState(null); 
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchSitterDetails = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/auth/admin/sitter-details/${sitterId}`
        );
        setSitterDetails(response.data.sitter);
      } catch (error) {
        console.error("Error fetching sitter details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSitterDetails();
  }, [sitterId]);

  useEffect(() => {
    if (sitterDetails && sitterDetails.sitterCertificate) {
      const urls = {};
      const { sitterCertificate } = sitterDetails;
  
      try {
        // Check if the file is a PDF based on its base64 content
        const isPDF = sitterCertificate.startsWith("JVBER");
        const fileType = isPDF ? "application/pdf" : "image/png";
  
        // Convert base64 string to binary and create a Blob
        const blob = new Blob(
          [Uint8Array.from(atob(sitterCertificate), (c) => c.charCodeAt(0))],
          { type: fileType }
        );
  
        // Create Object URL for the file
        urls["sitterCertificate"] = URL.createObjectURL(blob);
        setFileURL(urls["sitterCertificate"]);
      } catch (error) {
        console.error("Failed to process sitter certificate:", error);
      }
    }
  
    // Cleanup to revoke the object URL
    return () => {
      if (fileURL) URL.revokeObjectURL(fileURL);
    };
  }, [sitterDetails]);

  const handleBack = () => {
    // Navigate back dynamically based on state or fallback to browser history
    if (location.state?.from) {
      navigate(location.state.from); // Navigate to the specific previous route
    } else {
      navigate(-1); // Fallback to browser history if no state is available
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg shadow-gray-400 p-8">
      <button className='flex flex-row items-center mb-2 font-semibold hover:underline'onClick={handleBack}> 
        <ChevronLeft className="w-5 h-5"/> Back
      </button>
      {loading ? (
          <Spinner className="flex p-4 m-20 justify-center items-center" />
        ) : (
          <>
            <h2 className="text-xl md:text-3xl font-bold text-orange-800 mb-6">
              Sitter Name: {sitterDetails.name}
            </h2>

            {/* Sitter Information */}
            <div className="mb-8 pb-8 border-b border-gray-300">
              <h3 className="text-xl font-semibold text-teal-800 mb-4">Sitter Information</h3>
              <p className="text-gray-700 mb-3">
                <strong>Name:</strong> {sitterDetails.name}
              </p>
              <p className="text-gray-700 mb-3">
                <strong>Email:</strong> {sitterDetails.email}
              </p>
              <p className="text-gray-700 mb-3">
                <strong>Phone:</strong> {sitterDetails.phone}
              </p>
              <p className="text-gray-700 mb-3">
                <strong>City:</strong> {sitterDetails.city}
              </p>
              <p className="text-gray-700 mb-3">
                <strong>Address:</strong> {sitterDetails.sitterAddress}
              </p>
              <p className="text-gray-700 mb-3">
                <strong>Years of Experience:</strong> {sitterDetails.yearsOfExperience}
              </p>
              <p className="text-gray-700 mb-3">
                <strong>Experience in Sitting:</strong> {sitterDetails.sittingExperience}
              </p>
              <p className="text-gray-700 mb-3">
                <strong>Verification Status:</strong>{" "}
                <span
                  className={`px-3 py-1 rounded-lg font-medium ${
                    sitterDetails.verificationStatus === "verified"
                      ? "bg-green-100 text-green-800"
                      : sitterDetails.verificationStatus === "rejected"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {sitterDetails.verificationStatus}
                </span>
              </p>
            </div>

            {/* Sitter Certificate (File) */}
            {fileURL && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-teal-800 mb-4">Sitter Certificate</h3>
                <div className="space-y-4 border border-gray-300 p-4 rounded-lg">
                  <p className="text-gray-700 font-medium mb-2">Certificate:</p>
                  <div className="flex flex-col items-center gap-4">
                    {/* Display PDF or Image */}
                    {fileURL.endsWith(".pdf") ? (
                      <iframe
                        src={fileURL}
                        width="100%"
                        height="500px"
                        title="Sitter Certificate"
                        className="border border-gray-200 rounded-lg"
                      />
                    ) : (
                      <img
                        src={fileURL}
                        alt="Sitter Certificate"
                        className="w-44 h-32 object-cover rounded-lg border border-gray-200 shadow-sm"
                      />
                    )}
                    <div>
                      <a
                        href={fileURL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-orange-600 hover:underline"
                      >
                        Open Certificate
                      </a>
                      <br />
                      <a
                        href={fileURL}
                        download="Sitter_Certificate"
                        className="text-teal-600 hover:underline"
                      >
                        Download Certificate
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
    </div>
  );
};

export default SitterDetails;
