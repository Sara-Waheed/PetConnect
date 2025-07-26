// routes/complaintRoutes.js
import express from 'express';
import { submitComplaint, getAllComplaints } from '../controllers/ComplaintController.js';

const router = express.Router();

// anyone can submit (optionally protect)
router.post('/submit-complaint', submitComplaint);

// admin can view all complaints
router.get('/', getAllComplaints);

export default router;
