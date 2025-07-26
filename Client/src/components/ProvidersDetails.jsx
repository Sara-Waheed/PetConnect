import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import axios from "axios";
import Spinner from "./Spinner";

const ProviderDetails = () => {
  const { provider_id, role } = useParams();
  const [providerDetails, setProviderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fileURLs, setFileURLs] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProviderDetails = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/auth/clinic/providers-details/${role}/${provider_id}`, 
          {
            params: {
              role, 
            },
          }
        );
        setProviderDetails(response.data.provider);
      } catch (error) {
        console.error("Error fetching provider details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProviderDetails();
  }, [provider_id, role]);

  useEffect(() => {
    if (providerDetails) {
      const urls = {};
      const fileKeys = role === "vet" 
        ? [
            { key: "vetResume", label: "Vet Resume" },
            { key: "vetLicenseFile", label: "Vet License" },
            { key: "vetDegree", label: "Vet Degree" },
          ]
        : [
            { key: "groomerCertificate", label: "Groomer Certificate" },
          ];

      fileKeys.forEach((doc) => {
        if (providerDetails[doc.key]) {
          const isPDF = providerDetails[doc.key].startsWith("JVBER");
          const fileType = isPDF ? "application/pdf" : "image/png";
          const blob = new Blob(
            [Uint8Array.from(atob(providerDetails[doc.key]), (c) => c.charCodeAt(0))],
            { type: fileType }
          );
          urls[doc.key] = URL.createObjectURL(blob);
        }
      });
      setFileURLs(urls);
    }

    return () => {
      Object.values(fileURLs).forEach((url) => URL.revokeObjectURL(url));
    };
  }, [providerDetails]);

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
        Provider: {providerDetails.name}
            </h2>

            {/* Provider Information */}
            <div className="mb-8 pb-8 border-b border-gray-300">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Provider Information</h3>
              <p className="text-gray-700 mb-3">
                <strong>Email:</strong> {providerDetails.email}
              </p>
              <p className="text-gray-700 mb-3">
                <strong>Phone:</strong> {providerDetails.phone}
              </p>
              <p className="text-gray-700 mb-3">
                <strong>City:</strong> {providerDetails.city}
              </p>
              {role === "groomer" && (
                <p className="text-gray-700 mb-3">
                  <strong>Grooming Specialties:</strong> {providerDetails.groomingSpecialties}
                </p>
              )}
              <p className="text-gray-700 mb-3">
                <strong>Years of Experience:</strong> {providerDetails.yearsOfExperience}
              </p>
              <p className="text-gray-700 mb-3">
                <strong>Verification Status:</strong>{" "}
                <span
                  className={`px-3 py-1 rounded-lg font-medium ${
                    providerDetails.verificationStatus === "verified"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {providerDetails.verificationStatus}
                </span>
              </p>
            </div>

            {/* Uploaded Documents */}
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Uploaded Documents</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 hide-scrollbar">
              {(role === "vet"
                ? [
                    { key: "vetResume", label: "Vet Resume" },
                    { key: "vetLicenseFile", label: "Vet License" },
                    { key: "vetDegree", label: "Vet Degree" },
                  ]
                : [
                    { key: "groomerCertificate", label: "Groomer Certificate" },
                  ]
              ).map((doc, index) => (
                <div key={index} className="space-y-4 border border-gray-300 p-4 rounded-lg">
                  <p className="text-gray-700 font-medium mb-2">{doc.label}:</p>
                  <div className="flex flex-col items-center gap-4">
                    {/* Preview Section */}
                    {fileURLs[doc.key] && !fileURLs[doc.key].endsWith(".pdf") && (
                      <img
                        src={fileURLs[doc.key]}
                        alt={doc.label}
                        className="w-44 h-32 object-cover rounded-lg border border-gray-200 shadow-sm"
                      />
                    )}

                    {/* Open/Download Section */}
                    <div>
                      <a
                        href={fileURLs[doc.key]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-orange-600 hover:underline"
                      >
                        Open File
                      </a>
                      <br />
                      <a
                        href={fileURLs[doc.key]}
                        download={`${doc.label}`}
                        className="text-teal-600 hover:underline"
                      >
                        Download File
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
    </div>
  );
};

export default ProviderDetails;
