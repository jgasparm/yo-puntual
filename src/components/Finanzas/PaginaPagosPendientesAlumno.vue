<template>
  <v-container fluid>
    <!-- Cabecera -->
    <v-row class="mb-2">
      <v-col cols="12">
        <!-- Título -->
        <v-row class="mb-1">
          <v-col cols="12">
            <h1 class="text-h5 font-weight-bold mb-1">💰 Mis pagos pendientes</h1>
            <p class="text-subtitle-2">Consulta el estado de tus pagos pendientes.</p>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <!-- Listado: Desktop -->
    <div v-if="!isMobile">
      <v-data-table
        :headers="headersPagos"
        :items="pagosFiltrados"
        :items-per-page="10"
        class="elevation-1"
      >
        <template #item.fecha_vencimiento="{ item }">
          {{ formatFecha(item.fecha_vencimiento) }}
        </template>
        <template #item.estado="{ item }">
          <v-chip :color="getColorEstado(item.estado)" small>
            {{ item.estado }}
          </v-chip>
        </template>
        <template #item.actions="{ item }">
          <v-btn
            v-if="item.estado === 'Pendiente'"
            color="primary"
            size="small"
            @click="pagar(item)"
          >
            Pagar
          </v-btn>
        </template>
      </v-data-table>
    </div>

    <!-- Listado: Mobile -->
    <div v-else>
      <v-row>
        <v-col
          v-for="(item) in paginatedPagos"
          :key="item.id"
          cols="12"
        >
          <v-card class="mb-2">
            <v-card-title class="d-flex justify-space-between">
              <span>{{ item.nombre_servicio }}</span>
              <v-chip :color="getColorEstado(item.estado)" small>
                {{ item.estado }}
              </v-chip>
            </v-card-title>
            <v-card-subtitle>
              {{ item.Mes }} {{ item.Año }}
            </v-card-subtitle>
            <v-card-text>
              <div><strong>Vencimiento:</strong> {{ formatFecha(item.fecha_vencimiento) }}</div>
            </v-card-text>
            <v-card-actions v-if="item.estado === 'Pendiente'">
              <v-btn
                color="primary"
                block
                @click="pagar(item)"
              >
                Pagar ahora
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
      <v-pagination
        v-model="currentPage"
        :length="mobilePageCount"
        class="mt-4"
      />
    </div>

    <!-- Diálogo de confirmación de pago -->
    <v-dialog v-model="dialogPago" max-width="500px">
      <v-card>
        <v-card-title>Confirmar pago</v-card-title>
        <v-card-text>
          ¿Estás seguro que deseas realizar el pago de <strong>{{ pagoSeleccionado?.nombre_servicio }}</strong>
          correspondiente a <strong>{{ pagoSeleccionado?.Mes }} {{ pagoSeleccionado?.Año }}</strong>?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" text @click="dialogPago = false">Cancelar</v-btn>
          <v-btn color="primary" @click="confirmarPago">Confirmar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-overlay
      v-model="loading"
      class="d-flex flex-column justify-center align-center"
      persistent
      style="background-color: rgba(0, 0, 0, 0.4);"
    >
      <v-img src="/logo.webp" height="100" contain class="logo-spin mb-4" />
      <span class="text-h6 font-weight-medium">Procesando...</span>
    </v-overlay>
  </v-container>
</template>
  
<script>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

export default {
  name: 'PagosPage',
  setup() {
    const token = localStorage.getItem('token')
    const profile = localStorage.getItem('profile')
    const user_id = localStorage.getItem('usua_id') // Asumiendo que el ID del usuario está en localStorage

    // Configuración de axios
    const apiClient = axios.create({
      baseURL: 'https://amsoftsolution.com/amss/ws/',
      headers: { Authorization: `Bearer ${token}` }
    })

    // Datos reactivos
    const pagos = ref([])
    const loading = ref(false)
    const dialogPago = ref(false)
    const pagoSeleccionado = ref(null)
    const currentPage = ref(1)
    
    // Filtros
    const filtros = ref({
      anio: null,
      estado: null
    })

    // Opciones para selects
    const estadosPago = ref(['Pagado', 'Pendiente', 'Vencido'])
    
    // Headers para la tabla de desktop
    const headersPagos = [
      { title: 'Servicio', value: 'nombre_servicio' },
      { title: 'Año', value: 'Año' },
      { title: 'Mes', value: 'Mes' },
      { title: 'Vencimiento', value: 'fecha_vencimiento' },
      { title: 'Estado', value: 'estado' },
      { title: 'Acciones', value: 'actions', sortable: false }
    ]

    // Computed properties
    const isMobile = computed(() => window.innerWidth < 600)
    const itemsPerPageMobile = 5
    
    const pagosFiltrados = computed(() => {
      return pagos.value.filter(pago => {
        const cumpleAnio = !filtros.value.anio || pago.Año == filtros.value.anio
        const cumpleEstado = !filtros.value.estado || pago.estado === filtros.value.estado
        return cumpleAnio && cumpleEstado
      })
    })
    
    const aniosDisponibles = computed(() => {
      const anios = new Set()
      pagos.value.forEach(pago => anios.add(pago.Año))
      return Array.from(anios).sort((a, b) => b - a)
    })
    
    const paginatedPagos = computed(() => {
      if (isMobile.value) {
        const start = (currentPage.value - 1) * itemsPerPageMobile
        return pagosFiltrados.value.slice(start, start + itemsPerPageMobile)
      }
      return pagosFiltrados.value
    })
    
    const mobilePageCount = computed(() => {
      return Math.ceil(pagosFiltrados.value.length / itemsPerPageMobile)
    })

    // Métodos
    const formatFecha = (fecha) => {
      if (!fecha) return ''
      const date = new Date(fecha)
      return date.toLocaleDateString('es-PE')
    }
    
    const getColorEstado = (estado) => {
      switch (estado) {
        case 'Pagado': return 'green'
        case 'Pendiente': return 'orange'
        case 'Vencido': return 'red'
        default: return 'grey'
      }
    }
    
    const pagar = (pago) => {
      pagoSeleccionado.value = pago
      dialogPago.value = true
    }
    
    const confirmarPago = async () => {
      try {
        loading.value = true
        // Aquí iría la llamada al API para procesar el pago
        // Ejemplo: await apiClient.post('wsProcesarPago.php', { pago_id: pagoSeleccionado.value.id })
        
        // Simulamos una respuesta exitosa
        setTimeout(() => {
          // Actualizamos el estado del pago localmente
          const pagoIndex = pagos.value.findIndex(p => p.id === pagoSeleccionado.value.id)
          if (pagoIndex !== -1) {
            pagos.value[pagoIndex].estado = 'Pagado'
          }
          dialogPago.value = false
          loading.value = false
        }, 1500)
      } catch (error) {
        console.error('Error al procesar pago:', error)
        loading.value = false
      }
    }
    
    const cargarPagos = async () => {
      try {
        loading.value = true
        const response = await apiClient.get('wsConsultaPagosAlumno.php', {
          params: {
            ai_usua_id: user_id,
            av_profile: profile
          }
        })
        
        if (response.data.status) {
          pagos.value = response.data.data
        } else {
          console.error('Error al cargar pagos:', response.data.message)
        }
      } catch (error) {
        console.error('Error en la petición:', error)
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      cargarPagos()
    })

    return {
      pagos,
      pagosFiltrados,
      headersPagos,
      isMobile,
      currentPage,
      paginatedPagos,
      mobilePageCount,
      filtros,
      aniosDisponibles,
      estadosPago,
      formatFecha,
      getColorEstado,
      pagar,
      dialogPago,
      pagoSeleccionado,
      confirmarPago,
      loading
    }
  }
}
</script>
  
  <style>
    @keyframes flash {
      0% { background-color: #ffeaea; }
      100% { background-color: transparent; }
    }

    .v-input.v-input--error {
      animation: flash 1s ease-in-out;
    }
  </style>
  