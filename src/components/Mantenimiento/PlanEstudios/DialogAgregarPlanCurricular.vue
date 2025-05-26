<template>
    <v-dialog v-model="internalDialog" max-width="500px">
      <v-card>
        <v-card-title class="text-h6 font-weight-bold">
          Agregar Plan Curricular
        </v-card-title>
  
        <v-card-text>
          <v-select
            v-model="internalPeriodo"
            :items="periodosOptions"
            item-title="title"
            item-value="key"
            label="Periodo Educativo"
            clearable
            outlined
            dense
          />
  
          <v-select
            v-model="internalCurso"
            :items="cursosOptions"
            item-title="title"
            item-value="key"
            label="Curso / Docente"
            clearable
            outlined
            dense
          />
  
          <v-text-field
            v-model="internalHoras"
            label="Horas"
            type="number"
            min="1"
            outlined
            dense
          />
        </v-card-text>
  
        <v-card-actions class="justify-end">
          <v-btn text @click="cerrar">Cancelar</v-btn>
          <v-btn 
            color="primary"
            :loading="loading"
            :disabled="loading ||!internalPeriodo || !internalCurso || !internalHoras" 
            @click="guardar">
            Guardar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </template>
  
  <script setup>
  import { ref, watch } from 'vue'
  
  // Props
  const props = defineProps({
    modelValue: Boolean,
    periodosOptions: Array,
    cursosOptions: Array,
    loading: Boolean
  })
  
  // Emits
  const emit = defineEmits(['update:modelValue', 'guardar', 'update:newCurricular'])
  
  // Internos
  const internalDialog = ref(props.modelValue)
  const internalPeriodo = ref(null)
  const internalCurso = ref(null)
  const internalHoras = ref(null)
  
  // Sync padre -> hijo
  watch(() => props.modelValue, val => {
    internalDialog.value = val
  })
  
  // Sync hijo -> padre
  watch(internalDialog, val => {
    emit('update:modelValue', val)
  })
  
  // Acciones
  function cerrar() {
    internalDialog.value = false
  }
  
  function guardar() {
    emit('guardar', {
      periodo_id: internalPeriodo.value,
      curso_id: internalCurso.value,
      horas: internalHoras.value
    })
    internalDialog.value = false
  }
  </script>
  
  <style scoped>
  .v-card-title {
    padding-bottom: 0;
  }
  .v-card-actions {
    padding-bottom: 16px;
  }
  </style>
  