import { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../api/axios';

function ImageUploader({ onImagesUploaded, maxImages = 5 }) {
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate file count
    if (files.length + previewUrls.length > maxImages) {
      toast.error(`You can upload a maximum of ${maxImages} images`);
      return;
    }
    
    // Validate file types
    const validFiles = files.filter(file => 
      file.type.match(/image\/(jpeg|jpg|png|gif)/)
    );
    
    if (validFiles.length !== files.length) {
      toast.error('Only image files (JPEG, PNG, GIF) are allowed');
    }
    
    // Create preview URLs
    const newPreviewUrls = validFiles.map(file => URL.createObjectURL(file));
    
    setSelectedFiles(prev => [...prev, ...validFiles]);
    setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    
    setUploading(true);
    
    try {
      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append('images', file);
      });
      
      const response = await api.post('/media/upload-multiple', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        toast.success('Images uploaded successfully');
        onImagesUploaded(response.data.filePaths);
        
        // Clear selected files and previews
        setSelectedFiles([]);
        setPreviewUrls([]);
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Failed to upload images. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    // Release object URL to prevent memory leaks
    URL.revokeObjectURL(previewUrls[index]);
    
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="mt-4">
      <label className="block text-sm font-medium text-gray-700">
        Images ({previewUrls.length}/{maxImages})
      </label>
      
      <div className="mt-2 flex flex-wrap gap-4">
        {previewUrls.map((url, index) => (
          <div key={index} className="relative">
            <img 
              src={url} 
              alt={`Preview ${index}`} 
              className="h-24 w-24 object-cover rounded-md border border-gray-300"
            />
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        ))}
        
        {previewUrls.length < maxImages && (
          <label className="h-24 w-24 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-[#61906B]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <input
              type="file"
              className="hidden"
              accept="image/jpeg,image/png,image/gif"
              multiple
              onChange={handleFileChange}
            />
          </label>
        )}
      </div>
      
      {selectedFiles.length > 0 && (
        <button
          type="button"
          onClick={handleUpload}
          disabled={uploading}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#61906B] hover:bg-[#4e7757] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#61906B] disabled:opacity-50"
        >
          {uploading ? 'Uploading...' : 'Upload Images'}
        </button>
      )}
    </div>
  );
}

export default ImageUploader;
