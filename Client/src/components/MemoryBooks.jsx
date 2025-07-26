import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import backgroundImage from "../assets/BgMemoryhd.jpg";

import {
  Fab,
  CircularProgress,
  Typography,
  Tooltip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ShareIcon from '@mui/icons-material/Share';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';


// Import react-toastify components
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MemoryBooks = () => {
  const [memoryBooks, setMemoryBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  const [sharing, setSharing] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false); // State for Delete Confirmation
  const [bookToDelete, setBookToDelete] = useState(null);
  const [newBookName, setNewBookName] = useState('');
  const [openRenameDialog, setOpenRenameDialog] = useState(false);
   // State to store the book to be deleted
  const navigate = useNavigate();
  const { petId } = useParams();

  useEffect(() => {
    const fetchMemoryBooks = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/memory-books/${petId}`);
        setMemoryBooks(response.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch memory books');
        toast.error('Failed to fetch memory books'); // Show toast notification on error
      } finally {
        setLoading(false);
      }
    };

    fetchMemoryBooks();
  }, [petId]);

  const handleMenuClick = (event, book) => {
    event.stopPropagation(); // Prevent navigation when the menu is clicked
    setAnchorEl(event.currentTarget);
    setSelectedBook(book);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSharing(false);
  };

  const handleRename = () => {
    setOpenRenameDialog(true); // Open rename dialog
    handleMenuClose();
  };

  const handleRenameSubmit = async () => {
    try {
      // Check if the new name already exists and is not the same as the current name of the selected book
      const nameExists = memoryBooks.some((book) => 
        book.name.toLowerCase() === newBookName.toLowerCase() && book._id !== selectedBook._id
      );
  
      if (nameExists) {
        toast.error('A memory book with this name already exists');
        return;
      }
  
      // Rename the memory book
      await axios.put(`http://localhost:5000/api/memory-books/${selectedBook._id}`, { name: newBookName });
      setMemoryBooks(memoryBooks.map((book) =>
        book._id === selectedBook._id ? { ...book, name: newBookName } : book
      ));
      setOpenRenameDialog(false);
      toast.success('Memory Book renamed successfully');
    } catch (err) {
      toast.error('Failed to rename memory book');
    }
  };
  
  const cancelRename = () => {
    setOpenRenameDialog(false);
    setNewBookName('');
  };
  const handleDelete = (bookId) => {
    setBookToDelete(bookId); // Store the book to be deleted
    setOpenDeleteDialog(true); // Open the delete confirmation dialog
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/memory-books/${bookToDelete}`);
      setMemoryBooks(memoryBooks.filter((book) => book._id !== bookToDelete));
      setOpenDeleteDialog(false); // Close the dialog
      handleMenuClose(); // Close the menu
      toast.success('Memory Book deleted successfully'); // Show success toast
    } catch (err) {
      console.error('Failed to delete memory book:', err);
      toast.error('Failed to delete memory book'); // Show error toast
    }
  };

  const cancelDelete = () => {
    setOpenDeleteDialog(false); // Close the dialog without deleting
    setBookToDelete(null); // Reset the book to be deleted
  };

  const handleAddMemory = () => {
    navigate(`/memory-books/${petId}/${selectedBook._id}/memories`);
    handleMenuClose();
  };

  const handleCreateMemoryBook = () => {
    navigate(`/memory-books/create/${petId}`);
  };

  const handleShare = () => {
    setSharing(true);
  };

  const shareOnPlatform = (platform) => {
    const url = encodeURIComponent(`http://localhost:3000/memory-books/${petId}/${selectedBook._id}`);
    const text = encodeURIComponent(`Check out this amazing Memory Book: ${selectedBook.name}`);
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

  const handleMemoryBookClick = (bookId) => {
    navigate(`/memory-books/${petId}/${bookId}/memory-list`);
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
            Memory Books
          </Typography>
          <Tooltip title="Create Memory Book">
            <Fab
              color="black"
              aria-label="add"
              onClick={handleCreateMemoryBook}
            >
              <AddIcon />
            </Fab>
          </Tooltip>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"> {/* 3-column grid */}
          {memoryBooks.length === 0 ? (
            <Typography variant="body1" className="text-center col-span-3">
              No memory books available. Click the "+" button to create your first memory book!
            </Typography>
          ) : (
            memoryBooks.map((book) => (
              <div
                key={book._id}
                className="flex items-center justify-between p-4 border bg-slate-200 rounded-lg cursor-pointer hover:bg-slate-300 transition-colors duration-200"
                onClick={() => handleMemoryBookClick(book._id)} // Navigate on box click
              >
                <Typography variant="body1" className="!block !text-lg !font-medium !text-gray-700">
                  {book.name}
                </Typography>
                <IconButton onClick={(e) => handleMenuClick(e, book)}>
                  <MoreVertIcon />
                </IconButton>
              </div>
            ))
          )}
        </div>
        <div className="flex justify-end mt-6">
          <button
            className="px-6 py-2 font-semibold bg-gradient-to-r from-orange-400 to-orange-700 text-white rounded-lg hover:from-orange-500 hover:to-orange-800 transition duration-200 shadow-md"
            onClick={() => navigate(`/myPets/${petId}`)}
          >
            Back to Pet Profile
          </button>
        </div>
      </div>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {!sharing ? (
          [
            <MenuItem
              key="add-memory"
              onClick={() => {
                handleAddMemory();
                handleMenuClose(); // Close menu
              }}
            >
              <ListItemIcon>
                <AddIcon />
              </ListItemIcon>
              Add Memory
            </MenuItem>,
            <MenuItem
              key="delete"
              onClick={() => {
                handleDelete(selectedBook._id);
                handleMenuClose(); // Close menu
              }}
            >
              <ListItemIcon>
                <DeleteIcon />
              </ListItemIcon>
              Delete
            </MenuItem>,
            <MenuItem key="rename" onClick={handleRename}>
            <ListItemIcon>
              <EditIcon />
            </ListItemIcon>
            Rename
          </MenuItem>,
          ]
        ) : (
          [
            <MenuItem key="facebook" onClick={() => shareOnPlatform('facebook')}>
              <ListItemIcon>
                <FacebookIcon />
              </ListItemIcon>
              Facebook
            </MenuItem>,
            <MenuItem key="twitter" onClick={() => shareOnPlatform('twitter')}>
              <ListItemIcon>
                <TwitterIcon />
              </ListItemIcon>
              Twitter
            </MenuItem>,
            <MenuItem key="whatsapp" onClick={() => shareOnPlatform('whatsapp')}>
              <ListItemIcon>
                <WhatsAppIcon />
              </ListItemIcon>
              WhatsApp
            </MenuItem>,
          ]
        )}
      </Menu>
  
      {/* Custom Confirmation Dialog */}
      {openDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <h3 className="text-2xl font-semibold text-red-600 mb-4 text-center mt-2">
              Confirm Deletion
            </h3>
            <p className="text-gray-700 text-center mb-6">
              Are you sure you want to delete this memory book? This action is
              <span className="font-semibold text-red-500"> irreversible </span>
              and will delete all data associated with the memory book.
            </p>
            <div className="flex justify-around items-center">
              <button
                onClick={cancelDelete}
                className="px-6 py-3 bg-gray-300 text-gray-700 font-medium rounded-lg shadow-md hover:bg-gray-400 transition duration-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-6 py-3 bg-red-600 text-white font-medium rounded-lg shadow-md hover:bg-red-700 transition duration-200"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
        {/* Rename Dialog */}
      {openRenameDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <h3 className="text-2xl font-semibold text-orange-600 mb-4 text-center">Rename Memory Book</h3>
            <input
              type="text"
              value={newBookName}
              onChange={(e) => setNewBookName(e.target.value)}
              placeholder="Enter new name"
              className="w-full p-2 border rounded-lg mb-4"
            />
            <div className="flex justify-around items-center">
              <button
                onClick={cancelRename}
                className="px-6 py-3 bg-gray-300 text-gray-700 font-medium rounded-lg shadow-md hover:bg-gray-400 transition duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleRenameSubmit}
                className="px-6 py-3 bg-orange-600 text-white font-medium rounded-lg shadow-md hover:bg-orange-700 transition duration-200"
              >
                Rename
              </button>
              
            </div>
          </div>
        </div>
      )}
      
  
      <ToastContainer />
    </div>
    </div>
  );
}
  export default MemoryBooks;  