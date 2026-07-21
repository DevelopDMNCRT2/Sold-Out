import express from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma.js';
import { sendTicketEmail, sendTicketEmailWithPdf } from '../config/nodemailer.js';
import QRCode from 'qrcode';
import crypto from 'crypto';

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

      // Validar stock disponible
      const remainingStock = tier.stock - tier.sold;
      if (item.qty > remainingStock) {
        return res.status(400).json({
          error: `No hay suficiente stock para la localidad "${tier.name}". Solo quedan ${remainingStock} boletos disponibles.`
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

// Validar boleto (Escáner Protegido)
router.post('/validate', async (req, res) => {
  try {
    const { qrCode } = req.body;
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ valid: false, message: 'Acceso denegado: Se requiere dispositivo autorizado para escanear.' });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'soldout-secret-key-2026');
    } catch (err) {
      return res.status(401).json({ valid: false, message: 'Sesión de escáner inválida o expirada.' });
    }

    // Buscar si el ticket existe y obtener el tier y evento
    const ticket = await prisma.ticket.findFirst({
      where: { OR: [{ id: qrCode }, { qrCode: qrCode }] },
      include: { ticketTier: true, order: true }
    });

    if (!ticket) {
      return res.status(404).json({ valid: false, message: 'Boleto no encontrado o falso' });
    }

    // Verificar que el boleto corresponda al evento del dispositivo escaneador
    if (decoded.role === 'SCANNER' && ticket.order.eventId !== decoded.eventId) {
      return res.status(400).json({ valid: false, message: '⛔ Este boleto pertenece a otro evento' });
    }

    // Verificar si la orden o el boleto están cancelados
    if (ticket.order.status === 'Cancelado' || ticket.order.status === 'Reembolsado' || ticket.status === 'Cancelado') {
      return res.status(400).json({ valid: false, message: '⛔ Boleto CANCELADO / REEMBOLSADO. Entrada denegada.' });
    }

    if (ticket.status === 'Escaneado') {
      return res.status(400).json({ 
        valid: false, 
        message: 'Boleto ya fue escaneado previamente', 
        scannedAt: ticket.scannedAt 
      });
    }

    // Marcar como escaneado y registrar el dispositivo
    const updatedTicket = await prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        status: 'Escaneado',
        scannedAt: new Date(),
        scannedByDeviceId: decoded.deviceId || null
      }
    });

    res.json({
      valid: true,
      message: '¡Acceso concedido!',
      ticket: {
        buyerName: ticket.order.buyerName,
        tierName: ticket.ticketTier.name
      }
    });
  } catch (error) {
    res.status(500).json({ valid: false, error: error.message });
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

// Procesar pago con Mercado Pago (Bricks) y crear orden
router.post('/mercado-pago', async (req, res) => {
  try {
    const { 
      token, 
      issuer_id, 
      payment_method_id, 
      transaction_amount, 
      installments, 
      payer,
      orderData // contiene eventId, buyerName, buyerEmail, buyerPhone, tickets
    } = req.body;

    const { eventId, buyerName, buyerEmail, buyerPhone, tickets } = orderData;

    // 1. Validar stock antes de cobrar
    for (const item of tickets) {
      let tier = await prisma.ticketTier.findFirst({
        where: {
          OR: [
            { id: item.ticketTierId },
            { eventId: eventId, name: { equals: item.ticketTierId, mode: 'insensitive' } },
            { eventId: eventId, name: { equals: item.name, mode: 'insensitive' } }
          ]
        }
      });
      
      if (tier) {
        const remainingStock = tier.stock - tier.sold;
        if (item.qty > remainingStock) {
          return res.status(400).json({
            error: `No hay suficiente stock para la localidad "${tier.name}". Solo quedan ${remainingStock} boletos disponibles.`
          });
        }
      }
    }

    // 2. Comunicarse con la API de Mercado Pago
    const idempotencyKey = crypto.randomUUID();
    const mpUrl = 'https://api.mercadopago.com/v1/payments';
    
    const validEmail = (buyerEmail && buyerEmail.includes('@')) 
      ? buyerEmail.trim() 
      : ((payer?.email && payer.email.includes('@')) ? payer.email.trim() : 'cliente_test@soldout.com');

    const mpPayer = {
      email: validEmail
    };

    if (payer?.identification?.type && payer?.identification?.number) {
      mpPayer.identification = payer.identification;
    }

    console.log("Iniciando cobro en Mercado Pago para email:", validEmail);
    const mpRes = await fetch(mpUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': idempotencyKey
      },
      body: JSON.stringify({
        token,
        issuer_id,
        payment_method_id,
        transaction_amount: Number(transaction_amount),
        installments: Number(installments),
        description: `Compra de boletos en SoldOut`,
        payer: mpPayer
      })
    });

    const mpStatusDetailsMap = {
      'cc_rejected_insufficient_amount': 'Fondos insuficientes en la tarjeta para completar la compra.',
      'cc_rejected_bad_filled_security_code': 'El código de seguridad (CVV) ingresado es incorrecto.',
      'cc_rejected_bad_filled_date': 'La fecha de vencimiento de la tarjeta es incorrecta.',
      'cc_rejected_bad_filled_other': 'Revisa los datos de tu tarjeta. Hay información incorrecta.',
      'cc_rejected_other_reason': 'Tu banco emisor rechazó la transacción. Por favor intenta con otra tarjeta.',
      'cc_rejected_call_for_authorize': 'Debes autorizar este pago llamando a tu banco emisor.',
      'cc_rejected_card_disabled': 'La tarjeta se encuentra bloqueada o inhabilitada por tu banco.',
      'cc_rejected_duplicated_payment': 'Ya realizaste un pago idéntico recientemente. Espera unos minutos.',
      'cc_rejected_high_risk': 'El pago fue rechazado por el sistema de prevención de fraude.',
      'cc_rejected_max_attempts': 'Excediste el límite de intentos permitidos. Intenta con otra tarjeta.',
      'cc_amount_rate_limit_exceeded': 'Has superado el límite de monto permitido por tu tarjeta.',
      'cc_rejected_invalid_installments': 'La cantidad de mensualidades seleccionadas no está permitida.'
    };

    const payment = await mpRes.json();

    if (!mpRes.ok || payment.status !== 'approved') {
      console.error("Pago rechazado o fallido en Mercado Pago:", JSON.stringify(payment, null, 2));
      
      const readableMessage = mpStatusDetailsMap[payment.status_detail] 
        || payment.status_detail 
        || payment.message 
        || 'El pago no pudo ser procesado.';

      return res.status(400).json({ 
        error: readableMessage,
        status: payment.status,
        status_detail: payment.status_detail,
        mpError: payment
      });
    }

    console.log(`Pago aprobado ID: ${payment.id}. Creando orden en la base de datos...`);

    // 3. Crear orden localmente tras la aprobación del pago
    // Buscar o crear cliente
    let dbCustomer = await prisma.customer.findUnique({ where: { email: buyerEmail } });
    if (!dbCustomer) {
      let customerId;
      let exists = true;
      while (exists) {
        customerId = Math.floor(10000 + Math.random() * 90000).toString();
        const count = await prisma.customer.count({ where: { id: customerId } });
        if (count === 0) exists = false;
      }
      dbCustomer = await prisma.customer.create({
        data: { id: customerId, name: buyerName, email: buyerEmail, phone: buyerPhone }
      });
    }

    // Buscar o crear evento
    let dbEvent = await prisma.event.findUnique({ where: { id: eventId } });
    if (!dbEvent) {
      dbEvent = await prisma.event.create({
        data: {
          id: eventId,
          name: 'Neon Nights Festival',
          artist: 'Varios Artistas',
          category: 'Festival',
          shortDescription: 'El evento electrónico más grande del año',
          longDescription: 'Prepárate para la experiencia electrónica.',
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

    // Crear la orden en la BD
    const dbOrder = await prisma.order.create({
      data: {
        eventId,
        buyerName,
        buyerEmail,
        buyerPhone,
        totalAmount: Number(transaction_amount),
        status: 'Pagado',
        paymentIntent: payment.id.toString(),
        customerId: dbCustomer.id
      },
      include: {
        event: true
      }
    });

    const ticketPromises = [];
    const tierUpdates = {};

    for (const item of tickets) {
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
              orderId: dbOrder.id,
              ticketTierId: tier.id
            }
          })
        );
      }
    }

    const createdTickets = await Promise.all(ticketPromises);

    // Actualizar stock vendido
    for (const [tierId, qty] of Object.entries(tierUpdates)) {
      await prisma.ticketTier.update({
        where: { id: tierId },
        data: { sold: { increment: qty } }
      });
    }

    res.json({
      success: true,
      orderId: dbOrder.id,
      tickets: createdTickets
    });

  } catch (error) {
    console.error("Error al procesar pago con Mercado Pago:", error);
    res.status(500).json({ error: error.message });
  }
});

// 5. Cambiar estado de una orden (Admin: Aprobar, Cancelar, Reembolsar)
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, refundMercadoPago } = req.body;

    if (!['Pagado', 'Cancelado', 'Reembolsado', 'Pendiente'].includes(status)) {
      return res.status(400).json({ error: 'Estado de orden no válido' });
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: { tickets: true }
    });

    if (!order) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }

    let mpRefundData = null;

    // Si se solicita reembolso en Mercado Pago y la orden tiene paymentIntent
    if (refundMercadoPago && order.paymentIntent && process.env.MERCADO_PAGO_ACCESS_TOKEN) {
      try {
        console.log(`Solicitando reembolso a Mercado Pago para payment Intent: ${order.paymentIntent}...`);
        const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${order.paymentIntent}/refunds`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          }
        });
        mpRefundData = await mpRes.json();
        console.log("Respuesta de reembolso Mercado Pago:", mpRefundData);
      } catch (mpErr) {
        console.error("Error al procesar reembolso en Mercado Pago:", mpErr.message);
      }
    }

    // Actualizar orden en BD
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status }
    });

    // Actualizar estado de los boletos individuales asociados
    if (status === 'Cancelado' || status === 'Reembolsado') {
      await prisma.ticket.updateMany({
        where: { orderId: id },
        data: { status: 'Cancelado' }
      });
    } else if (status === 'Pagado') {
      await prisma.ticket.updateMany({
        where: { orderId: id, status: 'Cancelado' },
        data: { status: 'Válido' }
      });
    }

    res.json({
      success: true,
      message: `Orden #${id} actualizada a estado '${status}'`,
      order: updatedOrder,
      mpRefund: mpRefundData
    });
  } catch (error) {
    console.error("Error al cambiar estado de orden:", error);
    res.status(500).json({ error: error.message });
  }
});

// 6. Webhook de Mercado Pago para notificaciones IPN (cambios de estado automáticos)
router.post('/webhook/mercadopago', async (req, res) => {
  try {
    const { data } = req.body;
    const paymentId = data?.id || req.query['data.id'] || req.query.id;

    if (paymentId && process.env.MERCADO_PAGO_ACCESS_TOKEN) {
      console.log(`Webhook Mercado Pago recibido para pago ID: ${paymentId}`);

      const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`
        }
      });

      if (mpRes.ok) {
        const payment = await mpRes.json();
        console.log(`Estado del pago en Mercado Pago: ${payment.status}`);

        let newOrderStatus = null;
        if (payment.status === 'approved') newOrderStatus = 'Pagado';
        else if (['cancelled', 'refunded', 'charged_back'].includes(payment.status)) newOrderStatus = 'Reembolsado';
        else if (payment.status === 'rejected') newOrderStatus = 'Cancelado';

        if (newOrderStatus) {
          const matchingOrder = await prisma.order.findFirst({
            where: { paymentIntent: paymentId.toString() }
          });

          if (matchingOrder) {
            await prisma.order.update({
              where: { id: matchingOrder.id },
              data: { status: newOrderStatus }
            });

            if (newOrderStatus === 'Reembolsado' || newOrderStatus === 'Cancelado') {
              await prisma.ticket.updateMany({
                where: { orderId: matchingOrder.id },
                data: { status: 'Cancelado' }
              });
            }
          }
        }
      }
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error("Error en Webhook Mercado Pago:", error);
    res.status(200).send('OK');
  }
});

export default router;
