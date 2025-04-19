import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import useAdminStore from '../store/adminStore';
import useAuthStore from '../store/authStore';
import { toast } from 'react-toastify';
import { set } from 'mongoose';

// User Management Component
const UserManagement = () => {
  const { users, getAllUsers, searchUsers, filteredUsers, restrictUser, activateUser, error, clearError } = useAdminStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddUserModal, setShowAddUserModal] = useState(false);

  useEffect(() => {
    getAllUsers();
  }, [getAllUsers]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      searchUsers(searchTerm);
    } else {
      getAllUsers();
    }
  };

  const handleRestrict = async (userId) => {
    const result = await restrictUser(userId);
    if (result) {
      toast.success('User restricted successfully');
    }
  };

  const handleActivate = async (userId) => {
    const result = await activateUser(userId);
    if (result) {
      toast.success('User activated successfully');
    }
  };

  const displayUsers = searchTerm && filteredUsers.length > 0 ? filteredUsers : users;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">User Management</h2>
        <button
          onClick={() => setShowAddUserModal(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add New User
        </button>
      </div>

      <form onSubmit={handleSearch} className="mb-6 flex gap-2">
        <input
          type="text"
          placeholder="Search by username"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border rounded px-3 py-2 flex-grow"
        />
        <button
          type="submit"
          className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
        >
          Search
        </button>
        {searchTerm && (
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              getAllUsers();
            }}
            className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
          >
            Clear
          </button>
        )}
      </form>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 text-left">Name</th>
              <th className="py-2 px-4 text-left">Email</th>
              <th className="py-2 px-4 text-left">Role</th>
              <th className="py-2 px-4 text-left">Status</th>
              <th className="py-2 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayUsers.map((user) => (
              <tr key={user._id || user.id} className="border-t">
                <td className="py-2 px-4">{user.name}</td>
                <td className="py-2 px-4">{user.email}</td>
                <td className="py-2 px-4">{user.role}</td>
                <td className="py-2 px-4">
                  <span className={`px-2 py-1 rounded text-xs ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {user.isActive ? 'Active' : 'Restricted'}
                  </span>
                </td>
                <td className="py-2 px-4">
                  {user.role !== 'admin' && (
                    user.isActive ? (
                      <button
                        onClick={() => handleRestrict(user._id || user.id)}
                        className="text-red-500 hover:text-red-700 mr-2"
                      >
                        Restrict
                      </button>
                    ) : (
                      <button
                        onClick={() => handleActivate(user._id || user.id)}
                        className="text-green-500 hover:text-green-700 mr-2"
                      >
                        Activate
                      </button>
                    )
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddUserModal && <AddUserModal onClose={() => setShowAddUserModal(false)} />}
    </div>
  );
};

// Add User Modal Component
const AddUserModal = ({ onClose }) => {
  const { addUser, error, clearError } = useAdminStore();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user'
  });

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await addUser(formData);
    if (result) {
      toast.success('User added successfully');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Add New User</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              Add User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Report Management Component
// Inside the ReportManagement component
const ReportManagement = () => {
  const { reports, getAllReports, updateReportStatus, error, clearError } = useAdminStore();
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    getAllReports();
  }, [getAllReports]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const handleStatusChange = async (reportId, status) => {
    const result = await updateReportStatus(reportId, status);
    if (result) {
      toast.success('Report status updated successfully');
    }
  };

  const openReportDetails = (report) => {
    setSelectedReport(report);
  };

  const closeReportDetails = () => {
    setSelectedReport(null);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-6">Report Management</h2>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 text-left">Reported User</th>
              <th className="py-2 px-4 text-left">Reported By</th>
              <th className="py-2 px-4 text-left">Reason</th>
              <th className="py-2 px-4 text-left">Status</th>
              <th className="py-2 px-4 text-left">Date</th>
              <th className="py-2 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report._id} className="border-t">
                <td className="py-2 px-4">{report.reportedUser?.name || 'Unknown'}</td>
                <td className="py-2 px-4">{report.reportedBy?.name || 'Unknown'}</td>
                <td className="py-2 px-4">{report.reason}</td>
                <td className="py-2 px-4">
                  <span className={`px-2 py-1 rounded text-xs ${report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      report.status === 'reviewed' ? 'bg-blue-100 text-blue-800' :
                        report.status === 'resolved' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                    }`}>
                    {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                  </span>
                </td>
                <td className="py-2 px-4">{new Date(report.createdAt).toLocaleDateString()}</td>
                <td className="py-2 px-4 flex gap-2">
                  <select
                    value={report.status}
                    onChange={(e) => handleStatusChange(report._id, e.target.value)}
                    className="border rounded px-2 py-1"
                  >
                    <option value="pending">Pending</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="resolved">Resolved</option>
                    <option value="dismissed">Dismissed</option>
                  </select>
                  <button
                    onClick={() => openReportDetails(report)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Report Details Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Report Details</h2>
              <button
                onClick={closeReportDetails}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-gray-600 font-medium">Reported User:</p>
                <p>{selectedReport.reportedUser?.name || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-gray-600 font-medium">Reported By:</p>
                <p>{selectedReport.reportedBy?.name || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-gray-600 font-medium">Status:</p>
                <p>{selectedReport.status.charAt(0).toUpperCase() + selectedReport.status.slice(1)}</p>
              </div>
              <div>
                <p className="text-gray-600 font-medium">Date:</p>
                <p>{new Date(selectedReport.createdAt).toLocaleString()}</p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-600 font-medium">Reason:</p>
                <p>{selectedReport.reason}</p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-600 font-medium">Description:</p>
                <p className="whitespace-pre-wrap">{selectedReport.description}</p>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={closeReportDetails}
                className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


// ClaimDetails Component Fix
const ClaimDetails = ({ claim, onClose, onStatusChange }) => {
  const [status, setStatus] = useState(claim.status);
  const [adminNotes, setAdminNotes] = useState(claim.adminNotes || '');

  const handleSubmit = async () => {
    const result = await onStatusChange(claim._id, status, adminNotes);
    if (result) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Claim Details</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-gray-600 font-medium">Claimant:</p>
            <p>{claim.claimant?.name || 'Unknown'}</p>
          </div>
          {/* <div>
            <p className="text-gray-600 font-medium">Item:</p>
            <p>{claim.item?.title || 'Unknown Item'}</p>
          </div> */}
          <div>
            <p className="text-gray-600 font-medium">Status:</p>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="border rounded px-2 py-1 w-full mt-1"
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
          <div>
            <p className="text-gray-600 font-medium">Date Submitted:</p>
            <p>{new Date(claim.createdAt).toLocaleString()}</p>
          </div>
        </div>

        {/* <div className="mb-4">
          <p className="text-gray-600 font-medium">Proof of Ownership:</p>
          <p className="whitespace-pre-wrap">{claim.proofOfOwnership}</p>
        </div> */}

        <div className="mb-4">
          <p className="text-gray-600 font-medium">Identifying Information:</p>
          <p className="whitespace-pre-wrap">{claim.identifyingInformation}</p>
        </div>

        {claim.meetupDetails && Object.keys(claim.meetupDetails).length > 0 && (
          <div className="mb-4">
            <p className="text-gray-600 font-medium">Meetup Details:</p>
            <p>Location: {claim.meetupDetails.location || 'Not specified'}</p>
            <p>Date: {claim.meetupDetails.date ? new Date(claim.meetupDetails.date).toLocaleString() : 'Not specified'}</p>
            <p>Notes: {claim.meetupDetails.notes || 'None'}</p>
          </div>
        )}

        <div className="mb-4">
          <p className="text-gray-600 font-medium">Admin Notes:</p>
          <textarea
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            className="w-full border rounded px-3 py-2 mt-1"
            rows="3"
            placeholder="Add notes about this claim..."
          ></textarea>
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Update Claim
          </button>
        </div>
      </div>
    </div>
  );
};

const ItemManagement = () => {
  const { items, getAllItems, updateItemStatus, itemError, clearItemError, isLoading, updateClaimStatus } = useAdminStore();
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState({
    type: '',
    category: '',
    status: ''
  });
  const [selectedClaim, setSelectedClaim] = useState(null);

  // Add a function to open claim details
  const openClaimDetails = (claim) => {
    setSelectedClaim(claim);
  };


  // Load items when component mounts
  useEffect(() => {
    getAllItems();
  }, [getAllItems]);

  // Handle errors with toast notifications
  useEffect(() => {
    if (itemError) {
      toast.error(itemError);
      clearItemError();
    }
  }, [itemError, clearItemError]);

  // Update an item's status
  const handleStatusChange = async (itemId, status) => {
    const result = await updateItemStatus(itemId, status);
    if (result) {
      toast.success('Item status updated successfully');

      // If the item is currently selected in the modal, update it there too
      if (selectedItem && selectedItem._id === itemId) {
        setSelectedItem({ ...selectedItem, status });
      }
    }
  };

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    // Actually search using the searchTerm
    // We'll use the getAllItems function with proper query parameters
    // In a real implementation, you might want to use searchItems instead
    getAllItems({ search: searchTerm });
  };

  // Update filter state when filter inputs change
  const handleFilterChange = (e) => {
    setFilter({
      ...filter,
      [e.target.name]: e.target.value
    });
  };

  // Apply filters
  const applyFilters = () => {
    getAllItems({
      type: filter.type,
      category: filter.category,
      status: filter.status,
      search: searchTerm
    });
  };

  // Open and close item details modal
  const openItemDetails = (item) => {
    setSelectedItem(item);
  };

  const closeItemDetails = () => {
    setSelectedItem(null);
  };

  // Clear search and filters
  const clearSearch = () => {
    setSearchTerm('');
    getAllItems();
  };

  // Filter items based on search term and filters
  // This applies client-side filtering for the current items in state
  // Replace the filteredItems definition with this:
  const filteredItems = Array.isArray(items)
    ? items.filter(item => {
      console.log("Filtering item:", item);
      // Apply filters
      const matchesType = !filter.type || item.type === filter.type;
      const matchesCategory = !filter.category || item.category === filter.category;
      const matchesStatus = !filter.status || item.status === filter.status;
      const matchesSearch = !searchTerm ||
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesType && matchesCategory && matchesStatus && matchesSearch;
    })
    : [];
  
    const handleClaimStatusChange = async (claimId, status, adminNotes) => {
      try {
        const result = await updateClaimStatus(claimId, status, adminNotes);
        if (result) {
          toast.success('Claim status updated successfully');
          
          // Update the claim in the selectedItem state
          if (selectedItem && selectedItem.claims) {
            const updatedClaims = selectedItem.claims.map(claim => 
              claim._id === claimId ? { ...claim, status, adminNotes } : claim
            );
            setSelectedItem({ ...selectedItem, claims: updatedClaims });
          }
          
          // Refresh all items to get updated data
          getAllItems();
          return true;
        }
        return false;
      } catch (error) {
        toast.error('Failed to update claim status');
        return false;
      }
    };
  



  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-6">Item Management</h2>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <form onSubmit={handleSearch} className="md:col-span-4 flex gap-2">
          <input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border rounded px-3 py-2 flex-grow"
          />
          <button
            type="submit"
            className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
          >
            Search
          </button>
          {searchTerm && (
            <button
              type="button"
              onClick={clearSearch}
              className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
            >
              Clear
            </button>
          )}
        </form>

        <select
          name="type"
          value={filter.type}
          onChange={handleFilterChange}
          className="border rounded px-3 py-2"
        >
          <option value="">All Types</option>
          <option value="lost">Lost</option>
          <option value="found">Found</option>
        </select>

        <select
          name="category"
          value={filter.category}
          onChange={handleFilterChange}
          className="border rounded px-3 py-2"
        >
          <option value="">All Categories</option>
          <option value="electronics">Electronics</option>
          <option value="clothing">Clothing</option>
          <option value="accessories">Accessories</option>
          <option value="documents">Documents</option>
          <option value="other">Other</option>
        </select>

        <select
          name="status"
          value={filter.status}
          onChange={handleFilterChange}
          className="border rounded px-3 py-2"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="claimed">Claimed</option>
          <option value="resolved">Resolved</option>
          <option value="expired">Expired</option>
        </select>

        <button
          onClick={applyFilters}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Apply Filters
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-4">Loading items...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-4 text-left">Title</th>
                <th className="py-2 px-4 text-left">Type</th>
                <th className="py-2 px-4 text-left">Category</th>
                <th className="py-2 px-4 text-left">Reported By</th>
                <th className="py-2 px-4 text-left">Status</th>
                <th className="py-2 px-4 text-left">Date</th>
                <th className="py-2 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <tr key={item._id} className="border-t">
                    <td className="py-2 px-4">{item.title}</td>
                    <td className="py-2 px-4 capitalize">{item.type}</td>
                    <td className="py-2 px-4 capitalize">{item.category}</td>
                    <td className="py-2 px-4">{item.reportedBy?.name || 'Unknown'}</td>
                    <td className="py-2 px-4">
                      <span className={`px-2 py-1 rounded text-xs ${item.status === 'active' ? 'bg-green-100 text-green-800' :
                          item.status === 'claimed' ? 'bg-blue-100 text-blue-800' :
                            item.status === 'resolved' ? 'bg-purple-100 text-purple-800' :
                              'bg-gray-100 text-gray-800'
                        }`}>
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-2 px-4">{new Date(item.createdAt).toLocaleDateString()}</td>
                    <td className="py-2 px-4 flex gap-2">
                      <select
                        value={item.status}
                        onChange={(e) => handleStatusChange(item._id, e.target.value)}
                        className="border rounded px-2 py-1"
                      >
                        <option value="active">Active</option>
                        <option value="claimed">Claimed</option>
                        <option value="resolved">Resolved</option>
                        <option value="expired">Expired</option>
                      </select>
                      <button
                        onClick={() => openItemDetails(item)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-4 text-center text-gray-500">
                    No items found matching your criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Item Details Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Item Details</h2>
              <button
                onClick={closeItemDetails}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-lg mb-2">{selectedItem.title}</h3>
                <p className="text-gray-600 mb-4">{selectedItem.description}</p>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-gray-600 font-medium">Type:</p>
                    <p className="capitalize">{selectedItem.type}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium">Category:</p>
                    <p className="capitalize">{selectedItem.category}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium">Status:</p>
                    <p className="capitalize">{selectedItem.status}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium">Date:</p>
                    <p>{new Date(selectedItem.dateLostOrFound).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium">Location:</p>
                    <p>{selectedItem.location?.name || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium">Reported By:</p>
                    <p>{selectedItem.reportedBy?.name || 'Unknown'}</p>
                  </div>
                </div>

                {selectedItem.identifyingCharacteristics && selectedItem.identifyingCharacteristics.length > 0 && (
                  <div className="mb-4">
                    <p className="text-gray-600 font-medium">Identifying Characteristics:</p>
                    <ul className="list-disc pl-5">
                      {selectedItem.identifyingCharacteristics.map((char, index) => (
                        <li key={index}>{char.name ? `${char.name}: ${char.value}` : char}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedItem.tags && selectedItem.tags.length > 0 && (
                  <div className="mb-4">
                    <p className="text-gray-600 font-medium">Tags:</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedItem.tags.map((tag, index) => (
                        <span key={index} className="bg-gray-100 px-2 py-1 rounded text-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedItem.reward && selectedItem.reward.isOffered && (
                  <div className="mb-4">
                    <p className="text-gray-600 font-medium">Reward:</p>
                    <p>{selectedItem.reward.amount} - {selectedItem.reward.description}</p>
                  </div>
                )}
              </div>

              <div>
                {/* <p className="text-gray-600 font-medium mb-2">Images:</p> */}
                

                {selectedItem.claims && selectedItem.claims.length > 0 && (
                  <div className="mt-6">
                    <p className="text-gray-600 font-medium mb-2">Claims:</p>
                    <div className="border rounded overflow-hidden">
                      {selectedItem.claims.map((claim, index) => (
                        <div
                          key={index}
                          className="p-3 border-b last:border-b-0 cursor-pointer hover:bg-gray-50"
                          onClick={() => openClaimDetails(claim)}
                        >
                          <div className="flex justify-between">
                            <p className="font-medium">{claim.claimant?.name || 'Unknown'}</p>
                            <span className={`px-2 py-1 rounded text-xs ${claim.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                claim.status === 'approved' ? 'bg-green-100 text-green-800' :
                                  'bg-red-100 text-red-800'
                              }`}>
                              {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">
                            {new Date(claim.createdAt).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {selectedClaim && (
  <ClaimDetails 
    claim={selectedClaim} 
    onClose={() => setSelectedClaim(null)} 
    onStatusChange={handleClaimStatusChange} 
  />
)}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => handleStatusChange(selectedItem._id, 'active')}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                disabled={selectedItem.status === 'active'}
              >
                Mark as Active
              </button>
              <button
                onClick={() => handleStatusChange(selectedItem._id, 'claimed')}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                disabled={selectedItem.status === 'claimed'}
              >
                Mark as Claimed
              </button>
              <button
                onClick={() => handleStatusChange(selectedItem._id, 'resolved')}
                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded"
                disabled={selectedItem.status === 'resolved'}
              >
                Mark as Resolved
              </button>
              <button
                onClick={() => handleStatusChange(selectedItem._id, 'expired')}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                disabled={selectedItem.status === 'expired'}
              >
                Mark as Expired
              </button>
              <button
                onClick={closeItemDetails}
                className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


// Main Admin Dashboard Component
function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();

  useEffect(() => {
    // Redirect to users by default
    if (location.pathname === '/admin') {
      navigate('/admin/users');
    }
  }, [location, navigate]);

  // Check if user is admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/profile');
      toast.error('You do not have permission to access the admin dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

      <div className="mb-6 flex border-b">
        <Link
          to="/admin/users"
          className={`px-4 py-2 ${location.pathname === '/admin/users' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
        >
          User Management
        </Link>
        <Link
          to="/admin/reports"
          className={`px-4 py-2 ${location.pathname === '/admin/reports' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
        >
          Report Management
        </Link>
        <Link
          to="/admin/items"
          className={`px-4 py-2 ${location.pathname === '/admin/items' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
        >
          Item Management
        </Link>
      </div>

      <Routes>
        <Route path="users" element={<UserManagement />} />
        <Route path="reports" element={<ReportManagement />} />
        <Route path="items" element={<ItemManagement />} />
      </Routes>
    </div>
  );
}


export default AdminDashboard;
