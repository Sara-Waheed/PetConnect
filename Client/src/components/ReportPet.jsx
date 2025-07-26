// // src/components/ReportPet.jsx
// import React, { useState, useRef } from "react";
// import axios from "axios";
// import backgroundImage from "../assets/BgMemoryhd.jpg";
// import { FaPhone, FaUser, FaMapMarkerAlt } from "react-icons/fa";

// // Static mapping of Pakistan cities → areas
// const cityAreaMap = {
//   Karachi: [
//     "Clifton", "Defence", "Gulshan", "North Nazimabad", "Saddar",
//     "Korangi", "Malir", "Lyari", "PECHS", "Shah Faisal",
//     "Other"
//   ],
//   Lahore: [
//     "DHA", "Gulberg", "Model Town", "Cantt", "Johar Town",
//     "Bahria Town", "Mozang", "Sabzazar", "Iqbal Town", "Wapda Town",
//     "Other"
//   ],
//   Islamabad: [
//     "F-6", "G-7", "G-10", "E-11", "B-17",
//     "F-11", "I-9", "D-12", "F-8", "E-7",
//     "Other"
//   ],
//   Rawalpindi: [
//     "Satellite Town", "Bahria Town", "Chaklala", "Saddar", "Gulraiz",
//     "Askari", "Cantonment", "Dhok", "Dhoke Ratta", "College Road",
//     "Other"
//   ],
//   Peshawar: [
//     "Hayatabad", "University Town", "Phase 5", "Saddar", "Gulbahar",
//     "Peshtakhara", "Khyber Road", "Regi Model Town", "Shah Alam",
//     "University Road", "Other"
//   ],
//   Quetta: [
//     "Sariab", "Airport Road", "Mehdi Abad", "Killi Abdullah", "Satellite Town",
//     "Gulistan", "Killi Sahibzai", "Cantt", "Tameer-e-Nau", "Shalkhan",
//     "Other"
//   ],
//   Faisalabad: [
//     "D Ground", "Madina Town", "Johar Town", "Samanabad", "Nihal Town",
//     "Jaranwala Road", "Pakka Bagh", "Dhobi Ghat", "Gulistan Colony",
//     "Sheikhupura Road", "Other"
//   ],
//   Other: ["Other"]
// };

// function ReportPet() {
//   const [reportType, setReportType] = useState("lost");
//   const [file, setFile] = useState(null);
//   const [previewUrl, setPreviewUrl] = useState(null);
//   const [phoneNumber, setPhoneNumber] = useState("");
//   const [name, setName] = useState("");
//   const [city, setCity] = useState("");
//   const [area, setArea] = useState("");
//   const [expandSearch, setExpandSearch] = useState(false);
//   const [matches, setMatches] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState("");
//   const [messageStyle, setMessageStyle] = useState("text-red-600");
//   const [lostSubmitted, setLostSubmitted] = useState(false);

//   const fileInputRef = useRef(null);

//   const clearFileAndPreview = () => {
//     setFile(null);
//     setPreviewUrl(null);
//     setExpandSearch(false);
//     setMatches([]);
//     if (fileInputRef.current) fileInputRef.current.value = "";
//   };

//   const handleReportTypeChange = (type) => {
//     setReportType(type);
//     clearFileAndPreview();
//     setMatches([]);
//     setMessage("");
//     setMessageStyle("text-red-600");
//     setLostSubmitted(false);
//     setExpandSearch(false);
//     setCity("");
//     setArea("");
//     setPhoneNumber("");
//     setName("");
//   };

//   const handleFileChange = (e) => {
//     setMessage("");
//     setLostSubmitted(false);
//     const selected = e.target.files[0];
//     setFile(selected);
//     setExpandSearch(false);
//     setPreviewUrl(selected ? URL.createObjectURL(selected) : null);
//   };

//   const fileToBase64 = (file) =>
//     new Promise((resolve, reject) => {
//       const reader = new FileReader();
//       reader.readAsDataURL(file);
//       reader.onload = () => resolve(reader.result);
//       reader.onerror = reject;
//     });

//   const searchMatches = async (expand = false) => {
//     setExpandSearch(expand);
//     setMessage("");
//     setLoading(true);
//     setMatches([]);

//     const imageBase64 = await fileToBase64(file);
//     const payload = {
//       report_type: reportType,
//       image: imageBase64,
//       city: city,
//       area: expand ? "" : area,
//       expand_search: expand,
//       ...(reportType === "found" && { name, phone_number: phoneNumber }),
//     };

//     try {
//       const { data } = await axios.post("http://localhost:8001/report/", payload);

//       if (reportType === "lost") {
//         setMatches(data.matches);
//         setLostSubmitted(true);
//         // setCity("");
//         // setArea("");

//         if (data.matches.length > 0) {
//           setMessage("Match search completed!");
//           setMessageStyle("text-green-600");
//         } else {
//           setMessage(
//             expand
//               ? `No matches found in all of ${city}.`
//               : `No matches found in ${area}.`
//           );
//           setMessageStyle("text-gray-700");
//         }
//       } else {
//         setMessage("Report submitted successfully!");
//         setMessageStyle("text-green-600");
//         setPhoneNumber("");
//         setName("");
//         setCity("");
//         setArea("");
//         clearFileAndPreview();
//       }
//     } catch (err) {
//       console.error(err);
//       setMessage("Failed to submit report. Please try again.");
//       setMessageStyle("text-red-600");
//     }

//     setLoading(false);
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     searchMatches(false);
//   };

//   return (
//     <div
//       className="min-h-screen bg-cover bg-center flex flex-col items-center justify-center p-6"
//       style={{ backgroundImage: `url(${backgroundImage})` }}
//     >
//       <div className="bg-white rounded-lg shadow-md border border-gray-300 p-8 w-full max-w-4xl mx-auto">
//         <h1 className="text-3xl font-bold mb-6 text-center text-orange-700">
//           {reportType === "lost" ? "Lost Your Pet?" : "Found a Pet?"}
//         </h1>
//         <p className="text-gray-700 mb-4 text-center text-lg">
//           {reportType === "lost"
//             ? "Help us find your furry friend by uploading a picture of your lost pet."
//             : "Help reunite a pet with its owner by uploading a picture of a found pet."}
//         </p>

//         {/* Toggle */}
//         <div className="flex justify-center mb-6">
//           <div className="inline-flex rounded-full border border-teal-800 overflow-hidden">
//             <button
//               onClick={() => handleReportTypeChange("lost")}
//               className={`px-8 py-2 font-medium transition ${reportType === "lost"
//                 ? "bg-teal-800 text-white"
//                 : "bg-white text-teal-800"
//                 }`}
//             >
//               Lost
//             </button>
//             <button
//               onClick={() => handleReportTypeChange("found")}
//               className={`px-8 py-2 font-medium transition ${reportType === "found"
//                 ? "bg-teal-800 text-white"
//                 : "bg-white text-teal-800"
//                 }`}
//             >
//               Found
//             </button>
//           </div>
//         </div>

//         <div className="flex flex-col sm:flex-row sm:space-x-6">
//           {/* Form */}
//           <div className="flex-1">
//             <form onSubmit={handleSubmit} className="space-y-4">
//               {/* Image Upload */}
//               <div>
//                 <label className="block text-gray-700 font-medium mb-2">
//                   Upload Image of the Pet
//                 </label>
//                 <input
//                   ref={fileInputRef}
//                   type="file"
//                   accept="image/*"
//                   onClick={() => {
//                     setMessage("");
//                     setLostSubmitted(false);
//                   }}
//                   onChange={handleFileChange}
//                   className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>

//               {/* Location */}
//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <label className="block mb-1 font-medium">City</label>
//                   <select
//                     value={city}
//                     onChange={(e) => {
//                       setCity(e.target.value);
//                       setArea(""
//                       );
//                     }}
//                     className="w-full p-2 border rounded"
//                   >
//                     <option value="">-- Select City --</option>
//                     {Object.keys(cityAreaMap).map((ct) => (
//                       <option key={ct} value={ct}>{ct}</option>
//                     ))}
//                   </select>
//                 </div>
//                 <div>
//                   <label className="block mb-1 font-medium">Area</label>
//                   <select
//                     value={area}
//                     onChange={(e) => setArea(e.target.value)}
//                     disabled={!city || city === "Other" || expandSearch}
//                     className="w-full p-2 border rounded disabled:opacity-50"
//                   >
//                     <option value="">-- Select Area --</option>
//                     {cityAreaMap[city]?.map((ar) => (
//                       <option key={ar} value={ar}>{ar}</option>
//                     ))}
//                   </select>
//                 </div>
//               </div>

//               {/* Found only */}
//               {reportType === "found" && (
//                 <>
//                   <div>
//                     <label className="block text-gray-700 font-medium mb-2">Your Name</label>
//                     <input
//                       type="text"
//                       value={name}
//                       onChange={(e) => setName(e.target.value)}
//                       placeholder="Enter your name"
//                       required
//                       className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-gray-700 font-medium mb-2">Phone Number</label>
//                     <input
//                       type="tel"
//                       value={phoneNumber}
//                       onChange={e => setPhoneNumber(e.target.value)}
//                       placeholder="Enter phone number"
//                       pattern="^(?:\+92|0)?3\d{2}\d{7}$"
//                       required
//                       className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     />
//                   </div>
//                 </>
//               )}

//               {/* Message */}
//               {message && <div className={`mb-4 text-center ${messageStyle}`}>{message}</div>}

//               {/* Submit */}
//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="w-full bg-gradient-to-r from-teal-600 to-teal-800 hover:from-teal-500 hover:to-teal-700 text-white font-medium p-3 rounded-lg"
//               >
//                 {loading ? (reportType === "lost" ? "Finding..." : "Submitting...") : (reportType === "lost" ? "Find Match" : "Submit Report")}
//               </button>
//             </form>
//           </div>

//           {/* Preview */}
//           <div className="flex-1 relative flex items-center justify-center mt-6 sm:mt-0">
//             {previewUrl ? (
//               <>
//                 <button
//                   onClick={clearFileAndPreview}
//                   className="absolute top-1 right-1 bg-teal-700 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-teal-600"
//                 >&times;</button>
//                 <img
//                   src={previewUrl}
//                   alt="Preview"
//                   className="w-full max-h-[300px] object-contain rounded-lg shadow-md"
//                 />
//               </>
//             ) : (
//               <div className="text-gray-400">Image preview will appear here</div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Lost → no matches fallback */}
//       {reportType === "lost" && lostSubmitted && matches.length === 0 && !expandSearch && (
//         <div className="w-full max-w-4xl px-4 mt-6 text-center">
//           <p className="mb-4 text-gray-700">No matches found in {area}.</p>
//           <button
//             onClick={() => searchMatches(true)}
//             className="px-6 py-2 bg-teal-700 text-white rounded-lg"
//           >
//             Search entire {city}
//           </button>
//         </div>
//       )}

//       {/* Lost → matches */}
//       {reportType === "lost" && lostSubmitted && matches.length > 0 && (
//         <div className="w-full max-w-5xl px-4 mt-8">
//           <h2 className="text-2xl font-bold mb-6 text-center">Matching Found Pets</h2>
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
//             {matches.map((match, idx) => (
//               <div key={idx} className="border rounded-lg shadow-lg p-6">
//                 <img src={match.found_image} alt="Found pet" className="w-full h-48 object-contain mb-4 rounded-lg" />
//                 {match.name && (
//                   <div className="flex items-center text-gray-600 text-lg mt-2">
//                     <FaUser className="mr-2 text-teal-600" />
//                     <span>Found by {match.name}</span>
//                   </div>
//                 )}
//                 {match.phone_number && (
//                   <div className="flex items-center text-gray-600 text-lg mt-2">
//                     <FaPhone className="mr-2 text-teal-600" />
//                     <span>{match.phone_number}</span>
//                   </div>
//                 )}
//                 {match.city && (
//                   <div className="flex items-center text-gray-600 text-lg mt-2">
//                     <FaMapMarkerAlt className="mr-2 text-teal-600" />
//                     <span>
//                       {match.city}
//                       {match.area ? `, ${match.area}` : ''}
//                     </span>
//                   </div>
//                 )}

//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default ReportPet;


import React, { useState, useRef } from "react";
import axios from "axios";
import backgroundImage from "../assets/BgMemoryhd.jpg";
import { FaPhone, FaUser, FaMapMarkerAlt } from "react-icons/fa";

// List of Pakistan cities
const cities = [
  "Karachi",
  "Lahore",
  "Islamabad",
  "Rawalpindi",
  "Peshawar",
  "Quetta",
  "Faisalabad",
  "Other",
];

function ReportPet() {
  const [reportType, setReportType] = useState("lost");
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [city, setCity] = useState("");
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageStyle, setMessageStyle] = useState("text-red-600");
  const [lostSubmitted, setLostSubmitted] = useState(false);

  const fileInputRef = useRef(null);

  const clearFileAndPreview = () => {
    setFile(null);
    setPreviewUrl(null);
    setMatches([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleReportTypeChange = (type) => {
    setReportType(type);
    clearFileAndPreview();
    setMessage("");
    setMessageStyle("text-red-600");
    setLostSubmitted(false);
    setCity("");
    setName("");
    setPhoneNumber("");
  };

  const handleFileChange = (e) => {
    setMessage("");
    setLostSubmitted(false);
    const selected = e.target.files[0];
    setFile(selected);
    setPreviewUrl(selected ? URL.createObjectURL(selected) : null);
  };

  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
    });

  const searchMatches = async () => {
    if (!file || !city) {
      setMessage("Please upload an image and select a city.");
      setMessageStyle("text-red-600");
      return;
    }

    setMessage("");
    setLoading(true);
    setMatches([]);

    const imageBase64 = await fileToBase64(file);
    const payload = {
      report_type: reportType,
      image: imageBase64,
      city,
      ...(reportType === "found" && { name, phone_number: phoneNumber }),
    };

    try {
      const { data } = await axios.post("http://localhost:8001/report/", payload);

      if (reportType === "lost") {
        setMatches(data.matches);
        setLostSubmitted(true);

        if (data.matches.length > 0) {
          setMessage("Match search completed!");
          setMessageStyle("text-green-600");
        } else {
          setMessage(`No matches found in ${city}.`);
          setMessageStyle("text-gray-700");
        }
      } else {
        setMessage("Report submitted successfully!");
        setMessageStyle("text-green-600");
        setPhoneNumber("");
        setName("");
        setCity("");
        clearFileAndPreview();
      }
    } catch (err) {
      console.error(err);
      setMessage("Failed to submit report. Please try again.");
      setMessageStyle("text-red-600");
    }

    setLoading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    searchMatches();
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex flex-col items-center justify-center p-6"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="bg-white rounded-lg shadow-md border border-gray-300 p-8 w-full max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center text-orange-700">
          {reportType === "lost" ? "Lost Your Pet?" : "Found a Pet?"}
        </h1>
        <p className="text-gray-700 mb-4 text-center text-lg">
          {reportType === "lost"
            ? "Help us find your furry friend by uploading a picture of your lost pet."
            : "Help reunite a pet with its owner by uploading a picture of a found pet."}
        </p>

        {/* Toggle */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex rounded-full border border-teal-800 overflow-hidden">
            <button
              onClick={() => handleReportTypeChange("lost")}
              className={`px-8 py-2 font-medium transition ${reportType === "lost"
                ? "bg-teal-800 text-white"
                : "bg-white text-teal-800"
                }`}
            >
              Lost
            </button>
            <button
              onClick={() => handleReportTypeChange("found")}
              className={`px-8 py-2 font-medium transition ${reportType === "found"
                ? "bg-teal-800 text-white"
                : "bg-white text-teal-800"
                }`}
            >
              Found
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:space-x-6">
          {/* Form */}
          <div className="flex-1">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Image Upload */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Upload Image of the Pet <span className="text-red-600">*</span>
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onClick={() => setMessage("")}
                  onChange={handleFileChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* City Select */}
              <div>
                <label className="block mb-1 font-medium">City <span className="text-red-600">*</span></label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="">-- Select City --</option>
                  {cities.map((ct) => (
                    <option key={ct} value={ct}>{ct}</option>
                  ))}
                </select>
              </div>

              {/* Found only */}
              {reportType === "found" && (
                <>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Your Name <span className="text-red-600">*</span></label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Phone Number <span className="text-red-600">*</span></label>
                    <input
                        type="tel"
                        value={phoneNumber}
                        onChange={e => setPhoneNumber(e.target.value)}
                        placeholder="Enter phone number"
                        pattern="^(?:\+92|0)?3\d{2}\d{7}$"
                         required
                         className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </>
              )}

              {/* Message */}
              {message && <div className={`mb-4 text-center ${messageStyle}`}>{message}</div>}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-teal-600 to-teal-800 hover:from-teal-500 hover:to-teal-700 text-white font-medium p-3 rounded-lg"
              >
                {loading ? (reportType === "lost" ? "Finding..." : "Submitting...") : (reportType === "lost" ? "Find Match" : "Submit Report")}
              </button>
            </form>
          </div>

          {/* Preview */}
          <div className="flex-1 relative flex items-center justify-center mt-6 sm:mt-0">
            {previewUrl ? (
              <>
                <button
                  onClick={clearFileAndPreview}
                  className="absolute top-1 right-1 bg-teal-700 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-teal-600"
                >&times;</button>
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full max-h-[300px] object-contain rounded-lg shadow-md"
                />
              </>
            ) : (
              <div className="text-gray-400">Image preview will appear here</div>
            )}
          </div>
        </div>

        {/* Lost → matches */}
        {reportType === "lost" && lostSubmitted && matches.length > 0 && (
          <div className="w-full max-w-5xl px-4 mt-8">
            <h2 className="text-2xl font-bold mb-6 text-center">Matching Found Pets</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {matches.map((match, idx) => (
                <div key={idx} className="border rounded-lg shadow-lg p-6">
                  <img src={match.found_image} alt="Found pet" className="w-full h-48 object-contain mb-4 rounded-lg" />
                  {match.name && (
                    <div className="flex items-center text-gray-600 text-lg mt-2">
                      <FaUser className="mr-2 text-teal-600" />
                      <span>Found by {match.name}</span>
                    </div>
                  )}
                  {match.phone_number && (
                    <div className="flex items-center text-gray-600 text-lg mt-2">
                      <FaPhone className="mr-2 text-teal-600" />
                      <span>{match.phone_number}</span>
                    </div>
                  )}
                  {match.city && (
                    <div className="flex items-center text-gray-600 text-lg mt-2">
                      <FaMapMarkerAlt className="mr-2 text-teal-600" />
                      <span>{match.city}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ReportPet;
