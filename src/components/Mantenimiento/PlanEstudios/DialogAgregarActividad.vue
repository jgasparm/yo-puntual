<template>
    <v-dialog v-model="openDialog" max-width="400">
      <v-card>
        <v-card-title>Agregar Actividad</v-card-title>
        <v-card-text>
          <v-select label="Actividad" :items="actividades" item-title="title" item-value="key"
                    v-model="local.acti_id" />
          <v-text-field label="Orden" type="number" v-model="local.pcca_orden" />
        </v-card-text>
        <v-card-actions>
          <v-spacer/>
          <v-btn text @click="$emit('update:modelValue', false)">Cancelar</v-btn>
          <v-btn color="primary" :disabled="!local.acti_id || !local.pcca_orden"
                 @click="$emit('guardar', { ...local })">Guardar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </template>
  
  <script setup>
    import { reactive, watch, computed } from 'vue'

    /* props + emit */
    const props = defineProps({
      modelValue : Boolean,
      actividades: Array
    })
    const emit  = defineEmits(['update:modelValue','guardar'])

    /* alias reactivo que replica el v-model */
    const openDialog = computed({
      get: () => props.modelValue,
      set: v  => emit('update:modelValue', v)
    })

    /* modelo interno del formulario */
    const local = reactive({ acti_id:null, pcca_orden:null })

    /* al cerrar el diálogo limpia el form */
    watch(() => props.modelValue, v => {
      if (!v) Object.assign(local,{ acti_id:null, pcca_orden:null })
    })
</script>

  