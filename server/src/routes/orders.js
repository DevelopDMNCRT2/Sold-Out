import express from 'express';
import { prisma } from '../config/prisma.js';
import { sendTicketEmail } from '../config/nodemailer.js';
import QRCode from 'qrcode';

const router = express.Router();

// Crear Orden y Boletos
router.post('/', async (req, res) => {
  try {
    const { eventId, buyerName, buyerEmail, buyerPhone, totalAmount, tickets } = req.body;
    // tickets = [{ ticketTierId: '123', qty: 2 }]

    // 1. Crear la Orden
    const order = await prisma.order.create({
      data: {
        eventId,
        buyerName,
        buyerEmail,
        buyerPhone,
        totalAmount,
        status: 'Pagado' // Asumiendo que el pago fue exitoso antes de llamar aquí
      },
      include: {
        event: true
      }
    });

    // 2. Crear los Boletos (Tickets individuales)
    const ticketPromises = [];
    for (const item of tickets) {
      for (let i = 0; i < item.qty; i++) {
        ticketPromises.push(
          prisma.ticket.create({
            data: {
              orderId: order.id,
              ticketTierId: item.ticketTierId
            }
          })
        );
      }
    }
    const createdTickets = await Promise.all(ticketPromises);

    // 3. Generar QRs en Base64 (Data URIs)
    const qrPromises = createdTickets.map(t => QRCode.toDataURL(t.id));
    const qrDataUrls = await Promise.all(qrPromises);

    // 4. Enviar Correo con QRs
    await sendTicketEmail(buyerEmail, buyerName, order, qrDataUrls);

    // 5. Actualizar los "Sold" en TicketTiers
    for (const item of tickets) {
      await prisma.ticketTier.update({
        where: { id: item.ticketTierId },
        data: { sold: { increment: item.qty } }
      });
    }

    res.status(201).json({ message: 'Orden procesada con éxito', orderId: order.id });
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

export default router;
