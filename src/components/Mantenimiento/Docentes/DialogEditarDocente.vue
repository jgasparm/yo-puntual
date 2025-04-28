<template>
  <v-dialog v-model="internalDialog" max-width="400px">
    <v-card>
      <v-card-title class="text-h6 font-weight-bold">
        Editar Estado del Docente
      </v-card-title>

      <v-card-text>
        <v-select
          v-model="internalEstado"
          :items="['Activo', 'Inactivo']"
          label="Estado"
          dense
          outlined
        />
      </v-card-text>

      <v-card-actions class="justify-end">
        <v-btn text @click="cerrar">Cancelar</v-btn>
        <v-btn color="primary" @click="guardarEstado">Guardar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'

// Props
const props = defineProps({
  modelValue: Boolean,
  docente: Object,
  estado: String
})

// Emits
const emit = defineEmits(['update:modelValue', 'update:estado', 'guardar'])

// Variables internas
const internalDialog = ref(props.modelValue)
const internalEstado = ref(props.estado ?? 'Activo')

// Sincronizar cambios del padre al hijo
watch(() => props.modelValue, (val) => {
  internalDialog.value = val
})
watch(() => props.estado, (val) => {
  internalEstado.value = val ?? 'Activo'
})

// Emitir cambios del hijo al padre
watch(internalDialog, (val) => {
  emit('update:modelValue', val)
})
watch(internalEstado, (val) => {
  emit('update:estado', val)
})

// Acciones
function cerrar() {
  internalDialog.value = false
}

function guardarEstado() {
  emit('guardar')
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
