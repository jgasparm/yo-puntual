<template>
  <v-container fluid>
    <!-- Barra superior -->
    <v-row>
      <v-col cols="12">
        <v-toolbar color="primary" dark flat>
          <v-toolbar-title>Registro de Notas</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn color="secondary" @click="goBack" text>
            Regresar
          </v-btn>
        </v-toolbar>
      </v-col>
    </v-row>

    <!-- Tarjeta del curso y tabla de registro de notas -->
    <v-row class="mt-4">
      <v-col cols="12">
        <v-card>
          <v-card-title>
            <span class="text-h6">Curso: {{ curso.nombre }}</span>
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="saveNotas" elevation="2">
              Guardar Cambios
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-data-table
              :headers="headers"
              :items="alumnos"
              class="elevation-1"
              hide-default-footer
            >
              <!-- Columna personalizada para notas -->
              <!-- eslint-disable-next-line vue/valid-v-slot -->
              <template v-slot:item.notas="{ item }">
                <v-row dense>
                  <v-col
                    v-for="evaluacion in curso.evaluaciones"
                    :key="evaluacion.id"
                    cols="12"
                    sm="6"
                    md="4"
                  >
                    <v-text-field
                      v-model="item.notas[evaluacion.id]"
                      type="number"
                      :label="evaluacion.nombre"
                      dense
                      clearable
                      :rules="[notaValidator]"
                    />
                  </v-col>
                </v-row>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'

/* Datos de ejemplo del curso y evaluaciones */
const curso = ref({
  nombre: "Matemáticas - Sección A",
  evaluaciones: [
    { id: 1, nombre: "Evaluación 1" },
    { id: 2, nombre: "Evaluación 2" },
    { id: 3, nombre: "Evaluación 3" },
  ],
})

/* Encabezados para la tabla */
const headers = [
  { text: "Alumno", value: "nombre" },
  { text: "Notas", value: "notas" },
]

/* Datos de ejemplo de alumnos; cada alumno tiene un objeto 'notas' con la nota por evaluación */
const alumnos = ref([
  {
    id: 101,
    nombre: "Juan Pérez",
    notas: {
      1: null,
      2: null,
      3: null,
    },
  },
  {
    id: 102,
    nombre: "María García",
    notas: {
      1: null,
      2: null,
      3: null,
    },
  },
  // Puedes agregar más alumnos aquí
])

/* Validador para las notas: se espera un número entre 0 y 10 */
const notaValidator = value => {
  if (value === null || value === "") return true
  const num = parseFloat(value)
  return num >= 0 && num <= 10 || "La nota debe estar entre 0 y 10"
}

/* Función para guardar las notas */
const saveNotas = () => {
  // Aquí se debería implementar la lógica para guardar los datos vía API o similar.
  console.log("Notas guardadas:", alumnos.value)
}

/* Función para regresar a la página anterior (Mis Cursos) */
const goBack = () => {
  // Implementa la navegación según tu router o método preferido.
  console.log("Navegando a la página Mis Cursos")
}
</script>

<style scoped>
/* Puedes agregar estilos personalizados para mejorar la experiencia y la responsividad */
.v-data-table {
  overflow-x: auto;
}
</style>
