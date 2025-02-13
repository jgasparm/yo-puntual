import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import { es } from 'vuetify/locale';
import * as components from 'vuetify/components'; // Agregar esta línea
import * as directives from 'vuetify/directives'; // Agregar esta línea
import '@mdi/font/css/materialdesignicons.css' // Importa los iconos

const vuetify = createVuetify({
  locale: {
    locale: 'es',  // Establece español como idioma principal
    fallback: 'es', // Si hay algún problema, se usa español como respaldo
    messages: { es } // Carga el idioma español en los componentes
  },
  components,
  directives,
  icons: {
    defaultSet: 'mdi', // Asegura que los iconos sean de MDI
  },
});

export default vuetify;

