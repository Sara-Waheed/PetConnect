// controllers/complaintController.js
import Complaint from '../models/Complaint.js';

// @desc    Submit a new complaint
// @route   POST /api/complaints
// @access  Public or Protected (depending on auth)
export const submitComplaint = async (req, res) => {
  try {
    const { type, description, status } = req.body;

    // Basic validation
    if (!type || !description) {
      return res.status(400).json({ message: 'Type and description are required' });
    }

    const complaint = await Complaint.create({
      type,
      description,
      status: status || 'Open',
      user: req.user?._id  // if authenticated
    });

    return res.status(201).json({ message: 'Complaint created', complaint });
  } catch (error) {
    console.error('Error in submitComplaint:', error);
    return res.status(500).json({ message: 'Server error submitting complaint' });
  }
};

// @desc    Get all complaints
// @route   GET /api/complaints
// @access  Admin or Protected
export const getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .sort({ createdAt: -1 })
      .populate('user', 'name email');

    return res.status(200).json({ complaints });
  } catch (error) {
    console.error('Error in getAllComplaints:', error);
    return res.status(500).json({ message: 'Server error fetching complaints' });
  }
};