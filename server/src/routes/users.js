import express from 'express';
import { prisma } from '../config/prisma.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Crear usuario
router.post('/', async (req, res) => {
  try {
    const { name, email, role, password } = req.body;
    const user = await prisma.user.create({
      data: { name, email, role, password } // In a real app, hash the password
    });
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Editar usuario
router.put('/:id', async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { name, email, role }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Borrar usuario
router.delete('/:id', async (req, res) => {
  try {
    await prisma.user.delete({
      where: { id: req.params.id }
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
