import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle, ClipboardPen, NotebookPen, Flag } from 'lucide-react';

const ComplaintForm = () => {
  const [complaintType, setComplaintType] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const navigate = useNavigate();


  const complaintTypes = [
    'Billing Issue',
    'Service Quality',
    'Customer Support',
    'Appointment Scheduling',
    'Technical Problem',
    'Other'
  ];

  const validateForm = () => {
    const errors = {};
    
    if (!complaintType.trim()) {
      errors.complaintType = 'Please select a complaint type';
    }
    
    if (description.trim().length < 20) {
      errors.description = 'Description must be at least 20 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/complaints/submit-complaint', {
        type: complaintType,
        description,
        status: 'Open'
      }, {
        headers: {
          'Content-Type': 'application/json',
          // Add authentication header if needed
          // 'Authorization': `Bearer ${token}`
        },withCredentials: true,
      });

      if (response.status === 201) {
        setSuccessMessage('Complaint submitted successfully!');
        setComplaintType('');
        setDescription('');
        setTimeout(() => {
            setSuccessMessage('');
            navigate('/'); // Redirect to home page
        }, 5000);
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to submit complaint';
      setErrorMessage(message);
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white rounded-xl shadow-lg ring-1 ring-gray-100">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-teal-50 rounded-full mb-4">
          <Flag className="w-7 h-7 text-orange-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-teal-500 to-teal-800 bg-clip-text text-transparent">
          Share Your Concern
        </h2>
        <p className="mt-2 text-gray-500">We value your feedback and will respond promptly</p>
      </div>

      {/* Messages */}
      {(successMessage || errorMessage) && (
        <div className={`mb-8 p-4 rounded-xl ${
          successMessage 
            ? 'bg-emerald-50 ring-1 ring-emerald-100' 
            : 'bg-rose-50 ring-1 ring-rose-100'
        }`}>
          <div className="flex items-center gap-3">
            {successMessage ? (
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            ) : (
              <AlertCircle className="w-6 h-6 text-rose-600" />
            )}
            <span className={successMessage ? 'text-emerald-700' : 'text-rose-700'}>
              {successMessage || errorMessage}
            </span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-4">
          <div className="relative">
            <label htmlFor="complaintType" className="block text-sm font-medium text-gray-700 mb-2">
              <span className="flex items-center gap-2">
                <ClipboardPen className="w-5 h-5 text-orange-600" />
                Complaint Type
              </span>
            </label>
            <select
              id="complaintType"
              value={complaintType}
              onChange={(e) => setComplaintType(e.target.value)}
              className={`w-full pl-11 pr-4 py-3 border-0 bg-gray-50 rounded-lg focus:ring-2 ring-1 ${
                validationErrors.complaintType 
                  ? 'ring-rose-500 focus:ring-rose-300 bg-rose-50' 
                  : 'ring-gray-200 focus:ring-teal-300 hover:ring-gray-300'
              } transition-all`}
            >
              <option value="">Select complaint category</option>
              {complaintTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {validationErrors.complaintType && (
              <p className="text-rose-600 text-sm mt-2 ml-1">{validationErrors.complaintType}</p>
            )}
          </div>

          <div className="relative">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              <span className="flex items-center gap-2">
                <NotebookPen className="w-5 h-5 text-orange-600" />
                Detailed Description
              </span>
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className={`w-full px-4 py-3 border-0 bg-gray-50 rounded-lg focus:ring-2 ring-1 ${
                validationErrors.description 
                  ? 'ring-rose-500 focus:ring-rose-300 bg-rose-50' 
                  : 'ring-gray-200 focus:ring-teal-300 hover:ring-gray-300'
              } transition-all`}
              placeholder="Describe your concern in detail..."
            />
            <div className="flex justify-between items-center mt-3">
              {validationErrors.description ? (
                <p className="text-rose-600 text-sm">{validationErrors.description}</p>
              ) : (
                <span className="text-sm text-gray-400">Minimum 20 characters</span>
              )}
              <span className={`text-sm ${
                description.length < 20 ? 'text-rose-500' : 'text-teal-600'
              }`}>
                {description.length}/20
              </span>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-64 mx-auto justify-center flex px-6 py-3.5 bg-gradient-to-r from-teal-500 to-teal-800 text-white font-semibold rounded-lg 
                    hover:shadow-lg hover:shadow-teal-100 
                    focus:outline-none focus:ring-2 focus:ring-teal-400 
                    disabled:opacity-80 disabled:cursor-not-allowed 
                    transition-all duration-300"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Submitting...
            </span>
          ) : (
            'Submit Concern'
          )}
        </button>
      </form>
    </div>
  );
};

export default ComplaintForm;