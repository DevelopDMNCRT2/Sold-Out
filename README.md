# Sold Out — Plataforma de Venta de Boletos 🎟️

Sold Out es una plataforma integral para la gestión y venta de boletos para eventos (conciertos, tours, etc.). Está conformada por tres piezas principales: un portal público para que los clientes compren boletos, un panel de administración para gestionar eventos y usuarios, y un backend que procesa las órdenes, genera códigos QR, gestiona el control de acceso en puerta y administra la base de datos.

---

## 🏗️ Estructura del Proyecto y Stack Tecnológico

El proyecto está estructurado como un monorepo con tres directorios principales:

### 1. `/client` (Portal Público)
Aplicación SPA orientada al cliente final para explorar eventos, comprar boletos de forma segura con Mercado Pago o simulador, ver su información y descargar boletos oficiales en PDF.
- **Framework:** Vue 3
- **Bundler:** Vite
- **Lenguaje:** JavaScript
- **Estilos:** Tailwind CSS

### 2. `/admin` (Panel de Administración y Escáner Standalone)
Panel privado para la creación y gestión de eventos, localidades (tickets), usuarios y ventas. Incluye también la interfaz gráfica del escáner en puerta (`/validador`) para el personal de acceso.
- **Framework:** Vue 3 (Composition API)
- **Bundler:** Vite
- **Lenguaje:** JavaScript
- **Estilos:** Tailwind CSS (Tema oscuro/claro)
- **Reportes:** Generación de PDF con `jsPDF`

### 3. `/server` (API y Backend)
API RESTful que sirve a ambas aplicaciones frontend, maneja base de datos, integraciones de pago, webhooks e inspección de control de acceso.
- **Entorno:** Node.js
- **Framework REST:** Express.js
- **Base de Datos:** PostgreSQL a través de **NeonDB** serverless.
- **ORM:** Prisma ORM (v5).
- **Pasarela de Pagos:** **Mercado Pago** (Cobros con Card Bricks, Reembolsos vía API y Webhook IPN).
- **Manejo de Imágenes:** Integración con **Cloudinary** para carga y almacenamiento de portadas y banners de eventos (Directorio `SoldOut`).
- **Correos:** Nodemailer vía SMTP de Ionos.

---

## ⚙️ Integraciones Externas Críticas

1. **Mercado Pago (Checkout Bricks, API & Webhooks):**
   - Procesamiento directo de tarjetas de crédito/débito en el checkout.
   - Emisión y solicitud de reembolsos automáticos vía API REST (`POST /v1/payments/{payment_id}/refunds`).
   - Escucha de notificaciones IPN / Webhooks (`POST /api/orders/webhook/mercadopago`) para sincronización automatizada de devoluciones y contracargos.
   - Traducción completa de códigos técnicos de rechazo (`cc_rejected_insufficient_amount`, etc.) a mensajes claros en español.

2. **NeonDB (PostgreSQL):**
   - Base de datos principal para eventos, órdenes, boletos individuales con QR únicos, dispositivos escáner y control de usuarios.

3. **Cloudinary:**
   - Todo el contenido multimedia de los eventos (imágenes de portada y banners) se carga y sirve desde Cloudinary. 
   - El endpoint `POST /api/upload` gestiona la subida en tiempo real y devuelve las URLs optimizadas.

4. **Prisma ORM:**
   - La estructura de la base de datos es administrada con Prisma (v5).

5. **Ionos SMTP:**
   - Manejo de correos de contacto y confirmación de compra para clientes utilizando `nodemailer`.

---

## 🛠️ Entorno de Desarrollo (Onboarding)

### Requisitos Previos
- Node.js (v18+)
- Variables de entorno (`.env` en `/server`):
  - `DATABASE_URL` (Conexión a NeonDB PostgreSQL)
  - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
  - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`
  - `MERCADO_PAGO_ACCESS_TOKEN`

### Levantando el proyecto
Se requiere el uso de 3 terminales separadas:

**1. Servidor:**
```bash
cd server
npm install
npm run dev
```
*(Levantará en el puerto 3001)*

**2. Cliente (Tienda):**
```bash
cd client
npm install
npm run dev
```
*(Levantará en el puerto 5173)*

**3. Admin:**
```bash
cd admin
npm install
npm run dev
```
*(Levantará en el puerto 5174)*

---

## 📝 Historial de Cambios y Funcionalidades Recientes (Julio 2026)

- **Escáner Standalone de Puerta (`/validador`):** Creación de una interfaz dedicada exclusiva para dispositivos móviles del personal de acceso, libre de barras laterales o menús administrativos. Cuenta con conmutador de tema **Modo Diurno ☀️ / Modo Nocturno 🌙** (por defecto nocturno) y el logo oficial de SoldOut.
- **Seguridad de Escáner y Control por PIN:** Generación y regeneración de PIN único de 6 dígitos por evento. Control del límite máximo de dispositivos autorizados (`maxDevices`) y registro individual de celulares (`eventId_deviceId`) con emisión de JWTs de 24 horas y revocación de accesos en tiempo real desde el admin.
- **Validación Estricta de Acceso:** El escáner valida en tiempo real si el boleto ya fue escaneado, si pertenece a otro evento (`⛔ Este boleto pertenece a otro evento`) o si la orden fue cancelada/reembolsada (`⛔ Boleto CANCELADO / REEMBOLSADO. Entrada denegada.`).
- **Análisis de Asistencia & Coherencia de Datos:** Incorporación de la pestaña **5. Asistencia** en el detalle del evento con métricas en vivo (*Boletos Emitidos, Escaneados, Pendientes y % de Asistencia*). Sincronización en tiempo real de conteos exactos de boletos por localidad en las pestañas de Ventas, Asistencia y la lista general de eventos.
- **Reportes de Asistencia en PDF:** Implementación de exportación PDF descargable (`jsPDF`) en la pestaña de Asistencia, con resumen de métricas del evento, encabezado institucional y listado completo de boletos validados con hora e ID de dispositivo.
- **Reembolsos Automáticos y Webhook de Mercado Pago:** Integración de la cancelación y reembolso de órdenes en el admin, enviando la solicitud de reembolso directo a Mercado Pago (`/v1/payments/{id}/refunds`) e invalidando automáticamente los boletos. Webhook IPN (`/api/orders/webhook/mercadopago`) para actualización pasiva de estados.
- **Traducción de Errores de Mercado Pago:** Mapeo amigable de todos los códigos técnicos de error de Mercado Pago a mensajes claros para el comprador (ej. *"Fondos insuficientes en la tarjeta para completar la compra"*).
- **Integración Backend de Eventos:** Conexión de creación y edición de eventos a NeonDB con upload en vivo a Cloudinary.
- **Control de IDs Cortos:** Generación de IDs únicos de 4 dígitos para eventos.
- **Autenticación JWT:** Registro, inicio de sesión y protección de rutas con JWT y bcrypt para clientes y administradores.
- **Buzón de Boletos en PDF Real:** Generación de boleto PDF estético con código QR, cuadrícula de datos 2x2, muescas semicirculares de corte y despacho automático por correo electrónico.
