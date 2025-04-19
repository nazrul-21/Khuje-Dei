import { create } from 'zustand';
import api from '../api/axios';

const useAdminStore = create((set, get) => ({
  users: [],
  reports: [],
  filteredUsers: [],
  items: [],
  filteredItems: [],
  isLoading: false,
  error: null,
  itemError: null,

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

  clearError: () => set({ error: null }),

  // Item management
  getAllItems: async () => {
    set({ isLoading: true, itemError: null });
    try {
      const response = await api.get('/admin/items');
      console.log(response.data);
      set({ items: response.data.items, isLoading: false });
      return response.data;
    } catch (error) {
      set({
        itemError: error.response?.data?.message || 'Failed to fetch items',
        isLoading: false
      });
      return false;
    }
  },

  searchItems: async (query) => {
    set({ isLoading: true, itemError: null });
    try {
      const response = await api.get(`/items/search?query=${query}`);
      set({ filteredItems: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      set({
        itemError: error.response?.data?.message || 'Failed to search items',
        isLoading: false
      });
      return false;
    }
  },

  updateItemStatus: async (itemId, status) => {
    set({ isLoading: true, itemError: null });
    try {
      const response = await api.put(`/items/${itemId}/status`, { status });
      set(state => ({
        items: state.items.map(item =>
          item._id === itemId ? { ...item, status } : item
        ),
        isLoading: false
      }));
      return response.data;
    } catch (error) {
      set({
        itemError: error.response?.data?.message || 'Failed to update item status',
        isLoading: false
      });
      return false;
    }
  },

  clearItemError: () => set({ itemError: null }),
  claims: [],
  claimError: null,
  isLoadingClaims: false,
  
  // Get all claims or filtered by status
  getAllClaims: async (status = null) => {
    try {
      set({ isLoadingClaims: true });
      const url = status ? `/admin/claims?status=${status}` : '/admin/claims';
      const response = await api.get(url);
      set({ claims: response.data.claims, isLoadingClaims: false });
    } catch (error) {
      set({ 
        claimError: error.response?.data?.message || 'Failed to fetch claims',
        isLoadingClaims: false 
      });
    }
  },
  
  // Update claim status
  updateClaimStatus: async (claimId, status, adminNotes) => {
    try {
      set({ isLoading: true, claimError: null });
      // Fix the API endpoint - removing 'api/' prefix as it's likely already included in the base URL
      const response = await api.put(`/claims/${claimId}/status`, { 
        status, 
        adminNotes 
      });
      
      // Update the claim in the claims array if needed
      const updatedClaims = get().claims.map(claim => 
        claim._id === claimId ? { ...claim, status, adminNotes } : claim
      );
      
      // Update items that may have this claim
      const updatedItems = get().items.map(item => {
        if (item.claims && item.claims.some(claim => claim._id === claimId)) {
          const updatedItemClaims = item.claims.map(claim =>
            claim._id === claimId ? { ...claim, status, adminNotes } : claim
          );
          return { ...item, claims: updatedItemClaims };
        }
        return item;
      });
      
      set({ 
        claims: updatedClaims,
        items: updatedItems,
        isLoading: false 
      });
      
      return response.data;
    } catch (error) {
      set({ 
        claimError: error.response?.data?.message || 'Failed to update claim status',
        isLoading: false
      });
      return false;
    }
  },
  
  clearClaimError: () => set({ claimError: null })
}));

export default useAdminStore;
