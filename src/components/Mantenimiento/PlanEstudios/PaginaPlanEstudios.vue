<template>
  <v-container fluid>
    <!-- ENCABEZADO -->
    <v-row class="py-3">
      <v-col cols="12">
        <h1 class="text-h5 font-weight-bold mb-1">📚 Plan de Estudios</h1>
        <p class="text-subtitle-2">Gestiona el plan de estudios del año escolar {{ anioEscolar }}.</p>
      </v-col>
    </v-row>

    <!-- FILTROS -->
    <v-row dense class="mb-4">
      <v-col cols="12" md="4">
        <v-select
          v-model="selectedArea"
          :items="areaOptions"
          item-title="title"
          item-value="key"
          label="Área Educativa"
          clearable
          dense
          outlined
          :menu-props="{ maxHeight: '300' }"
        />
      </v-col>
      <v-col cols="12" md="4">
        <v-select
          v-model="selectedNivel"
          :items="nivelOptions"
          item-title="title"
          item-value="key"
          label="Nivel"
          clearable
          dense
          outlined
          :menu-props="{ maxHeight: '300' }"
        />
      </v-col>
      <v-col cols="12" md="4">
        <v-select
          v-model="selectedGrado"
          :items="gradoOptions"
          item-title="title"
          item-value="key"
          label="Grado"
          clearable
          dense
          outlined
          :menu-props="{ maxHeight: '300' }"
        />
      </v-col>
    </v-row>

    <!-- BOTÓN AGREGAR PLAN -->
    <v-row class="justify-end mb-2">
      <v-btn color="primary" @click="abrirDialogoAgregarPlanEstudio" prepend-icon="mdi-plus">
        Agregar Plan de Estudio
      </v-btn>
    </v-row>

    <!-- VISTA DESKTOP -->
    <div v-if="isDesktop">
      <v-card class="pa-2 elevation-1">
        <v-data-table
          :headers="headers"
          :items="filteredPlanes"
          item-key="ples_id"
          v-model:page="currentPage"
          :items-per-page="itemsPerPage"
          hide-default-header
          class="elevation-0"
        >
        <template #body="{ items }">
          <thead>
            <tr>
              <th>N°</th>
              <th>Área Educativa</th>
              <th>Nivel</th>
              <th>Grado</th>
              <th>Horas</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="(item, index) in items" :key="item.ples_id">
              <tr :class="{ 'expanded-row': isExpanded(item.ples_id) }">
                <td>{{ (currentPage - 1) * itemsPerPage + index + 1 }}</td>
                <td>{{ item.ared_nombre }}</td>
                <td>{{ item.nive_nombre }}</td>
                <td>{{ item.grad_nombre }}</td>
                <td>{{ item.ples_horas }}</td>
                <td>
                  <v-chip :color="item.ples_estado === 'A' ? 'green' : 'red'" small>
                    {{ item.ples_estado === 'A' ? 'Activo' : 'Inactivo' }}
                  </v-chip>
                </td>
                <td class="d-flex align-center">
                  <v-btn icon variant="text" color="primary" @click.stop="abrirDialogoEditarPlan(item)">
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>
                  <v-btn icon variant="text" color="primary" @click.stop="toggleExpand(item.ples_id)">
                    <v-icon>{{ isExpanded(item.ples_id) ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
                  </v-btn>
                </td>
              </tr>

              <tr v-if="isExpanded(item.ples_id)">
                <td :colspan="7" class="pa-4" style="background: #fafafa;">
                  <div class="d-flex justify-space-between align-center mb-2">
                    <div class="font-weight-bold">Planes Curriculares</div>
                    <v-btn small color="primary" variant="text" @click.stop="abrirDialogoAgregarCurricular(item)">
                      +Agregar
                    </v-btn>
                  </div>

                  <div v-if="planCurriculares[item.ples_id]?.length">
                    <v-simple-table dense>
                      <thead>
                        <tr>
                          <th>N°</th>
                          <th>Periodo</th>
                          <th>Curso</th>
                          <th>Docente</th>
                          <th>Horas</th>
                          <th>Estado</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        <template v-for="(curr, indexCurr) in planCurriculares[item.ples_id]" :key="curr.pacu_id">
  <tr>
    <td>{{ indexCurr + 1 }}</td>
    <td>{{ curr.peed_nombre }}</td>
    <td>{{ curr.aede_nombre }}</td>
    <td>{{ curr.docente }}</td>
    <td>{{ curr.pacu_horas }}</td>
    <td>
      <v-chip :color="curr.pacu_estado === 'A' ? 'green' : 'red'" small>
        {{ curr.pacu_estado === 'A' ? 'Activo' : 'Inactivo' }}
      </v-chip>
    </td>
    <td class="d-flex align-center">
  <v-btn icon variant="text" color="primary" @click.stop="abrirDialogoEditarCurricular(curr, item.ples_id)">
    <v-icon>mdi-pencil</v-icon>
  </v-btn>
  <v-btn icon variant="text" color="primary" @click.stop="toggleExpandEvaluaciones(curr.pacu_id)">
    <v-icon>{{ isExpandedEvaluaciones(curr.pacu_id) ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
  </v-btn>
</td>

  </tr>

  <tr v-if="isExpandedEvaluaciones(curr.pacu_id)" :key="`evals-${curr.pacu_id}`">
  <td colspan="7" style="background-color: #fffde7; padding: 12px;">
    <div class="font-weight-bold mb-2">Evaluaciones</div>

    <div v-if="currEvaluaciones[curr.pacu_id]?.length">
      <v-simple-table dense class="evaluaciones-table">
        <thead>
          <tr>
            <th>N°</th>
            <th>Nombre</th>
            <th>Cantidad</th>
            <th>Orden</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(evalItem, eIdx) in currEvaluaciones[curr.pacu_id]"
            :key="evalItem.pcev_id"
          >
            <td>{{ eIdx + 1 }}</td>
            <td>{{ evalItem.eval_nombre }}</td>
            <td>{{ evalItem.pcev_cantidad_evaluacion }}</td>
            <td>{{ evalItem.pcev_orden }}</td>
            <td>
              <v-chip :color="evalItem.pcev_estado === 'A' ? 'green' : 'red'" small>
                {{ evalItem.pcev_estado === 'A' ? 'Activo' : 'Inactivo' }}
              </v-chip>
            </td>
          </tr>
        </tbody>
      </v-simple-table>
    </div>

    <div v-else>
      <em>No hay evaluaciones registradas.</em>
    </div>
  </td>
</tr>

</template>



                      </tbody>
                    </v-simple-table>
                  </div>
                  <div v-else>No hay planes curriculares registrados.</div>
                </td>
              </tr>
            </template>
          </tbody>
        </template>

        </v-data-table>

      </v-card>

    </div>

    <!-- VISTA MOBILE -->
    <div v-else>
      <v-row dense>
        <v-col cols="12" v-for="plan in filteredPlanesPaginados" :key="plan.ples_id">
          <v-card class="mb-4 shadow-mobile">
            <v-card-title class="d-flex justify-space-between align-center">
              <div>
                <div class="text-h6 font-weight-bold text-primary">{{ plan.ared_nombre }}</div>
                <div class="text-subtitle-2">{{ plan.nive_nombre }} | {{ plan.grad_nombre }}</div>
              </div>
              <div>
                <v-btn icon variant="text" color="primary" @click.stop="abrirDialogoEditarPlan(plan)">
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
                <v-btn icon variant="text" color="primary" @click.stop="toggleExpand(plan.ples_id)">
                  <v-icon>{{ isExpanded(plan.ples_id) ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
                </v-btn>
              </div>
            </v-card-title>

            <v-card-subtitle class="pb-0">
              Horas: {{ plan.ples_horas }}
            </v-card-subtitle>

            <v-card-text>
              <v-chip :color="plan.ples_estado === 'A' ? 'green' : 'red'" small>
                {{ plan.ples_estado === 'A' ? 'Activo' : 'Inactivo' }}
              </v-chip>

              <v-expand-transition>
                <div v-if="isExpanded(plan.ples_id)" class="mt-2">
                  <v-divider class="my-2" />
                  <div class="d-flex justify-space-between align-center mb-2">
                    <div class="font-weight-bold">Planes Curriculares</div>
                    <v-btn small color="primary" variant="text" @click.stop="abrirDialogoAgregarCurricular(plan)">
                      +Agregar
                    </v-btn>
                  </div>
                  <v-list v-if="planCurriculares[plan.ples_id]?.length" dense>
                    <v-list-item v-for="curr in planCurriculares[plan.ples_id]" :key="curr.pacu_id">
                      <v-list-item-content>
                        <v-list-item-title>{{ curr.aede_nombre }} - {{ curr.docente }}</v-list-item-title>
                        <v-list-item-subtitle>Horas: {{ curr.pacu_horas }} | Estado: {{ curr.pacu_estado === 'A' ? 'Activo' : 'Inactivo' }}</v-list-item-subtitle>
                      </v-list-item-content>
                      <v-btn icon variant="text" color="primary" @click.stop="abrirDialogoEditarCurricular(curr, plan.ples_id)">
                        <v-icon>mdi-pencil</v-icon>
                      </v-btn>
                      <v-btn icon variant="text" color="primary" @click.stop="toggleExpandEvaluaciones(curr.pacu_id)">
                        <v-icon>{{ isExpandedEvaluaciones(curr.pacu_id) ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
                      </v-btn>

                      <v-list-item
  v-if="isExpandedEvaluaciones(curr.pacu_id)"
  :key="`evals-mobile-${curr.pacu_id}`"
  class="pl-6"
>
  <v-list-item-content>
    <div class="font-weight-bold mb-1">Evaluaciones</div>
    
    <v-list v-if="currEvaluaciones[curr.pacu_id]?.length" density="compact">
      <v-list-item
        v-for="(evalItem, eIdx) in currEvaluaciones[curr.pacu_id]"
        :key="evalItem.pcev_id"
      >
        <v-list-item-content>
          <v-list-item-title>{{ eIdx + 1 }}. {{ evalItem.eval_nombre }}</v-list-item-title>
          <v-list-item-subtitle>
            Cantidad: {{ evalItem.pcev_cantidad_evaluacion }} | Orden: {{ evalItem.pcev_orden }}
          </v-list-item-subtitle>
        </v-list-item-content>
        <v-btn icon variant="text" color="primary" @click="abrirDialogoEditarEvaluacion(evalItem)">
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
      </v-list-item>
    </v-list>

    <div v-else>
      <em>No hay evaluaciones registradas.</em>
    </div>
  </v-list-item-content>
</v-list-item>



                    </v-list-item>

                    

                  </v-list>
                  <div v-else>No hay planes curriculares registrados.</div>
                </div>
              </v-expand-transition>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Paginación Mobile -->
      <v-pagination
        v-if="totalPaginas > 1"
        v-model="currentPage"
        :length="totalPaginas"
        class="mt-4"
        density="comfortable"
      />
    </div>

    <SnackbarMessage
      v-model="snackbar"
      :message="snackbarMessage"
      :color="snackbarColor"
    />

    <DialogAgregarPlanEstudio
      v-model="mostrarDialogoAgregarPlanEstudio"
      :area-options="areaOptions"
      :nivel-options="nivelOptions"
      :grado-options="gradoOptions"
      @guardar="guardarNuevoPlanEstudio"
    />

    <DialogEditarPlanEstudio
      v-model="mostrarDialogoEditarPlanEstudio"
      :horas="planHoras"
      :estado="planEstado"
      @update:horas="planHoras = $event"
      @update:estado="planEstado = $event"
      @guardar="guardarPlanEstudio"
    />

    <DialogAgregarPlanCurricular
      v-model="mostrarDialogoAgregarCurricular"
      :periodos-options="periodosOptions"
      :cursos-options="cursosOptions"
      @guardar="guardarNuevoPlanCurricular"
    />

    <DialogEditarPlanCurricular
      v-model="mostrarDialogoEditarPlanCurricular"
      :horas="planCurricularHoras"
      :estado="planCurricularEstado"
      @guardar="guardarPlanCurricular"
    />

  </v-container>
</template>


<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useDisplay } from 'vuetify'
import axios from 'axios'

// COMPONENTES
import SnackbarMessage from '@/components/ui/SnackbarMessage.vue'
import DialogAgregarPlanEstudio from '@/components/Mantenimiento/PlanEstudios/DialogAgregarPlanEstudio.vue'
import DialogEditarPlanEstudio from '@/components/Mantenimiento/PlanEstudios/DialogEditarPlanEstudio.vue'
import DialogAgregarPlanCurricular from '@/components/Mantenimiento/PlanEstudios/DialogAgregarPlanCurricular.vue'
import DialogEditarPlanCurricular from '@/components/Mantenimiento/PlanEstudios/DialogEditarPlanCurricular.vue'

/** CONFIGURACIONES */
const expandedItems = ref([])
const { mdAndUp } = useDisplay()
const isDesktop = mdAndUp
const expandedCurriculares = ref([])

const anioEscolar = localStorage.getItem('anio_escolar')
const profile = localStorage.getItem('profile')
const token = localStorage.getItem('token')

const axiosInstance = axios.create({
  baseURL: 'https://amsoftsolution.com/amss/ws/',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
})

/** DATOS PRINCIPALES */
const planesEstudio = ref([])
const planCurriculares = ref({})
const currEvaluaciones = ref({}) // pacu_id => array de evaluaciones


const areaOptions = ref([{ title: 'Todos', key: 'TODOS' }])
const nivelOptions = ref([{ title: 'Todos', key: 'TODOS' }])
const gradosList = ref([])

const selectedArea = ref('TODOS')
const selectedNivel = ref('TODOS')
const selectedGrado = ref('TODOS')

/** PAGINACIÓN */
const currentPage = ref(1)
const itemsPerPage = 10

/** EXPANSIÓN */
function toggleExpand(id) {
  const index = expandedItems.value.indexOf(id)
  if (index === -1) {
    expandedItems.value = [...expandedItems.value, id]
    if (!planCurriculares.value[id] || planCurriculares.value[id].length === 0) {
      obtenerCurriculares(id)
    }
  } else {
    expandedItems.value = expandedItems.value.filter(x => x !== id)
  }
}


function isExpanded(plesId) {
  return expandedItems.value.includes(plesId)
}

async function toggleExpandEvaluaciones(pacuId) {
  const idx = expandedCurriculares.value.indexOf(pacuId)
  if (idx === -1) {
    if (!currEvaluaciones.value[pacuId] || currEvaluaciones.value[pacuId].length === 0) {
      await obtenerEvaluaciones(pacuId)
    }
    expandedCurriculares.value.push(pacuId)
  } else {
    expandedCurriculares.value.splice(idx, 1)
  }
}


function isExpandedEvaluaciones(pacuId) {
  return expandedCurriculares.value.includes(pacuId)
}


/** DIÁLOGOS */
const mostrarDialogoAgregarPlanEstudio = ref(false)
const mostrarDialogoEditarPlanEstudio = ref(false)
const mostrarDialogoAgregarCurricular = ref(false)
const mostrarDialogoEditarPlanCurricular = ref(false)

/** MODELOS PARA EDITAR */
const plesIdSeleccionado = ref(null); // <- NUEVO
const planSeleccionado = ref(null)
const planHoras = ref(null)
const planEstado = ref('')

const planCurricularSeleccionado = ref(null)
const planCurricularHoras = ref(null)
const planCurricularEstado = ref('')

const periodosOptions = ref([]);
const cursosOptions = ref([]);

/** CABECERAS DE TABLA */
const headers = [
  { title: 'N°', value: 'index', sortable: false },
  { title: 'Área Educativa', value: 'ared_nombre' },
  { title: 'Nivel', value: 'nive_nombre' },
  { title: 'Grado', value: 'grad_nombre' },
  { title: 'Horas', value: 'ples_horas' },
  { title: 'Estado', value: 'estado', sortable: false },
  { title: 'Acciones', value: 'acciones', sortable: false }
]

/** FILTROS */
const filteredPlanes = computed(() => {
  return planesEstudio.value.filter(plan => {
    const filtroArea = selectedArea.value === 'TODOS' || plan.ared_id === selectedArea.value
    const filtroNivel = selectedNivel.value === 'TODOS' || plan.nive_id === selectedNivel.value
    const filtroGrado = selectedGrado.value === 'TODOS' || plan.grad_id === selectedGrado.value
    return filtroArea && filtroNivel && filtroGrado
  })
})

const gradoOptions = computed(() => {
  const base = gradosList.value.map(g => ({
    title: g.grad_nombre,
    key: g.grad_id,
    nive_id: g.nive_id
  }))
  if (!selectedNivel.value || selectedNivel.value === 'TODOS') {
    return [{ title: 'Todos', key: 'TODOS' }, ...base]
  }
  return [{ title: 'Todos', key: 'TODOS' }, ...base.filter(g => g.nive_id === selectedNivel.value)]
})

const filteredPlanesPaginados = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredPlanes.value.slice(start, end)
})

const totalPaginas = computed(() => Math.ceil(filteredPlanes.value.length / itemsPerPage))

/** LLAMADAS API */
async function obtenerEvaluaciones(pacu_id) {
  try {
    const { data } = await axiosInstance.get(`wsConsultaPlanCurricularEvaluaciones.php?ai_pacu_id=${pacu_id}&av_profile=${profile}`)
    currEvaluaciones.value[pacu_id] = data.status ? data.data : []
  } catch (error) {
    console.error('Error al obtener evaluaciones:', error)
    currEvaluaciones.value[pacu_id] = []
  }
}

async function obtenerPlanes() {
  try {
    const { data } = await axiosInstance.get(`wsConsultaPlanEstudios.php?ac_anio_escolar=${anioEscolar}&av_profile=${profile}`)
    planesEstudio.value = Array.isArray(data.data) ? data.data : []
  } catch (error) {
    console.error('Error al obtener planes:', error)
  }
}

async function obtenerCurriculares(ples_id) {
  try {
    const { data } = await axiosInstance.get(`wsConsultaPlanCurricular.php?ai_ples_id=${ples_id}&av_profile=${profile}`)
    planCurriculares.value[ples_id] = data.status ? data.data : []

    // ⬇️ Obtener evaluaciones de cada plan curricular
    for (const curr of planCurriculares.value[ples_id]) {
      await obtenerEvaluaciones(curr.pacu_id)
    }
  } catch (error) {
    console.error('Error al obtener curriculares:', error)
    planCurriculares.value[ples_id] = []
  }
}


async function obtenerAreasNivelesGrados() {
  try {
    const { data } = await axiosInstance.get(`wsListaNivelGradoAlumno.php?av_profile=${profile}`)
    if (data.status) {
      nivelOptions.value = [{ title: 'Todos', key: 'TODOS' }].concat(
        data.data.niveles.map(n => ({ title: n.nive_nombre, key: n.nive_id }))
      )
      gradosList.value = data.data.grados
    }

    const areasResponse = await axiosInstance.get(`wsListaAreaEducativa.php?ac_indicador_todos=N&av_profile=${profile}`)
    if (areasResponse.data.status) {
      areaOptions.value = [{ title: 'Todos', key: 'TODOS' }].concat(
        areasResponse.data.data.map(a => ({ title: a.ared_nombre, key: a.ared_id }))
      )
    }
  } catch (error) {
    console.error('Error al obtener áreas, niveles o grados:', error)
  }
}

/** FUNCIONES PARA ABRIR/MANEJAR DIÁLOGOS */
function abrirDialogoAgregarPlanEstudio() {
  mostrarDialogoAgregarPlanEstudio.value = true
}

function abrirDialogoEditarPlan(plan) {
  planSeleccionado.value = { ...plan }
  planHoras.value = plan.ples_horas
  planEstado.value = plan.ples_estado
  mostrarDialogoEditarPlanEstudio.value = true
}

async function abrirDialogoAgregarCurricular(plan) {
  planSeleccionado.value = plan;
  await cargarPeriodos();
  await cargarCursos();
  mostrarDialogoAgregarCurricular.value = true;
}


function abrirDialogoEditarCurricular(curricular, plesIdPadre) {
  planCurricularSeleccionado.value = curricular;
  planCurricularHoras.value = curricular.pacu_horas;
  planCurricularEstado.value = curricular.pacu_estado === 'A' ? 'Activo' : 'Inactivo';
  plesIdSeleccionado.value = plesIdPadre; 
  mostrarDialogoEditarPlanCurricular.value = true;
}

/** FUNCIONES GUARDAR */
async function guardarNuevoPlanEstudio(plan) {
  try {
    const payload = {
      ai_grad_id: plan.grad_id,
      ai_ared_id: plan.ared_id,
      ai_ples_horas: plan.ples_horas,
      ac_anio_escolar: anioEscolar,
      av_profile: profile
    }
    const { data } = await axiosInstance.post('wsRegistraPlanEstudios.php', payload)

    if (data.status) {
      snackbarMessage.value = 'Plan de estudio registrado exitosamente.'
      snackbarColor.value = 'success'
      snackbar.value = true
      obtenerPlanes()
    } else {
      snackbarMessage.value = data.message || 'Error al registrar plan de estudio.'
      snackbarColor.value = 'error'
      snackbar.value = true
    }
  } catch (error) {
    console.error('Error al guardar plan:', error)
    snackbarMessage.value = 'Error de conexión al registrar el plan de estudio.'
    snackbarColor.value = 'error'
    snackbar.value = true
  }
}

async function guardarPlanEstudio() {
  try {
    if (!planSeleccionado.value) {
      snackbarMessage.value = 'No hay plan seleccionado para actualizar.'
      snackbarColor.value = 'error'
      snackbar.value = true
      return
    }

    const payload = {
      ai_ples_id: planSeleccionado.value.ples_id,
      ai_grad_id: planSeleccionado.value.grad_id,
      ai_ared_id: planSeleccionado.value.ared_id,
      ai_ples_horas: planHoras.value,
      ac_ples_estado: planEstado.value,
      av_profile: profile
    }

    const { data } = await axiosInstance.post('wsActualizaPlanEstudios.php', payload)

    if (data.status) {
      snackbarMessage.value = 'Plan de estudio actualizado exitosamente.'
      snackbarColor.value = 'success'
      snackbar.value = true
      obtenerPlanes()
    } else {
      snackbarMessage.value = data.message || 'Error al actualizar plan de estudio.'
      snackbarColor.value = 'error'
      snackbar.value = true
    }
  } catch (error) {
    console.error('Error al actualizar plan:', error)
    snackbarMessage.value = 'Error de conexión al actualizar el plan de estudio.'
    snackbarColor.value = 'error'
    snackbar.value = true
  }
}

async function guardarNuevoPlanCurricular(nuevoCurricular) {
  try {
    const payload = {
      ai_ples_id: planSeleccionado.value.ples_id, // ID del plan de estudio expandido
      ai_daed_id: nuevoCurricular.curso_id,        // ID del docente/curso seleccionado
      ai_peed_id: nuevoCurricular.periodo_id,      // ID del período educativo seleccionado
      ai_pacu_horas: nuevoCurricular.horas,        // Número de horas
      av_profile: profile
    };

    const { data } = await axiosInstance.post('wsRegistraPlanCurricular.php', payload);

    if (data.status) {
      snackbarMessage.value = 'Plan curricular registrado exitosamente.';
      snackbarColor.value = 'success';
      snackbar.value = true;
      const plesId = planSeleccionado.value.ples_id;
      //expandedItems.value = expandedItems.value.filter(id => id !== plesId);
      obtenerCurriculares(plesId); // Recargar los curriculares
      mostrarDialogoAgregarCurricular.value = false;
    } else {
      snackbarMessage.value = data.message || 'Error al registrar plan curricular.';
      snackbarColor.value = 'error';
      snackbar.value = true;
    }
  } catch (error) {
    console.error('Error al guardar plan curricular:', error);
    snackbarMessage.value = 'Error de conexión al registrar el plan curricular.';
    snackbarColor.value = 'error';
    snackbar.value = true;
  }
}

async function guardarPlanCurricular(nuevoCurricular) {
  try {
    if (!planCurricularSeleccionado.value) {
      snackbarMessage.value = 'No hay plan curricular seleccionado para actualizar.';
      snackbarColor.value = 'error';
      snackbar.value = true;
      return;
    }

    const estado = nuevoCurricular.estado === 'Activo' ? 'A' : 'I';

    const payload = {
      ai_pacu_id: planCurricularSeleccionado.value.pacu_id, // ID del plan curricular
      ai_daed_id: planCurricularSeleccionado.value.daed_id,
      ai_pacu_horas: nuevoCurricular.horas,
      ac_pacu_estado: estado,
      av_profile: profile
    };

    const { data } = await axiosInstance.post('wsActualizaPlanCurricular.php', payload);

    if (data.status) {
      snackbarMessage.value = 'Plan curricular actualizado exitosamente.';
      snackbarColor.value = 'success';
      snackbar.value = true;

      mostrarDialogoEditarPlanCurricular.value = false;
      const plesId = plesIdSeleccionado.value; // Lo guardamos
      //expandedItems.value = expandedItems.value.filter(id => id !== plesId);
      await obtenerCurriculares(plesId); // Ahora sí: refrescar con el ples correcto

    } else {
      snackbarMessage.value = data.message || 'Error al actualizar plan curricular.';
      snackbarColor.value = 'error';
      snackbar.value = true;
    }
  } catch (error) {
    console.error('Error al actualizar plan curricular:', error);
    snackbarMessage.value = 'Error de conexión al actualizar el plan curricular.';
    snackbarColor.value = 'error';
    snackbar.value = true;
  }
}


async function cargarPeriodos() {
  try {
    const { data } = await axiosInstance.get(`wsListaPeriodoEducativo.php?av_profile=${profile}`);
    if (data.status) {
      periodosOptions.value = data.data.map(p => ({
        title: p.peed_nombre,
        key: p.peed_id
      }));
    }
  } catch (error) {
    console.error('Error al cargar periodos:', error);
    periodosOptions.value = [];
  }
}

async function cargarCursos() {
  try {
    const { data } = await axiosInstance.get(`wsListaDocenteAreaEducativaDetalle.php?ac_anio_escolar=${anioEscolar}&av_profile=${profile}`);
    if (data.status) {
      cursosOptions.value = data.data.map(c => ({
        key: c.daed_id, // Aquí el ID único correcto
        title: `${c.docente} / ${c.area_educativa}` // Aquí el nombre correcto del curso + docente
      }));
    }
  } catch (error) {
    console.error('Error al cargar cursos:', error);
    cursosOptions.value = [];
  }
}


/** SNACKBAR */
const snackbar = ref(false)
const snackbarMessage = ref('')
const snackbarColor = ref('success')

/** WATCH */
let inicializado = false;
watch(selectedNivel, () => {
  if (!inicializado) {
    inicializado = true;
    return; // Durante la primera carga NO haces nada
  }
  selectedGrado.value = 'TODOS';
});

/** MONTAJE */
onMounted(async () => {
  await obtenerAreasNivelesGrados(); // <-- primero cargas las áreas, niveles y grados
  await obtenerPlanes();             // <-- luego cargas los planes de estudio
})
</script>

<style scoped>
/* General */
.v-card,
.v-list-item {
  text-align: left;
}

/* Hover filas de la tabla */
.v-data-table tbody tr:hover {
  background-color: #f5f5f5;
}

/* Cabecera de la tabla */
.v-data-table:not(.evaluaciones-table) thead th {
  background-color: #E3F2FD;
  color: #1565C0;
  font-weight: bold;
  font-size: 0.9rem;
  padding: 10px;
}

/* Celdas del cuerpo de tabla */
.v-data-table tbody td {
  font-size: 0.85rem;
  padding: 6px 8px;
}

/* Botones de acción pequeños */
.v-btn {
  min-width: 32px;
}

/* Paginación centrada */
.v-pagination {
  justify-content: center;
  margin-top: 16px;
}

/* Sombra ligera en tarjetas mobile */
.shadow-mobile {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border-radius: 12px;
}

/* Ajustes Mobile/Tablet */
@media (max-width: 960px) {
  .v-card {
    margin-bottom: 12px;
  }
  .v-card-title {
    font-size: 1rem;
  }
  .v-card-subtitle {
    font-size: 0.85rem;
  }
}

/* Ajustes para Large Desktop */
@media (min-width: 1280px) {
  .v-container {
    max-width: 100% !important;
  }
}

.v-container {
  max-width: 100% !important;
}

/* Fila expandida */
.expanded-row {
  background-color: #fafafa;
}

/* Hover normal en filas */
.v-data-table tbody tr:hover {
  background-color: #f5f5f5;
}

/* Asegura que la tabla principal ocupe todo el ancho del contenedor */
.v-data-table {
  width: 100% !important;
  table-layout: auto;
}

/* Asegura que el v-card que la contiene no restrinja el ancho */
.v-card.pa-2.elevation-1 {
  width: 100% !important;
}

</style>
