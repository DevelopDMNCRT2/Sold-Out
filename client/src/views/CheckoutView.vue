<template>
  <div class="checkout-page">
    <div class="container checkout-container">
      
      <!-- Checkout Header -->
      <div class="checkout-header text-center">
        <h1>Finaliza tu Compra</h1>
        <p class="text-light">Estás a un paso de asegurar tu lugar.</p>
      </div>

      <div class="checkout-grid">
        
        <!-- Left Column: Forms -->
        <div class="checkout-forms">
          
          <!-- Attendees Form -->
          <div class="checkout-section">
            <h2 class="section-title">Datos de los Asistentes</h2>
            <p class="section-desc">Ingresa el nombre de cada persona que asistirá al evento. Los boletos serán nominativos.</p>
            
            <div class="attendee-list">
              <div v-for="n in quantity" :key="n" class="form-group attendee-group">
                <label :for="`attendee-${n}`">Nombre Asistente {{ n }}</label>
                <input :id="`attendee-${n}`" v-model="attendees[n-1]" type="text" class="form-control" :placeholder="`Ej. Juan Pérez`" required />
              </div>
            </div>
          </div>

          <!-- Payment Form -->
          <div class="checkout-section">
            <h2 class="section-title">Método de Pago</h2>
            <p class="section-desc">Ingresa los datos de tu tarjeta de crédito o débito. Tu pago es seguro.</p>
            
            <div class="payment-form">
              <!-- Card Visual Simulation -->
              <div class="card-visual">
                <div class="card-chip"></div>
                <div class="card-logo">VISA</div>
                <div class="card-number-display">**** **** **** ****</div>
                <div class="card-name-display">TITULAR DE LA TARJETA</div>
              </div>

              <div class="form-group mt-2">
                <label for="cardName">Nombre en la Tarjeta</label>
                <input id="cardName" type="text" class="form-control" placeholder="Nombre completo" required />
              </div>
              
              <div class="form-group">
                <label for="cardNumber">Número de Tarjeta</label>
                <input id="cardNumber" type="text" class="form-control" placeholder="0000 0000 0000 0000" maxlength="19" required />
              </div>

              <div class="form-row">
                <div class="form-group half">
                  <label for="cardExp">Expiración (MM/AA)</label>
                  <input id="cardExp" type="text" class="form-control" placeholder="MM/AA" maxlength="5" required />
                </div>
                <div class="form-group half">
                  <label for="cardCvc">CVC</label>
                  <input id="cardCvc" type="password" class="form-control" placeholder="***" maxlength="4" required />
                </div>
              </div>
            </div>
          </div>

        </div>

        <!-- Right Column: Order Summary -->
        <div class="checkout-sidebar">
          <div class="order-summary">
            <h3>Resumen de Compra</h3>
            
            <div class="summary-event-info">
              <h4>Neon Nights Festival</h4>
              <p>15 Oct 2026 | Estadio Nacional</p>
            </div>

            <div class="summary-tickets">
              <div class="summary-row">
                <span>{{ quantity }}x Boleto {{ ticketType }}</span>
                <span>{{ formatCurrency(basePrice * quantity) }}</span>
              </div>
              <div class="summary-row text-light">
                <span>Cargo por servicio</span>
                <span>{{ formatCurrency(serviceFee) }}</span>
              </div>
              <div class="summary-row text-light">
                <span>Impuestos</span>
                <span>{{ formatCurrency(taxes) }}</span>
              </div>
            </div>

            <hr class="summary-divider">

            <div class="summary-row total-row">
              <span>Total a Pagar</span>
              <span class="text-accent">{{ formatCurrency(total) }}</span>
            </div>

            <button class="btn btn-primary btn-block pay-btn" @click="processPayment">
              Pagar {{ formatCurrency(total) }}
            </button>
            
            <p class="secure-text">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/></svg>
              Pago procesado de forma segura y cifrada.
            </p>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { jsPDF } from 'jspdf'
import QRCode from 'qrcode'

const route = useRoute()
const router = useRouter()

// Parse query params
const quantity = computed(() => parseInt(route.query.qty) || 1)
const ticketType = computed(() => route.query.type || 'General')

// Form state
const attendees = ref(Array(quantity.value).fill(''))

// Mock prices based on type
const getPrice = (type) => {
  if (type === 'VIP') return 1500
  if (type === 'Backstage') return 3500
  return 800
}

const basePrice = computed(() => getPrice(ticketType.value))
const serviceFee = computed(() => (basePrice.value * quantity.value) * 0.10)
const taxes = computed(() => (basePrice.value * quantity.value) * 0.16)
const total = computed(() => (basePrice.value * quantity.value) + serviceFee.value + taxes.value)

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount)
}

const processPayment = async () => {
  if (attendees.value.some(name => !name.trim())) {
    alert('Por favor, ingresa los nombres de todos los asistentes antes de pagar.')
    return
  }

  // Cargar el póster para incrustarlo en el PDF
  const posterImg = new Image()
  posterImg.src = '/poster.png'
  await new Promise((resolve) => {
    posterImg.onload = resolve
    posterImg.onerror = resolve // Evitar bloqueo si falla
  })

  // Generar 1 PDF por cada asistente
  for (let i = 0; i < quantity.value; i++) {
    const attendeeName = attendees.value[i].trim()
    const ticketId = `TKT-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    
    // Usaremos orientación landscape para un boleto más realista, o portrait A4 con un boleto en medio.
    // Usaremos A4 portrait (210x297) para que sea fácil de imprimir en casa.
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    // Fondo blanco de la hoja
    doc.setFillColor(255, 255, 255)
    doc.rect(0, 0, 210, 297, 'F')
    
    // Header de la Hoja
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.text('TUS BOLETOS', 105, 30, { align: 'center' })
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(100, 100, 100)
    doc.text('Imprime este documento o muéstralo desde tu dispositivo móvil.', 105, 37, { align: 'center' })

    // Dimensiones y coordenadas del BOLETO (Ticket)
    const tX = 15
    const tY = 50
    const tW = 180
    const tH = 80
    const stubW = 55 // Ancho del talón (donde va el QR)
    const mainW = tW - stubW

    // Sombra suave o contorno del boleto
    doc.setDrawColor(200, 200, 200)
    doc.setLineWidth(0.5)
    doc.setFillColor(252, 252, 252)
    doc.roundedRect(tX, tY, tW, tH, 3, 3, 'FD')

    // Línea punteada de corte (entre ticket principal y talón)
    doc.setDrawColor(180, 180, 180)
    doc.setLineDash([2, 2], 0)
    doc.line(tX + mainW, tY, tX + mainW, tY + tH)
    doc.setLineDash([]) // Reset dash

    // --- SECCIÓN PRINCIPAL DEL BOLETO (IZQUIERDA) ---
    // Branding SOLD OUT
    doc.setFillColor(139, 0, 0) // var(--color-accent)
    doc.rect(tX, tY, 5, tH, 'F') // Franja lateral izquierda
    
    doc.setTextColor(139, 0, 0)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('SOLD OUT.', tX + 10, tY + 12)

    // Flyer de evento preservando Aspect Ratio
    let flyerX = tX + 10
    let flyerY = tY + 20
    let flyerMaxWidth = 45
    let flyerMaxHeight = 50
    try {
      const imgRatio = posterImg.width / posterImg.height
      let finalWidth = flyerMaxWidth
      let finalHeight = finalWidth / imgRatio
      if (finalHeight > flyerMaxHeight) {
         finalHeight = flyerMaxHeight
         finalWidth = finalHeight * imgRatio
      }
      doc.addImage(posterImg, 'PNG', flyerX, flyerY + (flyerMaxHeight - finalHeight)/2, finalWidth, finalHeight)
      flyerX += finalWidth + 8 // Mover el texto a la derecha del flyer
    } catch(e) {
      flyerX += 50 // Si falla, dejamos espacio
    }

    // Datos del Evento
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('NEON NIGHTS FESTIVAL', flyerX, tY + 28)
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(80, 80, 80)
    doc.text(`15 Oct 2026 • 20:00 Hrs`, flyerX, tY + 36)
    doc.text(`Estadio Nacional`, flyerX, tY + 41)

    // Datos del Cliente y Boleto
    doc.setFontSize(8)
    doc.setTextColor(120, 120, 120)
    doc.text('NOMBRE DEL ASISTENTE', flyerX, tY + 54)
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text(attendeeName.toUpperCase(), flyerX, tY + 60)

    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(120, 120, 120)
    doc.text('TIPO DE BOLETO', flyerX + 60, tY + 54)
    doc.setTextColor(139, 0, 0)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text(ticketType.value.toUpperCase(), flyerX + 60, tY + 60)


    // --- TALÓN DEL BOLETO (DERECHA) ---
    // Título secundario
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('ACCESO', tX + mainW + (stubW/2), tY + 12, { align: 'center' })

    // Código QR
    const qrDataUrl = await QRCode.toDataURL(ticketId, {
      color: { dark: '#000000', light: '#ffffff' },
      width: 120,
      margin: 0
    })
    
    const qrSize = 35
    const qrX = tX + mainW + (stubW - qrSize) / 2
    const qrY = tY + 20
    doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize)

    // Ticket ID
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(80, 80, 80)
    doc.text(ticketId, tX + mainW + (stubW/2), qrY + qrSize + 6, { align: 'center' })

    // Extra branding
    doc.setFontSize(7)
    doc.setTextColor(150, 150, 150)
    doc.text('SOLD OUT PLATFORM', tX + mainW + (stubW/2), tY + tH - 5, { align: 'center' })

    // Guardar el PDF y forzar descarga
    doc.save(`Boleto_${ticketType.value}_${attendeeName.replace(/ /g, '_')}.pdf`)
  }

  alert('¡Pago procesado con éxito! Tus boletos se han descargado automáticamente a tu computadora.')
  router.push('/')
}

onMounted(() => {
  window.scrollTo(0, 0)
})
</script>

<style scoped>
.checkout-page {
  padding: 8rem 0;
  min-height: 100vh;
  background-color: var(--color-black);
}

.checkout-header {
  margin-bottom: 4rem;
}

.checkout-header h1 {
  font-family: var(--font-display);
  font-size: 3rem;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
}

.checkout-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 3rem;
}

@media (min-width: 992px) {
  .checkout-grid {
    grid-template-columns: 2fr 1fr;
    align-items: start;
  }
}

/* Sections */
.checkout-section {
  background-color: var(--color-dark-gray);
  padding: 2.5rem;
  border-radius: 8px;
  border: 1px solid var(--color-gray);
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
}

.section-desc {
  color: var(--color-light-gray);
  margin-bottom: 2rem;
  font-size: 0.95rem;
}

/* Forms */
.form-group {
  margin-bottom: 1.5rem;
}

.form-row {
  display: flex;
  gap: 1.5rem;
}

.half {
  flex: 1;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.85rem;
  color: var(--color-light-gray);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.form-control {
  width: 100%;
  padding: 1rem;
  background-color: transparent;
  border: 2px solid var(--color-gray);
  color: var(--color-white);
  border-radius: 6px;
  font-family: inherit;
  font-size: 1rem;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.form-control::placeholder {
  color: var(--color-light-gray);
  opacity: 0.6;
}

.form-control:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px rgba(139, 0, 0, 0.2);
}

/* Card Visual */
.card-visual {
  width: 100%;
  max-width: 380px;
  aspect-ratio: 1.586 / 1;
  background: linear-gradient(135deg, #2b2b2b 0%, #1a1a1a 100%);
  border-radius: 16px;
  padding: 8%;
  margin: 0 auto 2.5rem auto;
  box-shadow: 0 15px 35px rgba(0,0,0,0.6);
  border: 1px solid rgba(255,255,255,0.1);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.card-visual::before {
  content: '';
  position: absolute;
  top: -50%; right: -50%;
  width: 100%; height: 100%;
  background: radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 60%);
  pointer-events: none;
}

.card-chip {
  width: clamp(35px, 12vw, 50px);
  height: clamp(28px, 9vw, 40px);
  background: linear-gradient(135deg, #d4af37 0%, #aa8c2c 100%);
  border-radius: 6px;
  margin-top: 5%;
  margin-bottom: auto;
}

.card-logo {
  position: absolute;
  top: 8%;
  right: 8%;
  font-style: italic;
  font-weight: 900;
  font-size: clamp(1.2rem, 5vw, 1.5rem);
  color: rgba(255,255,255,0.8);
}

.card-number-display {
  font-family: monospace;
  font-size: clamp(1.1rem, 6vw, 1.5rem);
  letter-spacing: clamp(1px, 0.5vw, 2px);
  margin-bottom: 5%;
  color: var(--color-white);
  line-height: 1;
}

.card-name-display {
  text-transform: uppercase;
  font-size: clamp(0.75rem, 3.5vw, 0.9rem);
  color: var(--color-light-gray);
  letter-spacing: 1px;
  line-height: 1;
}

.mt-2 { margin-top: 2rem; }

/* Sidebar Order Summary */
.checkout-sidebar {
  position: sticky;
  top: 100px;
}

.order-summary {
  background-color: var(--color-dark-gray);
  padding: 2rem;
  border-radius: 8px;
  border: 1px solid var(--color-gray);
}

.order-summary h3 {
  font-size: 1.3rem;
  margin-bottom: 1.5rem;
  text-transform: uppercase;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--color-gray);
}

.summary-event-info {
  margin-bottom: 2rem;
}

.summary-event-info h4 {
  font-size: 1.2rem;
  margin-bottom: 0.3rem;
}

.summary-event-info p {
  font-size: 0.9rem;
  color: var(--color-light-gray);
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.8rem;
  font-size: 1rem;
}

.text-light {
  color: var(--color-light-gray);
}

.summary-divider {
  border: none;
  border-top: 1px dashed var(--color-gray);
  margin: 1.5rem 0;
}

.total-row {
  font-size: 1.3rem;
  font-weight: 900;
  align-items: center;
  margin-bottom: 2rem;
}

.text-accent {
  color: var(--color-accent);
  font-family: var(--font-display);
  font-size: 1.8rem;
}

.btn-block {
  width: 100%;
  padding: 1.2rem;
}

.pay-btn {
  font-size: 1.1rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 1.5rem;
}

.secure-text {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: var(--color-light-gray);
}

.secure-text svg {
  color: #27c93f; /* green secure lock */
}
</style>
