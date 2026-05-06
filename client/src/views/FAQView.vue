<template>
  <div class="view-container">
    <div class="container">
      
      <!-- Page Header -->
      <div class="page-header text-center">
        <h1 class="view-title">Preguntas Frecuentes</h1>
        <p class="view-subtitle">Todo lo que necesitas saber sobre compras, accesos y políticas en SOLD OUT.</p>
      </div>

      <!-- FAQ Section -->
      <div class="faq-wrapper">
        <div class="faq-list">
          
          <div 
            v-for="(faq, index) in faqs" 
            :key="index" 
            class="faq-item" 
            :class="{ active: activeIndex === index }"
          >
            <button class="faq-question" @click="toggleFaq(index)">
              {{ faq.question }}
              <span class="faq-icon">
                <svg v-if="activeIndex === index" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M2 8a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11A.5.5 0 0 1 2 8z"/></svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2z"/></svg>
              </span>
            </button>
            
            <div class="faq-answer-wrapper" :style="{ maxHeight: activeIndex === index ? '500px' : '0' }">
              <div class="faq-answer">
                <p>{{ faq.answer }}</p>
              </div>
            </div>
          </div>

        </div>

        <!-- Contact CTA -->
        <div class="faq-contact text-center mt-5">
          <h3>¿No encontraste lo que buscabas?</h3>
          <p class="text-light mb-4">Nuestro equipo de soporte está listo para ayudarte con tu compra.</p>
          <RouterLink to="/contacto" class="btn btn-outline">Contactar a Soporte</RouterLink>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const activeIndex = ref(0)

const toggleFaq = (index) => {
  if (activeIndex.value === index) {
    activeIndex.value = null
  } else {
    activeIndex.value = index
  }
}

const faqs = [
  {
    question: "¿Cómo recibo mis boletos una vez que los compro?",
    answer: "Una vez que tu pago se procese exitosamente en nuestra pantalla de Checkout, el sistema descargará automáticamente tus boletos en formato PDF a tu dispositivo. Adicionalmente, te enviaremos un correo electrónico con los archivos adjuntos. Cada boleto contiene un código QR único que será escaneado en las puertas del evento."
  },
  {
    question: "¿Tengo que llevar mis boletos impresos?",
    answer: "No es estrictamente necesario. Somos una plataforma amigable con el medio ambiente. Puedes llevar el PDF en la pantalla de tu celular; solo asegúrate de subirle el brillo a tu pantalla para que nuestros escáneres puedan leer el código QR fácilmente. Si prefieres imprimirlos, asegúrate de que el código QR sea legible y no esté borroso."
  },
  {
    question: "¿Cuáles son los métodos de pago aceptados?",
    answer: "Aceptamos todas las tarjetas de crédito y débito Visa, Mastercard y American Express. Todas las transacciones están encriptadas y procesadas a través de pasarelas de pago certificadas de alta seguridad para proteger tu información."
  },
  {
    question: "¿Puedo solicitar un reembolso o cancelación?",
    answer: "Todas las ventas de boletos son definitivas. No ofrecemos reembolsos, cancelaciones ni cambios una vez que la compra ha sido confirmada, salvo en el caso de que el evento sea cancelado o pospuesto por el organizador. Te recomendamos verificar bien la fecha y la ciudad antes de finalizar tu pago."
  },
  {
    question: "¿Qué hago si perdí mi correo con los boletos o no lo recibí?",
    answer: "Si no recibiste tus boletos, primero revisa tu bandeja de correo no deseado (Spam). Si aún no los encuentras o perdiste el archivo PDF, puedes contactar a nuestro equipo de soporte proporcionando el correo con el que hiciste la compra y los 4 últimos dígitos de la tarjeta utilizada, y te los reenviaremos inmediatamente."
  },
  {
    question: "¿Por qué se cobra un cargo por servicio?",
    answer: "El cargo por servicio (que suele ser del 10%) nos ayuda a mantener nuestra plataforma en línea, cubrir los costos de los servidores de alta demanda, mejorar nuestro diseño e infraestructura tecnológica, y garantizar que la generación de códigos QR y el escaneo en el recinto sean completamente infalibles."
  },
  {
    question: "¿Hay un límite de boletos por persona?",
    answer: "Sí. Para prevenir la reventa automatizada y dar oportunidades justas a todos los fans, el límite estándar de nuestra plataforma es de 10 boletos por transacción. Si necesitas hacer una compra corporativa mayor, por favor acércate a nuestro equipo de ventas empresariales en la sección de Contacto."
  }
]
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
  font-size: 3rem;
  margin-bottom: 1rem;
  text-transform: uppercase;
}

.view-subtitle {
  font-size: 1.2rem;
  color: var(--color-light-gray);
}

.faq-wrapper {
  max-width: 800px;
  margin: 0 auto;
}

.faq-item {
  border-bottom: 1px solid var(--color-gray);
  margin-bottom: 1rem;
}

.faq-question {
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  color: var(--color-white);
  font-size: 1.2rem;
  font-weight: 600;
  font-family: inherit;
  padding: 1.5rem 0;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: color 0.3s ease;
}

.faq-question:hover {
  color: var(--color-accent);
}

.faq-icon {
  color: var(--color-accent);
  transition: transform 0.3s ease;
}

.faq-item.active .faq-icon {
  transform: rotate(180deg);
}

.faq-answer-wrapper {
  overflow: hidden;
  transition: max-height 0.4s cubic-bezier(0, 1, 0, 1);
}

.faq-item.active .faq-answer-wrapper {
  transition: max-height 0.6s ease-in-out;
}

.faq-answer {
  padding-bottom: 1.5rem;
  padding-right: 2rem;
}

.faq-answer p {
  color: var(--color-light-gray);
  font-size: 1rem;
  line-height: 1.7;
  margin: 0;
}

.faq-contact {
  background-color: var(--color-dark-gray);
  padding: 3rem 2rem;
  border-radius: 8px;
  border: 1px solid var(--color-gray);
}

.faq-contact h3 {
  font-size: 1.8rem;
  margin-bottom: 1rem;
  color: var(--color-white);
}

.mt-5 {
  margin-top: 5rem;
}

.mb-4 {
  margin-bottom: 2rem;
}

.text-light {
  color: var(--color-light-gray);
}
</style>
