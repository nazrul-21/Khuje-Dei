import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import useAuthStore from '../store/authStore';
import api from '../api/axios';

const VolunteerApply = () => {
  const [formData, setFormData] = useState({
    reason: '',
    experience: '',
    availability: 'weekends',
    specializations: [],
    bio: '',
    location: {
      city: '',
      area: ''
    }
  });
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const specializationOptions = [
    'Electronics', 'Documents', 'Jewelry', 'Clothing', 
    'Bags', 'Keys', 'Pets', 'Vehicles', 'Other'
  ];

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await api.get('/volunteers/my-status');
        if (response.data.hasApplied) {
          navigate('/volunteer-status');
        }
      } catch (error) {
        console.error('Error checking volunteer status:', error);
      } finally {
        setCheckingStatus(false);
      }
    };

    if (user) {
      checkStatus();
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('location.')) {
      const locationField = name.split('.')[1];
      setFormData({
        ...formData,
        location: {
          ...formData.location,
          [locationField]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSpecializationChange = (specialization) => {
    if (formData.specializations.includes(specialization)) {
      setFormData({
        ...formData,
        specializations: formData.specializations.filter(s => s !== specialization)
      });
    } else {
      setFormData({
        ...formData,
        specializations: [...formData.specializations, specialization]
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/volunteers/apply', formData);
      toast.success('Application submitted successfully!');
      navigate('/volunteer-status');
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error(error.response?.data?.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  if (checkingStatus) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Volunteer Application</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <p className="text-gray-700 mb-4">
          Volunteers play a crucial role in helping lost items find their way back to their owners. 
          As a volunteer, you'll have additional capabilities to assist users and moderate content.
        </p>
        <p className="text-gray-700 mb-4">
          Please tell us why you'd like to become a volunteer and any relevant experience you have.
        </p>
      </div>


      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-4">
          <label htmlFor="reason" className="block text-gray-700 font-medium mb-2">
            Why do you want to be a volunteer?
          </label>
          <textarea
            id="reason"
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="4"
          ></textarea>
        </div>

        <div className="mb-4">
          <label htmlFor="experience" className="block text-gray-700 font-medium mb-2">
            Relevant experience (if any)
          </label>
          <textarea
            id="experience"
            name="experience"
            value={formData.experience}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="4"
          ></textarea>
        </div>

        <div className="mb-4">
          <label htmlFor="bio" className="block text-gray-700 font-medium mb-2">
            Short bio (visible to other users)
          </label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="3"
          ></textarea>
        </div>

        <div className="mb-4">
          <label htmlFor="availability" className="block text-gray-700 font-medium mb-2">
            Availability
          </label>
          <select
            id="availability"
            name="availability"
            value={formData.availability}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="weekdays">Weekdays</option>
            <option value="weekends">Weekends</option>
            <option value="evenings">Evenings</option>
            <option value="fulltime">Full-time</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">
            Specializations (select all that apply)
          </label>
          <div className="grid grid-cols-2 gap-2">
            {specializationOptions.map((specialization) => (
              <div key={specialization} className="flex items-center">
                <input
                  type="checkbox"
                  id={`specialization-${specialization}`}
                  checked={formData.specializations.includes(specialization)}
                  onChange={() => handleSpecializationChange(specialization)}
                  className="mr-2"
                />
                <label htmlFor={`specialization-${specialization}`}>
                  {specialization}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">
            Location (optional)
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="location.city" className="block text-gray-600 text-sm mb-1">
                City
              </label>
              <input
                type="text"
                id="location.city"
                name="location.city"
                value={formData.location.city}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="location.area" className="block text-gray-600 text-sm mb-1">
                Area
              </label>
              <input
                type="text"
                id="location.area"
                name="location.area"
                value={formData.location.area}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="mt-6">
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 rounded-md text-white font-medium ${
              loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {loading ? 'Submitting...' : 'Submit Application'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VolunteerApply;
