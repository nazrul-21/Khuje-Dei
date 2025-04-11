// routes/route.js
import express from 'express';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Import controllers (these would need to be created)
import * as authController from '../controllers/auth.js';
import * as userController from '../controllers/user.js';


// Authentication routes
router.post('/auth/register', (req, res) => {
  authController.register(req, res);
  // res.status(200).json({ message: 'Register route' });
});

router.post('/auth/login', (req, res) => {
  authController.login(req, res);
  // res.status(200).json({ message: 'Login route' });
});

router.post('/auth/verify-email', (req, res) => {
  authController.verifyEmail(req, res);
  // res.status(200).json({ message: 'Verify email route' });
});

router.post('/auth/forgot-password', (req, res) => {
  authController.forgotPassword(req, res);
  // res.status(200).json({ message: 'Forgot password route' });
});

router.post('/auth/reset-password', (req, res) => {
  authController.resetPassword(req, res);
  // res.status(200).json({ message: 'Reset password route' });
});

router.post('/auth/logout', auth, (req, res) => {
  authController.logout(req, res);
  // res.status(200).json({ message: 'Logout route' });
});

router.post('/auth/refresh-token', (req, res) => {
  authController.refreshToken(req, res);
  // res.status(200).json({ message: 'Refresh token route' });
});

router.post('/auth/resend-verification', (req, res) => {
  authController.resendVerificationEmail(req, res);
});

// User routes
router.get('/users/profile', auth, (req, res) => {
  userController.getProfile(req, res);
  // res.status(200).json({ message: 'Get profile route' });
});

router.put('/users/profile', auth, (req, res) => {
  userController.updateProfile(req, res);
});

router.put('/users/change-password', auth, (req, res) => {
  userController.changePassword(req, res);
});



export default router;