import { createApp } from 'vue';
import App from './App.vue';
import vuetify from './plugins/vuetify'; // Asegúrate de que el archivo existe y está configurado

const app = createApp(App);
app.use(vuetify);
app.mount('#app');

