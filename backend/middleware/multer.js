import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '_' + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.mp3', '.wav', '.jpg', '.jpeg', '.png', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  const isMimeTypeValid = file.mimetype.startsWith('audio/') || file.mimetype.startsWith('image/');
  const isExtensionValid = allowedExtensions.includes(ext);

  if (isMimeTypeValid && isExtensionValid) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only audio (.mp3, .wav) and image (.jpg, .jpeg, .png, .webp) files are allowed.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
});

export default upload;
