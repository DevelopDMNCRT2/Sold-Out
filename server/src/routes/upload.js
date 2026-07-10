import express from 'express';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

router.post('/', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se subió ninguna imagen' });
    }
    res.json({ url: req.file.path });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
