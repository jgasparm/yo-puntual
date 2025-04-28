<template>
  <v-dialog v-model="internalDialog" max-width="450px">
    <v-card>
      <v-card-title class="text-h6 font-weight-bold">
        Editar Plan de Estudio
      </v-card-title>

      <v-card-text>
        <v-text-field
          label="Horas"
          type="number"
          v-model="internalHoras"
          outlined
          dense
          min="0"
        />

        <v-select
          v-model="internalEstado"
          label="Estado"
          :items="estadoOptions"
          item-title="title"
          item-value="value"
          dense
          outlined
        />
      </v-card-text>

      <v-card-actions class="justify-end">
        <v-btn variant="text" @click="cerrar">Cancelar</v-btn>
        <v-btn color="primary" :disabled="!internalHoras" @click="guardar">Guardar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'

// Opciones de estado: lo que se ve vs lo que se guarda
const estadoOptions = [
  { title: 'Activo', value: 'A' },
  { title: 'Inactivo', value: 'I' }
]

const props = defineProps({
  modelValue: Boolean,
  horas: Number,
  estado: String
})

const emit = defineEmits(['update:modelValue', 'update:horas', 'update:estado', 'guardar'])

// Internos reactivos
const internalDialog = ref(props.modelValue)
const internalHoras = ref(props.horas ?? null)
const internalEstado = ref(props.estado ?? 'A')

// Sincronizar prop → valor interno
watch(() => props.modelValue, val => {
  internalDialog.value = val
})
watch(() => props.horas, val => {
  internalHoras.value = val
})
watch(() => props.estado, val => {
  internalEstado.value = val
})

// Emitir cambios valor interno → prop
watch(internalDialog, val => {
  emit('update:modelValue', val)
})
watch(internalHoras, val => {
  emit('update:horas', val)
})
watch(internalEstado, val => {
  emit('update:estado', val)
})

// Acciones
function cerrar() {
  internalDialog.value = false
}

function guardar() {
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
