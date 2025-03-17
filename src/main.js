import { createApp } from 'vue';
import App from './App.vue';
import vuetify from './plugins/vuetify'; // Asegúrate de que el archivo existe y está configurado
import router from './router';  // Importa el router
import 'vuetify/styles';

// Solo para dispositivos móviles, anula ResizeObserver para evitar el error
if (/Mobi|Android/i.test(navigator.userAgent)) {
  window.ResizeObserver = class {
    constructor(_callback) { void _callback; }
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('Service Worker registrado con éxito:', registration);
        // Puedes acceder a registration.scope para ver el alcance del Service Worker
      })
      .catch(error => {
        console.error('Error al registrar el Service Worker:', error);
      });
  });
} else {
  console.warn('Service Workers no son soportados en este navegador.');
}

const app = createApp(App);
app.use(vuetify);
app.use(router);
app.mount('#app');

