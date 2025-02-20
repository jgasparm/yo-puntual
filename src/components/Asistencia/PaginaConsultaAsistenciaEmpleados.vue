<template>
  <v-container>
    <template v-if="isDesktop">
      <v-card class="pa-2 mb-2">
        <v-row dense align="center">
          <v-col cols="3">
            <v-select
              label="Área"
              :items="areas"
              v-model="filtros.area"
              item-title="area_descripcion"
              item-value="area_id"
              dense
              outlined
              solo
              hide-no-data
            />
          </v-col>
          <v-col cols="3">
            <v-autocomplete
              label="Empleado"
              :items="empleados"
              v-model="filtros.empleado"
              :item-title="itemTitle"
              item-value="pers_id"
              return-object
              dense
              outlined
              clearable
              solo
              hide-no-data
            />
          </v-col>
          <v-col cols="2">
            <v-dialog v-model="menuFechaInicio" persistent max-width="320">
              <template #activator="{ props }">
                <v-text-field
                  v-bind="props"
                  label="Fecha Inicial"
                  v-model="filtros.fechaInicio"
                  prepend-icon="mdi-calendar"
                  dense
                  outlined
                  readonly
                />
              </template>
              <v-card>
                <v-card-title class="text-subtitle-2 font-weight-bold">
                  Seleccionar Fecha
                </v-card-title>
                <v-date-picker
                  v-model="fechaInicioObjeto"
                  locale="es"
                  color="primary"
                  first-day-of-week="1"
                  hide-header
                />
                <v-card-actions class="d-flex justify-end">
                  <v-btn text @click="menuFechaInicio = false">Cancelar</v-btn>
                  <v-btn color="primary" @click="actualizarFechaInicio">Aceptar</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </v-col>
          <v-col cols="2">
            <v-dialog v-model="menuFechaFinal" persistent max-width="320">
              <template #activator="{ props }">
                <v-text-field
                  v-bind="props"
                  label="Fecha Final"
                  v-model="filtros.fechaFinal"
                  prepend-icon="mdi-calendar"
                  dense
                  outlined
                  readonly
                />
              </template>
              <v-card>
                <v-card-title class="text-subtitle-2 font-weight-bold">
                  Seleccionar Fecha
                </v-card-title>
                <v-date-picker
                  v-model="fechaFinalObjeto"
                  locale="es"
                  color="primary"
                  first-day-of-week="1"
                  hide-header
                />
                <v-card-actions class="d-flex justify-end">
                  <v-btn text @click="menuFechaFinal = false">Cancelar</v-btn>
                  <v-btn color="primary" @click="actualizarFechaFinal">Aceptar</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </v-col>
          <v-col cols="2" class="d-flex justify-end">
            <v-btn color="primary" small @click="consultarAsistencia">
              <v-icon left size="18">mdi-magnify</v-icon>
              Consultar
            </v-btn>
          </v-col>
        </v-row>
      </v-card>
    </template>
    
    <!-- Filtros Mobile (manteniendo el diseño actual) -->
    <template v-else>
      <!-- (Aquí se mantiene el bloque de filtros original para mobile) -->
      <v-card class="pa-2 mb-2">
        <v-card-title class="text-subtitle-3 font-weight-bold">
          <v-icon left size="18">mdi-domain</v-icon>
          Áreas
        </v-card-title>
        <v-card-text>
          <v-row dense>
            <v-col cols="12" md="6">
              <v-select
                label="Área"
                :items="areas"
                v-model="filtros.area"
                item-title="area_descripcion"
                item-value="area_id"
                dense
                outlined
                solo
                hide-no-data
              />
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
      <v-row dense>
        <v-col cols="12" md="6">
          <v-card class="pa-2">
            <v-card-title class="text-subtitle-3 font-weight-bold">
              <v-icon left size="18">mdi-account</v-icon>
              Empleado
            </v-card-title>
            <v-card-text>
              <v-autocomplete
                v-if="empleados.length"
                label="Empleado"
                :items="empleados"
                v-model="filtros.empleado"
                :item-title="itemTitle"
                item-value="pers_id"
                return-object
                dense
                outlined
                clearable
                solo
                hide-no-data
              />
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="6">
          <v-card class="pa-2">
            <v-card-title class="text-subtitle-3 font-weight-bold">
              <v-icon left size="18">mdi-calendar</v-icon>
              Rango de Fechas
            </v-card-title>
            <v-card-text>
              <v-row dense>
                <v-col cols="12" md="6">
                  <v-dialog v-model="menuFechaInicio" persistent max-width="320">
                    <template #activator="{ props }">
                      <v-text-field
                        v-bind="props"
                        label="Fecha inicial"
                        v-model="filtros.fechaInicio"
                        prepend-icon="mdi-calendar"
                        dense
                        outlined
                        readonly
                      />
                    </template>
                    <v-card>
                      <v-card-title class="text-subtitle-2 font-weight-bold">
                        Seleccionar Fecha
                      </v-card-title>
                      <v-date-picker
                        v-model="fechaInicioObjeto"
                        locale="es"
                        color="primary"
                        first-day-of-week="1"
                        hide-header
                      />
                      <v-card-actions class="d-flex justify-end">
                        <v-btn text @click="menuFechaInicio = false">Cancelar</v-btn>
                        <v-btn color="primary" @click="actualizarFechaInicio">Aceptar</v-btn>
                      </v-card-actions>
                    </v-card>
                  </v-dialog>
                </v-col>
                <v-col cols="12" md="6">
                  <v-dialog v-model="menuFechaFinal" persistent max-width="320">
                    <template #activator="{ props }">
                      <v-text-field
                        v-bind="props"
                        label="Fecha final"
                        v-model="filtros.fechaFinal"
                        prepend-icon="mdi-calendar"
                        dense
                        outlined
                        readonly
                      />
                    </template>
                    <v-card>
                      <v-card-title class="text-subtitle-2 font-weight-bold">
                        Seleccionar Fecha
                      </v-card-title>
                      <v-date-picker
                        v-model="fechaFinalObjeto"
                        locale="es"
                        color="primary"
                        first-day-of-week="1"
                        hide-header
                      />
                      <v-card-actions class="d-flex justify-end">
                        <v-btn text @click="menuFechaFinal = false">Cancelar</v-btn>
                        <v-btn color="primary" @click="actualizarFechaFinal">Aceptar</v-btn>
                      </v-card-actions>
                    </v-card>
                  </v-dialog>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" class="d-flex justify-end">
          <v-btn color="primary" small @click="consultarAsistencia">
            <v-icon left size="18">mdi-magnify</v-icon>
            Consultar
          </v-btn>
        </v-col>
      </v-row>
    </template>

    <!-- Resultados -->
    <v-card class="pa-2 mt-3 rounded-lg elevation-2">
      <v-card-title class="text-subtitle-3 font-weight-bold d-flex align-center">
        <!--<v-icon left size="18">mdi-table</v-icon>-->
        Resultados de la Consulta
      </v-card-title>
      <v-divider></v-divider>
      <v-card-text>
        <!-- Vista para pantallas grandes: tabla -->
        <div v-if="isDesktop">
          <v-data-table
            :headers="headers"
            :items="resultados"
            class="elevation-2 bg-light-blue-lighten-5"
            no-data-text="No hay resultados disponibles"
            :loading="loading"
          >
          <template v-slot:progress>
            <v-progress-linear indeterminate color="primary"></v-progress-linear>
          </template>

            <template v-slot:header="{ headers }">
              <tr>
                <th
                  v-for="header in headers"
                  :key="header.key"
                  class="text-center"
                  @click="header.sort"
                  style="cursor: pointer;"
                >
                  {{ header.title }}
                  <v-icon small v-if="header.isSorted">
                    {{ header.isSortedDesc ? 'mdi-arrow-down' : 'mdi-arrow-up' }}
                  </v-icon>
                </th>
              </tr>
            </template>
            <template v-slot:item="{ item }">
              <tr>
                <td class="text-left">{{ item.empleado }}</td>
                <td class="text-center">{{ item.fecha }}</td>
                <td class="text-center">{{ item.hora }}</td>
                <td class="text-center">
                  <v-chip :color="estadoColor(item.estado)" dark>
                    {{ item.estado }}
                  </v-chip>
                </td>
                <td class="text-center">{{ item.area }}</td>
              </tr>
            </template>
          </v-data-table>
        </div>
        <!-- Vista para mobile: tarjetas -->
        <div v-else>
          <v-alert v-if="!resultados.length && !loading" type="info">
            No hay resultados disponibles
          </v-alert>

        <!-- 🔹 Overlay para bloquear la vista mientras carga -->
          <v-overlay v-if="loading" absolute class="d-flex align-center justify-center">
            <v-progress-circular indeterminate size="64" color="primary"></v-progress-circular>
          </v-overlay>

          <v-row v-else dense>
            <v-col
              v-for="(item, index) in paginatedResultados"
              :key="index"
              cols="12"
              class="mb-2"
            >
              <v-card outlined>
                <v-card-title class="subtitle-2 font-weight-bold text-start">
                  {{ item.empleado }}
                </v-card-title>
                <v-card-text class="text-start">
                  <v-row dense>
                    <v-col cols="12">
                      <strong>Fecha:</strong> {{ item.fecha }}
                    </v-col>
                    <v-col cols="12">
                      <strong>Hora:</strong> {{ item.hora }}
                    </v-col>
                    <v-col cols="12">
                      <strong>Estado:</strong>
                      <v-chip :color="estadoColor(item.estado)" dark small>
                        {{ item.estado }}
                      </v-chip>
                    </v-col>
                    <v-col cols="12">
                      <strong>Área:</strong> {{ item.area }}
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <!-- Paginación personalizada para mobile -->
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
      </v-card-text>
      <v-card-actions v-if="resultados.length">
        <v-spacer></v-spacer>
        <v-btn color="success" small @click="exportarCSV">
          <v-icon left>mdi-file-export</v-icon>
          Exportar CSV
        </v-btn>
      </v-card-actions>
    </v-card>

    <!-- Modal de "No se encontraron resultados" -->
    <v-dialog v-model="dialogNoResults" max-width="400">
      <v-card>
        <v-card-title class="headline">No se encontraron resultados</v-card-title>
        <v-card-text>
          La consulta no arrojó resultados. Por favor, ajuste los filtros e intente nuevamente.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="dialogNoResults = false">Aceptar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import axios from "axios";
import { useDisplay } from "vuetify";
export default {
  name: "PaginaConsultaAsistenciaEmpleados",
  // Uso de la API de composición para detectar el tamaño de pantalla
  setup() {
    const { mdAndUp } = useDisplay();
    return { isDesktop: mdAndUp };
  },
  data() {
    return {
      filtros: {
        area: 0,
        empleado: 0,
        fechaInicio: this.formatearFecha(new Date()),
        fechaFinal: this.formatearFecha(new Date()),
      },
      areasAll: [],
      empleadosAll: [],
      areas: [],
      empleados: [],
      menuFechaInicio: false,
      menuFechaFinal: false,
      fechaInicioObjeto: new Date(),
      fechaFinalObjeto: new Date(),
      resultados: [],
      currentPage: 1,
      itemsPerPage: 5,
      headers: [
        { title: "Empleado", key: "empleado", align: "center", sortable: true },
        { title: "Fecha", key: "fecha", align: "center", sortable: true },
        { title: "Hora", key: "hora", align: "center", sortable: true },
        { title: "Estado", key: "estado", align: "center", sortable: true },
        { title: "Área", key: "area", align: "center", sortable: true },
      ],
      loading: false,
      dialogNoResults: false,
    };
  },
  
  computed: {
    paginatedResultados() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      return this.resultados.slice(start, start + this.itemsPerPage);
    },
    paginatedPages() {
      return Math.ceil(this.resultados.length / this.itemsPerPage);
    }
  },
  mounted() {
    const token = localStorage.getItem("token");
    const profile = localStorage.getItem("profile");
    if (!token || !profile) {
      console.warn("Falta token o profile en localStorage.");
      return;
    }
    this.cargarEmpleados(profile, token);
    this.cargarAreas(profile, token);
  },
  methods: {
    // Función que devuelve la descripción para el item-title del autocomplete de empleados
    itemTitle(item) {
      return item ? item.persona_descripcion : "";
    },
    async cargarAreas(profile, token) {
      try {
        const url = `https://amsoftsolution.com/amss/ws/wsConsultaAreas.php?ac_indicador_todos=S&av_profile=${profile}`;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.get(url, config);
        if (response.data.status) {
          const data = response.data.data;
          this.areasAll = data;
          this.areas = data;
          // this.areas = [{ area_id: 0, area_descripcion: "TODOS" }, ...this.areasAll];
          this.filtros.area = 0;
        } else {
          console.error("Error al obtener áreas:", response.data.message);
        }
      } catch (error) {
        console.error("Error en cargarAreas:", error);
      }
    },
    async cargarEmpleados(profile, token) {
      try {
        const url = `https://amsoftsolution.com/amss/ws/wsConsultaPersonas.php?ac_tipo_persona=E&ac_indicador_todos=S&av_profile=${profile}`;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.get(url, config);
        if (response.data.status) {
          const data = response.data.data;
          this.empleadosAll = data;
          this.empleados = this.empleadosAll;
          const todos = this.empleados.find(item => item.pers_id === 0);
          if (todos) {
            this.filtros.empleado = todos;
          }
        } else {
          console.error("Error al obtener empleados:", response.data.message);
        }
      } catch (error) {
        console.error("Error en cargarEmpleados:", error);
      }
    },
    formatearFecha(fecha) {
      return new Intl.DateTimeFormat("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(fecha);
    },
    toApiDate(dateString) {
      const [dia, mes, anio] = dateString.split("/");
      return `${anio}-${mes}-${dia}`;
    },
    async consultarAsistencia() {
      this.loading = true; 
      const profile = localStorage.getItem("profile");
      try {
        const fechaInicio = this.toApiDate(this.filtros.fechaInicio);
        const fechaFinal = this.toApiDate(this.filtros.fechaFinal);
        const baseUrl = "https://amsoftsolution.com/amss/ws/wsConsultaAsistenciaEmpleados.php";
        const params = {
          ai_area_id: this.filtros.area,
          ai_pers_id: this.filtros.empleado ? this.filtros.empleado.pers_id : 0,
          ai_hoes_id: 0,
          ac_fecha_inicial: fechaInicio,
          ac_fecha_final: fechaFinal,
          ac_tipo_registro: "T",
          ac_permiso: "T",
          ai_asju_id: 0,
          ac_aprobacion: "T",
          ai_asde_id: 0,
          av_profile: profile,
        };
        const token = localStorage.getItem("token");
        const configReq = {
          params,
          headers: { Authorization: `Bearer ${token}` },
        };
        const response = await axios.get(baseUrl, configReq);
        if (response.data.status) {
          if (Array.isArray(response.data.data)) {
            this.resultados = response.data.data.map(item => ({
              empleado: item.empleado_descripcion,
              fecha: item.fecha_asistencia,
              hora: item.hora_asistencia,
              estado: item.horario_estado_descripcion,
              area: item.area_descripcion
            }));
          } else {
            this.resultados = [];
            this.dialogNoResults = true;
          }
        } else {
          console.error("Error en la respuesta:", response.data.message);
          this.resultados = [];
          this.dialogNoResults = true;
        }
      } catch (error) {
        console.error("Error al consultar asistencia:", error);
        this.resultados = [];
      } finally {
        this.loading = false;
      }
    },
    exportarCSV() {
      const csvContent =
        "data:text/csv;charset=utf-8," +
        ["Empleado,Fecha,Estado,Área"]
          .concat(this.resultados.map(row => `${row.empleado},${row.fecha},${row.estado},${row.area}`))
          .join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "asistencia_empleados.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    estadoColor(estado) {
      if (estado.includes("ENTRADA") || estado.includes("SALIDA")) return "green";
      if (estado.includes("Tardanza")) return "orange";
      return "red";
    },
    actualizarFechaInicio() {
      this.filtros.fechaInicio = this.formatearFecha(this.fechaInicioObjeto);
      this.menuFechaInicio = false;
    },
    actualizarFechaFinal() {
      this.filtros.fechaFinal = this.formatearFecha(this.fechaFinalObjeto);
      this.menuFechaFinal = false;
    },
  },
};
</script>

<style scoped>
.my-overlay {
  z-index: 9999;
  background-color: rgba(255, 0, 0, 0.3);
}
</style>
