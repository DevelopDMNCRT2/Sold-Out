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
      include: { 
        ticketTiers: true, 
        orders: {
          include: {
            tickets: {
              include: {
                ticketTier: true
              }
            }
          },
          orderBy: { purchaseDate: 'desc' }
        }
      }
    });
    
    if (!event) return res.status(404).json({ error: 'Evento no encontrado' });
    
    // Mapear órdenes al formato plano esperado por el frontend administrador
    const mappedOrders = (event.orders || []).map(order => {
      const tierNames = [...new Set(order.tickets.map(t => t.ticketTier?.name || 'General'))];
      const ticketType = tierNames.join(', ');
      const qty = order.tickets.length;
      
      return {
        id: order.id,
        buyer: order.buyerName,
        email: order.buyerEmail,
        phone: order.buyerPhone,
        ticketType,
        qty,
        total: order.totalAmount,
        date: new Date(order.purchaseDate).toLocaleDateString('es-MX', {
          year: 'numeric', month: '2-digit', day: '2-digit',
          hour: '2-digit', minute: '2-digit'
        }),
        status: order.status
      };
    });

    res.json({
      ...event,
      orders: mappedOrders
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Actualizar un evento
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { tickets, ...eventData } = req.body;

    // 1. Actualizar datos básicos del evento
    const updatedEvent = await prisma.event.update({
      where: { id },
      data: eventData
    });

    // 2. Sincronizar localidades (ticketTiers)
    if (tickets && Array.isArray(tickets)) {
      const payloadTicketIds = tickets.filter(t => t.id).map(t => t.id);

      // A. Eliminar localidades borradas en frontend que no tengan boletos vendidos
      const tiersToDelete = await prisma.ticketTier.findMany({
        where: {
          eventId: id,
          id: { notIn: payloadTicketIds }
        },
        include: { _count: { select: { tickets: true } } }
      });

      for (const tier of tiersToDelete) {
        if (tier._count.tickets === 0) {
          await prisma.ticketTier.delete({
            where: { id: tier.id }
          });
        }
      }

      // B. Crear o actualizar las localidades
      for (const ticket of tickets) {
        if (ticket.id) {
          // Actualizar existente
          await prisma.ticketTier.update({
            where: { id: ticket.id },
            data: {
              name: ticket.name,
              price: Number(ticket.price),
              stock: Number(ticket.stock)
            }
          });
        } else {
          // Crear nuevo
          await prisma.ticketTier.create({
            data: {
              eventId: id,
              name: ticket.name,
              price: Number(ticket.price),
              stock: Number(ticket.stock)
            }
          });
        }
      }
    }

    // Retornar el evento actualizado con sus tiers
    const finalEvent = await prisma.event.findUnique({
      where: { id },
      include: { ticketTiers: true }
    });

    res.json(finalEvent);
  } catch (error) {
    console.error("Error al actualizar evento:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
