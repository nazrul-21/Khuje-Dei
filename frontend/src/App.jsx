import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { useEffect } from 'react';
import useAuthStore from './store/authStore';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import InvitePage from './pages/InvitePage';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import UserProfile from './pages/UserProfile'; 
import ChangePassword from './pages/ChangePassword';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AdminDashboard from './pages/AdminDashboard';
import MyReports from './pages/MyReports';
import ReportLost from './pages/ReportLost';
import ReportFound from './pages/ReportFound';
import Items from './pages/Items';
import ClaimItem from './pages/ClaimItem';
import 'react-toastify/dist/ReactToastify.css';
import ItemDetail from './pages/ItemDetail';
import Volunteers from './pages/Volunteers';
import VolunteerApply from './pages/VolunteerApply';
import VolunteerStatus from './pages/VolunteerStatus';
import BotChat from './pages/BotChat';
// import VolunteerProfile from './pages/VolunteerProfile';
// import VolunteerDashboard from './pages/VolunteerDashboard';

function App() {
  const { checkAuth } = useAuthStore();
  
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);
  
  return (
    <Router>
      <ToastContainer />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          
          <Route element={<PrivateRoute />}>
            <Route path="/profile" element={<Profile />} />
            <Route path="/change-password" element={<ChangePassword />} />
            <Route path="/my-reports" element={<MyReports />} />
            <Route path="/invite" element={ <InvitePage />} />
            <Route path="/volunteer-apply" element={<VolunteerApply />} />
            <Route path="/volunteer-status" element={<VolunteerStatus />} />
            <Route path="/bot-chat" element={<BotChat />} />
            
            {/* Volunteer routes */}
            {/* <Route path="/volunteer-dashboard" element={<VolunteerDashboard />} />
            <Route path="/volunteer-profile" element={<VolunteerProfile />} /> */}
            
            {/* Admin routes */}
            <Route path="/admin/*" element={<AdminDashboard />} />
          </Route>
          
          
          {/* Public routes that still use the Layout */}
          <Route path="/users/:userId" element={<UserProfile />} /> {/* New route for viewing other user profiles */}
          <Route path="/items" element={<Items />} />
          <Route path="/items/:id" element={<ItemDetail />} />
          <Route path="/items/:itemId/claim" element={<ClaimItem />} />
          <Route path="/report-lost" element={<ReportLost />} />
          <Route path="/report-found" element={<ReportFound />} />
          <Route path="/volunteers" element={<Volunteers />} />
          <Route path="/volunteers/:volunteerId" element={<UserProfile />} />
          <Route path="/about" element={<div className="p-4">About Us Page (To be implemented)</div>} />
          <Route path="/contact" element={<div className="p-4">Contact Page (To be implemented)</div>} />
          <Route path="/faq" element={<div className="p-4">FAQ Page (To be implemented)</div>} />
          <Route path="/guidelines" element={<div className="p-4">Guidelines Page (To be implemented)</div>} />
          <Route path="/tips" element={<div className="p-4">Safety Tips Page (To be implemented)</div>} />
          <Route path="/privacy" element={<div className="p-4">Privacy Policy Page (To be implemented)</div>} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
