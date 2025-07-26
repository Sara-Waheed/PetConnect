// controllers/NotificationSettingsController.js

import jwt from 'jsonwebtoken';
import NotificationSetting from '../models/NotificationSetting.js';

const JWT_SECRET = process.env.JWT_SECRET;

// GET: Get current notification settings for the user
// Modified getNotificationSettings controller
export const getNotificationSettings = async (req, res) => {
  const token = req.cookies.pet_ownerToken;
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const { id: userId } = jwt.verify(token, JWT_SECRET);

    // Find or create default settings
    let settings = await NotificationSetting.findOne({ user: userId });
    
    if (!settings) {
      // Create default settings if none exist
      settings = await NotificationSetting.create({
        user: userId,
        appointment: true,
        memory: true
      });
    }

    // Return consistent response format
    res.json({ settings });
  } catch (err) {
    console.error("Error in getNotificationSettings:", err);
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

// PUT: Update notification settings for the user
export const updateNotificationSetting = async (req, res) => {
  const token = req.cookies.pet_ownerToken;
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    // 1) Decode the JWT to get userId
    const { id: userId } = jwt.verify(token, JWT_SECRET);

    // 2) The body might be { appointment: true } or { memory: false }, etc.
    const settingsUpdate = req.body;

    // 3) Find existing or create new settings
    let notificationSettings = await NotificationSetting.findOne({ user: userId });
    if (notificationSettings) {
      notificationSettings.set(settingsUpdate);
      await notificationSettings.save();
    } else {
      notificationSettings = await NotificationSetting.create({
        user: userId,
        ...settingsUpdate
      });
    }

    res.status(200).json({ success: true, settings: notificationSettings });
  } catch (err) {
    console.error('Error in updateNotificationSettings:', err);
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET: Fetch all notifications for the logged-in user
export const getUserNotifications = async (req, res) => {
  const token = req.cookies.pet_ownerToken;
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const { id: userId } = jwt.verify(token, JWT_SECRET);
    const notifications = await Notification.find({ userId }).sort({ date: -1 });
    res.json(notifications);
  } catch (err) {
    console.error("Error in getUserNotifications:", err);
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};