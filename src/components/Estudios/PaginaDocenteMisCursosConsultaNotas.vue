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

    <v-row class="mb-4">
      <template v-if="isDesktop">
        <v-col cols="6">
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
        <v-col cols="6">
          <v-text-field
            v-model="searchQuery"
            label="Buscar alumno"
            clearable
            solo
          />
        </v-col>
      </template>

      <template v-else>
        <v-col cols="12" class="mb-2">
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
        <v-col cols="12">
          <v-text-field
            v-model="searchQuery"
            label="Buscar alumno"
            clearable
            solo
          />
        </v-col>
      </template>
    </v-row>

    <!-- TABLA DE NOTAS DINÁMICA (solo se muestra cuando ya se tienen headers) -->
    <div v-if="isDesktop">
      <!-- ALERTA SI NO HAY NOTAS -->
      <v-alert
        v-if="filteredItems.length === 0"
        type="info"
        class="mt-4"
      >
        No hay notas disponibles para este bimestre
      </v-alert>

      <!-- TABLA CUANDO SÍ HAY DATOS -->
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
import { ref, computed, watch, onMounted } from 'vue'
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
  const bimestreId = selectedBimestre.value?.peed_id;
  const dataBimestre = alumnos.value.filter(item => item.peed_id === bimestreId);

  if (!dataBimestre.length) {
    dynamicHeaders.value = [];
    tableItems.value = [];
    return;
  }

  // Ordena las evaluaciones por pcev_orden
  const sortedEvaluations = [...evaluaciones.value].sort((a, b) => a.pcev_orden - b.pcev_orden);

  const builtHeaders = [];
  if (isDesktop.value) {
    builtHeaders.push({ title: 'N°', key: 'numero', align: 'start' });
    builtHeaders.push({ title: 'Apellidos y Nombres', key: 'alumno', align: 'start' });
  }

  // Para cada evaluación ordenada, crea las columnas según pcev_cantidad_evaluacion
  sortedEvaluations.forEach(evalObj => {
    const maxNotas = parseInt(evalObj.pcev_cantidad_evaluacion) || 0;
    const evalAbre = evalObj.eval_abreviacion;
    const evalNombre = evalObj.eval_nombre;
    const bgColor = getColorForEvaluation(evalAbre);
    for (let i = 1; i <= maxNotas; i++) {
      builtHeaders.push({
        title: `${evalAbre} #${i}`,
        key: `eval_${evalObj.eval_id}_nota_${i}`,
        sortable: false,
        bgColor
      });
    }
    builtHeaders.push({
      title: `Prom. ${evalNombre}`,
      key: `eval_${evalObj.eval_id}_prom`,
      sortable: false,
      bgColor
    });
  });

  if (isDesktop.value) {
    builtHeaders.push({ title: 'Prom. Bim', key: 'promBim', sortable: false });
  }

  // Construye las filas para cada alumno
  const builtItems = dataBimestre.map((alumnoItem, index) => {
    const row = {};
    row.numero = index + 1;
    row.alumno = alumnoItem.alumno;

    // Recorre las evaluaciones ordenadas
    sortedEvaluations.forEach(evalObj => {
      const maxNotas = parseInt(evalObj.pcev_cantidad_evaluacion) || 0;
      // Busca si el alumno tiene datos para esta evaluación
      const alumnoEval = alumnoItem.alumnos_cursos_promedios.find(e => e.eval_id === evalObj.eval_id);

      if (alumnoEval) {
        // Recorre las notas registradas
        alumnoEval.alumnos_cursos_notas.forEach((notaItem, nIndex) => {
          const colKey = `eval_${evalObj.eval_id}_nota_${nIndex + 1}`;
          row[colKey] = `${notaItem.reau_evaluacion} (${notaItem.reau_evaluacion_letra})`;
        });
        // Si la cantidad de notas registradas es menor a maxNotas, rellena las restantes como vacías
        for (let i = alumnoEval.alumnos_cursos_notas.length + 1; i <= maxNotas; i++) {
          const colKey = `eval_${evalObj.eval_id}_nota_${i}`;
          row[colKey] = '';
        }
        // Columna de promedio para la evaluación
        const promKey = `eval_${evalObj.eval_id}_prom`;
        row[promKey] = `${alumnoEval.pcae_promedio_evaluacion} (${alumnoEval.pcae_promedio_evaluacion_letra})`;
      } else {
        // Si no existe información para esta evaluación, deja las columnas vacías
        for (let i = 1; i <= maxNotas; i++) {
          const colKey = `eval_${evalObj.eval_id}_nota_${i}`;
          row[colKey] = '';
        }
        const promKey = `eval_${evalObj.eval_id}_prom`;
        row[promKey] = '';
      }
    });

    // Promedio bimestral
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
