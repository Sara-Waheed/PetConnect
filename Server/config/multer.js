import multer from 'multer';
import path from 'path';

// Set up storage configuration for Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Specify where the files will be stored
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Set unique file name
  },
});

// Set up the file filter (optional)
const fileFilter = (req, file, cb) => {
  // Allowed file types for images and videos
  const fileTypes = /jpg|jpeg|png|gif|mp4|mkv|avi/; 
  const extName = fileTypes.test(path.extname(file.originalname).toLowerCase()); // Validate extension
  const mimeType = fileTypes.test(file.mimetype); // Validate mime type

  if (extName && mimeType) {
    return cb(null, true); // Allow the file
  } else {
    return cb(new Error('Invalid file type. Only images and videos are allowed.'), false); // Reject invalid files
  }
};

// Set up Multer with storage configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});

export default upload;
