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

    const eventsWithExactSold = await Promise.all(events.map(async (event) => {
      const ticketTiers = await Promise.all((event.ticketTiers || []).map(async (tier) => {
        const count = await prisma.ticket.count({
          where: {
            ticketTierId: tier.id,
            order: {
              status: { in: ['Pagado', 'Completado', 'Aprobado'] }
            }
          }
        });
        return {
          ...tier,
          sold: count
        };
      }));

      return {
        ...event,
        ticketTiers
      };
    }));

    res.json(eventsWithExactSold);
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

    const scannerPin = eventData.scannerPin || Math.floor(100000 + Math.random() * 900000).toString();

    const event = await prisma.event.create({
      data: {
        id,
        scannerPin,
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

// Obtener estadísticas del dashboard
router.get('/dashboard/stats', async (req, res) => {
  try {
    // 1. Ingresos Totales
    const orders = await prisma.order.findMany({
      where: { status: 'Pagado' }
    });
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

    // 2. Boletos Vendidos
    const totalTickets = await prisma.ticket.count({
      where: { order: { status: 'Pagado' } }
    });

    // 3. Eventos Activos
    const activeEvents = await prisma.event.count({
      where: { status: 'Publicado' }
    });

    // 4. Clientes
    const totalCustomers = await prisma.customer.count();

    // 5. Top Eventos
    const events = await prisma.event.findMany({
      include: {
        orders: {
          where: { status: 'Pagado' },
          include: { tickets: true }
        }
      }
    });

    const mappedEvents = events.map(e => {
      const ticketsCount = e.orders.reduce((sum, o) => sum + o.tickets.length, 0);
      const incomeVal = e.orders.reduce((sum, o) => sum + o.totalAmount, 0);
      return {
        name: e.name,
        tickets: ticketsCount,
        income: `$${incomeVal.toLocaleString('es-MX')}`
      };
    });

    const topEvents = mappedEvents
      .sort((a, b) => b.tickets - a.tickets)
      .slice(0, 5);

    // 6. Datos de la gráfica por mes del año actual
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const chartTickets = Array(12).fill(0);
    const chartIncome = Array(12).fill(0);
    
    const currentYear = new Date().getFullYear();
    const allOrders = await prisma.order.findMany({
      where: {
        status: 'Pagado',
        purchaseDate: {
          gte: new Date(`${currentYear}-01-01T00:00:00.000Z`),
          lte: new Date(`${currentYear}-12-31T23:59:59.999Z`)
        }
      },
      include: { tickets: true }
    });

    for (const order of allOrders) {
      const monthIndex = new Date(order.purchaseDate).getMonth();
      chartTickets[monthIndex] += order.tickets.length;
      chartIncome[monthIndex] += Math.round(order.totalAmount);
    }

    res.json({
      totalRevenue: `$${Math.round(totalRevenue).toLocaleString('es-MX')}`,
      totalTickets: totalTickets.toLocaleString('es-MX'),
      activeEvents: activeEvents.toLocaleString('es-MX'),
      totalCustomers: totalCustomers.toLocaleString('es-MX'),
      topEvents,
      chartData: {
        categories: months,
        tickets: chartTickets,
        income: chartIncome
      }
    });
  } catch (error) {
    console.error("Error al obtener estadísticas del dashboard:", error);
    res.status(500).json({ error: error.message });
  }
});

// Obtener un evento por ID
router.get('/:id', async (req, res) => {
  try {
    let event = await prisma.event.findUnique({
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

    // Si no tiene PIN generado, crearlo sobre la marcha
    if (!event.scannerPin) {
      const newPin = Math.floor(100000 + Math.random() * 900000).toString();
      event = await prisma.event.update({
        where: { id: event.id },
        data: { scannerPin: newPin },
        include: {
          ticketTiers: true,
          orders: {
            include: {
              tickets: {
                include: { ticketTier: true }
              }
            },
            orderBy: { purchaseDate: 'desc' }
          }
        }
      });
    }
    
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

    // Recalcular el conteo exacto de boletos vendidos por cada localidad
    const ticketTiersWithExactSold = await Promise.all((event.ticketTiers || []).map(async tier => {
      const count = await prisma.ticket.count({
        where: {
          ticketTierId: tier.id,
          order: {
            status: { in: ['Pagado', 'Completado', 'Aprobado'] }
          }
        }
      });
      return {
        ...tier,
        sold: count
      };
    }));

    res.json({
      ...event,
      ticketTiers: ticketTiersWithExactSold,
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
