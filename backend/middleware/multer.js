import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use disk storage instead of memory storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads')); // Create uploads folder
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedAudio = ['.mp3', '.wav', '.m4a'];
  const allowedImages = ['.jpg', '.jpeg', '.png', '.webp'];
  const ext = file.originalname.split('.').pop().toLowerCase();

  if (file.fieldname === 'music') {
    const isValid = allowedAudio.includes(`.${ext}`) && file.mimetype.startsWith('audio/');
    return cb(isValid ? null : new Error('Invalid audio file. Allowed: .mp3, .wav, .m4a'), isValid);
  }

  if (file.fieldname === 'image') {
    const isValid = allowedImages.includes(`.${ext}`) && file.mimetype.startsWith('image/');
    return cb(isValid ? null : new Error('Invalid image file. Allowed: .jpg, .jpeg, .png, .webp'), isValid);
  }

  cb(new Error('Unexpected field'), false);
};

const limits = {
  fileSize: 25 * 1024 * 1024, // 25MB max per file
  files: 2
};

const upload = multer({
  storage,
  fileFilter,
  limits
});

export const handleUpload = (req, res, next) => {
  upload.fields([
    { name: 'music', maxCount: 1 },
    { name: 'image', maxCount: 1 }
  ])(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    next();
  });
};

export default upload;