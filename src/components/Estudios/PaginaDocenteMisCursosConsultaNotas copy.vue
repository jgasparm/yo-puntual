<template>
  <v-container class="py-4">
    <!-- ENCABEZADO -->
    <v-row class="mb-2">
      <v-col cols="12">
        <template v-if="isDesktop">
          <div class="d-flex justify-space-between align-center">
            <h2 class="text-h5 font-weight-bold text-primary">📖 Consulta de Notas</h2>
            <v-btn color="primary" @click="goBack" class="mb-4" prepend-icon="mdi-arrow-left">
              Regresar
            </v-btn>
          </div>
        </template>
        <template v-else>
          <v-btn block color="primary" @click="goBack" class="mb-2" prepend-icon="mdi-arrow-left">
            Regresar
          </v-btn>
          <h2 class="text-h6 font-weight-bold text-primary">📖 Consulta de Notas</h2>
        </template>
      </v-col>
    </v-row>

    <!-- Datos del Curso -->
    <v-row class="mb-4 text-body-2">
      <v-col cols="12" sm="6" md="3"><strong>Turno:</strong> {{ cursoSeleccionado?.turn_nombre }}</v-col>
      <v-col cols="12" sm="6" md="3"><strong>Nivel:</strong> {{ cursoSeleccionado?.nive_nombre }}</v-col>
      <v-col cols="12" sm="6" md="3"><strong>Grado:</strong> {{ cursoSeleccionado?.grad_nombre }}</v-col>
      <v-col cols="12" sm="6" md="3"><strong>Sección:</strong> {{ cursoSeleccionado?.secc_nombre }}</v-col>
    </v-row>

    <!-- Filtros -->
    <v-row class="mb-4">
      <v-col cols="12" sm="6">
        <v-select
          v-model="selectedBimestre"
          :items="bimestres"
          item-title="peed_nombre"
          return-object
          label="Bimestre"
          dense
          solo
        />
      </v-col>
      <v-col cols="12" sm="6">
        <v-text-field
          v-model="searchQuery"
          label="Buscar alumno"
          clearable
          solo
        />
      </v-col>
    </v-row>

    <!-- Tabla Desktop -->
<div v-if="isDesktop">
  <v-alert v-if="filteredItems.length === 0" type="info" class="mt-4">
    No hay notas disponibles para este bimestre.
  </v-alert>

  <v-data-table
    v-if="dynamicHeaders.length > 0"
    :headers="dynamicHeaders"
    :items="filteredItems"
    :items-per-page="10"
    class="elevation-1 mt-4"
  >
    <!-- Cabecera personalizada -->
    <template #headers="{ columns }">
      <tr>
        <th
          v-for="column in columns"
          :key="column.key"
          :class="[
            column.key !== 'numero' && column.key !== 'alumno' ? column.groupClass : '',
            'pa-2 text-center'
          ]"
        >
          {{ column.title }}
        </th>
      </tr>
    </template>

    <!-- Contenido de filas -->
    <template #item="{ item, columns }">
      <tr>
        <td
          v-for="column in columns"
          :key="column.key"
          :class="[column.key !== 'numero' && column.key !== 'alumno' ? column.groupClass : '', 'pa-2']"
        >
          <div
            v-if="column.key !== 'numero' && column.key !== 'alumno'"
            class="cell-custom"
            :style="getNotaCellStyle(item[column.key])"
          >
            {{ item[column.key] }}
          </div>
          <span v-else>{{ item[column.key] }}</span>
        </td>
      </tr>
    </template>
  </v-data-table>
</div>


    <!-- Tarjetas Móvil -->
    <div v-else>
      <v-alert v-if="dynamicHeaders.length === 0 || tableItems.length === 0" type="info">
        No hay notas disponibles.
      </v-alert>

      <v-row v-else dense>
        <v-col
          v-for="(item, index) in paginatedItems"
          :key="index"
          cols="12"
          class="mb-2"
        >
          <v-card outlined>
            <v-card-title class="subtitle-2 font-weight-bold text-start">
              <div class="multiline2-ellipsis">{{ item.numero }}. {{ item.alumno }}</div>
            </v-card-title>
            <v-card-text class="text-start">
              <v-row dense>
                <template v-for="(group, groupIndex) in groupedHeaders" :key="groupIndex">
                  <v-col cols="12" :class="groupIndex % 2 === 0 ? 'eval-group-a' : 'eval-group-b'">
                    <v-row dense>
                      <v-col
                        v-for="(header, i) in group"
                        :key="i"
                        cols="12"
                      >
                        <div
                          :class="{ 'prom-header-mobile': header.key.includes('_prom') }"
                          :style="getNotaCellStyle(item[header.key])"
                        >
                          <strong>{{ header.mobileTitle || header.title }}:</strong> {{ item[header.key] }}
                        </div>
                      </v-col>
                    </v-row>
                  </v-col>
                </template>

                <v-col cols="12" class="promedio-mobile">
                  <strong>Promedio Bimestral:</strong>
                  <div :style="getNotaCellStyle(item.promBim)">
                    {{ item.promBim }}
                  </div>
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

    <!-- Modal sin resultados -->
    <v-dialog v-model="dialogNoResults" max-width="400">
      <v-card>
        <v-card-title class="headline">No se encontraron resultados</v-card-title>
        <v-card-text>La consulta no arrojó resultados.</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="dialogNoResults = false">Aceptar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useDisplay } from 'vuetify' // <-- Importar
import axios from 'axios'
import { getNotaColor, getNotaTextColor } from '@/utils/notas'

// Detecta si la pantalla es "md" o mayor
const { mdAndUp } = useDisplay()
const isDesktop = mdAndUp

const currentPage = ref(1)
const itemsPerPage = ref(5)
const searchQuery = ref("") // Variable reactiva para la búsqueda

const router = useRouter()
const route = useRoute()

const evaluaciones = ref([])



const cursoSeleccionado = ref(
  route.query.curso
    ? JSON.parse(decodeURIComponent(route.query.curso))
    : null
)

const doad_id = ref(
  route.query.doad_id || (cursoSeleccionado.value ? cursoSeleccionado.value.doad_id : null  
  ));

const bimestres = ref([])
const selectedBimestre = ref(null)

// Agrupamos los headers dinámicos por evaluación
const groupedHeaders = computed(() => {
  const groups = []
  let tempGroup = []

  dynamicHeaders.value.forEach(header => {
    if (header.key.includes('_nota_')) {
      tempGroup.push(header)
    } else if (header.key.includes('_prom')) {
      tempGroup.push(header)
      groups.push(tempGroup)
      tempGroup = []
    }
  })

  return groups
})

function getNotaCellStyle(valor) {
  const notaStr = typeof valor === 'string' ? valor : '';
  const match = notaStr.match(/^([\d.]+)/);
  const notaNum = match ? parseFloat(match[1]) : null;
  if (!Number.isFinite(notaNum)) return {};
  return {
    backgroundColor: getNotaColor(notaNum),
    color: getNotaTextColor(notaNum),
    padding: '4px 8px',
    borderRadius: '6px',
    display: 'inline-block',
    minWidth: '60px',
    textAlign: 'center'
  };
}

async function fetchBimestres() {
  try {
    const profile = localStorage.getItem("profile")
    const token = localStorage.getItem("token")
    const baseUrl = "https://amsoftsolution.com/amss/ws/wsListaPeriodoEducativoPlanCurricular.php"
    const params = { ai_doad_id: doad_id.value, av_profile: profile }
    const configReq = {
      params,
      headers: { Authorization: `Bearer ${token}` },
    }

    const response = await axios.get(baseUrl, configReq)
    if (response.data.status) {
      bimestres.value = response.data.data
      selectedBimestre.value = response.data.data[0] ?? null
    }






  } catch (error) {
    console.error("Error cargando bimestres:", error)
  }
}

const selectedPacuId = computed(() => {
  return selectedBimestre.value?.pacu_id || null
})

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

// Cuando cambie bimestre, reconstruye tabla y reinicia paginación
watch(
  () => selectedBimestre.value,
  async (nuevo) => {
    if (nuevo && nuevo.peed_id && nuevo.pacu_id) {
      currentPage.value = 1
      await fetchEvaluaciones()
      parseDataForTable()
    }
  },
  { immediate: true, deep: true } // <-- se ejecuta al inicio y detecta cambios internos
)


onMounted(() => {
  fetchBimestres()
  if (!cursoSeleccionado.value) return router.push({ name: 'DocenteMisCursos' })
  // luego tu lógica existente para detalle…
})
  
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

// Cargar evaluaciones
async function fetchEvaluaciones() {
  try {
    const token = localStorage.getItem("token")
    const profile = localStorage.getItem("profile")
    const ai_usua_id = localStorage.getItem("usua_id")
    const ai_peed_id = selectedBimestre.value?.peed_id || null

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
      if (evaluaciones.value.length < 1) {
        dynamicHeaders.value = []
        tableItems.value = []
      }
    }
    else {
      evaluaciones.value = []
      dynamicHeaders.value = []
      tableItems.value = []
    }
  } catch (error) {
    evaluaciones.value = [];
    dynamicHeaders.value = []
    tableItems.value = []
    console.error("Error fetching evaluations", error)
  }
}

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
/* function getColorForEvaluation(nombre) {
  const colorMapping = {
    'PA': '#FFCDD2',  // Participaciones
    'PR': '#C8E6C9',  // Prácticas
    'TA': '#BBDEFB',  // Tareas
    'RC':  '#D1C4E9',  // Revisión
    'EM': '#FFE082',  // Examen
    'EB': '#FFCDD2',  // Examen
  }
  return colorMapping[nombre.toUpperCase()] || '#EEEEEE'
} */

/**
 * Genera dynamicHeaders y tableItems a partir de los datos del API.
 */
 function parseDataForTable() {
  const bimestreId = selectedBimestre.value?.peed_id;
  const dataBimestre = alumnos.value.filter(item => item.peed_id === bimestreId);

  if (!dataBimestre.length) {
    dynamicHeaders.value = [];
    tableItems.value = [];
    return;
  }

  const sortedEvaluations = [...evaluaciones.value].sort((a, b) => a.pcev_orden - b.pcev_orden);
  const builtHeaders = [];
  //let groupIndex = 0;

  if (isDesktop.value) {
    builtHeaders.push({ title: 'N°', key: 'numero', align: 'start' });
    builtHeaders.push({ title: 'Apellidos y Nombres', key: 'alumno', align: 'start' });
  }

  sortedEvaluations.forEach((evalObj, evalIndex) => {
    const maxNotas = parseInt(evalObj.pcev_cantidad_evaluacion) || 0;
    const evalAbre = evalObj.eval_abreviacion;
    const evalNombre = evalObj.eval_nombre;

    for (let i = 1; i <= maxNotas; i++) {
      builtHeaders.push({
        title: `${evalAbre} #${i}`,
        key: `eval_${evalObj.eval_id}_nota_${i}`,
        mobileTitle: `${evalNombre} #${i}`,
        sortable: false,
        groupIndex: evalIndex,
        groupClass: `eval-group-${evalIndex % 2 === 0 ? 'a' : 'b'}`
      });
    }

    builtHeaders.push({
      title: `Prom. ${evalNombre}`,
      key: `eval_${evalObj.eval_id}_prom`,
      mobileTitle: `Prom. ${evalNombre}`,
      sortable: false,
      groupIndex: evalIndex,
      groupClass: `eval-group-${evalIndex % 2 === 0 ? 'a' : 'b'}`
    });
  });

  if (isDesktop.value) {
    builtHeaders.push({ title: 'Prom. Bim', key: 'promBim', sortable: false });
  }

  const builtItems = dataBimestre.map((alumnoItem, index) => {
    const row = {};
    row.numero = index + 1;
    row.alumno = alumnoItem.alumno;

    sortedEvaluations.forEach(evalObj => {
      const maxNotas = parseInt(evalObj.pcev_cantidad_evaluacion) || 0;
      const alumnoEval = alumnoItem.alumnos_cursos_promedios.find(e => e.eval_id === evalObj.eval_id);

      if (alumnoEval) {
        alumnoEval.alumnos_cursos_notas.forEach((notaItem, nIndex) => {
          const colKey = `eval_${evalObj.eval_id}_nota_${nIndex + 1}`;
          row[colKey] = `${notaItem.reau_evaluacion} (${notaItem.reau_evaluacion_letra})`;
        });
        for (let i = alumnoEval.alumnos_cursos_notas.length + 1; i <= maxNotas; i++) {
          const colKey = `eval_${evalObj.eval_id}_nota_${i}`;
          row[colKey] = '';
        }
        const promKey = `eval_${evalObj.eval_id}_prom`;
        row[promKey] = `${alumnoEval.pcae_promedio_evaluacion} (${alumnoEval.pcae_promedio_evaluacion_letra})`;
      } else {
        for (let i = 1; i <= maxNotas; i++) {
          const colKey = `eval_${evalObj.eval_id}_nota_${i}`;
          row[colKey] = '';
        }
        const promKey = `eval_${evalObj.eval_id}_prom`;
        row[promKey] = '';
      }
    });

    row.promBim = `${alumnoItem.pcal_promedio_periodo} (${alumnoItem.pcal_promedio_periodo_letra})`;
    return row;
  });

  dynamicHeaders.value = builtHeaders;
  tableItems.value = builtItems;
  console.log(dynamicHeaders.value);
  console.log(tableItems.value);
}


function goBack() {
  router.push({ name: 'DocenteMisCursos' })
}
</script>

<style scoped>
.cell-custom {
  padding: 8px;
  background-clip: padding-box;
  transition: background-color 0.3s ease;
}
.eval-group-a {
  background-color: #f9f9f9;
}
.eval-group-b {
  background-color: #f0f0f0;
}
.prom-header-mobile {
  font-weight: bold;
  font-size: 16px;
}
.promedio-mobile {
  font-weight: bold;
  font-size: 18px;
  margin-top: 4px;
  display: inline-block;
}
.multiline2-ellipsis {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: normal;
}

.table-desktop {
  width: 100%;
  border-collapse: collapse;
}
.table-desktop th,
.table-desktop td {
  border: 1px solid #ddd;
  padding: 8px;
  vertical-align: middle;
  text-align: center;
}
</style>
