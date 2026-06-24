import multer from 'multer';

// In-memory buffer storage to directly stream assets to cloud providers (e.g., Cloudinary)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Check mime type
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only image files (JPEG, PNG, WEBP, etc.) are allowed!'), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB file size limit
  }
});

export default upload;
