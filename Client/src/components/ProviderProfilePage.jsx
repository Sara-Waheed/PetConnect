// src/pages/ProviderProfilePage.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { Star, Calendar, Clock, MapPin } from "lucide-react";

const ProviderProfilePage = () => {
  const { type, id } = useParams(); // "vet" | "groomer" | "sitter"
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [{ data: p }, { data: r }] = await Promise.all([
          axios.get(`/api/${type}/${id}`),
          axios.get(`/api/${type}/${id}/reviews?limit=5`)
        ]);
        setProfile(p);
        setServices(p.services);
        setReviews(r);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [type, id]);

  if (loading) return <div className="p-8 text-center">Loading…</div>;
  if (!profile) return <div className="p-8 text-center text-red-600">Profile not found</div>;

  const {
    name,
    yearsOfExperience,
    city,
    clinicId,
    groomingSpecialties,
    sitterAddress,
    emailVerified,
    verificationStatus,
    // assume profile.photoUrl exists
    photoUrl = "/placeholder-avatar.png",
  } = profile;

  const titleType = type === "vet" ? "Veterinarian" :
                    type === "groomer" ? "Groomer" : "Pet Sitter";

  const capitalize = (s) => s[0].toUpperCase() + s.slice(1);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ─── NAVBAR ─── */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-teal-600">PetConnect</Link>
          <nav className="space-x-6 text-gray-700">
            <Link to="/doctors" className="hover:text-teal-600">Vets</Link>
            <Link to="/groomers" className="hover:text-teal-600">Groomers</Link>
            <Link to="/sitters" className="hover:text-teal-600">Sitters</Link>
            <Link to="/services" className="hover:text-teal-600">Services</Link>
            <Link to="/blog" className="hover:text-teal-600">Blog</Link>
          </nav>
        </div>
      </header>

      {/* ─── MAIN ─── */}
      <main className="container mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* ─── LEFT COLUMN ─── */}
        <section className="md:col-span-2 space-y-8">
          {/* Breadcrumbs */}
          <nav className="text-sm text-gray-500">
            <Link to="/" className="hover:underline">Home</Link> &gt;{" "}
            <Link to={`/${type}s`} className="capitalize hover:underline">{titleType}</Link> &gt;{" "}
            <span className="font-semibold">{name}</span>
          </nav>

          {/* Profile Header */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-x-0 sm:space-x-6 space-y-4 sm:space-y-0">
            <img
              src={photoUrl}
              alt={name}
              className="w-32 h-32 rounded-full object-cover"
            />
            <div>
              <h1 className="text-3xl font-bold">{name}</h1>
              <div className="flex items-center space-x-4 text-gray-600 mt-1">
                <span className="capitalize">{titleType}</span>
                <span>&bull;</span>
                <span>{city}</span>
                <span>&bull;</span>
                <span>{yearsOfExperience} yr{yearsOfExperience>1 && "s"} exp</span>
              </div>
              <div className="mt-2 space-x-2">
                {emailVerified && 
                  <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs">Email verified</span>
                }
                <span
                  className={`px-2 py-0.5 rounded text-xs ${
                    verificationStatus === "verified" ? "bg-green-100 text-green-800" :
                    verificationStatus === "pending"  ? "bg-yellow-100 text-yellow-800" :
                                                      "bg-red-100 text-red-800"
                  }`}
                >
                  {capitalize(verificationStatus)}
                </span>
              </div>
            </div>
          </div>

          {/* About / Bio */}
          <div>
            <h2 className="text-2xl font-semibold mb-2">About {name}</h2>
            {type === "vet" && (
              <p className="text-gray-700">
                Affiliated Clinic: <strong>{clinicId.name || clinicId}</strong>
              </p>
            )}
            {type === "groomer" && (
              <p className="text-gray-700">
                Specialties: <strong>{groomingSpecialties}</strong>
              </p>
            )}
            {type === "sitter" && (
              <p className="text-gray-700">
                Home base: <strong>{sitterAddress}</strong>
              </p>
            )}
          </div>

          {/* Services List */}
          <div>
            <h2 className="text-2xl font-semibold mb-2">Services Offered</h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {services.map(svc => (
                <li key={svc._id} className="bg-white p-4 rounded-lg shadow-sm">
                  {svc.services.length
                    ? svc.services.join(", ")
                    : svc.customService}
                </li>
              ))}
            </ul>
          </div>

          {/* Reviews Summary */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">
              {name}’s Reviews ({reviews.length})
            </h2>
            <div className="flex items-center space-x-6 mb-6">
              <div className="w-20 h-20 rounded-full bg-teal-600 flex items-center justify-center text-white text-2xl font-bold">
                {Math.round((reviews.filter(r => r.rating>=4).length / reviews.length) * 100)}%
              </div>
              <div className="space-y-1 text-gray-700">
                <p><strong>Satisfied out of {reviews.length} patients</strong></p>
                <div className="space-y-2">
                  {["Checkup","Environment","Staff"].map((label,i) => {
                    const pct = Math.round(
                      reviews.reduce((a,r)=> a + (r[label.toLowerCase()]||0),0) 
                      / reviews.length
                    );
                    return (
                      <div key={i} className="flex items-center space-x-2">
                        <span className="flex-1">{label}</span>
                        <span>{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* One Sample Review */}
            {reviews[0] && (
              <blockquote className="border-l-4 border-teal-500 pl-4 italic text-gray-700 mb-4">
                “{reviews[0].comment}”
                <footer className="mt-2 text-sm text-gray-500">
                  Verified patient • {reviews[0].authorMask} • {reviews[0].ago}
                </footer>
              </blockquote>
            )}
            <Link
              to={`/${type}/${id}/reviews`}
              className="inline-block px-6 py-2 border border-teal-600 text-teal-600 rounded hover:bg-teal-50"
            >
              Read all reviews
            </Link>
          </div>
        </section>

        {/* ─── RIGHT STICKY SIDEBAR ─── */}
        <aside className="md:col-span-1 space-y-6 sticky top-24 self-start">
          {services.map(svc => (
            <div key={svc._id} className="bg-white rounded-xl shadow p-6 space-y-4">
              <h3 className="text-lg font-semibold">
                {svc.customService || svc.services.join(", ")}
              </h3>
              <p>
                <span className="font-semibold">Price:</span> Rs. {svc.price}
              </p>
              <p>
                <span className="font-semibold">Method:</span> {svc.deliveryMethod}
              </p>
              {svc.address && (
                <p className="flex items-center space-x-2">
                  <MapPin size={16} /> <span>{svc.address}</span>
                </p>
              )}
              <div>
                <span className="font-semibold">Availability:</span>
                <ul className="mt-1 space-y-1">
                  {svc.availability.map(a => (
                    <li key={a.day} className="flex items-center space-x-2">
                      <Calendar size={16} /> <span>{a.day}:</span>{" "}
                      <Clock size={16} className="opacity-70" />{" "}
                      {a.slots.map(s => `${s.startTime}–${s.endTime}`).join(", ")}
                    </li>
                  ))}
                </ul>
              </div>
              <button className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2 rounded-lg transition">
                Book {capitalize(type)}
              </button>
            </div>
          ))}
        </aside>
      </main>
    </div>
  );
};

export default ProviderProfilePage;
