<template>
  <v-dialog v-model="openDialog" max-width="400">
    <v-card>
      <v-card-title>Editar Capacidad</v-card-title>

      <v-card-text>
        <div class="mb-2">
          <strong>{{ capacidad?.capa_nombre }}</strong>
        </div>

        <v-text-field label="Orden"
                      type="number"
                      v-model="local.pccc_orden" />

        <v-select   label="Estado"
                    :items="['Activo','Inactivo']"
                    v-model="local.estado" />
      </v-card-text>

      <v-card-actions>
        <v-spacer/>
        <v-btn text
               @click="emit('update:modelValue', false)">Cancelar</v-btn>
        <v-btn 
          color="primary"
          :loading="loading"
          :disabled="loading"
          @click="emit('guardar', { ...local })">
          Guardar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { reactive, watch, computed } from 'vue'

const props = defineProps({
  modelValue : Boolean,
  capacidad  : Object,
  loading: Boolean
})
const emit = defineEmits(['update:modelValue','guardar'])

/* alias seguro para el v-model del diálogo */
const openDialog = computed({
  get: () => props.modelValue,
  set: v  => emit('update:modelValue', v)
})

/* estado interno */
const local = reactive({ pccc_orden:null, estado:'Activo' })

/* llena el formulario al abrir el diálogo */
watch(() => props.capacidad, c => {
  if (c) Object.assign(local, {
    pccc_orden : c.pccc_orden,
    estado     : c.pccc_estado === 'I' ? 'Inactivo' : 'Activo'
  })
})
</script>
