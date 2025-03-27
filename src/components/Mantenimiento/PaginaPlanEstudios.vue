<template>
  <v-container fluid>
    <!-- ENCABEZADO -->
    <v-row class="py-3">
      <v-col cols="12">
        <h1 class="text-h4">Plan de estudios - Año {{ anioEscolar }}</h1>
      </v-col>
    </v-row>


    <!-- FILTROS -->
    <v-row class="mb-4" dense>
      <v-col cols="12" md="4">
        <v-select
          label="Área Educativa"
          :items="areasOptions"
          item-text="title"
          item-value="key"
          v-model="selectedArea"
          dense
          outlined
        />
      </v-col>
      <v-col cols="12" md="4">
        <v-select
          label="Nivel"
          :items="nivelOptions"
          item-text="title"
          item-value="key"
          v-model="selectedNivel"
          dense
          outlined
        />
      </v-col>
      <v-col cols="12" md="4">
        <v-select
          label="Grado"
          :items="gradoOptions"
          item-text="title"
          item-value="key"
          v-model="selectedGrado"
          dense
          outlined
        />
      </v-col>
    </v-row>

    <!-- BOTÓN AGREGAR -->
    <v-row>
      <v-col cols="12" class="d-flex justify-end">
        <v-btn color="primary" @click="mostrarDialogoAgregarPlanEstudio = true">
          Agregar Plan de Estudio
        </v-btn>
      </v-col>
    </v-row>

    <!-- TABLA DESKTOP -->
    <div v-if="isDesktop">
      <v-data-table
        :items="filteredPlanes"
        item-key="ples_id"
        :items-per-page="itemsPerPage"
        hide-default-header
        class="elevation-1 mt-4"
        v-model:page="currentPage"
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
            <template v-for="(plan, idx) in items" :key="plan.ples_id">
              <tr :class="{ 'expanded-row': isExpanded(plan.ples_id) }">
                <td>{{ (currentPage - 1) * itemsPerPage + idx + 1 }}</td>
                <td>{{ plan.ared_nombre }}</td>
                <td>{{ plan.nive_nombre }}</td>
                <td>{{ plan.grad_nombre }}</td>
                <td>{{ plan.ples_horas }}</td>
                <td>
                  <v-chip :color="plan.ples_estado === 'A' ? 'green' : 'red'">
                    {{ plan.ples_estado === 'A' ? 'Activo' : 'Inactivo' }}
                  </v-chip>
                </td>
                <td>
                  <!-- Botón para editar el plan de estudio -->
                  <v-btn icon variant="text" @click.stop="abrirDialogoActualizarPlan(plan)">
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>
                  <!-- Botón para expandir -->
                  <v-btn icon variant="text" @click.stop="toggleExpand(plan.ples_id)">
                    <v-icon>{{ isExpanded(plan.ples_id) ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
                  </v-btn>
                </td>
              </tr>
              <!-- Sección expandida para Planes Curriculares -->
              <tr v-if="isExpanded(plan.ples_id)">
                <td colspan="6" class="expanded-section">
                  <div class="d-flex justify-space-between font-weight-bold mb-2">
                    <span>Planes Curriculares</span>
                    <v-btn small color="primary" variant="text" @click="abrirDialogoAgregarCurricular(plan)">
                      +Agregar
                    </v-btn>
                  </div>
                  <table v-if="(planCurriculares[plan.ples_id] || []).length" class="w-100">
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
                      <tr v-for="(item, i) in paginatedCurr(plan.ples_id)" :key="item.pacu_id">
                        <td>{{ ((planCurrPage[plan.ples_id] ?? 1) - 1) * currItemsPerPage + i + 1 }}</td>
                        <td>{{ item.peed_nombre }}</td>
                        <td>{{ item.aede_nombre }}</td>
                        <td>{{ item.docente }}</td>
                        <td>{{ item.pacu_horas }}</td>
                        <td>
                          <v-chip :color="item.pacu_estado === 'A' ? 'green' : 'red'">
                            {{ item.pacu_estado === 'A' ? 'Activo' : 'Inactivo' }}
                          </v-chip>
                        </td>
                        <td>
                          <v-btn icon variant="text" @click.stop="abrirDialogoActualizarCurricular(item, plan.ples_id)">
                            <v-icon>mdi-pencil</v-icon>
                          </v-btn>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <p v-else>No hay planes curriculares</p>
                  <v-pagination
                    v-if="currTotalPages(plan.ples_id) > 1"
                    v-model="planCurrPage[plan.ples_id]"
                    :length="currTotalPages(plan.ples_id)"
                    small
                    class="mt-2"
                  />
                </td>
              </tr>
            </template>
          </tbody>
        </template>
      </v-data-table>
      <v-pagination v-if="totalPages > 1" v-model="currentPage" :length="totalPages" class="mt-4" />
    </div>

    <!-- VERSIÓN MOBILE -->
      <div v-else>
        <v-row>
          <v-col cols="12" v-for="plan in paginatedMobilePlanes" :key="plan.ples_id">
            <v-card class="mb-4">
              <!-- Reemplaza solo el header de tu v-card en mobile -->
<v-card-title class="d-flex justify-space-between align-center">
  <div>
    <div class="font-weight-medium">{{ plan.ared_nombre }}</div>
    <div class="text-subtitle-2">{{ plan.nive_nombre }} — {{ plan.grad_nombre }}</div>
  </div>
  <div>
    <v-btn icon @click.stop="abrirDialogoActualizarPlan(plan)">
      <v-icon>mdi-pencil</v-icon>
    </v-btn>
    <v-btn icon @click.stop="toggleExpand(plan.ples_id)">
      <v-icon>{{ isExpanded(plan.ples_id) ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
    </v-btn>
  </div>
</v-card-title>



              <v-card-subtitle class="px-4 pb-0">
                Horas: {{ plan.ples_horas }} |
                <v-chip x-small :color="plan.ples_estado === 'A' ? 'green' : 'red'">
                  {{ plan.ples_estado === 'A' ? 'Activo' : 'Inactivo' }}
                </v-chip>
              </v-card-subtitle>

              <v-expand-transition>
                <v-card-text v-if="isExpanded(plan.ples_id)">
                  <v-list dense>
                    <v-list-item
                      v-for="item in planCurriculares[plan.ples_id] || []"
                      :key="item.pacu_id"
                      class="d-flex align-center justify-space-between"
                    >
                      <div>
                        {{ item.peed_nombre }} — {{ item.aede_nombre }}
                        <div class="text-caption">
                          Docente: {{ item.docente }} | Horas: {{ item.pacu_horas }}
                          <v-chip x-small :color="item.pacu_estado === 'A' ? 'green' : 'red'">
                            {{ item.pacu_estado === 'A' ? 'Activo' : 'Inactivo' }}
                          </v-chip>
                        </div>
                      </div>
                      <v-btn icon @click.stop="abrirDialogoActualizarCurricular(item, plan.ples_id)">
                        <v-icon>mdi-pencil</v-icon>
                      </v-btn>
                    </v-list-item>

                    <v-list-item v-if="!(planCurriculares[plan.ples_id]?.length)">
                      No hay planes curriculares
                    </v-list-item>
                  </v-list>

                  <v-btn small color="primary" class="mt-2" @click="abrirDialogoAgregarCurricular(plan)">
                    + Agregar Curricular
                  </v-btn>
                </v-card-text>
              </v-expand-transition>
            </v-card>
          </v-col>
        </v-row>

        <v-pagination
          v-model="mobilePage"
          :length="mobileTotalPages"
          :total-visible="5"
          class="mt-4"
          dense
        />
      </div>


    <!-- DIÁLOGO: Editar Plan de Estudio -->
    <v-dialog v-model="mostrarDialogoActualizarPlan" max-width="400">
      <v-card>
        <v-card-title>
          <span class="text-h6">Editar Plan de Estudio</span>
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12">
              <div><strong>Área Educativa:</strong> {{ planSeleccionado?.ared_nombre }}</div>
            </v-col>
            <v-col cols="12">
              <div><strong>Nivel:</strong> {{ nivelDelPlan }}</div>
            </v-col>
            <v-col cols="12">
              <div><strong>Grado:</strong> {{ planSeleccionado?.grad_nombre }}</div>
            </v-col>
            <v-col cols="12">
              <v-text-field label="Horas" v-model="planSeleccionadoHrs" type="number" />
            </v-col>
            <v-col cols="12">
              <v-select label="Estado" v-model="planSeleccionadoEstado" :items="['Activo','Inactivo']" />
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="cerrarDialogoActualizarPlan">Cancelar</v-btn>
          <v-btn color="primary" @click="guardarPlanEstudio">Guardar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="mostrarDialogoAgregarCurricular" max-width="400">
      <v-card>
        <v-card-title>Agregar Plan Curricular</v-card-title>
        <v-card-text>
          <v-select label="Periodo" :items="periodosOptions" item-text="title" item-value="key" v-model="newCurricular.periodo_id" />
          <v-select label="Docente / Curso" :items="docentesOptions" item-text="title" item-value="key" v-model="newCurricular.daed_id" />
          <v-text-field label="Horas" type="number" v-model="newCurricular.pacu_horas" />
        </v-card-text>
        <v-card-actions>
          <v-btn text @click="mostrarDialogoAgregarCurricular = false">Cancelar</v-btn>
          <v-btn color="primary" @click="guardarNuevoPlanCurricular">Guardar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- DIÁLOGO: Editar Plan Curricular (ya funcional) -->
    <v-dialog v-model="mostrarDialogoActualizarCurricular" max-width="400">
      <v-card>
        <v-card-title>
          <span class="text-h6">Editar Plan Curricular</span>
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12">
              <div><strong>Curso:</strong> {{ planCurricularSeleccionado?.aede_nombre }}</div>
            </v-col>
            <v-col cols="12">
              <div><strong>Docente:</strong> {{ planCurricularSeleccionado?.docente }}</div>
            </v-col>
            <v-col cols="12">
              <v-text-field label="Horas" v-model="planCurricularHoras" type="number" />
            </v-col>
            <v-col cols="12">
              <v-select label="Estado" v-model="planCurricularEstado" :items="['Activo','Inactivo']" />
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="cerrarDialogoActualizarCurricular">Cancelar</v-btn>
          <v-btn color="primary" @click="guardarPlanCurricular">Guardar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="mostrarDialogoAgregarPlanEstudio" max-width="400">
      <v-card>
        <v-card-title>Agregar Plan de Estudio</v-card-title>
        <v-card-text>
          <v-select
            label="Área Educativa"
            :items="areasOptions.slice(1)"
            item-text="title"
            item-value="key"
            v-model="newPlanEstudio.ared_id"
            dense
            outlined
          />
          <v-select
            label="Nivel"
            :items="nivelOptions.slice(1)"
            item-text="title"
            item-value="key"
            v-model="newPlanEstudio.nive_id"
            dense
            outlined
          />
          <v-select
            label="Grado"
            :items="newGradoOptions"
            item-text="title"
            item-value="key"
            v-model="newPlanEstudio.grad_id"
            dense
            outlined
          />
          <v-text-field
            label="Horas"
            type="number"
            v-model="newPlanEstudio.ples_horas"
            dense
            outlined
          />
        </v-card-text>
        <v-card-actions>
          <v-btn text @click="mostrarDialogoAgregarPlanEstudio = false">Cancelar</v-btn>
          <v-btn color="primary" @click="guardarNuevoPlanEstudio">Guardar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, watch, reactive } from 'vue'
import axios from 'axios'
import { useDisplay } from 'vuetify'

const { mdAndUp } = useDisplay()
const isDesktop = mdAndUp

const anioEscolar = localStorage.getItem('anio_escolar')
const profile = localStorage.getItem('profile')
const token = localStorage.getItem('token')

const axiosInstance = axios.create({
  baseURL: 'https://amsoftsolution.com/amss/ws/',
  headers: { Authorization: `Bearer ${token}` }
})

// Datos de Planes y Planes Curriculares
const planesEstudio = ref([])
const planCurriculares = ref({})

// Paginación principal
const currentPage = ref(1)
const itemsPerPage = computed(() => isDesktop.value ? 10 : 5)

// Paginación interna para planes curriculares
const planCurrPage = ref({})
const currItemsPerPage = computed(() => isDesktop.value ? 10 : 5)

// Expansión de filas
const expandedId = ref(null)

// Opciones de filtro
const areasOptions = ref([{ title: 'TODOS', key: 'TODOS' }])
const nivelOptions = ref([{ title: 'TODOS', key: 'TODOS' }])
const gradosList = ref([])

const selectedArea = ref('TODOS')
const selectedNivel = ref('TODOS')
const selectedGrado = ref('TODOS')

const mostrarDialogoAgregarCurricular = ref(false)
const newCurricular = reactive({
  ples_id: null,
  ared_id: null,
  daed_id: null,
  periodo_id: null,
  pacu_horas: null,
  estado: 'Activo',
})

const docentesOptions = ref([])
const periodosOptions = ref([])

function abrirDialogoAgregarCurricular(plan) {
  newCurricular.ples_id = plan.ples_id
  newCurricular.ared_id = plan.ared_id
  newCurricular.daed_id = null
  newCurricular.periodo_id = null
  newCurricular.pacu_horas = null
  newCurricular.estado = 'Activo'
  mostrarDialogoAgregarCurricular.value = true

  obtenerDocentesCursos(plan.ared_id)
  obtenerPeriodos()
}



const nivelDelPlan = computed(() => {
  if (!planSeleccionado.value) return ''
  const gradoObj = gradosList.value.find(g => g.grad_nombre === planSeleccionado.value.grad_nombre)
  return nivelOptions.value.find(n => n.key === gradoObj?.nive_id)?.title || ''
})

// Opciones para el filtro "Grado"
const gradoOptions = computed(() => {
  // Siempre mostrar “TODOS” primero
  const base = [{ title: 'TODOS', key: 'TODOS' }]

  // Si el nivel seleccionado es “TODOS”, no agregar nada más
  if (selectedNivel.value === 'TODOS') {
    return base
  }

  // Si hay un nivel específico, filtrar los grados correspondientes
  const filtered = gradosList.value.filter(g => g.nive_id === selectedNivel.value)

  return base.concat(
    filtered.map(g => ({ title: g.grad_nombre, key: g.grad_nombre }))
  )
})


// Filtrado de planes
const filteredPlanes = computed(() =>
  planesEstudio.value.filter(plan => {
    const okArea = selectedArea.value === 'TODOS' || plan.ared_id === selectedArea.value
    const okNivel =
      selectedNivel.value === 'TODOS' ||
      gradosList.value.find(g => g.grad_nombre === plan.grad_nombre)?.nive_id === selectedNivel.value
    const okGrado = selectedGrado.value === 'TODOS' || plan.grad_nombre === selectedGrado.value
    return okArea && okNivel && okGrado
  })
)

const totalPages = computed(() => Math.ceil(filteredPlanes.value.length / itemsPerPage.value))

// Variables y funciones para editar el plan de estudio (Plan de Estudio)
const mostrarDialogoActualizarPlan = ref(false)
const planSeleccionado = ref(null)
const planSeleccionadoHrs = ref(null)
const planSeleccionadoEstado = ref('')

function abrirDialogoActualizarPlan(plan) {
  planSeleccionado.value = { ...plan }
  planSeleccionadoHrs.value = plan.ples_horas
  planSeleccionadoEstado.value = plan.ples_estado === 'A' ? 'Activo' : 'Inactivo'
  mostrarDialogoActualizarPlan.value = true
}

function cerrarDialogoActualizarPlan() {
  mostrarDialogoActualizarPlan.value = false
  planSeleccionado.value = null
  planSeleccionadoHrs.value = null
  planSeleccionadoEstado.value = ''
}

async function guardarPlanEstudio() {
  try {
    const nuevoEstado = planSeleccionadoEstado.value === 'Activo' ? 'A' : 'I'
    await axiosInstance.post('wsActualizaPlanEstudios.php', {
      ai_ples_id: planSeleccionado.value.ples_id,
      ai_grad_id: planSeleccionado.value.grad_id,
      ai_ared_id: planSeleccionado.value.ared_id,
      ai_ples_horas: planSeleccionadoHrs.value,
      ac_ples_estado: nuevoEstado,
      av_profile: profile,
    })
    cerrarDialogoActualizarPlan()
    obtenerPlanesEstudio()
  } catch (err) {
    console.error('Error al actualizar el plan de estudio:', err)
  }
}

// Variables y funciones para editar el plan curricular (ya funcionando)
const mostrarDialogoActualizarCurricular = ref(false)
const planCurricularSeleccionado = ref(null)
const planCurricularHoras = ref(null)
const planCurricularEstado = ref('')

function abrirDialogoActualizarCurricular(item, planId) {
  console.log('Editar plan curricular:', item)
  if (!item || !item.pacu_id) {
    console.warn('El objeto item no contiene la propiedad pacu_id:', item)
    return
  }
  planCurricularSeleccionado.value = { ...item, ples_id: planId }
  planCurricularHoras.value = item.pacu_horas
  planCurricularEstado.value = item.pacu_estado === 'A' ? 'Activo' : 'Inactivo'
  mostrarDialogoActualizarCurricular.value = true
}

function cerrarDialogoActualizarCurricular() {
  mostrarDialogoActualizarCurricular.value = false
  planCurricularSeleccionado.value = null
  planCurricularHoras.value = null
  planCurricularEstado.value = ''
}

async function guardarNuevoPlanCurricular() {
  const estado = newCurricular.estado === 'Activo' ? 'A' : 'I'
  await axiosInstance.post('wsRegistraPlanCurricular.php', {
    ai_ples_id: newCurricular.ples_id,
    ai_daed_id: newCurricular.daed_id,
    ai_peed_id: newCurricular.periodo_id,
    ai_pacu_horas: newCurricular.pacu_horas,
    ac_pacu_estado: estado,
    av_profile: profile,
  })
  await obtenerPlanCurricular(newCurricular.ples_id)
  mostrarDialogoAgregarCurricular.value = false
}

async function obtenerDocentesCursos(aredId) {
  const { data } = await axiosInstance.get(
    `wsListaDocenteAreaEducativaDetalle.php?ac_anio_escolar=${anioEscolar}&av_profile=${profile}`
  )
  if (data.status) {
    docentesOptions.value = data.data
      .filter(item => item.ared_id === aredId && item.estado === 'A')
      .map(item => ({
        title: `${item.area_educativa} — ${item.docente}`,
        key: item.daed_id,
      }))
  }
}

async function obtenerPeriodos() {
  try {
    const { data } = await axiosInstance.get(
      `wsListaPeriodoEducativo.php?av_profile=${profile}`
    )
    if (data.status) {
      periodosOptions.value = data.data.map(p => ({
        title: p.peed_nombre,
        key: p.peed_id,
      }))
    }
  } catch (err) {
    console.error('Error cargando periodos:', err)
  }
}


async function guardarPlanCurricular() {
  try {
    const nuevoEstado = planCurricularEstado.value === 'Activo' ? 'A' : 'I'
    const id = planCurricularSeleccionado.value.ples_id
    await axiosInstance.post('wsActualizaPlanCurricular.php', {
      ai_pacu_id: planCurricularSeleccionado.value.pacu_id,
      ai_daed_id: planCurricularSeleccionado.value.daed_id,
      ai_pacu_horas: planCurricularHoras.value,
      ac_pacu_estado: nuevoEstado,
      av_profile: profile,
    })
    await obtenerPlanCurricular(id)
    cerrarDialogoActualizarCurricular()
  } catch (err) {
    console.error('Error al actualizar el plan curricular:', err)
  }
}

// Funciones comunes
function paginatedCurr(id) {
  const list = planCurriculares.value[id] || []
  const page = planCurrPage.value[id] || 1
  const start = (page - 1) * currItemsPerPage.value
  return list.slice(start, start + currItemsPerPage.value)
}

function currTotalPages(id) {
  return Math.ceil((planCurriculares.value[id]?.length || 0) / currItemsPerPage.value)
}

async function obtenerPlanesEstudio() {
  const { data } = await axiosInstance.get(`wsConsultaPlanEstudios.php?ac_anio_escolar=${anioEscolar}&av_profile=${profile}`)
  if (data.status) planesEstudio.value = data.data
}

async function obtenerPlanCurricular(id) {
  const { data } = await axiosInstance.get(`wsConsultaPlanCurricular.php?ai_ples_id=${id}&av_profile=${profile}`)
  if (data.status) {
    planCurriculares.value = { ...planCurriculares.value, [id]: data.data }
  }
}

function toggleExpand(id) {
  if (expandedId.value === id) {
    expandedId.value = null
  } else {
    expandedId.value = id
    obtenerPlanCurricular(id)
  }
}

function isExpanded(id) {
  return expandedId.value === id
}

async function obtenerAreasEducativas() {
  const { data } = await axiosInstance.get(`wsListaAreaEducativa.php?ac_indicador_todos=N&av_profile=${profile}`)
  if (data.status) {
    areasOptions.value = [{ title: 'TODOS', key: 'TODOS' }].concat(
      data.data.map(a => ({ title: a.ared_nombre, key: a.ared_id }))
    )
  }
}

async function obtenerNivelesGrados() {
  const { data } = await axiosInstance.get(`wsListaNivelGradoAlumno.php?av_profile=${profile}`)
  if (data.status) {
    nivelOptions.value = [{ title: 'TODOS', key: 'TODOS' }].concat(
      data.data.niveles.map(n => ({ title: n.nive_nombre, key: n.nive_id }))
    )
    gradosList.value = data.data.grados
  }
}

// — Mostrar/Ocultar diálogo —
const mostrarDialogoAgregarPlanEstudio = ref(false)

// — Modelo reactivo para el nuevo plan —
const newPlanEstudio = reactive({
  ared_id: null,
  nive_id: null,
  grad_id: null,
  ples_horas: null,
  estado: 'Activo'
})

// — Opciones filtradas para Grado (sin “TODOS”) —
const newGradoOptions = computed(() =>
  newPlanEstudio.nive_id
    ? gradosList.value
        .filter(g => g.nive_id === newPlanEstudio.nive_id)
        .map(g => ({ title: g.grad_nombre, key: g.grad_id }))
    : []
)

const mobilePage = ref(1)
const mobileItemsPerPage = 5

const paginatedMobilePlanes = computed(() => {
  const start = (mobilePage.value - 1) * mobileItemsPerPage
  return filteredPlanes.value.slice(start, start + mobileItemsPerPage)
})

const mobileTotalPages = computed(() =>
  Math.ceil(filteredPlanes.value.length / mobileItemsPerPage)
)


// — Guardar nuevo Plan de Estudio —
async function guardarNuevoPlanEstudio() {
  try {
    await axiosInstance.post('wsRegistraPlanEstudios.php', {
      ai_grad_id: newPlanEstudio.grad_id,
      ai_ared_id: newPlanEstudio.ared_id,
      ai_ples_horas: newPlanEstudio.ples_horas,
      ac_anio_escolar: anioEscolar,
      av_profile: profile
    })
    mostrarDialogoAgregarPlanEstudio.value = false
    // Reset modelo
    Object.assign(newPlanEstudio, { ared_id: null, nive_id: null, grad_id: null, ples_horas: null, estado: 'Activo' })
    await obtenerPlanesEstudio()
  } catch (error) {
    console.error('Error registrando plan de estudio:', error)
  }
}


onMounted(() => {
  obtenerPlanesEstudio()
  obtenerAreasEducativas()
  obtenerNivelesGrados()
})

watch([selectedArea, selectedNivel, selectedGrado], () => {
  currentPage.value = 1
  mobilePage.value = 1
})
</script>

<style scoped>
th,
td {
  padding: 12px 24px;
}
.expanded-row {
  background-color: #e0f7fa;
}
.expanded-section {
  background: #fafafa;
  padding: 12px;
}
</style>
