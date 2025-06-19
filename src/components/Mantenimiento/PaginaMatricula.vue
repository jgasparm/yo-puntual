<template>
  <v-container>
    
    <!-- ENCABEZADO -->
    <v-row class="py-3">
      <v-col cols="12">
          <h1 class="text-h5 font-weight-bold mb-1">📋 Matrícula de Alumnos - Año {{ anioEscolar }}</h1>
          <p class="text-subtitle-2">Gestiona la matrícula de estudiantes por año escolar y aula asignada.</p>
      </v-col>
    </v-row>

    <!-- BOTÓN Agregar Matrícula -->
    <v-card class="mb-2">
  <v-card-actions class="d-flex justify-end">
    <v-btn color="primary" small @click="abrirDialogoAgregarMatricula">
      <v-icon left>mdi-account-plus</v-icon> 
       Agregar Matrícula
    </v-btn>
  </v-card-actions>
</v-card>


    <!-- FILTROS (Turno, Nivel, Grado, Sección) -->
    <v-card class="pa-2 mb-3">
      <v-card-title class="text-subtitle-3 font-weight-bold">
        Filtrar Matrículas
      </v-card-title>
      <v-card-text>
        <v-row dense>
          <v-col cols="12" md="3">
            <v-select
              label="Turno"
              :items="turnos"
              v-model="filtro.turno"
              item-title="turn_nombre"
              item-value="turn_id"
              outlined
              dense
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              label="Nivel"
              :items="niveles"
              v-model="filtro.nivel"
              item-title="nive_nombre"
              item-value="nive_id"
              outlined
              dense
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              label="Grado"
              :items="grados"
              v-model="filtro.grado"
              item-title="grad_nombre"
              item-value="grad_id"
              outlined
              dense
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              label="Sección"
              :items="secciones"
              v-model="filtro.seccion"
              item-title="secc_nombre"
              item-value="secc_id"
              outlined
              dense
            />
          </v-col>
        </v-row>
      </v-card-text>
      <!-- BOTÓN Consultar -->
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" small @click="consultarMatriculas">
          <v-icon left>mdi-magnify</v-icon>
          Consultar
        </v-btn>
      </v-card-actions>
    </v-card>

    <!-- VISTA DESKTOP: DataTable con paginación interna -->
    <div v-if="isDesktop">
      <v-data-table
        :headers="headers"
        :items="matriculados"

        :loading="loading"
        v-model:page="currentPage"
        :items-per-page="itemsPerPage"
        class="tabla-matricula"
        no-data-text="No hay alumnos matriculados"
        :item-key="item => item.alum_id" hide-default-footer
      >
        <template #top v-if="loading">
          <v-progress-linear color="primary" indeterminate></v-progress-linear>
        </template>

        <!-- Columna para correlativo -->
        <template #item.correlativo="{ index }">
          {{ (currentPage - 1) * itemsPerPage + (index + 1) }}
        </template>

        <template #item.estado="{ item }">
          <v-chip
            :color="item.matr_estado === 'A' ? 'green' : 'red'"
            text-color="white"
            small
            label
          >
            {{ item.matr_estado === 'A' ? 'Activo' : 'Inactivo' }}
          </v-chip>
        </template>

        <!-- Columna de acciones (editar y expandir) -->
        <template #item.acciones="{ item }">
          <div class="d-flex align-center">
            <v-btn 
              icon
              variant="text"
              color="primary"
              @click.stop="abrirDialogoActualizarMatricula(item)"
            >
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn 
              icon
              variant="text"
              color="info"
              @click.stop="togglePagosAlumno(item.alum_id, item.usua_id)"
            >
              <v-icon>
                {{ expandedRow === item.alum_id ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
              </v-icon>
            </v-btn>
          </div>
        </template>

        <template #headers>
          <thead>
            <tr>
              <th class="text-center col-width-5">N°</th>
              <th class="text-center col-width-20">Alumno</th>
              <th class="text-center col-width-10">Fecha Matrícula</th>
              <th class="text-center col-width-10">Turno</th>
              <th class="text-center col-width-10">Nivel</th>
              <th class="text-center col-width-10">Grado</th>
              <th class="text-center col-width-10">Sección</th>
              <th class="text-center col-width-10">Estado</th>
              <th class="text-center col-width-15">Acciones</th>
            </tr>
          </thead>
        </template>

        <!-- Personalización completa del body para controlar expansión -->
       <template #body="{ items }">
        <tbody>
          <template v-for="(item, index) in items" :key="item.alum_id">
            <!-- Fila principal -->
            <tr v-if="item">
              <td class="text-center col-width-5">{{ (currentPage - 1) * itemsPerPage + index + 1 }}</td>
              <td class="text-center col-width-20">{{ item.alumno }}</td>
              <td class="text-center col-width-10">{{ item.fecha_matricula }}</td>
              <td class="text-center col-width-10">{{ item.turno_descripcion }}</td>
              <td class="text-center col-width-10">{{ item.nivel_descripcion }}</td>
              <td class="text-center col-width-10">{{ item.grado_descripcion }}</td>
              <td class="text-center col-width-10">{{ item.seccion_descripcion }}</td>
              <td class="text-center col-width-10">
                <v-chip :color="item.matr_estado === 'A' ? 'green' : 'red'" small>
                  {{ item.matr_estado === 'A' ? 'Activo' : 'Inactivo' }}
                </v-chip>
              </td>
              <td class="text-center col-width-15">
                  <div class="d-flex align-center justify-center">
                    <v-btn 
                      icon
                      variant="text"
                      color="primary"
                      @click.stop="abrirDialogoActualizarMatricula(item)"
                    >
                      <v-icon>mdi-pencil</v-icon>
                    </v-btn>
                    <v-btn 
                      icon
                      variant="text"
                      color="info"
                      @click.stop="togglePagosAlumno(item.alum_id, item.usua_id)"
                    >
                      <v-icon>
                        {{ expandedRow === item.alum_id ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
                      </v-icon>
                    </v-btn>
                  </div>
                </td>
              </tr>

              <!-- Fila expandida para pagos -->
              <tr v-if="expandedRow === item.alum_id">
                <td colspan="9" class="pa-4 bg-grey-lighten-4">
                  <div class="d-flex justify-space-between align-center mb-2">
                    <v-chip small class="ml-2">
                      Total: {{ getPagosAlumno(item.alum_id).length }}
                    </v-chip>
                  </div>
                  
                  <!-- Tabla de pagos con estructura fija -->
                  <div class="pagos-table">
                    <table class="elevation-1">
                      <thead>
                        <tr>
                          <th class="text-center">Servicio</th>
                          <th class="text-center">Período</th>
                          <th class="text-center">Importe S/</th>
                          <th class="text-center">Vencimiento</th>
                          <th class="text-center">Estado</th>
                          <th class="text-center">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="pago in getPagosAlumno(item.alum_id)" :key="pago.id">
                          <td>{{ pago.nombre_servicio }}</td>
                          <td>{{ pago.mes_descripcion }} {{ pago.Año }}</td>
                          <td>{{ formatMoneda(pago.importe) }}</td>
                          <td>{{ formatFecha(pago.fecha_vencimiento) }}</td>
                          <td>
                            <v-chip :color="getColorEstado(pago.estado)" small>
                              {{ pago.estado }}
                            </v-chip>
                          </td>
                          <td>
                          <v-btn 
                            icon 
                            variant="text" 
                            color="primary" 
                            @click.stop="editarPago(pago)"
                          >
                            <v-icon>mdi-pencil</v-icon>
                          </v-btn>
                        </td>
                        </tr>
                        <tr v-if="getPagosAlumno(item.alum_id).length === 0">
                          <td colspan="4" class="text-center py-4">
                            <v-alert type="info" density="compact">
                              No hay pagos registrados
                            </v-alert>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
          
        </template>
      </v-data-table>

      <!-- Paginación Desktop -->
      <v-pagination
        v-if="totalPages > 1"
        v-model="currentPage"
        :length="totalPages"
        class="mt-2"
      />
    </div>

    <!-- VISTA MOBILE: Tarjetas con paginación manual -->
    <div v-else>
    <v-row dense>
      <v-col
        v-for="(item, index) in paginatedMatriculados"
        :key="index"
        cols="12"
        class="mb-3"
      >
        <v-card outlined class="elevation-1">
          <div style="position: absolute; top: 8px; right: 8px; display: flex;">
            <v-btn icon aria-label="Editar matrícula" @click.stop="abrirDialogoActualizarMatricula(item)">
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn 
              icon 
              @click.stop="togglePagosAlumno(item.alum_id, item.usua_id)"
              :color="expandedRow === item.alum_id ? 'primary' : ''"
            >
              <v-icon>
                {{ expandedRow === item.alum_id ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
              </v-icon>
            </v-btn>
          </div>
          <v-card-title class="font-weight-bold">
            N° {{ (currentPage - 1) * itemsPerPage + (index + 1) }}
          </v-card-title>
          <v-card-title class="font-weight-bold d-flex align-start">
            <v-icon class="mr-2 mt-1">mdi-account</v-icon>
            <span class="text-wrap" style="text-align: left; white-space: normal; word-break: break-word;">
              {{ item.alumno }}
            </span>
          </v-card-title>

          <v-card-text>
            <div><strong>Fecha Matrícula:</strong> {{ item.fecha_matricula }}</div>
            <div><strong>Turno:</strong> {{ item.turno_descripcion }}</div>
            <div><strong>Nivel:</strong> {{ item.nivel_descripcion }}</div>
            <div><strong>Grado:</strong> {{ item.grado_descripcion }}</div>
            <div><strong>Sección:</strong> {{ item.seccion_descripcion }}</div>
          </v-card-text>

          <!-- Sección de pagos expandida -->
          <v-expand-transition>
            <div v-if="expandedRow === item.alum_id">
              <v-divider></v-divider>
              <v-card-title class="text-subtitle-1 font-weight-bold">
                Pagos del Alumno
              </v-card-title>
              <v-card-text>
                <v-row
                  v-for="pago in getPagosAlumno(item.alum_id)"
                  :key="pago.id"
                  class="mb-2"
                >
                  <v-col cols="12">
                    <v-card outlined>
                      <v-card-text>
                        <div class="text-right mt-2">
                          <v-btn 
                            icon 
                            variant="text" 
                            color="primary" 
                            @click.stop="editarPago(pago)"
                          >
                            <v-icon>mdi-pencil</v-icon>
                          </v-btn>
                        </div>
                        <div><strong>Servicio:</strong> {{ pago.nombre_servicio }}</div>
                        <div><strong>Período:</strong> {{ pago.mes_descripcion }} {{ pago.Año }}</div>
                        <div><strong>Importe S/:</strong> {{ formatMoneda(pago.importe) }}</div>
                        <div><strong>Vencimiento:</strong> {{ formatFecha(pago.fecha_vencimiento) }}</div>
                        <div>
                          <strong>Estado:</strong>
                          <v-chip :color="getColorEstado(pago.estado)" small class="ml-1">
                            {{ pago.estado }}
                          </v-chip>
                        </div>
                      </v-card-text>
                    </v-card>
                  </v-col>
                </v-row>
                <v-alert
                  v-if="getPagosAlumno(item.alum_id).length === 0"
                  type="info"
                  class="mt-2"
                >
                  No hay pagos registrados para este alumno
                </v-alert>
              </v-card-text>
            </div>
          </v-expand-transition>

        </v-card>
      </v-col>
    </v-row>
    <!-- Paginación Mobile -->
    <v-pagination
      v-if="totalPages > 1"
      v-model="currentPage"
      :length="totalPages"
      class="mt-2"
    />
  </div>

    <!-- Diálogo Agregar Matrícula -->
    <v-dialog v-model="dialogoAgregar" max-width="400">
      <v-card>
        <v-card-title>
          <span class="text-h6 font-weight-bold">Agregar Matrícula</span>
        </v-card-title>
        <v-card-text>
          <v-select
            label="Alumno"
            :items="alumnosNoMatriculados"
            v-model="nuevoMatricula.alum_id"
            item-title="nombre_completo"
            item-value="alum_id"
            dense
            outlined
          />
          <v-select
            label="Aula Detalle"
            :items="aulasDetalleFormateadas"
            v-model="nuevoMatricula.aude_id"
            item-title="aulaConcatenada"
            item-value="aude_id"
            dense
            outlined
            class="mt-3"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="dialogoAgregar = false">Cancelar</v-btn>
          <v-btn color="primary" @click="guardarMatricula">Guardar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.visible" :color="snackbar.color">
      {{ snackbar.message }}
      <template v-slot:actions>
        <v-btn variant="text" @click="snackbar.visible = false">Cerrar</v-btn>
      </template>
    </v-snackbar>

    <!-- Diálogo Actualizar Matrícula -->
    <v-dialog v-model="dialogoEditarPago" max-width="500">
    <v-card>
      <v-card-title class="text-h6">
        <v-icon left>mdi-cash-edit</v-icon>
        Actualizar Estado de Pago
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12">
            <div><strong>Alumno:</strong> {{ obtenerNombreAlumno(pagoSeleccionado?.alumId) }}</div>
            <div><strong>Servicio:</strong> {{ pagoSeleccionado?.nombre_servicio }}</div>
            <div><strong>Período:</strong> {{ pagoSeleccionado?.mes_descripcion }} {{ pagoSeleccionado?.peri_annio }}</div>
          </v-col>
          
          <v-col cols="12">
            <v-select
              label="Estado del Pago"
              v-model="nuevoEstadoPago"
              :items="estadosPago"
              item-title="text"
              item-value="value"
              outlined
              dense
            ></v-select>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text @click="dialogoEditarPago = false">Cancelar</v-btn>
        <v-btn color="primary" @click="guardarEstadoPago" :loading="guardandoPago">
          <v-icon left>mdi-content-save</v-icon>
          Guardar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  </v-container>

</template>

<script>
import axios from "axios";
import { computed, ref } from "vue";
import { useDisplay } from "vuetify";

export default {
  name: "PaginaMatricula",
  setup() {
    
    const anioEscolar = ref(localStorage.getItem("anio_escolar"));
    const profile = ref(localStorage.getItem("profile"));
    const token = ref(localStorage.getItem("token"));
    
    // Detectar si es Desktop o Mobile
    const { mdAndUp } = useDisplay();
    const isDesktop = mdAndUp;

    const currentPage = ref(1);
    const itemsPerPage = computed(() => (isDesktop.value ? 10 : 5));

    return { anioEscolar, profile, token, isDesktop, currentPage, itemsPerPage };
  },
  data() {
    return {

      snackbar: {
      visible: false,
      message: '',
      color: 'success'
    },

      expandedRow: null,

      // Catálogos
      turnosAll: [],
      nivelesAll: [],
      gradosAll: [],
      seccionesAll: [],

      // Arrays usados en <v-select>
      turnos: [],
      niveles: [],
      grados: [],
      secciones: [],

      // Filtros
      filtro: {
        turno: 0,   // "TODOS" = 0
        nivel: 0,
        grado: 0,
        seccion: 0
      },

      matriculados: [],  // Data que se muestra en la tabla
      loading: false,

      headers: [
      { title: "N°", value: "correlativo", align: "center", class: "col-width-5" },
      { title: "Alumno", value: "alumno", align: "center", class: "col-width-20" },
      { title: "Fecha Matrícula", value: "fecha_matricula", align: "center", class: "col-width-10" },
      { title: "Turno", value: "turno_descripcion", align: "center", class: "col-width-10" },
      { title: "Nivel", value: "nivel_descripcion", align: "center", class: "col-width-10" },
      { title: "Grado", value: "grado_descripcion", align: "center", class: "col-width-10" },
      { title: "Sección", value: "seccion_descripcion", align: "center", class: "col-width-10" },
      { title: "Estado", value: "estado", align: "center", class: "col-width-10" },
      { title: "Acciones", value: "acciones", align: "center", class: "col-width-15" },
    ],

      // Para "Agregar"
      dialogoAgregar: false,
      alumnosNoMatriculados: [],
      aulasDetalle: [],
      nuevoMatricula: {
        alum_id: null,
        aude_id: null
      },

      // Para "Actualizar"
      dialogoActualizar: false,
      matriculaSeleccionada: null,
      matriculaSeleccionadaEstado: "",

      dialogoEditarPago: false,
      pagoSeleccionado: null,
      nuevoEstadoPago: "",
      guardandoPago: false,
      estadosPago: [
        { text: "Pendiente", value: "P" },
        { text: "Pagado", value: "G" },
        { text: "Vencido", value: "V" },
        { text: "Anulado", value: "A" },
      ],

      // Nuevas propiedades para pagos
      headersPagos: [
        { title: 'Servicio', value: 'nombre_servicio' },
        { title: 'Año', value: 'Año' },
        { title: 'Mes', value: 'mes_descripcion' },
        { title: 'Importe S/', value: 'importe' },
        { title: 'Vencimiento', value: 'fecha_vencimiento' },
        { title: 'Estado', value: 'estado' }
      ],
      pagosAlumnos: [],
      loadingPagos: false
    };
  },
  computed: {
    totalPages() {
      return Math.ceil(this.matriculados.length / this.itemsPerPage);
    },
    paginatedMatriculados() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      return this.matriculados.slice(start, start + this.itemsPerPage);
    },
    aulasDetalleFormateadas() {
      if (!Array.isArray(this.aulasDetalle)) return [];
      return this.aulasDetalle.map(item => ({
        ...item,
        aulaConcatenada: `${item.turn_nombre} - ${item.nive_nombre} - ${item.grad_nombre} - ${item.secc_nombre}`
      }));
    }
  },
  mounted() {
    // Cargar catálogos (Turno, Nivel, Grado, Sección)
    this.cargarFiltrosMatricula();

    // Al montar la página, si deseas puedes llamar de inmediato a consultar
    // o esperar a que el usuario presione "Consultar".
    this.consultarMatriculas();
  },
  methods: {
    // Trae catálogos de turnos, niveles, grados, secciones
    async cargarFiltrosMatricula() {
      try {
        const url = "https://amsoftsolution.com/amss/ws/wsConsultaFiltrosAlumno.php";
        const config = {
          params: { av_profile: this.profile },
          headers: { Authorization: `Bearer ${this.token}` },
        };
        const resp = await axios.get(url, config);
        if (resp.data.status) {
          this.turnosAll = resp.data.data.turnos || [];
          this.nivelesAll = resp.data.data.niveles || [];
          this.gradosAll = resp.data.data.grados || [];
          this.seccionesAll = resp.data.data.secciones || [];

          // Insertamos "TODOS" = 0
          this.turnos = [{ turn_id: 0, turn_nombre: "TODOS" }, ...this.turnosAll];
          this.niveles = [{ nive_id: 0, nive_nombre: "TODOS" }, ...this.nivelesAll];
          this.grados = [{ grad_id: 0, grad_nombre: "TODOS" }, ...this.gradosAll];
          this.secciones = [{ secc_id: 0, secc_nombre: "TODOS" }, ...this.seccionesAll];

          // Setear a "TODOS" (0)
          this.filtro.turno = 0;
          this.filtro.nivel = 0;
          this.filtro.grado = 0;
          this.filtro.seccion = 0;
        } else {
          console.error("Error al cargar filtros:", resp.data.message);
        }
      } catch (err) {
        console.error("Error en cargarFiltrosMatricula:", err);
      }
    },

    // Se llama al hacer clic en "Consultar"
    async consultarMatriculas() {
      this.loading = true;
      try {
        const url = "https://amsoftsolution.com/amss/ws/wsConsultaMatricula.php";
        const config = {
          params: {
            ac_anio_escolar: this.anioEscolar,
            ai_turn_id: this.filtro.turno,
            ac_nive_id: this.filtro.nivel,
            ai_grad_id: this.filtro.grado,
            ai_secc_id: this.filtro.seccion,
            av_profile: this.profile
          },
          headers: { Authorization: `Bearer ${this.token}` },
        };
        const resp = await axios.get(url, config);
        if (resp.data.status) {
          // Mapear la data devuelta incluyendo usua_id
          this.matriculados = resp.data.data.map(item => ({
            alum_id: item.alum_id,
            alumno: item.nombre_alumno,
            fecha_matricula: item.fecha_matricula 
              ? item.fecha_matricula.split(' ')[0] 
              : '',
            aude_id: item.aude_id,
            turno_descripcion: item.turno,
            nivel_descripcion: item.nivel,
            grado_descripcion: item.grado,
            seccion_descripcion: item.seccion,
            matr_id: item.matr_id,
            matr_estado: item.matr_estado,
            usua_id: item.usua_id // Asegúrate de que esto viene en la respuesta
          }));
        } else {
          this.matriculados = [];
          console.error("Error consultando matrículas:", resp.data.message);
        }
      } catch (err) {
        console.error("Error consultando matrículas:", err);
        this.matriculados = [];
      } finally {
        this.loading = false;
      }
    },

    // Watchers para repoblar combos de Grados/Secciones
    onChangeNivelLocal() {
      const nivelId = this.filtro.nivel;
      if (!nivelId || nivelId === 0) {
        this.grados = [{ grad_id: 0, grad_nombre: "TODOS" }, ...this.gradosAll];
        this.secciones = [{ secc_id: 0, secc_nombre: "TODOS" }, ...this.seccionesAll];
        this.filtro.grado = 0;
        this.filtro.seccion = 0;
        return;
      }
      // Filtra grados
      const gradosFiltrados = this.gradosAll.filter(g => g.nive_id === nivelId);
      this.grados = [{ grad_id: 0, grad_nombre: "TODOS" }, ...gradosFiltrados];
      this.filtro.grado = 0;

      // Secciones se resetean
      this.secciones = [{ secc_id: 0, secc_nombre: "TODOS" }];
      this.filtro.seccion = 0;
    },
    onChangeGradoLocal() {
      const gradoId = this.filtro.grado;
      if (!gradoId || gradoId === 0) {
        this.secciones = [{ secc_id: 0, secc_nombre: "TODOS" }, ...this.seccionesAll];
        this.filtro.seccion = 0;
        return;
      }
      // Filtra secciones
      const seccionesFiltradas = this.seccionesAll.filter(s => s.grad_id === gradoId);
      this.secciones = [{ secc_id: 0, secc_nombre: "TODOS" }, ...seccionesFiltradas];
      this.filtro.seccion = 0;
    },

    // Agregar Matrícula
    async abrirDialogoAgregarMatricula() {
      this.dialogoAgregar = true;
      this.nuevoMatricula.alum_id = null;
      this.nuevoMatricula.aude_id = null;
      await this.cargarAlumnosNoMatriculados();
      await this.cargarAulaDetalle();
    },
    async cargarAlumnosNoMatriculados() {
      try {
        const url = "https://amsoftsolution.com/amss/ws/wsListaAlumnosNoMatriculados.php";
        const config = {
          params: {
            ac_anio_escolar: this.anioEscolar,
            av_profile: this.profile
          },
          headers: { Authorization: `Bearer ${this.token}` }
        };
        const resp = await axios.get(url, config);
        if (resp.data.status) {
          this.alumnosNoMatriculados = resp.data.data;
        } else {
          this.alumnosNoMatriculados = [];
          console.error("Error al obtener alumnos no matriculados:", resp.data.message);
        }
      } catch (err) {
        console.error("Error cargarAlumnosNoMatriculados:", err);
        this.alumnosNoMatriculados = [];
      }
    },
    async cargarAulaDetalle() {
      try {
        const url = "https://amsoftsolution.com/amss/ws/wsListaAulaDetalleAnioEscolar.php";
        const config = {
          params: {
            ac_anio_escolar: this.anioEscolar,
            av_profile: this.profile
          },
          headers: { Authorization: `Bearer ${this.token}` }
        };
        const resp = await axios.get(url, config);
        if (resp.data.status) {
          this.aulasDetalle = resp.data.data;
        } else {
          this.aulasDetalle = [];
          console.error("Error al obtener las aulas detalle:", resp.data.message);
        }
      } catch (err) {
        console.error("Error cargarAulaDetalle:", err);
        this.aulasDetalle = [];
      }
    },
    async guardarMatricula() {
      if (!this.nuevoMatricula.alum_id || !this.nuevoMatricula.aude_id) {
        alert("Seleccione el alumno y el aula.");
        return;
      }
      try {
        const url = "https://amsoftsolution.com/amss/ws/wsRegistraMatricula.php";
        // Crea el objeto de datos para el cuerpo de la petición
        const data = {
          ai_alum_id: this.nuevoMatricula.alum_id,
          ai_aude_id: this.nuevoMatricula.aude_id,
          ac_anio_escolar: this.anioEscolar,
          av_profile: this.profile
        };
        const config = {
          headers: {
            Authorization: `Bearer ${this.token}`,
            "Content-Type": "application/json"
          }
        };
        const resp = await axios.post(url, data, config);
        if (resp.data.status) {
          this.dialogoAgregar = false;
          // Llamar de nuevo para refrescar la tabla
          this.consultarMatriculas();
        } else {
          console.error("Error al registrar matrícula:", resp.data.message);
        }
      } catch (err) {
        console.error("Error registrando matrícula:", err);
      }
    },

    // Actualizar Matrícula
    abrirDialogoActualizarMatricula(item) {
      this.matriculaSeleccionada = item;
      // Asumir "Activo" si no te llega un estado
      this.matriculaSeleccionadaEstado = item.matr_estado === "A" ? "Activo" : "Inactivo";
      this.dialogoActualizar = true;
    },
    async actualizarMatricula() {
      console.log('this.matriculaSeleccionada.aude_id')
      console.log(this.matriculaSeleccionada.aude_id)
      try {
        const nuevoEstado = this.matriculaSeleccionadaEstado === "Activo" ? "A" : "I";
        const url = "https://amsoftsolution.com/amss/ws/wsActualizaMatricula.php";
        const data = {
          ai_matr_id: this.matriculaSeleccionada.matr_id,
          ai_alum_id: this.matriculaSeleccionada.alum_id,
          ai_aude_id: this.matriculaSeleccionada.aude_id,
          ac_matr_estado: nuevoEstado,
          av_profile: this.profile
        };
        const config = {
          headers: {
            Authorization: `Bearer ${this.token}`,
            "Content-Type": "application/json"
          }
        };
        const resp = await axios.post(url, data, config);
        if (resp.data.status) {
          this.dialogoActualizar = false;
          // Volver a consultar
          this.consultarMatriculas();
        } else {
          console.error("Error al actualizar matrícula:", resp.data.message);
        }
      } catch (err) {
        console.error("Error actualizando matrícula:", err);
      }
    },

    textoAula(a) {
      return `AulaID: ${a.aude_id}, Turno: ${a.turn_nombre}, Nivel: ${a.nive_nombre}, Grado: ${a.grad_nombre}, Secc: ${a.secc_nombre}`;
    },

    // Nuevos métodos para pagos
    togglePagosAlumno(alumId, usuaId) {

      // Si ya está expandido, colapsa
      if (this.expandedRow === alumId) {
        this.expandedRow = null;
      } 
      // Si es una nueva fila
      else {
        // 2. Expande la nueva fila después de un pequeño delay (opcional)
        this.expandedRow = alumId;
          
        // 3. Carga los pagos solo si no se han cargado antes
        if (usuaId) {
          const pagosYaCargados = this.pagosAlumnos.some(p => p.alumId === alumId);
          if (!pagosYaCargados) {
            this.cargarPagosAlumno(usuaId, alumId);
          }
        }
      }
    },
    async cargarPagosAlumno(usuaId, alumId) {
      this.loadingPagos = true;
      try {
        const url = "https://amsoftsolution.com/amss/ws/wsConsultaPagosAlumno.php";
        const config = {
          params: {
            ai_usua_id: usuaId,
            ac_todos:'S',
            av_profile: this.profile
          },
          headers: { Authorization: `Bearer ${this.token}` }
        };
        const resp = await axios.get(url, config);
        if (resp.data.status) {
          // Agregamos los pagos al array manteniendo referencia al usuario
          this.pagosAlumnos = [
            ...this.pagosAlumnos,
            ...resp.data.data.map(p => ({ ...p, usuaId, alumId: alumId }))
          ];
        }
      } catch (err) {
        console.error("Error al cargar pagos del alumno:", err);
      } finally {
        this.loadingPagos = false;
      }
    },
    
    getPagosAlumno(alumId) {
      return this.pagosAlumnos.filter(p => p.alumId === alumId);
    },

    formatMoneda(value) {
      if (!value) return '0.00';
      const num = Number(value);
      if (isNaN(num)) return value;
      return num.toLocaleString('es-PE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    },
    
    formatFecha(fecha) {
      if (!fecha) return '';
      const date = new Date(fecha);
      return date.toLocaleDateString('es-PE');
    },
    
    getColorEstado(estado) {
      switch (estado) {
        case 'Pagado': return 'green';
        case 'Pendiente': return 'orange';
        case 'Vencido': return 'red';
        default: return 'grey';
      }
    },
    editarPago(pago) {
      this.pagoSeleccionado = pago;
      this.nuevoEstadoPago = this.obtenerValorEstado(pago.estado);
      this.dialogoEditarPago = true;
    },
    
    obtenerNombreAlumno(alumId) {
      const alumno = this.matriculados.find(a => a.alum_id === alumId);
      return alumno ? alumno.alumno : 'Alumno no encontrado';
    },
    
    obtenerValorEstado(estado) {
      switch(estado) {
        case 'Pendiente': return 'P';
        case 'Pagado': return 'G';
        case 'Vencido': return 'V';
        case 'Anulado': return 'A';
        default: return 'P';
      }
    },
    
    async guardarEstadoPago() {
      if (!this.pagoSeleccionado || !this.nuevoEstadoPago) return;
      const usuario = ref(localStorage.getItem("usua_id"));
      this.guardandoPago = true;
      
      try {
    const url = "https://amsoftsolution.com/amss/ws/wsActualizaGestionPagosPeriodo.php";
    
    // Usar URLSearchParams para el formato application/x-www-form-urlencoded
    const formData = new URLSearchParams();
    formData.append('ai_gepa_codigo', this.pagoSeleccionado.id);
    formData.append('ac_peri_annio', this.pagoSeleccionado.Año);
    formData.append('ac_peri_mes', this.pagoSeleccionado.Mes);
    formData.append('ac_gepp_estado', this.nuevoEstadoPago);
    formData.append('ai_usua_id', usuario.value);
    formData.append('av_profile', this.profile);

    const config = {
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/x-www-form-urlencoded' // Cabecera necesaria
      }
    };

    // Enviar formData como cuerpo de la solicitud
    const resp = await axios.post(url, formData, config);
        
        if (resp.data.status) {
          // Recargar los pagos del alumno para actualizar la información
          await this.recargarPagosAlumno();
          
          // Cerrar diálogo y mostrar mensaje de éxito
          this.dialogoEditarPago = false;
          this.mostrarMensajeExito("Estado de pago actualizado correctamente");
        } else {
          console.error("Error al actualizar pago:", resp.data.message);
          this.mostrarMensajeError("Error al actualizar el estado del pago");
        }
      } catch (err) {
        console.error("Error guardando estado de pago:", err);
        this.mostrarMensajeError("Error al guardar los cambios");
      } finally {
        this.guardandoPago = false;
      }
    },
    
    async recargarPagosAlumno() {
      if (!this.pagoSeleccionado) return;
      
      try {
        // Eliminar pagos existentes para este alumno
        this.pagosAlumnos = this.pagosAlumnos.filter(
          p => p.alumId !== this.pagoSeleccionado.alumId
        );
        
        // Volver a cargar los pagos del alumno
        await this.cargarPagosAlumno(
          this.pagoSeleccionado.usuaId, 
          this.pagoSeleccionado.alumId
        );
      } catch (err) {
        console.error("Error recargando pagos:", err);
      }
    },
    
    mostrarMensajeExito(mensaje) {
      this.snackbar = {
        visible: true,
        message: mensaje,
        color: 'success'
      };
    },
    
    mostrarMensajeError(mensaje) {
      this.snackbar = {
        visible: true,
        message: mensaje,
        color: 'error'
      };
    }
  },
  watch: {
  "filtro.nivel": function (newVal) {
    // Si el usuario selecciona "TODOS" (nivel = 0)
    if (newVal === 0) {
      this.grados = [{ grad_id: 0, grad_nombre: "TODOS" }];
      this.filtro.grado = 0;

      this.secciones = [{ secc_id: 0, secc_nombre: "TODOS" }];
      this.filtro.seccion = 0;
      return;
    }

    // Caso contrario: filtras los grados que pertenezcan a ese nivel
    const nivelId = newVal;
    const gradosFiltrados = this.gradosAll.filter(g => g.nive_id === nivelId);

    // Asignas la nueva lista de grados
    this.grados = [
      { grad_id: 0, grad_nombre: "TODOS" },
      ...gradosFiltrados
    ];
    // Reinicias el grado a 0, y de paso la lista de secciones
    this.filtro.grado = 0;
    this.secciones = [{ secc_id: 0, secc_nombre: "TODOS" }];
    this.filtro.seccion = 0;
  },

  "filtro.grado": function (newVal) {
    // Si el usuario selecciona "TODOS" (grado = 0)
    if (newVal === 0) {
      this.secciones = [{ secc_id: 0, secc_nombre: "TODOS" }];
      this.filtro.seccion = 0;
      return;
    }

    // Caso contrario: filtras las secciones que pertenezcan a ese grado
    const gradoId = newVal;
    const seccionesFiltradas = this.seccionesAll.filter(s => s.grad_id === gradoId);

    this.secciones = [
      { secc_id: 0, secc_nombre: "TODOS" },
      ...seccionesFiltradas
    ];
    this.filtro.seccion = 0;
  }
},

};
</script>

<style scoped>
.tabla-matricula :deep(table),
.tabla-matricula :deep(.v-data-table__wrapper table) {
  width: 100%;
  table-layout: fixed;
}

.tabla-matricula :deep(th),
.tabla-matricula :deep(td) {
  padding: 8px !important;
  text-align: center;
  vertical-align: middle;
  box-sizing: border-box;
}

.tabla-matricula :deep(th.col-width-5),
.tabla-matricula :deep(td.col-width-5) { width: 5%; }

.tabla-matricula :deep(th.col-width-10),
.tabla-matricula :deep(td.col-width-10) { width: 10%; }

.tabla-matricula :deep(th.col-width-15),
.tabla-matricula :deep(td.col-width-15) { width: 15%; }

.tabla-matricula :deep(th.col-width-20),
.tabla-matricula :deep(td.col-width-20) { width: 20%; }
</style>
