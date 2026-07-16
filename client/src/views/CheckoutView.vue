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
              <div v-for="n in totalQuantity" :key="n" class="form-group attendee-group">
                <label :for="`attendee-${n}`">
                  Nombre Asistente {{ n }} 
                  <span class="text-xs text-gray-500 font-normal">({{ flattenedTickets[n-1]?.type }})</span>
                </label>
                <input :id="`attendee-${n}`" v-model="attendees[n-1]" type="text" class="form-control" :placeholder="`Ej. Juan Pérez`" required />
              </div>
            </div>
          </div>

          <!-- Contact Info Form -->
          <div class="checkout-section">
            <h2 class="section-title">Datos del Comprador</h2>
            <div v-if="isLoggedIn" class="buyer-info-badge">
              <p>Comprando como: <strong>{{ buyerName }}</strong> ({{ buyerEmail }})</p>
            </div>
            <div v-else class="contact-form">
              <p class="section-desc">Ingresa tus datos para registrar la compra y recibir los boletos por correo electrónico.</p>
              <div class="form-group">
                <label for="buyerName">Nombre Completo</label>
                <input id="buyerName" v-model="buyerName" type="text" class="form-control" placeholder="Ej. Juan Pérez" required />
              </div>
              <div class="form-row">
                <div class="form-group half">
                  <label for="buyerEmail">Correo Electrónico</label>
                  <input id="buyerEmail" v-model="buyerEmail" type="email" class="form-control" placeholder="Ej. juan@correo.com" required />
                </div>
                <div class="form-group half">
                  <label for="buyerPhone">Teléfono de Contacto</label>
                  <input id="buyerPhone" v-model="buyerPhone" type="tel" class="form-control" placeholder="Ej. 5512345678" maxlength="10" @input="buyerPhone = buyerPhone.replace(/\D/g, '')" />
                </div>
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
              <h4>{{ eventData ? eventData.name : 'Cargando evento...' }}</h4>
              <p>{{ eventData ? eventData.date : '' }} <span v-if="eventData && eventData.venue">| {{ eventData.venue }}</span></p>
            </div>
            <div class="summary-tickets">
              <div v-for="item in cartItems" :key="item.type" class="summary-row">
                <span>{{ item.qty }}x Boleto {{ item.type }}</span>
                <span>{{ formatCurrency(getPrice(item.type) * item.qty) }}</span>
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

// Parse query params (Support cart or single parameters)
const cartItems = computed(() => {
  if (route.query.cart) {
    try {
      return JSON.parse(route.query.cart)
    } catch (e) {
      console.error("Error al parsear el carrito:", e)
    }
  }
  return [{ type: route.query.type || 'General', qty: parseInt(route.query.qty) || 1 }]
})

const totalQuantity = computed(() => {
  return cartItems.value.reduce((sum, item) => sum + item.qty, 0)
})

const flattenedTickets = computed(() => {
  const list = []
  cartItems.value.forEach(item => {
    for (let i = 0; i < item.qty; i++) {
      list.push({ type: item.type })
    }
  })
  return list
})

// Form state
import { watch } from 'vue'
const attendees = ref([])
watch(totalQuantity, (newVal) => {
  attendees.value = Array(newVal).fill('')
}, { immediate: true })

const isLoggedIn = ref(false)
const buyerName = ref('')
const buyerEmail = ref('')
const buyerPhone = ref('')
const eventData = ref(null)

// Get price dynamically from event details if available
const getPrice = (type) => {
  if (eventData.value && eventData.value.ticketTiers) {
    const tier = eventData.value.ticketTiers.find(t => t.name.toLowerCase() === type.toLowerCase())
    if (tier) return tier.price
  }
  // Fallbacks
  if (type === 'VIP') return 1500
  if (type === 'Backstage') return 3500
  return 800
}

const basePrice = computed(() => {
  return cartItems.value.reduce((sum, item) => sum + (getPrice(item.type) * item.qty), 0)
})
const serviceFee = computed(() => basePrice.value * 0.10)
const taxes = computed(() => basePrice.value * 0.16)
const total = computed(() => basePrice.value + serviceFee.value + taxes.value)

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount)
}

const processPayment = async () => {
  if (!buyerName.value.trim() || !buyerEmail.value.trim()) {
    alert('Por favor, ingresa los datos del comprador.')
    return
  }

  if (attendees.value.some(name => !name.trim())) {
    alert('Por favor, ingresa los nombres de todos los asistentes antes de pagar.')
    return
  }

  const phoneVal = buyerPhone.value.trim()
  if (phoneVal && phoneVal.length !== 10) {
    alert('Por favor, ingresa un número de teléfono de contacto de exactamente 10 dígitos.')
    return
  }

  // 1. Llamar al Backend para registrar la compra
  let createdTickets = []
  try {
    const eventId = route.query.eventId || '1'
    const apiUrl = import.meta.env.VITE_API_URL 
      ? `${import.meta.env.VITE_API_URL}/api/orders` 
      : 'http://localhost:3001/api/orders'
      
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        eventId: eventId,
        buyerName: buyerName.value.trim(),
        buyerEmail: buyerEmail.value.trim(),
        buyerPhone: buyerPhone.value.trim() || '5500000000',
        totalAmount: total.value,
        tickets: cartItems.value.map(item => ({
          ticketTierId: item.type,
          qty: item.qty
        }))
      })
    })

    if (!res.ok) {
      const errData = await res.json()
      throw new Error(errData.error || 'Error al crear la orden en el servidor')
    }

    const data = await res.json()
    createdTickets = data.tickets || []
  } catch (error) {
    console.error("Error al procesar el pago:", error)
    alert(`No se pudo procesar la compra: ${error.message}`)
    return
  }

  // Cargar el póster para incrustarlo en el PDF (soporta CORS para imágenes de Cloudinary)
  const posterImg = new Image()
  posterImg.crossOrigin = 'anonymous'
  posterImg.src = (eventData.value && eventData.value.coverImage) ? eventData.value.coverImage : '/poster.png'
  await new Promise((resolve) => {
    posterImg.onload = resolve
    posterImg.onerror = resolve // Evitar bloqueo si falla
  })

  // Instanciar jsPDF una sola vez para todos los boletos (A4 retrato)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  })

  // Generar páginas del PDF único
  for (let i = 0; i < totalQuantity.value; i++) {
    // Si no es la primera página, añadir una nueva
    if (i > 0) {
      doc.addPage()
    }

    const attendeeName = attendees.value[i].trim()
    // Utilizar el ID del boleto real retornado por el backend si está disponible
    const ticketId = createdTickets[i]?.id || `TKT-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    
    // Obtener tipo de boleto actual
    const currentTicketType = flattenedTickets.value[i]?.type || 'General'
    
    // Fondo blanco de la hoja
    doc.setFillColor(255, 255, 255)
    doc.rect(0, 0, 210, 297, 'F')
    
    // Header de la Hoja
    doc.setTextColor(17, 24, 39) // Gray 900
    doc.setFontSize(22)
    doc.setFont('helvetica', 'bold')
    doc.text('TU BOLETO DE ACCESO', 105, 30, { align: 'center' })
    
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(107, 114, 128) // Gray 500
    doc.text('Presenta este boleto impreso o en tu celular al llegar al evento.', 105, 36, { align: 'center' })
    
    // Dibujar línea guía de corte superior
    doc.setDrawColor(229, 231, 235) // Gray 200
    doc.setLineDash([1, 3], 0)
    doc.line(15, 43, 195, 43)
    doc.setLineDash([])

    // Dimensiones y coordenadas del BOLETO
    const tX = 15
    const tY = 50
    const tW = 180
    const tH = 80
    const stubW = 50
    const mainW = tW - stubW

    // Cuerpo del boleto (Blanco con sombra suave simulada)
    doc.setFillColor(255, 255, 255)
    doc.setDrawColor(229, 231, 235) // Gray 200
    doc.setLineWidth(0.3)
    doc.roundedRect(tX, tY, tW, tH, 3, 3, 'FD')

    // Línea punteada de corte (entre boleto principal y talón)
    doc.setDrawColor(156, 163, 175) // Gray 400
    doc.setLineDash([2, 2], 0)
    doc.line(tX + mainW, tY, tX + mainW, tY + tH)
    doc.setLineDash([])

    // Muescas semicirculares de boleto clásico en la línea de corte (superior e inferior)
    doc.setFillColor(255, 255, 255)
    doc.setDrawColor(229, 231, 235)
    doc.ellipse(tX + mainW, tY, 3, 3, 'F')
    doc.ellipse(tX + mainW, tY + tH, 3, 3, 'F')
    doc.line(tX + mainW - 3, tY, tX + mainW + 3, tY)
    doc.line(tX + mainW - 3, tY + tH, tX + mainW + 3, tY + tH)

    // --- SECCIÓN PRINCIPAL DEL BOLETO (IZQUIERDA) ---
    // Franja de acento roja de la marca
    doc.setFillColor(185, 28, 28) // Red 700
    doc.rect(tX + 0.3, tY + 0.3, 5, tH - 0.6, 'F')

    // Logo SOLD OUT
    doc.setTextColor(185, 28, 28)
    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    doc.text('SOLD OUT.', tX + 10, tY + 12)

    // Poster del evento con Aspect Ratio
    let flyerX = tX + 10
    let flyerY = tY + 18
    let flyerMaxWidth = 40
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
      flyerX += finalWidth + 6
    } catch(e) {
      flyerX += 46
    }

    // Datos del Evento
    const eventName = (eventData.value ? eventData.value.name : 'EVENTO').toUpperCase()
    doc.setTextColor(17, 24, 39)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    
    // Truncar nombre del evento si es demasiado largo
    const truncatedEventName = eventName.length > 25 ? eventName.substring(0, 22) + '...' : eventName
    doc.text(truncatedEventName, flyerX, tY + 16)

    // Fecha y hora
    doc.setFontSize(8.5)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(75, 85, 99) // Gray 600
    const timeVal = eventData.value && eventData.value.startTime ? ` • ${eventData.value.startTime} HRS` : ''
    const dateVal = eventData.value ? eventData.value.date : '15 OCT 2026'
    doc.text(`${dateVal}${timeVal}`, flyerX, tY + 22)

    // Recinto (diseño tipo cápsula / tag)
    const venueName = (eventData.value ? eventData.value.venue : 'ESTADIO NACIONAL').toUpperCase()
    doc.setFillColor(243, 244, 246) // Gray 100
    doc.roundedRect(flyerX, tY + 26, 68, 6, 1, 1, 'F')
    doc.setTextColor(55, 65, 81) // Gray 700
    doc.setFontSize(7.5)
    doc.setFont('helvetica', 'bold')
    doc.text(venueName.substring(0, 36), flyerX + 2.5, tY + 30.2)

    // Separador horizontal fino
    doc.setDrawColor(243, 244, 246)
    doc.setLineWidth(0.2)
    doc.line(flyerX, tY + 36, flyerX + 68, tY + 36)

    // Datos del Asistente (Columna vertical limpia)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(156, 163, 175)
    doc.text('NOMBRE DEL ASISTENTE', flyerX, tY + 43)
    doc.setTextColor(17, 24, 39)
    doc.setFontSize(10.5)
    doc.setFont('helvetica', 'bold')
    doc.text(attendeeName.toUpperCase(), flyerX, tY + 48.5)

    // Localidad (Tipo de boleto)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(156, 163, 175)
    doc.text('LOCALIDAD / ACCESO', flyerX, tY + 57)
    doc.setTextColor(185, 28, 28)
    doc.setFontSize(10.5)
    doc.setFont('helvetica', 'bold')
    doc.text(currentTicketType.toUpperCase(), flyerX, tY + 62.5)

    // --- SECCIÓN DERECHA: TALÓN DE CONTROL (DERECHA) ---
    doc.setTextColor(55, 65, 81)
    doc.setFontSize(9)
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
    const qrY = tY + 18
    doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize)

    // Ticket ID abreviado de control
    const shortId = ticketId.length > 10 ? ticketId.substring(0, 8).toUpperCase() : ticketId
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(75, 85, 99)
    doc.text(`TKT-${shortId}`, tX + mainW + (stubW/2), qrY + qrSize + 6, { align: 'center' })

    doc.setFontSize(6.5)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(156, 163, 175)
    doc.text('SOLD OUT TICKET', tX + mainW + (stubW/2), tY + tH - 5, { align: 'center' })
  }

  // Guardar el archivo PDF único
  doc.save(`Boletos_${eventData.value?.name || 'Evento'}_${totalQuantity.value}x.pdf`)

  // Enviar el PDF generado al correo del comprador vía backend (de forma no bloqueante)
  try {
    const pdfDataUrl = doc.output('datauristring')
    const orderId = createdTickets[0]?.orderId || data.orderId || 'temp'
    const emailApiUrl = import.meta.env.VITE_API_URL 
      ? `${import.meta.env.VITE_API_URL}/api/orders/${orderId}/send-email` 
      : `http://localhost:3001/api/orders/${orderId}/send-email`
      
    fetch(emailApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        pdfDataUrl,
        buyerEmail: buyerEmail.value.trim(),
        buyerName: buyerName.value.trim()
      })
    });
  } catch (emailError) {
    console.error("Error al despachar el correo con PDF:", emailError);
  }

  alert('¡Pago procesado con éxito! Tus boletos se han descargado automáticamente a tu computadora y enviado por correo.')
  router.push('/')
}

onMounted(async () => {
  window.scrollTo(0, 0)
  
  // Cargar datos del usuario si tiene sesión activa
  const savedCustomer = localStorage.getItem('customerData')
  if (savedCustomer) {
    try {
      const customer = JSON.parse(savedCustomer)
      buyerName.value = customer.name || ''
      buyerEmail.value = customer.email || ''
      isLoggedIn.value = true
    } catch (e) {
      console.error("Error al leer datos del customer:", e)
    }
  }

  // Cargar información real del evento
  const eventId = route.query.eventId
  if (eventId) {
    try {
      const apiUrl = import.meta.env.VITE_API_URL 
        ? `${import.meta.env.VITE_API_URL}/api/events/${eventId}` 
        : `http://localhost:3001/api/events/${eventId}`
      const res = await fetch(apiUrl)
      if (res.ok) {
        eventData.value = await res.json()
      }
    } catch (error) {
      console.error("Error al cargar evento en Checkout:", error)
    }
  }
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

/* Estilos de la información de comprador */
.buyer-info-badge {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 1.2rem;
  border-radius: 8px;
  color: var(--color-white);
  margin-top: 1rem;
  font-size: 0.95rem;
}
.buyer-info-badge strong {
  color: var(--color-accent);
}
.contact-form {
  margin-top: 1rem;
}
</style>
