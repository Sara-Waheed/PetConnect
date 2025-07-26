import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import Spinner from "./Spinner";
import backgroundImage from "../assets/BgMemoryhd.jpg";
import {ChevronLeft} from 'lucide-react';

const ApplicationsForAd = () => {
  const { id } = useParams(); // Adoption ad id from URL
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const handleBack = () => {
    if (location.state?.from) {
      navigate(location.state.from);
    } else {
      navigate(-1); 
    }
  };

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/auth/get-adoption-applications/${id}`,
          { withCredentials: true }
        );
        setApplications(response.data.applications);
      } catch (error) {
        console.error("Error fetching applications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [id]);

  const handleApplicationClick = (applicationId) => {
    navigate(`/profile/applications/${applicationId}`);
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div
      className="min-h-screen bg-fixed flex items-center justify-center"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="container rounded-lg shadow-md bg-orange-200 max-w-4xl mx-auto p-4 mb-96">
        <button className='flex flex-row items-center mb-2 text-gray-700 font-semibold hover:underline'onClick={handleBack}> 
            <ChevronLeft className="w-5 h-5"/> Back
        </button>
        <h1 className="text-2xl font-semibold text-center mb-6 text-orange-700">
          Applications for This Adoption Listing
        </h1>

        {applications.length === 0 ? (
          <p className="text-center text-gray-700">
            There are no applications for this listing yet.
          </p>
        ) : (
          <div className="space-y-4">
            {applications.map((application) => {
              const { adopter, submittedAt } = application;
              return (
                <div
                  key={application._id}
                  className="bg-slate-200 md:bg-white mx-auto md:mx-10 shadow-lg rounded-lg overflow-hidden p-4 border-l-8 border-lime-600 cursor-pointer hover:bg-slate-100"
                  onClick={() => handleApplicationClick(application._id)}
                >
                  <div className="flex flex-row justify-between">
                    <div className="flex flex-col space-y-2">
                      <h2 className="text-xl font-semibold text-teal-700">
                        {adopter.fullName}
                      </h2>
                      <p className="text-sm text-gray-600">
                        {adopter.email} | {adopter.city}
                      </p>
                      <p className="text-sm text-gray-600">
                        Over 18: {adopter.over18 ? "Yes" : "No"}
                      </p>
                      <p className="mt-2 text-base text-gray-700">
                        Submitted: {new Date(submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                    {/* Optionally, you can add an image if your application includes one */}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationsForAd;
