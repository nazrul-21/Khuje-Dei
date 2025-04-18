import { Navigate, Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import useAuthStore from '../store/authStore';
import { toast } from 'react-toastify';

const AdminRoute = () => {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  console.log(user)
  useEffect(() => {
    if (!isLoading && isAuthenticated && user?.role !== 'admin') {
      toast.error('You do not have permission to access this page');
    }
  }, [isLoading, isAuthenticated, user]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/profile" />;
  }

  return <Outlet />;
};

export default AdminRoute;
