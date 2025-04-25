<template>
  <div class="login-wrapper">
    <v-app>
      <v-container class="d-flex justify-center align-center" style="min-height: 100vh">
        <v-card class="pa-6" max-width="380" width="100%" elevation="10" outlined>
          <!-- Logo -->
          <v-img src="./logo.webp" height="120" contain class="mx-auto mb-2" />

          <!-- Título -->
          <h2 class="text-center text-h5 font-weight-bold mb-4">Ingreso al Sistema</h2>

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
              ref="docInput"
            />

            <v-text-field
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              label="Contraseña"
              prepend-icon="mdi-lock-outline"
              :append-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append="showPassword = !showPassword"
              outlined
              dense
              :rules="[v => !!v || 'Campo obligatorio']"
            />

            <v-checkbox
              v-model="rememberMe"
              label="Recordarme"
              dense
              class="mt-1"
            />

            <v-btn
              color="primary"
              block
              class="mt-4"
              :loading="loading"
              :disabled="!document_number || !password"
              @click="login"
            >
              {{ loading ? 'Ingresando...' : 'Iniciar sesión' }}
            </v-btn>

            <!-- reCAPTCHA v2 se muestra solo si showRecaptchaV2 es true -->
            <div v-if="showRecaptchaV2" class="my-4 text-center">
              <div
                class="g-recaptcha"
                :data-sitekey="'6LeCyCErAAAAAO2kj17z9YMshSchtyKT-l3UaQTq'"
                data-callback="onRecaptchaV2Success"
              ></div>
            </div>
<!-- 
            <v-tooltip bottom>
              <template #activator="{ on, attrs }">
                <v-btn text class="mt-2" v-bind="attrs" v-on="on" @click="recoverPassword">
                  ¿Olvidaste tu contraseña?
                </v-btn>
              </template>
              <span>Próximamente disponible</span>
            </v-tooltip> -->
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
      <v-overlay v-model="loading" class="d-flex flex-column justify-center align-center" persistent>
        <v-img src="./logo.webp" height="100" contain class="logo-spin mb-4" />
        <span class="text-h6 font-weight-medium">Procesando...</span>
      </v-overlay>

    </v-app>
  </div>
</template>

<script>

export default {
  
  name: 'LoginForm',
  data() {
    return {
      document_type: '1',
      tipoDocumentoItems: [
        { title: 'DNI', key: '1' },
        { title: 'Carnet de extranjería', key: '4' }
      ],
      document_number: '',
      password: '',
      showPassword: false,
      rememberMe: false,
      loading: false,
      ModalNoCredenciales: false,
      recaptchaAttempts: 0,
      maxAttempts: 2,
      showRecaptchaV2: false,
      recaptchaV2Token: '',
    };
  },
  mounted() {
    if (localStorage.getItem('auth') === 'true') {
      this.$router.push('/principal');
    }

    const rememberedDoc = localStorage.getItem('remembered_document');
    if (rememberedDoc) {
      this.document_number = rememberedDoc;
      this.rememberMe = true;
    }

    this.$nextTick(() => {
      this.$refs.docInput.focus();
    });
  },
  methods: {
    async login() {
      if (!this.document_number || !this.password) return;
      this.loading = true;

      try {
        let token;
        let recaptchaTipo = 'v3';

        if (this.showRecaptchaV2) {
          if (!this.recaptchaV2Token) {
            alert('Por favor completa el reCAPTCHA antes de continuar.');
            this.loading = false;
            return;
          }
          token = this.recaptchaV2Token;
          recaptchaTipo = 'v2';
        } else {
          token = await this.$recaptcha('login'); // reCAPTCHA v3
        }

        const apiUrl = `https://amsoftsolution.com/amss/ws/wsLoginWeb.php?ai_tipo_documento=${this.document_type}&av_numero_documento_identidad=${this.document_number}&av_usua_clave=${this.password}&recaptcha=${token}&recaptcha_tipo=${recaptchaTipo}`;

        const response = await fetch(apiUrl);
        const result = await response.json();

        if (result.status && result.data.length > 0) {
          const userData = result.data[0];

          if (this.rememberMe) {
            localStorage.setItem('remembered_document', this.document_number);
          } else {
            localStorage.removeItem('remembered_document');
          }

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
          if (result.message === 'Error al verificar reCAPTCHA') {
            this.recaptchaAttempts++;
            if (this.recaptchaAttempts >= this.maxAttempts) {
              this.showRecaptchaV2 = true;
              this.recaptchaV2Token = '';
              alert('Verificación adicional requerida. Por favor marca "No soy un robot".');
            } else {
              setTimeout(() => this.login(), 1000); // Reintenta con v3
            }
          } else {
            this.ModalNoCredenciales = true;
          }
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
    }
  }
};
// Callback global para cuando reCAPTCHA v2 es completado
window.onRecaptchaV2Success = (token) => {
  const app = document.querySelector("#app");
  const vueInstance = app.__vue_app__._instance.proxy;
  vueInstance.recaptchaV2Token = token;
};
</script>
