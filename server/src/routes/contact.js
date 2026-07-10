import express from 'express';
import { transporter } from '../config/nodemailer.js';

const router = express.Router();

// POST /api/contact
router.post('/', async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  try {
    const html = `
      <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px;">
        <h2 style="color: #333;">Nuevo mensaje de contacto</h2>
        <p><strong>Nombre:</strong> ${name}</p>
        <p><strong>Correo Electrónico:</strong> ${email}</p>
        <p><strong>Asunto:</strong> ${subject}</p>
        <hr style="border: 0; border-top: 1px solid #eaeaea; margin: 20px 0;"/>
        <p><strong>Mensaje:</strong></p>
        <p style="white-space: pre-wrap; background: #f9f9f9; padding: 15px; border-radius: 4px;">${message}</p>
      </div>
    `;

    // Enviar el correo a la cuenta del sistema
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: process.env.SMTP_USER, // Se envía al correo administrador (develop@dmncrt.com)
      replyTo: email, // Permite darle "Responder" y que le llegue al cliente
      subject: `Formulario de Contacto: ${subject}`,
      html,
    });

    console.log("Mensaje de contacto enviado: %s", info.messageId);
    return res.status(200).json({ message: 'Mensaje enviado exitosamente' });
  } catch (error) {
    console.error('Error enviando mensaje de contacto:', error);
    return res.status(500).json({ error: 'Hubo un error al enviar el mensaje' });
  }
});

export default router;
