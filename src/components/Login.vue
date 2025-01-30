<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <v-app>
      <v-container class="d-flex justify-center align-center" style="min-height: 100vh; background-color: #f4f4f9;">
        <v-card class="pa-6" max-width="400" elevation="10" outlined>
          <!-- Logo -->
          <v-img src="./logo.png" height="150" class="mb-4" contain></v-img>

          <!-- Formulario de Login -->
          <v-form>
            <!-- Campo de Usuario -->
            <v-text-field
              v-model="username"
              label="Usuario"
              prepend-icon="mdi-account"
              required
              outlined
            ></v-text-field>

            <!-- Campo de Contraseña -->
            <v-text-field
              v-model="password"
              label="Contraseña"
              prepend-icon="mdi-lock"
              type="password"
              required
              outlined
            ></v-text-field>

            <!-- Botón de Login -->
            <v-btn
              color="primary"
              block
              @click="login"
              :disabled="!username || !password"
            >
              Iniciar sesión
            </v-btn>

            <!-- Enlace para recuperar contraseña -->
            <v-btn text class="mt-2" @click="recoverPassword">
              ¿Olvidaste tu contraseña?
            </v-btn>

            <!-- Recaptcha -->
            <div class="mt-4">
              <VueRecaptcha sitekey="your-site-key" @verify="onVerify"></VueRecaptcha>
            </div>
          </v-form>
        </v-card>
      </v-container>
    </v-app>
  </div>
</template>

<script>
import { VueRecaptcha } from 'vue-recaptcha-v3';

export default {
  name: 'LoginForm',
  components: {
    VueRecaptcha
  },
  props: {
    msg: String
  },
  data() {
    return {
      username: '',
      password: ''
    };
  },
  methods: {
    login() {
      console.log('Usuario:', this.username, 'Contraseña:', this.password);

      // Validar si las credenciales son correctas
      if (this.username === 'usuario' && this.password === 'contraseña') {
        // Si las credenciales son correctas, redirige a la página principal
        this.$router.push({ name: 'principal' }).catch(err => {
        console.error('Error en la redirección:', err);
        });
      } else {
        alert('Credenciales incorrectas');
      }
    },
    recoverPassword() {
      console.log('Recuperación de contraseña solicitada');
    },
    onVerify(response) {
      console.log('Recaptcha verificado:', response);
    }
  }
};
</script>

<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
