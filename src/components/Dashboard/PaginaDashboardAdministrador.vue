<template>
  <v-container fluid>
    <!-- Título -->
    <v-row class="mb-4">
      <v-col cols="12">
        <h2 class="text-h5 font-weight-bold text-primary">📊 Dashboard de Administración Educativa</h2>
        <p class="text-body-2 text-grey-darken-1">
          Vista general de la gestión educativa: rendimiento, asistencia, finanzas y personal docente.
        </p>
      </v-col>
    </v-row>

    <!-- Filtros -->
    <v-row dense class="mb-4">
      <v-col cols="12" md="3" class="d-flex align-center">
        <v-icon class="mr-2" color="primary">mdi-calendar</v-icon>
        <span class="text-subtitle-2 font-weight-medium">Año escolar:</span>
        <span class="ml-1 text-body-2">{{ anioEscolar }}</span>
      </v-col>

      <v-col cols="12" md="3">
        <v-select
          v-model="filtros.periodo"
          :items="periodos"
          item-title="periodo"
          item-value="id"
          label="Periodo"
          @update:modelValue="onFiltroChange"
        />
      </v-col>
      
      <v-col cols="12" md="3">
        <v-select
          v-model="filtros.nivel"
          :items="niveles"
          item-title="nive_nombre"
          item-value="nive_id"
          label="Nivel"
         @update:modelValue="onFiltroChange"
        />
      </v-col>
      <v-col cols="12" md="3">
        <v-select
          v-model="filtros.grado"
          :items="gradosFiltrados"
          item-title="grad_nombre"
          item-value="grad_id"
          label="Grado"
          @update:modelValue="onFiltroChange"
        />
      </v-col>
    </v-row>

    <!-- Indicadores principales -->
    <v-row dense>
      <v-col cols="12" sm="6" md="3" v-for="(item, index) in kpis" :key="index">
        <v-card class="pa-4" elevation="2">
          <v-icon color="primary" size="32">{{ item.icon }}</v-icon>
          <div class="text-subtitle-1 font-weight-bold mt-2">{{ item.label }}</div>
          <div class="text-h6">{{ item.value }}</div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Sección de gráficos -->
    <v-row class="mt-6" dense>
      <!-- Gráfico de rendimiento promedio por nivel -->
      <v-col cols="12" md="6" class="d-flex">
        <v-card elevation="2" class="pa-4 fill-height" style="height: 300px; width: 100%;">
          <div class="text-subtitle-1 font-weight-medium mb-2">{{ tituloNotas }}</div>
          <bar-chart :data="chartNotasNivel" style="height: 100%;" />
        </v-card>
      </v-col>

      <!-- Gráfico horizontal de promedios por área educativa -->
      <v-col cols="12" md="6" class="d-flex">
        <v-card elevation="2" class="pa-4 fill-height" style="height: 300px; width: 100%;">
          <div class="text-subtitle-1 font-weight-medium mb-2">Top 10 promedios por Área Educativa</div>
          <bar-chart-horizontal
            :data="chartPromediosAreas"
            :options="{
              maintainAspectRatio: false,
              responsive: true,
              scales: {
                y: {
                  ticks: {
                    font: {
                      size: 12
                    }
                  }
                }
              }
            }"
            style="height: 100%;"
          />
        </v-card>
      </v-col>
    </v-row>

    <!-- Sección de gráficos -->
    <v-row class="mt-6" dense>
        <v-col cols="12" md="6">
          <v-card elevation="2" class="pa-4" style="height: 368px; width: 100%;">
            <div class="text-subtitle-1 font-weight-medium mb-2">% de notas de los alumnos según su calificación</div>
            <pie-chart :data="chartNotasPie" />
          </v-card>
        </v-col>
      <!-- Gráfico de incidencias vs CPB -->
      <v-col cols="12" md="6">
        <v-card elevation="2" class="pa-4">
          <div class="text-subtitle-1 font-weight-medium mb-2">Total incidencias vs casos potenciales de bullying</div>
          <line-chart
            :data="chartIncidencias"
            :options="{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    stepSize: 1,
                    precision: 0,
                    callback: function(value) {
                      return Number.isInteger(value) ? value : null;
                    }
                  }
                }
              }
            }"
          />
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-6" dense>
      <!-- Gráfico de asistencia -->
      <v-col cols="12" md="6">
        <v-card elevation="2" class="pa-4">
          <div class="text-subtitle-1 font-weight-medium mb-2">% asistencia mensual de alumnos</div>
          <bar-chart :data="chartAsistenciaAlumnos" />
        </v-card>
      </v-col>
      <!-- Gráfico de asistencia -->
      <v-col cols="12" md="6">
        <v-card elevation="2" class="pa-4">
          <div class="text-subtitle-1 font-weight-medium mb-2">% asistencia mensual de empleados</div>
          <bar-chart :data="chartAsistenciaEmpleados" />
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-6">
      <!-- Puntualidad en Pensiones -->
      <v-col cols="6">
        <v-card elevation="2" class="pa-4">
          <div class="text-subtitle-1 font-weight-medium mb-2">Top 10 Puntualidad de Pensiones</div>
          <v-data-table :headers="headersPuntuales" :items="puntuales" dense>
            <template v-slot:item.alumno="{ item }">
              <div class="d-flex align-center justify-space-between">
                <span class="text-left">{{ item.alumno }}</span>
                <v-tooltip location="left">
                  <template #activator="{ props }">
                    <v-icon small color="primary" v-bind="props">mdi-information</v-icon>
                  </template>
                  <div>
                    <div>Nivel: {{ item.nivel }}</div>
                    <div>Grado: {{ item.grado }}</div>
                  </div>
                </v-tooltip>
              </div>
            </template>


          </v-data-table>
        </v-card>
      </v-col>

      <!-- Morosidad en Pensiones -->
      <v-col cols="6">
        <v-card elevation="2" class="pa-4">
          <div class="text-subtitle-1 font-weight-medium mb-2">Top 10 Morosidad de Pensiones</div>

          <div v-if="$vuetify.display.smAndDown">
            <v-row dense>
              <v-col cols="12" v-for="item in topMorosos.slice(0, 5)" :key="item.alumno">
                <v-card outlined>
                  <v-card-text>
                    <div class="d-flex justify-space-between align-center mb-2">
                      <span class="d-flex align-center text-left">{{ item.alumno }}</span>
                      <v-tooltip location="left">
                        <template #activator="{ props }">
                          <v-icon small color="primary" v-bind="props">mdi-information</v-icon>
                        </template>
                        <div>
                          <div>Nivel: {{ item.nivel }}</div>
                          <div>Grado: {{ item.grado }}</div>
                        </div>
                      </v-tooltip>
                    </div>
                    <div><strong>Monto:</strong> {{ currency(item.monto_pendiente) }}</div>
                    <div><strong>Días:</strong> {{ item.dias_morosidad }}</div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </div>

          <v-data-table
            v-else
            :headers="headersTopMorosos"
            :items="topMorosos"
            :items-per-page="10"
            dense
          >
            <template v-slot:item.alumno="{ item }">
              <div class="d-flex align-center justify-space-between">
                <span class="text-left">{{ item.alumno }}</span>
                <v-tooltip location="right">
                  <template #activator="{ props }">
                    <v-icon small color="primary" class="ml-2" v-bind="props">mdi-information</v-icon>
                  </template>
                  <div>
                    <div>Nivel: {{ item.nivel }}</div>
                    <div>Grado: {{ item.grado }}</div>
                  </div>
                </v-tooltip>
              </div>
            </template>

            <template v-slot:item.monto_pendiente="{ item }">
              <v-chip color="red" dark>{{ currency(item.monto_pendiente) }}</v-chip>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>

  </v-container>
</template>

<script>
import BarChart from '@/components/charts/BarChart.vue';
import LineChart from '@/components/charts/LineChart.vue';
import BarChartHorizontal from '@/components/charts/BarChartHorizontal.vue';
import PieChart from '@/components/charts/PieChart.vue';
import { useLoadingStore } from '@/stores/loadingStore';

export default {
  name: 'DashboardAdministrador',
  components: { BarChart, LineChart, BarChartHorizontal, PieChart },
  data() {
  return {
      anioEscolar: localStorage.getItem('anio_escolar'),
      tituloNotas: 'Promedio de Notas por Nivel',
      filtros: {
        //periodo: '1er bimestre',
        nivel: 'Todos', // antes: null
        grado: 'Todos'  // opcional, para evitar errores similares
      },
      periodos: [],
      niveles: [],
      gradosFull: [],
      gradosFiltrados: [],
      kpis: [],
    //   kpis: [
    //   { label: 'Total de Alumnos', value: 100, icon: 'mdi-school' },
    //   { label: 'Total de Docentes', value: 12, icon: 'mdi-account-tie' },
    //   { label: 'Alumnos Aprobados', value: 80, icon: 'mdi-check-circle-outline' },
    //   { label: 'Promedio General', value: 15.3, icon: 'mdi-chart-line' },  
    //   { label: '% Asist. Alumnos', value: 75, icon: 'mdi-calendar-check-outline' },
    //   { label: '% Asist. Empleados', value: 95, icon: 'mdi-calendar-account' },    
    //   { label: 'Total Morosidad', value: 153, icon: 'mdi-cash-remove' },
    //   { label: 'Total Incidencias', value: 153, icon: 'mdi-alert-circle-outline' }
    // ],

      chartNotasNivel: {
        labels: [],
        datasets: []
      },
       chartAsistenciaAlumnos: {
        labels: [],
        datasets: []
      },
       chartAsistenciaEmpleados: {
        labels: [],
        datasets: []
      },
      chartPromediosAreas: {
        labels: [],
        datasets: []
      },
      chartAsistencia: {
        labels: ['Mar', 'Abr', 'May', 'Jun'],
        datasets: [
          // Alumnos
          { label: 'Entrada - Alumnos', data: [90, 88, 91, 89], backgroundColor: '#4caf50', stack: 'Alumnos' },
          { label: 'Tardanza - Alumnos', data: [2, 4, 3, 5], backgroundColor: '#ff9800', stack: 'Alumnos' },
          { label: 'Salida Anticipada - Alumnos', data: [1, 2, 2, 1], backgroundColor: '#f44336', stack: 'Alumnos' },
          { label: 'Salida - Alumnos', data: [7, 6, 4, 5], backgroundColor: '#2196f3', stack: 'Alumnos' },

          // Empleados
          { label: 'Entrada - Empleados', data: [95, 94, 96, 97], backgroundColor: '#81c784', stack: 'Empleados' },
          { label: 'Tardanza - Empleados', data: [2, 3, 1, 2], backgroundColor: '#ffb74d', stack: 'Empleados' },
          { label: 'Salida Anticipada - Empleados', data: [1, 2, 3, 1], backgroundColor: '#e57373', stack: 'Empleados' },
          { label: 'Salida - Empleados', data: [2, 1, 0, 1], backgroundColor: '#64b5f6', stack: 'Empleados' }
        ]
      },
      chartNotasPie: {
        labels: [],
        datasets: []
      },
      chartIncidencias: {
        labels: [],
        datasets: []
      },
      headersPuntuales: [
        { title: 'Alumno', key: 'alumno', align: 'start' }
      ],
      puntuales: [],
      headersMorosos: [
        { title: 'Alumno', key: 'alumno', align: 'start' },
        { title: 'Monto Pendiente', key: 'monto_pendiente' }
      ],
      topMorosos: [],
        headersTopMorosos: [
          { title: 'Alumno', key: 'alumno', align: 'start' },
          { title: 'Monto Pendiente', key: 'monto_pendiente' }
        ],
    };
  },
  async mounted() {
    const loadingStore = useLoadingStore();
    loadingStore.mostrarLoading();
    await  this.obtenerPeriodosEducativos();
    await  this.obtenerFiltrosAlumno();
    loadingStore.ocultarLoading();
    this.actualizarDashboard();
  },
  watch: {
    filtros: {
      handler() {
        if (this.filtros.periodo && this.filtros.nivel && this.filtros.grado) {
          this.actualizarDashboard();
        }
      },
      deep: true
    }
  },
  methods: {
    async obtenerTop10PuntualesPensiones() {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`https://amsoftsolution.com/amss/ws/wsDashboardTop10PuntualidadPensiones.php?aepe_id=${this.filtros.periodo}&nive_id=${this.filtros.nivel}&grad_id=${this.filtros.grado}&av_profile=demo`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const json = await res.json();

        if (json.status) {
          this.puntuales = json.data;
        } else {
          this.puntuales = [];
          console.warn('No se obtuvo puntualidad:', json.message);
        }
      } catch (err) {
        console.error('Error al obtener puntualidad:', err);
      }
    },
    async obtenerTop10MorosidadPensiones() {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`https://amsoftsolution.com/amss/ws/wsDashboardTop10MorodidadPensiones.php?aepe_id=${this.filtros.periodo}&nive_id=${this.filtros.nivel}&grad_id=${this.filtros.grado}&av_profile=demo`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const json = await res.json();

        if (json.status) {
          this.topMorosos = json.data;
        } else {
          this.topMorosos = [];
          console.warn('No se obtuvo morosidad:', json.message);
        }
      } catch (err) {
        console.error('Error al obtener morosidad:', err);
      }
    },
    colorEstado(estado) {
      const colores = {
        'Entrada': '#4caf50',
        'Tardanza': '#ff9800',
        'Salida anticipada': '#f44336',
        'Salida': '#2196f3',
        'Inasistencia': '#9e9e9e'
      };
      return colores[estado] || '#607d8b'; // color por defecto
    },
    async obtenerAsistenciaMensualAlumnos() {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`https://amsoftsolution.com/amss/ws/wsDashboardPorcentajeAsistenciaEstadoMensualAlumnos.php?aepe_id=${this.filtros.periodo}&nive_id=${this.filtros.nivel}&grad_id=${this.filtros.grado}&av_profile=demo`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const json = await res.json();

        if (json.status && Array.isArray(json.data)) {
          const estados = [...new Set(json.data.map(d => d.estado))];
          const meses = [...new Set(json.data.map(d => d.mes))];

          const datasets = estados.map(estado => {
            return {
              label: estado,
              data: meses.map(mes => {
                const found = json.data.find(d => d.estado === estado && d.mes === mes);
                return found ? parseFloat(found.porcentaje) : 0;
              }),
              backgroundColor: this.colorEstado(estado)
            };
          });

          this.chartAsistenciaAlumnos = {
            labels: meses,
            datasets
          };
        }
      } catch (error) {
        console.error('Error al obtener asistencia mensual alumnos:', error);
      }
    },
    async obtenerAsistenciaMensualDocentes() {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`https://amsoftsolution.com/amss/ws/wsDashboardPorcentajeAsistenciaEstadoMensualDocentes.php?aepe_id=${this.filtros.periodo}&nive_id=${this.filtros.nivel}&grad_id=${this.filtros.grado}&av_profile=demo`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const json = await res.json();

        if (json.status && Array.isArray(json.data)) {
          const estados = [...new Set(json.data.map(d => d.estado))];
          const meses = [...new Set(json.data.map(d => d.mes))];

          const datasets = estados.map(estado => {
            return {
              label: estado,
              data: meses.map(mes => {
                const found = json.data.find(d => d.estado === estado && d.mes === mes);
                return found ? parseFloat(found.porcentaje) : 0;
              }),
              backgroundColor: this.colorEstado(estado)
            };
          });

          this.chartAsistenciaEmpleados = {
            labels: meses,
            datasets
          };
        }
      } catch (error) {
        console.error('Error al obtener asistencia mensual empleados:', error);
      }
    },
    async obtenerIncidenciasVsCpb() {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`https://amsoftsolution.com/amss/ws/wsDashboardIncidenciasCpbPorMes.php?aepe_id=${this.filtros.periodo}&nive_id=${this.filtros.nivel}&grad_id=${this.filtros.grado}&av_profile=demo`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const json = await res.json();

        if (json.status && Array.isArray(json.data)) {
          const labels = json.data.map(item => item.nombre_mes);
          const incidencias = json.data.map(item => parseInt(item.total_incidencias));
          const bullying = json.data.map(item => parseInt(item.total_bullying));

          this.chartIncidencias = {
            labels,
            datasets: [
              { label: 'Incidencias', data: incidencias, borderColor: '#4caf50' },
              { label: 'Casos potenciales de bullying', data: bullying, borderColor: '#ff9800' }
            ]
          };
        } else {
          this.chartIncidencias = {
            labels: [],
            datasets: []
          };
          console.warn('No se obtuvieron datos de incidencias vs bullying:', json.message);
        }
      } catch (error) {
        console.error('Error al obtener datos de incidencias vs bullying:', error);
      }
    },
    async obtenerPorcentajeNotasPorLetra() {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`https://amsoftsolution.com/amss/ws/wsDashboardPromedioPorcentajeLetra.php?aepe_id=${this.filtros.periodo}&nive_id=${this.filtros.nivel}&grad_id=${this.filtros.grado}&av_profile=demo`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const json = await res.json();

        if (json.status && Array.isArray(json.data)) {
          const labels = json.data.map(item => item.letra);
          const data = json.data.map(item => parseFloat(item.porcentaje));

          this.chartNotasPie = {
            labels,
            datasets: [{
              label: '% de notas',
              data,
              backgroundColor: ['#4caf50', '#2196f3', '#ffeb3b', '#f44336', '#9c27b0', '#00bcd4']
            }]
          };
        } else {
          this.chartNotasPie = {
            labels: [],
            datasets: []
          };
          console.warn('No se obtuvieron datos de % de notas por letra:', json.message);
        }
      } catch (error) {
        console.error('Error al obtener % de notas por letra:', error);
      }
    },
    async obtenerPromediosPorAreaEducativa() {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`https://amsoftsolution.com/amss/ws/wsDashboardPromedioNotasAreaEducativa.php?aepe_id=${this.filtros.periodo}&nive_id=${this.filtros.nivel}&grad_id=${this.filtros.grado}&av_profile=demo`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const json = await res.json();

        if (json.status && Array.isArray(json.data)) {
          const labels = json.data.map(item => item.area_educativa);
          const data = json.data.map(item => parseFloat(item.promedio));
          this.chartPromediosAreas = {
            labels,
            datasets: [{
              label: 'Promedio',
              data,
              backgroundColor: ['#4caf50']
            }]
          };
        } else {
          this.chartPromediosAreas = {
            labels: [],
            datasets: []
          };
          console.warn('No se obtuvo promedio por área educativa:', json.message);
        }
      } catch (error) {
        console.error('Error al obtener promedio por área educativa:', error);
      }
    },
    async obtenerPromediosPorSeccion() {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`https://amsoftsolution.com/amss/ws/wsDashboardPromedioNotasSeccion.php?aepe_id=${this.filtros.periodo}&nive_id=${this.filtros.nivel}&grad_id=${this.filtros.grado}&av_profile=demo`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const json = await res.json();

        if (json.status && Array.isArray(json.data)) {
          const labels = json.data.map(item => item.seccion);
          const data = json.data.map(item => parseFloat(item.promedio));
          this.chartNotasNivel = {
            labels,
            datasets: [{
              label: 'Promedio',
              data,
              backgroundColor: '#1976d2'
            }]
          };
        } else {
          this.chartNotasNivel = {
            labels: [],
            datasets: []
          };
          console.warn('No se obtuvo promedio por sección:', json.message);
        }
      } catch (err) {
        console.error('Error al obtener promedio por sección:', err);
      }
    },
    async obtenerPromediosPorGrado() {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`https://amsoftsolution.com/amss/ws/wsDashboardPromedioNotasGrado.php?aepe_id=${this.filtros.periodo}&nive_id=${this.filtros.nivel}&av_profile=demo`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const json = await res.json();

        if (json.status && Array.isArray(json.data)) {
          const labels = json.data.map(item => item.grado);
          const data = json.data.map(item => parseFloat(item.promedio));
          this.chartNotasNivel = {
            labels,
            datasets: [{
              label: 'Promedio',
              data,
              backgroundColor: '#1976d2'
            }]
          };
        } else {
          this.chartNotasNivel = {
            labels: [],
            datasets: []
          };
          console.warn('No se obtuvo promedio por grado:', json.message);
        }
      } catch (err) {
        console.error('Error al obtener promedios por grado:', err);
      }
    },
    async obtenerPromediosPorNivel() {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`https://amsoftsolution.com/amss/ws/wsDashboardPromedioNotasNivel.php?aepe_id=${this.filtros.periodo}&av_profile=demo`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const json = await res.json();

        if (json.status && Array.isArray(json.data)) {
          const labels = json.data.map(item => item.nivel);
          const data = json.data.map(item => parseFloat(item.promedio));
          this.chartNotasNivel = {
            labels,
            datasets: [{
              label: 'Promedio',
              data,
              backgroundColor: '#1976d2'
            }]
          };
        } else {
          this.chartNotasNivel = {
            labels: [],
            datasets: []
          };
          console.warn('No se obtuvo promedio por nivel:', json.message);
        }
      } catch (error) {
        console.error('Error al obtener promedios por nivel:', error);
      }
    },
    onFiltroChange() {
      console.log('Nivel seleccionado:', this.filtros.nivel);
      this.$nextTick(() => {
        const nivel = String(this.filtros.nivel); // aseguras comparación de strings

        if (nivel === 'T') {
          this.gradosFiltrados = [{ grad_id: '0', grad_nombre: 'Todos' }];
        } else {
          console.log('Filtrando grados para nive_id =', nivel);
          this.gradosFiltrados = [
            { grad_id: '0', grad_nombre: 'Todos' },
            ...this.gradosFull.filter(g => String(g.nive_id) === nivel)
          ];
        }

        const gradoExiste = this.gradosFiltrados.some(g => g.grad_id === this.filtros.grado);
        this.filtros.grado = gradoExiste ? this.filtros.grado : '0';
        console.log('Grados filtrados:', this.gradosFiltrados);
        if (this.filtros.periodo && this.filtros.nivel && this.filtros.grado) {
          this.actualizarDashboard();
        }
      });
    },
    async obtenerKPIs() {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`https://amsoftsolution.com/amss/ws/wsDashboardKPIsAdministrador.php?aepe_id=${this.filtros.periodo}&nive_id=${this.filtros.nivel}&grad_id=${this.filtros.grado}&av_profile=demo`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const json = await res.json();
        if (json.status) {
          const d = json.data;
          this.kpis = [
            { label: 'Total de Alumnos', value: d.total_alumnos, icon: 'mdi-school' },
            { label: 'Total de Docentes', value: d.total_docentes, icon: 'mdi-account-tie' },
            { label: 'Alumnos Aprobados', value: d.alumnos_aprobados, icon: 'mdi-check-circle-outline' },
            { label: 'Promedio General', value: d.promedio_general, icon: 'mdi-chart-line' },
            { label: '% Asist. Alumnos', value: d.asistencia_alumnos, icon: 'mdi-calendar-check-outline' },
            { label: '% Asist. Empleados', value: d.asistencia_empleados, icon: 'mdi-calendar-account' },
            { label: 'Total Morosidad', value: d.total_morosidad, icon: 'mdi-cash-remove' },
            { label: 'Total Incidencias', value: d.total_incidencias, icon: 'mdi-alert-circle-outline' }
          ];
        } else {
          console.warn('No se obtuvieron KPIs:', json.message);
        }
      } catch (err) {
        console.error('Error al obtener KPIs:', err);
      }
    },
    async obtenerFiltrosAlumno() {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('https://amsoftsolution.com/amss/ws/wsConsultaFiltrosAlumno.php?av_profile=demo', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const json = await res.json();
        if (json.status) {
          // Niveles con "Todos"
          this.niveles = [{ nive_id: 'T', nive_nombre: 'Todos' }, ...json.data.niveles];
          // Guardamos todos los grados
          this.gradosFull = json.data.grados;
          console.log('Grados completos:', this.gradosFull.map(g => ({ grad: g.grad_nombre, nive: g.nive_id })));
          // Inicialmente solo "Todos"
          this.gradosFiltrados = [{ grad_id: '0', grad_nombre: 'Todos' }];
          // Valores por defecto
          this.filtros.nivel = 'T';
          this.filtros.grado = '0';
        }
      } catch (err) {
        console.error('Error en filtros alumno:', err);
      }
    },
    async obtenerPeriodosEducativos() {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('https://amsoftsolution.com/amss/ws/wsListaPeriodoEducativo.php?av_profile=demo', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (data.status && Array.isArray(data.data)) {
          const periodosAPI = data.data.map(p => ({
            id: p.id,
            periodo: p.periodo,
            estado: p.estado
          }));

          // Agrega opción "Todos"
          this.periodos = [{ id: '0', periodo: 'Todos' }, ...periodosAPI];

          // Selecciona automáticamente el periodo activo (estado === 'A'), si existe
          const activo = periodosAPI.find(p => p.estado === 'A');
          this.filtros.periodo = activo ? activo.id : '0';
        }
      } catch (err) {
        console.error('Error al obtener periodos:', err);
      }
    },
    currency(val) {
      return `S/ ${parseFloat(val).toFixed(2)}`;
    },
    async actualizarDashboard() {
      const loadingStore = useLoadingStore();
      loadingStore.mostrarLoading();

      try {
        // ✅ Siempre actualiza los KPIs
        await this.obtenerKPIs();

        if (!this.gradosFiltrados.map(g => g.grad_id).includes(this.filtros.grado)) {
          this.filtros.grado = '0';
        }

        // Actualiza título y gráfico según nivel
        if (this.filtros.nivel === 'T') {
          this.tituloNotas = 'Promedio de Notas por Nivel';
          await this.obtenerPromediosPorNivel();
        } else if (this.filtros.grado === '0') {
            this.tituloNotas = 'Promedio de Notas por Grado';
            await this.obtenerPromediosPorGrado();
            } else {
              this.tituloNotas = `Promedio de Notas por sección`;
              await this.obtenerPromediosPorSeccion();
            }
        await Promise.all([
          // Actualiza promedios por área educativa
          this.obtenerPromediosPorAreaEducativa(),
          // Actualiza Porcentaje de notas por letra
          this.obtenerPorcentajeNotasPorLetra(),
          // Actuliza cantidades por mes de incidencias vs bullying
          this.obtenerIncidenciasVsCpb(),
          // Actualiza asistencia mensual de alumnos y docentes
          this.obtenerAsistenciaMensualAlumnos(),
          this.obtenerAsistenciaMensualDocentes(),
          // Actualiza los top 10 de puntualidad en pensiones
          this.obtenerTop10PuntualesPensiones(),
          // Actualiza los top 10 de morosidad en pensiones
          this.obtenerTop10MorosidadPensiones()
      ]);
      } catch (error) {
        console.error('Error al actualizar dashboard:', error);
      } finally {
        loadingStore.ocultarLoading();
      }
    }
  }
}
</script>

<style scoped>
.text-subtitle-1 {
  color: #424242;
}
</style>
