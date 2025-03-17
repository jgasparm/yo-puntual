<template>
  <v-container fluid>
    <!-- Encabezado: Título y botón para Agregar Aula -->
    <v-row class="py-3">
      <v-col cols="12" class="d-flex justify-space-between align-center">
        <h1 class="text-h4">Mis Aulas</h1>
        <v-btn color="primary" @click="abrirDialogAgregar">
          Agregar Aula
        </v-btn>
      </v-col>
    </v-row>

    <!-- VERSIÓN DESKTOP -->
    <div v-if="isDesktop">
      <v-data-table
        :items="paginatedAulas"
        item-key="aula_id"
        hide-default-header
        class="elevation-1 mt-4"
      >
        <template #body="{ items }">
          <!-- CABECERA MANUAL -->
          <thead>
            <tr>
              <th style="width: 50px;">N°</th>
              <th style="min-width: 180px;">Aula</th>
              <th style="min-width: 100px;">Capacidad</th>
              <th style="min-width: 150px;">Fecha Registro</th>
              <th style="width: 90px;">Estado</th>
              <th style="width: 130px;">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <!-- Iteramos por cada aula de la página -->
            <template v-for="(aula, index) in items" :key="aula.aula_id">
              <!-- Fila principal: Información del aula -->
              <tr :class="{ 'expanded-row': isExpanded(aula.aula_id) }">
                <td>{{ (currentAulaPage - 1) * itemsPerAulaPage + index + 1 }}</td>
                <td>{{ aula.aula_nombre }}</td>
                <td>{{ aula.aula_capacidad }}</td>
                <td>{{ aula.aula_fecha_registro }}</td>
                <td>
                  <v-chip v-if="aula.aula_estado === 'A'" color="green">Activo</v-chip>
                  <v-chip v-else color="red">Inactivo</v-chip>
                </td>
                <td>
                  <!-- Botón para editar aula -->
                  <v-btn icon variant="text" @click.stop="abrirDialogEditar(aula)">
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>
                  <!-- Botón para expandir/colapsar -->
                  <v-btn icon variant="text" @click.stop="toggleExpand(aula.aula_id)">
                    <v-icon>
                      {{ isExpanded(aula.aula_id) ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
                    </v-icon>
                  </v-btn>
                </td>
              </tr>
              <!-- Fila expandida: Detalle del aula -->
              <tr v-if="isExpanded(aula.aula_id)" style="background: #fafafa;">
                <td :colspan="6" style="padding: 12px;">
                  <!-- Encabezado del detalle -->
                  <div class="d-flex justify-space-between align-center" style="margin-bottom: 8px;">
                    <span style="font-weight: bold;">Detalles del Aula</span>
                    <v-btn small color="primary" variant="text" @click="agregarDetalle(aula)">
                      + Agregar Detalle
                    </v-btn>
                  </div>
                  <!-- Tabla de detalles (versión desktop) -->
                  <v-data-table
                    :headers="detalleHeaders"
                    :items="getPaginatedDetalles(aula.aula_id)"
                    class="elevation-1"
                    dense
                  >
                    <template #item.accion="{ item }">
                      <div class="table-action">
                        <v-btn icon variant="text" @click="editarDetalle(item)">
                          <v-icon>mdi-pencil</v-icon>
                        </v-btn>
                        <v-btn
                          icon
                          variant="text"
                          :color="item.indicador_horario_escolar === 'Si' ? 'warning' : 'success'"
                          :title="item.indicador_horario_escolar === 'Si' ? 'Actualizar horario escolar' : 'Agregar horario escolar'"
                          @click="item.indicador_horario_escolar === 'Si' ? actualizarHorario(item) : agregarHorario(item)"
                        >
                          <v-icon>
                            {{ item.indicador_horario_escolar === 'Si' ? 'mdi-update' : 'mdi-plus' }}
                          </v-icon>
                        </v-btn>
                      </div>
                    </template>
                  </v-data-table>
                  <!-- Paginación interna para detalles -->
                  <v-pagination
                    v-if="getPaginatedDetallesTotal(aula.aula_id) > 1"
                    v-model="detailPages[aula.aula_id]"
                    :length="getPaginatedDetallesTotal(aula.aula_id)"
                    class="mt-2"
                  />
                  <v-alert v-if="getDetalles(aula.aula_id).length === 0" type="info" class="mt-2">
                    No hay detalles para este aula.
                  </v-alert>
                </td>
              </tr>
            </template>
          </tbody>
        </template>
      </v-data-table>
      <!-- Paginación para la lista de aulas (desktop) -->
      <v-pagination
        v-if="totalAulaPages > 1"
        v-model="currentAulaPage"
        :length="totalAulaPages"
        class="mt-4"
      />
    </div>

    <!-- VERSIÓN MOBILE/TABLET -->
    <div v-else>
      <v-row dense>
        <v-col
          v-for="(aula, index) in paginatedAulas"
          :key="aula.aula_id"
          cols="12"
          class="mb-4"
        >
          <v-card :class="{ 'expanded-card': isExpanded(aula.aula_id) }" style="position: relative; text-align: left;">
            <!-- Botones: Editar y Expandir (ubicados en la esquina superior derecha) -->
            <v-btn icon variant="text" @click.stop="abrirDialogEditar(aula)" style="position: absolute; top: 8px; right: 48px;">
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn icon variant="text" @click.stop="toggleExpand(aula.aula_id)" style="position: absolute; top: 8px; right: 8px;">
              <v-icon>
                {{ isExpanded(aula.aula_id) ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
              </v-icon>
            </v-btn>
            <v-card-text style="padding-top: 60px;">
              <div><strong>Aula N°:</strong> {{ (currentAulaPage - 1) * itemsPerAulaPage + index + 1 }}</div>
              <div><strong>Nombre:</strong> {{ aula.aula_nombre }}</div>
              <div><strong>Capacidad:</strong> {{ aula.aula_capacidad }}</div>
              <div>
                <strong>Estado:</strong>
                <v-chip v-if="aula.aula_estado === 'A'" color="green">Activo</v-chip>
                <v-chip v-else color="red">Inactivo</v-chip>
              </div>
              <div><strong>Fecha Registro:</strong> {{ aula.aula_fecha_registro }}</div>
            </v-card-text>
            <!-- Botón para agregar detalle (visible cuando el aula está expandida) -->
            <v-card-actions v-if="isExpanded(aula.aula_id)">
              <v-btn color="primary" variant="text" @click="agregarDetalle(aula)">
                + Agregar Detalle
              </v-btn>
            </v-card-actions>
            <!-- Sección expandida: Detalles del aula en cards -->
            <div v-if="isExpanded(aula.aula_id)" style="padding: 12px; background: #fafafa;">
              <div class="mb-2" style="font-weight: bold; display: flex; align-items: center; justify-content: space-between;">
                <span>Detalles del Aula</span>
              </div>
              <v-row dense>
                <v-col
                  v-for="(detalle, dIndex) in getPaginatedDetalles(aula.aula_id)"
                  :key="detalle.id"
                  cols="12"
                  class="mb-2"
                >
                  <v-card outlined style="position: relative; text-align: left;">
                    <!-- Botón para editar detalle -->
                    <v-btn icon variant="text" @click.stop="editarDetalle(detalle)" style="position: absolute; top: 8px; right: 48px;">
                      <v-icon>mdi-pencil</v-icon>
                    </v-btn>
                    <!-- Botón para agregar/actualizar horario escolar -->
                    <v-btn
                      icon
                      variant="text"
                      style="position: absolute; top: 8px; right: 8px;"
                      :color="detalle.indicador_horario_escolar === 'Si' ? 'warning' : 'success'"
                      :title="detalle.indicador_horario_escolar === 'Si' ? 'Actualizar horario escolar' : 'Agregar horario escolar'"
                      @click="detalle.indicador_horario_escolar === 'Si' ? actualizarHorario(detalle) : agregarHorario(detalle)"
                    >
                      <v-icon>
                        {{ detalle.indicador_horario_escolar === 'Si' ? 'mdi-update' : 'mdi-plus' }}
                      </v-icon>
                    </v-btn>
                    <v-card-text style="padding-top: 40px;">
                      <div><strong>Detalle N°:</strong> {{ ((detailPages[aula.aula_id] - 1) * itemsPerDetailPage) + dIndex + 1 }}</div>
                      <div><strong>Turno:</strong> {{ detalle.turn_nombre }}</div>
                      <div><strong>Nivel:</strong> {{ detalle.nive_nombre }}</div>
                      <div><strong>Grado:</strong> {{ detalle.grad_nombre }}</div>
                      <div><strong>Sección:</strong> {{ detalle.secc_nombre }}</div>
                      <div><strong>Tutor:</strong> {{ detalle.tutor }}</div>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
              <!-- Paginación interna para detalles en mobile -->
              <v-pagination
                v-if="getPaginatedDetallesTotal(aula.aula_id) > 1"
                v-model="detailPages[aula.aula_id]"
                :length="getPaginatedDetallesTotal(aula.aula_id)"
                class="mt-2"
              />
              <v-alert v-if="getDetalles(aula.aula_id).length === 0" type="info" class="mt-2">
                No hay detalles para este aula.
              </v-alert>
            </div>
          </v-card>
        </v-col>
      </v-row>
      <!-- Paginación para la lista de aulas (mobile) -->
      <v-pagination
        v-if="totalAulaPages > 1"
        v-model="currentAulaPage"
        :length="totalAulaPages"
        class="mt-2"
      />
    </div>
    <!-- Diálogo para Agregar Aula -->
    <v-dialog v-model="dialogAgregarAula" max-width="500">
      <v-card>
        <v-card-title>
          <span class="text-h6">Agregar Aula</span>
        </v-card-title>
        <v-card-text>
          <v-form ref="formAgregar">
            <v-text-field
              v-model="nuevaAula.aula_nombre"
              label="Nombre del Aula"
              required
            />
            <v-text-field
              v-model.number="nuevaAula.aula_capacidad"
              label="Capacidad"
              type="number"
              required
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="dialogAgregarAula = false">Cancelar</v-btn>
          <v-btn color="primary" @click="guardarAula">Guardar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Diálogo para Editar Aula -->
    <v-dialog v-model="dialogEditarAula" max-width="500">
      <v-card>
        <v-card-title>
          <span class="text-h6">Editar Aula</span>
        </v-card-title>
        <v-card-text>
          <v-form ref="formEditar">
            <v-text-field
              v-model="aulaSeleccionada.aula_nombre"
              label="Nombre del Aula"
              required
            />
            <v-text-field
              v-model.number="aulaSeleccionada.aula_capacidad"
              label="Capacidad"
              type="number"
              required
            />
            <!-- v-select para mostrar "Activo" e "Inactivo", pero enviar "A" e "I" -->
            <v-select
              v-model="aulaSeleccionada.aula_estado"
              :items="estadoOptions"
              item-title="text"
              item-value="value"
              label="Estado"
              required
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="dialogEditarAula = false">Cancelar</v-btn>
          <v-btn color="primary" @click="actualizarAula">Guardar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { useDisplay } from 'vuetify'
import { useRouter } from 'vue-router'
import axios from 'axios'

/** Diálogos */
const dialogAgregarAula = ref(false)
const dialogEditarAula = ref(false)

/** Modelos para formularios */
const nuevaAula = ref({
  aula_nombre: '',
  aula_capacidad: null
})

const aulaSeleccionada = ref({
  aula_id: null,
  aula_nombre: '',
  aula_capacidad: null,
  aula_estado: ''
})

/** Opciones para estado: se muestran "Activo"/"Inactivo" y se envían "A"/"I" */
const estadoOptions = [
  { text: 'Activo', value: 'A' },
  { text: 'Inactivo', value: 'I' }
]

/** RESPONSIVIDAD **/
const { mdAndUp } = useDisplay()
const isDesktop = mdAndUp

/** ROUTER **/
const router = useRouter()

/** DATOS DE AULAS Y DETALLES **/
const allAulas = ref([])       // Datos obtenidos de wsListaAula
const allDetalles = ref([])    // Datos obtenidos de wsListaAulaDetalleAnioEscolar

/** PAGINACIÓN PARA AULAS **/
const currentAulaPage = ref(1)
const itemsPerAulaPage = ref(5)
const totalAulaPages = computed(() =>
  Math.ceil(allAulas.value.length / itemsPerAulaPage.value)
)
const paginatedAulas = computed(() => {
  const start = (currentAulaPage.value - 1) * itemsPerAulaPage.value
  return allAulas.value.slice(start, start + itemsPerAulaPage.value)
})

/** EXPAND / COLAPSAR: Solo una aula expandida a la vez **/
const expandedAulaId = ref(null)
function isExpanded(aulaId) {
  return expandedAulaId.value === aulaId
}
function toggleExpand(aulaId) {
  expandedAulaId.value = expandedAulaId.value === aulaId ? null : aulaId
}

/** ENCABEZADOS PARA LA TABLA DE DETALLES (versión desktop) **/
const detalleHeaders = [
  { title: 'Turno', key: 'turn_nombre' },
  { title: 'Nivel', key: 'nive_nombre' },
  { title: 'Grado', key: 'grad_nombre' },
  { title: 'Sección', key: 'secc_nombre' },
  { title: 'Tutor', key: 'tutor' },
  { title: 'Acción', key: 'accion', sortable: false }
]

/** PAGINACIÓN PARA DETALLES (por aula) **/
const itemsPerDetailPage = ref(3)
const detailPages = reactive({}) // Ejemplo: { 1: 1, 2: 1, ... }
function getDetalles(aulaId) {
  return allDetalles.value.filter(
    detalle => Number(detalle.aula_id) === Number(aulaId)
  )
}
function getPaginatedDetalles(aulaId) {
  const detalles = getDetalles(aulaId)
  if (detailPages[aulaId] === undefined) {
    detailPages[aulaId] = 1
  }
  const currentDetailPage = detailPages[aulaId]
  const start = (currentDetailPage - 1) * itemsPerDetailPage.value
  return detalles.slice(start, start + itemsPerDetailPage.value)
}
function getPaginatedDetallesTotal(aulaId) {
  const detalles = getDetalles(aulaId)
  return Math.ceil(detalles.length / itemsPerDetailPage.value)
}

/** Función para abrir el diálogo de agregar aula */
function abrirDialogAgregar() {
  nuevaAula.value.aula_nombre = ''
  nuevaAula.value.aula_capacidad = null
  dialogAgregarAula.value = true
}

/** Función para guardar el aula nueva usando el API wsRegistraAula.php con token bearer (POST) */
function guardarAula() {
  const token = localStorage.getItem("token")
  const profile = localStorage.getItem("profile")
  const baseUrl = 'https://amsoftsolution.com/amss/ws/wsRegistraAula.php'
  const data = {
    av_aula_nombre: nuevaAula.value.aula_nombre,
    ai_aula_capacidad: nuevaAula.value.aula_capacidad,
    av_profile: profile
  }
  const config = {
    headers: { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }
  axios
    .post(baseUrl, data, config)
    .then(response => {
      console.log('Aula agregada:', response.data)
      dialogAgregarAula.value = false
      fetchAulas()  // Refrescar la lista de aulas
    })
    .catch(error => {
      console.error('Error al agregar aula:', error)
    })
}

/** Función para abrir el diálogo de editar aula */
function abrirDialogEditar(aula) {
  aulaSeleccionada.value = { ...aula }
  dialogEditarAula.value = true
}

/** Función para actualizar el aula usando el API wsActualizaAula.php con token bearer (POST) */
function actualizarAula() {
  const token = localStorage.getItem("token")
  const profile = localStorage.getItem("profile")
  const baseUrl = 'https://amsoftsolution.com/amss/ws/wsActualizaAula.php'
  const data = {
    ai_aula_id: aulaSeleccionada.value.aula_id,
    av_aula_nombre: aulaSeleccionada.value.aula_nombre,
    ai_aula_capacidad: aulaSeleccionada.value.aula_capacidad,
    ac_aula_estado: aulaSeleccionada.value.aula_estado,
    av_profile: profile
  }
  const config = {
    headers: { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }
  axios
    .post(baseUrl, data, config)
    .then(response => {
      console.log('Aula actualizada:', response.data)
      dialogEditarAula.value = false
      fetchAulas()  // Refrescar la lista de aulas
    })
    .catch(error => {
      console.error('Error al actualizar aula:', error)
    })
}

function agregarDetalle(aula) {
  router.push({ name: 'AgregarDetalle', query: { aula: encodeURIComponent(JSON.stringify(aula)) } })
}
function editarDetalle(detalle) {
  router.push({ name: 'EditarDetalle', query: { detalle: encodeURIComponent(JSON.stringify(detalle)) } })
}
function actualizarHorario(detalle) {
  router.push({ name: 'ActualizarHorario', query: { detalle: encodeURIComponent(JSON.stringify(detalle)) } })
}
function agregarHorario(detalle) {
  router.push({ name: 'AgregarHorario', query: { detalle: encodeURIComponent(JSON.stringify(detalle)) } })
}

/** CONSULTA A LAS API **/
async function fetchAulas() {
  try {
    const token = localStorage.getItem("token")
    const profile = localStorage.getItem("profile") || "demo"
    if (!token || !profile) {
      console.warn("Falta token o profile en localStorage.")
      return
    }
    const baseUrl = "https://amsoftsolution.com/amss/ws/wsListaAula.php"
    const params = { av_profile: profile }
    const config = {
      params,
      headers: { Authorization: `Bearer ${token}` }
    }
    const response = await axios.get(baseUrl, config)
    if (response.data.status) {
      allAulas.value = response.data.data
    }
  } catch (error) {
    console.error("Error fetching aulas:", error)
  }
}

async function fetchDetalles() {
  try {
    const token = localStorage.getItem("token")
    const profile = localStorage.getItem("profile") || "demo"
    const ac_anio_escolar = localStorage.getItem("ac_anio_escolar") || 2025
    if (!token || !profile) {
      console.warn("Falta token o profile en localStorage.")
      return
    }
    const baseUrl = "https://amsoftsolution.com/amss/ws/wsListaAulaDetalleAnioEscolar.php"
    const params = { ac_anio_escolar, av_profile: profile }
    const config = {
      params,
      headers: { Authorization: `Bearer ${token}` }
    }
    const response = await axios.get(baseUrl, config)
    if (response.data.status) {
      allDetalles.value = response.data.data
    }
  } catch (error) {
    console.error("Error fetching detalles:", error)
  }
}

onMounted(() => {
  fetchAulas()
  fetchDetalles()
})
</script>

<style scoped>
.table-action {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
}
.expanded-row {
  background-color: #e0f7fa;
}
.expanded-card {
  background-color: #e0f7fa;
}
</style>
