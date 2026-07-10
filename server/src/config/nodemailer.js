import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendTicketEmail = async (to, buyerName, order, ticketsDataUrl) => {
  try {
    const html = `
      <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto;">
        <h2>¡Gracias por tu compra, ${buyerName}!</h2>
        <p>Tu orden <strong>#${order.id}</strong> ha sido confirmada.</p>
        <p>Adjunto encontrarás tus boletos. Por favor, presenta el código QR en la entrada del evento.</p>
        <hr/>
        <p><strong>Total pagado:</strong> $${order.totalAmount}</p>
        <p><strong>Evento:</strong> ${order.event?.name}</p>
      </div>
    `;

    // Adjuntar los QRs generados
    const attachments = ticketsDataUrl.map((dataUrl, index) => {
      return {
        filename: `Boleto-${index + 1}.png`,
        path: dataUrl, // data URI
      };
    });

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject: `Tus Boletos para ${order.event?.name} - Sold Out`,
      html,
      attachments,
    });

    console.log("Email enviado: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Error al enviar email:", error);
    throw error;
  }
};
