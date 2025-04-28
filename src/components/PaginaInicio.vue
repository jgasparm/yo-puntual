<template>
  <v-container class="pa-4">
    <h1 class="sr-only">Página de Inicio</h1>
    <!-- TÍTULO PRINCIPAL -->
    <v-row class="py-4 px-4">
      <v-col cols="12">
        <h2 class="text-h5 font-weight-bold">👋 ¡Hola {{ formattedUserName || 'Usuario' }}!</h2>
        <p class="text-subtitle-1 text-grey-darken-1">
          Estás en tu portal de <strong>{{ roleName }}</strong>
        </p>
      </v-col>
    </v-row>

    <!-- CARRUSEL BANNER -->
    <v-row>
      <v-col cols="12">
        <v-carousel
          cycle
          :interval="5000"
          hide-delimiters
          :show-arrows="false"
          :show-arrows-on-hover="false"
          height="200"
          class="banner-central"
        >
          <v-carousel-item
            v-for="item in bannerItems"
            :key="item.src"
            :src="item.src"
          />
        </v-carousel>
      </v-col>
    </v-row>

    <!-- BIENVENIDA -->
    

    <!-- TARJETAS POR ROL -->
    <v-row class="px-4" dense>
  <v-col
    cols="12"
    sm="6"
    md="4"
    v-for="card in roleCards"
    :key="card.title"
  >
    <v-card
      outlined
      elevation="1"
      class="rounded-lg d-flex flex-column justify-space-between h-100"
    >
      <v-card-title class="d-flex align-center text-wrap text-truncate">
        <v-icon color="primary" class="me-2">{{ card.icon }}</v-icon>
        <span class="font-weight-bold text-wrap" style="line-height: 1.2;">{{ card.title }}</span>
      </v-card-title>

      <v-card-text class="text-body-2 text-grey-darken-2" style="min-height: 60px;">
        {{ card.subtitle }}
      </v-card-text>

      <v-card-actions>
        <v-btn
          :to="card.link"
          color="primary"
          variant="flat"
          block
          class="text-truncate"
          style="white-space: normal;"
        >
          {{ card.cta }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-col>
</v-row>


    <!-- ACCESOS DIRECTOS -->
    <v-sheet color="#f9f9f9" class="pa-4 mt-8 mx-4 rounded-lg">
      <h3 class="text-h6 text-center mb-4">Accesos Directos</h3>
      <v-row dense>
        <v-col
          v-for="acceso in accesosDirectos"
          :key="acceso.nombre"
          cols="12"
          sm="6"
          md="3"
          class="d-flex"
        >
          <v-card
            outlined
            elevation="2"
            class="flex-grow-1 pa-4 d-flex flex-column align-center justify-center"
            :to="acceso.link"
            hover
          >
            <v-icon size="48">{{ acceso.icon }}</v-icon>
            <div class="access-title mt-2 text-center">{{ acceso.nombre }}</div>
          </v-card>
        </v-col>
      </v-row>
    </v-sheet>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const usuarioNombre = ref('')
const userRole = ref(null)

const bannerItems = [
  { src: require('@/assets/images_inicio/banner_inicio_lider_school_01.jpg') },
  { src: require('@/assets/images_inicio/banner_inicio_lider_school_02.jpg') },
  { src: require('@/assets/images_inicio/banner_inicio_lider_school_03.jpg') }
]

const accesosDirectos = [
  { nombre: 'Calendario escolar', icon: 'mdi-calendar', link: '/principal/calendario-escolar' }
]

// Tarjetas por rol
const teacherCards = [
  { title: 'Mis planes', icon: 'mdi-domain', cta: 'Ver plan de estudios', link: '/principal/docente-plan-estudios', subtitle: 'Planifica la forma de evaluar los cursos.' },
  { title: 'Mis cursos', icon: 'mdi-book-open-page-variant', cta: 'Ver cursos', link: '/principal/mis-cursos-docente', subtitle: 'Accede a tus asignaturas activas.' },
  { title: 'Mi Asistencia', icon: 'mdi-check-circle-outline', cta: 'Ver mi asistencia', link: '/principal/consulta-asistencia-empleado', subtitle: 'Consulta tus registros de asistencia.' }
]

const studentCards = [
  { title: 'Mis Clases', icon: 'mdi-calendar-clock', cta: 'Ver Horario', link: '/principal/mi-horario-escolar', subtitle: 'Revisa tu horario semanal.' },
  { title: 'Mi Asistencia', icon: 'mdi-calendar-check', cta: 'Ver mi asistencia', link: '/principal/consulta-asistencia-alumno', subtitle: 'Mira tu historial de asistencias.' },
  { title: 'Mis notas', icon: 'mdi-school-outline', cta: 'Ver mis notas', link: '/principal/mis-notas', subtitle: 'Consulta tus calificaciones.' }
]

const adminCards = [
  { title: 'Gestión educativa', icon: 'mdi-domain', cta: 'Mis aulas', link: '/principal/mis-aulas', subtitle: 'Administra la estructura educativa.' },
  { title: 'Reportes', icon: 'mdi-chart-box', cta: 'Ver Reportes', link: '/reportes-admin', subtitle: 'Visualiza métricas y estadísticas.' },
  { title: 'Configuración', icon: 'mdi-cog', cta: 'Configurar', link: '/configuracion', subtitle: 'Gestiona parámetros del sistema.' }
]

const SecretaryCards = [
  { title: 'Registro de asistencia', icon: 'mdi-domain', cta: 'Registrar', link: '/principal/registro-asistencia', subtitle: 'Registra asistencia de docentes.' },
  { title: 'Asistencia de alumnos', icon: 'mdi-chart-box', cta: 'Ver alumnos', link: '/principal/consulta-asistencia-alumnos', subtitle: 'Visualiza asistencia de alumnos.' },
  { title: 'Asistencia de empleados', icon: 'mdi-cog', cta: 'Ver empleados', link: '/principal/consulta-asistencia-empleados', subtitle: 'Visualiza asistencia de docentes.' }
]

const roleCards = computed(() => {
  if (userRole.value === 3) return teacherCards
  if (userRole.value === 2) return studentCards
  if (userRole.value === 4) return SecretaryCards
  return adminCards
})

const formattedUserName = computed(() => {
  if (!usuarioNombre.value) return ''
  return usuarioNombre.value
    .split(' ')
    .filter(word => word.length)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
})

const roleName = computed(() => ({
  1: 'Administrador',
  3: 'Docente',
  2: 'Estudiante'
}[userRole.value] ?? ''))

function cargarDatosUsuario() {
  const userData = JSON.parse(localStorage.getItem('user') || '{}')
  usuarioNombre.value = userData.pers_nombres ?? ''
  userRole.value = Number(localStorage.getItem('perfil') ?? userData.role)
}

onMounted(cargarDatosUsuario)
</script>

<style scoped>

.v-carousel-item img {
  object-fit: cover;
}
.banner-central ::v-deep .v-carousel__controls,
.banner-central ::v-deep .v-carousel__prev,
.banner-central ::v-deep .v-carousel__next {
  display: none !important;
}

.access-title {
  font-size: 0.95rem;
  font-weight: 500;
  text-align: center;
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
