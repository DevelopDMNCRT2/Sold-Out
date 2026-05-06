<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'

const isMenuOpen = ref(false)
const isLightMode = ref(false)

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const toggleTheme = () => {
  isLightMode.value = !isLightMode.value
  if (isLightMode.value) {
    document.documentElement.setAttribute('data-theme', 'light')
    localStorage.setItem('theme', 'light')
  } else {
    document.documentElement.removeAttribute('data-theme')
    localStorage.setItem('theme', 'dark')
  }
}

onMounted(() => {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme === 'light') {
    isLightMode.value = true
    document.documentElement.setAttribute('data-theme', 'light')
  }
})
</script>

<template>
  <header class="header">
    <!-- Top Level Bar -->
    <div class="top-bar">
      <div class="container top-bar-inner">
        <div class="social-links">
          <a href="#" class="social-link" aria-label="Facebook">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
              <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951"/>
            </svg>
          </a>
          <a href="#" class="social-link" aria-label="Instagram">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.9 3.9 0 0 0-1.417.923A3.9 3.9 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.9 3.9 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.9 3.9 0 0 0-.923-1.417A3.9 3.9 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.036 1.204.166 1.486.275.373.145.64.319.92.599s.453.546.598.92c.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.5 2.5 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.5 2.5 0 0 1-.92-.598 2.5 2.5 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233s.008-2.388.046-3.231c.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92s.546-.453.92-.598c.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92m-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217m0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334"/>
            </svg>
          </a>
          <a href="#" class="social-link" aria-label="Twitter">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
              <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865l8.875 11.633Z"/>
            </svg>
          </a>
        </div>
        <div class="top-bar-actions">
          <button @click="toggleTheme" class="theme-switch" :class="{ 'is-light': isLightMode }" aria-label="Toggle theme">
            <span class="switch-track">
              <span class="switch-icon icon-moon">
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M6 .278a.768.768 0 0 1 .08.858 7.208 7.208 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277.527 0 1.04-.055 1.533-.16a.787.787 0 0 1 .81.316.733.733 0 0 1-.031.893A8.349 8.349 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.752.752 0 0 1 6 .278z"/>
                </svg>
              </span>
              <span class="switch-icon icon-sun">
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm0 1a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0zm0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13zm8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5zM3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8zm10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0zm-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0zm9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707zM4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708z"/>
                </svg>
              </span>
              <span class="switch-thumb"></span>
            </span>
          </button>
          <RouterLink to="/login" class="btn btn-login">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16" style="margin-right: 6px;">
              <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3Zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/>
            </svg>
            Entrar
          </RouterLink>
        </div>
      </div>
    </div>

    <!-- Main Navigation Bar -->
    <nav class="main-nav">
      <div class="container nav-inner">
        <div class="logo">
          <RouterLink to="/">
            <svg viewBox="0 0 190 40" xmlns="http://www.w3.org/2000/svg" class="logo-svg">
              <circle cx="15" cy="20" r="10" fill="var(--color-accent)" />
              <circle cx="25" cy="20" r="10" fill="currentColor" opacity="0.8" />
              <text x="45" y="28" font-family="Outfit, sans-serif" font-weight="900" font-size="24" fill="currentColor" letter-spacing="0">
                SOLD OUT
              </text>
            </svg>
          </RouterLink>
        </div>

        <!-- Hamburger Icon -->
        <button class="mobile-toggle" @click="toggleMenu" aria-label="Toggle menu">
          <span class="bar" :class="{ 'open': isMenuOpen }"></span>
          <span class="bar" :class="{ 'open': isMenuOpen }"></span>
          <span class="bar" :class="{ 'open': isMenuOpen }"></span>
        </button>

        <!-- Nav Links -->
        <ul class="nav-links" :class="{ 'is-open': isMenuOpen }">
          <li><RouterLink to="/" @click="isMenuOpen = false">Home</RouterLink></li>
          <li><RouterLink to="/eventos" @click="isMenuOpen = false">Eventos</RouterLink></li>
          <li><RouterLink to="/faq" @click="isMenuOpen = false">Faq</RouterLink></li>
          <li><RouterLink to="/contacto" @click="isMenuOpen = false">Contacto</RouterLink></li>
        </ul>
      </div>
    </nav>
  </header>
</template>

<style scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 1000;
  background-color: var(--color-black);
  border-bottom: 1px solid var(--color-gray);
}

/* Top Bar */
.top-bar {
  background-color: var(--color-dark-gray);
  border-bottom: 1px solid var(--color-gray);
  padding: 0.5rem 0;
}

.top-bar-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.social-links {
  display: flex;
  gap: 1.2rem;
  align-items: center;
}

.social-link {
  color: var(--color-light-gray);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.social-link:hover {
  color: var(--color-accent);
  transform: translateY(-2px);
}

.top-bar-actions {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.theme-switch {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
}

.switch-track {
  position: relative;
  width: 52px;
  height: 26px;
  background-color: var(--color-gray);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 6px;
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.theme-switch.is-light .switch-track {
  background-color: #dcdcdc;
  border-color: rgba(0, 0, 0, 0.1);
}

.switch-thumb {
  position: absolute;
  top: 2px;
  left: 3px;
  width: 20px;
  height: 20px;
  background-color: var(--color-accent);
  border-radius: 50%;
  transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  z-index: 2;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.theme-switch.is-light .switch-thumb {
  transform: translateX(24px);
}

.switch-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
  transition: opacity 0.3s ease, color 0.3s ease;
}

.switch-icon svg {
  width: 12px;
  height: 12px;
}

.theme-switch:not(.is-light) .icon-sun { opacity: 0.4; color: var(--color-light-gray); }
.theme-switch:not(.is-light) .icon-moon { opacity: 1; color: var(--color-white); }
.theme-switch.is-light .icon-sun { opacity: 1; color: #121212; }
.theme-switch.is-light .icon-moon { opacity: 0.4; color: #495057; }

.btn-login {
  display: inline-flex;
  align-items: center;
  padding: 0.4rem 1.2rem;
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--color-gray);
  color: var(--color-white);
  border-radius: 50px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.btn-login:hover {
  background-color: var(--color-accent);
  border-color: var(--color-accent);
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(139, 0, 0, 0.3);
  transform: translateY(-1px);
}

/* Main Nav */
.main-nav {
  padding: 1rem 0;
}

.nav-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  color: var(--color-white);
  transition: color 0.3s ease;
}

.logo:hover {
  color: var(--color-accent);
}

.logo-svg {
  height: 38px;
  width: auto;
  display: block;
}

.logo a:hover {
  color: var(--color-accent);
}

.nav-links {
  display: none;
  list-style: none;
  gap: 2rem;
}

.nav-links a {
  font-weight: 600;
  font-size: 1rem;
  color: var(--color-white);
  position: relative;
}

.nav-links a::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 0%;
  height: 2px;
  background-color: var(--color-accent);
  transition: width 0.3s ease;
}

.nav-links a:hover::after,
.nav-links a.router-link-active::after {
  width: 100%;
}

.nav-links a:hover,
.nav-links a.router-link-active {
  color: var(--color-accent);
}

/* Mobile Toggle */
.mobile-toggle {
  display: flex;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
}

.bar {
  width: 25px;
  height: 2px;
  background-color: var(--color-white);
  transition: all 0.3s ease;
}

.bar.open:nth-child(1) {
  transform: translateY(7px) rotate(45deg);
}

.bar.open:nth-child(2) {
  opacity: 0;
}

.bar.open:nth-child(3) {
  transform: translateY(-7px) rotate(-45deg);
}

/* Mobile Menu Open State */
.nav-links.is-open {
  display: flex;
  flex-direction: column;
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background-color: var(--color-black);
  padding: 2rem 0;
  align-items: center;
  border-bottom: 1px solid var(--color-gray);
  box-shadow: 0 10px 20px rgba(0,0,0,0.5);
}

/* Desktop */
@media (min-width: 768px) {
  .mobile-toggle {
    display: none;
  }
  
  .nav-links {
    display: flex;
  }
  
  .nav-links.is-open {
    position: static;
    flex-direction: row;
    padding: 0;
    width: auto;
    background: transparent;
    border: none;
    box-shadow: none;
  }
}
</style>
