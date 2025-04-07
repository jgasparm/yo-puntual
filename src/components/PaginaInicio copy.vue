<template>

  <v-container fluid class="pa-0">

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
    <v-row class="py-4">
      <v-col cols="12">
        <h2 class="text-h5">
          <!-- Bienvenido, <span class="primary--text">{{ formattedUserName }}</span> -->
           ¡Bienvenido!
        </h2>
        <p class="text-subtitle-1">Tu portal de {{ roleName }}</p>
      </v-col>
    </v-row>

    <!-- Contenido por perfil -->
    <v-row v-if="userRole === 3">
      <v-col cols="12" md="4" v-for="card in teacherCards" :key="card.title">
        <v-card outlined>
          <v-card-title>{{ card.title }}</v-card-title>
          <v-card-text>{{ card.subtitle }}</v-card-text>
          <v-card-actions>
            <v-btn :to="card.link" block>{{ card.cta }}</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <v-row v-else-if="userRole === 2">
      <v-col cols="12" md="4" v-for="card in studentCards" :key="card.title">
        <v-card outlined>
          <v-card-title>{{ card.title }}</v-card-title>
          <v-card-actions>
            <v-btn :to="card.link" block>{{ card.cta }}</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <v-row v-else>
      <v-col cols="12" md="4" v-for="card in adminCards" :key="card.title">
        <v-card outlined>
          <v-card-title>{{ card.title }}</v-card-title>
          <v-card-actions>
            <v-btn :to="card.link" block>{{ card.cta }}</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <v-divider class="my-6"/>

    <!-- Accesos Directos -->
    <v-row>
  <v-col cols="12">
    <h3 class="text-h6 text-center mb-4">Accesos Directos</h3>
  </v-col>

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
  // { title: 'Mis Horarios', subtitle: `Hoy ${new Date().toLocaleDateString()}`, cta: 'Ver Detalle', link: '/horarios' },
  // { title: 'Mis Notas', subtitle: 'Última actualización: 10/02/2025', cta: 'Ver Notas', link: '/notas' },
  // { title: 'Mis Pagos', subtitle: 'Pendientes: 2', cta: 'Ver Pagos', link: '/pagos' }
  { title: 'Mis cursos', cta: 'Ver cursos', link: '/principal/mis-cursos-docente' },
  { title: 'Mi Asistencia', cta: 'Ver mi asistencia', link: '/principal/consulta-asistencia-empleado' },
]

const studentCards = [
  { title: 'Mis Clases', cta: 'Ver Horario', link: '/principal/mi-horario-escolar' },
  { title: 'Mi Asistencia', cta: 'Ver mi asistencia', link: '/principal/consulta-asistencia-alumno' },
  { title: 'Mis notas', cta: 'Ver mis notas', link: '/principal/mis-notas' },
]

const adminCards = [
  { title: 'Gestión educativa', cta: 'Mis aulas', link: '/principal/mis-aulas' },
  { title: 'Reportes', cta: 'Ver Reportes', link: '/reportes-admin' },
  { title: 'Configuración del Sistema', cta: 'Configurar', link: '/configuracion' }
]

// const formattedUserName = computed(() => {
//   if (!usuarioNombre.value) return ''
//   return usuarioNombre.value
//     .split(' ')
//     .filter(word => word.length)
//     .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
//     .join(' ')
// })

const roleName = computed(() => ({
  1: 'Administrador',
  3: 'Docente',
  2: 'Estudiante'
}[userRole.value] ?? ''))

function cargarDatosUsuario() {
  const userData = JSON.parse(localStorage.getItem('user') || '{}')
  usuarioNombre.value = userData.pers_nombres ?? ''
  userRole.value = Number(localStorage.getItem('perfil') ?? userData.role)
  console.log('userRole.value')
  console.log(userRole.value)
}

onMounted(cargarDatosUsuario)
</script>

<style scoped>
.v-carousel-item img { object-fit: cover }
.banner-img img {
  object-fit: cover;
  width: 100%;
  height: 200px;
}
.banner-item .v-image__image {
  object-fit: cover !important;
  width: 100% !important;
  height: 100% !important;
}
.banner-full {
  width: 100vw;
  margin-left: calc(-50vw + 50%);
  position: relative;
}

.banner-full .v-image__image {
  object-fit: cover !important;
  width: 100%;
  height: 100%;
}
.banner-central ::v-deep .v-carousel__controls {
  display: none !important;
}
.banner-central ::v-deep .v-carousel__prev,
.banner-central ::v-deep .v-carousel__next {
  display: none !important;
}

</style>
