<template>
  <v-container>
    <v-row class="mb-4">
      <v-col cols="12">
        <h2 class="text-h5 font-weight-bold text-primary">
          👨‍💼 Consulta de Asistencia de los Empleados
        </h2>
        <p class="text-body-2 text-grey-darken-1">
          Visualiza los registros de asistencia del trabajador para un rango de fechas específico.
        </p>
      </v-col>
    </v-row>

    <template v-if="isDesktop">
      <!-- Primera fila: Área + Cargo -->
      <v-row dense align="center" class="mb-4">
        <v-col cols="12" md="6">
          <v-select
            label="Área"
            :items="areas"
            v-model="filtros.area"
            item-title="area_descripcion"
            item-value="area_id"
            dense
            outlined
            hide-details
            clearable
          />
        </v-col>

        <v-col cols="12" md="6">
          <v-select
            label="Cargo"
            :items="cargos"
            v-model="filtros.cargo"
            item-title="emca_descripcion"
            return-object
            dense
            outlined
            hide-details
            clearable
          />
        </v-col>
      </v-row>

      <!-- Segunda fila: Empleado + Fechas + Botones -->
      <v-row dense align="center" class="mb-0">
        <!-- Filtro Empleado -->
        <v-col cols="12" md="4">
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
            hide-no-data
            :disabled="!empleados.length"
          />
        </v-col>

        <!-- Fecha Inicio -->
        <v-col cols="12" md="3" class="px-1">
          <v-dialog v-model="menuFechaInicio" persistent max-width="320">
            <template #activator="{ props }">
              <v-text-field
                v-bind="props"
                label="Fecha Inicio"
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

        <!-- Fecha Final -->
        <v-col cols="12" md="3" class="px-1">
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

        <!-- Botones: Consultar -->
        <v-col cols="12" md="2" class="d-flex justify-end">
          <v-btn color="primary" large class="mr-2" @click="consultarAsistencia">
            <v-icon left size="18">mdi-magnify</v-icon>
            Consultar
          </v-btn>
        </v-col>
      </v-row>
    </template>
    
    <!-- Filtros Mobile (manteniendo el diseño actual) -->
    <template v-else>
      <!-- Bloque para dispositivos móviles -->
      <v-card class="pa-2 mb-2">
        <v-card-title class="text-subtitle-3 font-weight-bold">
          <v-icon left size="18">mdi-domain</v-icon>
          Áreas y Cargos
        </v-card-title>
        <v-card-text>
          <v-row dense>
            <v-col cols="12">
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
                clearable
              />
            </v-col>
            <v-col cols="12">
              <v-select
                label="Cargo"
                :items="cargos"
                v-model="filtros.cargo"
                item-title="emca_descripcion"
                return-object
                dense
                outlined
                solo
                hide-no-data
                clearable
              />
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <v-card class="pa-2 mb-2">
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

      <v-card class="pa-2 mb-2">
        <v-card-title class="text-subtitle-3 font-weight-bold">
          <v-icon left size="18">mdi-calendar</v-icon>
          Rango de Fechas
        </v-card-title>
        <v-card-text>
          <v-row dense>
            <v-col cols="12" md="6" class="mb-2">
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
            <v-col cols="12" md="6" class="mb-2">
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

      <v-row dense class="mb-2">
        <v-col cols="12" class="d-flex justify-space-between">
          <v-btn color="primary" block @click="consultarAsistencia">
            <v-icon left size="18">mdi-magnify</v-icon>
            Consultar
          </v-btn>
        </v-col>
      </v-row>
    </template>
    <!-- ============================================= -->

    <!-- Resultados -->
    <v-card class="pa-2 mt-3 rounded-lg elevation-2">
      <v-card-title class="text-subtitle-3 font-weight-bold d-flex align-center">
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
                  :style="getColumnStyle(header.key)"
                  @click="header.sort"
                  style="cursor: pointer;"
                >
                  {{ header.title }}
                  <v-icon small v-if="header.isSorted">
                    {{ header.isSortedDesc ? "mdi-arrow-down" : "mdi-arrow-up" }}
                  </v-icon>
                </th>
              </tr>
            </template>
            <template v-slot:item="{ item }">
              <tr>
                <td :style="getColumnStyle('empleado')" class="text-left">
                  {{ item.empleado }}
                  <v-tooltip location="top">
                    <template #activator="{ props }">
                      <v-icon v-bind="props" size="18" class="ml-1 text-primary" style="cursor: help;">
                        mdi-information-outline
                      </v-icon>
                    </template>
                    <span>
                      Área: {{ item.area }}<br />
                      Cargo: {{ item.cargo }}
                    </span>
                  </v-tooltip>
                </td>
                <td :style="getColumnStyle('fecha')" class="text-center">{{ item.fecha }}</td>
                <td :style="getColumnStyle('entrada')" class="text-center">
                  <v-chip v-if="item.entrada" small color="green" dark>{{ item.entrada }}</v-chip>
                  <span v-else>-</span>
                </td>
                <td :style="getColumnStyle('tardanza')" class="text-center">
                  <v-chip v-if="item.tardanza" small color="orange" dark>{{ item.tardanza }}</v-chip>
                  <span v-else>-</span>
                </td>
                <td :style="getColumnStyle('salida_anticipada')" class="text-center">
                  <v-chip v-if="item.salida_anticipada" small color="red" dark>{{ item.salida_anticipada }}</v-chip>
                  <span v-else>-</span>
                </td>
                <td :style="getColumnStyle('salida')" class="text-center">
                  <v-chip v-if="item.salida" small color="green" dark>{{ item.salida }}</v-chip>
                  <span v-else>-</span>
                </td>
              </tr>
            </template>


          </v-data-table>
        </div>

        <!-- Vista para mobile: tarjetas -->
        <div v-else>
          <v-alert v-if="!resultados.length && !loading" type="info">
            No hay resultados disponibles
          </v-alert>

          <!-- Overlay para bloquear la vista mientras carga -->
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
                <v-card-title class="subtitle-2 font-weight-bold text-start" style="white-space: normal; word-break: break-word;">
                  {{ item.empleado }}
                </v-card-title>
                <v-card-text class="text-start">
                  <v-row dense>
                    <v-col cols="12">
                      <strong>Fecha:</strong> {{ item.fecha }}
                    </v-col>
                    <v-col cols="6" v-if="item.entrada">
                      <strong>Entrada:</strong>
                      <v-chip small color="green" dark>{{ item.entrada }}</v-chip>
                    </v-col>
                    <v-col cols="6" v-if="item.tardanza">
                      <strong>Tardanza:</strong>
                      <v-chip small color="orange" dark>{{ item.tardanza }}</v-chip>
                    </v-col>
                    <v-col cols="6" v-if="item.salida_anticipada">
                      <strong>Salida Ant.:</strong>
                      <v-chip small color="red" dark>{{ item.salida_anticipada }}</v-chip>
                    </v-col>
                    <v-col cols="6" v-if="item.salida">
                      <strong>Salida:</strong>
                      <v-chip small color="green" dark>{{ item.salida }}</v-chip>
                    </v-col>
                    <v-col cols="12">
                      <strong>Área:</strong> {{ item.area }}
                    </v-col>
                    <v-col cols="12">
                      <strong>Cargo:</strong> {{ item.cargo }}
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
        area: '0',
        empleado: '0',
        fechaInicio: this.formatearFecha(new Date()),
        fechaFinal: this.formatearFecha(new Date()),
      },
      areasAll: [],
      cargosAll: [],
      empleadosAll: [],
      areas: [],
      cargos: [],
      empleados: [],
      menuFechaInicio: false,
      menuFechaFinal: false,
      fechaInicioObjeto: new Date(),
      fechaFinalObjeto: new Date(),
      resultados: [],
      currentPage: 1,
      itemsPerPage: 5,
      headers: [
        { title: "Empleado", key: "empleado", align: "center" },
        { title: "Fecha", key: "fecha", align: "center" },
        { title: "Entrada", key: "entrada", align: "center" },
        { title: "Tardanza", key: "tardanza", align: "center" },
        { title: "Salida Anticipada", key: "salida_anticipada", align: "center" },
        { title: "Salida", key: "salida", align: "center" },
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
    this.cargarAreas(profile, token);
    this.cargarCargos(profile, token);
    this.cargarEmpleados(profile, token);
  },
  methods: {
    getColumnStyle(key) {
      const widths = {
        empleado: '50%',
        fecha: '20%',
        entrada: '7.5%',
        tardanza: '7.5%',
        salida_anticipada: '7.5%',
        salida: '7.5%',
      };
      return { width: widths[key] || 'auto' };
    },
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
          this.filtros.area = '0';
        } else {
          console.error("Error al obtener áreas:", response.data.message);
        }
      } catch (error) {
        console.error("Error en cargarAreas:", error);
      }
    },
    async cargarEmpleados(profile, token) {
      try {
        const url = `https://amsoftsolution.com/amss/ws/wsListaPersonas.php?ac_tipo_persona=E&ac_indicador_todos=S&av_profile=${profile}`;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.get(url, config);
        if (response.data.status) {
          const data = response.data.data;
          this.empleadosAll = data;
          this.empleados = this.empleadosAll;
          //this.filtros.empleados = 0;
           const todos = this.empleados.find(item => item.pers_id === '0');
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
    async cargarCargos(profile, token) {
      try {
        const url = `https://amsoftsolution.com/amss/ws/wsListaEmpleadoCargos.php?av_profile=${profile}`;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.get(url, config);
        if (response.data.status) {
          const data = response.data.data;     // suponemos que viene [{ emca_id, emca_descripcion }, …]
          this.cargosAll = data;
          // Añadimos un item “Todos” opcional al inicio con emca_id = '0'
          this.cargos = [{ emca_id: '0', emca_descripcion: 'TODOS' }, ...data];
          this.filtros.cargo = this.cargos[0]; // valor inicial = “Todos”
        } else {
          console.error("Error al obtener cargos:", response.data.message);
        }
      } catch (error) {
        console.error("Error en cargarCargos:", error);
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
          ai_emca_id: this.filtros.cargo.emca_id,
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

        if (response.data.status && Array.isArray(response.data.data)) {
          this.resultados = [];

          response.data.data.forEach(item => {
            const fila = {
              empleado: item.empleado_descripcion,
              fecha: item.fecha_asistencia,
              entrada: '',
              tardanza: '',
              salida_anticipada: '',
              salida: '',
              area: item.area_descripcion,
              cargo: item.cargo_descripcion
            };

            item.registros.forEach(reg => {
              const estado = reg.horario_estado_descripcion.toUpperCase();
              if (estado === 'ENTRADA') fila.entrada = reg.hora_asistencia;
              else if (estado === 'TARDANZA') fila.tardanza = reg.hora_asistencia;
              else if (estado === 'SALIDA ANTICIPADA') fila.salida_anticipada = reg.hora_asistencia;
              else if (estado === 'SALIDA') fila.salida = reg.hora_asistencia;
            });

            this.resultados.push(fila);
          });
        } else {
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
.no-wrap {
  white-space: nowrap;
}
.my-overlay {
  z-index: 9999;
  background-color: rgba(255, 0, 0, 0.3);
}
</style>
