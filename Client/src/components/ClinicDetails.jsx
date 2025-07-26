import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import axios from "axios";
import Spinner from "./Spinner";

export const ClinicDetails = () => {
  const { clinicName } = useParams();
  const [clinicDetails, setClinicDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fileURLs, setFileURLs] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClinicDetails = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/auth/admin/clinic-details/${clinicName}`
        );
        setClinicDetails(response.data.clinic);
      } catch (error) {
        console.error("Error fetching clinic details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClinicDetails();
  }, [clinicName]);

  useEffect(() => {
    if (clinicDetails) {
      const urls = {};
      [
        { key: "clinicRegistrationFile", label: "Clinic Registration" },
        { key: "NICFile", label: "NIC" },
        { key: "vetLicenseFile", label: "Vet License" },
        { key: "proofOfAddressFile", label: "Proof of Address" },
      ].forEach((doc) => {
        if (clinicDetails[doc.key]) {
          const isPDF = clinicDetails[doc.key].startsWith("JVBER");
          const fileType = isPDF ? "application/pdf" : "image/png";
          const blob = new Blob(
            [Uint8Array.from(atob(clinicDetails[doc.key]), (c) => c.charCodeAt(0))],
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
  }, [clinicDetails]);

  const handleBack = () => {
    // Navigate back dynamically based on state or fallback to browser history
    if (location.state?.from) {
      navigate(location.state.from); // Navigate to the specific previous route
    } else {
      navigate(-1); // Fallback to browser history if no state is available
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg shadow-gray-400 mt-5 p-8">
      <button className='flex flex-row items-center mb-2 font-semibold hover:underline'onClick={handleBack}> 
        <ChevronLeft className="w-5 h-5"/> Back
      </button>
       {loading ? (
          <Spinner className="flex p-4 m-20 justify-center items-center" />
        ) : (
          <>
            <h2 className="text-xl md:text-3xl font-bold text-orange-800 mb-6">
              Clinic Name: {clinicDetails.clinicName}
            </h2>

            {/* Clinic Information */}
            <div className="mb-8 pb-8 border-b border-gray-300">
              <h3 className="text-xl font-semibold text-teal-800 mb-4">Clinic Information</h3>
              <p className="text-gray-700 mb-3">
                <strong>Email:</strong> {clinicDetails.email}
              </p>
              <p className="text-gray-700 mb-3">
                <strong>Phone:</strong> {clinicDetails.phone}
              </p>
              <p className="text-gray-700 mb-3">
                <strong>City:</strong> {clinicDetails.city}
              </p>
              <p className="text-gray-700 mb-3">
                <strong>Address:</strong> {clinicDetails.address}
              </p>
              <p className="text-gray-700 mb-3">
                <strong>Verification Status:</strong>{" "}
                <span
                  className={`px-3 py-1 rounded-lg font-medium ${
                    clinicDetails.verificationStatus === "verified"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {clinicDetails.verificationStatus}
                </span>
              </p>
            </div>

            {/* Uploaded Documents */}
            <h3 className="text-xl font-semibold text-teal-800 mb-4">Uploaded Documents</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8  hide-scrollbar">
              {[
                { key: "clinicRegistrationFile", label: "Clinic Registration" },
                { key: "NICFile", label: "NIC" },
                { key: "vetLicenseFile", label: "Vet License" },
                { key: "proofOfAddressFile", label: "Proof of Address" },
              ].map((doc, index) => (
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
