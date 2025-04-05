<template>
  <v-container class="py-4">    
    <v-row class="mb-2">
      <v-col cols="12" class="d-flex justify-space-between align-center">
        <h1 class="mb-2">
          <strong>Curso:</strong> {{ cursoSeleccionado?.aede_nombre }}
        </h1>
        <v-btn color="primary" @click="goBack" class="mb-4">
          Regresar
        </v-btn>
      </v-col>
    </v-row>

    <v-row class="mb-4">
      <v-col cols="12" sm="6" md="4">
        <v-select
          v-model="selectedBimestre"
          :items="bimestres"
          item-title="peed_nombre"
          item-value="peed_id"
          label="Bimestre"
          dense
          solo
          @update:modelValue="onSelectBimestre"
        />
      </v-col>

      <v-col cols="12" sm="6" md="4">
        <v-select
          v-model="selectedEvaluacion"
          :items="evaluaciones"
          item-title="eval_nombre"
          item-value="eval_id"
          label="Evaluación"
          clearable
          solo
        />
      </v-col>
    </v-row>


    <!-- Filtro por Alumno -->
    <v-row class="mb-4">
      <v-col cols="12" sm="6" md="6">
        <v-text-field
          v-model="alumnoFilter"
          label="Buscar Alumno"
          clearable
          solo
        />
      </v-col>
    </v-row>

    <!-- Tabla de Notas (Desktop) -->
    <div v-if="isDesktop">
      <v-data-table
  :headers="[]"
  :items="filteredItems"
  hide-default-header
  class="elevation-1 mt-4"
>
  <!-- Te defines un "default slot" en lugar de "body" -->
  <template v-slot:default="{ items }">
    <table style="width: 100%;">
      <thead>
        <tr>
          <th
            v-for="(header, colIndex) in dynamicHeaders"
            :key="colIndex"
          >
            {{ header.title }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(row, rowIndex) in items"
          :key="rowIndex"
        >
          <td
            v-for="(header, colIndex) in dynamicHeaders"
            :key="colIndex"
          >
            <!-- 1) Si la columna es "prom", se muestra el valor o "0", sin clic -->
            <template v-if="header.key === 'prom'">
              <div class="cell-custom">
                {{ row.prom || '0' }}
              </div>
            
            <!-- 2) Si la columna incluye 'nota_', va con <v-tooltip> y @click -->
            </template>
            <template v-else-if="header.key.includes('nota_')">
              <v-tooltip location="bottom">
                <template #activator="{ props }">
                  <div
                    v-bind="props"
                    class="cell-custom"
                    :style="{
                      backgroundColor: header.bgColor || 'transparent',
                      cursor: 'pointer'
                    }"
                    @click.stop="openNoteDialog(row, header)"
                  >
                    {{ row[header.key] || 'Agregar' }}
                  </div>
                </template>
                Clic para agregar o modificar nota
              </v-tooltip>
            
            <!-- 3) De lo contrario (ej: "N°", "Alumno"), solo muestra el valor sin clic -->
            </template>
            <template v-else>
              <div class="cell-custom">
                {{ row[header.key] }}
              </div>
            </template>
          </td>
        </tr>
      </tbody>
    </table>
  </template>
</v-data-table>
    </div>

    <!-- Vista Mobile: Tarjetas (igual que siempre) -->
    <div v-else>
      <v-alert
        v-if="dynamicHeaders.length === 0 || filteredItems.length === 0"
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
                  <h3>
                    <strong>
                      Prom. {{ selectedEvaluacionName }}: {{ item.prom }}
                    </strong>
                  </h3>
                </v-col>
                
                <v-col
                  v-for="(header, i) in filteredDynamicHeaders"
                  :key="i"
                  cols="12"
                  :style="{ backgroundColor: header.bgColor || 'transparent', cursor: 'pointer' }"
                  @click="openNoteDialog(item, header)"
                >
                  <strong>
                    {{ header.title }}:
                    {{ item[header.key] ? item[header.key] : 'Agregar' }}
                  </strong>
                </v-col>

              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Paginación Mobile -->
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

    <!-- Diálogo para Agregar/Actualizar Nota -->
    <v-dialog v-model="noteDialog" max-width="500" attach="body">
      <v-card>
        <v-card-title>
          <span class="text-h6">
            {{ noteForm.mode === 'add' ? 'Agregar Nota' : 'Actualizar Nota' }}
          </span>
        </v-card-title>
        <v-card-text>
          <v-text-field 
            label="Valor de Nota" 
            v-model="noteForm.value" 
            type="number"
            min="0"
            max="20"
            @input="onNoteValueChange"
          />
          <v-text-field label="Letra" v-model="noteForm.letter" readonly />
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="closeNoteDialog">
            Cancelar
          </v-btn>
          <v-btn color="primary" text @click="submitNote">
            Guardar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal "No se encontraron resultados" -->
    <v-dialog v-model="dialogNoResults" max-width="400">
      <v-card>
        <v-card-title class="headline">No se encontraron resultados</v-card-title>
        <v-card-text>La consulta no arrojó resultados.</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" text @click="dialogNoResults = false">Aceptar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar
      v-model="errorSnackbar"
      color="error"
      timeout="5000"
      top
      right
    >
      {{ errorMessage }}
    </v-snackbar>

  </v-container>
</template>

<script setup>

import { ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useDisplay } from 'vuetify'
import axios from 'axios'

const errorSnackbar = ref(false)
const errorMessage = ref('')

const bimestres = ref([])
const selectedBimestre = ref(null)
const selectedPacuId = ref(null)
//const rawNotas = ref([]) 

// const filteredNotas = computed(() =>
//   rawNotas.value.filter(n =>
//     n.peed_id === selectedBimestre.value &&
//     (!selectedEvaluacion.value || n.eval_id === selectedEvaluacion.value)
//   )
// )

async function fetchBimestres() {
  const profile = localStorage.getItem("profile")
  const token = localStorage.getItem("token")
  const { data } = await axios.get("https://amsoftsolution.com/amss/ws/wsListaPeriodoEducativoPlanCurricular.php", {
    params: { ai_doad_id: doad_id.value, av_profile: profile },
    headers: { Authorization: `Bearer ${token}` }
  })
  if (data.status) {
    bimestres.value = data.data
    selectedBimestre.value = data.data[0]?.peed_id
    selectedPacuId.value = data.data[0]?.pacu_id
  }
}



// dynamicHeaders, filteredDynamicHeaders, etc.
const dynamicHeaders = ref([])

// Filtrado de headers para mobile
const filteredDynamicHeaders = computed(() => {
  return dynamicHeaders.value.filter(header =>
    header.key !== 'alumno' && header.key !== 'numero' && header.key !== 'prom'
  )
})

// Router y responsividad
const router = useRouter()
const route = useRoute()
const { mdAndUp } = useDisplay()
const isDesktop = mdAndUp

// Datos de curso y bimestre
const cursoSeleccionado = ref(
  route.query.curso ? JSON.parse(decodeURIComponent(route.query.curso)) : null
)

const doad_id = ref(
  route.query.doad_id || (cursoSeleccionado.value ? cursoSeleccionado.value.doad_id : null  
  ));

const dialogNoResults = ref(false)

// Evaluaciones y filtro
const evaluaciones = ref([])
const selectedEvaluacion = ref(null)

// Filtro por Alumno
const alumnoFilter = ref('')

// Tabla de notas
const tableItems = ref([])

// Items filtrados
const filteredItems = computed(() => {
  if (!alumnoFilter.value) return tableItems.value
  return tableItems.value.filter(item =>
    item.alumno.toLowerCase().includes(alumnoFilter.value.toLowerCase())
  )
})

// Paginación (mobile)
const currentPage = ref(1)
const itemsPerPage = ref(5)
const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filteredItems.value.slice(start, start + itemsPerPage.value)
})
const paginatedPages = computed(() => {
  return Math.ceil(filteredItems.value.length / itemsPerPage.value)
})

// Nombre de evaluación (mobile)
const selectedEvaluacionName = computed(() => {
  const evalObj = evaluaciones.value.find(e => e.eval_id === selectedEvaluacion.value)
  return evalObj ? evalObj.eval_nombre : ''
})

// Diálogo de nota
const noteDialog = ref(false)
const noteForm = ref({
  mode: '',
  student: null,
  noteIndex: null,
  reau_id: null,
  value: '',
  letter: '',
  pcae_id: null
})



// Abrir el diálogo
function openNoteDialog(item, column) {
  console.log('openNoteDialog triggered', item, column)
  const noteIndex = parseInt(column.key.split('_')[1]) - 1
  const noteObj =
    item._evaluaciones && item._evaluaciones[noteIndex]
      ? item._evaluaciones[noteIndex]
      : null

  if (noteObj) {
    // Editar
    noteForm.value.mode = 'edit'
    noteForm.value.reau_id = noteObj.reau_id
    noteForm.value.value = noteObj.reau_evaluacion
    noteForm.value.letter = noteObj.reau_evaluacion_letra
  } else {
    // Agregar
    noteForm.value.mode = 'add'
    noteForm.value.reau_id = null
    noteForm.value.value = ''
    noteForm.value.letter = ''
    noteForm.value.pcae_id = item.pcae_id || null
  }
  noteForm.value.student = item
  noteForm.value.noteIndex = noteIndex
  // Lógica para actualizar la letra según valor ingresado
  onNoteValueChange()
  noteDialog.value = true
}

function onNoteValueChange() {
  let val = parseInt(noteForm.value.value)

  if (isNaN(val)) {
    noteForm.value.letter = ''
    return
  }

  if (val < 0) val = 0
  if (val > 20) val = 20

  noteForm.value.value = val

  if (val >= 0 && val <= 10) {
    noteForm.value.letter = 'C'
  } else if (val >= 11 && val <= 13) {
    noteForm.value.letter = 'B'
  } else if (val >= 14 && val <= 17) {
    noteForm.value.letter = 'A'
  } else if (val >= 18 && val <= 20) {
    noteForm.value.letter = 'AD'
  } else {
    noteForm.value.letter = ''
  }
}



function closeNoteDialog() {
  noteDialog.value = false
}

// Guardar nota
async function submitNote() {
  const token = localStorage.getItem("token")
  const profile = localStorage.getItem("profile") || "demo"

  try {
    const config = {
      headers: { Authorization: `Bearer ${token}` }
    }

    if (noteForm.value.mode === 'add') {
      const payload = {
        ai_pcal_id: noteForm.value.student.pcal_id,
        ai_pcev_id: noteForm.value.student.pcev_id,
        ai_pcae_id: noteForm.value.pcae_id,
        adc_reau_evaluacion: noteForm.value.value,
        ac_reau_evaluacion_letra: noteForm.value.letter,
        av_profile: profile
      }
      const response = await axios.post(
        "https://amsoftsolution.com/amss/ws/wsRegistraRegistroAuxiliar.php",
        payload,
        config
      )
      if (response.data.status) {
        noteDialog.value = false
        fetchNotas()
      } else {
        throw new Error(response.data.sage || 'Error al registrar la nota.')
      }

    } else if (noteForm.value.mode === 'edit') {
      const payload = {
        ai_reau_id: noteForm.value.reau_id,
        adc_reau_evaluacion: noteForm.value.value,
        ac_reau_evaluacion_letra: noteForm.value.letter,
        av_profile: profile
      }
      const response = await axios.post(
        "https://amsoftsolution.com/amss/ws/wsActualizaRegistroAuxiliar.php",
        payload,
        config
      )
      if (response.data.status) {
        noteDialog.value = false
        fetchNotas()
      } else {
        throw new Error(response.data.sage || 'Error al actualizar la nota.')
      }
    }
  } catch (err) {
    console.error('Error al guardar nota:', err)
    errorMessage.value = err?.response?.data?.sage || err.message || 'Ocurrió un error inesperado.'
    errorSnackbar.value = true
  }

}

// Cargar evaluaciones
async function fetchEvaluaciones() {
  try {
    const token = localStorage.getItem("token")
    const profile = localStorage.getItem("profile")
    const ai_usua_id = localStorage.getItem("usua_id")
    const ai_peed_id = selectedBimestre.value

    const ai_doad_id = cursoSeleccionado.value
      ? cursoSeleccionado.value.doad_id
      : null

    const ai_pacu_id = selectedPacuId.value
    // const ai_aude_id = cursoSeleccionado.value
    //   ? cursoSeleccionado.value.aude_id
    //   : null
    const ac_anio_escolar = localStorage.getItem("anio_escolar")

    const baseUrl =
      "https://amsoftsolution.com/amss/ws/wsListaEvaluacionesDocentePeriodo.php"
    const params = {
      ai_usua_id,
      ai_peed_id,
      ai_doad_id,
      ai_pacu_id,
      ac_anio_escolar,
      av_profile: profile
    }
    const configReq = {
      params,
      headers: { Authorization: `Bearer ${token}` }
    }
    const response = await axios.get(baseUrl, configReq)
    if (response.data.status) {
      evaluaciones.value = response.data.data
      if (evaluaciones.value.length > 0) {
        selectedEvaluacion.value = evaluaciones.value[0].eval_id
      } else {
        selectedEvaluacion.value = null
        dynamicHeaders.value = []
        tableItems.value = []
      }
    }
    else {
      evaluaciones.value = []
      selectedEvaluacion.value = null
      dynamicHeaders.value = []
      tableItems.value = []
    }
  } catch (error) {
    evaluaciones.value = [];
    selectedEvaluacion.value = null;
    dynamicHeaders.value = []
    tableItems.value = []
    console.error("Error fetching evaluations", error)
  }
}

// Cargar notas
async function fetchNotas() {
  try {
    if (!selectedEvaluacion.value) return
    const token = localStorage.getItem("token")
    const profile = localStorage.getItem("profile")
    const ai_usua_id = localStorage.getItem("usua_id")
    const ai_peed_id = selectedBimestre.value
    const ai_aude_id = cursoSeleccionado.value
      ? cursoSeleccionado.value.aude_id
      : null
    const ai_doad_id = cursoSeleccionado.value
      ? cursoSeleccionado.value.doad_id
      : null
    const ac_anio_escolar = localStorage.getItem("anio_escolar")

    const baseUrl =
      "https://amsoftsolution.com/amss/ws/wsConsultaRegistroAuxiliarEvaluacionPeriodo.php"
    const params = {
      ai_peed_id,
      ai_eval_id: selectedEvaluacion.value,
      ai_usua_id,
      ai_aude_id,
      ai_doad_id,
      ac_anio_escolar,
      av_profile: profile
    }
    const configReq = {
      params,
      headers: { Authorization: `Bearer ${token}` }
    }
    const response = await axios.get(baseUrl, configReq)
    if (response.data.status) {
      noteDialog.value = false
      parseNotasForTable(response.data.data)
    } else {
      dynamicHeaders.value = []
      tableItems.value = []
    }
  } catch (error) {
    console.error("Error fetching notes", error)
  }
}

// Parsear notas y construir dynamicHeaders + tableItems
function parseNotasForTable(notasData, maxNotas = 0) {
  const headersTemp = []

  if (isDesktop.value) {
    headersTemp.push({ title: 'N°', key: 'numero', align: 'start' })
    headersTemp.push({ title: 'Alumno', key: 'alumno', align: 'start' })
  }

  const evalObj = evaluaciones.value.find(
    e => e.eval_id === selectedEvaluacion.value
  )
  const evalNombre = evalObj ? evalObj.eval_nombre : 'Evaluación'
  const evalAbre = evalObj ? evalObj.eval_abreviacion : ''

  if (!maxNotas && evalObj) {
    maxNotas = parseInt(evalObj.pcev_cantidad_evaluacion) || 0
  }

  for (let i = 1; i <= maxNotas; i++) {
    headersTemp.push({
      title: `${evalAbre} #${i}`,
      key: `nota_${i}`,
      sortable: false,
      bgColor: getColorForEvaluation(evalAbre)
    })
  }

  headersTemp.push({
    title: `Prom. ${evalNombre}`,
    key: 'prom',
    sortable: false,
    bgColor: getColorForEvaluation(evalAbre)
  })

  dynamicHeaders.value = headersTemp

  const itemsTemp = []
  let index = 1
  notasData.forEach(student => {
    const row = {}
    row.numero = index++
    row.alumno = student.alumno
    row.pcae_id = student.pcae_id
    row.pcal_id = student.pcal_id
    row.pcev_id = student.pcev_id
    const evals = student.evaluaciones || []
    evals.sort((a, b) => a.reau_id - b.reau_id)

    for (let i = 0; i < maxNotas; i++) {
      if (i < evals.length) {
        let valor = evals[i].reau_evaluacion
        let letra = evals[i].reau_evaluacion_letra
        row[`nota_${i + 1}`] = `${valor} (${letra})`
      } else {
        row[`nota_${i + 1}`] = ''
      }
    }

    row.prom =
      student.pcae_promedio_evaluacion && student.pcae_promedio_evaluacion_letra
        ? `${student.pcae_promedio_evaluacion} (${student.pcae_promedio_evaluacion_letra})`
        : ''

    row._evaluaciones = evals
    itemsTemp.push(row)
  })

  tableItems.value = itemsTemp
}


async function onSelectBimestre(peed_id) {
  const selected = bimestres.value.find(b => b.peed_id === peed_id);
  selectedPacuId.value = selected ? selected.pacu_id : null;
  await fetchEvaluaciones();
}

// Color para cada abreviación
function getColorForEvaluation(abre) {
  const colorMapping = {
    PA: '#FFCDD2',
    PR: '#C8E6C9',
    TA: '#BBDEFB',
    RC: '#D1C4E9',
    EM: '#FFE082',
    EB: '#FFCDD2'
  }
  return colorMapping[abre.toUpperCase()] || '#EEEEEE'
}

// Ir atrás
function goBack() {
  router.push({ name: 'DocenteMisCursos' })
}

// Montaje
onMounted(async () => {
  await fetchBimestres()
  await fetchEvaluaciones()
  
})

// Watch
//watch([selectedBimestre, selectedEvaluacion], () => {
//  if (selectedBimestre.value && selectedEvaluacion.value) {
//    fetchNotas()
//  }
//})
watch([selectedBimestre, selectedEvaluacion], async () => {
  if (!selectedEvaluacion.value) {
    dynamicHeaders.value = []
    tableItems.value = []
    return
  }

  const evalObj = evaluaciones.value.find(
    e => e.eval_id === selectedEvaluacion.value
  )
  const cantidad = evalObj ? parseInt(evalObj.pcev_cantidad_evaluacion) || 0 : 0

  // Generar columnas aunque no haya datos aún
  parseNotasForTable([], cantidad)

  // Luego traer datos reales (si existen)
  await fetchNotas()
}, { immediate: true })


</script>

<style scoped>
.cell-custom {
  padding: 8px;
  background-clip: padding-box;
}
/* Si quieres un color de texto en th: */
table thead th {
  color: black; 
  font-weight: bold;
  text-align: left;
}
.multiline2-ellipsis {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: normal;
}
</style>
