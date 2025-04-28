<template>
  <v-dialog v-model="internalDialog" max-width="600px">
    <v-card>
      <v-card-title class="text-h6 font-weight-bold">
        Agregar Docentes
      </v-card-title>

      <v-card-text>
        <v-select
          v-model="internalSeleccionados"
          :items="docentesNoAsignados"
          item-title="persona_descripcion"
          item-value="pers_id"
          label="Seleccionar docentes"
          multiple
          dense
          outlined
        />
      </v-card-text>

      <v-card-actions class="justify-end">
        <v-btn text @click="cerrar">Cancelar</v-btn>
        <v-btn color="primary" @click="guardarSeleccionados">Guardar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'

// Props
const props = defineProps({
  modelValue: Boolean,
  docentesNoAsignados: Array,
  selected: Array
})

// Emits
const emit = defineEmits(['update:modelValue', 'update:selected', 'guardar'])

// Variables internas
const internalDialog = ref(props.modelValue)
const internalSeleccionados = ref(props.selected ?? [])

// Sincronizar cambios del padre al hijo
watch(() => props.modelValue, (val) => {
  internalDialog.value = val
})
watch(() => props.selected, (val) => {
  internalSeleccionados.value = val ?? []
})

// Emitir cambios del hijo al padre
watch(internalDialog, (val) => {
  emit('update:modelValue', val)
})
watch(internalSeleccionados, (val) => {
  emit('update:selected', val)
})

// Acciones
function cerrar() {
  internalDialog.value = false
}

function guardarSeleccionados() {
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
