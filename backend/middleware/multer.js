import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure upload directory (uses Render's /tmp in production)
const tempDir = process.env.TEMP_UPLOAD_DIR || path.join(__dirname, '../uploads');

// Ensure directory exists
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempDir); // Use the configured temp directory
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '_' + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedAudio = ['.mp3', '.wav', '.m4a'];
  const allowedImages = ['.jpg', '.jpeg', '.png', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  // Check if audio file
  if (file.fieldname === 'music') {
    const isValid = allowedAudio.includes(ext) && file.mimetype.startsWith('audio/');
    return cb(isValid ? null : new Error('Invalid audio file. Only .mp3, .wav, .m4a allowed'), isValid);
  }
  
  // Check if image file
  if (file.fieldname === 'image') {
    const isValid = allowedImages.includes(ext) && file.mimetype.startsWith('image/');
    return cb(isValid ? null : new Error('Invalid image file. Only .jpg, .jpeg, .png, .webp allowed'), isValid);
  }

  // Reject other files
  cb(new Error('Unexpected field'), false);
};

const limits = {
  fileSize: 25 * 1024 * 1024, // 25MB max file size
  files: 2 // Maximum 2 files (music + image)
};

const upload = multer({
  storage,
  fileFilter,
  limits
});

// Middleware to handle multer errors properly
export const handleUpload = (req, res, next) => {
  upload.fields([
    { name: 'music', maxCount: 1 },
    { name: 'image', maxCount: 1 }
  ])(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        // A Multer error occurred when uploading
        return res.status(400).json({
          success: false,
          message: err.code === 'LIMIT_FILE_SIZE' 
            ? 'File too large. Max 25MB allowed' 
            : err.message
        });
      } else if (err) {
        // An unknown error occurred
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }
    }
    next();
  });
};

export default upload;