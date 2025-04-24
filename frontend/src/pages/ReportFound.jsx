import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import useAuthStore from '../store/authStore';
import api from '../api/axios';

function ReportFound() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const categories = ['Electronics', 'Clothing', 'Accessories', 'Documents', 'Pets', 'Other'];

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: {
      name: '',
      coordinates: {
        latitude: '',
        longitude: ''
      }
    },
    dateLostOrFound: '',
    identifyingCharacteristics: [''],
    images: [],
    tags: []
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('You must be logged in to report a found item');
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

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
    } else if (name === 'tags') {
      const tagArray = value.split(',').map(tag => tag.trim()).filter(tag => tag);
      setFormData({
        ...formData,
        tags: tagArray
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };



  
  const handleImageChange = (e) => {
    // This would need to be connected to your image upload system
    // For now, we'll just store the file objects
    const files = Array.from(e.target.files);
    setFormData({
      ...formData,
      images: files
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Create form data to handle image uploads
      const itemData = {
        ...formData,
        type: 'found' // Explicitly set the type to found
      };
      
      // Filter out empty identifying characteristics
      itemData.identifyingCharacteristics = itemData.identifyingCharacteristics.filter(
        char => char.trim() !== ''
      );
      
      // Here you would need to handle image uploads
      // For demonstration, we'll just assume the backend handles file uploads

      const response = await api.post('/items', itemData);
      
      toast.success('Found item reported successfully!');
      navigate(`/items`);
    } catch (error) {
      console.error('Error reporting found item:', error);
      toast.error(error.response?.data?.message || 'Failed to report found item');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Report a Found Item</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div>
            <h2 className="text-lg font-medium text-gray-900">Basic Information</h2>
            <div className="mt-4 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-6">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Title *
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="title"
                    id="title"
                    required
                    value={formData.title}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-[#61906B] focus:border-[#61906B] block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="e.g. Found Black Wallet near Central Park"
                  />
                </div>
              </div>

              <div className="sm:col-span-6">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description *
                </label>
                <div className="mt-1">
                  <textarea
                    id="description"
                    name="description"
                    rows={4}
                    required
                    value={formData.description}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-[#61906B] focus:border-[#61906B] block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Describe the item you found in detail. Include when and where you found it, but avoid sharing specific identifying details that only the owner would know."
                  ></textarea>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Important: Do not include unique identifying details that only the owner would know. This helps ensure the item is returned to its rightful owner.
                </p>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  Category *
                </label>
                <div className="mt-1">
                  <select
                    id="category"
                    name="category"
                    required
                    value={formData.category}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-[#61906B] focus:border-[#61906B] block w-full sm:text-sm border-gray-300 rounded-md"
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="dateLostOrFound" className="block text-sm font-medium text-gray-700">
                  Date Found *
                </label>
                <div className="mt-1">
                  <input
                    type="date"
                    name="dateLostOrFound"
                    id="dateLostOrFound"
                    required
                    value={formData.dateLostOrFound}
                    onChange={handleChange}
                    max={new Date().toISOString().split('T')[0]}
                    className="shadow-sm focus:ring-[#61906B] focus:border-[#61906B] block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Location Information */}
          <div>
            <h2 className="text-lg font-medium text-gray-900">Location Information</h2>
            <div className="mt-4 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-6">
                <label htmlFor="location.name" className="block text-sm font-medium text-gray-700">
                  Location Description *
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="location.name"
                    id="location.name"
                    required
                    value={formData.location.name}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-[#61906B] focus:border-[#61906B] block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="e.g. Central Park, near the boathouse"
                  />
                </div>
              </div>

            </div>
          </div>

          

          {/* Images */}
          <div>
            <h2 className="text-lg font-medium text-gray-900">Images</h2>
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                Upload images of the found item, but don't include distinctive or unique features that only the owner would know.
              </p>
            </div>
            <div className="mt-4">
              <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label htmlFor="images" className="relative cursor-pointer bg-white rounded-md font-medium text-[#61906B] hover:text-[#4e7757] focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#61906B]">
                      <span>Upload files</span>
                      <input 
                        id="images" 
                        name="images" 
                        type="file" 
                        multiple 
                        onChange={handleImageChange} 
                        className="sr-only" 
                        accept="image/*"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF up to 5MB each
                  </p>
                </div>
              </div>
              {formData.images.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-gray-500">{formData.images.length} file(s) selected</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Current Status */}
          <div>
            <h2 className="text-lg font-medium text-gray-900">Current Status</h2>
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    By submitting this form, you're indicating that you've found this item and currently have it in your possession. The system will help connect you with the potential owner.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Tags */}
          <div>
            <h2 className="text-lg font-medium text-gray-900">Tags</h2>
            <div className="mt-4">
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                Add tags (separated by commas)
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="tags"
                  id="tags"
                  value={formData.tags.join(', ')}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-[#61906B] focus:border-[#61906B] block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="e.g. wallet, leather, black, Central Park"
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Tags help others find this item. Add relevant keywords.
              </p>
            </div>
          </div>
          
          {/* Submit Button */}
          <div className="pt-5">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="mr-3 bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#61906B]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#61906B] hover:bg-[#4e7757] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#61906B]"
              >
                {loading ? (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : null}
                Report Found Item
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ReportFound;