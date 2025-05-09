import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import useAuthStore from '../store/authStore';
import api from '../api/axios'; // Import the configured API client instead of axios

const Volunteers = () => {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    console.log("here")
    const fetchVolunteers = async () => {
      try {
        const response = await api.get('/volunteers'); // Use api instead of axios and remove '/api' prefix
        // Ensure we're setting an array to volunteers
        setVolunteers(Array.isArray(response.data) ? response.data : []);
        console.log('Volunteers data:', response.data); // Debug log
        setLoading(false);
      } catch (error) {
        console.error('Error fetching volunteers:', error);
        toast.error('Failed to load volunteers');
        setLoading(false);
      }
    };

    fetchVolunteers();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Ensure volunteers is an array before rendering
  const volunteersArray = Array.isArray(volunteers) ? volunteers : [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Our Volunteers</h1>
        {user && user.role !== 'volunteer' && (
          <Link 
            to="/volunteer-apply" 
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition duration-300"
          >
            Apply to be a Volunteer
          </Link>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">What do volunteers do?</h2>
        <p className="text-gray-700">
          Our volunteers help connect lost items with their owners. They assist in verifying claims, 
          moderating listings, and providing support to users. Volunteers are trusted members of our 
          community who contribute their time to make Khuje Dei more effective.
        </p>
      </div>
      
      {volunteersArray.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600 text-lg">No volunteers found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {volunteersArray.map((volunteer) => (
            <div key={volunteer._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">{volunteer.user?.name || 'Unknown'}</h2>
                <div className="text-sm text-gray-600 mb-4">
                  {/* <p>Items Helped: {volunteer.stats?.itemsHelped || 0}</p>
                  <p>Cases Resolved: {volunteer.stats?.casesResolved || 0}</p> */}
                  {volunteer.stats?.joinedAt && (
                    <p>Joined: {new Date(volunteer.stats.joinedAt).toLocaleDateString()}</p>
                  )}
                  {volunteer.specializations && volunteer.specializations.length > 0 && (
                    <p>Specializes in: {volunteer.specializations.join(', ')}</p>
                  )}
                </div>
                {volunteer.bio && (
                  <p className="text-gray-700 mb-4">{volunteer.bio}</p>
                )}
                <Link 
                  to={`/users/${volunteer.user?._id || '#'}`}
                  className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                >
                  View Profile
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Volunteers;
