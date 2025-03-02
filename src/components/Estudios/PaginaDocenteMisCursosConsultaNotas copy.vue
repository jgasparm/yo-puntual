<template>
  <v-container class="py-4">
    <!-- Botón para regresar -->
    <v-btn color="primary" @click="goBack" class="mb-4">
      Regresar
    </v-btn>

    <!-- ENCABEZADO INSTITUCIÓN -->
    <v-row class="text-center mb-2">
      <v-col cols="12">
        <h2 class="text-h6">Institución Educativa Privada "Líder School"</h2>
        <p>R.D. N° 713 - 2016 / UGEL 04 COMAS</p>
      </v-col>
    </v-row>

    <!-- REGISTRO Y BIMESTRE -->
    <v-row class="mb-2">
      <v-col cols="12" class="d-flex justify-space-between">
        <div>
          <strong>Registro Auxiliar - 2023</strong>
        </div>
        <div>
          <strong>{{ bimestreSeleccionado?.peed_nombre }}</strong>
        </div>
      </v-col>
    </v-row>

    <!-- DATOS DEL CURSO / PROFESOR -->
    <v-row class="mb-4">
      <v-col cols="12" class="d-flex justify-space-between">
        <div><strong>Profesor:</strong> SANDRA MENDOZA LUNA</div>
        <div><strong>Grado:</strong> {{ cursoSeleccionado?.grad_nombre }}</div>
        <div><strong>Curso:</strong> {{ cursoSeleccionado?.curs_nombre }}</div>
      </v-col>
    </v-row>

    <!-- TABLA DE NOTAS DINÁMICA (solo se muestra cuando ya se tienen headers) -->
    <v-data-table
      v-if="dynamicHeaders.length > 0"
      :headers="dynamicHeaders"
      :items="tableItems"
      :items-per-page="10"
      class="elevation-1 mt-4"
    >
      <!-- Slot específico para la columna 'alumno', si deseas personalización -->
      <!-- eslint-disable-next-line vue/valid-v-slot -->
      <template #item.alumno="{ item }">
        {{ item.alumno }}
      </template>

      <!-- Slot global para personalizar cada celda -->
      <template #cell="{ item, column }">
        <div class="cell-custom" :style="{ backgroundColor: column.bgColor || 'transparent' }">
          {{ item[column.key] }}
        </div>
      </template>
    </v-data-table>
    
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
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const route = useRoute()

const cursoSeleccionado = ref(
  route.query.curso
    ? JSON.parse(decodeURIComponent(route.query.curso))
    : null
)
const bimestreSeleccionado = ref(
  route.query.bimestre
    ? JSON.parse(decodeURIComponent(route.query.bimestre))
    : null
)

const alumnos = ref([])

// dynamicHeaders y tableItems se generan dinámicamente
const dynamicHeaders = ref([])  
const tableItems = ref([])

const titulo = ref('Detalle de Notas')

onMounted(() => {
  if (!cursoSeleccionado.value || !bimestreSeleccionado.value) {
    router.push({ name: 'DocenteMisCursos' })
    return
  }
  const dtng_id = cursoSeleccionado.value.dtng_id
  fetchDetalle(dtng_id)
})

async function fetchDetalle(dtng_id) {
  try {
    const token = localStorage.getItem("token")
    const profile = localStorage.getItem("profile") || "demo"
    const ai_usua_id = localStorage.getItem("ai_usua_id") || 5
    const ac_anio_escolar = localStorage.getItem("ac_anio_escolar") || 2025

    if (!token || !profile) {
      console.warn("Falta token o profile en localStorage.")
      return
    }

    const baseUrl = "https://amsoftsolution.com/amss/ws/wsConsultaRegistroAuxiliarDocenteAlumnosDetalle.php"
    const params = {
      ai_usua_id,
      ai_dtng_id: dtng_id,
      ac_anio_escolar,
      av_profile: profile
    }

    const configReq = {
      params,
      headers: { Authorization: `Bearer ${token}` },
    }

    const response = await axios.get(baseUrl, configReq)
    if (response.data.status) {
      alumnos.value = response.data.data
      if (alumnos.value.length > 0) {
        titulo.value = `Detalle de Notas - ${alumnos.value[0].aede_nombre || ''}`
      }
      parseDataForTable()
    }
  } catch (error) {
    console.error('Error al obtener detalle de notas:', error)
  }
}

/**
 * Función para asignar un color de fondo según la evaluación.
 */
function getColorForEvaluation(nombre) {
  const colorMapping = {
    'PA': '#FFCDD2',  // Participaciones
    'PR': '#C8E6C9',  // Prácticas
    'TA': '#BBDEFB',  // Tareas
    'RC':  '#D1C4E9',  // Revisión
    'EM': '#FFE082',  // Examen
  }
  return colorMapping[nombre.toUpperCase()] || '#EEEEEE'
}

/**
 * Genera dynamicHeaders y tableItems a partir de los datos del API.
 */
function parseDataForTable() {
  const bimestreId = bimestreSeleccionado.value.peed_id
  const dataBimestre = alumnos.value.filter(item => item.peed_id === bimestreId)

  if (!dataBimestre.length) {
    dynamicHeaders.value = []
    tableItems.value = []
    return
  }

  const evalMap = {}
  dataBimestre.forEach(alumnoItem => {
    alumnoItem.alumnos_cursos_promedios.forEach(evalData => {
      const { eval_id, eval_abreviacion, alumnos_cursos_notas } = evalData
      const numNotas = alumnos_cursos_notas.length
      if (!evalMap[eval_id]) {
        evalMap[eval_id] = { nombre: eval_abreviacion, maxNotas: numNotas }
      } else if (numNotas > evalMap[eval_id].maxNotas) {
        evalMap[eval_id].maxNotas = numNotas
      }
    })
  })

  const builtHeaders = []
  builtHeaders.push({ title: 'N°', key: 'numero', align: 'start' })
  builtHeaders.push({ title: 'Apellidos y Nombres', key: 'alumno', align: 'start' })

  Object.keys(evalMap).forEach(evalId => {
    const evalInfo = evalMap[evalId]
    // Obtén el color para la evaluación
    
    const bgColor = getColorForEvaluation(evalInfo.nombre)
    for (let i = 1; i <= evalInfo.maxNotas; i++) {
      builtHeaders.push({
        title: `${evalInfo.nombre} #${i}`,
        key: `eval_${evalId}_nota_${i}`,
        sortable: false,
        bgColor
      })
    }
    builtHeaders.push({
      title: `Prom. ${evalInfo.nombre}`,
      key: `eval_${evalId}_prom`,
      sortable: false,
      bgColor
    })
  })

  builtHeaders.push({ title: 'Prom. Bim', key: 'promBim', sortable: false })

  const builtItems = dataBimestre.map((alumnoItem, index) => {
    const row = {}
    row.numero = index + 1
    row.alumno = alumnoItem.alumno
    alumnoItem.alumnos_cursos_promedios.forEach(evalData => {
      const { eval_id, pcae_promedio_evaluacion, pcae_promedio_evaluacion_letra } = evalData
      const { alumnos_cursos_notas } = evalData
      alumnos_cursos_notas.forEach((notaItem, nIndex) => {
        const colKey = `eval_${eval_id}_nota_${nIndex + 1}`
        row[colKey] = `${notaItem.reau_evaluacion} (${notaItem.reau_evaluacion_letra})`
      })
      const maxNotas = evalMap[eval_id].maxNotas
      if (alumnos_cursos_notas.length < maxNotas) {
        for (let i = alumnos_cursos_notas.length + 1; i <= maxNotas; i++) {
          const emptyKey = `eval_${eval_id}_nota_${i}`
          row[emptyKey] = ''
        }
      }
      const promKey = `eval_${eval_id}_prom`
      row[promKey] = `${pcae_promedio_evaluacion} (${pcae_promedio_evaluacion_letra})`
    })
    row.promBim = `${alumnoItem.pcal_promedio_periodo} (${alumnoItem.pcal_promedio_periodo_letra})`
    return row
  })

  dynamicHeaders.value = builtHeaders
  tableItems.value = builtItems
  console.log(dynamicHeaders)
  console.log(tableItems)
}

function goBack() {
  router.push({ name: 'DocenteMisCursos' })
}
</script>

<style scoped>
.mr-4 {
  margin-right: 1rem;
}
.cell-custom {
  padding: 8px;
  /* Forzamos el background si fuese necesario */
  background-clip: padding-box;
}
</style>
