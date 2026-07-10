<template>
  <div class="login-page">
    <div class="container login-container">
      
      <div class="auth-box">
        <!-- Auth Header / Toggle -->
        <div class="auth-header">
          <button 
            class="auth-tab" 
            :class="{ active: mode === 'login' }" 
            @click="mode = 'login'"
          >
            Iniciar Sesión
          </button>
          <button 
            class="auth-tab" 
            :class="{ active: mode === 'register' }" 
            @click="mode = 'register'"
          >
            Crear Cuenta
          </button>
        </div>

        <div class="auth-body">
          <div class="auth-title text-center">
            <h2>{{ mode === 'login' ? 'Bienvenido de nuevo' : 'Únete a SOLD OUT' }}</h2>
            <p class="text-light">{{ mode === 'login' ? 'Ingresa tus credenciales para continuar' : 'Crea tu cuenta para comprar boletos más rápido' }}</p>
          </div>

          <!-- Login Form -->
          <form v-if="mode === 'login'" @submit.prevent="handleLogin" class="auth-form">
            <div class="form-group">
              <label for="login-email">Correo Electrónico</label>
              <input id="login-email" v-model="loginData.email" type="email" class="form-control" placeholder="tu@correo.com" required />
            </div>
            <div class="form-group">
              <label for="login-password">Contraseña</label>
              <input id="login-password" v-model="loginData.password" type="password" class="form-control" placeholder="••••••••" required />
            </div>
            
            <div class="form-actions">
              <label class="remember-me">
                <input type="checkbox" /> Recordarme
              </label>
              <a href="#" class="forgot-password">¿Olvidaste tu contraseña?</a>
            </div>

            <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

            <button type="submit" class="btn btn-primary btn-block" :disabled="isLoading">
              {{ isLoading ? 'Cargando...' : 'Entrar' }}
            </button>
          </form>

          <!-- Register Form -->
          <form v-else @submit.prevent="handleRegister" class="auth-form">
            <div class="form-group">
              <label for="reg-name">Nombre Completo</label>
              <input id="reg-name" v-model="registerData.name" type="text" class="form-control" placeholder="Ej. Juan Pérez" required />
            </div>
            <div class="form-group">
              <label for="reg-email">Correo Electrónico</label>
              <input id="reg-email" v-model="registerData.email" type="email" class="form-control" placeholder="tu@correo.com" required />
            </div>
            <div class="form-group">
              <label for="reg-password">Contraseña</label>
              <input id="reg-password" v-model="registerData.password" type="password" class="form-control" placeholder="Mínimo 8 caracteres" minlength="8" required />
            </div>

            <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

            <button type="submit" class="btn btn-primary btn-block" :disabled="isLoading">
              {{ isLoading ? 'Cargando...' : 'Registrarse' }}
            </button>
            <p class="terms-text text-center mt-3">Al registrarte, aceptas nuestros Términos y Condiciones y Política de Privacidad.</p>
          </form>

        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const mode = ref('login') // 'login' | 'register'
const isLoading = ref(false)
const errorMessage = ref('')

const loginData = reactive({
  email: '',
  password: ''
})

const registerData = reactive({
  name: '',
  email: '',
  password: ''
})

const handleLogin = async () => {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const apiUrl = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/customers/login` : 'http://localhost:3001/api/customers/login'
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginData)
    })
    
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Error al iniciar sesión')
    
    localStorage.setItem('customerToken', data.token)
    localStorage.setItem('customerData', JSON.stringify(data.customer))
    
    router.push('/')
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    isLoading.value = false
  }
}

const handleRegister = async () => {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const apiUrl = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/customers/register` : 'http://localhost:3001/api/customers/register'
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerData)
    })
    
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Error al registrarse')
    
    localStorage.setItem('customerToken', data.token)
    localStorage.setItem('customerData', JSON.stringify(data.customer))
    
    router.push('/')
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.login-page {
  padding: 6rem 1rem 2rem 1rem;
  min-height: 100vh;
  background-color: var(--color-black);
  display: flex;
  align-items: center;
  justify-content: center;
}

.auth-box {
  background-color: var(--color-dark-gray);
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
  border-radius: 12px;
  border: 1px solid var(--color-gray);
  box-shadow: 0 30px 60px rgba(0,0,0,0.6);
  overflow: hidden;
}

.auth-header {
  display: flex;
  border-bottom: 1px solid var(--color-gray);
}

.auth-tab {
  flex: 1;
  background: none;
  border: none;
  padding: 1.5rem;
  color: var(--color-light-gray);
  font-size: 1.1rem;
  font-weight: bold;
  font-family: var(--font-primary);
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.auth-tab:hover {
  color: var(--color-white);
  background-color: rgba(255,255,255,0.02);
}

.auth-tab.active {
  color: var(--color-accent);
  background-color: rgba(139, 0, 0, 0.05);
  box-shadow: inset 0 -3px 0 var(--color-accent);
}

.auth-body {
  padding: 2rem;
}

@media (min-width: 576px) {
  .auth-body {
    padding: 2.5rem;
  }
}

.auth-title {
  margin-bottom: 1.5rem;
}

.auth-title h2 {
  font-family: var(--font-display);
  font-size: 1.8rem;
  margin-bottom: 0.3rem;
  color: var(--color-white);
}

.error-message {
  color: var(--color-accent);
  font-size: 0.9rem;
  text-align: center;
  margin-top: 1rem;
}

.text-light {
  color: var(--color-light-gray);
  font-size: 0.9rem;
}

.form-group {
  margin-bottom: 1.2rem;
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
  opacity: 0.5;
}

.form-control:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px rgba(139, 0, 0, 0.2);
}

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: var(--color-light-gray);
  cursor: pointer;
  text-transform: none;
  letter-spacing: normal;
  margin: 0;
}

.remember-me input {
  accent-color: var(--color-accent);
  width: 16px;
  height: 16px;
}

.forgot-password {
  color: var(--color-accent);
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.3s ease;
}

.forgot-password:hover {
  color: var(--color-accent-hover);
  text-decoration: underline;
}

.btn-block {
  width: 100%;
  padding: 1.2rem;
  font-size: 1.1rem;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.terms-text {
  font-size: 0.8rem;
  color: var(--color-light-gray);
}
.mt-3 {
  margin-top: 1rem;
}
</style>
