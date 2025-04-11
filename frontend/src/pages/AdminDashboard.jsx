import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import useAdminStore from '../store/adminStore';
import useAuthStore from '../store/authStore';
import { toast } from 'react-toastify';

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
                  <span className={`px-2 py-1 rounded text-xs ${
                    report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
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
    if (user && user.email !== 'rubayet079@gmail.com') {
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
      </div>
      
      <Routes>
        <Route path="users" element={<UserManagement />} />
        <Route path="reports" element={<ReportManagement />} />
      </Routes>
    </div>
  );
}

export default AdminDashboard;
