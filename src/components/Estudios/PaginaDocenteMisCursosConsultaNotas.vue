<template>
  <v-container class="py-4">
    <!-- Botón para regresar -->
    <v-btn color="primary" @click="goBack" class="mb-4">
      Regresar
    </v-btn>

    <!-- REGISTRO Y BIMESTRE -->
    <v-row class="mb-2">
      <v-col cols="12" sm="6" class="mb-2">
        <strong>Curso:</strong> {{ cursoSeleccionado?.aede_nombre }}
      </v-col>
      <v-col cols="12" sm="6" class="mb-2">
        <strong>Bimestre:</strong> {{ bimestreSeleccionado?.peed_nombre }}
      </v-col>
    </v-row>

    <!-- DATOS DEL CURSO / PROFESOR -->
    <v-row class="mb-4">
      <v-col cols="12" sm="6" md="3">
        <strong>Turno:</strong> {{ cursoSeleccionado?.turn_nombre }}
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <strong>Nivel:</strong> {{ cursoSeleccionado?.nive_nombre }}
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <strong>Grado:</strong> {{ cursoSeleccionado?.grad_nombre }}
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <strong>Sección:</strong> {{ cursoSeleccionado?.secc_nombre }}
      </v-col>
    </v-row>

    <!-- CAJA DE BÚSQUEDA -->
    <v-row class="mb-4">
      <v-col cols="12" sm="6" md="4">
        <v-text-field
          v-model="searchQuery"
          label="Buscar alumno"
          clearable
          solo
        />
      </v-col>
    </v-row>

    <!-- TABLA DE NOTAS DINÁMICA (solo se muestra cuando ya se tienen headers) -->
    <div v-if="isDesktop">
      <v-data-table
        v-if="dynamicHeaders.length > 0"
        :headers="dynamicHeaders"
        :items="filteredItems"
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
    </div>

    <!-- VISTA MÓVIL: tarjetas con paginación -->
    <div v-else>
      <v-alert
        v-if="dynamicHeaders.length === 0 || tableItems.length === 0"
        type="info"
      >
        No hay notas disponibles
      </v-alert>

      <v-row v-else dense>
        <v-col
          v-for="(item, index) in paginatedItems"
          :key="index"
          cols="12"
          class="mb-2"
        >
          <v-card outlined>
            <v-col cols="12">
              <strong>N°:</strong> {{ item.numero }}
            </v-col>
            <v-card-title class="subtitle-2 font-weight-bold text-start multiline2-ellipsis">
              {{ item.alumno }}
            </v-card-title>
            <v-card-text class="text-start">
              <v-row dense>
                <v-col cols="12">
                  <h3> <strong>Promedio Bimestral: {{ item.promBim }} </strong></h3>
                </v-col>

                <!-- Si quieres mostrar todas las columnas dinámicas,
                     puedes iterar sobre dynamicHeaders y usar item[header.key] -->
                <v-col
                  v-for="(header, i) in dynamicHeaders"
                  :key="i"
                  cols="12"
                  :style="{ backgroundColor: header.bgColor || 'transparent' }"
                >
                  <strong :class="{'prom-header-mobile': header.key.includes('_prom')}">
                    {{ header.title }}:
                   {{ item[header.key] }}
                  </strong>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Paginación para móvil -->
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
import { ref, onMounted, computed  } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useDisplay } from 'vuetify' // <-- Importar
import axios from 'axios'

// Detecta si la pantalla es "md" o mayor
const { mdAndUp } = useDisplay()
const isDesktop = mdAndUp

const currentPage = ref(1)
const itemsPerPage = ref(5)
const searchQuery = ref("") // Variable reactiva para la búsqueda

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

// Computed para filtrar alumnos por nombre
const filteredItems = computed(() => {
  if (!searchQuery.value) return tableItems.value
  return tableItems.value.filter(item => 
    item.alumno.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

// Computed para paginación en vista móvil usando los items filtrados
const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filteredItems.value.slice(start, start + itemsPerPage.value)
})

const paginatedPages = computed(() => {
  return Math.ceil(filteredItems.value.length / itemsPerPage.value)
})


onMounted(() => {
  if (!cursoSeleccionado.value || !bimestreSeleccionado.value) {
    router.push({ name: 'DocenteMisCursos' })
    return
  }
  
  // Si viene la información del API en el query, la usamos
  if (route.query.detalle) {
    const responseData = JSON.parse(decodeURIComponent(route.query.detalle))
    if (responseData.status) {
      alumnos.value = responseData.data
      if (alumnos.value.length > 0) {
        titulo.value = `Detalle de Notas - ${alumnos.value[0].aede_nombre || ''}`
      }
      parseDataForTable()
    }
  } else {
    // Opcional: En caso de que no venga la información, se puede llamar al API como fallback
    const doad_id = cursoSeleccionado.value.doad_id
    fetchDetalle(doad_id)
  }
})


async function fetchDetalle(doad_id) {
  try {
    const token = localStorage.getItem("token")
    const profile = localStorage.getItem("profile")
    const ai_usua_id = localStorage.getItem("usua_id")
    const ac_anio_escolar = localStorage.getItem("anio_escolar")

    if (!token || !profile) {
      console.warn("Falta token o profile en localStorage.")
      return
    }

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
    'EB': '#FFCDD2',  // Examen
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
      const { eval_id, eval_abreviacion, eval_nombre, alumnos_cursos_notas } = evalData
      const numNotas = alumnos_cursos_notas.length

      const nombreParaMostrar = isDesktop.value ? eval_abreviacion : eval_nombre

      if (!evalMap[eval_id]) {
        evalMap[eval_id] = { nombre: nombreParaMostrar, maxNotas: numNotas, abre: eval_abreviacion }
      } else if (numNotas > evalMap[eval_id].maxNotas) {
        evalMap[eval_id].maxNotas = numNotas
      }
    })
  })

  const builtHeaders = []

  if (isDesktop.value) {
    builtHeaders.push({ title: 'N°', key: 'numero', align: 'start' }) //
    builtHeaders.push({ title: 'Apellidos y Nombres', key: 'alumno', align: 'start' }) //
  }

  Object.keys(evalMap).forEach(evalId => {
    const evalInfo = evalMap[evalId]
    // Obtén el color para la evaluación
    
    const bgColor = getColorForEvaluation(evalInfo.abre)
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

  if (isDesktop.value) {
    builtHeaders.push({ title: 'Prom. Bim', key: 'promBim', sortable: false }) //
  }
  

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
.multiline2-ellipsis {
  display: -webkit-box;         /* Flexbox antiguo para soportar -webkit-line-clamp */
  -webkit-line-clamp: 2;        /* Limita a 2 líneas */
  -webkit-box-orient: vertical; /* Define orientación vertical */
  overflow: hidden;             /* Oculta el contenido extra */
  text-overflow: ellipsis;      /* Muestra los "..." al truncar */
  white-space: normal;          /* Permite que el texto ocupe varias líneas */
}
.prom-header-mobile {
  font-weight: bold;
  font-size: 16px; /* Ajusta el tamaño según lo requieras */
}
</style>
