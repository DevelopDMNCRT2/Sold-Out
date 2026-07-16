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
              <label class="filter-label"><input type="checkbox" v-model="allCategoriesChecked" @change="onAllCategoriesChange"> Todos</label>
              <label class="filter-label"><input type="checkbox" v-model="categoryFilters.conciertos"> Conciertos</label>
              <label class="filter-label"><input type="checkbox" v-model="categoryFilters.festivales"> Festivales</label>
              <label class="filter-label"><input type="checkbox" v-model="categoryFilters.teatro"> Teatro & Arte</label>
              <label class="filter-label"><input type="checkbox" v-model="categoryFilters.deportes"> Deportes</label>
            </div>
          </div>

          <div class="filter-group">
            <h3>Estado</h3>
            <select class="form-control" v-model="selectedState">
              <option value="">Cualquier Estado</option>
              <option value="CDMX">CDMX</option>
              <option value="Jalisco">Jalisco</option>
              <option value="Nuevo Leon">Nuevo León</option>
            </select>
          </div>

          <div class="filter-group">
            <h3>Ciudad</h3>
            <select class="form-control" v-model="selectedCity">
              <option value="">Cualquier Ciudad</option>
              <option value="cdmx">Ciudad de México</option>
              <option value="guadalajara">Guadalajara</option>
              <option value="monterrey">Monterrey</option>
            </select>
          </div>

          <div class="filter-group">
            <h3>Fecha</h3>
            <div class="filter-options">
              <label class="filter-label"><input type="radio" name="date" value="all" v-model="selectedDateRange"> Cualquier fecha</label>
              <label class="filter-label"><input type="radio" name="date" value="weekend" v-model="selectedDateRange"> Este fin de semana</label>
              <label class="filter-label"><input type="radio" name="date" value="month" v-model="selectedDateRange"> Este mes</label>
              <label class="filter-label"><input type="radio" name="date" value="3months" v-model="selectedDateRange"> Próximos 3 meses</label>
            </div>
          </div>
          
          <button class="btn btn-outline btn-block" style="margin-top: 1rem;" @click="clearFilters">Limpiar Filtros</button>
        </aside>

        <!-- Main Product Grid -->
        <main class="shop-main">
          <div class="shop-header">
            <span class="results-count">Mostrando {{ sortedConcerts.length }} {{ sortedConcerts.length === 1 ? 'evento' : 'eventos' }}</span>
            <div class="sort-by">
              <select v-model="sortBy" class="form-control" style="width: auto; padding: 0.5rem;">
                <option value="popular">Más Populares</option>
                <option value="date-asc">Fecha: Más próximos</option>
                <option value="date-desc">Fecha: Más lejanos</option>
              </select>
            </div>
          </div>

          <div class="concerts-grid" v-if="sortedConcerts.length > 0">
            <RouterLink v-for="concert in sortedConcerts" :key="concert.id" :to="`/evento/${concert.id}`" class="concert-card" style="text-decoration: none; color: inherit; display: block;">
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
          <div class="no-results" v-else>
            <p>No se encontraron eventos con los filtros seleccionados.</p>
            <button class="btn btn-primary" @click="clearFilters" style="margin-top: 1rem;">Limpiar Filtros</button>
          </div>
        </main>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'

const concerts = ref([])

// Variables de estado para los filtros
const categoryFilters = ref({
  conciertos: false,
  festivales: false,
  teatro: false,
  deportes: false
})
const allCategoriesChecked = ref(true)
const selectedState = ref('')
const selectedCity = ref('')
const selectedDateRange = ref('all')
const sortBy = ref('popular')

// Desmarcar las categorías individuales si se marca "Todos"
const onAllCategoriesChange = () => {
  if (allCategoriesChecked.value) {
    categoryFilters.value.conciertos = false
    categoryFilters.value.festivales = false
    categoryFilters.value.teatro = false
    categoryFilters.value.deportes = false
  }
}

// Escuchar cambios en las categorías específicas para desmarcar o marcar "Todos"
watch(
  () => [
    categoryFilters.value.conciertos,
    categoryFilters.value.festivales,
    categoryFilters.value.teatro,
    categoryFilters.value.deportes
  ],
  (newVals) => {
    if (newVals.some(v => v)) {
      allCategoriesChecked.value = false
    } else {
      allCategoriesChecked.value = true
    }
  }
)

const clearFilters = () => {
  categoryFilters.value.conciertos = false
  categoryFilters.value.festivales = false
  categoryFilters.value.teatro = false
  categoryFilters.value.deportes = false
  allCategoriesChecked.value = true
  selectedState.value = ''
  selectedCity.value = ''
  selectedDateRange.value = 'all'
}

onMounted(async () => {
  try {
    const apiUrl = import.meta.env.VITE_API_URL 
      ? `${import.meta.env.VITE_API_URL}/api/events` 
      : 'http://localhost:3001/api/events'
    const res = await fetch(apiUrl)
    if (res.ok) {
      const data = await res.json()
      // Mostrar todos los eventos que no estén cancelados
      concerts.value = data.filter(event => event.status !== 'Cancelado')
    }
  } catch (error) {
    console.error("Error al cargar eventos en EventosView:", error)
  }
})

// Lógica de Filtrado Reactivo
const filteredConcerts = computed(() => {
  return concerts.value.filter(concert => {
    // 1. Filtrar por Categoría
    const hasCategoryFilter = Object.values(categoryFilters.value).some(v => v)
    if (hasCategoryFilter) {
      const matchConcierto = categoryFilters.value.conciertos && concert.category.toLowerCase().includes('conciert')
      const matchFestival = categoryFilters.value.festivales && concert.category.toLowerCase().includes('festival')
      const matchTeatro = categoryFilters.value.teatro && (concert.category.toLowerCase().includes('teatro') || concert.category.toLowerCase().includes('arte'))
      const matchDeporte = categoryFilters.value.deportes && (concert.category.toLowerCase().includes('deport') || concert.category.toLowerCase().includes('futbol'))
      
      if (!matchConcierto && !matchFestival && !matchTeatro && !matchDeporte) {
        return false
      }
    }
    
    // 2. Filtrar por Estado
    if (selectedState.value) {
      if (!concert.state || !concert.state.toLowerCase().includes(selectedState.value.toLowerCase())) {
        return false
      }
    }
    
    // 3. Filtrar por Ciudad
    if (selectedCity.value) {
      if (!concert.city || !concert.city.toLowerCase().includes(selectedCity.value.toLowerCase())) {
        return false
      }
    }
    
    // 4. Filtrar por Fecha
    if (selectedDateRange.value !== 'all' && concert.date) {
      const eventDate = new Date(concert.date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (selectedDateRange.value === 'weekend') {
        const currentDay = today.getDay()
        const daysToFriday = currentDay === 0 ? -2 : 5 - currentDay
        const friday = new Date(today)
        friday.setDate(today.getDate() + daysToFriday)
        
        const sunday = new Date(friday)
        sunday.setDate(friday.getDate() + 2)
        sunday.setHours(23, 59, 59, 999)
        
        if (eventDate < friday || eventDate > sunday) {
          return false
        }
      } else if (selectedDateRange.value === 'month') {
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999)
        if (eventDate < startOfMonth || eventDate > endOfMonth) {
          return false
        }
      } else if (selectedDateRange.value === '3months') {
        const limitDate = new Date(today)
        limitDate.setMonth(today.getMonth() + 3)
        limitDate.setHours(23, 59, 59, 999)
        if (eventDate < today || eventDate > limitDate) {
          return false
        }
      }
    }
    
    return true
  })
})

// Mapear y ordenar
const sortedConcerts = computed(() => {
  let list = filteredConcerts.value.map(event => ({
    id: event.id,
    title: event.name,
    date: event.date,
    location: event.venue || 'Por definir',
    image: event.coverImage || '/poster.png'
  }))
  
  if (sortBy.value === 'date-asc') {
    return list.sort((a, b) => new Date(a.date) - new Date(b.date))
  } else if (sortBy.value === 'date-desc') {
    return list.sort((a, b) => new Date(b.date) - new Date(a.date))
  }
  return list
})
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

/* Estilos de no resultados */
.no-results {
  text-align: center;
  padding: 4rem 2rem;
  background-color: rgba(255, 255, 255, 0.02);
  border: 1px dashed var(--color-gray);
  border-radius: 8px;
  color: var(--color-light-gray);
  grid-column: 1 / -1;
}

.btn-outline {
  background: transparent;
  border: 1px solid var(--color-gray);
  color: var(--color-white);
  transition: all 0.3s ease;
}

.btn-outline:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: var(--color-white);
}
</style>
