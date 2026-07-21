import express from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'soldout-secret-key-2026';

// Middleware para verificar token de escáner
export const verifyScannerToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Acceso no autorizado. Dispositivo no autenticado.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.role !== 'SCANNER' || !decoded.eventId || !decoded.deviceId) {
      return res.status(403).json({ message: 'Token de escáner inválido o malformado.' });
    }

    // Verificar que el dispositivo siga existiendo en la base de datos (no revocado)
    const device = await prisma.scannerDevice.findUnique({
      where: {
        eventId_deviceId: {
          eventId: decoded.eventId,
          deviceId: decoded.deviceId
        }
      }
    });

    if (!device) {
      return res.status(403).json({ message: 'Este dispositivo ha sido revocado por el administrador.' });
    }

    // Actualizar última actividad
    await prisma.scannerDevice.update({
      where: { id: device.id },
      data: { lastActiveAt: new Date() }
    });

    req.scanner = {
      eventId: decoded.eventId,
      deviceId: decoded.deviceId,
      deviceName: device.deviceName
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'La sesión del escáner ha expirado. Ingresa el PIN nuevamente.' });
    }
    return res.status(401).json({ message: 'Error de autenticación de escáner: ' + error.message });
  }
};

// 1. EMPAREJAR DISPOSITIVO CON PIN
router.post('/pair', async (req, res) => {
  try {
    const { pin, deviceId, deviceName } = req.body;

    if (!pin || !deviceId) {
      return res.status(400).json({ message: 'El PIN y el ID de dispositivo son requeridos.' });
    }

    // Buscar evento por PIN
    const event = await prisma.event.findFirst({
      where: { scannerPin: pin }
    });

    if (!event) {
      return res.status(404).json({ message: 'PIN inválido o evento no encontrado.' });
    }

    // Verificar si este dispositivo ya está registrado para este evento
    let device = await prisma.scannerDevice.findUnique({
      where: {
        eventId_deviceId: {
          eventId: event.id,
          deviceId: deviceId
        }
      }
    });

    if (!device) {
      // Contar cuántos dispositivos activos hay registrados para este evento
      const currentDevicesCount = await prisma.scannerDevice.count({
        where: { eventId: event.id }
      });

      if (currentDevicesCount >= event.maxDevices) {
        return res.status(403).json({
          message: `Límite de dispositivos alcanzado. Máximo ${event.maxDevices} dispositivo(s) autorizado(s) para este evento.`
        });
      }

      // Registrar nuevo dispositivo
      device = await prisma.scannerDevice.create({
        data: {
          eventId: event.id,
          deviceId,
          deviceName: deviceName || 'Navegador Web'
        }
      });
    } else {
      // Actualizar actividad
      await prisma.scannerDevice.update({
        where: { id: device.id },
        data: { lastActiveAt: new Date() }
      });
    }

    // Generar token JWT con validez de 24 horas
    const token = jwt.sign(
      {
        eventId: event.id,
        deviceId: device.deviceId,
        role: 'SCANNER'
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Dispositivo vinculado correctamente',
      token,
      event: {
        id: event.id,
        name: event.name,
        artist: event.artist,
        venue: event.venue,
        date: event.date
      }
    });
  } catch (error) {
    console.error('Error al vincular escáner:', error);
    res.status(500).json({ message: error.message });
  }
});

// 2. OBTENER CONFIGURACIÓN Y DISPOSITIVOS DEL ESCÁNER (ADMIN)
router.get('/config/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        name: true,
        scannerPin: true,
        maxDevices: true,
        scannerDevices: {
          orderBy: { pairedAt: 'desc' }
        }
      }
    });

    if (!event) {
      return res.status(404).json({ message: 'Evento no encontrado' });
    }

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 3. ACTUALIZAR CONFIGURACIÓN DEL ESCÁNER (ADMIN)
router.put('/config/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    const { scannerPin, maxDevices, generatePin } = req.body;

    let pinToSave = scannerPin;

    if (generatePin) {
      // Generar PIN aleatorio de 6 dígitos
      pinToSave = Math.floor(100000 + Math.random() * 900000).toString();
    }

    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: {
        ...(pinToSave !== undefined && { scannerPin: pinToSave }),
        ...(maxDevices !== undefined && { maxDevices: parseInt(maxDevices, 10) })
      },
      select: {
        id: true,
        scannerPin: true,
        maxDevices: true
      }
    });

    res.json({
      success: true,
      message: 'Configuración de escáner actualizada',
      config: updatedEvent
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 4. REVOCAR DISPOSITIVO REGISTRADO (ADMIN)
router.delete('/devices/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params;

    await prisma.scannerDevice.delete({
      where: { id: deviceId }
    });

    res.json({ success: true, message: 'Dispositivo revocado correctamente' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 5. ANÁLISIS DE ASISTENCIA (ADMIN / VER DETALLES)
router.get('/attendance/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;

    // Obtener total de boletos emitidos (de ordenes pagadas) y boletos escaneados
    const tickets = await prisma.ticket.findMany({
      where: {
        order: {
          eventId: eventId,
          status: { in: ['Pagado', 'Completado', 'Aprobado'] }
        }
      },
      include: {
        ticketTier: true,
        order: true
      },
      orderBy: { scannedAt: 'desc' }
    });

    const totalSold = tickets.length;
    const scannedTickets = tickets.filter(t => t.status === 'Escaneado');
    const totalScanned = scannedTickets.length;
    const attendancePercentage = totalSold > 0 ? ((totalScanned / totalSold) * 100).toFixed(1) : 0;

    // Dispositivos autorizados
    const devices = await prisma.scannerDevice.findMany({
      where: { eventId },
      orderBy: { pairedAt: 'desc' }
    });

    res.json({
      summary: {
        totalSold,
        totalScanned,
        pending: totalSold - totalScanned,
        percentage: parseFloat(attendancePercentage)
      },
      scannedList: scannedTickets.map(t => ({
        id: t.id,
        buyerName: t.order.buyerName,
        buyerEmail: t.order.buyerEmail,
        tierName: t.ticketTier.name,
        scannedAt: t.scannedAt,
        scannedByDeviceId: t.scannedByDeviceId
      })),
      devices
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
