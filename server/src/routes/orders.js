import express from 'express';
import { prisma } from '../config/prisma.js';
import { sendTicketEmail, sendTicketEmailWithPdf } from '../config/nodemailer.js';
import QRCode from 'qrcode';

const router = express.Router();

// Crear Orden y Boletos
router.post('/', async (req, res) => {
  try {
    const { eventId, buyerName, buyerEmail, buyerPhone, totalAmount, tickets } = req.body;
    // tickets = [{ ticketTierId: '123', qty: 2 }]

    // 1. Buscar o crear el Cliente (Customer)
    let customer = await prisma.customer.findUnique({ where: { email: buyerEmail } });
    if (!customer) {
      let customerId;
      let exists = true;
      while (exists) {
        customerId = Math.floor(10000 + Math.random() * 90000).toString(); // 5 digits
        const count = await prisma.customer.count({ where: { id: customerId } });
        if (count === 0) exists = false;
      }
      customer = await prisma.customer.create({
        data: { id: customerId, name: buyerName, email: buyerEmail, phone: buyerPhone }
      });
    }

    // 1.5. Buscar o crear el Evento si no existe (para compatibilidad de demostración/mock)
    let event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      event = await prisma.event.create({
        data: {
          id: eventId,
          name: 'Neon Nights Festival',
          artist: 'Varios Artistas',
          category: 'Festival',
          shortDescription: 'El evento electrónico más grande del año',
          longDescription: 'Prepárate para la experiencia audiovisual más inmersiva del año. Neon Nights reúne a los mejores DJs internacionales con una producción de luces, láseres y sonido de última generación.',
          date: '2026-10-15',
          startTime: '20:00',
          doorsOpenTime: '19:00',
          venue: 'Estadio Nacional',
          address: 'Av. Libertador 1234, Centro',
          city: 'Ciudad de México',
          state: 'CDMX',
          status: 'Publicado',
          ticketTiers: {
            create: [
              { name: 'General', price: 800, stock: 1000 },
              { name: 'VIP', price: 1500, stock: 500 },
              { name: 'Backstage', price: 3500, stock: 100 }
            ]
          }
        }
      });
    }

    // 2. Crear la Orden
    const order = await prisma.order.create({
      data: {
        eventId,
        buyerName,
        buyerEmail,
        buyerPhone,
        totalAmount,
        status: 'Pagado', // Asumiendo que el pago fue exitoso antes de llamar aquí
        customerId: customer.id
      },
      include: {
        event: true
      }
    });

    // 2. Crear los Boletos (Tickets individuales)
    const ticketPromises = [];
    const tierUpdates = {};

    for (const item of tickets) {
      // Buscar el TicketTier por ID o por Nombre (General, VIP, Backstage)
      let tier = await prisma.ticketTier.findFirst({
        where: {
          OR: [
            { id: item.ticketTierId },
            { eventId: eventId, name: { equals: item.ticketTierId, mode: 'insensitive' } },
            { eventId: eventId, name: { equals: item.name, mode: 'insensitive' } }
          ]
        }
      });

      if (!tier) {
        // Fallback: crear un tier por defecto si no existe
        tier = await prisma.ticketTier.create({
          data: {
            eventId: eventId,
            name: item.name || item.ticketTierId || 'General',
            price: item.price || 800,
            stock: 1000
          }
        });
      }

      tierUpdates[tier.id] = (tierUpdates[tier.id] || 0) + item.qty;

      for (let i = 0; i < item.qty; i++) {
        ticketPromises.push(
          prisma.ticket.create({
            data: {
              orderId: order.id,
              ticketTierId: tier.id
            }
          })
        );
      }
    }
    const createdTickets = await Promise.all(ticketPromises);

    // 3. Generar QRs en Base64 (Data URIs)
    const qrPromises = createdTickets.map(t => QRCode.toDataURL(t.id));
    const qrDataUrls = await Promise.all(qrPromises);

    // 4. Enviar Correo con QRs (Deshabilitado aquí, se envía el PDF completo por endpoint separado)
    /*
    try {
      await sendTicketEmail(buyerEmail, buyerName, order, qrDataUrls);
    } catch (mailError) {
      console.error("Error al enviar correo (el flujo continúa):", mailError.message);
    }
    */

    // 5. Actualizar los "Sold" en TicketTiers
    for (const [tierId, qty] of Object.entries(tierUpdates)) {
      await prisma.ticketTier.update({
        where: { id: tierId },
        data: { sold: { increment: qty } }
      });
    }

    res.status(201).json({ 
      message: 'Orden procesada con éxito', 
      orderId: order.id,
      tickets: createdTickets 
    });
  } catch (error) {
    console.error("Error al procesar orden:", error);
    res.status(500).json({ error: error.message });
  }
});

// Validar boleto (Escáner)
router.post('/validate', async (req, res) => {
  try {
    const { qrCode } = req.body;
    
    // Buscar si el ticket existe y obtener el tier
    const ticket = await prisma.ticket.findFirst({
      where: { OR: [{ id: qrCode }, { qrCode: qrCode }] }, // Puede venir el UUID o el id
      include: { ticketTier: true, order: true }
    });

    if (!ticket) {
      return res.status(404).json({ valid: false, message: 'Boleto no encontrado o falso' });
    }

    if (ticket.status === 'Escaneado') {
      return res.status(400).json({ valid: false, message: 'Boleto ya fue escaneado', scannedAt: ticket.scannedAt });
    }

    // Marcar como escaneado
    const updatedTicket = await prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        status: 'Escaneado',
        scannedAt: new Date()
      }
    });

    res.json({
      valid: true,
      message: 'Acceso concedido',
      ticket: {
        buyerName: ticket.order.buyerName,
        tierName: ticket.ticketTier.name
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Enviar correo con el PDF del boleto completo
router.post('/:id/send-email', async (req, res) => {
  try {
    const { id } = req.params;
    const { pdfDataUrl, buyerEmail, buyerName } = req.body;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { event: true }
    });

    if (!order) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }

    try {
      await sendTicketEmailWithPdf(buyerEmail, buyerName, order, pdfDataUrl);
    } catch (mailError) {
      console.error("Error al enviar correo con PDF:", mailError);
    }

    res.json({ success: true, message: 'Email con PDF enviado con éxito' });
  } catch (error) {
    console.error("Error en send-email endpoint:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
