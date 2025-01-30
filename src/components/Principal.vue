<template>
  <div class="main-page">
    <!-- Cabecera -->
    <header>
      <v-row>
        <v-col cols="auto">
          <v-img src="./logo.png" height="60"></v-img>
        </v-col>
        <v-col>
          <h1>{{ centerName }}</h1>
        </v-col>
        <v-col class="d-flex justify-end">
          <v-btn @click="logout">Cerrar sesión</v-btn>
          <v-btn @click="goToProfile">Perfil</v-btn>
        </v-col>
      </v-row>
    </header>

    <!-- Imagen de Bienvenida -->
    <v-img src="./center-image.png" height="200px" class="mb-4"></v-img>
    
    <!-- Saludo Personalizado -->
    <div class="welcome-message">
      <h2>Bienvenido, {{ userName }}</h2>
    </div>

    <!-- Módulos -->
    <v-row>
      <v-col cols="12" md="4">
        <v-card>
          <v-card-title>Asistencia</v-card-title>
          <v-card-subtitle>Ver y registrar asistencia</v-card-subtitle>
          <v-btn>Ir a Asistencia</v-btn>
        </v-card>
      </v-col>
      
      <v-col cols="12" md="4">
        <v-card>
          <v-card-title>Notas</v-card-title>
          <v-card-subtitle>Ver notas del alumno</v-card-subtitle>
          <v-btn>Ir a Notas</v-btn>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card>
          <v-card-title>Pagos</v-card-title>
          <v-card-subtitle>Ver y pagar deudas</v-card-subtitle>
          <v-btn>Ir a Pagos</v-btn>
        </v-card>
      </v-col>
    </v-row>

    <!-- Notificaciones -->
    <v-snackbar v-model="snackbar.visible" :color="snackbar.color">{{ snackbar.message }}</v-snackbar>

    <!-- Pie de página -->
    <footer>
      <p>Contacto: contacto@centroeducativo.com</p>
      <p>Siguenos en nuestras redes sociales</p>
    </footer>
  </div>
</template>

<script>
export default {
  name: "MainPage",
  data() {
    return {
      centerName: "Centro Educativo XYZ",
      userName: "Juan Pérez",
      snackbar: {
        visible: false,
        message: "Notificación de sistema.",
        color: "success"
      }
    };
  },
  methods: {
    logout() {
      // Lógica para cerrar sesión
    },
    goToProfile() {
      // Lógica para ir a la configuración de perfil
    }
  }
};
</script>

<style scoped>
.main-page {
  padding: 20px;
}

header {
  background-color: #f4f4f9;
  padding: 20px 0;
}

.welcome-message {
  text-align: center;
  margin-bottom: 20px;
}

footer {
  text-align: center;
  padding: 10px;
  background-color: #f4f4f9;
  margin-top: 40px;
}
</style>
