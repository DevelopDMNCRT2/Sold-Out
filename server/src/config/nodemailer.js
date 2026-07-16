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

export const sendTicketEmailWithPdf = async (to, buyerName, order, pdfDataUrl) => {
  try {
    const html = `
      <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; color: #333333; line-height: 1.6;">
        <h2 style="color: #8b0000; border-bottom: 2px solid #8b0000; padding-bottom: 10px;">¡Gracias por tu compra, ${buyerName}!</h2>
        <p>Tu orden <strong>#${order.id}</strong> ha sido confirmada con éxito.</p>
        <p>Adjunto a este correo encontrarás tus boletos oficiales en formato PDF para el evento <strong>${order.event?.name || 'Evento'}</strong>.</p>
        <p>Por favor, descarga el PDF adjunto y preséntalo desde tu celular o impreso en la entrada del recinto.</p>
        <div style="background-color: #f9f9f9; border: 1px solid #eeeeee; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="margin-top: 0; color: #8b0000;">Detalles de la Compra:</h4>
          <p style="margin: 5px 0;"><strong>Evento:</strong> ${order.event?.name || 'Por definir'}</p>
          <p style="margin: 5px 0;"><strong>Comprador:</strong> ${buyerName}</p>
          <p style="margin: 5px 0;"><strong>Total pagado:</strong> $${order.totalAmount}</p>
        </div>
        <p style="font-size: 12px; color: #777777;">Este es un correo automático. Por favor no respondas a este mensaje.</p>
      </div>
    `;

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject: `Tus Boletos para ${order.event?.name || 'Evento'} - Sold Out`,
      html,
      attachments: [
        {
          filename: `Boletos_${order.event?.name || 'Evento'}.pdf`,
          path: pdfDataUrl, // Soporta Data URI de base64
        }
      ],
    });

    console.log("Email de PDF enviado: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Error al enviar email de PDF:", error);
    throw error;
  }
};
