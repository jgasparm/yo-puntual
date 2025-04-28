<template>
  <v-dialog v-model="internalDialog" max-width="600px">
    <v-card>
      <v-card-title class="text-h6 font-weight-bold">
        Agregar Cursos al Docente
      </v-card-title>

      <v-card-text class="pb-0 pt-4">
        <v-autocomplete
          v-model="internalSeleccionados"
          :items="cursosFormateados"
          item-title="aede_nombre"
          item-value="aede_id"
          label="Seleccionar uno o más cursos"
          multiple
          chips
          closable-chips
          clearable
          dense
          outlined
          hide-selected
          :menu-props="{ offsetY: true, maxHeight: 250, contentClass: 'autocomplete-inside-dialog' }"
          :no-data-text="'No hay cursos disponibles'"
        />
      </v-card-text>

      <v-card-actions class="justify-end pb-4 pr-4">
        <v-btn text @click="cerrar">Cancelar</v-btn>
        <v-btn color="primary" :disabled="internalSeleccionados.length === 0" @click="guardarSeleccionados">
          Guardar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

// Props
const props = defineProps({
  modelValue: Boolean,
  docente: Object,
  cursosNoAsignados: Array,
  selected: Array
})

// Emits
const emit = defineEmits(['update:modelValue', 'update:selected', 'guardar'])

// Variables internas
const internalDialog = ref(props.modelValue)
const internalSeleccionados = ref(props.selected ?? [])

// Computed para formatear cursos
const cursosFormateados = computed(() => {
  return props.cursosNoAsignados.map(curso => ({
    aede_id: curso.aede_id,
    aede_nombre: curso.aede_nombre
  }))
})

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
/* Espacio extra en el Card */
.v-card-text {
  padding-bottom: 0;
  padding-top: 16px;
}

/* Acomodar el menú dentro del dialog */
.autocomplete-inside-dialog {
  max-width: 520px !important;
  margin-top: 8px !important;
}

/* Botones mejor alineados */
.v-card-actions {
  padding-right: 16px;
  padding-bottom: 16px;
}
</style>
