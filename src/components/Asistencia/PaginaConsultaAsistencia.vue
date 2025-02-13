<template>
  <v-container>
    <!-- Fila 1: Niveles Académicos -->
    <v-card class="pa-2 mb-2">
      <v-card-title class="text-subtitle-3 font-weight-bold">
        <v-icon left size="18">mdi-school</v-icon>
        Niveles Académicos
      </v-card-title>
      <v-card-text class="py-1">
        <v-row dense>
          <v-col cols="12" md="3">
            <v-select
              label="Turno"
              :items="turnos"
              v-model="filtros.turno"
              dense
              outlined
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              label="Nivel"
              :items="niveles"
              v-model="filtros.nivel"
              dense
              outlined
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              label="Grado"
              :items="grados"
              v-model="filtros.grado"
              dense
              outlined
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              label="Sección"
              :items="secciones"
              v-model="filtros.seccion"
              dense
              outlined
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Fila 2: Alumno y Rango de Fechas -->
    <v-row dense>
      <v-col cols="12" md="6">
        <v-card class="pa-2">
          <v-card-title class="text-subtitle-3 font-weight-bold">
            <v-icon left size="18">mdi-account</v-icon>
            Alumno
          </v-card-title>
          <v-card-text class="py-1">
            <v-autocomplete
            label="Alumno"
              :items="alumnos"
              v-model="filtros.alumno"
              item-text="persona_descripcion"
              item-value="pers_id"            
              dense
              outlined
              clearable
              solo
              hide-no-data
              >
        </v-autocomplete>

          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card class="pa-2">
          <v-card-title class="text-subtitle-3 font-weight-bold">
            <v-icon left size="18">mdi-calendar</v-icon>
            Rango de Fechas
          </v-card-title>
          <v-card-text class="py-1">
            <v-row dense>
              <v-col cols="12" md="6">
                <!-- Dialogo para Fecha Inicial -->
                <v-dialog
                  v-model="menuFechaInicio"
                  persistent
                  max-width="320"
                >
                  <!-- NUEVA SINTAXIS: #activator="{ props }" -->
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
                      show-adjacent-months
                      hide-header
                    />
                    <v-card-actions class="d-flex justify-end">
                      <v-btn text @click="menuFechaInicio = false">
                        Cancelar
                      </v-btn>
                      <v-btn color="primary" @click="actualizarFechaInicio">
                        Aceptar
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-dialog>
              </v-col>

              <v-col cols="12" md="6">
                <!-- Dialogo para Fecha Final -->
                <v-dialog
                  v-model="menuFechaFinal"
                  persistent
                  max-width="320"
                >
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
                      show-adjacent-months
                      hide-header
                    />
                    <v-card-actions class="d-flex justify-end">
                      <v-btn text @click="menuFechaFinal = false">
                        Cancelar
                      </v-btn>
                      <v-btn color="primary" @click="actualizarFechaFinal">
                        Aceptar
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-dialog>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Botón de consulta -->
    <v-row class="mt-2">
      <v-col cols="12" class="d-flex justify-end">
        <v-btn color="primary" small @click="consultarAsistencia">
          <v-icon left size="18">mdi-magnify</v-icon>
          Consultar
        </v-btn>
      </v-col>
    </v-row>

    <!-- Resultados -->
    <v-card class="pa-2 mt-3 rounded-lg elevation-2">
      <v-card-title class="text-subtitle-3 font-weight-bold d-flex align-center">
        <v-icon left size="18">mdi-table</v-icon>
        Resultados de la Consulta
      </v-card-title>

      <v-divider></v-divider>

      <v-card-text class="py-1">
        <v-data-table
          :headers="headers"
          :items="resultados"
          dense
          class="elevation-2 bg-light-blue-lighten-5"
          no-data-text="No hay resultados disponibles"
        >
          <template #headers>
            <tr>
              <th class="text-center">Alumno</th>
              <th class="text-center">Fecha</th>
              <th class="text-center">Estado</th>
            </tr>
          </template>

          <template #item="{ item }">
            <tr>
              <td class="text-center">{{ item.alumno }}</td>
              <td class="text-center">{{ item.fecha }}</td>
              <td class="text-center">
                <v-chip :color="estadoColor(item.estado)" dark>
                  {{ item.estado }}
                </v-chip>
              </td>
            </tr>
          </template>
        </v-data-table>
      </v-card-text>

      <!-- Botón de exportación: Solo se muestra si hay resultados -->
      <v-card-actions v-if="resultados.length">
        <v-spacer></v-spacer>
        <v-btn color="success" small @click="exportarCSV">
          <v-icon left>mdi-file-export</v-icon>
          Exportar CSV
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script>
import axios from "axios";

export default {
  name: "PaginaConsultaAsistencia",
  data() {
    return {
      filtros: {
        turno: "TODOS",
        nivel: "TODOS",
        grado: "TODOS",
        seccion: "TODOS",
        alumno: "TODOS",
        fechaInicio: this.formatearFecha(new Date()),
        fechaFinal: this.formatearFecha(new Date()),
      },
      turnosAll: [],
      nivelesAll: [],
      gradosAll: [],
      seccionesAll: [],
      alumnosAll: [],

      turnos: ["TODOS"],
      niveles: ["TODOS"],
      grados: ["TODOS"],
      secciones: ["TODOS"],
      alumnos: [],

      // Manejo de fechas
      menuFechaInicio: false,
      menuFechaFinal: false,
      fechaInicioObjeto: new Date(),
      fechaFinalObjeto: new Date(),

      resultados: [],
      headers: [
        { text: "Alumno", value: "alumno", align: "center", sortable: true },
        { text: "Fecha", value: "fecha", align: "center", sortable: true },
        { text: "Estado", value: "estado", align: "center", sortable: true },
      ],
    };
  },
  mounted() {
    const token = localStorage.getItem("token");
    const profile = localStorage.getItem("profile");

    if (!token) {
      console.warn("No hay token en localStorage. Redirigir o manejar error.");
      return;
    }
    if (!profile) {
      console.warn("No hay profile en localStorage. Redirigir o manejar error.");
      return;
    }
    this.cargarFiltrosAlumno(profile, token);
    this.cargarListaAlumno(profile, token);
  },
  methods: {
    async cargarFiltrosAlumno(profile, token) {
      try {
        const url = `https://amsoftsolution.com/amss/ws/wsConsultaFiltrosAlumno.php?av_profile=${profile}`;
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        const response = await axios.get(url, config);

        if (response.data.status) {
          const { turnos, niveles, grados, secciones } = response.data.data;
          this.turnosAll = turnos;
          this.nivelesAll = niveles;
          this.gradosAll = grados;
          this.seccionesAll = secciones;

          this.turnos = ["TODOS", ...this.turnosAll.map(t => t.turn_nombre)];
          this.niveles = ["TODOS", ...this.nivelesAll.map(n => n.nive_nombre)];
          this.grados = ["TODOS"];    // Se llenarán dinámicamente
          this.secciones = ["TODOS"]; // Se llenarán dinámicamente
        } else {
          console.error(
            "Error al obtener catálogos:",
            response.data.message
          );
        }
      } catch (error) {
        console.error("Error de excepción al obtener catálogos:", error);
      }
    },

    async cargarListaAlumno(profile, token) {
      try {
        const url = `https://amsoftsolution.com/amss/ws/wsConsultaPersonas.php?ac_tipo_persona=A&ac_indicador_todos=S&av_profile=${profile}`;
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        const response = await axios.get(url, config);
        console.log(response)
        if (response.data.status) {
          const data = response.data.data;
          
          this.alumnosAll = data;
          this.alumnos = this.alumnosAll.map(t => t.persona_descripcion);
        } else {
          console.error(
            "Error al obtener lista de alumnos:",
            response.data.message
          );
        }
      } catch (error) {
        console.error("Error de excepción al obtener lista de alumnos:", error);
      }
    },

    onChangeNivel() {
      if (this.filtros.nivel === "TODOS") {
        this.grados = ["TODOS"];
        this.secciones = ["TODOS"];
        this.filtros.grado = "TODOS";
        this.filtros.seccion = "TODOS";
        return;
      }
      const nivelObj = this.nivelesAll.find(
        n => n.nive_nombre === this.filtros.nivel
      );
      if (!nivelObj) return;

      const gradosFiltrados = this.gradosAll
        .filter(g => g.nive_id === nivelObj.nive_id)
        .map(g => g.grad_nombre);

      this.grados = ["TODOS", ...gradosFiltrados];
      this.filtros.grado = "TODOS";
      this.filtros.seccion = "TODOS";
      this.secciones = ["TODOS"];
    },

    onChangeGrado() {
      if (this.filtros.grado === "TODOS") {
        this.secciones = ["TODOS"];
        this.filtros.seccion = "TODOS";
        return;
      }
      const gradoObj = this.gradosAll.find(
        g => g.grad_nombre === this.filtros.grado
      );
      if (!gradoObj) return;

      const seccionesFiltradas = this.seccionesAll
        .filter(s => s.grad_id === gradoObj.grad_id)
        .map(s => s.secc_nombre);

      this.secciones = ["TODOS", ...seccionesFiltradas];
      this.filtros.seccion = "TODOS";
    },

    consultarAsistencia() {
      // Simulación / Ejemplo
      this.resultados = [
        { alumno: "Juan Pérez", fecha: "08/02/2025", estado: "Presente" },
        { alumno: "Ana López", fecha: "08/02/2025", estado: "Tardanza" },
      ];
    },

    exportarCSV() {
      const csvContent =
        "data:text/csv;charset=utf-8," +
        ["Alumno,Fecha,Estado"]
          .concat(
            this.resultados.map(
              row => `${row.alumno},${row.fecha},${row.estado}`
            )
          )
          .join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "asistencia.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },

    estadoColor(estado) {
      if (estado === "Presente") return "green";
      if (estado === "Tardanza") return "orange";
      return "red";
    },

    formatearFecha(fecha) {
      return new Intl.DateTimeFormat("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(fecha);
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
  // Si prefieres watchers en lugar de @change en <v-select>, habilítalos:
   watch: {
     "filtros.nivel": function () { this.onChangeNivel() },
     "filtros.grado": function () { this.onChangeGrado() }
   }
};
</script>
