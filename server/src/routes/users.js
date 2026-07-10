import express from 'express';
import { prisma } from '../config/prisma.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

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
    
    let id;
    let exists = true;
    while (exists) {
      id = Math.floor(1000 + Math.random() * 9000).toString();
      const count = await prisma.user.count({ where: { id } });
      if (count === 0) exists = false;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { id, name, email, role, password: hashedPassword }
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

// Login de Administrador/Staff
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // Opcional: si queremos permitir entrar con texto plano temporalmente por contraseñas viejas
      // if (password !== user.password) return res.status(401).json({ error: 'Contraseña incorrecta.' });
      return res.status(401).json({ error: 'Contraseña incorrecta.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'supersecretjwtkey',
      { expiresIn: '30d' }
    );

    res.json({ 
      message: 'Inicio de sesión exitoso', 
      token, 
      user: { id: user.id, name: user.name, email: user.email, role: user.role } 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
