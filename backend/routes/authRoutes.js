import express from 'express';
import { sendRegisterOtp, register, login, googleLogin, getMe, forgotPassword, resetPassword, updateProfile } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { uploadProfilePic } from '../middleware/uploadMiddleware.js';

const router = express.Router();

const handleProfileUpload = (req, res, next) => {
  uploadProfilePic(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message || 'File upload failed' });
    next();
  });
};

router.post('/send-register-otp', sendRegisterOtp);
router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:resettoken', resetPassword);
router.get('/me', protect, getMe);
router.put('/profile', protect, handleProfileUpload, updateProfile);

export default router;
