import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import useAuthStore from '../store/authStore';
import api from '../api/axios';

const VolunteerStatus = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await api.get('/volunteers/my-status');
        setStatus(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching volunteer status:', error);
        toast.error('Failed to load volunteer status');
        setLoading(false);
      }
    };

    if (user) {
      fetchStatus();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!status || !status.hasApplied) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">No Application Found</h1>
          <p className="text-gray-600 mb-6">You haven't applied to be a volunteer yet.</p>
          <Link 
            to="/volunteer-apply" 
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition duration-300"
          >
            Apply Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Volunteer Application Status</h1>
        
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <div className={`w-3 h-3 rounded-full mr-2 ${
              status.status === 'pending' ? 'bg-yellow-500' : 
              status.status === 'approved' ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            <span className="font-medium">
              Status: {status.status.charAt(0).toUpperCase() + status.status.slice(1)}
            </span>
          </div>
          
          {status.status === 'pending' && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
              <p className="text-yellow-700">
                Your application is currently under review. We'll notify you once a decision has been made.
              </p>
            </div>
          )}
          
          {status.status === 'approved' && (
            <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
              <p className="text-green-700">
                Congratulations! Your application has been approved. You are now a volunteer.
              </p>
              <Link 
                to="/volunteer-dashboard" 
                className="inline-block mt-2 text-green-700 font-medium hover:underline"
              >
                Go to Volunteer Dashboard →
              </Link>
            </div>
          )}
          
          {status.status === 'rejected' && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
              <p className="text-red-700">
                Unfortunately, your application was not approved at this time.
              </p>
              {status.rejectionReason && (
                <p className="text-red-700 mt-2">
                  Reason: {status.rejectionReason}
                </p>
              )}
            </div>
          )}
        </div>
        
        <div className="border-t border-gray-200 pt-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Application Details</h2>
          
          <div className="mb-4">
            <h3 className="text-gray-700 font-medium">Why you want to be a volunteer:</h3>
            <p className="text-gray-600 mt-1">{status.application.reason}</p>
          </div>
          
          <div className="mb-4">
            <h3 className="text-gray-700 font-medium">Your experience:</h3>
            <p className="text-gray-600 mt-1">{status.application.experience}</p>
          </div>
          
          <div className="text-sm text-gray-500 mt-4">
            Applied on: {new Date(status.application.appliedAt).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VolunteerStatus;
