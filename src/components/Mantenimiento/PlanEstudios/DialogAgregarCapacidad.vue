<template>
  <!-- ⬇️ usa el alias openDialog -->
  <v-dialog v-model="openDialog" max-width="400">
    <v-card>
      <v-card-title>Agregar Capacidad</v-card-title>

      <v-card-text>
        <v-select  label="Capacidad"
                   :items="capacidades"
                   item-title="title"
                   item-value="key"
                   v-model="local.capa_id" />
        <v-text-field label="Orden"
                      type="number"
                      v-model="local.pccc_orden" />
      </v-card-text>

      <v-card-actions>
        <v-spacer/>
        <v-btn text
               @click="emit('update:modelValue', false)">Cancelar</v-btn>
        <v-btn color="primary"
               :disabled="!local.capa_id || !local.pccc_orden"
               @click="emit('guardar', { ...local })">Guardar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { reactive, watch, computed } from 'vue'

/* props & emits */
const props = defineProps({
  modelValue  : Boolean,
  capacidades : Array
})
const emit = defineEmits(['update:modelValue','guardar'])

/* alias que evita mutar la prop */
const openDialog = computed({
  get: () => props.modelValue,
  set: v  => emit('update:modelValue', v)
})

/* estado local del formulario */
const local = reactive({ capa_id:null, pccc_orden:null })

/* limpia el formulario al cerrar */
watch(() => props.modelValue, v => {
  if (!v) Object.assign(local, { capa_id:null, pccc_orden:null })
})
</script>
