<template>
    <v-dialog v-model="openDialog" max-width="400">
      <v-card>
        <v-card-title>Editar Actividad</v-card-title>
        <v-card-text>
          <div class="mb-2"><strong>{{ actividad?.acti_nombre }}</strong></div>
          <v-text-field label="Orden" type="number" v-model="local.pcca_orden" />
          <v-select label="Estado" :items="['Activo','Inactivo']" v-model="local.estado" />
        </v-card-text>
        <v-card-actions>
          <v-spacer/>
          <v-btn text @click="$emit('update:modelValue', false)">Cancelar</v-btn>
          <v-btn color="primary" @click="$emit('guardar', { ...local })">Guardar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </template>
  
  <script setup>
  import { reactive, watch, computed } from 'vue'
  const props = defineProps({ modelValue:Boolean, actividad:Object })
  const emit = defineEmits(['update:modelValue','guardar'])
  const openDialog = computed({
    get: () => props.modelValue,
    set: v  => emit('update:modelValue', v)
  })
  const local = reactive({ pcca_orden:null, estado:'Activo' })
  watch(() => props.actividad, a => {
    if (a) Object.assign(local,{
      pcca_orden : a.pcca_orden,
      estado     : a.pcca_estado==='I' ? 'Inactivo' : 'Activo'
    })
  })
  </script>
  