import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import useAuthStore from '../store/authStore';
import api from '../api/axios';

function ClaimItem() {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [claimDetails, setClaimDetails] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [identifyingInfo, setIdentifyingInfo] = useState('');
  
  // Fetch item details on component mount
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('You must be logged in to claim an item');
      navigate('/login');
      return;
    }
    
    const fetchItemDetails = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/items/${itemId}`);
        
        if (response.data.success) {
          const fetchedItem = response.data.item;
          
          // Check if item is claimable (must be a found item with active status)
          if (fetchedItem.type !== 'found' || fetchedItem.status !== 'active') {
            toast.error('This item cannot be claimed');
            navigate('/items');
            return;
          }
          
          // Check if user is not the one who reported the item
          if (fetchedItem.reportedBy._id === user.id) {
            toast.error('You cannot claim an item you reported');
            navigate('/items');
            return;
          }
          
          setItem(fetchedItem);
        } else {
          toast.error('Failed to load item details');
          navigate('/items');
        }
      } catch (error) {
        console.error('Error fetching item:', error);
        toast.error('Failed to load item details. Please try again.');
        navigate('/items');
      } finally {
        setLoading(false);
      }
    };
    
    fetchItemDetails();
  }, [itemId, isAuthenticated, navigate, user]);
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!claimDetails.trim()) {
      toast.error('Please provide claim details');
      return;
    }
    
    try {
      setSubmitting(true);
      
      const response = await api.post(`/items/${itemId}/claims`, {
        claimDetails,
        contactInfo,
        identifyingInfo
      });
      
      if (response.data.success) {
        toast.success('Your claim has been submitted successfully');
        navigate(`/items`);
      } else {
        toast.error(response.data.message || 'Failed to submit claim');
      }
    } catch (error) {
      console.error('Error submitting claim:', error);
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to submit claim. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <svg className="animate-spin h-10 w-10 text-[#61906B]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }
  
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Claim Item: {item?.title}</h1>
        
        {/* Item summary */}
        <div className="mb-6 p-4 bg-gray-50 rounded-md">
          <div className="flex items-center mb-2">
            <div className={`flex-shrink-0 rounded-md p-1 bg-green-100 text-green-800`}>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full">FOUND</span>
            </div>
            <div className="ml-2 text-sm text-gray-500">
              <span className="font-medium text-gray-900">{item?.category}</span>
            </div>
          </div>
          
          <p className="text-sm text-gray-600 mb-2">{item?.description}</p>
          
          <div className="text-xs text-gray-500">
            <p>Found at: {item?.location?.name}</p>
            <p>Date found: {new Date(item?.dateLostOrFound).toLocaleDateString()}</p>
            <p>Reported by: {item?.reportedBy?.name}</p>
          </div>
        </div>
        
        {/* Claim form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="claimDetails" className="block text-sm font-medium text-gray-700">
              Claim Details <span className="text-red-500">*</span>
            </label>
            <div className="mt-1">
              <textarea
                id="claimDetails"
                name="claimDetails"
                rows={4}
                className="shadow-sm focus:ring-[#61906B] focus:border-[#61906B] block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="Explain why you believe this item belongs to you..."
                value={claimDetails}
                onChange={(e) => setClaimDetails(e.target.value)}
                required
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Please provide detailed information about why you believe this item belongs to you.
            </p>
          </div>
          
          <div>
            <label htmlFor="identifyingInfo" className="block text-sm font-medium text-gray-700">
              Identifying Information
            </label>
            <div className="mt-1">
              <textarea
                id="identifyingInfo"
                name="identifyingInfo"
                rows={3}
                className="shadow-sm focus:ring-[#61906B] focus:border-[#61906B] block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="Provide specific details that only the owner would know..."
                value={identifyingInfo}
                onChange={(e) => setIdentifyingInfo(e.target.value)}
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Provide specific details about the item that only the owner would know (e.g., serial number, unique marks, contents).
            </p>
          </div>
          
          <div>
            <label htmlFor="contactInfo" className="block text-sm font-medium text-gray-700">
              Additional Contact Information
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="contactInfo"
                name="contactInfo"
                className="shadow-sm focus:ring-[#61906B] focus:border-[#61906B] block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="Phone number or alternative contact method..."
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Provide additional contact information if you'd like to be reached through other means.
            </p>
          </div>
          
          <div className="pt-4 border-t border-gray-200">
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate(`/items/${itemId}`)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#61906B]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#61906B] hover:bg-[#4e7757] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#61906B] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  'Submit Claim'
                )}
              </button>
            </div>
          </div>
        </form>
        
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-100 rounded-md">
          <h3 className="text-sm font-medium text-yellow-800">Important Information</h3>
          <ul className="mt-2 text-xs text-yellow-700 list-disc pl-5 space-y-1">
            <li>Your claim will be reviewed by our administrators and the person who found the item.</li>
            <li>Providing false information may result in account restrictions.</li>
            <li>You may be asked to provide additional proof of ownership.</li>
            <li>The finder of the item may contact you directly through our messaging system.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default ClaimItem;
