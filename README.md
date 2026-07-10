# Sold Out — Plataforma de Venta de Boletos 🎟️

Sold Out es una plataforma integral para la gestión y venta de boletos para eventos (conciertos, tours, etc.). Está conformada por tres piezas principales: un portal público para que los clientes compren boletos, un panel de administración para gestionar eventos y usuarios, y un backend que procesa las órdenes, genera códigos QR y administra la base de datos.

---

## 🏗️ Estructura del Proyecto y Stack Tecnológico

El proyecto está estructurado como un monorepo con tres directorios principales:

### 1. `/client` (Portal Público)
Aplicación SPA orientada al cliente final para explorar eventos, comprar boletos y ver su información.
- **Framework:** Vue 3
- **Bundler:** Vite
- **Lenguaje:** JavaScript
- **Estilos:** Tailwind CSS

### 2. `/admin` (Panel de Administración)
Panel privado para la creación y gestión de eventos, localidades (tickets), y usuarios del sistema. Incluye también un escáner integrado de códigos QR para el control de acceso el día del evento.
- **Framework:** Vue 3 (Composition API)
- **Bundler:** Vite
- **Lenguaje:** JavaScript
- **Estilos:** Tailwind CSS (Tema oscuro/claro)

### 3. `/server` (API y Backend)
API RESTful que sirve a ambas aplicaciones frontend, maneja base de datos y validaciones de acceso.
- **Entorno:** Node.js
- **Framework REST:** Express.js
- **Base de Datos:** PostgreSQL a través de **NeonDB** serverless.
- **ORM:** Prisma ORM (v5).
- **Manejo de Imágenes:** Integración con **Cloudinary** para carga y almacenamiento de portadas y banners de eventos (Directorio `SoldOut`).
- **Correos:** Nodemailer vía SMTP de Ionos.

---

## ⚙️ Integraciones Externas Críticas

1. **NeonDB (PostgreSQL):**
   - Base de datos principal para eventos, órdenes, boletos individuales con QR únicos y control de usuarios.

2. **Cloudinary:**
   - Todo el contenido multimedia de los eventos (imágenes de portada y banners) se carga y sirve desde Cloudinary. 
   - El endpoint `POST /api/upload` gestiona la subida en tiempo real y devuelve las URLs optimizadas.

3. **Prisma ORM:**
   - La estructura de la base de datos es administrada con Prisma. Utilizando la versión `5.x` por compatibilidad de módulos ECMAScript en Node.js.

4. **Ionos SMTP:**
   - Manejo de correos de contacto y confirmación para clientes utilizando `nodemailer`.

---

## 🛠️ Entorno de Desarrollo (Onboarding)

### Requisitos Previos
- Node.js (v18+)
- Variables de entorno (`.env` en `/server`):
  - `DATABASE_URL` (Conexión a NeonDB PostgreSQL)
  - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
  - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`

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
*(Levantará en el puerto 5173 o similar)*

**3. Admin:**
```bash
cd admin
npm install
npm run dev
```
*(Levantará en el puerto 5174 o similar)*

---

## 📝 Últimos Cambios (Julio 2026)

- **Integración Backend de Eventos:** Se conectó la creación de eventos del panel administrativo a la base de datos NeonDB. Los modales de eventos procesan subida de imágenes a Cloudinary en vivo e incluyen visualizaciones (previews) antes de guardar.
- **Control de IDs Cortos:** Los IDs de los eventos ahora se generan de forma única con exactamente 4 dígitos (ej. 8294) para mejorar la usabilidad y la estética.
- **Gestión de Usuarios:** El panel de usuarios (`/usuarios`) ahora está completamente conectado con la API (`/api/users`), soportando visualización, creación (con validación de contraseñas y placeholders útiles), edición y borrado real en base de datos.
- **Autenticación (Clientes y Administradores):** Se implementó el registro, login y manejo de sesiones con JWT y contraseñas encriptadas con bcrypt, conectando tanto la app del cliente como el panel administrativo al backend. El Navbar de la tienda y el menú del administrador ahora muestran de forma dinámica los datos del usuario en sesión.
- **Rediseño del Panel de Administración (Estadísticas):** Se reemplazó el Dashboard por defecto de la plantilla por una vista de "Estadísticas" más limpia, con 4 tarjetas de resumen rápido, una gráfica mensual y una tabla de Top Eventos.
- **Estética Oscura y Premium:** Se alinearon los colores del modo oscuro del panel de administración (`#050505` y `#121212`) para que compartan la misma identidad minimalista y elegante de la tienda. Además, se limpió la interfaz removiendo botones de redes sociales, barras de búsqueda innecesarias y opciones de soporte sobrantes.
- **Estabilidad Prisma:** Se hizo downgrade de Prisma a la versión 5.22.0 para evitar crashes de entorno de ejecución en el backend que ocurrían por los nuevos defaults de Prisma 7.
