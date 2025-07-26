// controllers/notificationController.js

import jwt from 'jsonwebtoken';
import Notification from '../models/Notifications.js';

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * GET /api/notifications
 * Fetch unread notifications for the logged-in user
 */
export const GetNotifications = async (req, res) => {
  const token = req.cookies.pet_ownerToken;
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized. No token provided.' });
  }

  try {
    const { id: userId } = jwt.verify(token, JWT_SECRET);

    // your schema uses "isRead"
    const notes = await Notification.find({
      userId,
      isRead: false
    })
      .sort({ date: -1 })
      .lean();

    res.json(notes);
  } catch (err) {
    console.error('Error fetching notifications:', err);
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token.' });
    }
    res.status(500).json({ message: 'Failed to load notifications' });
  }
};

/**
 * PATCH /api/notifications/:id/read
 * Mark a notification as read
 */
export const MarkNotificationRead = async (req, res) => {
  const token = req.cookies.pet_ownerToken;
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized. No token provided.' });
  }

  try {
    const { id: userId } = jwt.verify(token, JWT_SECRET);

    const note = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId },
      { isRead: true },
      { new: true }
    ).lean();

    if (!note) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json(note);
  } catch (err) {
    console.error('Error marking notification read:', err);
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token.' });
    }
    res.status(500).json({ message: 'Failed to mark as read' });
  }
};

// In notificationController.js - Add delete endpoint
/**
 * DELETE /api/notifications/:id
 * Delete a notification
 */
export const DeleteNotification = async (req, res) => {
  const token = req.cookies.pet_ownerToken;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const { id: userId } = jwt.verify(token, JWT_SECRET);
    
    const note = await Notification.findOneAndDelete({
      _id: req.params.id,
      userId // Ensure user owns the notification
    });

    if (!note) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.sendStatus(204);
  } catch (err) {
    console.error('Delete notification error:', err);
    res.status(500).json({ message: 'Failed to delete notification' });
  }
};

// Add this to your notificationController.js
export const CreateNotification = async (req, res) => {
  const token = req.cookies.vetToken || req.cookies.pet_ownerToken;
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const { userId, message, type } = req.body;
    const newNotification = await Notification.create({
      userId,
      message,
      type,
      date: new Date()
    });
    
    res.status(201).json(newNotification);
  } catch (err) {
    console.error('Notification creation error:', err);
    res.status(500).json({ message: 'Failed to create notification' });
  }
};