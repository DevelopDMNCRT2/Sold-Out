<template>
  <div class="view-container">
    <div class="container">
      
      <!-- Page Header -->
      <div class="page-header text-center">
        <h1 class="view-title">Contáctanos</h1>
        <p class="view-subtitle">Estamos aquí para ayudarte. Mándanos un mensaje y te responderemos en breve.</p>
      </div>

      <div class="contact-grid">
        
        <!-- Left Column: Contact Info -->
        <div class="contact-info-wrapper">
          <div class="info-block">
            <h3>Ponte en contacto</h3>
            <p class="text-light">Ya sea que tengas problemas con tus boletos, preguntas sobre un evento o quieras vender boletos con nosotros, nuestro equipo está listo para apoyarte.</p>
          </div>

          <div class="info-items">
            <div class="info-item">
              <div class="icon-wrapper">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16"><path d="M.05 3.555A2 2 0 0 1 2 2h12a2 2 0 0 1 1.95 1.555L8 8.414.05 3.555ZM0 4.697v7.104l5.803-3.558L0 4.697ZM6.761 8.83l-6.57 4.027A2 2 0 0 0 2 14h12a2 2 0 0 0 1.808-1.144l-6.57-4.027L8 9.586l-1.239-.757Zm3.436-.586L16 11.801V4.697l-5.803 3.546Z"/></svg>
              </div>
              <div>
                <h4>Correo Electrónico</h4>
                <p>soporte@soldout.com</p>
                <p>ventas@soldout.com</p>
              </div>
            </div>

            <div class="info-item">
              <div class="icon-wrapper">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M1.885.511a1.745 1.745 0 0 1 2.61.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.678.678 0 0 0 .178.643l2.457 2.457a.678.678 0 0 0 .644.178l2.189-.547a1.745 1.745 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.634 18.634 0 0 1-7.01-4.42 18.634 18.634 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877L1.885.511z"/></svg>
              </div>
              <div>
                <h4>Teléfono</h4>
                <p>+52 (55) 1234 5678</p>
                <p class="text-light text-sm">Lunes a Viernes, 9:00 - 18:00</p>
              </div>
            </div>

            <div class="info-item">
              <div class="icon-wrapper">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16"><path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/></svg>
              </div>
              <div>
                <h4>Oficinas Centrales</h4>
                <p>Av. Reforma 222, Piso 14</p>
                <p>Ciudad de México, CDMX</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column: Contact Form -->
        <div class="contact-form-wrapper">
          <form @submit.prevent="submitForm" class="contact-form">
            <div class="form-row">
              <div class="form-group half">
                <label for="name">Nombre Completo</label>
                <input id="name" v-model="form.name" type="text" class="form-control" placeholder="Ej. Ana Rodríguez" required>
              </div>
              <div class="form-group half">
                <label for="email">Correo Electrónico</label>
                <input id="email" v-model="form.email" type="email" class="form-control" placeholder="ana@ejemplo.com" required>
              </div>
            </div>

            <div class="form-group">
              <label for="subject">Asunto</label>
              <select id="subject" v-model="form.subject" class="form-control" required>
                <option value="" disabled selected>Selecciona un tema...</option>
                <option value="Problemas con mi boleto">Problemas con mi boleto</option>
                <option value="Quiero vender boletos con ustedes">Quiero vender boletos con ustedes</option>
                <option value="Dudas de facturación">Dudas de facturación</option>
                <option value="Otro asunto">Otro asunto</option>
              </select>
            </div>

            <div class="form-group">
              <label for="message">Mensaje</label>
              <textarea id="message" v-model="form.message" class="form-control" rows="5" placeholder="¿En qué te podemos ayudar?" required></textarea>
            </div>

            <button type="submit" class="btn btn-primary btn-block submit-btn" :disabled="isLoading">
              {{ isLoading ? 'Enviando...' : 'Enviar Mensaje' }}
            </button>
            <div v-if="successMessage" class="success-message mt-3">
              {{ successMessage }}
            </div>
            <div v-if="errorMessage" class="error-message mt-3">
              {{ errorMessage }}
            </div>
          </form>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const form = ref({
  name: '',
  email: '',
  subject: '',
  message: ''
})

const isLoading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const submitForm = async () => {
  isLoading.value = true
  successMessage.value = ''
  errorMessage.value = ''

  try {
    const response = await fetch('http://localhost:3001/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(form.value),
    })

    if (!response.ok) {
      throw new Error('Error al enviar el mensaje')
    }

    const data = await response.json()
    successMessage.value = `¡Gracias por contactarnos, ${form.value.name}! Hemos recibido tu mensaje y te responderemos al correo ${form.value.email} pronto.`
    
    // Limpiar el formulario
    form.value = {
      name: '',
      email: '',
      subject: '',
      message: ''
    }
  } catch (error) {
    console.error('Error enviando contacto:', error)
    errorMessage.value = 'Hubo un problema al enviar tu mensaje. Por favor intenta de nuevo.'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.view-container {
  padding: 6rem 0;
  min-height: 80vh;
  background-color: var(--color-black);
}

.page-header {
  margin-bottom: 4rem;
}

.view-title {
  font-family: var(--font-display);
  font-size: 3.5rem;
  margin-bottom: 1rem;
  text-transform: uppercase;
}

.view-subtitle {
  font-size: 1.2rem;
  color: var(--color-light-gray);
  max-width: 600px;
  margin: 0 auto;
}

.contact-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 4rem;
  max-width: 1100px;
  margin: 0 auto;
}

@media (min-width: 992px) {
  .contact-grid {
    grid-template-columns: 1fr 1.5fr;
  }
}

/* Left Column Info */
.info-block h3 {
  font-size: 2rem;
  margin-bottom: 1rem;
  color: var(--color-white);
}

.info-block p {
  line-height: 1.7;
  margin-bottom: 3rem;
}

.info-items {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.info-item {
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
}

.icon-wrapper {
  background-color: rgba(139, 0, 0, 0.1);
  color: var(--color-accent);
  padding: 1rem;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
}

.info-item h4 {
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  color: var(--color-white);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.info-item p {
  color: var(--color-light-gray);
  margin-bottom: 0.2rem;
  font-size: 0.95rem;
}

.text-sm {
  font-size: 0.85rem !important;
  margin-top: 0.5rem;
}

/* Right Column Form */
.contact-form-wrapper {
  background-color: var(--color-dark-gray);
  padding: 3rem;
  border-radius: 8px;
  border: 1px solid var(--color-gray);
  box-shadow: 0 20px 40px rgba(0,0,0,0.5);
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-row {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .form-row {
    flex-direction: row;
  }
  .half {
    flex: 1;
  }
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
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

textarea.form-control {
  resize: vertical;
  min-height: 120px;
}

.btn-block {
  width: 100%;
  padding: 1.2rem;
}

.submit-btn {
  font-size: 1.1rem;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-top: 1rem;
}
button:disabled {
  background-color: var(--color-gray);
  color: var(--color-light-gray);
  border-color: var(--color-gray);
  cursor: not-allowed;
  opacity: 0.7;
}

.success-message {
  padding: 1rem;
  background-color: rgba(34, 197, 94, 0.1);
  color: #4ade80;
  border: 1px solid #22c55e;
  border-radius: 4px;
  text-align: center;
}

.error-message {
  padding: 1rem;
  background-color: rgba(239, 68, 68, 0.1);
  color: #f87171;
  border: 1px solid #ef4444;
  border-radius: 4px;
  text-align: center;
}
</style>
