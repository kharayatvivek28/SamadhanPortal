import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure upload directories exist
const feedbackDir = path.join(__dirname, '..', 'uploads', 'feedback');
const complaintsDir = path.join(__dirname, '..', 'uploads', 'complaints');
const profilesDir = path.join(__dirname, '..', 'uploads', 'profiles');
[feedbackDir, complaintsDir, profilesDir].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, feedbackDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `feedback-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extValid = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeValid = allowedTypes.test(file.mimetype.split('/')[1]);

  if (extValid && mimeValid) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, PNG, GIF, WebP) are allowed'), false);
  }
};

export const uploadFeedbackImages = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).array('images', 3);

// Complaint attachments storage
const complaintStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, complaintsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `complaint-${uniqueSuffix}${ext}`);
  },
});

export const uploadComplaintImages = multer({
  storage: complaintStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).array('attachments', 5);

// Profile pictures storage
const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, profilesDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `profile-${uniqueSuffix}${ext}`);
  },
});

export const uploadProfilePic = multer({
  storage: profileStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single('photograph');
