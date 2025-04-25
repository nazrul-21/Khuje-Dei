import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import useAuthStore from '../store/authStore';
import api from '../api/axios';

function ItemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isOwner, setIsOwner] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    fetchItemDetails();
  }, [id]);

  const fetchItemDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/items/${id}`);
      setItem(response.data.item);

      // Check if current user is the owner
      if (isAuthenticated && user?._id && response.data.reportedBy?._id === user._id) {
        setIsOwner(true);
      }

      // Check if current user is following this item
      if (isAuthenticated && user?._id && response.data.item.followers) {
        const following = response.data.item.followers.some(
          follower => follower.user === user?._id ||
            (follower.user && follower.user._id === user?._id)
        );
        setIsFollowing(following);
      }


    } catch (error) {
      console.error('Error fetching item details:', error);
      toast.error('Failed to load item details');
    } finally {
      setLoading(false);
    }
  };

  const handleClaimItem = async () => {
    if (!isAuthenticated) {
      toast.error('You must be logged in to claim an item');
      navigate('/login');
      return;
    }

    try {
      navigate(`/items/${id}/claim`);
    } catch (error) {
      console.error('Error initiating claim:', error);
      toast.error('Failed to initiate claim. Please try again.');
    }
  };

  const handleFollowItem = async () => {
    if (!isAuthenticated) {
      toast.error('You must be logged in to follow or unfollow an item');
      navigate('/login');
      return;
    }

    try {
      if (isFollowing) {
        // Unfollow the item - Fix the endpoint to match Items.jsx
        const response = await api.delete(`/items/${id}/follow`);
        if (response.data.success) {
          toast.success('You have unfollowed this item.');
          setIsFollowing(false);
          fetchItemDetails(); // Refresh data
        } else {
          toast.error(response.data.message || 'Failed to unfollow item');
        }
      } else {
        // Follow the item
        const response = await api.post(`/items/${id}/follow`);
        if (response.data.success) {
          toast.success('You are now following this item. You will be notified of any updates.');
          setIsFollowing(true);
          fetchItemDetails(); // Refresh data
        } else {
          toast.error(response.data.message || 'Failed to follow item');
        }
      }
      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error(`Error ${isFollowing ? 'unfollowing' : 'following'} item:`, error);
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error(`Failed to ${isFollowing ? 'unfollow' : 'follow'} item. Please try again.`);
      }
    }
  };

  const handleEditItem = () => {
    navigate(`/items/${id}/edit`);
  };

  const handleDeleteItem = async () => {
    if (window.confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
      try {
        const response = await api.delete(`/items/${id}`);
        if (response.data.success) {
          toast.success('Item deleted successfully');
          navigate('/items');
        } else {
          toast.error(response.data.message || 'Failed to delete item');
        }
      } catch (error) {
        console.error('Error deleting item:', error);
        toast.error(error.response?.data?.message || 'Failed to delete item');
      }
    }
  };

  const handleMarkAsResolved = async () => {
    try {
      const response = await api.put(`/items/${id}/status`, { status: 'resolved' });
      if (response.data.success) {
        toast.success('Item marked as resolved');
        fetchItemDetails(); // Refresh the item data
      } else {
        toast.error(response.data.message || 'Failed to update item status');
      }
    } catch (error) {
      console.error('Error updating item status:', error);
      toast.error(error.response?.data?.message || 'Failed to update item status');
    }
  };

  // Replace the current getItemImage function with this improved version
  const getItemImage = (item) => {
    // item = item.item;
    if (item.images && item.images.length > 0) {
      // Return the first image from the item
      return item.images[0].startsWith('http')
        ? item.images[0]
        : `http://localhost:5000${item.images[0]}`;
    }

    // If no images, try to use a category-specific placeholder
    try {
      return `/placeholders/${item.category.toLowerCase()}.jpg`;
    } catch (error) {
      // Default fallback
      return '/placeholders/default.png';
    }
  };


  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-center py-12">
          <svg className="animate-spin h-10 w-10 text-[#61906B]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white shadow-sm rounded-lg p-6">
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Item not found</h3>
            <p className="mt-1 text-sm text-gray-500">This item may have been removed or doesn't exist.</p>
            <div className="mt-6">
              <Link to="/items" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#61906B] hover:bg-[#4e7757] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#61906B]">
                Back to Items
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <nav className="flex mb-4" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-4">
          <li>
            <div>
              <Link to="/" className="text-gray-400 hover:text-gray-500">
                Home
              </Link>
            </div>
          </li>
          <li>
            <div className="flex items-center">
              <svg className="flex-shrink-0 h-5 w-5 text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
              </svg>
              <Link to="/items" className="ml-4 text-gray-400 hover:text-gray-500">
                Items
              </Link>
            </div>
          </li>
          <li>
            <div className="flex items-center">
              <svg className="flex-shrink-0 h-5 w-5 text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
              </svg>
              <span className="ml-4 text-gray-500 font-medium truncate" aria-current="page">
                {item.title}
              </span>
            </div>
          </li>
        </ol>
      </nav>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Image Gallery */}
          <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg mb-4">
            <div className="h-96 w-full overflow-hidden">
              <img
                src={getItemImage(item)}
                alt={item.title}
                className="w-full h-full object-cover rounded-lg"
                onError={(e) => {
                  e.target.onerror = null; // Prevent infinite loop
                  // Try category-specific placeholder first
                  const categoryPlaceholder = `/placeholders/${item.category?.toLowerCase() || 'default'}.jpg`;

                  // Create a temporary image to check if category placeholder exists
                  const tempImg = new Image();
                  tempImg.onerror = () => {
                    // If category placeholder doesn't exist, use default
                    e.target.src = `/placeholders/default.jpg`;
                  };
                  tempImg.onload = () => {
                    // If category placeholder exists, use it
                    e.target.src = categoryPlaceholder;
                  };
                  tempImg.src = categoryPlaceholder;
                }}
              />

            </div>
          </div>


          {/* Item Details */}
          <div className="p-6">
            <div className="flex items-center mb-4">
              <div className={`flex-shrink-0 rounded-md p-1 ${item.type === 'lost' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full">
                  {item.type === 'lost' ? 'LOST' : 'FOUND'}
                </span>
              </div>
              <div className="ml-2 flex-1 text-sm text-gray-500">
                <span className="font-medium text-gray-900">{item.category}</span>
              </div>
              <div className="text-xs text-gray-500">
                {new Date(item.dateLostOrFound).toLocaleDateString()}
              </div>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">{item.title}</h1>

            {item.status !== 'active' && (
              <div className="mb-4 bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      This item is marked as {item.status}.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="prose max-w-none mb-6">
              <p className="text-gray-700">{item.description}</p>
            </div>

            <div className="border-t border-gray-200 py-4">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Date {item.type === 'lost' ? 'Lost' : 'Found'}</dt>
                  <dd className="mt-1 text-sm text-gray-900">{new Date(item.dateLostOrFound).toLocaleDateString()}</dd>
                </div>

                {/* <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Location</dt>
                  <dd className="mt-1 text-sm text-gray-900">{item.location.name || item.location}</dd>
                </div> */}

                {item.color && (
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Color</dt>
                    <dd className="mt-1 text-sm text-gray-900">{item.color}</dd>
                  </div>
                )}

                {item.brand && (
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Brand</dt>
                    <dd className="mt-1 text-sm text-gray-900">{item.brand}</dd>
                  </div>
                )}

                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Reported By</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {item.reportedBy?._id ? (
                      <Link
                        to={`/users/${item.reportedBy._id}`}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        {item.reportedBy.name || 'Anonymous'}
                      </Link>
                    ) : (
                      'Anonymous'
                    )}
                  </dd>
                </div>


                {item.identifyingFeatures && (
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Identifying Features</dt>
                    <dd className="mt-1 text-sm text-gray-900">{item.identifyingFeatures}</dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Action Buttons */}
            <div className="border-t border-gray-200 pt-6">
              {isOwner ? (
                <div className="flex flex-wrap space-x-3">
                  <button
                    onClick={handleEditItem}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#61906B]"
                  >
                    <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    Edit
                  </button>
                  <button
                    onClick={handleDeleteItem}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <svg className="-ml-1 mr-2 h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Delete
                  </button>
                  {item.status === 'active' && (
                    <button
                      onClick={handleMarkAsResolved}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#61906B] hover:bg-[#4e7757] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#61906B]"
                    >
                      <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Mark as Resolved
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex flex-wrap space-x-3">
                  {item.type === 'lost' && item.status === 'active' && !isOwner && (
                    <button
                      onClick={handleFollowItem}
                      className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium 
                      ${isFollowing
                          ? 'text-[#61906B] bg-white border-[#61906B] hover:bg-gray-50'
                          : 'text-white bg-[#61906B] hover:bg-[#4e7757]'} 
                      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#61906B]`}
                    >
                      <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d={isFollowing
                            ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                            : "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"}
                        />
                      </svg>
                      {isAuthenticated && item.followers &&
                        item.followers.some(follower =>
                          follower.user === user?.id ||
                          (follower.user && follower.user === user?._id)
                        )
                        ? 'Unfollow'
                        : 'Follow'}
                    </button>
                  )}

                  {item.type === 'found' && item.status === 'active' && !isOwner && (
                    <button
                      onClick={handleClaimItem}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#61906B] hover:bg-[#4e7757] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#61906B]"
                    >
                      <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Claim This Item
                    </button>
                  )}

                  <Link
                    to="/items"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#61906B]"
                  >
                    Back to Items
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ItemDetail;