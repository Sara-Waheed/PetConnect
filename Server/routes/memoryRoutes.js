import express from 'express';
import Memory from '../models/Memory.js'; // Ensure the extension is included for ES modules
import upload from '../config/multer.js'; // Multer configuration
import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';

const __dirname = path.resolve();
const router = express.Router();

// Helper function to generate video thumbnails
// Helper function to generate video thumbnails
function generateThumbnail(videoPath, thumbnailPath) {
  return new Promise((resolve, reject) => {
    console.log('Generating thumbnail for video:', videoPath);
    console.log('Thumbnail will be saved to:', thumbnailPath);

    // Ensure the directory for the uploads folder exists
    const uploadDir = path.dirname(thumbnailPath);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true }); // Ensure the folder exists
    }

    ffmpeg(videoPath)
      .screenshots({
        count: 1,
        folder: uploadDir, // Save directly in the uploads folder (not in a 'thumbnails' folder)
        filename: path.basename(thumbnailPath),
        size: '320x240',
      })
      .on('end', () => {
        console.log('Thumbnail generation complete:', thumbnailPath);
        resolve(thumbnailPath); // Return the thumbnail path
      })
      .on('error', (err) => {
        console.error('Error generating thumbnail:', err);
        reject(err);
      });
  });
}

// Route to add a new memory to a memory book
router.post('/:petId/:bookId/memories', upload.single('media'), async (req, res) => {
  try {
    const { caption, date } = req.body;
    const mediaPath = req.file ? req.file.path : ''; // Path of the uploaded media

    let thumbnailPath = '';
    if (req.file && req.file.mimetype.startsWith('video/')) {
      const videoPath = path.join(__dirname, req.file.path);
      const thumbnailFolder = path.join(__dirname, 'uploads'); // Directly use 'uploads' folder, not 'thumbnails'
      thumbnailPath = path.join(thumbnailFolder, path.basename(videoPath) + '.jpg'); // Save thumbnail with .jpg extension

      await generateThumbnail(videoPath, thumbnailPath);
    }

    const memory = new Memory({
      bookId: req.params.bookId,
      caption,
      date,
      media: mediaPath,
      thumbnail: thumbnailPath ? `/uploads/${path.basename(thumbnailPath)}` : '', // Use the correct path for the thumbnail
    });

    await memory.save();
    res.status(201).json(memory);
  } catch (err) {
    console.error('Error adding memory:', err);
    res.status(500).json({ error: 'Failed to add memory', details: err.message });
  }
});

// Route to edit a memory
router.put('/:petId/:bookId/memories/:memoryId', upload.single('media'), async (req, res) => {
  const { caption, date } = req.body;
  const { bookId, memoryId } = req.params;

  try {
    const memory = await Memory.findOne({ _id: memoryId, bookId });

    if (!memory) {
      return res.status(404).json({ error: 'Memory not found' });
    }

    if (caption) memory.caption = caption;
    if (date) memory.date = date;

    if (req.file) {
      memory.media = req.file.path;

      if (req.file.mimetype.startsWith('video/')) {
        const videoPath = path.join(__dirname, req.file.path);
        const thumbnailFolder = path.join(__dirname, 'uploads'); // Save directly in 'uploads' folder
        const thumbnailPath = path.join(thumbnailFolder, path.basename(videoPath) + '.jpg'); // Add .jpg extension

        await generateThumbnail(videoPath, thumbnailPath);
        memory.thumbnail = `/uploads/${path.basename(thumbnailPath)}`; // Use the path directly under 'uploads'
      }
    }

    const updatedMemory = await memory.save();
    res.status(200).json(updatedMemory);
  } catch (err) {
    console.error('Error updating memory:', err);
    res.status(500).json({ error: 'Failed to update memory', details: err.message });
  }
});


// Route to get all memories for a specific memory book
router.get('/:petId/:bookId/memories', async (req, res) => {
  try {
    const memories = await Memory.find({ bookId: req.params.bookId });
    res.status(200).json(memories);
  } catch (err) {
    console.error('Error fetching memories:', err);
    res.status(500).json({ error: 'Failed to fetch memories' });
  }
});

// Route to delete a memory
router.delete('/:petId/memories/:id', async (req, res) => {
  try {
    const memoryId = req.params.id;
    const deletedMemory = await Memory.findByIdAndDelete(memoryId);

    if (!deletedMemory) {
      return res.status(404).json({ error: 'Memory not found' });
    }

    res.status(200).json({ message: 'Memory deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete memory' });
  }
});

// Route to fetch a specific memory by bookId and memoryId
router.get('/:petId/:bookId/memories/:memoryId', async (req, res) => {
  const {bookId, memoryId } = req.params;

  try {
    const memory = await Memory.findOne({ _id: memoryId, bookId});
    if (!memory) {
      return res.status(404).json({ error: 'Memory not found' });
    }
    res.status(200).json(memory);
  } catch (err) {
    console.error('Error fetching memory:', err);
    res.status(500).json({ error: 'Failed to fetch memory' });
  }
});

export default router;



// const express = require('express');
// const multer = require('multer');
// const ffmpeg = require('fluent-ffmpeg');
// const path = require('path');
// const fs = require('fs');
// const Memory = require('../models/Memory'); // Replace with your actual Memory model
// const router = express.Router();

// // Multer Setup for file uploads
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const uploadPath = path.join(__dirname, '..', 'uploads'); // Your media files directory
//     if (!fs.existsSync(uploadPath)) {
//       fs.mkdirSync(uploadPath, { recursive: true });
//     }
//     cb(null, uploadPath);
//   },
//   filename: (req, file, cb) => {
//     const fileExtension = path.extname(file.originalname);
//     const filename = `${Date.now()}${fileExtension}`;
//     cb(null, filename);
//   }
// });

// const upload = multer({ storage });

// // Route to add a new memory with an optional thumbnail (POST)
// router.post('/:bookId/memories', upload.fields([{ name: 'media' }, { name: 'thumbnail' }]), async (req, res) => {
//   try {
//     const { caption, description, date } = req.body;
//     const mediaPath = req.files.media ? req.files.media[0].path : ''; // Path of the uploaded media
//     let thumbnailPath = req.files.thumbnail ? req.files.thumbnail[0].path : ''; // Path of the uploaded thumbnail

//     // If no thumbnail is uploaded and the media is a video, generate a thumbnail
//     if (!thumbnailPath && mediaPath) {
//       const ext = path.extname(mediaPath).toLowerCase();
//       if (ext === '.mp4' || ext === '.mov' || ext === '.avi') {
//         // Generate thumbnail from video
//         const thumbnailDir = path.join(__dirname, '..', 'thumbnails');
//         if (!fs.existsSync(thumbnailDir)) {
//           fs.mkdirSync(thumbnailDir);
//         }

//         const thumbnailFile = path.join(thumbnailDir, `${Date.now()}.png`);

//         // Wait for the thumbnail to be generated
//         await new Promise((resolve, reject) => {
//           ffmpeg(mediaPath)
//             .on('end', () => {
//               console.log('Thumbnail generated');
//               thumbnailPath = thumbnailFile; // Update thumbnail path once generated
//               resolve();
//             })
//             .on('error', (err) => {
//               console.error('Error generating thumbnail:', err);
//               reject(err);
//             })
//             .screenshots({
//               count: 1,
//               folder: thumbnailDir,
//               filename: `${Date.now()}.png`,
//               size: '320x240',
//             });
//         });
//       }
//     }

//     // Create a new memory document
//     const memory = new Memory({
//       bookId: req.params.bookId, // Link the memory to the book
//       caption,
//       description,
//       date,
//       media: mediaPath, // Save the media path
//       thumbnail: thumbnailPath, // Save the thumbnail path
//     });

//     await memory.save();
//     res.status(201).json(memory); // Respond with the created memory
//   } catch (err) {
//     console.error('Error adding memory:', err);
//     res.status(500).json({ error: 'Failed to add memory', details: err.message });
//   }
// });

// // Route to update a memory with an optional new thumbnail (PUT)
// router.put('/:bookId/memories/:memoryId', upload.fields([{ name: 'media' }, { name: 'thumbnail' }]), async (req, res) => {
//   const { caption, description, date } = req.body;
//   const { bookId, memoryId } = req.params;

//   try {
//     const memory = await Memory.findOne({ _id: memoryId, bookId });

//     if (!memory) {
//       return res.status(404).json({ error: 'Memory not found' });
//     }

//     // Update fields
//     if (caption) memory.caption = caption;
//     if (description) memory.description = description;
//     if (date) memory.date = date;

//     // Update media if a new file is uploaded
//     if (req.files.media) {
//       memory.media = req.files.media[0].path; // Update with the new media path
//     }

//     // Update thumbnail if a new file is uploaded
//     if (req.files.thumbnail) {
//       memory.thumbnail = req.files.thumbnail[0].path; // Update with the new thumbnail path
//     } else if (!req.files.thumbnail && memory.media) {
//       // Generate thumbnail for video if no new thumbnail is uploaded
//       const ext = path.extname(memory.media).toLowerCase();
//       if (ext === '.mp4' || ext === '.mov' || ext === '.avi') {
//         const thumbnailDir = path.join(__dirname, '..', 'thumbnails');
//         if (!fs.existsSync(thumbnailDir)) {
//           fs.mkdirSync(thumbnailDir);
//         }

//         const thumbnailFile = path.join(thumbnailDir, `${Date.now()}.png`);

//         // Wait for the thumbnail to be generated
//         await new Promise((resolve, reject) => {
//           ffmpeg(memory.media)
//             .on('end', () => {
//               console.log('Thumbnail generated');
//               memory.thumbnail = thumbnailFile; // Update thumbnail path once generated
//               resolve();
//             })
//             .on('error', (err) => {
//               console.error('Error generating thumbnail:', err);
//               reject(err);
//             })
//             .screenshots({
//               count: 1,
//               folder: thumbnailDir,
//               filename: `${Date.now()}.png`,
//               size: '320x240',
//             });
//         });
//       }
//     }

//     // Save the updated memory document
//     const updatedMemory = await memory.save();
//     res.status(200).json(updatedMemory); // Respond with the updated memory
//   } catch (err) {
//     console.error('Error updating memory:', err);
//     res.status(500).json({ error: 'Failed to update memory', details: err.message });
//   }
// });

// // Serve static files for thumbnails
// router.use('/thumbnails', express.static(path.join(__dirname, '..', 'thumbnails')));




