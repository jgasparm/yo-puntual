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
              v-model="document_number"
              label="Número de documento"
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
              :disabled="!document_number || !password"
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
  data() {
    return {
      document_number: '',
      password: '',
      loading: false
    };
  },
  methods: {
    async login() {
      if (!this.document_number || !this.password) {
        alert('Ingrese su número de documento y contraseña.');
        return;
      }

      this.loading = true; // Activa el estado de carga

      const apiUrl = `https://amsoftsolution.com/amss/ws/wsLoginWeb.php?ai_tipo_documento=1&av_numero_documento_identidad=${this.document_number}&av_usua_clave=${this.password}`;

      try {
        const response = await fetch(apiUrl);
        const result = await response.json();

        if (result.status && result.data.length > 0) {
          const userData = result.data[0];

          // Guardar datos del usuario en localStorage
          localStorage.setItem('auth', 'true');
          localStorage.setItem('token', userData.token);
          localStorage.setItem('user', JSON.stringify(userData));

          // Redirigir a la página principal
          this.$router.push('/principal');
        } else {
          alert('Credenciales incorrectas');
        }
      } catch (error) {
        console.error('Error en la solicitud:', error);
        alert('Error al conectar con el servidor.');
      } finally {
        this.loading = false; // Desactiva el estado de carga
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
