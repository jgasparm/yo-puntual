<template>
  <v-container fluid>
    <!-- Cabecera -->
    <v-row class="mb-1">
      <v-col cols="12">
        <h1 class="text-h5 font-weight-bold mb-1">📋 Actividades de evaluación</h1>
        <p class="text-subtitle-2 text-grey-darken-1">Gestiona las actividades escolares que serán consideradas en la evaluación de las competencias.</p>
      </v-col>
    </v-row>

    <!-- Botón Agregar -->
    <v-row class="mb-3">
      <v-col cols="12" class="d-flex justify-end">
        <v-btn color="primary" @click="abrirDialogoAgregar">
          <v-icon left>mdi-plus</v-icon>
          Agregar Actividad
        </v-btn>
      </v-col>
    </v-row>


    <div v-if="isDesktop">
      <v-data-table
        :items="actividades"
        item-key="acti_id"
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
            <tr v-for="(ev, i) in items" :key="ev.acti_id">
              <td>{{ (currentPage - 1) * itemsPerPage + i + 1 }}</td>
              <td>{{ ev.acti_nombre }}</td>
              <td>{{ ev.acti_abreviacion }}</td>
              <td>
                <v-chip :color="ev.acti_estado === 'A' ? 'green' : 'red'">
                  {{ ev.acti_estado === 'A' ? 'Activo' : 'Inactivo' }}
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
        <v-col cols="12" v-for="(ev) in paginatedMobile" :key="ev.acti_id" class="mb-4">
          <v-card>
            <v-card-title class="d-flex justify-space-between align-center">
              <div>
                <div class="font-weight-medium">{{ ev.acti_nombre }}</div>
                <div class="text-subtitle-2">{{ ev.acti_abreviacion }}</div>
              </div>
              <v-btn icon @click.stop="abrirDialogoEditar(ev)">
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
            </v-card-title>
            <v-card-subtitle>
              <strong>Estado:</strong>
              <v-chip :color="ev.acti_estado === 'A' ? 'green' : 'red'">
                {{ ev.acti_estado === 'A' ? 'Activo' : 'Inactivo' }}
              </v-chip>
            </v-card-subtitle>
          </v-card>
        </v-col>
      </v-row>
      <v-pagination v-if="mobileTotalPages > 1" v-model="mobilePage" :length="mobileTotalPages" class="mt-4" dense />
    </div>

    <!-- Dialogo Agregar -->
    <!-- Dialogo Agregar -->
<v-dialog v-model="mostrarDialogoAgregar" max-width="400">
  <v-card>
    <v-card-title>Agregar Evaluación</v-card-title>
    <v-form ref="formAgregar" v-model="formAgregarValido">
      <v-card-text>
        <v-text-field
          label="Nombre"
          v-model="newActi.nombre"
          :counter="100"
          :rules="[
            v => !!v || 'Campo obligatorio',
            v => (v && v.length <= 100) || 'Máximo 100 caracteres'
          ]"
          @input="validarFormAgregar"
        />
        <v-text-field
          label="Abreviación"
          v-model="newActi.abrev"
          :counter="2"
          :rules="[
            v => !!v || 'Campo obligatorio',
            v => (v && v.length <= 2) || 'Máximo 2 caracteres'
          ]"
          @input="validarFormAgregar"
        />
      </v-card-text>
      <v-card-actions>
        <v-btn text @click="cerrarAgregar">Cancelar</v-btn>
        <v-btn color="primary" :disabled="!formAgregarValido" @click="guardarNuevo">Guardar</v-btn>
      </v-card-actions>
    </v-form>
  </v-card>
</v-dialog>


<v-dialog v-model="mostrarDialogoEditar" max-width="400">
  <v-card v-if="selectedActi">
    <v-card-title>Editar Evaluación</v-card-title>
    <v-form ref="formEditar" v-model="formEditarValido">
      <v-card-text>
        <v-text-field
          label="Nombre"
          v-model="selectedActi.acti_nombre"
          :counter="100"
          :rules="[
            v => !!v || 'Campo obligatorio',
            v => (v && v.length <= 100) || 'Máximo 100 caracteres'
          ]"
          @input="validarFormAgregar"
        />
        <v-text-field
          label="Abreviación"
          v-model="selectedActi.acti_abreviacion"
          :counter="2"
          :rules="[
            v => !!v || 'Campo obligatorio',
            v => (v && v.length <= 2) || 'Máximo 2 caracteres'
          ]"
          @input="validarFormAgregar"
        />
        <v-select label="Estado" :items="['Activo','Inactivo']" v-model="selectedActiEstado" />
      </v-card-text>
      <v-card-actions>
        <v-btn text @click="cerrarEditar">Cancelar</v-btn>
        <v-btn color="primary" :disabled="!formEditarValido" @click="guardarEditado">Guardar</v-btn>
      </v-card-actions>
    </v-form>
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
const profile = localStorage.getItem('profile')
const token = localStorage.getItem('token')
const axiosInstance = axios.create({ baseURL: 'https://amsoftsolution.com/amss/ws/', headers: { Authorization: `Bearer ${token}` } })

const actividades = ref([])
const currentPage = ref(1)
const mobilePage = ref(1)
const itemsPerPage = computed(() => isDesktop.value ? 10 : 5)

const mostrarDialogoAgregar = ref(false)
const newActi = ref({ nombre: '', abrev: '' })

const mostrarDialogoEditar = ref(false)
const selectedActi = ref({ acti_id: null, acti_nombre: '', acti_abreviacion: '', acti_estado: 'A' })
const selectedActiEstado = ref('Activo')

const totalPages = computed(() => Math.ceil(actividades.value.length / itemsPerPage.value))
const mobileTotalPages = computed(() => Math.ceil(actividades.value.length / 5))
const paginatedMobile = computed(() => actividades.value.slice((mobilePage.value - 1) * 5, mobilePage.value * 5))

async function obtenerEvaluaciones() {
  try {
    const { data } = await axiosInstance.get(`wsListaActividades.php?av_profile=${profile}`)
    if (data.status && Array.isArray(data.data)) {
      actividades.value = data.data
    } else {
      console.warn('La API no retornó un array:', data.data)
      actividades.value = []
    }
  } catch (error) {
    console.error('Error al obtener actividades:', error)
    actividades.value = []
  }
}


function abrirDialogoAgregar() {
  newActi.value = { nombre: '', abrev: '' }
  mostrarDialogoAgregar.value = true
}
function cerrarAgregar() {
  mostrarDialogoAgregar.value = false
}
async function guardarNuevo() {
  await axiosInstance.post('wsRegistraActividad.php', {
    av_acti_nombre: newActi.value.nombre,
    ac_acti_abreviacion: newActi.value.abrev,
    av_profile: profile
  })
  cerrarAgregar()
  obtenerEvaluaciones()
}

function abrirDialogoEditar(ev) {
  selectedActi.value = { ...ev }
  selectedActiEstado.value = ev.acti_estado === 'A' ? 'Activo' : 'Inactivo'
  mostrarDialogoEditar.value = true
}
function cerrarEditar() {
  mostrarDialogoEditar.value = false
  selectedActi.value = { acti_id: null, acti_nombre: '', acti_abreviacion: '', acti_estado: 'A' }
}
async function guardarEditado() {
  await axiosInstance.post('wsActualizaActividad.php', {
    ai_acti_id: selectedActi.value.acti_id,
    av_acti_nombre: selectedActi.value.acti_nombre,
    ac_acti_abreviacion: selectedActi.value.acti_abreviacion,
    ac_acti_estado: selectedActiEstado.value === 'Activo' ? 'A' : 'I',
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
