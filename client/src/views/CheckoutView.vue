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
    
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    // Fondo blanco del boleto
    doc.setFillColor(255, 255, 255)
    doc.rect(0, 0, 210, 297, 'F')
    
    // Póster manteniendo el aspect ratio
    let startY = 130
    try {
      const imgRatio = posterImg.width / posterImg.height
      let finalWidth = 180
      let finalHeight = finalWidth / imgRatio
      
      // Limitar altura a 120mm
      if (finalHeight > 120) {
        finalHeight = 120
        finalWidth = finalHeight * imgRatio
      }
      
      const xOffset = (210 - finalWidth) / 2
      doc.addImage(posterImg, 'PNG', xOffset, 15, finalWidth, finalHeight)
      startY = 15 + finalHeight + 20
    } catch(e) {}

    // Título Principal
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(28)
    doc.setFont('helvetica', 'bold')
    doc.text('NEON NIGHTS FESTIVAL', 105, startY, { align: 'center' })

    // Detalles del Evento
    doc.setFontSize(14)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(80, 80, 80)
    doc.text(`Fecha: 15 Oct 2026`, 105, startY + 10, { align: 'center' })
    doc.text(`Lugar: Estadio Nacional`, 105, startY + 18, { align: 'center' })

    // Caja de datos del boleto (gris claro)
    doc.setFillColor(245, 245, 245)
    doc.setDrawColor(200, 200, 200)
    doc.rect(15, startY + 30, 180, 50, 'FD')
    
    // Decoración final (Slash rojo en la caja)
    doc.setFillColor(139, 0, 0) // var(--color-accent)
    doc.rect(15, startY + 30, 3, 50, 'F')
    
    // Tipo de boleto
    doc.setFontSize(12)
    doc.setTextColor(120, 120, 120)
    doc.text('TIPO DE ENTRADA', 25, startY + 42)
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text(ticketType.value.toUpperCase(), 25, startY + 52)

    // Nombre del Asistente
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(120, 120, 120)
    doc.text('ASISTENTE', 25, startY + 66)
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text(attendeeName.toUpperCase(), 25, startY + 74)

    // Generar código QR único
    const qrDataUrl = await QRCode.toDataURL(ticketId, {
      color: { dark: '#000000', light: '#ffffff' },
      width: 150,
      margin: 1
    })
    
    // Insertar QR
    doc.addImage(qrDataUrl, 'PNG', 140, startY + 35, 40, 40)

    // ID de Boleto
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(100, 100, 100)
    doc.text(`ID: ${ticketId}`, 160, startY + 85, { align: 'center' })

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
  height: 220px;
  background: linear-gradient(135deg, #2b2b2b 0%, #1a1a1a 100%);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2.5rem;
  box-shadow: 0 15px 35px rgba(0,0,0,0.6);
  border: 1px solid rgba(255,255,255,0.1);
  position: relative;
  overflow: hidden;
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
  width: 50px;
  height: 40px;
  background: linear-gradient(135deg, #d4af37 0%, #aa8c2c 100%);
  border-radius: 6px;
  margin-bottom: 2rem;
}

.card-logo {
  position: absolute;
  top: 2rem;
  right: 2rem;
  font-style: italic;
  font-weight: 900;
  font-size: 1.5rem;
  color: rgba(255,255,255,0.8);
}

.card-number-display {
  font-family: monospace;
  font-size: 1.4rem;
  letter-spacing: 2px;
  margin-bottom: 1.5rem;
  color: var(--color-white);
}

.card-name-display {
  text-transform: uppercase;
  font-size: 0.9rem;
  color: var(--color-light-gray);
  letter-spacing: 1px;
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
