import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components'; // Agregar esta línea
import * as directives from 'vuetify/directives'; // Agregar esta línea

const vuetify = createVuetify({
  components,
  directives,
});

export default vuetify;

