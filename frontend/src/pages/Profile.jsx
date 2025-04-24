import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import api from '../api/axios';

function Profile() {
  const { user, checkAuth, isAuthenticated, isLoading, updateUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResendingVerification, setIsResendingVerification] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [isLoadingSuccessData, setIsLoadingSuccessData] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || ''
    }
  });

  // Check authentication on mount
  useEffect(() => {
    const init = async () => {
      if (!isAuthenticated) {
        await checkAuth();
      }
    };
    init();
  }, []);

  // Update form when user data changes
  useEffect(() => {
    if (user) {
      reset({
        name: user.name || '',
        email: user.email || ''
      });
      
      // Fetch success rate data
      fetchSuccessData();
    }
  }, [user, reset]);

  // Fetch success rate data
  const fetchSuccessData = async () => {
    if (!user) return;
    
    setIsLoadingSuccessData(true);
    try {
      const response = await api.get('/users/success-rate');
      setSuccessData(response.data);
    } catch (error) {
      console.error('Failed to fetch success data:', error);
      toast.error('Failed to load success rate information');
    } finally {
      setIsLoadingSuccessData(false);
    }
  };

  // Redirect if not authenticated and not loading
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await api.put('/users/profile', data);
      updateUser(response.data.user);
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangePassword = () => {
    navigate('/change-password');
  };

  const handleResendVerification = async () => {
    setIsResendingVerification(true);
    try {
      await api.post('/auth/resend-verification', { email: user.email });
      toast.success('Verification email has been sent to your inbox');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to resend verification email');
    } finally {
      setIsResendingVerification(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#61906B]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <div className="flex space-x-3">
            <button className="px-4 py-2 " >
            <Link
              to={`/users/${user?.id}`}
              className="text-sm font-medium text-[#61906B] hover:text-[#4e7357]"
            >
              View Public Profile
            </Link>
            </button>
            <button
              onClick={handleChangePassword}
              className="px-4 py-2 text-sm font-medium text-[#61906B] hover:text-[#4e7357]"
            >
              Change Password
            </button>
          </div>
        </div>

        {/* Success Rate Section */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Success Statistics</h2>
          {isLoadingSuccessData ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#61906B]"></div>
            </div>
          ) : successData ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-3 rounded shadow-sm">
                <p className="text-sm text-gray-500">Success Rate</p>
                <p className="text-2xl font-bold text-[#61906B]">{successData.successRate}%</p>
              </div>
              <div className="bg-white p-3 rounded shadow-sm">
                <p className="text-sm text-gray-500">Successful Returns</p>
                <p className="text-2xl font-bold text-[#61906B]">{successData.successCount}</p>
              </div>
              <div className="bg-white p-3 rounded shadow-sm">
                <p className="text-sm text-gray-500">Total Items Reported</p>
                <p className="text-2xl font-bold text-[#61906B]">{successData.totalReportedItems}</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 italic">No success data available</p>
          )}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              id="name"
              disabled={!isEditing}
              {...register('name', { required: 'Name is required' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#61906B] focus:ring-[#61906B] sm:text-sm disabled:bg-gray-100"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              disabled={!isEditing}
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#61906B] focus:ring-[#61906B] sm:text-sm disabled:bg-gray-100"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          {user && !user.isEmailVerified && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Email not verified</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      Please check your inbox for a verification email or
                      <button
                        type="button"
                        onClick={handleResendVerification}
                        disabled={isResendingVerification}
                        className="ml-1 font-medium text-[#61906B] underline hover:text-[#4e7357] disabled:opacity-50"
                      >
                        {isResendingVerification ? 'Sending...' : 'resend verification email'}
                      </button>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3">
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#61906B] border border-transparent rounded-md hover:bg-[#4e7357] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#61906B] disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-[#61906B] border border-transparent rounded-md hover:bg-[#4e7357] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#61906B]"
              >
                Edit Profile
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default Profile;
