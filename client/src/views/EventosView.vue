<template>
  <div class="view-container">
    <div class="container">
      
      <!-- Page Header -->
      <div class="page-header text-center">
        <h1 class="view-title">Todos los Eventos</h1>
        <p class="view-subtitle">Filtra y encuentra tu próxima gran experiencia.</p>
      </div>

      <!-- Shop Layout -->
      <div class="shop-layout">
        
        <!-- Sidebar Filters -->
        <aside class="shop-sidebar">
          <div class="filter-group">
            <h3>Categoría</h3>
            <div class="filter-options">
              <label class="filter-label"><input type="checkbox" checked> Todos</label>
              <label class="filter-label"><input type="checkbox"> Conciertos</label>
              <label class="filter-label"><input type="checkbox"> Festivales</label>
              <label class="filter-label"><input type="checkbox"> Teatro & Arte</label>
              <label class="filter-label"><input type="checkbox"> Deportes</label>
            </div>
          </div>

          <div class="filter-group">
            <h3>Estado</h3>
            <select class="form-control">
              <option value="">Cualquier Estado</option>
              <option value="CDMX">CDMX</option>
              <option value="Jalisco">Jalisco</option>
              <option value="Nuevo Leon">Nuevo León</option>
            </select>
          </div>

          <div class="filter-group">
            <h3>Ciudad</h3>
            <select class="form-control">
              <option value="">Cualquier Ciudad</option>
              <option value="cdmx">Ciudad de México</option>
              <option value="guadalajara">Guadalajara</option>
              <option value="monterrey">Monterrey</option>
            </select>
          </div>

          <div class="filter-group">
            <h3>Fecha</h3>
            <div class="filter-options">
              <label class="filter-label"><input type="radio" name="date" checked> Cualquier fecha</label>
              <label class="filter-label"><input type="radio" name="date"> Este fin de semana</label>
              <label class="filter-label"><input type="radio" name="date"> Este mes</label>
              <label class="filter-label"><input type="radio" name="date"> Próximos 3 meses</label>
            </div>
          </div>
          
          <button class="btn btn-primary btn-block" style="margin-top: 1rem;">Aplicar Filtros</button>
        </aside>

        <!-- Main Product Grid -->
        <main class="shop-main">
          <div class="shop-header">
            <span class="results-count">Mostrando 8 eventos</span>
            <div class="sort-by">
              <select class="form-control" style="width: auto; padding: 0.5rem;">
                <option>Más Populares</option>
                <option>Fecha: Más próximos</option>
                <option>Fecha: Más lejanos</option>
              </select>
            </div>
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
        </main>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

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
</script>

.view-title {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.view-subtitle {
  font-size: 1.2rem;
  color: var(--color-light-gray);
}
<style scoped>
.view-container {
  padding: 6rem 0;
  min-height: 80vh;
  background-color: var(--color-black);
}

.page-header {
  margin-bottom: 4rem;
}

.shop-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 3rem;
}

@media (min-width: 992px) {
  .shop-layout {
    grid-template-columns: 280px 1fr;
    align-items: start;
  }
}

/* Sidebar */
.shop-sidebar {
  background-color: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--color-gray);
  padding: 1.5rem;
  border-radius: 8px;
  position: sticky;
  top: 100px;
}

.filter-group {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--color-gray);
}

.filter-group:last-of-type {
  border-bottom: none;
  margin-bottom: 1rem;
  padding-bottom: 0;
}

.filter-group h3 {
  font-size: 1.1rem;
  margin-bottom: 1rem;
  color: var(--color-white);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.filter-options {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.filter-label {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  font-size: 0.95rem;
  color: var(--color-light-gray);
  cursor: pointer;
  transition: color 0.3s ease;
}

.filter-label:hover {
  color: var(--color-accent);
}

.filter-label input {
  accent-color: var(--color-accent);
  width: 16px;
  height: 16px;
}

.form-control {
  width: 100%;
  padding: 0.8rem;
  background-color: transparent;
  border: 2px solid var(--color-gray);
  color: var(--color-white);
  border-radius: 6px;
  font-family: inherit;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.form-control:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px rgba(139, 0, 0, 0.2);
}

.btn-block {
  width: 100%;
  padding: 1rem;
  font-weight: bold;
}

/* Main Shop Area */
.shop-header {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--color-gray);
}

@media (min-width: 576px) {
  .shop-header {
    flex-direction: row;
  }
}

.results-count {
  font-size: 1rem;
  color: var(--color-light-gray);
}

/* Grid */
.concerts-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}

@media (min-width: 768px) {
  .concerts-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1200px) {
  .concerts-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.concert-card {
  background-color: var(--color-dark-gray);
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid transparent;
}

.concert-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0,0,0,0.5);
  border-color: var(--color-gray);
}

.card-image-wrapper {
  position: relative;
  height: 250px;
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
</style>
