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

const memoryStorage = multer.memoryStorage();

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
  storage: memoryStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).array('images', 3);

export const uploadComplaintImages = multer({
  storage: memoryStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).array('attachments', 5);

export const uploadProfilePic = multer({
  storage: memoryStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single('photograph');
