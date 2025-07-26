import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import backgroundImage from "../assets/BgMemoryhd.jpg";

import {
  Fab,
  CircularProgress,
  Typography,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
} from '@mui/material';
import { Share as ShareIcon, Delete as DeleteIcon, Facebook as FacebookIcon, Twitter as TwitterIcon, WhatsApp as WhatsAppIcon } from '@mui/icons-material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AddIcon from '@mui/icons-material/Add';

const MemoryList = () => {
  const { petId } = useParams();
  const { bookId } = useParams();
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedMemory, setSelectedMemory] = useState(null);
  const [sharing, setSharing] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [bookToDelete, setBookToDelete] = useState(null);  // State for the delete confirmation dialog
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMemories = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/memory-books/${petId}/${bookId}/memories`);
        setMemories(response.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch memories');
      } finally {
        setLoading(false);
      }
    };

    fetchMemories();
  }, [bookId]);

  const handleMenuClick = (event, memory) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedMemory(memory);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setTimeout(() => setSharing(false), 0);
    setSelectedMemory(null);
  };

  const cancelDelete = () => {
    setOpenDeleteDialog(false); // Close the dialog without deleting
    setBookToDelete(null); // Reset the book to be deleted
  };

  const handleDelete = (memoryId) => {
    setBookToDelete(memoryId); // Set the memory ID to delete
    setOpenDeleteDialog(true); // Open the delete confirmation dialog
  };

  const confirmDelete = async () => {
    if (!bookToDelete) return; // Ensure there's a memory to delete
    try {
      await axios.delete(`http://localhost:5000/api/memory-books/${petId}/memories/${bookToDelete}`);
      setMemories(memories.filter((memory) => memory._id !== bookToDelete)); // Remove deleted memory from the list
      setOpenDeleteDialog(false); // Close the dialog
      setBookToDelete(null); // Reset the memory to delete
      toast.success('Memory deleted successfully'); // Show success toast
    } catch (err) {
      console.error('Failed to delete memory:', err);
      toast.error('Failed to delete memory'); // Show error toast
    }
  };


  const handleShare = () => {
    setSharing(true);
  };

  const handleCreateMemoryBook = () => {
    navigate(`/memory-books/${petId}/${bookId}/memories`);
  };

  const shareOnPlatform = (platform) => {
    const url = encodeURIComponent(`http://localhost:3000/memory-books/${petId}/${bookId}/memories/${selectedMemory._id}`);
    const text = encodeURIComponent(`Check out this memory: ${selectedMemory.caption}`);
    let shareUrl = '';

    if (platform === 'twitter') {
      shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
    } else if (platform === 'whatsapp') {
      shareUrl = `https://wa.me/?text=${text} ${url}`;
    } else if (platform === 'facebook') {
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    }

    window.open(shareUrl, '_blank');
    handleMenuClose();
  };

  const getThumbnail = (media) => {
    if (!media) {
      return null; // Return null if no media exists
    }
  
    // Normalize the path to use forward slashes
     // Replace backslashes with forward slashes
  
    const fileExtension = media.split('.').pop().toLowerCase();
  
    if (fileExtension === 'mp4') {
      // Generate the correct thumbnail path
      const thumbnailPath = media.replace('.mp4', '.mp4.jpg');
      console.log('Normalized Thumbnail Path:', thumbnailPath);
      console.log('media Path:', media);  // Log the thumbnail path
  
      return (
        <div className="relative w-full h-full">
          {/* Video Thumbnail */}
          <img
            src={`http://localhost:5000/${thumbnailPath}`} // Use the correct thumbnail path
            alt="Video Thumbnail"
            className="absolute inset-0 w-full h-full object-cover" // Ensure correct thumbnail position
          />
          
          {/* Disabled Play Button in the center of the thumbnail */}
          <button
            className="absolute inset-0 flex items-center justify-center bg-gray-700 bg-opacity-50  w-full h-full"
          >
            <span className="text-white text-3xl">▶</span>
          </button>
        </div>
      );
    }
  
  
    if (['jpg', 'jpeg', 'png'].includes(fileExtension)) {
      return (
        <img
          src={`http://localhost:5000/${media}`}
          alt="Memory Thumbnail"
          className="w-full h-full object-fill"
        />
      );
    }
  
  
  

    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-200">
        <Typography variant="body2" className="text-gray-600">Unsupported Media</Typography>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <CircularProgress color="primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-fixed"
        style={{
          backgroundImage: `url(${backgroundImage})`, // Adjust the path to your image
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}>
    <div className="flex items-center justify-center py-14">
      <div className="w-full max-w-5xl bg-white rounded-lg border border-x-2 border-y-2 shadow-md p-8 my-5">
        <div className="flex justify-between items-center mb-6">
          <Typography variant="h4" className="text-3xl !font-bold text-center !text-orange-700 mb-6">
            Memories
          </Typography>
          <Tooltip title="Create Memory">
            <Fab
              color="black"
              aria-label="add"
              onClick={handleCreateMemoryBook}
            >
              <AddIcon />
            </Fab>
          </Tooltip>
        </div>
  
        {memories.length === 0 ? (
          <Typography variant="body1" className="text-gray-800 text-center">
            No memories found in this memory book.
          </Typography>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {memories.map((memory) => (
              <div
                key={memory._id}
                className="rounded-lg border border-x-2 border-y-2 shadow-md bg-white text-black cursor-pointer transition-transform duration-300 hover:shadow-xl hover:opacity-90 overflow-hidden"
              >
                <div
                  className="w-full h-48 relative"
                  onClick={() => navigate(`/memory-books/${petId}/${bookId}/memories/${memory._id}`)}
                >
                  {getThumbnail(memory.media)}
                </div>
                <div className="p-4 flex justify-between items-center">
                  <div>
                    <Typography
                      variant="h6"
                      className="!block !text-lg !font-bold !text-gray-700"
                    >
                      {memory.caption.length > 20 ? memory.caption.substring(0, 20) + '...' : memory.caption}
                    </Typography>
                  </div>
  
                  <div>
                    <IconButton onClick={(e) => handleMenuClick(e, memory)}>
                      <MoreVertIcon />
                    </IconButton>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
  
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
          {!sharing
            ? [
              <MenuItem key="share" onClick={handleShare}>
                <ListItemIcon>
                  <ShareIcon />
                </ListItemIcon>
                Share
              </MenuItem>,
              <MenuItem
                key="delete"
                onClick={() => {
                  handleDelete(selectedMemory._id);
                  handleMenuClose(); // Close menu
                }}
              >
                <ListItemIcon>
                  <DeleteIcon />
                </ListItemIcon>
                Delete
              </MenuItem>,
            ]
            : [
              <MenuItem key="facebook" onClick={() => shareOnPlatform('facebook')}>
                <ListItemIcon>
                  <FacebookIcon />
                </ListItemIcon>
                Facebook
              </MenuItem>,
              <MenuItem key="whatsapp" onClick={() => shareOnPlatform('whatsapp')}>
                <ListItemIcon>
                  <WhatsAppIcon />
                </ListItemIcon>
                WhatsApp
              </MenuItem>,
            ]}
        </Menu>
  
        {openDeleteDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
              <h3 className="text-2xl font-semibold text-red-600 mb-4 text-center mt-2">
                Confirm Deletion
              </h3>
              <p className="text-gray-700 text-center mb-6">
                Are you sure you want to delete this memory book? This action is
                <span className="font-semibold text-red-500"> irreversible </span>
                and will permanently delete the memory.
              </p>
              <div className="flex justify-around items-center">
                <button
                  className="px-6 py-3 bg-gray-300 text-gray-700 font-medium rounded-lg shadow-md hover:bg-gray-400 transition duration-200"
                  onClick={cancelDelete}
                >
                  Cancel
                </button>
                <button
                  className="px-6 py-3 bg-red-600 text-white font-medium rounded-lg shadow-md hover:bg-red-700 transition duration-200"
                  onClick={confirmDelete}
                >
                  Delete
                </button>
  
              </div>
            </div>
          </div>
        )}
  
        <div className="flex justify-end mt-6">
          <button
            className="px-6 py-2 font-semibold bg-gradient-to-r from-orange-400 to-orange-700 text-white rounded-lg hover:from-orange-500 hover:to-orange-800 transition duration-200 shadow-md"
            onClick={() => navigate(`/memory-books/${petId}`)}
          >
            Back to Memory Books
          </button>
        </div>
      </div>
    </div>
    </div>
  );
  
};

export default MemoryList;
