import { createApp } from 'vue';
import App from './App.vue';
import vuetify from './plugins/vuetify'; // Asegúrate de que el archivo existe y está configurado
import router from './router';  // Importa el router
import 'vuetify/styles';

const app = createApp(App);
app.use(vuetify);
app.use(router);
app.mount('#app');

