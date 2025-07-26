import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Pencil, Trash2 } from "lucide-react";
import Spinner from './Spinner';
import { useNavbar } from './NavbarContext';

const Services = () => {
  const {userRole} = useNavbar();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const navigate = useNavigate();

  // Fetch existing services
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get('http://localhost:5000/auth/get-services', { params: { userRole }, withCredentials: true });
        setServices(response.data);
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Delete service
  const handleDelete = async () => {
    try {
      const response = await axios.delete(`http://localhost:5000/auth/delete-service/${serviceToDelete._id}`,
        {
          params: { userRole }, // Include userRole as a query parameter
          withCredentials: true, // Ensure credentials are sent if required
        }
      );
  
      if (response.data.success) {
        setServices(services.filter((service) => service._id !== serviceToDelete._id));
        setShowDeleteConfirm(false);
      } else {
        console.error('Failed to delete service:', response.data.message);
      }
    } catch (error) {
      console.error('Error deleting service:', error.response?.data || error.message);
    }
  };
  

  const handleAddService = () => {
    navigate('/add-service');
  };

  return (
    <div className="container rounded-lg shadow-gray-400 md:bg-orange-200 md:shadow-md max-w-4xl mx-auto p-4 my-10">
      {loading ? (
        <div className="flex justify-center items-center p-4 m-20">
          <Spinner />
        </div>
      ) : (
        <>
          <h1 className="text-2xl font-semibold text-center mb-6 text-orange-700">Your Services</h1>
          <div className="text-right mb-4">
            <button
              onClick={handleAddService}
              className="px-6 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600"
            >
              Add Service
            </button>
          </div>

          {services.length === 0 ? (
            <div className="text-center text-lg text-gray-500 mt-10">
              No services added yet.
            </div>
          ) : (
            <div className="space-y-6">
              {services.map(service => (
                <div
                  key={service._id}
                  className="bg-white border border-gray-200 shadow-md rounded-lg p-6 transition duration-300 hover:shadow-lg"
                >
                  {/* Header Section */}
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-2xl font-semibold text-teal-800">
                      {service.services.join(', ')}
                    </h2>

                    {/* Icons with spacing */}
                    <div className="flex items-center space-x-6 mt-1">
                      {/* Edit Icon */}
                      <div className="relative group">
                        <Link
                          to={`/edit-service/${service._id}`}
                          className="text-yellow-600 hover:text-yellow-800"
                        >
                          <Pencil className="w-6 h-6" />
                        </Link>
                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 text-xs bg-gray-200 text-gray-800 rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                          Edit
                        </span>
                      </div>

                      {/* Delete Icon */}
                      <div className="relative group">
                        <button
                          onClick={() => {
                            setServiceToDelete(service);
                            setShowDeleteConfirm(true);
                          }}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-6 h-6" />
                        </button>
                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 text-xs bg-gray-200 text-gray-800 rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                          Delete
                        </span>
                      </div>
                    </div>

                  </div>

                  {/* Delivery Method */}
                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-600">Delivery Method:</p>
                    <div className="mt-1">
                      {service.deliveryMethod && service.deliveryMethod.trim() !== "" ? (
                        <span className="text-sm bg-orange-100 text-orange-700 px-3 py-1 rounded-full">
                          {service.deliveryMethod}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-500">Not specified</span>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-700 mb-4 whitespace-pre-line">
                    {service.description}
                  </p>

                  {/* Price */}
                  <div className="text-right">
                    <span className="text-lg font-semibold text-red-600">
                      Fee: Rs. {service.price}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-xl px-2 py-3 md:p-6 max-w-sm md:max-w-md w-full">
            <h3 className="text-xl md:text-2xl font-semibold text-red-600 mb-4 text-center">
              Confirm Deletion
            </h3>
            <p className="text-gray-700 text-center mb-6">
              Are you sure you want to delete this service? This action is
              <span className="font-semibold text-red-500"> irreversible </span>
              and will delete all data associated with it.
            </p>
            <div className="flex justify-around items-center">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-6 py-3 bg-gray-300 text-gray-700 font-medium rounded-lg shadow-md hover:bg-gray-400 transition duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-6 py-3 bg-red-600 text-white font-medium rounded-lg shadow-md hover:bg-red-700 transition duration-200"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Services;
