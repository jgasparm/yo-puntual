<template>
  <v-container class="py-4">
    <v-row>
      <v-col>
        <h1 class="text-h5 mb-4">Mis Cursos</h1>
        <!-- Selector de Bimestre -->
        <v-select
          v-model="selectedBimestre"
          :items="bimestres"
          item-title="peed_nombre"
          item-value="peed_id"
          label="Bimestre"
          class="mb-4"
        />
        <v-btn color="primary" @click="filtrarCursos">
          Aplicar Filtro
        </v-btn>
      </v-col>
    </v-row>

    <!-- Vista Desktop: Tabla de cursos -->
    <div v-if="isDesktop">
      <v-data-table
        :headers="headers"
        :items="filteredCursos"
        class="elevation-1 mt-4"
      >
        <!-- Slot de acciones: ícono de consulta y de registro de notas -->
        <!-- eslint-disable-next-line vue/valid-v-slot -->
        <template v-slot:item.accion="{ item }">
        <div class="table-action">
          <v-btn icon color="primary" class="action-btn" @click="verNotas(item)">
            <v-icon size="24">mdi-eye</v-icon>
          </v-btn>
          <v-btn icon color="secondary" class="action-btn" @click="registrarNotas(item)">
            <v-icon size="24">mdi-pencil</v-icon>
          </v-btn>
        </div>
      </template>
      </v-data-table>
    </div>

    <!-- Vista Mobile: Tarjetas para cada curso -->
<div v-else>
  <v-alert v-if="!filteredCursos.length" type="info">
    No hay cursos disponibles
  </v-alert>
  <v-row v-else dense>
    <v-col
      v-for="(curso, index) in paginatedCursos"
      :key="index"
      cols="12"
      class="mb-2"
    >
      <!-- Se agrega position: relative para poder posicionar los botones de forma absoluta -->
      <v-card outlined style="position: relative; text-align: left;">
        <!-- Botón editar: se posiciona en la esquina superior derecha -->
        <v-btn
          icon
          color="secondary"
          @click="registrarNotas(curso)"
          style="position: absolute; top: 8px; right: 8px;"
        >
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <!-- Botón ver (opcional, si se requiere que también aparezca) -->
        <v-btn
          icon
          color="primary"
          @click="verNotas(curso)"
          style="position: absolute; top: 8px; right: 48px;"
        >
          <v-icon>mdi-eye</v-icon>
        </v-btn>
        <!-- Contenido del curso con padding-top para dejar espacio a los botones -->
        <v-card-text style="padding-top: 60px;">
          <div><strong>Curso:</strong> {{ curso.aede_nombre }}</div>
          <div><strong>Aula:</strong> {{ curso.aula }}</div>
          <div><strong>Turno:</strong> {{ curso.turn_nombre }}</div>
          <div><strong>Nivel:</strong> {{ curso.nive_nombre }}</div>
          <div><strong>Grado:</strong> {{ curso.grad_nombre }}</div>
          <div><strong>Sección:</strong> {{ curso.secc_nombre }}</div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
  <!-- Paginación para mobile -->
  <v-pagination
    v-if="paginatedPages > 1"
    v-model="currentPage"
    :length="paginatedPages"
    :total-visible="3"
    show-first-last
    first-icon="mdi-chevron-double-left"
    last-icon="mdi-chevron-double-right"
    prev-icon="mdi-chevron-left"
    next-icon="mdi-chevron-right"
    class="mt-2 custom-pagination"
  />
</div>

    <!-- Modal de "No se encontraron resultados" -->
    <v-dialog v-model="dialogNoResults" max-width="400">
      <v-card>
        <v-card-title class="headline">No se encontraron resultados</v-card-title>
        <v-card-text>
          La consulta no arrojó resultados.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="dialogNoResults = false">Aceptar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useDisplay } from 'vuetify'

const dialogNoResults = ref(false)

// Detecta si la pantalla es de tamaño md y superior
const { mdAndUp } = useDisplay()
const isDesktop = mdAndUp

const allData = ref([])           // Data completa del API
const bimestres = ref([])         // Lista de bimestres
const selectedBimestre = ref(null)

// Columnas de la tabla (solo se usan en vista Desktop)
const headers = [
  { title: 'Curso', key: 'aede_nombre' },
  { title: 'Aula', key: 'aula' },
  { title: 'Turno', key: 'turn_nombre' },
  { title: 'Nivel', key: 'nive_nombre' },
  { title: 'Grado', key: 'grad_nombre' },
  { title: 'Sección', key: 'secc_nombre' },
  { title: 'Acción', key: 'accion', sortable: false }
]

const router = useRouter()

// Variables para la paginación en mobile
const currentPage = ref(1)
const itemsPerPage = ref(5)

// Computada para obtener el slice de cursos según la página actual
const paginatedCursos = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filteredCursos.value.slice(start, start + itemsPerPage.value)
})

// Computada para determinar el total de páginas
const paginatedPages = computed(() => {
  return Math.ceil(filteredCursos.value.length / itemsPerPage.value)
})

onMounted(() => {
  fetchAllData()
})

// Watch para reiniciar la página actual cada vez que cambia el filtro
watch(selectedBimestre, () => {
  currentPage.value = 1
})

// Consulta al API usando axios y pasando los parámetros en la URL
async function fetchAllData() {
  try {
    const token = localStorage.getItem("token")
    const profile = localStorage.getItem("profile")
    const ai_usua_id = localStorage.getItem("usua_id")
    const ac_anio_escolar = localStorage.getItem("anio_escolar")

    if (!token || !profile) {
      console.warn("Falta token o profile en localStorage.")
      return
    }
    console.log("Ejecutando consulta a la API...")

    const baseUrl = "https://amsoftsolution.com/amss/ws/wsConsultaRegistroAuxiliarDocenteAlumnos.php"
    const params = {
      ai_usua_id,
      ac_anio_escolar,
      av_profile: profile
    }

    const configReq = {
      params,
      headers: { Authorization: `Bearer ${token}` },
    }

    const response = await axios.get(baseUrl, configReq)
    if (response.data.status) {
      allData.value = response.data.data
      bimestres.value = allData.value.map(b => ({
        peed_id: b.peed_id,
        peed_nombre: b.peed_nombre
      }))
      if (bimestres.value.length > 0) {
        selectedBimestre.value = bimestres.value[0].peed_id
      }
    }
  } catch (error) {
    console.error('Error al obtener los cursos:', error)
  }
}

// Filtra los cursos según el bimestre seleccionado
const filteredCursos = computed(() => {
  if (!selectedBimestre.value) return []
  const bimestreObj = allData.value.find(b => b.peed_id === Number(selectedBimestre.value))
  return bimestreObj ? bimestreObj.cursos : []
})

function filtrarCursos() {
  // Aquí se puede agregar lógica adicional si es necesario
}

// Navegación al hacer clic en "Ver Notas"
async function verNotas(curso) {
  // Obtenemos el bimestre actual (como en el código original)
  const bimestre = allData.value.find(b => b.peed_id === Number(selectedBimestre.value))
  // Datos necesarios para el API
  const token = localStorage.getItem("token")
  const profile = localStorage.getItem("profile")
  const ai_usua_id = localStorage.getItem("usua_id")
  const ac_anio_escolar = localStorage.getItem("anio_escolar")
  const doad_id = curso.doad_id

  const baseUrl = "https://amsoftsolution.com/amss/ws/wsConsultaRegistroAuxiliarDocenteAlumnosDetalle.php"
  const params = {
    ai_usua_id,
    ai_doad_id: doad_id,
    ac_anio_escolar,
    av_profile: profile
  }
  const configReq = {
    params,
    headers: { Authorization: `Bearer ${token}` },
  }

  try {
    const response = await axios.get(baseUrl, configReq)
    // Suponiendo que el API devuelve "messagecode" para indicar que no hay resultados
    if (response.data.messageCode === "4") {
      dialogNoResults.value = true
      return  // No se navega a la página de detalle
    } else {
      console.log('Curso')
      console.log(curso)
      // Se navega a la página MisCursosDetalle y se pasa la respuesta del API
      router.push({
        name: 'DocenteMisCursosConsultaNotas',
        query: {
          curso: encodeURIComponent(JSON.stringify(curso)),
          bimestre: encodeURIComponent(JSON.stringify(bimestre)),
          detalle: encodeURIComponent(JSON.stringify(response.data))
        }
      })
    }
  } catch (error) {
    console.error('Error al obtener detalle de notas:', error)
  }
}


// Función para registrar notas
function registrarNotas(curso) {
  const bimestre = allData.value.find(b => b.peed_id === Number(selectedBimestre.value))
  router.push({
    name: 'DocenteMisCursosRegistroNotas',
    query: {
      curso: encodeURIComponent(JSON.stringify(curso)),
      bimestre: encodeURIComponent(JSON.stringify(bimestre))
    }
  })
}
</script>

<style scoped>
/* Encapsula los botones en un contenedor flex para desktop */
.table-action {
  display: flex;
  gap: 8px;
  justify-content: center;
  align-items: center;
}

/* Forzar estilos para los botones en desktop */
.action-btn {
  padding: 4px !important;
  min-width: 0 !important;
  /* Puedes ajustar márgenes o font-size si fuera necesario */
}
</style>
