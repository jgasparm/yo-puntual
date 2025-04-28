<template>
  <v-dialog v-model="internalDialog" max-width="400px" persistent>
    <v-card>
      <v-card-title class="text-h6 font-weight-bold">
        Agregar Plan de Estudio
      </v-card-title>

      <v-card-text>
        <v-form ref="formRef" lazy-validation>
          <v-select
            v-model="form.area"
            :items="areaOptions"
            item-title="title"
            item-value="key"
            label="Área Educativa"
            dense
            outlined
            autofocus
          />
          <v-select
            v-model="form.nivel"
            :items="nivelOptions"
            item-title="title"
            item-value="key"
            label="Nivel"
            dense
            outlined
          />
          <v-select
            v-model="form.grado"
            :items="filteredGrados"
            item-title="title"
            item-value="key"
            label="Grado"
            dense
            outlined
            :disabled="!form.nivel"
          />
          <v-text-field
            v-model="form.horas"
            label="Horas"
            type="number"
            dense
            outlined
          />
        </v-form>
      </v-card-text>

      <v-card-actions class="justify-end">
        <v-btn variant="text" @click="cerrar">Cancelar</v-btn>
        <v-btn color="primary" :disabled="!puedeGuardar" @click="guardar">
          Guardar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  areaOptions: Array,
  nivelOptions: Array,
  gradoOptions: Array
})
const emit = defineEmits(['update:modelValue', 'guardar'])

const internalDialog = ref(props.modelValue)
const form = ref({
  area: null,
  nivel: null,
  grado: null,
  horas: null
})

const formRef = ref(null)

// Sincronizar apertura
watch(() => props.modelValue, (val) => {
  internalDialog.value = val
  if (val) {
    resetForm()
    setTimeout(() => {
      formRef.value?.resetValidation()
    }, 200)
  }
})

// Emitir cierre
watch(internalDialog, (val) => {
  emit('update:modelValue', val)
})

// Filtrar grados según el nivel seleccionado
const filteredGrados = computed(() => {
  if (!form.value.nivel) return []
  return props.gradoOptions.filter(g => g.nive_id === form.value.nivel)
})

// Habilitar guardar
const puedeGuardar = computed(() => {
  return form.value.area && form.value.nivel && form.value.grado && form.value.horas
})

// Resetear formulario
function resetForm() {
  form.value = {
    area: null,
    nivel: null,
    grado: null,
    horas: null
  }
}

// Cerrar
function cerrar() {
  internalDialog.value = false
}

// Guardar
function guardar() {
  emit('guardar', {
    ared_id: form.value.area,
    nive_id: form.value.nivel,
    grad_id: form.value.grado,
    ples_horas: form.value.horas
  })
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
