import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Typography } from '@mui/material';
import backgroundImage from "../assets/BgMemoryhd.jpg";

const CreateMemoryBook = () => {
  const [memoryBookName, setMemoryBookName] = useState('');
  const [openDialog, setOpenDialog] = useState(false); // Manage the dialog's open state
  const [dialogMessage, setDialogMessage] = useState(''); // Store the error message
  const navigate = useNavigate();
  const { petId } = useParams(); // Get petId from URL params

  const handleCreateMemoryBook = async (event) => {
    event.preventDefault();
  
    if (!memoryBookName.trim()) {
      setDialogMessage('Memory book name is required!');
      setOpenDialog(true);
      return;
    }
  
    try {
      // Check if a memory book with the same name already exists
      const checkResponse = await axios.post('http://localhost:5000/api/memory-books/checkName', { name: memoryBookName });
  
      if (checkResponse.data.exists) {
        setDialogMessage('A memory book with this name already exists!');
        setOpenDialog(true);
        return;
      }
  
      // If no existing memory book, proceed to create
      const formData = { 
        name: memoryBookName,
        petId: petId // Include the petId from URL in the request payload
      };
  
      const response = await axios.post(`http://localhost:5000/api/memory-books/create/${petId}`, formData);
  
      if (response.status === 201) {
        toast.success('Memory book created successfully!');
        // Redirect to the memory books list page
        navigate(`/memory-books/${petId}`);
      } else {
        setDialogMessage(response.data.error || 'Failed to create memory book');
        setOpenDialog(true);
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || 'Error creating memory book. Please try again.';
      setDialogMessage(errorMessage);
      setOpenDialog(true);
    }
  };
  
  const handleCloseDialog = () => {
    setOpenDialog(false); // Close the dialog when the user clicks "OK"
  };

  return (
    <div className="min-h-screen bg-fixed"
        style={{
          backgroundImage: `url(${backgroundImage})`, // Adjust the path to your image
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}>
    <div className=" flex items-center justify-center py-36">
      <div className="w-full max-w-md bg-white rounded-lg border border-x-2 border-y-2 shadow-md p-8">
        <h2 className="text-3xl font-bold text-center text-orange-700 mb-6">Create Memory Book</h2>
        <form onSubmit={handleCreateMemoryBook} className="space-y-6">
          {/* Memory Book Name */}
          <div>
            <label className="block text-lg font-medium text-gray-700">Memory Book Name</label>
            <input
              type="text"
              value={memoryBookName}
              onChange={(e) => setMemoryBookName(e.target.value)}
              required
              className="mt-2 p-2.5 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full p-2 bg-gradient-to-r from-teal-600 to-teal-800 hover:from-teal-500 hover:to-teal-700 text-white font-semibold rounded-lg hover:bg-gray-900 transition duration-200"
          >
            Create
          </button>
        </form>

        {/* Error Dialog Box */}
        <Dialog open={openDialog} onClose={handleCloseDialog}>
          <DialogTitle className="text-red-700 font-bold">Already Exists!</DialogTitle>
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

export default CreateMemoryBook;

