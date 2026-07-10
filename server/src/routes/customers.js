import express from 'express';
import { prisma } from '../config/prisma.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Obtener todos los clientes con el conteo de sus boletos comprados
router.get('/', async (req, res) => {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        orders: {
          include: {
            tickets: true
          }
        }
      }
    });

    // Calcular el total de boletos comprados por cada cliente
    const customersWithTicketCount = customers.map(customer => {
      const ticketsBought = customer.orders.reduce((total, order) => total + order.tickets.length, 0);
      return {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        ticketsBought,
        createdAt: customer.createdAt
      };
    });

    res.json(customersWithTicketCount);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Registro de Cliente
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if customer exists
    let customer = await prisma.customer.findUnique({ where: { email } });
    if (customer) {
      if (!customer.password) {
        // Customer exists but without password (e.g., from quick checkout), just update the password
        const hashedPassword = await bcrypt.hash(password, 10);
        customer = await prisma.customer.update({
          where: { email },
          data: { name, password: hashedPassword }
        });
      } else {
        return res.status(400).json({ error: 'El correo ya está registrado.' });
      }
    } else {
      // Create new customer
      let id;
      let exists = true;
      while (exists) {
        id = Math.floor(10000 + Math.random() * 90000).toString(); // 5 digits
        const count = await prisma.customer.count({ where: { id } });
        if (count === 0) exists = false;
      }
      
      const hashedPassword = await bcrypt.hash(password, 10);
      customer = await prisma.customer.create({
        data: { id, name, email, password: hashedPassword }
      });
    }

    const token = jwt.sign(
      { id: customer.id, email: customer.email, role: 'Customer' },
      process.env.JWT_SECRET || 'supersecretjwtkey',
      { expiresIn: '30d' }
    );

    res.status(201).json({ 
      message: 'Cuenta creada con éxito', 
      token, 
      customer: { id: customer.id, name: customer.name, email: customer.email } 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login de Cliente
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const customer = await prisma.customer.findUnique({ where: { email } });
    if (!customer) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    if (!customer.password) {
      return res.status(400).json({ error: 'Esta cuenta fue creada sin contraseña durante una compra. Por favor, crea una cuenta con este correo para establecer una contraseña.' });
    }

    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Contraseña incorrecta.' });
    }

    const token = jwt.sign(
      { id: customer.id, email: customer.email, role: 'Customer' },
      process.env.JWT_SECRET || 'supersecretjwtkey',
      { expiresIn: '30d' }
    );

    res.json({ 
      message: 'Inicio de sesión exitoso', 
      token, 
      customer: { id: customer.id, name: customer.name, email: customer.email } 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
