import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { Button, Typography } from '@mui/material';
import backgroundImage from "../assets/BgMemoryhd.jpg";

const AddMemory = () => {
  const [media, setMedia] = useState(null); // Store media (photo/video)
  const [caption, setCaption] = useState('');
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');
  const { bookId } = useParams();
  const { petId } = useParams();
  const navigate = useNavigate();

  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/mkv', 'video/avi']; // Allowed mime types

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (file && allowedTypes.includes(file.type)) {
      setMedia(file); // Only set the file if it's valid
    } else {
      // If invalid file, clear the input field and show the dialog
      e.target.value = ''; // Reset the input field
      setDialogMessage('Invalid file type. Only images (jpg, png, gif) and videos (mp4, mkv, avi) are allowed.');
      setOpenDialog(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!media || !caption || !date) {
      setDialogMessage('Please fill in all fields.');
      setOpenDialog(true);
      return;
    }

    const formData = new FormData();
    formData.append('media', media);
    formData.append('caption', caption);
    formData.append('date', date);
    formData.append('bookId', bookId); // Associate with the selected memory book

    setLoading(true);

    try {
      await axios.post(`http://localhost:5000/api/memory-books/${petId}/${bookId}/memories`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setLoading(false);
      navigate(`/memory-books/${petId}/${bookId}/memory-list`); // Redirect to the book's memory list
    } catch (err) {
      setLoading(false);
      setDialogMessage('Failed to add memory. Please try again later.');
      setOpenDialog(true);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  return (
    <div className="min-h-screen bg-fixed "
        style={{
          backgroundImage: `url(${backgroundImage})`, // Adjust the path to your image
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}>
    <div className="flex items-center justify-center py-20">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md border border-x-2 border-y-2 p-5">
        <h2 className="text-3xl font-bold text-center text-orange-700 mb-3">Add Memory</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Caption */}
          <div>
            <label className="block text-lg font-medium text-gray-700">Caption</label>
            <textarea
              value={caption}
              onChange={(e) => {
                const newCaption = e.target.value;

                if (newCaption.length <= 200) {
                  setCaption(newCaption);
                }
              }}
              required
              rows="4"
              maxLength="200"
              className="p-2.5 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
            />
            <p className="text-sm text-gray-500">{caption.length}/200</p>
          </div>



          {/* Date */}
          <div>
            <label className="block text-lg font-medium text-gray-700">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="p-2.5 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
            />
          </div>

          {/* Media (Image/Video) */}
          <div>
            <label className="block text-lg font-medium text-gray-700">Media (Image/Video)</label>
            <input
              type="file"
              onChange={handleFileChange}
              accept=".jpg,.jpeg,.png,.gif,.mp4,.mkv,.avi"
              className="p-2.5 w-full border border-gray-300 rounded-lg focus:outline-none"
            />

          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full p-2 bg-gradient-to-r from-teal-600 to-teal-800 hover:from-teal-500 hover:to-teal-700 text-white font-semibold rounded-lg transition duration-200"
            disabled={loading}
          >
            {loading ? 'Uploading...' : 'Add Memory'}
          </button>
        </form>

        {/* Error Dialog Box */}
        <Dialog open={openDialog} onClose={handleCloseDialog}>
          <DialogTitle className="text-black">Error</DialogTitle>
          <DialogContent>
            <Typography variant="body1" className="text-black">{dialogMessage}</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} color="primary" className="text-black">
              OK
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
    </div>
  );
};

export default AddMemory;
