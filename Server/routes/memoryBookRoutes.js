import express from 'express';
import MemoryBook from '../models/MemoryBook.js'; 
import Memory from '../models/Memory.js'; // Ensure the extension is included for ES modules

const router = express.Router();

// Route to create a memory book
router.post('/create/:petId', async (req, res) => {
  try {
    const { name, petId } = req.body;

    if (!name || !petId) {
      return res.status(400).json({ error: 'Name and petId are required' });
    }

    // Create a new memory book with the petId
    const memoryBook = new MemoryBook({
      name,
      petId,
    });

    await memoryBook.save();
    res.status(201).json(memoryBook);
  } catch (err) {
    console.error('Error creating memory book:', err);
    res.status(500).json({ error: 'Failed to create memory book', details: err.message });
  }
});


// Route to get all memory books
router.get('/:petId', async (req, res) => {
  try {
    const { petId } = req.params;
    const memoryBooks = await MemoryBook.find({ petId }).populate('petId'); // Filter by petId
    res.status(200).json(memoryBooks);
  } catch (err) {
    console.error('Error fetching memory books:', err);
    res.status(500).json({ error: 'Failed to fetch memory books' });
  }
});


// Delete a memory book along with its associated memories
router.delete('/:id', async (req, res) => {
  try {
    const memoryBookId = req.params.id;

    // Step 1: Delete all memories associated with the memory book
    const deletedMemories = await Memory.deleteMany({ bookId: memoryBookId });

    if (deletedMemories.deletedCount === 0) {
      console.log('No memories found for this memory book');
    } else {
      console.log(`${deletedMemories.deletedCount} memories deleted`);
    }

    // Step 2: Delete the memory book itself
    const deletedMemoryBook = await MemoryBook.findByIdAndDelete(memoryBookId);

    if (!deletedMemoryBook) {
      return res.status(404).json({ error: 'Memory book not found' });
    }

    res.status(200).json({ message: 'Memory book and associated memories deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete memory book and memories' });
  }
});


// Rename a memory book
router.put('/:id', async (req, res) => {
  try {
    const { name, petId } = req.body;

    // Update only the name and optionally the petId
    const book = await MemoryBook.findByIdAndUpdate(
      req.params.id,
      { name, petId }, // You can optionally update the petId here as well
      { new: true }
    );

    if (!book) {
      return res.status(404).json({ error: 'Memory book not found' });
    }

    res.status(200).json(book);
  } catch (err) {
    res.status(500).json({ error: 'Failed to rename memory book' });
  }
});

router.post('/checkName', async (req, res) => {
  try {
    const { name } = req.body;
    const exists = await MemoryBook.exists({ name });
    res.status(200).json({ exists: !!exists });
  } catch (err) {
    res.status(500).json({ error: 'Failed to check name uniqueness' });
  }
});


// Export the router
export default router;
