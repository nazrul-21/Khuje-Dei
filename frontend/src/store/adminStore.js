import { create } from 'zustand';
import api from '../api/axios';

const useAdminStore = create((set, get) => ({
  users: [],
  reports: [],
  filteredUsers: [],
  isLoading: false,
  error: null,

  // User management
  getAllUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/admin/users');
      set({ users: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch users', 
        isLoading: false 
      });
      return false;
    }
  },

  searchUsers: async (username) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/admin/users/search?username=${username}`);
      set({ filteredUsers: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to search users', 
        isLoading: false 
      });
      return false;
    }
  },

  addUser: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/admin/users', userData);
      set(state => ({ 
        users: [...state.users, response.data.user],
        isLoading: false 
      }));
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to add user', 
        isLoading: false 
      });
      return false;
    }
  },

  restrictUser: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put(`/admin/users/${userId}/restrict`);
      set(state => ({
        users: state.users.map(user => 
          user._id === userId ? { ...user, isActive: false } : user
        ),
        isLoading: false
      }));
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to restrict user', 
        isLoading: false 
      });
      return false;
    }
  },

  activateUser: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put(`/admin/users/${userId}/activate`);
      set(state => ({
        users: state.users.map(user => 
          user._id === userId ? { ...user, isActive: true } : user
        ),
        isLoading: false
      }));
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to activate user', 
        isLoading: false 
      });
      return false;
    }
  },

  // Report management
  getAllReports: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/admin/reports');
      set({ reports: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch reports', 
        isLoading: false 
      });
      return false;
    }
  },

  updateReportStatus: async (reportId, status) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put(`/admin/reports/${reportId}/status`, { status });
      set(state => ({
        reports: state.reports.map(report => 
          report._id === reportId ? { ...report, status } : report
        ),
        isLoading: false
      }));
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to update report status', 
        isLoading: false 
      });
      return false;
    }
  },

  clearError: () => set({ error: null })
}));

export default useAdminStore;
