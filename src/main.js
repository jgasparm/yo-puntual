import { createApp } from 'vue';
import App from './App.vue';
import vuetify from './plugins/vuetify'; // Asegúrate de que el archivo existe y está configurado
import router from './router';  // Importa el router
import { VueReCaptcha } from 'vue-recaptcha-v3'
import 'vuetify/styles';
import '@/utils/global.css'
import { createPinia } from 'pinia'

const app = createApp(App);

// Solo para dispositivos móviles, anula ResizeObserver para evitar el error
if (/Mobi|Android/i.test(navigator.userAgent)) {
  window.ResizeObserver = class {
    constructor(_callback) { void _callback; }
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

app.use(VueReCaptcha, {
  //siteKey: '6Ld07gwrAAAAAPQolqEzChfuERxtUSf5OP0d0d9U', // Clave pública de reCAPTCHA desa v3
  siteKey: '6Lc_iiIrAAAAAKXaEHtat0wq6oAylY2pThaFJ65b', // Clave pública de reCAPTCHA prod v3
  loaderOptions: {
    useRecaptchaNet: false,
    autoHideBadge: true,
  }
})

window.onRecaptchaLoadCallback = () => {
  console.log("✅ reCAPTCHA V2 Invisible listo");
};

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

app.use(createPinia())
app.use(vuetify);
app.use(router);
app.mount('#app');

