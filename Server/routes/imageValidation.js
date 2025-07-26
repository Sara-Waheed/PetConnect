// routes/imageValidation.js
import express from 'express';
import { validateHomeImages } from '../controllers/ImageValidationController.js';
import { uploadHomeImages } from '../middleware/MulterConfig.js';

const router = express.Router();

router.post('/validate-home-images', uploadHomeImages, validateHomeImages);

export default router;