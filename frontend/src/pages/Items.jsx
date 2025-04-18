import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import useAuthStore from '../store/authStore';
import api from '../api/axios';

function Items() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuthStore();

  // State for items and pagination
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  // State for search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Categories list
  const categories = [
    'Electronics', 'Clothing', 'Accessories', 'Documents',
    'Keys', 'Pets', 'Wallets', 'Bags', 'Other'
  ];

  // Parse query parameters on component mount
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);

    const query = queryParams.get('query') || '';
    const category = queryParams.get('category') || '';
    const type = queryParams.get('type') || '';
    const locationParam = queryParams.get('location') || '';
    const sort = queryParams.get('sort') || 'newest';
    const page = parseInt(queryParams.get('page')) || 1;

    setSearchQuery(query);
    setSelectedCategory(category);
    setSelectedType(type);
    setSelectedLocation(locationParam);
    setSortBy(sort);
    setCurrentPage(page);

    // Initial fetch based on URL params
    fetchItems(query, category, type, locationParam, sort, page);
  }, [location.search]);

  const fetchItems = async (query, category, type, locationParam, sort, page) => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      if (query) params.append('query', query);
      if (category) params.append('category', category);
      if (type) params.append('type', type);
      if (locationParam) params.append('location', locationParam);
      if (sort) params.append('sortBy', sort);
      if (page) params.append('page', page);

      const endpoint = query ? '/items/search' : '/items';
      const response = await api.get(`${endpoint}?${params.toString()}`);
      console.log(response.data);
      setItems(response.data.items);
      setTotalPages(response.data.totalPages);
      setCurrentPage(response.data.currentPage);
    } catch (error) {
      console.error('Error fetching items:', error);
      toast.error('Failed to load items. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();

    // Update URL with search parameters
    const params = new URLSearchParams();

    // Only add parameters if they have values
    if (searchQuery.trim()) params.append('query', searchQuery);
    if (selectedCategory) params.append('category', selectedCategory);
    if (selectedLocation.trim()) params.append('location', selectedLocation);
    if (selectedType) params.append('type', selectedType);
    if (sortBy) params.append('sort', sortBy);

    // Reset to first page on new search
    params.append('page', 1);

    navigate(`/items?${params.toString()}`);
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;

    const params = new URLSearchParams(location.search);
    params.set('page', newPage);
    navigate(`/items?${params.toString()}`);
  };

  // Handle claiming an item
  const handleClaimItem = async (itemId) => {
    if (!isAuthenticated) {
      toast.error('You must be logged in to claim an item');
      navigate('/login');
      return;
    }

    try {
      // Navigate to claim form page with item ID
      navigate(`/items/${itemId}/claim`);
    } catch (error) {
      console.error('Error initiating claim:', error);
      toast.error('Failed to initiate claim. Please try again.');
    }
  };

  // Handle following an item
  const handleFollowItem = async (itemId, isFollowing) => {
    if (!isAuthenticated) {
      toast.error('You must be logged in to follow or unfollow an item');
      navigate('/login');
      return;
    }

    try {
      // Check if the item is reported by the current user
      const item = items.find(item => item._id === itemId);
      if (item && item.reportedBy && item.reportedBy._id === user._id) {
        toast.info("You can't follow your own item");
        return;
      }

      // If already following, unfollow the item
      if (isFollowing) {
        const response = await api.delete(`/items/${itemId}/unfollow`);

        if (response.data.success) {
          toast.success('You have unfollowed this item.');
          // Refresh the items to update UI
          fetchItems(searchQuery, selectedCategory, selectedType, selectedLocation, sortBy, currentPage);
        } else {
          toast.error(response.data.message || 'Failed to unfollow item');
        }
      } else {
        // Follow the item
        const response = await api.post(`/items/${itemId}/follow`);

        if (response.data.success) {
          toast.success('You are now following this item. You will be notified of any updates.');
          // Refresh the items to update UI
          fetchItems(searchQuery, selectedCategory, selectedType, selectedLocation, sortBy, currentPage);
        } else {
          toast.error(response.data.message || 'Failed to follow item');
        }
      }
    } catch (error) {
      console.error(`Error ${isFollowing ? 'unfollowing' : 'following'} item:`, error);
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error(`Failed to ${isFollowing ? 'unfollow' : 'follow'} item. Please try again.`);
      }
    }
  };

  // Helper function to get the first image or a placeholder
  const getItemImage = (item) => {
    if (item.images && item.images.length > 0) {
      // Return the first image from the item
      return item.images[0].startsWith('http')
        ? item.images[0]
        : `http://localhost:5000${item.images[0]}`;
    }
    console.log('No images found for item:', item);
    return '/placeholders/default.png';
    // Return a placeholder based on category or default if category doesn't match
    try {
      return `/placeholders/${item.category.toLowerCase()}.jpg`;
    } catch (error) {
      console.error('Error getting placeholder image:', error);
      return '/placeholders/default.png';
    }
  };


  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow-sm rounded-lg p-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Find Lost & Found Items</h1>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="col-span-1 md:col-span-4">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700">Search</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  type="text"
                  name="search"
                  id="search"
                  className="focus:ring-[#61906B] focus:border-[#61906B] block w-full pr-10 sm:text-sm border-gray-300 rounded-md"
                  placeholder="Search for items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
              <select
                id="category"
                name="category"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[#61906B] focus:border-[#61906B] sm:text-sm rounded-md"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700">Type</label>
              <select
                id="type"
                name="type"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[#61906B] focus:border-[#61906B] sm:text-sm rounded-md"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <option value="">All Types</option>
                <option value="lost">Lost Items</option>
                <option value="found">Found Items</option>
              </select>
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
              <input
                type="text"
                name="location"
                id="location"
                className="mt-1 focus:ring-[#61906B] focus:border-[#61906B] block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="Enter location..."
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700">Sort By</label>
              <select
                id="sortBy"
                name="sortBy"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[#61906B] focus:border-[#61906B] sm:text-sm rounded-md"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="relevance">Most Relevant</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#61906B] hover:bg-[#4e7757] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#61906B]"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Items List */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {loading ? 'Loading items...' : `${items.length} Items Found`}
          </h2>
          <div className="flex space-x-2">
            <Link
              to="/report-lost"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Report Lost Item
            </Link>
            <Link
              to="/report-found"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#61906B] hover:bg-[#4e7757] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#61906B]"
            >
              Report Found Item
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <svg className="animate-spin h-10 w-10 text-[#61906B]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No items found</h3>
            <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <div key={item._id} className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
                {/* Item Image */}
                <div className="h-48 w-full overflow-hidden">
                  <img
                    src={getItemImage(item)}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null; // Prevent infinite loop
                      // Try category-specific placeholder first
                      const categoryPlaceholder = `/placeholders/${item.category?.toLowerCase()}.jpg`;

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


                <div className="p-5">
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 rounded-md p-1 ${item.type === 'lost' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full">
                        {item.type === 'lost' ? 'LOST' : 'FOUND'}
                      </span>
                    </div>
                    <div className="ml-2 flex-1 text-sm text-gray-500 truncate">
                      <span className="font-medium text-gray-900">{item.category}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(item.dateLostOrFound).toLocaleDateString()}
                    </div>
                  </div>

                  <Link to={`/items/${item._id}`} className="block mt-2">
                    <p className="text-xl font-semibold text-gray-900 truncate">{item.title}</p>
                    <p className="mt-1 text-sm text-gray-600 line-clamp-2">{item.description}</p>
                  </Link>

                  {/* Location information */}
                  {item.location && (
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <svg className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      <span className="truncate">{item.location.name || item.location}</span>
                    </div>
                  )}

                  <div className="mt-4 flex justify-between items-center">
                    <div className="flex items-center">
                      {/* <div className="flex-shrink-0">
                        <img 
                          className="h-8 w-8 rounded-full" 
                          src={item.reportedBy?.avatar || '/default-avatar.png'} 
                          alt={item.reportedBy?.name || 'User'} 
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/default-avatar.png';
                          }}
                        />
                      </div> */}
                      <div className="ml-2 text-xs text-gray-500">
                        <p>{item.reportedBy?.name || 'Anonymous'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {item.type === 'lost' && item.status === 'active' &&
                        !(isAuthenticated && item.reportedBy && item.reportedBy._id === user?._id) && (
                          <button
                            onClick={() => {
                              // Check if user is already following this item
                              const isFollowing = item.followers &&
                                item.followers.some(follower =>
                                  follower.user === user?.id ||
                                  (follower.user && follower.user._id === user?._id)
                                );
                              handleFollowItem(item._id, isFollowing);
                            }}
                            className={`text-xs ${isAuthenticated && item.followers &&
                              item.followers.some(follower =>
                                follower.user === user?.id ||
                                (follower.user && follower.user._id === user?._id)
                              )
                              ? 'text-[#61906B]'
                              : 'text-gray-600 hover:text-[#61906B]'} flex items-center`}
                          >
                            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d={isAuthenticated && item.followers &&
                                  item.followers.some(follower =>
                                    follower.user === user?.id ||
                                    (follower.user && follower.user._id === user?._id)
                                  )
                                  ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                                  : "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"}
                              />
                            </svg>
                            {isAuthenticated && item.followers &&
                              item.followers.some(follower =>
                                follower.user === user?.id ||
                                (follower.user && follower.user._id === user?._id)
                              )
                              ? 'Unfollow'
                              : 'Follow'}
                          </button>
                        )}
                      {item.type === 'found' && item.status === 'active' && (
                        <button
                          onClick={() => handleClaimItem(item._id)}
                          className="text-xs text-gray-600 hover:text-[#61906B] flex items-center"
                          disabled={isAuthenticated && item.reportedBy?._id === user.id}
                        >
                          <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Claim
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                  }`}
              >
                <span className="sr-only">Previous</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>

              {/* Page numbers */}
              {[...Array(totalPages).keys()].map((number) => {
                const pageNumber = number + 1;
                // Show current page and 2 pages before and after
                if (
                  pageNumber === 1 ||
                  pageNumber === totalPages ||
                  (pageNumber >= currentPage - 2 && pageNumber <= currentPage + 2)
                ) {
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => handlePageChange(pageNumber)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${pageNumber === currentPage
                        ? 'z-10 bg-[#61906B] border-[#61906B] text-white'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                    >
                      {pageNumber}
                    </button>
                  );
                } else if (
                  pageNumber === currentPage - 3 ||
                  pageNumber === currentPage + 3
                ) {
                  return (
                    <span
                      key={pageNumber}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                    >
                      ...
                    </span>
                  );
                }
                return null;
              })}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                  }`}
              >
                <span className="sr-only">Next</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}

export default Items;
