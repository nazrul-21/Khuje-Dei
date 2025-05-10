import { Navigate, Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import useAuthStore from '../store/authStore';
import { toast } from 'react-toastify';

const AdminRoute = () => {
  const { user, isAuthenticated, isLoading } = useAuthStore();
<<<<<<< HEAD

  useEffect(() => {
    console.log(user)
    if (!isLoading && isAuthenticated && user?.email !== 'rubayet079@gmail.com') {
=======
  console.log(user)
  useEffect(() => {
    if (!isLoading && isAuthenticated && user?.role !== 'admin') {
>>>>>>> origin/main
      toast.error('You do not have permission to access this page');
    }
  }, [isLoading, isAuthenticated, user]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

<<<<<<< HEAD
  if (user?.email !== 'rubayet079@gmail.com') {
=======
  if (user?.role !== 'admin') {
>>>>>>> origin/main
    return <Navigate to="/profile" />;
  }

  return <Outlet />;
};

export default AdminRoute;
