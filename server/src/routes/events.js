import express from 'express';
import { prisma } from '../config/prisma.js';

const router = express.Router();

// Obtener todos los eventos
router.get('/', async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      orderBy: { createdAt: 'desc' },
      include: { ticketTiers: true }
    });
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear un evento
router.post('/', async (req, res) => {
  try {
    const { tickets, ...eventData } = req.body;
    
    let id;
    let exists = true;
    while (exists) {
      id = Math.floor(1000 + Math.random() * 9000).toString();
      const count = await prisma.event.count({ where: { id } });
      if (count === 0) exists = false;
    }

    const event = await prisma.event.create({
      data: {
        id,
        ...eventData,
        ticketTiers: {
          create: tickets || []
        }
      },
      include: { ticketTiers: true }
    });
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener un evento por ID
router.get('/:id', async (req, res) => {
  try {
    const event = await prisma.event.findUnique({
      where: { id: req.params.id },
      include: { ticketTiers: true, orders: true }
    });
    if (!event) return res.status(404).json({ error: 'Evento no encontrado' });
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
