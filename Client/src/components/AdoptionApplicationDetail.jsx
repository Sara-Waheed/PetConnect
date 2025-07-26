import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2';
import Spinner from "./Spinner";

export default function AdoptionApplicationDetail() {
  const { applicationId: petId } = useParams();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adStatus, setAdStatus] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const { data } = await axios.get(
          `http://localhost:5000/auth/adoption-applications/${petId}`
        );
        setApplication(data.application);
      } catch (err) {
        console.error('Error fetching application:', err);
      } finally {
        setLoading(false);
      }
    };
    const fetchStatus = async () => {
    try {
      const { data } = await axios.get(
        `http://localhost:5000/auth/application-status/${petId}`
      );
      setAdStatus(data.status);
    } catch (err) {
      console.error('Error fetching adoption ad status:', err);
    }
  };

    fetchStatus();
    fetchApplication();
  }, [petId]);

  const confirmInterest = () =>
    Swal.fire({
      title: 'Confirm Interest',
      html: `
        <div class="text-left">
          <p>📌 Marking as “Interested” will:</p>
          <ul class="list-disc list-inside">
            <li>Update this pet’s status to <strong>Pending</strong>.</li>
            <li>Pause further public inquiries.</li>
            <li>Hide this pet from public search results.</li>
          </ul>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: '✅ Yes, I’m interested',
      cancelButtonText: '❌ Cancel',
      confirmButtonColor: '#10b981',
      reverseButtons: true,
    });

  const handleInterested = async () => {
    const { isConfirmed } = await confirmInterest();
    if (!isConfirmed) return;

    try {
      const { data } = await axios.put(
        `http://localhost:5000/auth/applications/${petId}/status`,
        { status: 'Pending' },
        { withCredentials: true }
      );

      await Swal.fire({
        icon: 'success',
        title: 'Marked Interested',
        text: data.message,
        confirmButtonColor: '#10b981',
      });

    } catch (err) {
      console.error('Error updating status:', err);
      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: err.response?.data?.message || 'Server error',
        confirmButtonColor: '#ef4444',
      });
    }
  };

  const goBack = () =>
    navigate(location.state?.from || -1);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="text-center mt-8 text-lg text-rose-600">
        Application not found
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <button
          onClick={goBack}
          className="flex items-center gap-1 mb-4 text-gray-600 hover:text-gray-800"
        >
          <ChevronLeft className="w-5 h-5" /> Back to Applications
        </button>

        <h1 className="text-3xl font-bold text-center mb-8">
          Adoption Application Review
        </h1>

        {/* Adopter Information */}
        <section className="mb-8 bg-amber-50 p-6 rounded-xl">
          <h2 className="text-xl font-semibold text-amber-800 border-b-2 border-amber-200 pb-2 mb-4">
            Adopter Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
            <p><span className="font-medium">Name:</span> {application.adopter.fullName}</p>
            <p><span className="font-medium">Email:</span> {application.adopter.email}</p>
            <p><span className="font-medium">City:</span> {application.adopter.city}</p>
            <p><span className="font-medium">Over 18:</span> {application.adopter.over18 ? 'Yes' : 'No'}</p>
          </div>
        </section>

        {/* Home Details */}
        <section className="mb-8 bg-blue-50 p-6 rounded-xl">
          <h2 className="text-xl font-semibold text-blue-800 border-b-2 border-blue-200 pb-2 mb-4">
            Home Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
            <p><span className="font-medium">Living Situation:</span> {application.homeDetails.livingSituation}</p>
            <p><span className="font-medium">Household Setting:</span> {application.homeDetails.householdSetting}</p>
            {application.homeDetails.landlordPermission && (
              <p><span className="font-medium">Landlord Permission:</span> {application.homeDetails.landlordPermission}</p>
            )}
            {application.homeDetails.activityLevel && (
              <p><span className="font-medium">Activity Level:</span> {application.homeDetails.activityLevel}</p>
            )}
          </div>
          {application.homeDetails.homeImages?.length > 0 && (
            <div className="mt-6">
              <h3 className="font-medium text-blue-700 mb-3">Home Images</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {application.homeDetails.homeImages.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`Home ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border-2 border-white shadow-sm"
                  />
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Family Details */}
        <section className="mb-8 bg-green-50 p-6 rounded-xl">
          <h2 className="text-xl font-semibold text-green-800 border-b-2 border-green-200 pb-2 mb-4">
            Family Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
            <p><span className="font-medium">Adults:</span> {application.familyDetails.numberOfAdults}</p>
            {application.familyDetails.numberOfKids !== undefined && (
              <p><span className="font-medium">Children:</span> {application.familyDetails.numberOfKids}</p>
            )}
            {application.familyDetails.youngestChildAge !== undefined && (
              <p><span className="font-medium">Youngest Child:</span> {application.familyDetails.youngestChildAge}</p>
            )}
            <p><span className="font-medium">Visiting Children:</span> {application.familyDetails.visitingChildren ? 'Yes' : 'No'}</p>
            <p><span className="font-medium">Flatmates:</span> {application.familyDetails.flatmates ? 'Yes' : 'No'}</p>
            <p><span className="font-medium">Pet Allergies:</span> {application.familyDetails.petAllergies ? 'Yes' : 'No'}</p>
            {application.familyDetails.otherAnimals && (
              <p><span className="font-medium">Other Pets:</span> {application.familyDetails.otherAnimals}</p>
            )}
          </div>
        </section>

        {/* Lifestyle */}
        <section className="mb-8 bg-purple-50 p-6 rounded-xl">
          <h2 className="text-xl font-semibold text-purple-800 border-b-2 border-purple-200 pb-2 mb-4">
            Lifestyle
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
            <p><span className="font-medium">Description:</span> {application.lifestyle.description}</p>
            <p><span className="font-medium">Moving Soon:</span> {application.lifestyle.movingSoon ? 'Yes' : 'No'}</p>
            <p><span className="font-medium">Holidays Planned:</span> {application.lifestyle.holidaysPlanned ? 'Yes' : 'No'}</p>
            <p><span className="font-medium">Own Transport:</span> {application.lifestyle.ownTransport ? 'Yes' : 'No'}</p>
          </div>
        </section>

        {/* Experience */}
        <section className="mb-8 bg-rose-50 p-6 rounded-xl">
          <h2 className="text-xl font-semibold text-rose-800 border-b-2 border-rose-200 pb-2 mb-4">
            Experience
          </h2>
          <p className="text-gray-700 leading-relaxed">
            {application.experience.description}
          </p>
        </section>

        {/* Metadata */}
        <div className="text-center text-sm text-gray-500 mb-8">
          Submitted {new Date(application.submittedAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </div>

        {/* Action Button */}
        <div className="text-center mt-8">
          <button
            onClick={handleInterested}
            disabled={adStatus === 'Pending'}
            className={`px-8 py-3 font-semibold rounded-lg transition-all duration-300 ${
              adStatus === 'Pending'
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-teal-500 to-teal-800 text-white hover:shadow-lg hover:shadow-teal-100'
            }`}
          >
            {adStatus === 'Pending' ? 'Already Marked as Interested' : 'I’m Interested'}
          </button>
        </div>

      </div>
    </div>
  );
}
