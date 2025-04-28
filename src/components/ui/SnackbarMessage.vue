<template>
    <v-snackbar
      v-model="modelValueInternal"
      :timeout="timeout"
      :color="color"
      location="top center"
      multi-line
    >
      {{ message }}
    </v-snackbar>
  </template>
  
  <script setup>
  // Importa las funciones necesarias de Vue
  import { ref, watch } from 'vue'
  
  // Define las propiedades que recibirá el componente
  const props = defineProps({
    modelValue: { type: Boolean, required: true },
    message: { type: String, default: '' },
    color: { type: String, default: 'success' },
    timeout: { type: Number, default: 3000 }
  })
  
  // Emite el evento para actualizar el valor (close/open)
  const emit = defineEmits(['update:modelValue'])
  
  // Variable interna que sincroniza el v-model
  const modelValueInternal = ref(props.modelValue)
  
  // Sincroniza cambios de la prop externa hacia interna
  watch(() => props.modelValue, (newVal) => {
    modelValueInternal.value = newVal
  })
  
  // Sincroniza cambios internos hacia el padre (para cerrar)
  watch(modelValueInternal, (newVal) => {
    emit('update:modelValue', newVal)
  })
  </script>
  
  <style scoped>
  /* Opcional: ajustar tamaño del snackbar en pantallas grandes */
  .v-snackbar {
    max-width: 400px;
  }
  </style>
  