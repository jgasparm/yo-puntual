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

const app = createApp(App);
app.use(vuetify);
app.use(router);
app.mount('#app');

