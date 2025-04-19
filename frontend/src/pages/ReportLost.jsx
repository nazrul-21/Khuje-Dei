import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import useAuthStore from '../store/authStore';
import api from '../api/axios';

function ReportLost() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([
    'Electronics', 'Clothing', 'Accessories', 'Documents', 
    'Keys', 'Pets', 'Wallets', 'Bags', 'Other'
  ]);

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
    reward: {
      isOffered: false,
      amount: 0,
      description: ''
    },
    tags: []
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('You must be logged in to report a lost item');
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('location.')) {
      const locationField = name.split('.')[1];
      setFormData({
        ...formData,
        location: {
          ...formData.location,
          [locationField]: value
        }
      });
    } else if (name === 'reward.isOffered') {
      setFormData({
        ...formData,
        reward: {
          ...formData.reward,
          isOffered: checked
        }
      });
    } else if (name === 'reward.amount') {
      setFormData({
        ...formData,
        reward: {
          ...formData.reward,
          amount: parseFloat(value) || 0
        }
      });
    } else if (name === 'reward.description') {
      setFormData({
        ...formData,
        reward: {
          ...formData.reward,
          description: value
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

  const handleCharacteristicChange = (index, value) => {
    const updatedCharacteristics = [...formData.identifyingCharacteristics];
    updatedCharacteristics[index] = value;
    setFormData({
      ...formData,
      identifyingCharacteristics: updatedCharacteristics
    });
  };

  const addCharacteristic = () => {
    setFormData({
      ...formData,
      identifyingCharacteristics: [...formData.identifyingCharacteristics, '']
    });
  };

  const removeCharacteristic = (index) => {
    const updatedCharacteristics = [...formData.identifyingCharacteristics];
    updatedCharacteristics.splice(index, 1);
    setFormData({
      ...formData,
      identifyingCharacteristics: updatedCharacteristics
    });
  };

  const handleImageChange = (e) => {
    console.log("onek")
    // This would need to be connected to your image upload system
    // For now, we'll just store the file objects
    const files = Array.from(e.target.files);
    setFormData({
      ...formData,
      images: files
    });
    console.log(files)
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Create a FormData object to handle file uploads
      const formDataToSend = new FormData();
      
      // Add all the non-file data as a JSON string
      const itemData = {
        ...formData,
        type: 'lost',
        identifyingCharacteristics: formData.identifyingCharacteristics.filter(
          char => char.trim() !== ''
        )
      };
      
      // Remove the images from the JSON data since we'll append them separately
      const { images, ...itemDataWithoutImages } = itemData;
      
      // Append the JSON data
      formDataToSend.append('data', JSON.stringify(itemDataWithoutImages));
      
      // Append each image file
      if (formData.images.length > 0) {
        formData.images.forEach((image, index) => {
          formDataToSend.append('images', image);
        });
      }
      
      // Send the request with the FormData
      const response = await api.post('/items', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      toast.success('Lost item reported successfully!');
      navigate(`/items/${response.data.item._id}`);
    } catch (error) {
      console.error('Error reporting lost item:', error);
      toast.error(error.response?.data?.message || 'Failed to report lost item');
    } finally {
      setLoading(false);
    }
  };
  

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            location: {
              ...formData.location,
              coordinates: {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
              }
            }
          });
          toast.success('Current location detected');
        },
        (error) => {
          toast.error('Unable to get your location: ' + error.message);
        }
      );
    } else {
      toast.error('Geolocation is not supported by your browser');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Report a Lost Item</h1>
        
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
                    placeholder="e.g. Lost Black Wallet with ID Cards"
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
                    placeholder="Describe your lost item in detail. Include when and where you think you lost it, and any other relevant information."
                  ></textarea>
                </div>
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
                  Date Lost *
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

              <div className="sm:col-span-6">
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#61906B]"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  Use Current Location
                </button>
              </div>
            </div>
          </div>

          {/* Identifying Characteristics */}
          <div>
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Identifying Characteristics</h2>
              <button
                type="button"
                onClick={addCharacteristic}
                className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-[#61906B] bg-[#f0f7f2] hover:bg-[#e1efdf] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#61906B]"
              >
                Add More
              </button>
            </div>
            <div className="mt-4 space-y-4">
              {formData.identifyingCharacteristics.map((characteristic, index) => (
                <div key={index} className="flex items-center">
                  <div className="flex-grow">
                    <input
                      type="text"
                      value={characteristic}
                      onChange={(e) => handleCharacteristicChange(index, e.target.value)}
                      className="shadow-sm focus:ring-[#61906B] focus:border-[#61906B] block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="e.g. Has a scratch on the back cover"
                    />
                  </div>
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => removeCharacteristic(index)}
                      className="ml-2 flex-shrink-0 text-red-500 hover:text-red-700"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Images */}
          <div>
            <h2 className="text-lg font-medium text-gray-900">Images</h2>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">
                Upload images of your lost item
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
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
          
          {/* Reward Information */}
          <div>
            <h2 className="text-lg font-medium text-gray-900">Reward Information</h2>
            <div className="mt-4">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="reward.isOffered"
                    name="reward.isOffered"
                    type="checkbox"
                    checked={formData.reward.isOffered}
                    onChange={handleChange}
                    className="focus:ring-[#61906B] h-4 w-4 text-[#61906B] border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="reward.isOffered" className="font-medium text-gray-700">
                    I'm offering a reward
                  </label>
                </div>
              </div>
              
              {formData.reward.isOffered && (
                <div className="mt-4 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-3">
                    <label htmlFor="reward.amount" className="block text-sm font-medium text-gray-700">
                      Reward Amount ($)
                    </label>
                    <div className="mt-1">
                      <input
                        type="number"
                        name="reward.amount"
                        id="reward.amount"
                        min="0"
                        step="0.01"
                        value={formData.reward.amount}
                        onChange={handleChange}
                        className="shadow-sm focus:ring-[#61906B] focus:border-[#61906B] block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                  
                  <div className="sm:col-span-6">
                    <label htmlFor="reward.description" className="block text-sm font-medium text-gray-700">
                      Reward Description
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="reward.description"
                        name="reward.description"
                        rows={2}
                        value={formData.reward.description}
                        onChange={handleChange}
                        className="shadow-sm focus:ring-[#61906B] focus:border-[#61906B] block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="Provide details about the reward (optional)"
                      ></textarea>
                    </div>
                  </div>
                </div>
              )}
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
                  placeholder="e.g. wallet, leather, black, cards"
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Tags help others find your item. Add relevant keywords.
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
                Report Lost Item
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ReportLost;