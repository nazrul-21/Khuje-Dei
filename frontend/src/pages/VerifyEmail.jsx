import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api/axios';

function VerifyEmail() {
  const [verifying, setVerifying] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      const params = new URLSearchParams(location.search);
      const token = params.get('token');

      if (!token) {
        toast.error('Verification token is missing');
        setVerifying(false);
        return;
      }

      try {
        const response = await api.post('/auth/verify-email', { token });
        toast.success(response.data.message || 'Email verified successfully!');
        setVerifying(false);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Email verification failed');
        setVerifying(false);
      }
    };

    verifyEmail();
  }, [location]);

  const handleRedirect = () => {
    navigate('/login');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Email Verification</h1>
        
        {verifying ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
            <p className="text-gray-700">Verifying your email...</p>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-700 mb-6">
              Your email verification process is complete. You can now proceed to login.
            </p>
            <button
              onClick={handleRedirect}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Go to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default VerifyEmail;
