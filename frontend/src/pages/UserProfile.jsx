import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import useAuthStore from '../store/authStore';
import api from '../api/axios';
import ReportUserModal from './ReportUserModal'; // Import the ReportUserModal component

function UserProfile() {
  const { userId } = useParams();
  const { user: currentUser, isAuthenticated } = useAuthStore();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/users/${userId}/profile`);
        setUser(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError(err.response?.data?.message || 'Failed to load user profile');
        toast.error(err.response?.data?.message || 'Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserProfile();
    }
  }, [userId]);

  // Redirect to own profile if viewing self
  useEffect(() => {
    if (currentUser && userId === currentUser.id) {
      navigate('/profile');
    }
  }, [currentUser, userId, navigate]);

  const handleReportUser = () => {
    setIsReportModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#61906B]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <Link to="/" className="text-sm font-medium text-red-600 hover:text-red-500">
                  Go back to home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">User Not Found</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>The user profile you're looking for doesn't exist or has been removed.</p>
              </div>
              <div className="mt-4">
                <Link to="/" className="text-sm font-medium text-yellow-600 hover:text-yellow-500">
                  Go back to home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{user.name}'s Profile</h1>
          {isAuthenticated && currentUser?.id !== userId && (
            <button
              onClick={handleReportUser}
              className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 border border-red-300 rounded-md hover:bg-red-50"
            >
              Report User
            </button>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-medium text-gray-900">User Information</h2>
            <div className="mt-4 border-t border-gray-200 pt-4">
              <dl className="divide-y divide-gray-200">
                <div className="py-3 flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">Name</dt>
                  <dd className="text-sm text-gray-900">{user.name}</dd>
                </div>
                {/* Only show email if it's verified */}
                {user.isEmailVerified && (
                  <div className="py-3 flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="text-sm text-gray-900">{user.email}</dd>
                  </div>
                )}
                <div className="py-3 flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">Member Since</dt>
                  <dd className="text-sm text-gray-900">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* You can add more sections here like user's listings, reviews, etc. */}
          
          <div className="flex justify-end">
            <Link
              to="/"
              className="px-4 py-2 text-sm font-medium text-[#61906B] border border-[#61906B] rounded-md hover:bg-[#f0f7f2]"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>

      {/* Use the ReportUserModal component */}
      <ReportUserModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        userId={userId}
      />
    </div>
  );
}

export default UserProfile;
