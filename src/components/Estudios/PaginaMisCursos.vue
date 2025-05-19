<template>
  <v-container class="py-4">
    <v-row>
  <v-col>
    <h2 class="text-h5 font-weight-bold text-primary">📘 Cursos del docente</h2>
    <p class="text-body-2 text-grey-darken-1 mb-4">
      Revisa los cursos que tienen asignados los docentes durante el año escolar.
    </p>
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
          <v-btn icon color="info" @click="verNotas(item, 'MisCursosConsultaNotas')">
            <v-icon>mdi-eye-outline</v-icon>
            <v-tooltip activator="parent" location="top">Ver notas</v-tooltip>
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
      <v-card outlined style="position: relative; text-align: left;">
        <!-- Botón de "ver" en la esquina superior derecha -->
          <v-btn
            icon
            color="primary"
            @click="verNotas(curso, 'MisCursosConsultaNotas')"
            style="position: absolute; top: 8px; right: 8px;"
          >
            <v-icon>mdi-eye</v-icon>
          </v-btn>
        <!-- Información del curso con padding-top para evitar superposición -->
        <v-card-text style="padding-top: 40px;">
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
        <v-card-title class="headline">Sin resultados</v-card-title>
        <v-card-text>
          No existen calificaciones para el periodo seleccionado.
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

const router = useRouter()
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
  { title: 'Docente', key: 'docente' },
  { title: 'Aula', key: 'aula' },
  { title: 'Turno', key: 'turn_nombre' },
  { title: 'Nivel', key: 'nive_nombre' },
  { title: 'Grado', key: 'grad_nombre' },
  { title: 'Sección', key: 'secc_nombre' },
  { title: 'Acción', key: 'accion', sortable: false }
]



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

// —– FETCH PERIODOS + DETALLE ——————————————————————————————
async function fetchPeriodosYDetalle(curso) {
  const token   = localStorage.getItem("token")
  const profile = localStorage.getItem("profile")
  if (!token || !profile) throw new Error("Credenciales faltantes")

  const { doad_id, aude_id, grad_id } = curso

  // 1) Periodos
  const perRes = await axios.get(
    "https://amsoftsolution.com/amss/ws/wsListaPeriodoEducativoPlanCurricular.php",
    {
      params: { ai_doad_id: doad_id, av_profile: profile },
      headers: { Authorization: `Bearer ${token}` }
    }
  )
  if (!perRes.data.status || !perRes.data.data.length) {
    throw new Error("No hay periodos asociados a este curso")
  }
  const periodos = perRes.data.data
  const bimestre = periodos.find(b => b.aepe_estado === "A") || periodos[0]

  // 2) Detalle de notas
  const detRes = await axios.get(
    "https://amsoftsolution.com/amss/ws/wsConsultaRegistroAuxiliar.php",
    {
      params: {
        ai_doad_id: doad_id,
        ai_aude_id: aude_id,
        ai_peed_id: bimestre.peed_id,
        ai_grad_id: grad_id,
        av_profile: profile
      },
      headers: { Authorization: `Bearer ${token}` }
    }
  )
  if (!detRes.data.status || !detRes.data.data.length) {
    throw new Error(`No hay calificaciones para ${bimestre.peed_nombre}`)
  }

  return { periodos, bimestre, detalle: detRes.data }
}

// —– ABRE LA VENTANA DE NOTAS ——————————————————————————————
async function verNotas(curso, ruta) {
  try {
    const { periodos, bimestre, detalle } = await fetchPeriodosYDetalle(curso)

    router.push({
      name: ruta,
      query: {
        curso:    encodeURIComponent(JSON.stringify(curso)),
        periodos: encodeURIComponent(JSON.stringify(periodos)),
        bimestre: encodeURIComponent(JSON.stringify({
          peed_id:     bimestre.peed_id,
          peed_nombre: bimestre.peed_nombre
        })),
        detalle:  encodeURIComponent(JSON.stringify(detalle))
      }
    })
  } catch (err) {
    // Si falla por "no hay datos", mostramos diálogo nativo
    dialogNoResults.value = true
    console.warn(err.message)
  }
}

// Consulta al API usando axios y pasando los parámetros en la URL
async function fetchAllData() {
  try {
    const token = localStorage.getItem("token")
    const profile = localStorage.getItem("profile") || "demo"
    const ac_anio_escolar = localStorage.getItem("ac_anio_escolar") || 2025

    if (!token || !profile) {
      console.warn("Falta token o profile en localStorage.")
      return
    }
    console.log("Ejecutando consulta a la API...")

    const baseUrl = "https://amsoftsolution.com/amss/ws/wsConsultaRegistroAuxiliarDocentesAlumnos.php"
    const params = {
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
  //if (!selectedBimestre.value) return []
  //const bimestreObj = allData.value.find(b => b.peed_id === Number(selectedBimestre.value))
  //return bimestreObj ? bimestreObj.cursos : []
  return allData.value
})

// Función para registrar notas
// function registrarNotas(curso) {
//   const bimestre = allData.value.find(b => b.peed_id === Number(selectedBimestre.value))
//   router.push({
//     name: 'DocenteMisCursosRegistroNotas',
//     query: {
//       curso: encodeURIComponent(JSON.stringify(curso)),
//       bimestre: encodeURIComponent(JSON.stringify(bimestre))
//     }
//   })
// }
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
