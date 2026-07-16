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
            <p class="section-desc">Selecciona tu método de pago y completa la transacción de forma segura.</p>
            
            <!-- Payment Method Selector Tabs -->
            <div class="payment-tabs">
              <button 
                type="button" 
                class="tab-btn" 
                :class="{ active: paymentMethod === 'simulation' }" 
                @click="setPaymentMethod('simulation')"
              >
                Simulador (Tarjeta Virtual)
              </button>
              <button 
                type="button" 
                class="tab-btn" 
                :class="{ active: paymentMethod === 'mercadopago' }" 
                @click="setPaymentMethod('mercadopago')"
              >
                Tarjeta Real (Mercado Pago)
              </button>
            </div>

            <!-- SIMULATOR FLOW -->
            <div v-if="paymentMethod === 'simulation'" class="payment-form">
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

            <!-- MERCADO PAGO FLOW -->
            <div v-show="paymentMethod === 'mercadopago'" class="mp-form-container">
              <div v-if="isMpLoading" class="mp-loading">Cargando pasarela de pago...</div>
              <div id="cardPaymentBrick_container"></div>
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

            <button v-if="paymentMethod === 'simulation'" class="btn btn-primary btn-block pay-btn" @click="processPayment">
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
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

// Mercado Pago integration state
const paymentMethod = ref('simulation')
const isMpLoading = ref(false)
const mpBrickController = ref(null)

const setPaymentMethod = (method) => {
  paymentMethod.value = method
  if (method === 'mercadopago' && !mpBrickController.value) {
    loadMercadoPago()
  }
}

// Carga dinámica del SDK de Mercado Pago
const loadMercadoPago = () => {
  isMpLoading.value = true
  
  // Set a timeout to notify about potential ad-blocker blocks
  setTimeout(() => {
    if (isMpLoading.value && paymentMethod.value === 'mercadopago') {
      const msg = document.querySelector('.mp-loading')
      if (msg) {
        msg.innerHTML = `Cargando pasarela de pago... <br><span style="font-size: 0.8rem; color: #f87171; display: block; margin-top: 0.5rem; font-weight: bold;">¿Tarda demasiado? Por favor revisa si tienes algún AdBlocker o Brave Shield activado que esté bloqueando el script de seguridad de Mercado Pago.</span>`
      }
    }
  }, 4000)

  if (window.MercadoPago) {
    initMPBrick()
    return
  }
  const script = document.createElement('script')
  script.src = 'https://sdk.mercadopago.com/js/v2'
  script.onload = () => {
    initMPBrick()
  }
  script.onerror = () => {
    isMpLoading.value = false
    alert('Error al cargar la pasarela de Mercado Pago. Inténtalo de nuevo.')
  }
  document.head.appendChild(script)
}

const initMPBrick = async () => {
  try {
    const publicKey = import.meta.env.VITE_MERCADO_PAGO_PUBLIC_KEY || 'TEST-abd7c78c-e45b-4f36-8433-58af7ef2779c'
    const mp = new window.MercadoPago(publicKey, { locale: 'es-MX' })
    const bricksBuilder = mp.bricks()
    
    // Si ya existe un brick, lo desmontamos antes de recrear de forma segura
    if (mpBrickController.value) {
      try {
        await mpBrickController.value.unmount()
      } catch (unmountError) {
        console.warn("Error al desmontar brick anterior:", unmountError)
      }
    }
    
    // Limpiar el contenedor de cualquier nodo residual para evitar conflictos del constructor
    const container = document.getElementById('cardPaymentBrick_container')
    if (container) {
      container.innerHTML = ''
    }
    
    mpBrickController.value = await bricksBuilder.create(
      'cardPayment',
      'cardPaymentBrick_container',
      {
        initialization: {
          amount: total.value,
          payer: {
            email: buyerEmail.value || 'cliente@correo.com',
          },
        },
        customization: {
          visual: {
            style: {
              theme: document.documentElement.getAttribute('data-theme') === 'light' ? 'default' : 'dark',
              customVariables: {
                baseColor: '#b91c1c', // Botón principal y acentos en Rojo
                formBackgroundColor: document.documentElement.getAttribute('data-theme') === 'light' ? '#ffffff' : '#121212',
                inputBackgroundColor: document.documentElement.getAttribute('data-theme') === 'light' ? '#ffffff' : '#1c1c1c',
                textPrimaryColor: document.documentElement.getAttribute('data-theme') === 'light' ? '#111827' : '#ffffff',
                buttonTextColor: '#ffffff' // Texto de botón blanco
              }
            },
          },
        },
        callbacks: {
          onReady: () => {
            isMpLoading.value = false
          },
          onSubmit: (formData) => {
            return new Promise((resolve, reject) => {
              processMercadoPagoPayment(formData, resolve, reject)
            })
          },
          onError: (error) => {
            console.error('Error de Mercado Pago Brick:', error)
            isMpLoading.value = false
          },
        },
      }
    )
  } catch (error) {
    console.error('Error al inicializar Brick de Mercado Pago:', error)
    isMpLoading.value = false
  }
}

// Procesar el pago con el backend a través del Brick
const processMercadoPagoPayment = async (formData, resolveBrick, rejectBrick) => {
  if (!buyerName.value.trim() || !buyerEmail.value.trim()) {
    alert('Por favor, ingresa los datos del comprador.')
    rejectBrick()
    return
  }

  if (attendees.value.some(name => !name.trim())) {
    alert('Por favor, ingresa los nombres de todos los asistentes.')
    rejectBrick()
    return
  }

  const phoneVal = buyerPhone.value.trim()
  if (phoneVal && phoneVal.length !== 10) {
    alert('Por favor, ingresa un número de teléfono de contacto de exactamente 10 dígitos.')
    rejectBrick()
    return
  }

  try {
    const eventId = route.query.eventId || '1'
    const apiUrl = import.meta.env.VITE_API_URL 
      ? `${import.meta.env.VITE_API_URL}/api/orders/mercado-pago` 
      : 'http://localhost:3001/api/orders/mercado-pago'

    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        token: formData.token,
        issuer_id: formData.issuer_id,
        payment_method_id: formData.payment_method_id,
        transaction_amount: formData.transaction_amount,
        installments: formData.installments,
        payer: formData.payer,
        orderData: {
          eventId: eventId,
          buyerName: buyerName.value.trim(),
          buyerEmail: buyerEmail.value.trim(),
          buyerPhone: buyerPhone.value.trim() || '5500000000',
          tickets: cartItems.value.map(item => ({
            ticketTierId: item.type,
            qty: item.qty
          }))
        }
      })
    })

    if (!res.ok) {
      const errData = await res.json()
      throw new Error(errData.error || 'Error al procesar el pago en el servidor.')
    }

    const data = await res.json()
    const createdTickets = data.tickets || []

    // Pago exitoso! Generamos PDF
    await generatePdfAndNotify(createdTickets, data)
    
    resolveBrick() // Notificar al brick que el pago fue procesado con éxito
  } catch (error) {
    console.error('Error al procesar pago con Mercado Pago:', error)
    alert(`No se pudo procesar la compra: ${error.message}`)
    rejectBrick() // Notificar al brick que hubo un error
  }
}

// Simulador: Procesar Pago
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
    
    // Generar PDF y enviar correo
    await generatePdfAndNotify(createdTickets, data)
  } catch (error) {
    console.error("Error al procesar el pago simulado:", error)
    alert(`No se pudo procesar la compra: ${error.message}`)
  }
}

// Función auxiliar para generar el PDF y disparar el correo (compartida por simulador y MP)
const generatePdfAndNotify = async (createdTickets, data) => {
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
    const stubW = 48 // Ancho del talón de acceso
    const mainW = tW - stubW

    // Cuerpo del boleto con bordes redondeados en rojo para la franja lateral izquierda
    doc.setFillColor(185, 28, 28) // Rojo de la marca
    doc.setDrawColor(229, 231, 235) // Borde gris claro
    doc.setLineWidth(0.3)
    doc.roundedRect(tX, tY, tW, tH, 4, 4, 'FD')

    // Tapar la parte derecha con un rectángulo blanco para dejar solo la franja lateral izquierda roja
    doc.setFillColor(255, 255, 255)
    doc.rect(tX + 10, tY + 0.3, tW - 10.3, tH - 0.6, 'F')

    // Volver a dibujar el contorno redondeado del boleto (solo borde) para que quede perfecto
    doc.setDrawColor(229, 231, 235)
    doc.setLineWidth(0.3)
    doc.roundedRect(tX, tY, tW, tH, 4, 4, 'D')

    // Línea punteada de corte (entre boleto principal y talón)
    doc.setDrawColor(209, 213, 219)
    doc.setLineDash([1.5, 2.5], 0)
    doc.line(tX + mainW, tY, tX + mainW, tY + tH)
    doc.setLineDash([])

    // Muescas semicirculares de boleto clásico en la línea de corte
    doc.setFillColor(255, 255, 255)
    doc.setDrawColor(229, 231, 235)
    doc.ellipse(tX + mainW, tY, 3.5, 3.5, 'FD')
    doc.ellipse(tX + mainW, tY + tH, 3.5, 3.5, 'FD')

    // --- TEXTO VERTICAL EN LA FRANJA IZQUIERDA (SOLD OUT.) ---
    doc.saveGraphicsState()
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('SOLD OUT.', tX + 6.5, tY + 54, { angle: 90 })
    doc.restoreGraphicsState()

    // --- PORTADA/FLYER DEL EVENTO (100% CUADRADA) ---
    let flyerX = tX + 14
    let flyerWidth = 38
    let flyerHeight = 38
    let flyerY = tY + (tH - flyerHeight) / 2
    try {
      doc.addImage(posterImg, 'PNG', flyerX, flyerY, flyerWidth, flyerHeight)
      
      // Dibujar borde decorativo redondeado para simular las esquinas de la portada
      doc.setDrawColor(229, 231, 235)
      doc.setLineWidth(0.2)
      doc.roundedRect(flyerX, flyerY, flyerWidth, flyerHeight, 1.5, 1.5, 'D')
    } catch(e) {
      console.error("Error al renderizar poster en PDF:", e.message)
    }

    // --- COLUMNA DE DATOS DEL EVENTO (DERECHA DEL POSTER) ---
    const infoX = flyerX + flyerWidth + 6

    // Etiqueta EVENTO
    doc.setFontSize(7.5)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(156, 163, 175) // Gray 400
    doc.text('EVENTO', infoX, tY + 15)

    // Nombre del evento
    const eventName = (eventData.value ? eventData.value.name : 'EVENTO').toUpperCase()
    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(17, 24, 39) // Gray 900
    const truncatedEventName = eventName.length > 25 ? eventName.substring(0, 22) + '...' : eventName
    doc.text(truncatedEventName, infoX, tY + 21)

    // Fecha y Hora alineadas horizontalmente
    doc.setFontSize(8.5)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(55, 65, 81) // Gray 700
    const dateVal = eventData.value ? eventData.value.date : '15 OCT 2026'
    const timeVal = eventData.value && eventData.value.startTime ? eventData.value.startTime : '20:00'
    doc.text(`${dateVal}       |       ${timeVal} HRS`, infoX, tY + 29)

    // Recinto / Lugar
    const venueName = (eventData.value ? eventData.value.venue : 'ESTADIO NACIONAL').toUpperCase()
    doc.setFontSize(8.5)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(55, 65, 81)
    doc.text(venueName, infoX, tY + 36)

    // Línea separadora horizontal fina
    doc.setDrawColor(243, 244, 246)
    doc.setLineWidth(0.3)
    doc.line(infoX, tY + 41, tX + mainW - 6, tY + 41)

    // --- DATOS DEL ASISTENTE Y BOLETO (CUADRÍCULA 2x2) ---
    const colW = 34 // Ancho de columnas del grid

    // Fila 1: Asistente & Acceso
    // Col 1: Asistente
    doc.setFontSize(7.5)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(156, 163, 175)
    doc.text('ASISTENTE', infoX, tY + 47)
    doc.setFontSize(9.5)
    doc.setTextColor(17, 24, 39)
    doc.text(attendeeName.toUpperCase(), infoX, tY + 52)

    // Col 2: Acceso
    doc.setFontSize(7.5)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(156, 163, 175)
    doc.text('ACCESO', infoX + colW, tY + 47)
    doc.setFontSize(9.5)
    doc.setTextColor(17, 24, 39)
    doc.text(currentTicketType.toUpperCase(), infoX + colW, tY + 52)

    // Fila 2: Código & Tipo
    // Col 1: Código de Boleto
    doc.setFontSize(7.5)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(156, 163, 175)
    doc.text('CÓDIGO DE BOLETO', infoX, tY + 61)
    doc.setFontSize(9.5)
    doc.setTextColor(17, 24, 39)
    const shortId = ticketId.length > 10 ? ticketId.substring(0, 8).toUpperCase() : ticketId
    doc.text(`TKT-${shortId}`, infoX, tY + 66)

    // Col 2: Tipo de Boleto
    doc.setFontSize(7.5)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(156, 163, 175)
    doc.text('TIPO DE BOLETO', infoX + colW, tY + 61)
    doc.setFontSize(9.5)
    doc.setTextColor(185, 28, 28) // Rojo acento
    doc.text(`ACCESO ${currentTicketType.toUpperCase()}`, infoX + colW, tY + 66)

    // --- SECCIÓN DERECHA: TALÓN DE CONTROL (DERECHA) ---
    const stubX = tX + mainW

    // Texto ACCESO arriba
    doc.setTextColor(75, 85, 99)
    doc.setFontSize(8.5)
    doc.setFont('helvetica', 'bold')
    doc.text('ACCESO', stubX + (stubW/2), tY + 12, { align: 'center' })

    // Generar y dibujar código QR
    const qrDataUrl = await QRCode.toDataURL(ticketId, {
      color: { dark: '#000000', light: '#ffffff' },
      width: 120,
      margin: 0
    })
    const qrSize = 28
    const qrX = stubX + (stubW - qrSize) / 2
    const qrY = tY + 17
    doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize)

    // ID del Boleto debajo del QR
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(17, 24, 39)
    doc.text(`TKT-${shortId}`, stubX + (stubW/2), qrY + qrSize + 5, { align: 'center' })

    // Banner decorativo de instrucción de uso al fondo del talón
    const bannerY = tY + 61
    const bannerH = tH - 61 - 0.3
    doc.setFillColor(249, 250, 251) // Gris muy claro
    doc.rect(stubX + 0.3, bannerY, stubW - 0.6, bannerH, 'F')

    // Texto del banner instruccional
    doc.setFontSize(5.5)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(156, 163, 175)
    doc.text('PRESENTA ESTE BOLETO', stubX + (stubW/2), bannerY + 5, { align: 'center' })
    doc.text('IMPRESO O EN TU CELULAR', stubX + (stubW/2), bannerY + 8, { align: 'center' })
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

  // Observe theme changes to dynamically re-initialize Mercado Pago Brick
  if (typeof MutationObserver !== 'undefined') {
    themeObserver = new MutationObserver(() => {
      if (paymentMethod.value === 'mercadopago' && window.MercadoPago) {
        initMPBrick()
      }
    })
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
  }
})

let themeObserver = null

onUnmounted(() => {
  if (themeObserver) {
    themeObserver.disconnect()
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

/* Mercado Pago integration styles */
.payment-tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid var(--color-gray);
  padding-bottom: 0.5rem;
}
.tab-btn {
  background: transparent;
  border: none;
  color: var(--color-light-gray);
  font-weight: 600;
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border-bottom: 2px solid transparent;
}
.tab-btn.active {
  color: var(--color-accent);
  border-bottom-color: var(--color-accent);
}
.mp-form-container {
  margin-top: 1rem;
  min-height: 250px;
}
.mp-loading {
  text-align: center;
  color: var(--color-light-gray);
  padding: 2rem 0;
  font-style: italic;
}

/* Custom styling to force Mercado Pago Bricks elements to match SoldOut brand design */
#cardPaymentBrick_container {
  --mp-theme-color: var(--color-accent) !important;
}

:deep(.andes-button--primary),
:deep(#cardPaymentBrick_container button),
:deep(#cardPaymentBrick_container .andes-button),
:deep(#cardPaymentBrick_container .andes-button--primary) {
  background-color: var(--color-accent) !important;
  border-color: var(--color-accent) !important;
  color: #ffffff !important;
}

:deep(.andes-button--primary:hover),
:deep(#cardPaymentBrick_container button:hover),
:deep(#cardPaymentBrick_container .andes-button:hover) {
  background-color: #991b1b !important;
  border-color: #991b1b !important;
}
</style>
