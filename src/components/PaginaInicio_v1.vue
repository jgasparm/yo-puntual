<template>
  <v-container fluid>    
    <!-- Sección de bienvenida -->
    <v-row class="my-4" align="start" justify="center">
      <v-col cols="12" class="pa-0">
        <v-img
         :src="require('@/assets/images_inicio/banner_principal_demo.png')"
         height="auto"
         max-height="120"
         contain
         class="mx-auto w-100"
        ></v-img>
     </v-col>
   </v-row>

    <v-row class="my-4" align="center" justify="center">
      <v-col cols="12">
        <h3 class="text-h6">Bienvenido, <strong class="primary--text">{{ formattedUserName }}</strong></h3>
        <p>¡Bienvenido a tu Portal del Estudiante!</p>
      </v-col>
    </v-row>
    
    <!-- Tarjetas de información -->
    <v-row>
      <v-col cols="12" md="4">
        <v-card class="pa-4 fill-width" outlined>
          <v-card-title class="text-h6 font-weight-bold">MIS HORARIOS</v-card-title>
          <v-btn class="mt-2" color="primary" block>HOY sábado 1/2</v-btn>
          <v-btn class="mt-2" color="secondary" block>Mañana 2/2</v-btn>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card class="pa-4 fill-width" outlined>
          <v-card-title class="text-h6 font-weight-bold">MIS NOTAS</v-card-title>
          <v-btn text color="red">Ver todo <v-icon>mdi-chevron-right</v-icon></v-btn>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card class="pa-4 fill-width" outlined>
          <v-card-title class="text-h6 font-weight-bold">MIS PAGOS</v-card-title>
          <p class="red--text text-center">Consulta el estado de tus pagos pendientes</p>
          <v-icon color="red" class="d-block mx-auto">mdi-eye</v-icon>
        </v-card>
      </v-col>
    </v-row>
    
    <!-- Accesos directos -->
    <v-row>
      <v-col cols="12">
        <h3 class="text-h6 font-weight-bold text-center">ACCESOS DIRECTOS</h3>
      </v-col>
      <v-col v-for="(acceso, index) in accesosDirectos" :key="index" cols="12" md="3">
        <v-card class="pa-3 fill-width" outlined>
          <v-img :src="acceso.icon" contain height="50" class="mb-2 mx-auto"></v-img>
          <v-card-title class="text-subtitle-1 text-center">{{ acceso.nombre }}</v-card-title>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      usuarioNombre: "", // Se define aquí para evitar errores de acceso antes de inicializar
      bannerItems: [
        { src: require('@/assets/images_inicio/lider_school_01.jpg') },
        { src: require('@/assets/images_inicio/lider_school_02.jpg') },
        { src: require('@/assets/images_inicio/lider_school_03.jpg') }
      ],
      accesosDirectos: [
        { nombre: 'Matrícula en Línea', icon: require('@/assets/images_inicio/lider_school_01.jpg') },
        { nombre: 'Aula virtual - Blackboard', icon: require('@/assets/images_inicio/lider_school_01.jpg') },
        { nombre: 'Explora', icon: require('@/assets/images_inicio/lider_school_01.jpg') },
        { nombre: 'Mis Calendarios Académicos', icon: require('@/assets/images_inicio/lider_school_01.jpg') }
      ]
    };
  },
  computed: {
    // Formatea el nombre para que cada palabra inicie con mayúscula
    formattedUserName() {
      if (!this.usuarioNombre) return "";
      return this.usuarioNombre
        .split(" ")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ");
    }
  },
  methods: {
    cargarDatosUsuario() {
      // Recupera los datos almacenados en localStorage (que se asignaron en Login.vue)
      const userData = JSON.parse(localStorage.getItem("user"));
      if (userData) {
        this.usuarioNombre = `${userData.pers_nombres}`;
        console.info(this.usuarioNombre);
      } else {
        console.error("No se encontraron datos del usuario en localStorage.");
      }
    }
  },
  mounted() {
    this.cargarDatosUsuario();
  }
};
</script>


<style scoped>
.fill-width {
  width: 100%; /* Ocupa todo el ancho del v-col */
}

.fill-height {
  min-height: 100%;
}

.text-h5 {
  font-weight: bold;
}

.banner-img {
  object-fit: cover;
  width: 100%;
  height: auto;
}
</style>
