// models/NotificationSetting.js

import mongoose from 'mongoose';

const notificationSettingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  appointment: { type: Boolean, default: true },
  memory: { type: Boolean, default: true },
}, { timestamps: true });

const NotificationSetting = mongoose.model('NotificationSetting', notificationSettingSchema);

export default NotificationSetting;