<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const concerts = ref([
  { id: 1, title: 'Neon Nights Festival', date: '15 Oct 2026', location: 'Estadio Nacional', image: '/poster.png' },
  { id: 2, title: 'Rock Symphony', date: '22 Oct 2026', location: 'Arena Principal', image: '/poster.png' },
  { id: 3, title: 'Indie Vibes', date: '05 Nov 2026', location: 'Teatro Metropolitano', image: '/poster.png' },
  { id: 4, title: 'Techno Underground', date: '12 Nov 2026', location: 'Club Vertex', image: '/poster.png' },
  { id: 5, title: 'Jazz & Wine', date: '19 Nov 2026', location: 'Jardines del Centro', image: '/poster.png' },
  { id: 6, title: 'Metal Fest', date: '28 Nov 2026', location: 'Parque Bicentenario', image: '/poster.png' },
  { id: 7, title: 'Urban Flow', date: '03 Dic 2026', location: 'Foro Sol', image: '/poster.png' },
  { id: 8, title: 'Classical Evening', date: '10 Dic 2026', location: 'Auditorio Nacional', image: '/poster.png' },
])

const heroSlides = ref([
  {
    id: 1,
    title1: 'SIENTE LA MÚSICA',
    titleAccent: 'VIVE EL MOMENTO',
    subtitle: 'Descubre los mejores conciertos y eventos en tu ciudad.',
    btnText: 'Ver Cartelera',
    bgImage: '/hero.png'
  },
  {
    id: 2,
    title1: 'NEON NIGHTS',
    titleAccent: 'FESTIVAL 2026',
    subtitle: 'El evento electrónico más grande del año. Compra tus entradas ya.',
    btnText: 'Comprar Boletos',
    bgImage: '/hero.png'
  },
  {
    id: 3,
    title1: 'ROCK',
    titleAccent: 'SYMPHONY',
    subtitle: 'Tus clásicos favoritos interpretados por una majestuosa orquesta.',
    btnText: 'Más Información',
    bgImage: '/hero.png' 
  },
  {
    id: 4,
    title1: 'URBAN',
    titleAccent: 'FLOW FEST',
    subtitle: 'El mayor festival de música urbana en toda Latinoamérica.',
    btnText: 'Ver Lineup',
    bgImage: '/hero.png'
  },
  {
    id: 5,
    title1: 'INDIE',
    titleAccent: 'VIBES',
    subtitle: 'Música emergente, arte y gastronomía en un solo lugar.',
    btnText: 'Últimos Boletos',
    bgImage: '/hero.png'
  }
])

const currentSlide = ref(0)
let slideInterval = null

const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % heroSlides.value.length
}

const setSlide = (index) => {
  currentSlide.value = index
  resetInterval()
}

const resetInterval = () => {
  if (slideInterval) clearInterval(slideInterval)
  slideInterval = setInterval(nextSlide, 6000)
}

onMounted(() => {
  slideInterval = setInterval(nextSlide, 6000)
})

onUnmounted(() => {
  if (slideInterval) clearInterval(slideInterval)
})
</script>

<template>
  <div class="home">
    <!-- Hero / Cartelera Slider Section -->
    <section class="hero-slider">
      <div 
        v-for="(slide, index) in heroSlides" 
        :key="slide.id"
        class="hero-slide"
        :class="{ active: currentSlide === index }"
        :style="{ backgroundImage: `url(${slide.bgImage})` }"
      >
        <div class="hero-overlay"></div>
        <div class="container hero-content">
          <Transition name="fade-up" appear>
            <div v-if="currentSlide === index" class="hero-text-wrapper">
              <h1 class="hero-title">{{ slide.title1 }} <br><span class="text-accent">{{ slide.titleAccent }}</span></h1>
              <p class="hero-subtitle">{{ slide.subtitle }}</p>
              <button class="btn btn-primary hero-btn">{{ slide.btnText }}</button>
            </div>
          </Transition>
        </div>
      </div>
      
      <!-- Slider Controls -->
      <div class="hero-controls">
        <button 
          v-for="(slide, index) in heroSlides" 
          :key="slide.id"
          class="hero-dot"
          :class="{ active: currentSlide === index }"
          @click="setSlide(index)"
          :aria-label="`Ir a la diapositiva ${index + 1}`"
        ></button>
      </div>
    </section>

    <!-- Próximos Eventos Section -->
    <section class="section concerts-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">Próximos Eventos</h2>
        </div>
        <div class="concerts-grid">
          <RouterLink v-for="concert in concerts" :key="concert.id" :to="`/evento/${concert.id}`" class="concert-card" style="text-decoration: none; color: inherit; display: block;">
            <div class="card-image-wrapper">
              <img :src="concert.image" :alt="concert.title" class="card-image">
              <div class="card-overlay">
                <span class="btn btn-primary btn-sm">Ver Detalles</span>
              </div>
            </div>
            <div class="card-info">
              <h3 class="card-title">{{ concert.title }}</h3>
              <p class="card-date">{{ concert.date }}</p>
              <p class="card-location">{{ concert.location }}</p>
            </div>
          </RouterLink>
        </div>

        <div class="text-center" style="margin-top: 3.5rem;">
          <RouterLink to="/eventos" class="btn btn-outline btn-street" style="font-size: 1rem; padding: 0.8rem 2rem;">Ver Todos Los Eventos</RouterLink>
        </div>
      </div>
    </section>

    <!-- Promotional Section for Organizers -->
    <section class="section promo-street-section">
      <div class="container">
        <div class="promo-street-grid">
          
          <!-- Visual / Street Art Side -->
          <div class="promo-street-visual">
            <div class="street-poster poster-1">
              <img src="/poster.png" alt="Concierto" />
            </div>
            <div class="street-poster poster-2">
              <img src="/hero.png" alt="Concierto Hero" />
            </div>
            <div class="street-sticker">
              <span>SOLD OUT</span>
            </div>
          </div>

          <!-- Text Side -->
          <div class="promo-street-text">
            <h2 class="street-title">
              CREA LA <br>
              <span class="outline-text">EXPERIENCIA</span>
            </h2>
            <p class="street-description">
              Tú pones el talento y la vibra. Nosotros ponemos la plataforma. Vende tus boletos sin complicaciones y haz que tu próximo evento reviente.
            </p>
            <div class="street-actions">
              <button class="btn btn-primary btn-street">Hazlo Realidad</button>
            </div>
          </div>

        </div>
      </div>
    </section>

    <!-- Contact Section -->
    <section class="section contact-section">
      <div class="container">
        <div class="contact-wrapper">
          <div class="contact-info">
            <h2 class="section-title">Contacto</h2>
            <p>¿Tienes dudas sobre tus boletos o quieres más información? Escríbenos y nuestro equipo te atenderá a la brevedad.</p>
            <ul class="contact-details">
              <li><strong>Email:</strong> soporte@soldout.com</li>
              <li><strong>Teléfono:</strong> +52 55 1234 5678</li>
              <li><strong>Horario:</strong> Lunes a Viernes, 9am - 6pm</li>
            </ul>
          </div>
          <div class="contact-form-wrapper">
            <form class="contact-form" @submit.prevent>
              <div class="form-group">
                <input type="text" placeholder="Tu Nombre" required />
              </div>
              <div class="form-group">
                <input type="email" placeholder="Tu Email" required />
              </div>
              <div class="form-group">
                <textarea rows="4" placeholder="Tu Mensaje" required></textarea>
              </div>
              <button type="submit" class="btn btn-primary w-100">Enviar Mensaje</button>
            </form>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* Hero Slider Section */
.hero-slider {
  position: relative;
  height: 80vh;
  min-height: 500px;
  overflow: hidden;
  background-color: var(--color-black);
}

.hero-slide {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  opacity: 0;
  transition: opacity 1s ease-in-out;
  z-index: 0;
}

.hero-slide.active {
  opacity: 1;
  z-index: 1;
}

/* Transitions */
.fade-up-enter-active,
.fade-up-leave-active {
  transition: all 0.8s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.fade-up-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

.fade-up-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}

.hero-controls {
  position: absolute;
  bottom: 30px;
  left: 0;
  right: 0;
  z-index: 10;
  display: flex;
  justify-content: center;
  gap: 12px;
}

.hero-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.4);
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0;
}

.hero-dot:hover {
  background-color: rgba(255, 255, 255, 0.8);
}

.hero-dot.active {
  background-color: var(--color-accent);
  transform: scale(1.2);
  border-color: rgba(255,255,255,0.3);
}

.hero-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: linear-gradient(to right, rgba(5,5,5,0.9) 0%, rgba(5,5,5,0.4) 100%);
}

.hero-content {
  position: relative;
  z-index: 1;
  max-width: 800px;
}

.hero-title {
  font-size: 3.5rem;
  line-height: 1.1;
  margin-bottom: 1rem;
  text-transform: uppercase;
  color: #ffffff;
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.7);
}

.text-accent {
  color: var(--color-accent);
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.7);
}

.hero-subtitle {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  color: #f0f0f0;
  text-shadow: 1px 1px 5px rgba(0, 0, 0, 0.7);
}

.hero-btn {
  font-size: 1.1rem;
  padding: 1rem 2rem;
}

/* Common Section */
.section-title {
  font-size: 2.5rem;
  margin-bottom: 3rem;
  text-align: center;
  position: relative;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 4px;
  background-color: var(--color-accent);
}

/* Concerts Section */
.concerts-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}

@media (min-width: 640px) {
  .concerts-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 992px) {
  .concerts-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.concert-card {
  background-color: var(--color-dark-gray);
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid var(--color-gray);
}

.concert-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(139, 0, 0, 0.2);
  border-color: var(--color-accent);
}

.card-image-wrapper {
  position: relative;
  height: 300px;
  overflow: hidden;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.concert-card:hover .card-image {
  transform: scale(1.05);
}

.card-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(0,0,0,0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.concert-card:hover .card-overlay {
  opacity: 1;
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
}

.card-info {
  padding: 1.5rem;
}

.card-title {
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
}

.card-date, .card-location {
  font-size: 0.9rem;
  color: var(--color-light-gray);
  margin-bottom: 0.2rem;
}

/* Street Style Promo Section */
.promo-street-section {
  position: relative;
  background-color: var(--color-black);
  padding: 8rem 0;
  overflow: hidden;
  border-top: 4px dashed var(--color-gray);
  border-bottom: 4px dashed var(--color-gray);
}

/* Background gritty texture / text */
.promo-street-section::before {
  content: 'UNDERGROUND';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-5deg);
  font-size: 18vw;
  font-family: var(--font-display);
  font-weight: 900;
  color: transparent;
  -webkit-text-stroke: 1px rgba(255, 255, 255, 0.05);
  white-space: nowrap;
  pointer-events: none;
  z-index: 0;
}

[data-theme="light"] .promo-street-section::before {
  -webkit-text-stroke: 1px rgba(0, 0, 0, 0.05);
}

.promo-street-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 4rem;
  align-items: center;
  position: relative;
  z-index: 1;
}

@media (min-width: 992px) {
  .promo-street-grid {
    grid-template-columns: 1fr 1fr;
  }
}

/* Posters Visual */
.promo-street-visual {
  position: relative;
  height: 450px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.street-poster {
  position: absolute;
  box-shadow: 10px 10px 30px rgba(0,0,0,0.8);
  transition: transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  border: 12px solid #fff;
  background: #fff;
}

.street-poster img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.poster-1 {
  width: 220px;
  height: 300px;
  transform: rotate(-8deg) translateX(-50px);
  z-index: 2;
  filter: grayscale(80%) contrast(1.2);
}

.poster-2 {
  width: 260px;
  height: 350px;
  transform: rotate(5deg) translateX(50px);
  z-index: 1;
  filter: sepia(40%) hue-rotate(-20deg) contrast(1.1);
}

.promo-street-visual:hover .poster-1 {
  transform: rotate(-12deg) translateX(-60px) scale(1.05);
}

.promo-street-visual:hover .poster-2 {
  transform: rotate(8deg) translateX(60px) scale(1.05);
}

.street-sticker {
  position: absolute;
  bottom: 30px;
  right: 20px;
  background-color: var(--color-accent);
  color: #fff;
  font-family: var(--font-display);
  font-weight: 900;
  font-size: 1.5rem;
  padding: 0.5rem 1rem;
  transform: rotate(-15deg);
  box-shadow: 4px 4px 0 #121212;
  z-index: 3;
  border: 3px solid #121212;
}

/* Text */
.promo-street-text {
  text-align: left;
}

.street-title {
  font-family: var(--font-display);
  font-size: 4rem;
  font-weight: 900;
  line-height: 1.1;
  margin-bottom: 1.5rem;
  text-transform: uppercase;
}

@media (max-width: 768px) {
  .street-title {
    font-size: 3rem;
  }
}

.outline-text {
  color: transparent;
  -webkit-text-stroke: 2px var(--color-accent);
  text-shadow: none;
}

.street-description {
  font-size: 1.2rem;
  color: var(--color-light-gray);
  margin-bottom: 2.5rem;
  max-width: 500px;
}

.btn-street {
  font-size: 1.2rem;
  font-weight: 900;
  padding: 1rem 2.5rem;
  background-color: var(--color-accent);
  color: #fff;
  text-transform: uppercase;
  border-radius: 0;
  border: 3px solid #121212;
  box-shadow: 6px 6px 0 var(--color-white);
  transition: all 0.2s ease;
}

[data-theme="light"] .btn-street {
  box-shadow: 6px 6px 0 var(--color-black);
}

.btn-street:hover {
  transform: translate(2px, 2px);
  box-shadow: 4px 4px 0 var(--color-white);
}

[data-theme="light"] .btn-street:hover {
  box-shadow: 4px 4px 0 var(--color-black);
}

/* Contact Section */
.contact-section {
  background-color: var(--color-black);
}

.contact-wrapper {
  display: grid;
  grid-template-columns: 1fr;
  gap: 4rem;
}

@media (min-width: 768px) {
  .contact-wrapper {
    grid-template-columns: 1fr 1fr;
  }
}

.contact-info .section-title {
  text-align: left;
  margin-bottom: 2rem;
}

.contact-info .section-title::after {
  left: 0;
  transform: none;
}

.contact-info p {
  margin-bottom: 2rem;
  font-size: 1.1rem;
}

.contact-details {
  list-style: none;
}

.contact-details li {
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.contact-details strong {
  color: var(--color-white);
}

.contact-form {
  background-color: var(--color-dark-gray);
  padding: 2.5rem;
  border-radius: 8px;
  border: 1px solid var(--color-gray);
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 1rem;
  background-color: var(--color-black);
  border: 1px solid var(--color-gray);
  color: var(--color-white);
  border-radius: 4px;
  font-family: var(--font-primary);
  transition: border-color 0.3s ease;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--color-accent);
}

.w-100 {
  width: 100%;
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }
  .section {
    padding: 4rem 0;
  }
}
</style>
