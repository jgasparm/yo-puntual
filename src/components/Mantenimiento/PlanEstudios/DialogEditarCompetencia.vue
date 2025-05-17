<template>
  <v-dialog v-model="dialog" max-width="400">
    <v-card>
      <v-card-title>Editar Competencia</v-card-title>

      <v-card-text>
        <div class="mb-2"><strong>{{ competencia?.comp_nombre }}</strong></div>
        <v-text-field
          label="Orden"
          type="number"
          v-model.number="local.pcco_orden"
        />
        <v-select
          label="Estado"
          :items="['Activo','Inactivo']"
          v-model="local.estado"
        />
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn text @click="dialog = false">Cancelar</v-btn>
        <v-btn color="primary" @click="emit('guardar', { ...local })">
          Guardar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { reactive, watch, computed } from 'vue'

/* props & emits */
const props = defineProps({
  modelValue: Boolean,
  competencia: Object
})
const emit = defineEmits(['update:modelValue', 'guardar'])

/* puente para el v-model del diálogo */
const dialog = computed({
  get: () => props.modelValue,
  set: v   => emit('update:modelValue', v)
})

/* estado local del formulario */
const local = reactive({ pcco_orden: null, estado: 'Activo' })

watch(
  () => props.competencia,
  c => {
    if (c) {
      Object.assign(local, {
        pcco_orden: +c.pcco_orden,                 // nos aseguramos de que sea número
        estado    : c.pcco_estado === 'I' ? 'Inactivo' : 'Activo'
      })
    }
  },
  { immediate: true }
)
</script>