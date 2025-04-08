<template>
  <div class="login-wrapper">
    <v-app>
      <v-container class="d-flex justify-center align-center" style="min-height: 100vh">
        <v-card class="pa-6" max-width="420" elevation="10" outlined>
          <!-- Logo -->
          <v-img src="./logo.webp" height="120" contain class="mx-auto mb-2" />

          <!-- Título -->
          <h2 class="text-center text-h5 font-weight-bold mb-4">Ingreso al Sistema</h2>

          <!-- Formulario de Login -->
          <v-form>
            <v-select
              v-model="document_type"
              :items="tipoDocumentoItems"
              item-text="title"
              item-value="key"
              label="Tipo de Documento"
              required
              outlined
              prepend-icon="mdi-card-account-details"
              dense
            />

            <v-text-field
              v-model="document_number"
              label="Número de documento"
              placeholder="Ej. 12345678"
              prepend-icon="mdi-account-circle-outline"
              outlined
              dense
              :rules="[v => !!v || 'Campo obligatorio']"
            />

            <v-text-field
              v-model="password"
              label="Contraseña"
              prepend-icon="mdi-lock-outline"
              type="password"
              outlined
              dense
              :rules="[v => !!v || 'Campo obligatorio']"
            />

            <v-btn
              color="primary"
              block
              class="mt-4"
              :loading="loading"
              :disabled="!document_number || !password"
              @click="login"
            >
              Iniciar sesión
            </v-btn>

            <!-- <v-btn text class="mt-2" @click="recoverPassword">
              ¿Olvidaste tu contraseña?
            </v-btn> -->

            <!-- Recaptcha -->
            <div class="mt-4 text-center">
              <VueRecaptcha sitekey="your-site-key" @verify="onVerify" />
            </div>
          </v-form>

          <!-- Modal de error -->
          <v-dialog v-model="ModalNoCredenciales" max-width="400">
            <v-card>
              <v-card-title class="headline">Credenciales incorrectas</v-card-title>
              <v-card-text>
                Por favor, revisa tu usuario y contraseña, e intenta nuevamente.
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" text @click="ModalNoCredenciales = false">Aceptar</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-card>
      </v-container>
    </v-app>
  </div>
</template>

<script>
import { VueRecaptcha } from 'vue-recaptcha-v3';

export default {
  name: 'LoginForm',
  components: { VueRecaptcha },
  data() {
    return {
      document_type: '1',
      tipoDocumentoItems: [
        { title: 'DNI', key: '1' },
        { title: 'Carnet de extranjería', key: '4' }
      ],
      document_number: '10030795',
      password: '99999999',
      loading: false,
      ModalNoCredenciales: false
    };
  },
  methods: {
    async login() {
      if (!this.document_number || !this.password) return;
      this.loading = true;

      const apiUrl = `https://amsoftsolution.com/amss/ws/wsLoginWeb.php?ai_tipo_documento=${this.document_type}&av_numero_documento_identidad=${this.document_number}&av_usua_clave=${this.password}`;

      try {
        const response = await fetch(apiUrl);
        const result = await response.json();

        if (result.status && result.data.length > 0) {
          const userData = result.data[0];
          localStorage.setItem('auth', 'true');
          localStorage.setItem('token', userData.token);
          localStorage.setItem('profile', userData.profile);
          localStorage.setItem('anes_id', userData.anes_id);
          localStorage.setItem('anio_escolar', userData.anio_escolar);
          localStorage.setItem('usua_id', userData.usua_id);
          localStorage.setItem('pers_id', userData.pers_id);
          localStorage.setItem('perfil', userData.id_perfil);
          localStorage.setItem('user', JSON.stringify(userData));

          const submenuUrl = `https://amsoftsolution.com/amss/ws/wsConsultaUsuarioPermisos.php?ai_perf_id=${userData.id_perfil}`;
          const submenuResponse = await fetch(submenuUrl, {
            headers: {
              Authorization: `Bearer ${userData.token}`,
              'Content-Type': 'application/json'
            }
          });
          const submenuResult = await submenuResponse.json();

          if (submenuResult.status) {
            localStorage.setItem('submenus', JSON.stringify(submenuResult));
          }

          this.$router.push('/principal');
        } else {
          this.ModalNoCredenciales = true;
        }
      } catch (error) {
        console.error('Error en la solicitud:', error);
        alert('Error al conectar con el servidor.');
      } finally {
        this.loading = false;
      }
    },
    recoverPassword() {
      alert('Funcionalidad de recuperación aún no implementada.');
    },
    onVerify(response) {
      console.log('Recaptcha verificado:', response);
    }
  }
};
</script>

<style scoped>
.login-wrapper {
  background-color: #f4f4f9;
  min-height: 100vh;
}
.v-card {
  border-radius: 16px;
  background-color: #fff;
}
h2 {
  color: #1976D2;
}
</style>
