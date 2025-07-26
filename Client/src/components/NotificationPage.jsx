// src/components/NotificationPage.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Switch } from '@headlessui/react';
import { formatDistance } from 'date-fns';

const NotificationPage = () => {
    const [settings, setSettings] = useState(null);
    const [notifications, setNotifications] = useState(null);
    const [error, setError] = useState(null);

    // 1) Fetch notification settings
    // Update the settings fetch useEffect
useEffect(() => {
  axios
    .get('http://localhost:5000/auth/notifications/settings', { 
      withCredentials: true 
    })
    .then(res => {
      // Handle consistent response format
      const s = res.data.settings || {
        appointment: true,
        memory: true
      };
      setSettings(s);
    })
    .catch(err => {
      console.error('Settings fetch error:', err);
      // Set default settings if error occurs
      setSettings({
        appointment: true,
        memory: true
      });
    });
}, []);

    // 2) Fetch notifications list
    useEffect(() => {
        axios
            .get('http://localhost:5000/auth/notifications', { withCredentials: true })
            .then(res => {
                const data = Array.isArray(res.data)
                    ? res.data
                    : Array.isArray(res.data.notifications)
                        ? res.data.notifications
                        : [];
                setNotifications(data);
            })
            .catch(err => {
                console.error('Notifications fetch error:', err);
                setError('Could not load notifications');
            });
    }, []);

    // 3) Show loading / error
    if (error) {
        return (
            <div className="p-6 text-red-500">
                Error: {error}
            </div>
        );
    }
    if (settings === null || notifications === null) {
        return (
            <div className="p-6">
                Loading notifications…
            </div>
        );
    }

    const toggleAllSettings = () => {
        const newValue = !(settings.appointment && settings.memory);
        axios
            .put('http://localhost:5000/auth/notifications/settings', 
                { appointment: newValue, memory: newValue }, 
                { withCredentials: true }
            )
            .then(res => {
                setSettings(res.data.settings);
            })
            .catch(err => console.error(err));
    };


    // 1) Update the delete handler function name and logic
    const deleteNotification = (id) => {
        axios
            .delete(`http://localhost:5000/auth/notifications/${id}`, {
                withCredentials: true
            })
            .then(() => {
                setNotifications(prev => prev.filter(n => n._id !== id));
            })
            .catch(err => {
                console.error('Delete error:', err);
                setError('Failed to delete notification');
            });
    };

    const renderTime = (note) => {
        const base = new Date(note.date);
        return base.toLocaleString('en-PK', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
            timeZone: 'Asia/Karachi'
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50 p-6">
            <div className="max-w-3xl mx-auto space-y-8">
                {/* Settings Card */}
                <div className="bg-white rounded-2xl shadow-lg p-6 transition-all hover:shadow-xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">
                                Notification Settings
                            </h2>
                            <p className="text-gray-500">
                                Manage your notification preferences
                            </p>
                        </div>
                        <div className="flex flex-col items-center">
                            <Switch
                                checked={settings.appointment && settings.memory}
                                onChange={toggleAllSettings}
                                className={`${
                                    settings.appointment && settings.memory ? 'bg-emerald-500' : 'bg-gray-300'
                                } relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2`}
                            >
                                <span
                                    className={`${
                                        settings.appointment && settings.memory ? 'translate-x-7' : 'translate-x-1'
                                    } inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform duration-200 ease-in-out`}
                                />
                            </Switch>
                            <span className="mt-2 text-sm font-medium text-gray-600">
                                {settings.appointment && settings.memory ? 'ON' : 'OFF'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Notifications Card */}
                <div className="bg-white rounded-2xl shadow-lg p-6 transition-all hover:shadow-xl">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">
                        Your Notifications
                    </h2>

                    {notifications.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="mb-4">
                                <span className="text-6xl">📭</span>
                            </div>
                            <p className="text-gray-600 font-medium mb-2">
                                No notifications yet
                            </p>
                            <p className="text-gray-400 text-sm">
                                We'll notify you when something new arrives
                            </p>
                        </div>
                    ) : (
                        <ul className="space-y-4">
                            {notifications.map(note => (
                                <li
                                    key={note._id}
                                    className="group flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 transition-all duration-200"
                                >
                                    <div className="pr-4 flex-1">
                                        <p className="text-gray-800 font-medium">
                                            {note.message}
                                        </p>
                                    </div>
                                    
                                    <div className="flex flex-col items-end space-y-2">
                                        <button
                                            onClick={() => deleteNotification(note._id)}
                                            className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50"
                                            aria-label="Delete notification"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-5 w-5"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M6 18L18 6M6 6l12 12"
                                                />
                                            </svg>
                                        </button>
                                        <span className="text-xs text-gray-400 font-medium">
                                            {renderTime(note)}
                                        </span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};
export default NotificationPage;