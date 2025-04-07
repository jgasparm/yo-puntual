<template>
  <v-container fluid class="pa-0">
    <!-- Título Principal -->
    <v-row class="py-4 px-4">
      <v-col cols="12">
        <div class="text-h5 font-weight-bold text-primary mb-1">
          🏠 Página de Inicio
        </div>
        <div class="text-body-2 text-grey-darken-1">
          Bienvenido a tu panel principal como {{ roleName }}.
        </div>
      </v-col>
    </v-row>

    <!-- Banner Carousel -->
    <v-row class="pa-0">
      <v-col cols="12" class="pa-0">
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

    <!-- Bienvenida -->
    <v-row class="py-4 px-4">
      <v-col cols="12">
        <h2 class="text-h5 font-weight-bold">
          👋 ¡Hola {{ formattedUserName || 'Usuario' }}!
        </h2>
        <p class="text-subtitle-1 text-grey-darken-1">
          Estás en tu portal de <strong>{{ roleName }}</strong>
        </p>
      </v-col>
    </v-row>

    <!-- Contenido por perfil -->
    <v-row v-if="userRole === 3">
      <v-col cols="12" md="4" v-for="card in teacherCards" :key="card.title">
        <v-card outlined elevation="1" class="rounded-lg">
          <v-card-title>
            <v-icon color="primary" class="me-2">{{ card.icon }}</v-icon>
            {{ card.title }}
          </v-card-title>
          <v-card-text>{{ card.subtitle }}</v-card-text>
          <v-card-actions>
            <v-btn :to="card.link" color="primary" variant="flat" block>
              {{ card.cta }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <v-row v-else-if="userRole === 2">
      <v-col cols="12" md="4" v-for="card in studentCards" :key="card.title">
        <v-card outlined elevation="1" class="rounded-lg">
          <v-card-title>
            <v-icon color="primary" class="me-2">{{ card.icon }}</v-icon>
            {{ card.title }}
          </v-card-title>
          <v-card-actions>
            <v-btn :to="card.link" color="primary" variant="flat" block>
              {{ card.cta }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <v-row v-else>
      <v-col cols="12" md="4" v-for="card in adminCards" :key="card.title">
        <v-card outlined elevation="1" class="rounded-lg">
          <v-card-title>
            <v-icon color="primary" class="me-2">{{ card.icon }}</v-icon>
            {{ card.title }}
          </v-card-title>
          <v-card-actions>
            <v-btn :to="card.link" color="primary" variant="flat" block>
              {{ card.cta }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Accesos Directos -->
    <v-sheet color="#f9f9f9" class="pa-4 rounded-lg mt-8">
      <h3 class="text-h6 text-center mb-4">Accesos Directos</h3>
      <v-row>
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
            <div class="access-title mt-2">{{ acceso.nombre }}</div>
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

const teacherCards = [
  { title: 'Mis cursos', icon: 'mdi-book-open-page-variant', cta: 'Ver cursos', link: '/principal/mis-cursos-docente' },
  { title: 'Mi Asistencia', icon: 'mdi-check-circle-outline', cta: 'Ver mi asistencia', link: '/principal/consulta-asistencia-empleado' },
]

const studentCards = [
  { title: 'Mis Clases', icon: 'mdi-calendar-clock', cta: 'Ver Horario', link: '/principal/mi-horario-escolar' },
  { title: 'Mi Asistencia', icon: 'mdi-calendar-check', cta: 'Ver mi asistencia', link: '/principal/consulta-asistencia-alumno' },
  { title: 'Mis notas', icon: 'mdi-school-outline', cta: 'Ver mis notas', link: '/principal/mis-notas' },
]

const adminCards = [
  { title: 'Gestión educativa', icon: 'mdi-domain', cta: 'Mis aulas', link: '/principal/mis-aulas' },
  { title: 'Reportes', icon: 'mdi-chart-box', cta: 'Ver Reportes', link: '/reportes-admin' },
  { title: 'Configuración del Sistema', icon: 'mdi-cog', cta: 'Configurar', link: '/configuracion' }
]

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
.v-carousel-item img { object-fit: cover }
.banner-central ::v-deep .v-carousel__controls,
.banner-central ::v-deep .v-carousel__prev,
.banner-central ::v-deep .v-carousel__next {
  display: none !important;
}
</style>
