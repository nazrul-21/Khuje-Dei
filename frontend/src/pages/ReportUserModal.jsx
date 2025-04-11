import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import useAuthStore from '../store/authStore';
import api from '../api/axios';

function ReportUserModal({ isOpen, onClose, userId }) {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    // Reset form when modal opens
    if (isOpen) {
      setReason('');
      setDescription('');
      setError(null);
      setSuccess(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!reason || !description) {
      setError('Please fill in all fields');
      return;
    }

    // Prevent self-reporting (matching backend validation)
    if (userId === user?.id) {
      setError('You cannot report yourself');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Using the api client from axios.js instead of direct axios import
      // This ensures auth headers are properly set
      const response = await api.post(
        `/reports/users/${userId}`,
        { reason, description }
      );
      
      setSuccess(true);
      toast.success('Report submitted successfully');
      setLoading(false);
      
      // Close modal after 2 seconds on success
      setTimeout(() => {
        onClose();
      }, 2000);
      
    } catch (err) {
      setLoading(false);
      const errorMessage = err.response?.data?.message || 'Failed to submit report';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {userId === 'system' ? 'Report System Issue' : 'Report User'}
          </h3>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-500"
            aria-label="Close modal"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {success ? (
          <div className="bg-green-50 p-4 rounded-md mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">Report submitted successfully!</p>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 p-4 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700">Reason for Report</label>
              <select 
                id="reason" 
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[#61906B] focus:border-[#61906B] rounded-md shadow-sm"
                required
              >
                <option value="">Select a reason</option>
                <option value="Inappropriate behavior">Inappropriate behavior</option>
                <option value="Harassment">Harassment</option>
                <option value="Spam">Spam</option>
                <option value="Scam">Scam</option>
                <option value="False information">False information</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="4"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#61906B] focus:border-[#61906B]"
                placeholder="Please provide details about the issue"
                required
              ></textarea>
              <p className="mt-1 text-sm text-gray-500">
                Include specific details about the incident to help our team review the report effectively.
              </p>
            </div>
            
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="mr-3 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-[#61906B] rounded-md hover:bg-[#4e7357] disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default ReportUserModal;
