<template>
  <v-container fluid>
    <!-- Encabezado: Título y botón para Agregar Aula -->
    <v-row class="mb-2" align="center">
  <!-- Columna para el título -->
  <v-col cols="6">
    <h1 class="mb-2">Mis Aulas</h1>
  </v-col>
  <!-- Columna para los botones, alineados a la derecha -->
  <v-col cols="6" class="d-flex justify-end">
    <v-btn color="primary" class="mr-2" @click="abrirDialogGestionarHoras">
      Gestionar horas
    </v-btn>
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
                    <template #item.aude_estado="{ item }">
                      <v-chip v-if="item.aude_estado === 'A'" color="green">Activo</v-chip>
                      <v-chip v-else color="red">Inactivo</v-chip>
                    </template>
                    <template #item.accion="{ item }">
                      <div class="table-action">
                        <v-btn icon variant="text" @click="editarDetalle(item)">
                          <v-icon>mdi-pencil</v-icon>
                        </v-btn>
                        <!-- Botón para abrir la gestión del horario -->
                        <v-btn
                          icon
                          variant="text"
                          color="primary"
                          title="Gestionar Horario Escolar"
                          @click="abrirDialogHorario(item)"
                        >
                          <v-icon>mdi-calendar-clock</v-icon>
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
            <!-- Botones: Editar y Expandir -->
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
                    <!-- Botón para gestionar horario -->
                    <v-btn
                      icon
                      variant="text"
                      color="primary"
                      title="Gestionar Horario Escolar"
                      style="position: absolute; top: 8px; right: 8px;"
                      @click="abrirDialogHorario(detalle)"
                    >
                      <v-icon>mdi-calendar-clock</v-icon>
                    </v-btn>
                    <v-card-text style="padding-top: 40px;">
                      <div><strong>Detalle N°:</strong> {{ ((detailPages[aula.aula_id] - 1) * itemsPerDetailPage) + dIndex + 1 }}</div>
                      <div><strong>Turno:</strong> {{ detalle.turn_nombre }}</div>
                      <div><strong>Nivel:</strong> {{ detalle.nive_nombre }}</div>
                      <div><strong>Grado:</strong> {{ detalle.grad_nombre }}</div>
                      <div><strong>Sección:</strong> {{ detalle.secc_nombre }}</div>
                      <div>
                        <strong>Estado:</strong>
                        <v-chip v-if="detalle.aude_estado === 'A'" color="green">Activo</v-chip>
                        <v-chip v-else color="red">Inactivo</v-chip>
                      </div>
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
          <v-spacer />
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
          <v-spacer />
          <v-btn text @click="dialogEditarAula = false">Cancelar</v-btn>
          <v-btn color="primary" @click="actualizarAula">Guardar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Diálogo para Agregar / Editar Aula Detalle -->
    <v-dialog v-model="dialogDetalle" max-width="600">
      <v-card>
        <v-card-title>
          <span class="text-h6">
            {{ isEditingDetalle ? 'Editar Detalle del Aula' : 'Agregar Detalle del Aula' }}
          </span>
        </v-card-title>
        <v-card-text>
          <v-form ref="formDetalle">
            <v-select
              v-model="detalle.ai_empl_id"
              :items="docentes"
              item-title="docente_descripcion"
              item-value="empl_id"
              label="Tutor (opcional)"
            />
            <v-select
              v-model="detalle.ai_turn_id"
              :items="filtros.turnos"
              item-title="turn_nombre"
              item-value="turn_id"
              label="Turno"
              :rules="[requiredRule]"
              required
            />
            <v-select
              v-model="detalle.ac_nive_id"
              :items="filtros.niveles"
              item-title="nive_nombre"
              item-value="nive_id"
              label="Nivel"
              :rules="[requiredRule]"
              required
            />
            <v-select
              v-model="detalle.ai_grad_id"
              :items="gradosFiltrados"
              item-title="grad_nombre"
              item-value="grad_id"
              label="Grado"
              :rules="[requiredRule]"
              required
            />
            <v-select
              v-model="detalle.ai_secc_id"
              :items="seccionesFiltradas"
              item-title="secc_nombre"
              item-value="secc_id"
              label="Sección"
              :rules="[requiredRule]"
              required
            />
            <v-switch
              v-if="isEditingDetalle"
              v-model="detalle.ac_aude_estado"
              label="Estado"
              true-value="A"
              false-value="I"
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="cerrarDialogDetalle">Cancelar</v-btn>
          <v-btn color="primary" @click="guardarDetalle">
            {{ isEditingDetalle ? 'Actualizar' : 'Guardar' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Diálogo para GESTIONAR HORARIO (Rangos y Días/Cursos) -->
    <v-dialog v-model="dialogHorario" max-width="800px">
      <v-card>
        <v-card-title>
          <span class="text-h6">Gestionar Horario Escolar</span>
        </v-card-title>

        <v-card-text>

          <!-- VERSIÓN DESKTOP: Tabla -->
          <template v-if="isDesktop">
            <v-data-table
              :items="horarios"
              :headers="headersHorario"
              item-key="hesh_id"
              class="elevation-1"
            >
            <template #item.numero="{ index }">
              {{ ((currentRangePage - 1) * itemsPerRangePage) + index + 1 }}
            </template>

            <template #item.dias="{ item }">
              <div v-for="(dc, index) in item.dias" :key="index" class="py-2">
                <div><strong>{{ dc.dia }}</strong></div>
                <div>{{ dc.area_educativa }}</div>
                <div class="caption grey--text">{{ dc.docente }}</div>
                <div>
                  <v-chip v-if="dc.hesc_estado === 'A'" color="green" dark>Activo</v-chip>
                  <v-chip v-else color="red" dark>Inactivo</v-chip>
                </div>
                <v-btn icon small @click="abrirDialogEditDiaCurso(dc, item)">
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
              </div>
              <v-btn small color="success" variant="text" class="mt-2" @click="abrirDialogNuevoDiaCurso(item)">
                + Agregar Día/Curso
              </v-btn>
            </template>
            
            
            </v-data-table>
          </template>

          <!-- VERSIÓN MOBILE: Tarjetas -->
          <!-- VERSIÓN MOBILE: Tarjetas -->
<template v-else>
  <v-row dense>
    <v-col
      v-for="(rango, index) in paginatedHorarios"
      :key="rango.hesh_id"
      cols="12"
      class="mb-2"
    >
      <v-card outlined style="position: relative; text-align: left;">
        <!-- Botón para editar el Rango -->
        <v-btn
          icon
          variant="text"
          color="primary"
          style="position: absolute; top: 8px; right: 8px;"
          @click="abrirDialogEditRango(rango)"
        >
          <v-icon>mdi-pencil</v-icon>
        </v-btn>

        <v-card-text style="padding-top: 40px;">
          <div>
            <strong>N°:</strong>
            {{ ((currentRangePage - 1) * itemsPerRangePage) + index + 1 }}
          </div>
          <div><strong>Nivel:</strong> {{ rango.nive_nombre }}</div>
          <div><strong>Hora Inicio:</strong> {{ rango.hesh_hora_inicio }}</div>
          <div><strong>Hora Fin:</strong> {{ rango.hesh_hora_fin }}</div>
          <div>
            <strong>Recreo:</strong>
            {{ rango.hesh_indicador_recreo === 'S' ? 'Sí' : 'No' }}
          </div>
          <div>
            <strong>Estado:</strong>
            <v-chip v-if="rango.hesh_estado === 'A'" color="green">Activo</v-chip>
            <v-chip v-else color="red">Inactivo</v-chip>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
  <v-pagination
    v-if="totalHorarios > 1"
    v-model="currentRangePage"
    :length="totalHorarios"
    class="mt-2"
  />
</template>

        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn text @click="dialogHorario = false">Cerrar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>


    <!-- Diálogo para Gestionar Horas (nuevo, idéntico a dialogHorario) -->
<!-- Diálogo para Gestionar Horas (nuevo, idéntico a dialogHorario pero con filtro) -->
<v-dialog v-model="dialogGestionarHoras" max-width="800px">
  <v-card>
    <v-card-title>
      <span class="text-h6">Gestionar horas</span>
    </v-card-title>

    <v-card-text>
      <!-- Filtro de Nivel -->
      <v-select
        v-model="filtroNivel"
        :items="nivelOptions"
        label="Nivel"
        item-title="text"
        item-value="value"
        dense
        outlined
        class="mb-3"
      />

      <!-- Botón global para crear Rango -->
      <div class="d-flex justify-end mb-3">
        <v-btn color="primary" @click="abrirDialogNuevoRango">
          + Nuevo Rango
        </v-btn>
      </div>

      <!-- VERSIÓN DESKTOP: Tabla -->
      <template v-if="isDesktop">
        <v-data-table
          :items="paginatedRangos"
          :headers="headersHorarioRango"
          item-key="hesh_id"
          class="elevation-1"
        >
          <template #item.numero="{ index }">
            {{ ((currentRangePage - 1) * itemsPerRangePage) + index + 1 }}
          </template>
          <template #item.dias="{ item }">
            <div v-for="(dc, index) in item.dias" :key="index" class="py-2">
              <div><strong>{{ dc.dia }}</strong></div>
              <div>{{ dc.area_educativa }}</div>
              <div class="caption grey--text">{{ dc.docente }}</div>
              <div>
              <v-chip v-if="dc.hesc_estado === 'A'" color="green" dark>Activo</v-chip>
              <v-chip v-else color="red" dark>Inactivo</v-chip>
            </div>
              <v-btn icon small @click="abrirDialogEditDiaCurso(dc, item)">
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
            </div>
            <v-btn small color="success" variant="text" class="mt-2" @click="abrirDialogNuevoDiaCurso(item)">
              + Agregar Día/Curso
            </v-btn>
          </template>
          <template #item.hesh_indicador_recreo="{ item }">
            <span>{{ item.hesh_indicador_recreo === 'S' ? 'Sí' : 'No' }}</span>
          </template>

          <template #item.hesh_estado="{ item }">
            <v-chip v-if="item.hesh_estado === 'A'" color="green">Activo</v-chip>
            <v-chip v-else color="red">Inactivo</v-chip>
          </template>

          <template #item.acciones="{ item }">
            <v-btn icon @click="abrirDialogEditRango(item)">
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
          </template>
        </v-data-table>
        
        <v-pagination
            v-if="totalRangePages > 1"
            v-model="currentRangePage"
            :length="totalRangePages"
            class="mt-2"
          />
      </template>

      <!-- VERSIÓN MOBILE: Tarjetas -->
      <template v-else>
        <v-row dense>
          <v-col
            v-for="(rango, index) in paginatedRangos"
            :key="rango.hesh_id"
            cols="12"
            class="mb-2"
          >
            <v-card outlined style="position: relative; text-align: left;">
              <!-- Botón para editar el Rango -->
              <v-btn
                icon
                variant="text"
                color="primary"
                style="position: absolute; top: 8px; right: 8px;"
                @click="abrirDialogEditRango(rango)"
              >
                <v-icon>mdi-pencil</v-icon>
              </v-btn>

              <v-card-text style="padding-top: 40px;">
                <div>
                  <strong>N°:</strong>
                  {{ ((currentRangePage - 1) * itemsPerRangePage) + index + 1 }}
                </div>
                <div><strong>Nivel:</strong> {{ rango.nive_nombre }}</div>
                <div><strong>Hora Inicio:</strong> {{ rango.hesh_hora_inicio }}</div>
                <div><strong>Hora Fin:</strong> {{ rango.hesh_hora_fin }}</div>
                <div>
                  <strong>Recreo:</strong>
                  {{ rango.hesh_indicador_recreo === 'S' ? 'Sí' : 'No' }}
                </div>
                <div>
                  <strong>Estado:</strong>
                  <v-chip v-if="rango.hesh_estado === 'A'" color="green">Activo</v-chip>
                  <v-chip v-else color="red">Inactivo</v-chip>
                </div>

              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
        <!-- Paginación para rangos en mobile -->
  <v-pagination
    v-if="totalRangePages > 1"
    v-model="currentRangePage"
    :length="totalRangePages"
    class="mt-2"
  />
      </template>
    </v-card-text>

    <v-card-actions>
      <v-spacer />
      <v-btn text @click="dialogGestionarHoras = false">Cerrar</v-btn>
    </v-card-actions>
  </v-card>
</v-dialog>




    <!-- Diálogo para CREAR/EDITAR RANGO DE HORAS -->
    <v-dialog v-model="dialogEditRango" max-width="400px">
      <v-card>
        <v-card-title>
          <span class="text-h6">
            {{ datosRango.hesh_id ? 'Editar Rango' : 'Nuevo Rango' }}
          </span>
        </v-card-title>
        <v-card-text>
          <v-form ref="formRango">
            <v-select
              v-model="datosRango.nive_id"
              :items="nivelHorariosOptions"
              item-title="text"
              item-value="value"
              label="Nivel"
              required
            ></v-select>
            <v-text-field
              v-model="datosRango.hesh_hora_inicio"
              label="Hora Inicio (HH:MM)"
              :rules="[timeRule]"
              maxlength="5"
              required
            ></v-text-field>
            <v-text-field
              v-model="datosRango.hesh_hora_fin"
              label="Hora Fin (HH:MM)"
              :rules="[timeRule, endTimeRule]"
              maxlength="5"
              required
            ></v-text-field>
            <v-select
              v-model="datosRango.hesh_indicador_recreo"
              :items="indicadorRecreoItems"
              item-title="title"
              item-value="key"
              label="¿Es Recreo?"
            ></v-select>
            <v-select
              v-if="datosRango.hesh_id"
              v-model="datosRango.hesh_estado"
              item-title="title"
              item-value="key"
              :items="estadoRangoOptions"
              label="Estado"
            ></v-select>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="dialogEditRango = false">Cancelar</v-btn>
          <v-btn color="primary" @click="guardarRango">
            {{ datosRango.hesh_id ? 'Actualizar' : 'Guardar' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Diálogo para CREAR/EDITAR DÍA/CURSO -->
    <v-dialog v-model="dialogDiaCurso" max-width="400px">
      <v-card>
        <v-card-title>
          <span class="text-h6">
            {{ datosDiaCurso.hesc_id ? 'Editar Día/Curso' : 'Nuevo Día/Curso' }}
          </span>
        </v-card-title>
        <v-card-text>
          <v-form ref="formDiaCurso">
            <v-select
              v-model="datosDiaCurso.dia_id"
              :items="listaDias"
              item-title="dia_descripcion"
              item-value="dia_id"
              label="Día"
              required
            ></v-select>
            <v-select
              v-model="datosDiaCurso.daed_id"
              :items="listaCursos"
              item-title="label"
              item-value="daed_id"
              label="Área Educativa y Docente"
              required
            ></v-select>
            <v-select
              v-if="datosDiaCurso.hesc_id"
              v-model="datosDiaCurso.hesc_estado"
              item-title="title"
              item-value="key"
              :items="estadoRangoOptions"
              label="Estado"
            ></v-select>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="dialogDiaCurso = false">Cancelar</v-btn>
          <v-btn color="primary" @click="guardarDiaCurso">
            {{ datosDiaCurso.hesc_id ? 'Actualizar' : 'Guardar' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, reactive, onMounted, watch, nextTick } from 'vue'
import { useDisplay } from 'vuetify'
//import { useRouter } from 'vue-router'
import axios from 'axios'
import { safeArray } from '@/utils/global'

const filteredRangos = computed(() => {
  if (filtroNivel.value === '0') {
    return rangosHorarios.value;
  }
  return rangosHorarios.value.filter(rango => rango.nive_id === filtroNivel.value);
});

// Opciones del filtro Nivel
const nivelOptions = [
  { text: 'Todos', value: '0' },
  { text: 'Inicial', value: 'I' },
  { text: 'Primaria', value: 'P' },
  { text: 'Secundaria', value: 'S' }
]

const nivelHorariosOptions = [
  { text: 'Inicial', value: 'I' },
  { text: 'Primaria', value: 'P' },
  { text: 'Secundaria', value: 'S' }
]

// Variable para almacenar la selección del filtro (por defecto "Todos")
const filtroNivel = ref('0')

// === VALIDACIONES ===
const requiredRule = value => !!value || 'Este campo es obligatorio'

// Validar formato HH:MM en 24 horas
const timeRule = value => {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(value) || 'Formato inválido (HH:MM)'
}

const ac_anio_escolar = localStorage.getItem("ac_anio_escolar") || 2025

// === DIALOGOS DE AULA (ORIGINALES) ===
const dialogAgregarAula = ref(false)
const dialogEditarAula = ref(false)
const dialogDetalle = ref(false)

// === MODELOS PARA AULA ===
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

// === MODELOS PARA AULA DETALLE ===
const detalle = reactive({
  ai_aude_id: null,
  ai_aula_id: null,
  ai_empl_id: null,
  ai_turn_id: null,
  ac_nive_id: null,
  ai_grad_id: null,
  ai_secc_id: null,
  ac_anio_escolar: ac_anio_escolar,
  ac_aude_estado: 'A'
})
const isEditingDetalle = ref(false)
const isCargandoDetalle = ref(false);

// === OPCIONES PARA ESTADO (AULA) ===
const estadoOptions = [
  { text: 'Activo', value: 'A' },
  { text: 'Inactivo', value: 'I' }
]

// === DATOS GLOBALES DE AULAS Y DETALLES ===
const allAulas = ref([])       // Obtenidos de wsListaAula
const allDetalles = ref([])    // Obtenidos de wsListaAulaDetalleAnioEscolar

// === DATOS PARA SELECTS DE DETALLE (DOCENTES, TURNOS, NIVELES, GRADOS, SECCIONES) ===
const docentes = ref([])
const filtros = reactive({
  turnos: [],
  niveles: [],
  grados: [],
  secciones: []
})
const gradosFiltrados = computed(() => {
  if (!detalle.ac_nive_id) return []
  return filtros.grados.filter(grad => grad.nive_id === detalle.ac_nive_id)
})
const seccionesFiltradas = computed(() => {
  if (!detalle.ai_grad_id) return []
  return filtros.secciones.filter(secc => secc.grad_id === detalle.ai_grad_id)
})

watch(() => detalle.ac_nive_id, () => {
  if (!isCargandoDetalle.value) {
    detalle.ai_grad_id = null
    detalle.ai_secc_id = null
  }
})
watch(() => detalle.ai_grad_id, () => {
  if (!isCargandoDetalle.value) {
    detalle.ai_secc_id = null
  }
})

// === PAGINACIÓN PARA AULAS ===
const currentAulaPage = ref(1)
const itemsPerAulaPage = ref(5)
const currentRangePage = ref(1)
const itemsPerRangePage = computed(() => isDesktop.value ? 10 : 5)

const totalAulaPages = computed(() =>
  Math.ceil(allAulas.value.length / itemsPerAulaPage.value)
)
const paginatedAulas = computed(() => {
  const data = safeArray(allAulas.value);
  const start = (currentAulaPage.value - 1) * itemsPerAulaPage.value
  return data.slice(start, start + itemsPerAulaPage.value)
})

const paginatedHorarios = computed(() => {
  const data = safeArray(horarios.value);
  const start = (currentRangePage.value - 1) * itemsPerRangePage.value;
  return data.slice(start, start + itemsPerRangePage.value);
});

const totalHorarios = computed(() => 
  Math.ceil(horarios.value.length / itemsPerRangePage.value)
);

const totalRangePages = computed(() => 
  Math.ceil(filteredRangos.value.length / itemsPerRangePage.value)
);

const paginatedRangos = computed(() => {
  const data = safeArray(filteredRangos.value);
  const start = (currentRangePage.value - 1) * itemsPerRangePage.value;
  return data.slice(start, start + itemsPerRangePage.value);
});

// === EXPAND/COLLAPSE AULA ===
const expandedAulaId = ref(null)
function isExpanded(aulaId) {
  return expandedAulaId.value === aulaId
}
function toggleExpand(aulaId) {
  expandedAulaId.value = expandedAulaId.value === aulaId ? null : aulaId
}

// === HEADERS PARA LA TABLA DE DETALLES (DENTRO DEL AULA) ===
const detalleHeaders = [
  { title: 'Turno', key: 'turn_nombre' },
  { title: 'Nivel', key: 'nive_nombre' },
  { title: 'Grado', key: 'grad_nombre' },
  { title: 'Sección', key: 'secc_nombre' },
  { title: 'Tutor', key: 'tutor' },
  { title: 'Estado', key: 'aude_estado' },
  { title: 'Acción', key: 'accion', sortable: false }
]

// === PAGINACIÓN PARA DETALLES (POR AULA) ===
const itemsPerDetailPage = ref(3)
const detailPages = reactive({})
function getDetalles(aulaId) {
  return safeArray(allDetalles.value).filter(d => Number(d.aula_id) === Number(aulaId))
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

// === BOTONES / MÉTODOS PARA AULA ===
function abrirDialogAgregar() {
  nuevaAula.value.aula_nombre = ''
  nuevaAula.value.aula_capacidad = null
  dialogAgregarAula.value = true
}
function guardarAula() {
  if (!nuevaAula.value.aula_nombre) return
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
  axios.post(baseUrl, data, config)
    .then(response => {
      console.log('Aula agregada:', response.data)
      dialogAgregarAula.value = false
      fetchAulas()
    })
    .catch(error => {
      console.error('Error al agregar aula:', error)
    })
}
function abrirDialogEditar(aula) {
  aulaSeleccionada.value = { ...aula }
  dialogEditarAula.value = true
}
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
  axios.post(baseUrl, data, config)
    .then(response => {
      console.log('Aula actualizada:', response.data)
      dialogEditarAula.value = false
      fetchAulas()
    })
    .catch(error => {
      console.error('Error al actualizar aula:', error)
    })
}

// === BOTONES / MÉTODOS PARA DETALLE AULA ===
function agregarDetalle(aula) {
  abrirDialogDetalle(null, aula.aula_id)
}
function editarDetalle(detalleData) {
  abrirDialogDetalle(detalleData)
}
function abrirDialogDetalle(detalleData = null, aula_id = null) {
  if (detalleData) {
    isEditingDetalle.value = true
    isCargandoDetalle.value = true
    detalle.ai_aude_id     = detalleData.aude_id
    detalle.ai_aula_id     = detalleData.aula_id
    detalle.ai_empl_id     = detalleData.empl_id || detalleData.ai_empl_id
    detalle.ai_turn_id     = detalleData.turn_id
    detalle.ac_nive_id     = detalleData.nive_id
    detalle.ai_grad_id     = detalleData.grad_id
    detalle.ai_secc_id     = detalleData.secc_id
    detalle.ac_anio_escolar= detalleData.ac_anio_escolar
    detalle.ac_aude_estado = detalleData.aude_estado
    nextTick(() => {
      isCargandoDetalle.value = false
    })
    if (detalleData.grad_id) {
      fetchCursos(detalleData.grad_id);
    }
  } else {
    isEditingDetalle.value = false
    Object.assign(detalle, {
      ai_aude_id: null,
      ai_aula_id: aula_id,
      ai_empl_id: null,
      ai_turn_id: null,
      ac_nive_id: null,
      ai_grad_id: null,
      ai_secc_id: null,
      ac_anio_escolar: ac_anio_escolar,
      ac_aude_estado: 'A'
    })
  }
  dialogDetalle.value = true
}
function cerrarDialogDetalle() {
  dialogDetalle.value = false
}
function guardarDetalle() {
  if (!formDetalle.value.validate()) return

  const token = localStorage.getItem("token")
  const profile = localStorage.getItem("profile")
  const config = {
    headers: { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }
  if (isEditingDetalle.value) {
    // Actualizar detalle
    const baseUrl = 'https://amsoftsolution.com/amss/ws/wsActualizaAulaDetalle.php'
    const data = {
      ai_aude_id: detalle.ai_aude_id,
      ai_aula_id: detalle.ai_aula_id,
      ai_empl_id: detalle.ai_empl_id,
      ai_turn_id: detalle.ai_turn_id,
      ac_nive_id: detalle.ac_nive_id,
      ai_grad_id: detalle.ai_grad_id,
      ai_secc_id: detalle.ai_secc_id,
      ac_aude_estado: detalle.ac_aude_estado,
      av_profile: profile
    }
    axios.post(baseUrl, data, config)
      .then(response => {
        console.log('Aula detalle actualizada:', response.data)
        cerrarDialogDetalle()
        fetchDetalles()
      })
      .catch(error => {
        console.error('Error al actualizar detalle:', error)
      })
  } else {
    // Registrar detalle
    const baseUrl = 'https://amsoftsolution.com/amss/ws/wsRegistraAulaDetalle.php'
    const data = {
      ai_aula_id: detalle.ai_aula_id,
      ai_empl_id: detalle.ai_empl_id || null,
      ai_turn_id: detalle.ai_turn_id,
      ac_nive_id: detalle.ac_nive_id,
      ai_grad_id: detalle.ai_grad_id,
      ai_secc_id: detalle.ai_secc_id,
      ac_anio_escolar: detalle.ac_anio_escolar,
      av_profile: profile
    }
    axios.post(baseUrl, data, config)
      .then(response => {
        console.log('Aula detalle registrada:', response.data)
        cerrarDialogDetalle()
        fetchDetalles()
      })
      .catch(error => {
        console.error('Error al registrar detalle:', error)
      })
  }
}

// === AGREGAMOS TODO LO RELACIONADO AL HORARIO ESCOLAR ===

// 1) Estados/refs para Horario
const dialogHorario = ref(false)
const dialogGestionarHoras = ref(false)

// Para abrir/cerrar el diálogo principal de horario
const horarios = ref([])           // Lista de rangos + días/cursos devueltos por la API
let currentAulaDetalleId = null  // Guardar el 'ai_aude_id' del detalle que estamos gestionando
let currentNivelId = null 

// 2) Estado para RANGOS
const dialogEditRango = ref(false)
const datosRango = reactive({
  hesh_id: null,
  nive_id: null,
  anes_id: null,
  hesh_hora_inicio: '',
  hesh_hora_fin: '',
  hesh_indicador_recreo: 'N',
  hesh_estado: 'A'
})

// 3) Estado para DÍA/CURSO
const dialogDiaCurso = ref(false)
const datosDiaCurso = reactive({
  nive_id: null,
  hesc_id: null,
  hesh_id: null,
  dia_id: null,
  daed_id: null,
  hesc_estado: 'A'
})

// 4) Listas auxiliares: días y cursos
const listaDias = ref([])
const listaCursos = ref([])

// 5) Items para selects
const indicadorRecreoItems = [
  { title: 'No (Clase)', key: 'N' },
  { title: 'Sí (Recreo)', key: 'S' }
]
const estadoRangoOptions = [
  { title: 'Activo', key: 'A' },
  { title: 'Inactivo', key: 'I' }
]

// 6) Columnas para la tabla de horarios
const headersHorario = [
  { title: 'N°', key: 'numero', sortable: false },
  { title: 'Inicio', key: 'hesh_hora_inicio' },
  { title: 'Fin', key: 'hesh_hora_fin' },
  { title: 'Recreo', key: 'hesh_indicador_recreo' },
  { title: 'Días/Curso(s)', key: 'dias', sortable: false }  // <-- Agrega esta línea
]

const headersHorarioRango = [
  { title: 'N°', key: 'numero', sortable: false },
  { title: 'Inicio', key: 'hesh_hora_inicio' },
  { title: 'Fin', key: 'hesh_hora_fin' },
  { title: 'Recreo', key: 'hesh_indicador_recreo' },
  { title: 'Estado', key: 'hesh_estado' },
  { title: 'Acciones', key: 'acciones', sortable: false }
]

// 7) Métodos para abrir el diálogo de Horario y cargar la data
function abrirDialogHorario(detalleData) {
  currentAulaDetalleId = detalleData.aude_id,
  currentNivelId = detalleData.nive_id
  if (detalleData.grad_id) {
    fetchCursos(detalleData.grad_id);
  } else {
    console.warn("No se proporcionó un grad_id para consultar los cursos.");
  }
  fetchHorarioEscolar(currentAulaDetalleId, currentNivelId)
  dialogHorario.value = true
}

function abrirDialogGestionarHoras(detalleData) {
  currentAulaDetalleId = detalleData.aude_id;
  currentNivelId = detalleData.nive_id;
  const currentGradId = detalleData.grad_id;
  // Si currentGradId existe, lo usamos para llamar a fetchCursos
  if (currentGradId) {
    fetchCursos(currentGradId);
  } else {
    console.warn("No se proporcionó un grad_id para consultar los cursos.");
  }
  filtroNivel.value = '0'

  dialogGestionarHoras.value = true
}

const rangosHorarios = ref([])

async function fetchHorarioRangos() {
  const token = localStorage.getItem("token")
  // Obtenemos el valor del ai_anes_id desde localStorage (o define un valor por defecto)
  const ai_anes_id = localStorage.getItem("anes_id")
  const profile = localStorage.getItem("profile")
  
  try {
    const { data } = await axios.get(
      'https://amsoftsolution.com/amss/ws/wsConsultaHorarioEscolarRango.php',
      {
        params: { ai_anes_id, av_profile: profile },
        headers: { Authorization: `Bearer ${token}` }
      }
    )
    if (data.status) {
      rangosHorarios.value = data.data
    } else {
      rangosHorarios.value = []
    }
  } catch (e) {
    console.error(e)
    rangosHorarios.value = []
  }
}

// 8) Consumir la API para obtener los rangos y días/cursos
async function fetchHorarioEscolar(audeId, niveId) {
  const token = localStorage.getItem("token")
  const profile = localStorage.getItem("profile")
  const anes_id = localStorage.getItem("anes_id")

  try {
    const { data } = await axios.get('https://amsoftsolution.com/amss/ws/wsConsultaHorarioEscolar.php', {
      params: { ai_anes_id: anes_id, ac_nive_id: niveId, ai_aude_id: audeId, av_profile: profile },
      headers: { Authorization: `Bearer ${token}` }
    })

    if (data.status) {
      horarios.value = data.data.map(rango => ({
        ...rango,
        dias: rango.dias.map(dc => {
      const match = listaCursos.value.find(c =>
        (c.curso || '').trim() === (dc.curso || '').trim() &&
        (c.docente || '').trim() === (dc.docente || '').trim()
      );
          return {
            dia: dc.dia,
            area_educativa: match?.curso || dc.curso,
            docente: match?.docente || dc.docente,
            daed_id: match?.daed_id || null,    // <–– aquí
            hesc_id: dc.hesc_id,   // <— preservamos el ID
            hesc_estado: dc.hesc_estado
          }
        })
      }))
    } else {
      horarios.value = []
    }
  } catch (e) {
    console.error(e)
    horarios.value = []
  }
}


// 9) Registrar/Actualizar RANGO
function abrirDialogNuevoRango() {
  const ai_anes_id = localStorage.getItem('anes_id')

  Object.assign(datosRango, {
    hesh_id: null,
    anes_id: ai_anes_id,
    nive_id: null,
    hesh_hora_inicio: '',
    hesh_hora_fin: '',
    hesh_indicador_recreo: 'N',
    hesh_estado: 'A'
  })
  dialogEditRango.value = true
}
function abrirDialogEditRango(rango) {
  Object.assign(datosRango, {
    hesh_id: rango.hesh_id,
    anes_id: rango.anes_id,
    nive_id: rango.nive_id,
    hesh_hora_inicio: rango.hesh_hora_inicio,
    hesh_hora_fin: rango.hesh_hora_fin,
    hesh_indicador_recreo: rango.hesh_indicador_recreo,
    hesh_estado: rango.hesh_estado
  })
  dialogEditRango.value = true
}
async function guardarRango() {
  // Validar formato HH:MM
  if (!formRango.value.validate()) return

  const token = localStorage.getItem("token")
  const profile = localStorage.getItem("profile") || "demo"
  const config = {
    headers: { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }

  // Registrar
  if (!datosRango.hesh_id) {
    const baseUrl = 'https://amsoftsolution.com/amss/ws/wsRegistraHorarioEscolarRango.php'
    const data = {
      ai_anes_id: datosRango.anes_id,
      ac_nive_id: datosRango.nive_id,
      ac_hesh_hora_inicio: datosRango.hesh_hora_inicio,
      ac_hesh_hora_fin: datosRango.hesh_hora_fin,
      ac_hesh_indicador_recreo: datosRango.hesh_indicador_recreo,
      av_profile: profile
    }
    axios.post(baseUrl, data, config)
      .then(response => {
        console.log('Rango Horario escolar registrado:', response.data)
        dialogEditRango.value = false        
        fetchHorarioRangos()
      })
      .catch(error => {
        console.error('Error al registrar rango horario escolar:', error)
      })
  }
  // Actualizar
  else {
    const baseUrl = 'https://amsoftsolution.com/amss/ws/wsActualizaHorarioEscolarRango.php'
    const data = {
      ai_hesh_id: datosRango.hesh_id,
      ac_nive_id: datosRango.nive_id,
      ac_hesh_hora_inicio: datosRango.hesh_hora_inicio,
      ac_hesh_hora_fin: datosRango.hesh_hora_fin,
      ac_hesh_indicador_recreo: datosRango.hesh_indicador_recreo,
      ac_hesh_estado: datosRango.hesh_estado,
      av_profile: profile
    }
    axios.post(baseUrl, data, config)
      .then(response => {
        console.log('Rango Horario escolar actualizado:', response.data)
        dialogEditRango.value = false
        fetchHorarioRangos()
      })
      .catch(error => {
        console.error('Error al actualizar rango horario escolar:', error)
      })

  }
}

// 10) Registrar/Actualizar Día-Curso
function abrirDialogNuevoDiaCurso(rango) {
  Object.assign(datosDiaCurso, {
    hesc_id: null,
    nive_id: rango.nive_id,
    aude_id: rango.aude_id,
    hesh_id: rango.hesh_id,
    dia_id: null,
    daed_id: null,
    hesc_estado: 'A'
  })
  dialogDiaCurso.value = true
}
function abrirDialogEditDiaCurso(dc, rango) {
  // No viene un ID de día/curso en la respuesta, a menos que lo incluyas en tu API
  // Podrías guardar hesc_id en "dc" para editar. 
  // Este ejemplo asume que sí existe "hesc_id" en la respuesta. Ajusta si es distinto.
  Object.assign(datosDiaCurso, {
    hesc_id: dc.hesc_id || null, // si tu API lo devuelve
    nive_id: rango.nive_id,
    aude_id: rango.aude_id || currentAulaDetalleId,
    hesh_id: rango.hesh_id,
    dia_id: buscarDiaIdPorNombre(dc.dia), // Buscar en listaDias
    daed_id: dc.daed_id,
    //daed_id: buscarCursoIdPorNombre(dc.curso),
    hesc_estado: dc.hesc_estado
  })
  dialogDiaCurso.value = true
}

// Helpers para obtener IDs (si tu API no devuelve día_id y daed_id directos)
function buscarDiaIdPorNombre(nombreDia) {
  // Por ejemplo, LUNES => "2"
  const diaObj = listaDias.value.find(d => d.dia_descripcion === nombreDia)
  return diaObj ? diaObj.dia_id : null
}
// function buscarCursoIdPorNombre(nombreCurso) {
//   const cursoObj = listaCursos.value.find(c => c.area_educativa === nombreCurso)
//   return cursoObj ? cursoObj.daed_id : null
// }

async function guardarDiaCurso() {
  if (!formDiaCurso.value.validate()) return
  const token = localStorage.getItem("token")
  const profile = localStorage.getItem("profile") || "demo"
  const config = {
    headers: { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }

  // Registrar
  if (!datosDiaCurso.hesc_id) {
    const baseUrl = 'https://amsoftsolution.com/amss/ws/wsRegistraHorarioEscolar.php'
    const data = {
          ai_hesh_id: datosDiaCurso.hesh_id,
          ai_aude_id: datosDiaCurso.aude_id || currentAulaDetalleId,
          ac_dia_id: datosDiaCurso.dia_id,
          ai_daed_id: datosDiaCurso.daed_id,
          av_profile: profile
    }
    axios.post(baseUrl, data, config)
      .then(response => {
        console.log('Horario escolar registrado:', response.data)
        dialogDiaCurso.value = false
        fetchHorarioEscolar(datosDiaCurso.aude_id || currentAulaDetalleId, datosDiaCurso.nive_id)
      })
      .catch(error => {
        console.error('Error al registrar horario escolar:', error)
      })
  }
  // Actualizar
  else {
    const baseUrl = 'https://amsoftsolution.com/amss/ws/wsActualizaHorarioEscolar.php'
    const data = {
      ai_hesc_id: datosDiaCurso.hesc_id,
      ai_aude_id: datosDiaCurso.aude_id || currentAulaDetalleId,
      ac_dia_id: datosDiaCurso.dia_id,
      ai_daed_id: datosDiaCurso.daed_id,
      ac_hesc_estado: datosDiaCurso.hesc_estado,
      av_profile: profile
    }
    axios.post(baseUrl, data, config)
      .then(response => {
        console.log('Horario escolar actualizado:', response.data)
        dialogDiaCurso.value = false
        fetchHorarioEscolar(datosDiaCurso.aude_id || currentAulaDetalleId, datosDiaCurso.nive_id)
      })
      .catch(error => {
        console.error('Error al actualizar horario escolar:', error)
      })
    }
}

// === FORM REFS PARA VALIDAR RANGOS Y DIA/CURSO ===
const formRango = ref(null)
const formDiaCurso = ref(null)

// === CONSUMO DE APIS (ORIGINALES) ===
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
    if (!token || !profile) {
      console.warn("Falta token o profile en localStorage.")
      return
    }
    const baseUrl = "https://amsoftsolution.com/amss/ws/wsListaAulaDetalleAnioEscolar.php"
    const params = {
      ac_anio_escolar,
      av_profile: profile
    }
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
async function fetchDocentes() {
  try {
    const token = localStorage.getItem("token")    
    const profile = localStorage.getItem("profile") || "demo"
    const response = await axios.get('https://amsoftsolution.com/amss/ws/wsListaDocentes.php', {
      params: {
        ac_indicador_todos: 'N',
        av_profile: profile
      },
      headers: { Authorization: `Bearer ${token}` }
    })
    if (response.data.status) {
      docentes.value = response.data.data
    }
  } catch(error) {
    console.error('Error fetching docentes', error)
  }
}
async function fetchFiltros() {
  try {
    const token = localStorage.getItem("token")
    const profile = localStorage.getItem("profile")
    const response = await axios.get('https://amsoftsolution.com/amss/ws/wsConsultaFiltrosAlumno.php', {
      params: { av_profile: profile },
      headers: { Authorization: `Bearer ${token}` }
    })
    if(response.data.status) {
      Object.assign(filtros, response.data.data)
    }
  } catch(error) {
    console.error('Error fetching filtros', error)
  }
}

// === CONSUMO DE APIS PARA DÍAS Y CURSOS (NUEVO) ===
async function fetchDias() {
  const token = localStorage.getItem("token")
  const profile = localStorage.getItem("profile") || "demo"
  try {
    const { data } = await axios.get('https://amsoftsolution.com/amss/ws/wsListaDiasHabiles.php', {
      params: {
        ac_dia_habil: 'S',
        ac_indicador_todos: 'N',
        av_profile: profile
      },
      headers: { Authorization: `Bearer ${token}` }
    })
    if (data.status) {
      listaDias.value = data.data
    }
  } catch(e) {
    console.error(e)
  }
}
async function fetchCursos(gradId) {
  const token = localStorage.getItem("token");
  const profile = localStorage.getItem("profile");
  const anes_id = localStorage.getItem("anes_id");

  if (!gradId) {
    console.warn("No se proporcionó un grad_id para consultar los cursos.");
    return;
  }

  const baseUrl = "https://amsoftsolution.com/amss/ws/wsListaDocenteAreaEducativaDetalleGrado.php";
  const params = {
    ai_anes_id: anes_id,
    ai_grad_id: gradId,
    av_profile: profile,
  };

  try {
    const { data } = await axios.get(baseUrl, {
      params,
      headers: { Authorization: `Bearer ${token}` },
    });
    if (data.status) {
      listaCursos.value = data.data.map((c) => ({
        ...c,
        label: `${c.curso} — ${c.docente}`,
      }));
    } else {
      listaCursos.value = [];
    }
  } catch (e) {
    console.error("Error en fetchCursos:", e);
  }
}


function parseTimeToMinutes(timeStr) {
  // timeStr es 'HH:MM'
  const [hh, mm] = timeStr.split(':').map(Number)
  return hh * 60 + mm
}

// Regla de validación para la hora fin
function endTimeRule(value) {
  // Primero, revisamos si pasó la regla de formato HH:MM (ya la cubre timeRule),
  // pero igual conviene asegurarnos de que 'value' no sea null o vacío
  if (!value) return true // ya otra regla se encargará de avisar si está vacío
  if (!datosRango.hesh_hora_inicio) return true // si no hay hora de inicio, no podemos comparar
  
  const start = parseTimeToMinutes(datosRango.hesh_hora_inicio)
  const end   = parseTimeToMinutes(value)
  
  // Validamos que end > start
  if (end <= start) {
    return 'La hora de fin no puede ser menor o igual que la hora de inicio'
  }
  return true
}


// === REFERENCIAS A FORMULARIOS DE V-FORM ===
const formDetalle = ref(null)

// === RESPONSIVIDAD ===
const { mdAndUp } = useDisplay()
const isDesktop = mdAndUp

// === ROUTER (SI DESEAS NAVEGAR A OTRA RUTA, SEGUIMOS USANDO useRouter) ===
//const router = useRouter()

onMounted(() => {
  fetchAulas()
  fetchDetalles()
  fetchDocentes()
  fetchFiltros()
  fetchDias()
  //fetchCursos()
  fetchHorarioRangos()
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
