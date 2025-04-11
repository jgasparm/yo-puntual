<template>
  <v-container fluid>
    <v-row class="py-3">
      <v-col cols="12">
        <h1 class="text-h4">Evaluaciones - Año {{ anioEscolar }}</h1>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" class="d-flex justify-end">
        <v-btn color="primary" @click="abrirDialogoAgregar">Agregar Evaluación</v-btn>
      </v-col>
    </v-row>

    <div v-if="isDesktop">
      <v-data-table
        :items="evaluaciones"
        item-key="eval_id"
        :items-per-page="itemsPerPage"
        hide-default-header
        class="elevation-1 mt-4"
        v-model:page="currentPage"
      >
        <template #body="{ items }">
          <thead>
            <tr>
              <th>N°</th>
              <th>Nombre</th>
              <th>Abreviación</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(ev, i) in items" :key="ev.eval_id">
              <td>{{ (currentPage - 1) * itemsPerPage + i + 1 }}</td>
              <td>{{ ev.eval_nombre }}</td>
              <td>{{ ev.eval_abreviacion }}</td>
              <td>
                <v-chip :color="ev.eval_estado === 'A' ? 'green' : 'red'">
                  {{ ev.eval_estado === 'A' ? 'Activo' : 'Inactivo' }}
                </v-chip>
              </td>
              <td>
                <v-btn icon @click.stop="abrirDialogoEditar(ev)">
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
              </td>
            </tr>
          </tbody>
        </template>
      </v-data-table>
      <v-pagination v-if="totalPages > 1" v-model="currentPage" :length="totalPages" class="mt-4" />
    </div>

    <div v-else>
      <v-row dense>
        <v-col cols="12" v-for="(ev) in paginatedMobile" :key="ev.eval_id" class="mb-4">
          <v-card>
            <v-card-title class="d-flex justify-space-between align-center">
              <div>
                <div class="font-weight-medium">{{ ev.eval_nombre }}</div>
                <div class="text-subtitle-2">{{ ev.eval_abreviacion }}</div>
              </div>
              <v-btn icon @click.stop="abrirDialogoEditar(ev)">
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
            </v-card-title>
            <v-card-subtitle>
              <strong>Estado:</strong>
              <v-chip :color="ev.eval_estado === 'A' ? 'green' : 'red'">
                {{ ev.eval_estado === 'A' ? 'Activo' : 'Inactivo' }}
              </v-chip>
            </v-card-subtitle>
          </v-card>
        </v-col>
      </v-row>
      <v-pagination v-if="mobileTotalPages > 1" v-model="mobilePage" :length="mobileTotalPages" class="mt-4" dense />
    </div>

    <!-- Dialogo Agregar -->
    <v-dialog v-model="mostrarDialogoAgregar" max-width="400">
      <v-card>
        <v-card-title>Agregar Evaluación</v-card-title>
        <v-card-text>
          <v-text-field label="Nombre" v-model="newEval.nombre" :rules="[v => !!v || 'Campo obligatorio']" />
          <v-text-field label="Abreviación" v-model="newEval.abrev" :rules="[v => !!v || 'Campo obligatorio']" />
        </v-card-text>
        <v-card-actions>
          <v-btn text @click="cerrarAgregar">Cancelar</v-btn>
          <v-btn color="primary" @click="guardarNuevo">Guardar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="mostrarDialogoEditar" max-width="400">
      <v-card v-if="selectedEval">
        <v-card-title>Editar Evaluación</v-card-title>
        <v-card-text>
          <v-text-field label="Nombre" v-model="selectedEval.eval_nombre" :rules="[v => !!v || 'Campo obligatorio']" />
          <v-text-field label="Abreviación" v-model="selectedEval.eval_abreviacion" :rules="[v => !!v || 'Campo obligatorio']" />
          <v-select label="Estado" :items="['Activo','Inactivo']" v-model="selectedEvalEstado" />
        </v-card-text>
        <v-card-actions>
          <v-btn text @click="cerrarEditar">Cancelar</v-btn>
          <v-btn color="primary" @click="guardarEditado">Guardar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { useDisplay } from 'vuetify'

const { mdAndUp } = useDisplay()
const isDesktop = mdAndUp
const anioEscolar = localStorage.getItem('anio_escolar')
const profile = localStorage.getItem('profile')
const token = localStorage.getItem('token')
const axiosInstance = axios.create({ baseURL: 'https://amsoftsolution.com/amss/ws/', headers: { Authorization: `Bearer ${token}` } })

const evaluaciones = ref([])
const currentPage = ref(1)
const mobilePage = ref(1)
const itemsPerPage = computed(() => isDesktop.value ? 10 : 5)

const mostrarDialogoAgregar = ref(false)
const newEval = ref({ nombre: '', abrev: '' })

const mostrarDialogoEditar = ref(false)
const selectedEval = ref({ eval_id: null, eval_nombre: '', eval_abreviacion: '', eval_estado: 'A' })
const selectedEvalEstado = ref('Activo')

const totalPages = computed(() => Math.ceil(evaluaciones.value.length / itemsPerPage.value))
const mobileTotalPages = computed(() => Math.ceil(evaluaciones.value.length / 5))
const paginatedMobile = computed(() => evaluaciones.value.slice((mobilePage.value - 1) * 5, mobilePage.value * 5))

async function obtenerEvaluaciones() {
  try {
    const { data } = await axiosInstance.get(`wsListaEvaluaciones.php?av_profile=${profile}`)
    if (data.status && Array.isArray(data.data)) {
      evaluaciones.value = data.data
    } else {
      console.warn('La API no retornó un array:', data.data)
      evaluaciones.value = []
    }
  } catch (error) {
    console.error('Error al obtener evaluaciones:', error)
    evaluaciones.value = []
  }
}


function abrirDialogoAgregar() {
  newEval.value = { nombre: '', abrev: '' }
  mostrarDialogoAgregar.value = true
}
function cerrarAgregar() {
  mostrarDialogoAgregar.value = false
}
async function guardarNuevo() {
  await axiosInstance.post('wsRegistraEvaluaciones.php', {
    av_eval_nombre: newEval.value.nombre,
    ac_eval_abreviacion: newEval.value.abrev,
    av_profile: profile
  })
  cerrarAgregar()
  obtenerEvaluaciones()
}

function abrirDialogoEditar(ev) {
  selectedEval.value = { ...ev }
  selectedEvalEstado.value = ev.eval_estado === 'A' ? 'Activo' : 'Inactivo'
  mostrarDialogoEditar.value = true
}
function cerrarEditar() {
  mostrarDialogoEditar.value = false
  selectedEval.value = { eval_id: null, eval_nombre: '', eval_abreviacion: '', eval_estado: 'A' }
}
async function guardarEditado() {
  await axiosInstance.post('wsActualizaEvaluaciones.php', {
    ai_eval_id: selectedEval.value.eval_id,
    av_eval_nombre: selectedEval.value.eval_nombre,
    ac_eval_abreviacion: selectedEval.value.eval_abreviacion,
    ac_eval_estado: selectedEvalEstado.value === 'Activo' ? 'A' : 'I',
    av_profile: profile
  })
  cerrarEditar()
  obtenerEvaluaciones()
}

onMounted(obtenerEvaluaciones)
</script>

<style scoped>
th, td { padding: 12px 24px }
</style>
