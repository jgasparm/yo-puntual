<template>
    <v-dialog v-model="visible" max-width="400" persistent>
      <v-card>
        <v-card-title class="headline">
          <v-icon left class="me-2" :color="colorIcon">{{ icon }}</v-icon>
          {{ titulo }}
        </v-card-title>
        <v-card-text>{{ mensaje }}</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn :color="colorIcon" text @click="cerrar">Aceptar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </template>
  
  <script>
  export default {
    name: 'DialogMensaje',
    props: {
      mostrar: Boolean,
      titulo: String,
      mensaje: String,
      tipo: {
        type: String,
        default: 'error' // info | success | warning | error
      }
    },
    emits: ['update:mostrar'],
    computed: {
      icon() {
        return {
          info: 'mdi-information',
          success: 'mdi-check-circle',
          warning: 'mdi-alert',
          error: 'mdi-alert-circle'
        }[this.tipo];
      },
      colorIcon() {
        return {
          info: 'info',
          success: 'success',
          warning: 'warning',
          error: 'error'
        }[this.tipo];
      },
      visible: {
        get() {
          return this.mostrar;
        },
        set(value) {
          this.$emit('update:mostrar', value);
        }
      }
    },
    methods: {
      cerrar() {
        this.visible = false;
      }
    }
  };
  </script>
  