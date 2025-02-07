
<template>
  <v-container>
    <!-- Banner Superior -->
    <v-sheet color="grey lighten-4" class="pa-6 text-center">
      <h2 class="text-h5 font-weight-bold">
        ¡Asistencia! 
        <v-icon color="red">mdi-hand-pointing-right</v-icon>
      </h2>
      <v-carousel hide-delimiters cycle>
        <v-carousel-item v-for="(item, i) in bannerItems" :key="i">
          <v-img :src="item.src" contain height="200"></v-img>
        </v-carousel-item>
      </v-carousel>
    </v-sheet>
    
    <!-- Sección de bienvenida -->
    <v-row class="my-4" align="center" justify="center">
      <v-col cols="12" md="8" class="text-center">
        <v-img src="/welcome.png" max-height="120" contain class="mb-3"></v-img>
        <h3 class="text-h6">Bienvenido, <strong class="primary--text">Juan G.</strong></h3>
        <p>¡Bienvenido a tu Portal del Estudiante!</p>
      </v-col>
    </v-row>
    
    <!-- Tarjetas de información -->
    <v-row>
      <v-col cols="12" md="4">
        <v-card class="pa-4" outlined>
          <v-card-title class="text-h6 font-weight-bold">MIS HORARIOS</v-card-title>
          <v-btn class="mt-2" color="primary" block>HOY sábado 1/2</v-btn>
          <v-btn class="mt-2" color="secondary" block>Mañana 2/2</v-btn>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card class="pa-4" outlined>
          <v-card-title class="text-h6 font-weight-bold">MIS NOTAS</v-card-title>
          <v-btn text color="red">Ver todo <v-icon>mdi-chevron-right</v-icon></v-btn>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card class="pa-4" outlined>
          <v-card-title class="text-h6 font-weight-bold">MIS PAGOS</v-card-title>
          <p class="red--text text-center">Consulta el estado de tus pagos pendientes</p>
          <v-icon color="red" class="d-block mx-auto">mdi-eye</v-icon>
        </v-card>
      </v-col>
    </v-row>
    
    <!-- Accesos directos -->
    <v-row>
      <v-col cols="12">
        <h3 class="text-h6 font-weight-bold">ACCESOS DIRECTOS</h3>
      </v-col>
      <v-col v-for="(acceso, index) in accesosDirectos" :key="index" cols="12" md="3">
        <v-card class="pa-3" outlined>
          <v-img :src="acceso.icon" contain height="50" class="mb-2"></v-img>
          <v-card-title class="text-subtitle-1">{{ acceso.nombre }}</v-card-title>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      bannerItems: [
        { src: '/banner1.jpg' },
        { src: '/banner2.jpg' },
        { src: '/banner3.jpg' }
      ],
      accesosDirectos: [
        { nombre: 'Matrícula en Línea', icon: '/matricula.png' },
        { nombre: 'Aula virtual - Blackboard', icon: '/blackboard.png' },
        { nombre: 'Explora UPC', icon: '/explora.png' },
        { nombre: 'Mis Calendarios Académicos', icon: '/calendario.png' }
      ]
    };
  }
};
</script>

<style scoped>
.text-h5 {
  font-weight: bold;
}
</style>
