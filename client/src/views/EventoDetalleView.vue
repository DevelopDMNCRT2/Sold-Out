<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const eventId = route.params.id

// Estructura vacía inicial con valores por defecto para evitar errores al renderizar antes de que responda la API
const event = ref({
  id: eventId,
  title: 'Cargando...',
  subtitle: '',
  date: '',
  time: '',
  location: '',
  address: '',
  description: '',
  headerImg: '/hero.png',
  posterImg: '/poster.png',
  venueMap: '/venue.png',
  tickets: [],
  allowMultiple: false
})

const quantity = ref(1)
const selectedTicketType = ref('')
const selectedQuantities = ref({})

const currentTicket = computed(() => {
  if (!event.value || !event.value.tickets || event.value.tickets.length === 0) return null
  return event.value.tickets.find(t => t.type === selectedTicketType.value)
})

const priceBreakdown = computed(() => {
  let basePrice = 0
  let totalQty = 0
  
  if (event.value.allowMultiple) {
    event.value.tickets.forEach(t => {
      const qty = selectedQuantities.value[t.type] || 0
      basePrice += t.price * qty
      totalQty += qty
    })
  } else {
    if (!currentTicket.value) {
      return {
        subtotal: 0,
        totalQty: 0,
        serviceFee: 0,
        taxes: 0,
        total: 0
      }
    }
    basePrice = currentTicket.value.price * quantity.value
    totalQty = quantity.value
  }
  
  const serviceFee = basePrice * 0.10 // 10%
  const taxes = basePrice * 0.16 // 16% IVA
  const total = basePrice + serviceFee + taxes
  
  return {
    subtotal: basePrice,
    totalQty,
    serviceFee,
    taxes,
    total
  }
})

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount)
}

const maxAvailable = computed(() => {
  if (!currentTicket.value) return 0
  return Math.max(0, currentTicket.value.stock - currentTicket.value.sold)
})

const increment = () => { 
  if (quantity.value < Math.min(10, maxAvailable.value)) {
    quantity.value++ 
  } 
}
const decrement = () => { if (quantity.value > 1) quantity.value-- }

const incrementMultiple = (type) => {
  const ticket = event.value.tickets.find(t => t.type === type)
  const current = selectedQuantities.value[type] || 0
  const max = ticket ? Math.max(0, ticket.stock - ticket.sold) : 0
  if (current < Math.min(10, max)) {
    selectedQuantities.value[type] = current + 1
  }
}

const decrementMultiple = (type) => {
  const current = selectedQuantities.value[type] || 0
  if (current > 0) {
    selectedQuantities.value[type] = current - 1
  }
}

// Watch selected type to adapt quantity to stock limits
import { watch } from 'vue'
watch(selectedTicketType, (newType) => {
  const ticket = event.value.tickets.find(t => t.type === newType)
  const max = ticket ? Math.max(0, ticket.stock - ticket.sold) : 0
  if (max === 0) {
    quantity.value = 0
  } else if (quantity.value > max) {
    quantity.value = max
  } else if (quantity.value === 0 && max > 0) {
    quantity.value = 1
  }
})

const goToCheckout = () => {
  if (event.value.allowMultiple) {
    const cart = []
    event.value.tickets.forEach(t => {
      const qty = selectedQuantities.value[t.type] || 0
      if (qty > 0) {
        cart.push({ type: t.type, qty })
      }
    })
    
    if (cart.length === 0) {
      alert('Por favor, selecciona al menos un boleto.')
      return
    }
    
    router.push({
      path: '/checkout',
      query: {
        eventId: event.value.id,
        cart: JSON.stringify(cart)
      }
    })
  } else {
    router.push({
      path: '/checkout',
      query: {
        eventId: event.value.id,
        qty: quantity.value,
        type: selectedTicketType.value
      }
    })
  }
}

onMounted(async () => {
  window.scrollTo(0, 0)
  
  try {
    const apiUrl = import.meta.env.VITE_API_URL 
      ? `${import.meta.env.VITE_API_URL}/api/events/${eventId}` 
      : `http://localhost:3001/api/events/${eventId}`
    const res = await fetch(apiUrl)
    if (res.ok) {
      const data = await res.json()
      event.value = {
        id: data.id,
        title: data.name,
        subtitle: data.artist,
        date: data.date || '',
        time: data.startTime || '',
        location: data.venue || 'Por definir',
        address: data.address || '',
        description: data.longDescription || data.shortDescription || '',
        headerImg: data.bannerImage || '/hero.png',
        posterImg: data.coverImage || '/poster.png',
        venueMap: data.mapUrl || '/venue.png',
        tickets: (data.ticketTiers || []).map(t => ({ type: t.name, price: t.price, stock: t.stock, sold: t.sold })),
        allowMultiple: data.allowMultiple || false
      }
      
      if (event.value.tickets.length > 0) {
        selectedTicketType.value = event.value.tickets[0].type
        event.value.tickets.forEach(t => {
          selectedQuantities.value[t.type] = 0
        })
      }
    } else {
      console.error("No se pudo obtener la información del evento de la API.")
    }
  } catch (error) {
    console.error("Error al cargar detalles del evento:", error)
  }
})
</script>

<template>
  <div class="event-detail-page">
    <!-- Header Hero -->
    <div class="event-hero" :style="{ backgroundImage: `url(${event.headerImg})` }">
      <div class="hero-overlay"></div>
      <div class="container hero-content text-center">
        <h1 class="event-title">{{ event.title }}</h1>
        <p class="event-subtitle">{{ event.subtitle }}</p>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="container event-content">
      <div class="content-grid">
        
        <!-- Left Column: Details & Venue -->
        <div class="content-main">
          
          <div class="detail-section">
            <h2 class="section-title">Sobre el Evento</h2>
            <p class="event-description">{{ event.description }}</p>
          </div>

          <div class="detail-section info-grid">
            <div class="info-box">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="var(--color-accent)" viewBox="0 0 16 16"><path d="M10.854 7.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 9.793l2.646-2.647a.5.5 0 0 1 .708 0z"/><path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/></svg>
              <div>
                <h4>Horario</h4>
                <p>{{ event.date }}</p>
                <p class="text-light">{{ event.time }}</p>
              </div>
            </div>
            
            <div class="info-box">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="var(--color-accent)" viewBox="0 0 16 16"><path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/></svg>
              <div>
                <h4>Ubicación</h4>
                <p>{{ event.location }}</p>
                <p class="text-light">{{ event.address }}</p>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h2 class="section-title">Croquis del Lugar</h2>
            <div class="venue-map">
              <img :src="event.venueMap" alt="Croquis del recinto" />
            </div>
          </div>

        </div>

        <!-- Right Column: Tickets & Poster -->
        <div class="content-sidebar">
          
          <!-- Poster -->
          <div class="poster-wrapper">
            <img :src="event.posterImg" :alt="event.title" class="event-poster" />
          </div>

          <!-- Tickets Module -->
          <div class="tickets-module">
            <h3>Comprar Entradas</h3>
            
            <div class="purchase-form">
              <!-- MULTIPLE TICKETS MODE (allowMultiple: true) -->
              <div v-if="event.allowMultiple" class="multiple-tickets-container">
                <div v-for="ticket in event.tickets" :key="ticket.type" class="ticket-tier-row">
                  <div class="ticket-tier-info">
                    <span class="ticket-tier-name">{{ ticket.type }}</span>
                    <span class="ticket-tier-price">{{ formatCurrency(ticket.price) }}</span>
                  </div>
                  <div class="quantity-selector">
                    <span v-if="ticket.stock - ticket.sold <= 0" class="text-xs text-red-500 font-semibold uppercase tracking-wider py-2">Agotado</span>
                    <template v-else>
                      <button @click="decrementMultiple(ticket.type)" class="qty-btn" :disabled="!selectedQuantities[ticket.type] || selectedQuantities[ticket.type] <= 0">-</button>
                      <span class="qty-display">{{ selectedQuantities[ticket.type] || 0 }}</span>
                      <button @click="incrementMultiple(ticket.type)" class="qty-btn" :disabled="(selectedQuantities[ticket.type] || 0) >= Math.min(10, ticket.stock - ticket.sold)">+</button>
                    </template>
                  </div>
                </div>
              </div>

              <!-- SINGLE TICKET MODE (allowMultiple: false) -->
              <div v-else class="single-ticket-container">
                <div class="form-group">
                  <label for="ticketType">Tipo de Boleto</label>
                  <select id="ticketType" v-model="selectedTicketType" class="form-control">
                    <option v-for="ticket in event.tickets" :key="ticket.type" :value="ticket.type" :disabled="ticket.stock - ticket.sold <= 0">
                      {{ ticket.type }} - {{ formatCurrency(ticket.price) }} {{ ticket.stock - ticket.sold <= 0 ? '(Agotado)' : `(${ticket.stock - ticket.sold} disponibles)` }}
                    </option>
                  </select>
                </div>

                <div class="form-group">
                  <label>Cantidad</label>
                  <div class="quantity-selector">
                    <span v-if="maxAvailable <= 0" class="text-sm text-red-500 font-semibold uppercase tracking-wider py-2">Agotado</span>
                    <template v-else>
                      <button @click="decrement" class="qty-btn" :disabled="quantity <= 1">-</button>
                      <span class="qty-display">{{ quantity }}</span>
                      <button @click="increment" class="qty-btn" :disabled="quantity >= Math.min(10, maxAvailable)">+</button>
                    </template>
                  </div>
                </div>
              </div>

              <div class="price-breakdown" v-if="priceBreakdown">
                <div class="breakdown-row">
                  <span>Subtotal (x{{ event.allowMultiple ? priceBreakdown.totalQty : quantity }})</span>
                  <span>{{ formatCurrency(priceBreakdown.subtotal) }}</span>
                </div>
                <div class="breakdown-row">
                  <span>Cargo por servicio (10%)</span>
                  <span>{{ formatCurrency(priceBreakdown.serviceFee) }}</span>
                </div>
                <div class="breakdown-row">
                  <span>Impuestos (16%)</span>
                  <span>{{ formatCurrency(priceBreakdown.taxes) }}</span>
                </div>
                <hr class="breakdown-divider">
                <div class="breakdown-row total-row">
                  <span>Total</span>
                  <span>{{ formatCurrency(priceBreakdown.total) }}</span>
                </div>
              </div>

              <button 
                class="btn btn-primary btn-block purchase-btn" 
                :disabled="event.allowMultiple ? (!priceBreakdown || priceBreakdown.totalQty <= 0) : (maxAvailable <= 0)" 
                @click="goToCheckout"
              >
                {{ (event.allowMultiple ? (priceBreakdown && priceBreakdown.totalQty > 0 ? 'Proceder al Pago' : 'Selecciona boletos') : (maxAvailable <= 0 ? 'Agotado' : 'Proceder al Pago')) }}
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
/* Page Layout */
.event-detail-page {
  background-color: var(--color-black);
  min-height: 100vh;
}

/* Hero Header */
.event-hero {
  position: relative;
  height: 50vh;
  min-height: 400px;
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 4rem;
}

.hero-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.9) 100%);
  z-index: 1;
}

.hero-content {
  position: relative;
  z-index: 2;
}

.event-title {
  font-family: var(--font-display);
  font-size: 3.5rem;
  font-weight: 900;
  color: #ffffff; /* Asegurar color blanco sólido */
  text-transform: uppercase;
  margin-bottom: 0.5rem;
  text-shadow: 0 4px 12px rgba(0,0,0,0.8); /* Sombra de texto pronunciada para contraste */
}

.event-subtitle {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.8); /* Color claro con leve opacidad */
  text-shadow: 0 2px 6px rgba(0,0,0,0.8);
}

/* Main Content Grid */
.event-content {
  padding: 4rem 0;
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 3rem;
}

@media (min-width: 992px) {
  .content-grid {
    grid-template-columns: 2fr 1fr;
    align-items: start;
  }
}

/* Detail Sections */
.detail-section {
  margin-bottom: 4rem;
}

.detail-section .section-title {
  text-align: left;
  margin-bottom: 1.5rem;
  font-size: 2rem;
}

.detail-section .section-title::after {
  left: 0;
  transform: none;
}

.event-description {
  font-size: 1.15rem;
  line-height: 1.8;
  color: var(--color-light-gray);
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  background-color: var(--color-dark-gray);
  padding: 2rem;
  border-radius: 8px;
  border: 1px solid var(--color-gray);
}

@media (min-width: 768px) {
  .info-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.info-box {
  display: flex;
  gap: 1.5rem;
}

.info-box svg {
  flex-shrink: 0;
  margin-top: 4px;
}

.info-box h4 {
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  color: var(--color-white);
}

.info-box p {
  margin-bottom: 0.2rem;
  font-size: 1rem;
}

.text-light {
  color: var(--color-light-gray);
}

.venue-map {
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid var(--color-gray);
}

.venue-map img {
  width: 100%;
  height: auto;
  display: block;
}

/* Sidebar */
.content-sidebar {
  position: sticky;
  top: 100px;
}

.poster-wrapper {
  margin-bottom: 2rem;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  border: 1px solid var(--color-gray);
}

.event-poster {
  width: 100%;
  display: block;
}

.tickets-module {
  background-color: var(--color-dark-gray);
  padding: 2rem;
  border-radius: 8px;
  border: 1px solid var(--color-gray);
}

.tickets-module h3 {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  text-align: center;
  text-transform: uppercase;
}

/* Purchase Form */
.purchase-form {
  background-color: rgba(0,0,0,0.3);
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid var(--color-gray);
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: var(--color-light-gray);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.form-control {
  width: 100%;
  padding: 0.8rem;
  background-color: transparent;
  border: 2px solid var(--color-gray);
  color: var(--color-white);
  border-radius: 6px;
  font-family: inherit;
  font-size: 1rem;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.form-control:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px rgba(139, 0, 0, 0.2);
}

.quantity-selector {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.qty-btn {
  background-color: var(--color-gray);
  border: none;
  color: var(--color-white);
  width: 40px;
  height: 40px;
  border-radius: 4px;
  font-size: 1.5rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qty-btn:hover:not(:disabled) {
  background-color: var(--color-accent);
}

.qty-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.qty-display {
  font-size: 1.2rem;
  font-weight: 700;
  min-width: 30px;
  text-align: center;
}

.price-breakdown {
  background-color: rgba(255,255,255,0.02);
  padding: 1.2rem;
  border-radius: 6px;
  margin-bottom: 1.5rem;
}

.breakdown-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
  color: var(--color-light-gray);
}

.breakdown-divider {
  border: none;
  border-top: 1px solid var(--color-gray);
  margin: 1rem 0;
}

.total-row {
  font-size: 1.2rem;
  font-weight: 900;
  color: var(--color-white);
  margin-bottom: 0;
  align-items: center;
}

.total-row span:last-child {
  color: var(--color-accent);
  font-family: var(--font-display);
  font-size: 1.5rem;
}

.purchase-btn {
  font-size: 1.1rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.btn-block {
  width: 100%;
  padding: 1rem;
  font-weight: 700;
}

/* ticket-tier-row layout */
.ticket-tier-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.ticket-tier-row:last-child {
  border-bottom: none;
}

.ticket-tier-info {
  display: flex;
  flex-direction: column;
}

.ticket-tier-name {
  font-weight: 600;
  color: var(--color-white);
  font-size: 0.95rem;
}

.ticket-tier-price {
  font-size: 0.85rem;
  color: var(--color-accent);
  margin-top: 2px;
}

.multiple-tickets-container {
  margin-bottom: 1.5rem;
  background: rgba(255, 255, 255, 0.02);
  padding: 0 16px;
  border-radius: 8px;
  border: 1px solid var(--color-gray);
}
</style>
