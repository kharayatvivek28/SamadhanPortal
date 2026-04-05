import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import crypto from 'crypto';
import User from '../models/User.js';
import Otp from '../models/Otp.js';
import ActivityLog from '../models/ActivityLog.js';
import { sendPasswordResetEmail, sendOtpEmail } from '../utils/emailService.js';
import { uploadToImageKit } from '../utils/imageKitHelper.js';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate JWT
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// ──────────────────────────────────────────────
// @desc    Generate and send registration OTP
// @route   POST /api/auth/send-register-otp
// @access  Public
// ──────────────────────────────────────────────
const sendRegisterOtp = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Generate 6-digit OTP
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

    // Delete existing OTP for this email if it exists
    await Otp.deleteMany({ email });

    // Save newly generated OTP to the database
    await Otp.create({ email, otp: generatedOtp });

    // Send OTP email
    await sendOtpEmail(email, generatedOtp);

    res.status(200).json({ message: 'OTP sent successfully to ' + email });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ──────────────────────────────────────────────
// @desc    Register a new user (email + password + otp)
// @route   POST /api/auth/register
// @access  Public
// ──────────────────────────────────────────────
const register = async (req, res) => {
  try {
    const { name, email, password, otp } = req.body;

    if (!name || !email || !password || !otp) {
      return res.status(400).json({ message: 'Please provide name, email, password, and OTP' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Verify OTP
    const otpRecord = await Otp.findOne({ email });
    if (!otpRecord) {
      return res.status(400).json({ message: 'OTP expired or not requested' });
    }

    if (otpRecord.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Delete OTP record after successful validation
    await Otp.deleteMany({ email });

    // Create user — immediately verified since OTP was entered
    const user = await User.create({
      name,
      email,
      password,
      role: 'user',
      authProvider: 'local',
      isVerified: true,
    });

    await ActivityLog.create({
      action: 'User Registered',
      details: `New local user registered: ${email}`,
      entityType: 'User',
      entityId: user._id,
    });

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isFirstLogin: user.isFirstLogin,
      profileCompleted: user.profileCompleted,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ──────────────────────────────────────────────
// @desc    Login user (email + password)
// @route   POST /api/auth/login
// @access  Public
// ──────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (user.authProvider !== 'local') {
      return res.status(400).json({
        message: `This account uses ${user.authProvider} sign-in. Please use that method.`,
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user._id, user.role);

    await ActivityLog.create({
      action: 'User Login',
      user: user._id,
      details: `User logged in via local auth`,
      entityType: 'System',
      entityId: user._id,
    });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isFirstLogin: user.isFirstLogin,
      profileCompleted: user.profileCompleted,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ──────────────────────────────────────────────
// @desc    Google OAuth login/signup
// @route   POST /api/auth/google
// @access  Public
// ──────────────────────────────────────────────
const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ message: 'Google credential is required' });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, email_verified, picture, given_name, family_name } = payload;

    if (!email_verified) {
      return res.status(400).json({ message: 'Google email is not verified' });
    }

    // Find existing user by googleId or email
    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (user) {
      // Update googleId if not set (user registered with email, now linking Google)
      if (!user.googleId) {
        user.googleId = googleId;
        user.authProvider = 'google';
        user.isVerified = true;
        await user.save();
      }
    } else {
      // Create new user
      user = await User.create({
        name,
        email,
        googleId,
        authProvider: 'google',
        isVerified: true,
        role: 'user',
        photographUrl: picture,
        firstName: given_name,
        lastName: family_name,
      });

      await ActivityLog.create({
        action: 'User Registered',
        details: `New user registered via Google: ${email}`,
        entityType: 'User',
        entityId: user._id,
      });
    }

    const token = generateToken(user._id, user.role);

    await ActivityLog.create({
      action: 'User Login',
      user: user._id,
      details: `User logged in via Google`,
      entityType: 'System',
      entityId: user._id,
    });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isFirstLogin: user.isFirstLogin,
      profileCompleted: user.profileCompleted,
      token,
    });
  } catch (error) {
    console.error('Google auth error details:', error);
    res.status(401).json({ 
      message: 'Google authentication failed', 
      details: error.message,
      hint: 'Check if GOOGLE_CLIENT_ID is correct and valid in your .env file'
    });
  }
};

// ──────────────────────────────────────────────
// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
// ──────────────────────────────────────────────
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ──────────────────────────────────────────────
// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
// ──────────────────────────────────────────────
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { phone, firstName, lastName, gender, dob, address, newPassword } = req.body;

    // Update fields if provided
    if (phone) user.phone = phone;
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (gender) user.gender = gender;
    if (dob) user.dob = dob;
    if (address) user.address = address;

    // Update backwards compatible 'name' field
    if (firstName || lastName) {
      user.name = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    }

    // Handle password change
    if (newPassword) {
      if (newPassword.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
      }
      user.password = newPassword;
    }

    // Handle profile picture upload
    if (req.file) {
      const fileName = `profile-${user._id}-${Date.now()}`;
      user.photographUrl = await uploadToImageKit(req.file.buffer, fileName, '/samadhan/profiles');
    }

    // Set profileCompleted to true if key demographic info is added
    if (user.firstName && user.lastName && user.phone) {
      user.profileCompleted = true;
    }

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      profileCompleted: updatedUser.profileCompleted,
    });
  } catch (error) {
    if (error.code === 11000 && error.keyPattern?.phone) {
      return res.status(400).json({ message: 'Phone number already in use by another account' });
    }
    res.status(500).json({ message: error.message });
  }
};

// ──────────────────────────────────────────────
// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
// ──────────────────────────────────────────────
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'No user found with that email' });
    }

    if (user.authProvider !== 'local') {
      return res.status(400).json({ message: `This account uses ${user.authProvider} sign-in. Password reset is not available.` });
    }

    // Create reset token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set expire (10 minutes)
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    await user.save();

    // Create reset url
    const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;

    // Note: If using Vite in dev (port 8080), change domain manually if req.get('host') shows 5000
    // But since proxy handles relative URLs, we should use front-end explicit domain if detached
    const fallbackOrigin = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',')[0] : 'http://localhost:8080';
    const frontendUrl = req.headers.origin || process.env.FRONTEND_URL || fallbackOrigin;
    const finalResetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    try {
      await sendPasswordResetEmail(user.email, finalResetUrl);
      res.json({ message: 'Password reset link sent to email' });
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      return res.status(500).json({ message: 'Email could not be sent' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ──────────────────────────────────────────────
// @desc    Reset password
// @route   PUT /api/auth/reset-password/:resettoken
// @access  Public
// ──────────────────────────────────────────────
const resetPassword = async (req, res) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ message: 'Please provide a new password' });
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { sendRegisterOtp, register, login, googleLogin, getMe, updateProfile, forgotPassword, resetPassword };
