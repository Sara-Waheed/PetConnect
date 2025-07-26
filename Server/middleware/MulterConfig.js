import multer from 'multer';
import path from 'path';

// Define allowed file types for image uploads and PDFs
const allowedFileTypes = /jpeg|jpg|png|gif|pdf/;

// Configure storage settings (in memory, for sharp processing)
const storage = multer.memoryStorage();

// File validation to check file types and size
const fileFilter = (req, file, cb) => {
  const isFileValid = allowedFileTypes.test(path.extname(file.originalname).toLowerCase()) && 
                      allowedFileTypes.test(file.mimetype);

  if (isFileValid) {
    return cb(null, true); // file is valid
  } else {
    return cb(new Error('Only image and PDF files are allowed!'), false); // file is invalid
  }
};

// Configure single file upload for 'photo'
const uploadSingle = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // Limit file size to 5MB
  },
  fileFilter: fileFilter
}).single('photo'); // Handle single file under 'photo'

// Reusable function for multiple file uploads based on dynamic fields
const UploadMultiple = (fields) => {
  return multer({
    storage: storage,
    limits: {
      fileSize: 5 * 1024 * 1024 // Limit file size to 5MB
    },
    fileFilter: fileFilter
  }).fields(fields); // Handle dynamic fields
};

// Add this to your multer config file
const imageOnlyFilter = (req, file, cb) => {
  const isImage = file.mimetype.startsWith('image/');
  const extname = path.extname(file.originalname).toLowerCase();
  const isImageExt = ['.jpeg', '.jpg', '.png', '.gif'].includes(extname);

  if (isImage && isImageExt) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Create specific configuration for home image validation
const uploadHomeImages = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 10 // Match your MAX_PHOTOS
  },
  fileFilter: imageOnlyFilter // Stricter filter without PDFs
}).array('homeImages'); // Handle multiple files in single field
 

export { uploadSingle, UploadMultiple, uploadHomeImages  };
