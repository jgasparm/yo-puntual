<!-- src/components/Mantenimiento/PlanEstudios/DialogAgregarCompetencia.vue -->
<template>
  <!-- 1️⃣ El v-dialog recibe el v-model bien escrito -->
  <v-dialog v-model="dialogVisible" max-width="480">
    <v-card>
      <v-card-title class="text-h6 font-weight-bold">
        Agregar Competencia
      </v-card-title>

      <v-card-text>
        <!-- COMPETENCIA ------------------------------------------>
        <v-select
          v-model="selectedCompetencia"
          :items="competencias"
          item-title="title"
          item-value="key"
          label="Competencia"
          dense
          outlined
          clearable
        />

        <!-- ORDEN ------------------------------------------------->
        <v-text-field
          v-model.number="orden"
          label="Orden"
          type="number"
          min="1"
          dense
          outlined
        />
      </v-card-text>

      <v-card-actions class="justify-end">
        <v-btn text  @click="dialogVisible = false">Cancelar</v-btn>
        <v-btn 
          color="primary"
          :loading="loading"
          :disabled="loading || !comp_id || !pcco_orden"
          @click="onGuardar">
          Guardar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, defineProps, defineEmits } from 'vue'

/* ---------- props y emits estándar para v-model ---------------- */
const props = defineProps({
  modelValue   : { type: Boolean, default: false }, // <-- v-model
  competencias : { type: Array,   default: () => [] },
  loading      : { type: Boolean, default: false }
})
const emit = defineEmits(['update:modelValue', 'guardar'])

/* puente reactivo entre la prop y el diálogo */
const dialogVisible = computed({
  get: () => props.modelValue,
  set: v  => emit('update:modelValue', v)
})

/* ---------- estado interno del formulario ---------------------- */
const selectedCompetencia = ref(null)
const orden               = ref(null)
const estado              = ref('Activo')

/* ---------- guardar y emitir al padre -------------------------- */
function onGuardar () {
  if (!selectedCompetencia.value || !orden.value) return   // validación mínima

  emit('guardar', {
    comp_id    : selectedCompetencia.value,
    pcco_orden : orden.value,
    estado     : estado.value
  })

  dialogVisible.value = false           // cerrar el diálogo
}
</script>
