<template>
    <v-dialog v-model="internalDialog" max-width="500px">
      <v-card>
        <v-card-title class="text-h6 font-weight-bold">
          Editar Plan Curricular
        </v-card-title>
  
        <v-card-text>
          <v-text-field
            v-model="internalHoras"
            label="Horas"
            type="number"
            min="1"
            outlined
            dense
          />
          <v-select
            v-model="internalEstado"
            :items="estadoOptions"
            label="Estado"
            outlined
            dense
          />
        </v-card-text>
  
        <v-card-actions class="justify-end">
          <v-btn text @click="cerrar">Cancelar</v-btn>
          <v-btn color="primary" :disabled="!internalHoras || !internalEstado" @click="guardar">
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
    horas: Number,
    estado: String,
  })
  
  // Emits
  const emit = defineEmits(['update:modelValue', 'guardar'])
  
  // Internos
  const internalDialog = ref(props.modelValue)
  const internalHoras = ref(props.horas || null)
  const internalEstado = ref(props.estado || '')
  
  const estadoOptions = ['Activo', 'Inactivo']
  
  // Sync padre -> hijo
  watch(() => props.modelValue, val => {
    internalDialog.value = val
  })
  
  watch(() => props.horas, val => {
    internalHoras.value = val
  })
  
  watch(() => props.estado, val => {
    internalEstado.value = val
  })
  
  // Acciones
  function cerrar() {
    internalDialog.value = false
  }
  
  function guardar() {
    emit('guardar', {
      horas: internalHoras.value,
      estado: internalEstado.value
    })
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
  