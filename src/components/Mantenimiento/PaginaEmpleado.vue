<template>
  <v-container fluid>
    <!-- Cabecera -->
    <v-row class="mb-2">
      <v-col cols="12">
        <v-row class="mb-2" align="center" justify="space-between">
          <h1 class="mb-2">Empleados</h1>
          <v-btn color="primary" @click="openDialog()">
            <v-icon left>mdi-account-plus</v-icon>
            Agregar
          </v-btn>
        </v-row>

        <!-- Filtros desktop -->
        <v-row v-if="!isMobile" class="mb-4" dense align="center">
          <v-col cols="12" sm="6" md="6">
            <v-text-field
              v-model="filtros.nombre"
              label="Buscar por nombre o apellido"
              clearable
              prepend-inner-icon="mdi-magnify"
              density="comfortable"
            />
          </v-col>

          <v-col cols="6" sm="3" md="3">
            <v-select
              v-model="filtros.cargo"
              :items="cargosUnicos"
              label="Cargo"
              clearable
              prepend-inner-icon="mdi-briefcase"
              density="comfortable"
            />
          </v-col>

          <v-col cols="6" sm="3" md="3">
            <v-select
              v-model="filtros.estado"
              :items="['Activo', 'Inactivo']"
              label="Estado"
              clearable
              prepend-inner-icon="mdi-account-check"
              density="comfortable"
            />
          </v-col>
        </v-row>

        <!-- Filtros mobile -->
        <div v-else class="mb-4 text-right">
          <v-btn color="primary" variant="outlined" @click="dialogFiltros = true">
            <v-icon left>mdi-filter</v-icon>
            Filtros
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- Listado: Desktop -->
    <div v-if="!isMobile">
      <v-data-table
        :items="empleadosFiltrados"
        :headers="tableHeaders"
        :items-per-page="10"
        class="elevation-1"
      >
        <template #item.pers_estado="{ item }">
          <v-chip v-if="item.pers_estado === 'Activo'" color="green">Activo</v-chip>
          <v-chip v-else color="red">Inactivo</v-chip>
        </template>
        <template #item.actions="{ item }">
          <v-icon small class="mr-2" @click="openDialog(item)">
            mdi-pencil
          </v-icon>
        </template>
      </v-data-table>
    </div>

    <!-- Listado: Mobile -->
    <div v-else>
      <v-row>
        <v-col
          v-for="(item, index) in paginatedEmpleados"
          :key="item.pers_id"
          cols="12"
          sm="6"
        >
          <v-card class="mb-2" style="position: relative;">
            <v-btn 
              icon 
              variant="text" 
              style="position: absolute; top: 8px; right: 8px;"
              @click="openDialog(item)"
            >
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-card-title>
              {{ (currentPage - 1) * itemsPerPageMobile + index + 1 }}
            </v-card-title>
            <v-card-title>
              {{ item.pers_nombres }} {{ item.pers_apellido_paterno }}
            </v-card-title>
            <v-card-subtitle>{{ item.pers_numero_documento_identidad }}</v-card-subtitle>
            <v-card-text>
              <div><strong>Fecha Nac.:</strong> {{ item.pers_fecha_nacimiento }}</div>
              <div><strong>Sexo:</strong> {{ item.pers_sexo }}</div>
              <div>
                <strong>Estado:</strong>
                <v-chip v-if="item.pers_estado === 'Activo'" color="green">Activo</v-chip>
                <v-chip v-else color="red">Inactivo</v-chip>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
      <v-pagination v-model="currentPage" :length="mobilePageCount"></v-pagination>
    </div>

    <!-- Diálogo de filtros en mobile -->
    <v-dialog v-model="dialogFiltros" max-width="400px" persistent>
      <v-card>
        <v-card-title class="text-h6">Filtrar empleados</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="filtros.nombre"
            label="Buscar por nombre o apellido"
            clearable
            prepend-inner-icon="mdi-magnify"
            density="comfortable"
          />

          <v-select
            v-model="filtros.cargo"
            :items="cargosUnicos"
            label="Cargo"
            clearable
            prepend-inner-icon="mdi-briefcase"
            density="comfortable"
          />

          <v-select
            v-model="filtros.estado"
            :items="['Activo', 'Inactivo']"
            label="Estado"
            clearable
            prepend-inner-icon="mdi-account-check"
            density="comfortable"
          />
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn text @click="dialogFiltros = false">Cerrar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Diálogo para agregar/editar empleado -->
    <v-dialog v-model="dialog" max-width="600px">
      <v-card>
        <v-card-title>
          <span class="text-h6">{{ formTitle }}</span>
        </v-card-title>
        <v-card-text>
          <v-form ref="empleadoForm" lazy-validation>
            <!-- Campo fijo para tipo: empleado -->
            <v-text-field v-model="form.pers_nombres" label="Nombres" required></v-text-field>
            <v-text-field v-model="form.pers_apellido_paterno" label="Apellido Paterno" required></v-text-field>
            <v-text-field v-model="form.pers_apellido_materno" label="Apellido Materno"></v-text-field>
            <!-- Select para Tipo de Documento -->
            <v-select
              v-model="form.tidi_id"
              :items="tidiOptions"
              item-value="tidi_id"
              item-title="tidi_descripcion"
              label="Tipo de Documento"
              required
            ></v-select>
            <v-text-field v-model="form.pers_numero_documento_identidad" label="Número de Documento" required></v-text-field>
  
            <!-- Sección para Fecha de Nacimiento y Sexo -->
          <template v-if="!isMobile">
            <!-- Desktop: Mismo renglón -->
            <v-row>
              <v-col cols="6">
                <v-menu
                  v-model="menuFechaNacimiento"
                  transition="scale-transition"
                  offset-y
                  max-width="320"
                  min-width="auto"
                >
                  <template #activator="{ on, attrs }">
                    <v-text-field
                      v-model="formattedFecha"
                      label="Fecha de Nacimiento"
                      prepend-icon="mdi-calendar"
                      readonly
                      v-bind="attrs"
                      v-on="on"
                    />
                  </template>
                  <v-date-picker
                    v-model="form.pers_fecha_nacimiento"
                    locale="es"
                    @update:modelValue="menuFechaNacimiento = false"
                  />
                </v-menu>
              </v-col>
              <v-col cols="6">
                <v-select
                  v-model="form.pers_sexo"
                  :items="sexOptions"
                  item-value="value"
                  item-title="text"
                  label="Sexo"
                  required
                ></v-select>
              </v-col>
            </v-row>
          </template>
          <template v-else>
            <!-- Mobile: Cada campo en fila separada -->
            <v-row>
              <v-col cols="12">
                <v-menu
                  v-model="menuFechaNacimiento"
                  transition="scale-transition"
                  offset-y
                  max-width="320"
                  min-width="auto"
                >
                  <template #activator="{ on, attrs }">
                    <v-text-field
                      v-model="formattedFecha"
                      label="Fecha de Nacimiento"
                      prepend-icon="mdi-calendar"
                      readonly
                      v-bind="attrs"
                      v-on="on"
                    />
                  </template>
                  <v-date-picker
                    v-model="form.pers_fecha_nacimiento"
                    locale="es"
                    @update:modelValue="menuFechaNacimiento = false"
                  />
                </v-menu>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12">
                <v-select
                  v-model="form.pers_sexo"
                  :items="sexOptions"
                  item-value="value"
                  item-title="text"
                  label="Sexo"
                  required
                ></v-select>
              </v-col>
            </v-row>
          </template>
  
            <!-- Ubigeo: Departamento -->
            <v-select
              v-model="form.ubig_codigo_departamento"
              :items="departments"
              item-value="ubig_codigo_departamento"
              item-title="ubig_descripcion_departamento"
              label="Departamento"
              required
            ></v-select>
  
            <!-- Ubigeo: Provincia -->
            <v-select
              v-model="form.ubig_codigo_provincia"
              :items="provinces"
              item-value="ubig_codigo_provincia"
              item-title="ubig_descripcion_provincia"
              label="Provincia"
              required
            ></v-select>
  
            <!-- Ubigeo: Distrito -->
            <v-select
              v-model="form.ubig_codigo_distrito"
              :items="districts"
              item-value="ubig_codigo_distrito"
              item-title="ubig_descripcion_distrito"
              label="Distrito"
              required
            ></v-select>

<!-- Nuevo campo: Teléfono Móvil -->
<v-text-field
v-model="form.pers_telefono_movil1"
label="Teléfono Móvil"
required
></v-text-field>

<!-- Nuevo campo: Correo Electrónico -->
<v-text-field
v-model="form.pers_correo_electronico"
label="Correo Electrónico"
required
></v-text-field>
  
            <v-select
              v-model="form.pers_grupo_sanguineo"
              :items="grupoSanguineoOptions"
              label="Grupo Sanguíneo"
              required
            ></v-select>
            <v-select
            v-if="form.pers_id"
            v-model="form.pers_estado"
            :items="estadoOptions"
            label="Estado"
            required
          ></v-select>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="closeDialog">Cancelar</v-btn>
          <v-btn color="primary" @click="saveEmpleado">Guardar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
  
  <script>
  import { ref, computed, onMounted, watch } from 'vue'
  import axios from 'axios'
  export default {
    name: 'EmpleadosPage',
    setup() {

      const filtros = ref({
        nombre: '',
        cargo: null,
        estado: null
      });

      const empleadosFiltrados = computed(() => {
      const nombreFiltro = (filtros.value.nombre || '').toLowerCase();
      const cargoFiltro = filtros.value.cargo || '';
      const estadoFiltro = filtros.value.estado || '';

      return empleadosConIndice.value.filter(empleado => {
        const nombreCompleto = `${empleado.pers_nombres} ${empleado.pers_apellido_paterno} ${empleado.pers_apellido_materno}`.toLowerCase();

        return (
          (!nombreFiltro || nombreCompleto.includes(nombreFiltro)) &&
          (!cargoFiltro || empleado.emca_descripcion === cargoFiltro) &&
          (!estadoFiltro || empleado.pers_estado === estadoFiltro)
        );
      });
    });


        
      const requiredRule = v => !!v || 'Este campo es obligatorio';
      const empleadoForm = ref(null);

      // Obtener token y profile desde localStorage
        const token = localStorage.getItem('token')
        const profile = localStorage.getItem('profile')

        
        const estadoOptions = ref([
        { title: 'Activo', value: 'A' },
        { title: 'Inactivo', value: 'I' }
        ]);
        
        // Crear instancia de axios con configuración global
        const apiClient = axios.create({
            baseURL: 'https://amsoftsolution.com/amss/ws/',
            headers: { Authorization: `Bearer ${token}` }
        });

      // Datos reactivos
      const empleados = ref([]);
      const dialog = ref(false);
      const menuFechaNacimiento = ref(false);
      const currentPage = ref(1);
      const form = ref({
        pers_id: null,
        pers_nombres: '',
        pers_apellido_paterno: '',
        pers_apellido_materno: '',
        pers_numero_documento_identidad: '',
        tidi_id: null,
        pers_fecha_nacimiento: null,
        pers_sexo: '',
        ubig_codigo_departamento: null,
        ubig_codigo_provincia: null,
        ubig_codigo_distrito: null,
        pers_grupo_sanguineo: ''
      });
  
      // Opciones para selects
      const tidiOptions = ref([]);
      const grupoSanguineoOptions = ref(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']);
      const sexOptions = ref([
        { value: 'M', text: 'Masculino' },
        { value: 'F', text: 'Femenino' }
      ]);
  
      // Ubigeo: Se carga una sola vez mediante el API unificado
      const ubigeoData = ref([]);
      const fetchUbigeoData = async () => {
        try {
          const res = await axios.get('https://amsoftsolution.com/amss/ws/wsListaUbigeo.php', {
            params: { av_profile: profile },
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.data.status) {
            ubigeoData.value = res.data.data;
          }
        } catch (error) {
          console.error('Error al cargar ubigeo:', error);
        }
      };
  
      // Propiedades computadas para ubigeo
      const departments = computed(() => ubigeoData.value);
      const provinces = computed(() => {
        if (!form.value.ubig_codigo_departamento) return [];
        const dept = ubigeoData.value.find(
          d => d.ubig_codigo_departamento === form.value.ubig_codigo_departamento
        );
        return dept ? dept.provincias : [];
      });
      const districts = computed(() => {
        if (!form.value.ubig_codigo_departamento || !form.value.ubig_codigo_provincia) return [];
        const dept = ubigeoData.value.find(
          d => d.ubig_codigo_departamento === form.value.ubig_codigo_departamento
        );
        if (!dept) return [];
        const prov = dept.provincias.find(
          p => p.ubig_codigo_provincia === form.value.ubig_codigo_provincia
        );
        return prov ? prov.distritos : [];
      });
  
      const cargosUnicos = computed(() => {
        const cargos = empleados.value.map(emp => emp.emca_descripcion).filter(Boolean);
        return [...new Set(cargos)];
      });

      // Watchers para reiniciar los selects:
      watch(() => form.value.ubig_codigo_departamento, (newVal, oldVal) => {
        // Solo reinicia si oldVal ya tenía un valor (para evitar reinicio al cargar inicialmente)
        if (oldVal != null && newVal !== oldVal) {
          form.value.ubig_codigo_provincia = null;
          form.value.ubig_codigo_distrito = null;
        }
      });
      watch(() => form.value.ubig_codigo_provincia, (newVal, oldVal) => {
        if (oldVal != null && newVal !== oldVal) {
          form.value.ubig_codigo_distrito = null;
        }
      });
  
      // Otras variables y funciones
      const tableHeaders = [
        { title: 'Nro', value: 'correlativo', sortable: false },
        { title: 'Apellido Paterno', value: 'pers_apellido_paterno' },
        { title: 'Apellido Materno', value: 'pers_apellido_materno' },
        { title: 'Nombres', value: 'pers_nombres' },
        { title: 'Tipo doc', value: 'tipo_documento_identidad_abreviacion' },
        { title: 'Documento', value: 'pers_numero_documento_identidad' },
        { title: 'Sexo', value: 'pers_sexo' },
        { title: 'Cargo', value: 'emca_descripcion' },
        { title: 'Estado', value: 'pers_estado' },
        { title: 'Acciones', value: 'actions', sortable: false }
      ];
  
      const isMobile = computed(() => window.innerWidth < 600);
      const itemsPerPageMobile = 5;
      const paginatedEmpleados = computed(() => {
        const start = (currentPage.value - 1) * itemsPerPageMobile;
        return empleadosFiltrados.value.slice(start, start + itemsPerPageMobile);
      });
      const mobilePageCount = computed(() =>
        Math.ceil(empleadosFiltrados.value.length / itemsPerPageMobile)
      );
      const empleadosConIndice = computed(() =>
        empleados.value.map((item, index) => ({ ...item, correlativo: index + 1 }))
      );
      const formTitle = computed(() => (form.value.pers_id ? 'Editar Empleado' : 'Agregar Empleado'));
  
      // Formateo de la fecha en dd/mm/yyyy
      const formattedFecha = computed({
        get() {
          if (!form.value.pers_fecha_nacimiento) return '';
          const date = new Date(form.value.pers_fecha_nacimiento);
          const day = ('0' + date.getDate()).slice(-2);
          const month = ('0' + (date.getMonth() + 1)).slice(-2);
          const year = date.getFullYear();
          return `${day}/${month}/${year}`;
        },
        set(val) {
          const [day, month, year] = val.split('/');
          form.value.pers_fecha_nacimiento = new Date(year, month - 1, day);
        }
      });
  
      // Cargar Empleados
      const loadEmpleados = async () => {
        try {
          const res = await apiClient.get('wsConsultaEmpleados.php', {
            params: { av_profile: profile }
          });
          if (res.data.status) {
            empleados.value = res.data.data;
          } else {
            console.error('No se obtuvieron resultados');
          }
        } catch (error) {
          console.error('Error al cargar empleados', error);
        }
      };
  
      // Abrir diálogo para agregar/editar empleado
      const openDialog = async (item = null) => {
        // Asegurarse de que el calendario esté cerrado
        menuFechaNacimiento.value = false;
        if (item) {
          form.value = { ...item };
          if (form.value.pers_fecha_nacimiento) {
            form.value.pers_fecha_nacimiento = new Date(form.value.pers_fecha_nacimiento);
          }
          
          if (form.value.pers_estado === 'Activo') {
            form.value.pers_estado = 'A';
            } else if (form.value.pers_estado === 'Inactivo') {
            form.value.pers_estado = 'I';
            }
          // Al editar, los watchers preservarán los valores actuales si no se cambian
        } else {
          form.value = {
            pers_id: null,
            pers_nombres: '',
            pers_apellido_paterno: '',
            pers_apellido_materno: '',
            pers_numero_documento_identidad: '',
            tidi_id: null,
            pers_fecha_nacimiento: null,
            pers_sexo: '',
            ubig_codigo_departamento: null,
            ubig_codigo_provincia: null,
            ubig_codigo_distrito: null,
            pers_grupo_sanguineo: ''
          };
        }
        dialog.value = true;
      };
  
      const closeDialog = () => {
        dialog.value = false;
      };

      function scrollToFirstInvalidField() {
        // Esperamos al siguiente tick para que los errores se muestren
        requestAnimationFrame(() => {
          const firstErrorField = document.querySelector('.campo-obligatorio input:invalid, .campo-obligatorio .v-input--error input, .campo-obligatorio .v-input--error .v-field__input');
          if (firstErrorField) {
            firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
            firstErrorField.focus();
          }
        });
      }
  
      const saveEmpleado = async () => {
        const formValid = await empleadoForm.value.validate();
        if (!formValid.valid) {
          scrollToFirstInvalidField();
          return; // No guardar si hay errores
        }
        if (form.value.pers_id) {
            try {
            // Construir el objeto de parámetros para la API.
            const data = {
                ai_pers_id: form.value.pers_id,
                av_pers_apellido_paterno: form.value.pers_apellido_paterno,
                av_pers_apellido_materno: form.value.pers_apellido_materno,
                av_pers_nombres: form.value.pers_nombres,
                ac_tidi_id: form.value.tidi_id,
                av_pers_numero_documento_identidad: form.value.pers_numero_documento_identidad,
                adt_pers_fecha_nacimiento: form.value.pers_fecha_nacimiento
                    ? new Date(form.value.pers_fecha_nacimiento).toISOString().split('T')[0]
                    : null,
                ac_pers_sexo: form.value.pers_sexo,
                ac_ubig_codigo_departamento: form.value.ubig_codigo_departamento,
                ac_ubig_codigo_provincia: form.value.ubig_codigo_provincia,
                ac_ubig_codigo_distrito: form.value.ubig_codigo_distrito,
                av_pers_direccion: form.value.pers_direccion,
                av_pers_direccion_referencia: form.value.pers_direccion_referencia,
                av_pers_telefono_movil1: form.value.pers_telefono_movil1,
                av_pers_telefono_movil2: form.value.pers_telefono_movil2,
                av_pers_correo_electronico: form.value.pers_correo_electronico,
                av_pers_grupo_sanguineo: form.value.pers_grupo_sanguineo,
                av_pers_comentario: form.value.pers_comentario,
                av_pers_foto: form.value.pers_foto,
                ac_pers_estado: form.value.pers_estado,
                av_pers_usuario_modificacion: form.value.usuario_modificacion,
                av_profile: profile
                };

                const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
                };
            // Se realiza la petición POST al API
            const res = await axios.post('https://amsoftsolution.com/amss/ws/wsActualizaEmpleado.php', data, config);
            if (res.data.status) {
            console.log('Empleado actualizado exitosamente');
            // Aquí puedes recargar la lista de empleados o realizar otra acción necesaria.
            } else {
            console.error('Error al actualizar empleado:', res.data.message);
            }
        } catch (error) {
            console.error('Error en la petición de actualización:', error);
        }
        } else {
            try {
                const data = {
                    ac_pers_tipo: 'E', //empleados
                    av_pers_apellido_paterno: form.value.pers_apellido_paterno,
                    av_pers_apellido_materno: form.value.pers_apellido_materno,
                    av_pers_nombres: form.value.pers_nombres,
                    ac_tidi_id: form.value.tidi_id,
                    av_pers_numero_documento_identidad: form.value.pers_numero_documento_identidad,
                    adt_pers_fecha_nacimiento: form.value.pers_fecha_nacimiento
                    ? new Date(form.value.pers_fecha_nacimiento).toISOString().split('T')[0]
                    : null,
                    ac_pers_sexo: form.value.pers_sexo,
                    ac_ubig_codigo_departamento: form.value.ubig_codigo_departamento,
                    ac_ubig_codigo_provincia: form.value.ubig_codigo_provincia,
                    ac_ubig_codigo_distrito: form.value.ubig_codigo_distrito,
                    av_pers_direccion: form.value.pers_direccion,
                    av_pers_direccion_referencia: form.value.pers_direccion_referencia,
                    av_pers_telefono_movil1: form.value.pers_telefono_movil1,
                    av_pers_telefono_movil2: form.value.pers_telefono_movil2,
                    av_pers_correo_electronico: form.value.pers_correo_electronico,
                    av_pers_grupo_sanguineo: form.value.pers_grupo_sanguineo,
                    av_pers_comentario: form.value.pers_comentario,
                    av_pers_foto: form.value.pers_foto,
                    av_profile: profile
                };

                const config = {
                    headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                    }
                };

                const res = await axios.post('https://amsoftsolution.com/amss/ws/wsRegistraEmpleado.php', data, config);
                if (res.data.status) {
                    console.log('Empleado registrado exitosamente');
                } else {
                    console.error('Error al registrar Empleado:', res.data.message);
                }
                } catch (error) {
                console.error('Error en la petición de registro:', error);
                }
            }
            await loadEmpleados();
            closeDialog();
            };
  
      onMounted(async () => {
        await loadEmpleados();
        await fetchTidiOptions();
        await fetchUbigeoData();
      });
  
      // Funciones para cargar TDI (se deja el API existente)
      const fetchTidiOptions = async () => {
        try {
          const res = await axios.get('https://amsoftsolution.com/amss/ws/wsListaTDI.php', {
            params: { ac_tidi_estado: 'A', av_profile: profile },
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.data.status) {
            tidiOptions.value = res.data.data;
          }
        } catch (error) {
          console.error('Error al cargar tipos de documento', error);
        }
      };
  
      return {
        empleados,
        empleadosConIndice,
        dialog,
        form,
        menu: menuFechaNacimiento,
        tidiOptions,
        departments,
        provinces,
        districts,
        grupoSanguineoOptions,
        tableHeaders,
        isMobile,
        currentPage,
        paginatedEmpleados,
        mobilePageCount,
        itemsPerPageMobile,
        formTitle,
        formattedFecha,
        sexOptions,
        estadoOptions,
        openDialog,
        closeDialog,
        saveEmpleado,
        requiredRule,
        empleadoForm,
        filtros,
        empleadosFiltrados,
        cargosUnicos
      };
    }
  };
  </script>
  
  <style scoped>
  /* Estilos para mejorar la experiencia responsiva */
  </style>
  