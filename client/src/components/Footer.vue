<template>
  <footer class="footer">
    <div class="container footer-inner">
      <div class="footer-brand">
        <h3>SOLD OUT</h3>
        <p>Tu pasaje a las mejores experiencias en vivo. Conciertos, festivales y más.</p>
      </div>
      <div class="footer-links">
        <h4>Enlaces Rápidos</h4>
        <ul>
          <li><RouterLink to="/">Home</RouterLink></li>
          <li><RouterLink to="/eventos">Eventos</RouterLink></li>
          <li><RouterLink to="/faq">Preguntas Frecuentes</RouterLink></li>
          <li><RouterLink to="/contacto">Contacto</RouterLink></li>
        </ul>
      </div>
      <div class="footer-legal">
        <h4>Legal</h4>
        <ul>
          <li><a href="#">Términos y Condiciones</a></li>
          <li><a href="#">Política de Privacidad</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <p>&copy; 2026 Sold Out. Todos los derechos reservados.</p>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background-color: var(--color-dark-gray);
  padding: 4rem 0 0 0;
  border-top: 2px solid var(--color-accent);
}

.footer-inner {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  margin-bottom: 3rem;
}

@media (min-width: 768px) {
  .footer-inner {
    grid-template-columns: 2fr 1fr 1fr;
  }
}

.footer-brand h3 {
  font-size: 1.8rem;
  margin-bottom: 1rem;
  color: var(--color-accent);
}

.footer-brand p {
  color: var(--color-light-gray);
  max-width: 300px;
}

.footer-links h4,
.footer-legal h4 {
  margin-bottom: 1rem;
  color: var(--color-white);
}

.footer-links ul,
.footer-legal ul {
  list-style: none;
}

.footer-links li,
.footer-legal li {
  margin-bottom: 0.5rem;
}

.footer-links a,
.footer-legal a {
  color: var(--color-light-gray);
  transition: color 0.3s ease;
}

.footer-links a:hover,
.footer-legal a:hover {
  color: var(--color-accent);
}

.footer-bottom {
  background-color: #000;
  text-align: center;
  padding: 1.5rem 0;
  font-size: 0.9rem;
  color: var(--color-gray);
}
</style>
