<template>
  <div class="layout1">
    <!-- CABECERA -->
    <header class="header">
      <div class="logo">
        <img :src="logoSrc" alt="Logo">       
      </div>
      <div class="NombreCentroEducativo">
        <h1>{{ centroEducativo }}</h1>
        <!-- <h1 class="site-title">{{ centroEducativo }}</h1> -->
      </div>
      <div class="user">
        <img class="user-img" :src="imagenPerfil" alt="Usuario">
        <!-- Contenedor para el nombre y la flecha, con el menú desplegable -->
        <div class="user-info" @click="toggleUserMenu">
          <span>{{ formattedUserName }}</span>
          <span class="arrow">▼</span>
          <div class="user-menu" v-if="showUserMenu">
            <div @click="verPerfil">Ver perfil</div>
            <div @click="cerrarSesion">Cerrar sesión</div>
          </div>
        </div>
      </div>
      <!-- Botón menú hamburguesa en móviles -->
      <div class="menu-toggle" v-if="isMobile" @click="toggleMobileMenu">
        <v-icon>mdi-menu</v-icon>
      </div>
    </header>

    <!-- MENÚ LATERAL RESPONSIVO -->
    <v-navigation-drawer v-model="mobileMenuOpen" app temporary>
      <v-list>
        <v-list-item>
          <div class="menu-header">
            <img :src="logoSrc" alt="Logo" class="menu-logo-mobile">
            <h4 class="menu-title">{{ centroEducativo }}</h4>
          </div>
        </v-list-item>
        <v-divider></v-divider>
        <v-list-item @click="$router.push({ name: 'inicio' })">
          <v-icon>mdi-home</v-icon> Inicio
        </v-list-item>
        <v-list-item v-for="mod in modulosLogin" :key="mod.modu_id" @click="toggleSubmenu(mod.modu_id)">
          <v-icon>{{ mod.icono }}</v-icon> {{ mod.modu_nombre }}
          <v-list v-if="openSubmenu === mod.modu_id">
            <v-list-item v-for="item in submenusGrouped[mod.modu_id] || []" :key="item.permiso_id" @click.stop="mostrarVista(item.menu_nombre)">
              {{ item.menu_nombre }}
            </v-list-item>
          </v-list>
        </v-list-item>
        <v-divider></v-divider>
        <v-list-item @click="verPerfil">
          <v-icon>mdi-folder</v-icon> Ver perfil
        </v-list-item>
        <v-list-item @click="cerrarSesion">
          <v-icon>mdi-logout</v-icon> Cerrar sesión
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    
    <!-- CONTENIDO PRINCIPAL -->
    <div class="main-content">
      <!-- Columna Izquierda: Menú -->
      <aside class="sidebar">
        <ul class="menu">
          <!-- Menú fijo: Inicio -->
          <li @click="$router.push({ name: 'inicio' })" :class="{ active: activeMenu === 'Inicio' }">
            <v-icon>mdi-home</v-icon> Inicio
          </li>
          <!-- Menús dinámicos obtenidos desde wsLoginWeb -->
          <li
            v-for="mod in modulosLogin"
            :key="mod.modu_id"
            @click="toggleSubmenu(mod.modu_id)"
            :class="{ active: activeMenu === mod.modu_id }"
          >
          <v-icon>{{ mod.icono }}</v-icon> {{ mod.modu_nombre }}
            <!-- Submenús para cada módulo, usando los datos agrupados por modu_id -->
            <transition name="fade">
              <ul v-if="openSubmenu === mod.modu_id" class="submenu">
                <li
                  v-for="item in submenusGrouped[mod.modu_id] || []"
                  :key="item.permiso_id"
                  @click.stop="mostrarVista(item.menu_nombre)"
                  :class="{ selected: activeSubmenu === item.menu_nombre }"
                >
                  {{ item.menu_nombre }}
                </li>
              </ul>
            </transition>
          </li>
        </ul>
      </aside>

      <!-- Columna Central: Contenido -->
      <section class="content">
        <router-view></router-view>
      </section>

      <!-- Columna Derecha: Banner y Anuncios/Noticias -->
      <aside class="rightbar">
        <AnunciosPublicados/>
      </aside>
    </div>
    <!-- Modal para sesión expirada -->
    <v-dialog v-model="sessionExpiredModal" max-width="400">
      <v-card>
        <v-card-title class="headline">Sesión Expirada</v-card-title>
        <v-card-text>
          Tu sesión ha caducado. Por favor, inicia sesión nuevamente.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="cerrarSesion">
            Ir a Iniciar Sesión
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
// Importa tus componentes reales. Aquí se usan nombres de ejemplo.
// import Inicio from "@/components/PaginaInicio.vue";
// import RegistroAsistencia from "@/components/Asistencia/PaginaAsistencia.vue";
// import ConsultaAsistenciaAlumnos from "@/components/Asistencia/PaginaConsultaAsistenciaAlumnos.vue";
// import ConsultaAsistenciaEmpleados from "@/components/Asistencia/PaginaConsultaAsistenciaEmpleados.vue";
// import ConsultaAsistenciaAlumno from "@/components/Asistencia/PaginaConsultaAsistenciaAlumno.vue";
// import ConsultaAsistenciaEmpleado from "@/components/Asistencia/PaginaConsultaAsistenciaEmpleado.vue";
// import CalendarioEscolar from "@/components/Estudios/PaginaCalendarioEscolar.vue";
// import MisNotas from "@/components/Estudios/PaginaAlumnoMisNotas.vue";
// import DocenteMisCursos from "@/components/Estudios/PaginaDocenteMisCursos.vue";
// import DocenteMisCursosDetalle from "@/components/Estudios/PaginaDocenteMisCursosDetalle.vue";
// import DashboardAlumno from "@/components/Dashboard/PaginaDashboardAlumno.vue";



// Para validar si venció el token
//import jwtDecode from 'jwt-decode';
import AnunciosPublicados from '@/components/PaginaAnunciosPublicados.vue'
export default {
  name: "MainLayoutDesign1",
  components: { AnunciosPublicados },

  data() {
    return {
      centroEducativo: "Centro Educativo Demo",
      imagenPerfil: require("@/assets/images_perfil/10030796.jpg"),
      usuarioNombre: "",
      showUserMenu: false,
      mobileMenuOpen: false,
      isMobile: window.innerWidth <= 768,
      // Módulos obtenidos desde wsLoginWeb (almacenados en localStorage)
      modulosLogin: [],
      openSubmenu: null,
      activeMenu: "Inicio",
      activeSubmenu: null,
      // Vista actual se determina por el nombre del componente registrado
      vistaActual: "Inicio",
      anuncios: [
        "Anuncio 1: Lorem ipsum dolor sit amet",
        "Anuncio 2: Consectetur adipiscing elit",
        "Anuncio 3: Sed do eiusmod tempor"
      ],
      // Para el banner en la columna derecha (defínelo según tus necesidades)
      bannerItems: [
      { src: require('@/assets/images_inicio/lider_school_01.jpg') },
      { src: require('@/assets/images_inicio/lider_school_02.jpg') },
      { src: require('@/assets/images_inicio/lider_school_03.jpg') }
      ],
      // Aquí se almacenará la agrupación de submenús por módulo (usando modu_id)
      submenusGrouped: {},
      sessionExpiredModal: false
    };
  },
  watch: {
    sessionExpiredModal(newVal) {
      // Cuando el modal se cierra (newVal es false), redirige al login
      if (!newVal) {
        this.cerrarSesion();
      }
    }
  },
  computed: {
    // Construye la ruta de la imagen usando el valor del localStorage "profile"
    logoSrc() {
      const profile = localStorage.getItem("profile") || "default";
      return `/logo_${profile}.png`;
    },
    // Formatea el nombre para que cada palabra inicie con mayúscula
    formattedUserName() {
      if (!this.usuarioNombre) return "";
      return this.usuarioNombre
        .split(" ")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ");
    }
  },
  methods: {
    // Llama a esta función cuando el API indique que el token ha expirado
    showSessionExpiredModal() {
      this.sessionExpiredModal = true;
    },

    tokenExpirado(token) {
      if (!token) {
        console.error("Token no válido:", token);
        return true;
      }
      try { 
        const decoded = this.parseJwt(token);
        if (!decoded || !decoded.exp) {
          throw new Error("Token mal formado");
        }
        const currentTime = Math.floor(Date.now() / 1000);
        return decoded.exp < currentTime;
      } catch (error) {
        console.error("Error al decodificar el token:", error);
        return true;
      }
    },

    // tokenExpirado(token) {
    //   if (!token) {
    //     console.error("Token no válido:", token);
    //     return true;
    //   }

    //   try {
    //     let decoded;
    //     // Si jwt_decode es una función, úsala directamente
    //     if (typeof jwt_decode === 'function') {
    //       decoded = jwtDecode(token);
    //     } else if (jwtDecode && typeof jwtDecode.default === 'function') {
    //       // Si la función se encuentra en la propiedad default, úsala
    //       decoded = jwtDecode.default(token);
    //     } else {
    //       throw new Error("jwt_decode no es una función");
    //     }

    //     //console.log('Token recibido:', token);
    //     ////const decoded = jwtDecode(token);
    //     //console.log('Token decodificado:', decoded);
        
    //     const currentTime = Math.floor(Date.now() / 1000);
    //     //console.log('Expiración del token:', decoded.exp);
    //     //console.log('Tiempo actual:', currentTime);

    //     return decoded.exp < currentTime;
    //   } catch (error) {
    //     console.error("Error al decodificar el token:", error);
    //     return true;
    //   }
    // },
    toggleUserMenu() {
      this.showUserMenu = !this.showUserMenu;
    },
    toggleMobileMenu() {
      this.mobileMenuOpen = !this.mobileMenuOpen;
    },
    verPerfil() {
      //alert("Ver perfil");
    },
    cerrarSesion() {
      localStorage.removeItem("auth");
      localStorage.removeItem("token");
      localStorage.removeItem("profile");
      localStorage.removeItem("user");
      localStorage.removeItem("submenus");
      // Redirige al Login.vue
      this.$router.push("/");
    },
    mostrarVista(vista) {
      console.log(`Vista: ${vista}`);
      const vistasDisponibles = {
        Inicio: "Inicio",
        "Asistencia de alumnos": "ConsultaAsistenciaAlumnos",
        "Asistencia de empleados": "ConsultaAsistenciaEmpleados",
        "Mi asistencia": "MiAsistencia",
        "Mi asistencia ": "ConsultaAsistenciaEmpleado",
        "Calendario escolar": "CalendarioEscolar",
        "Registro de asistencias": "RegistroAsistencia",
        "Mis notas": "AlumnoMisNotas",
        "Cursos del docente": "DocenteMisCursos",
        "Cursos": "MisCursos",
        "Cursos del docente detalle": "DocenteMisCursosDetalle",
        "Mis cursos detalle": "MisCursosDetalle",
        "Dashboard del alumno": "DashboardAlumno",
        "Docentes del año escolar": "DocentesAnioEscolar",
        "Aulas": "MisAulas",
        "Mi horario escolar":"AlumnoHorarioEscolar",
        "Plan de estudios":"PlanEstudios",
        "Evaluaciones":"Evaluaciones",
        "Mi plan de estudios":"DocentePlanEstudios"        
      };

      // Verificar si la vista seleccionada existe en la lista
      if (vistasDisponibles[vista]) {
        //this.vistaActual = vistasDisponibles[vista];
        this.$router.push({ name: vistasDisponibles[vista] })
        this.activeSubmenu = vista;
      } else {
        console.warn(`Vista no encontrada para: ${vista}`);
      }

      if (vista === "Inicio") {
        this.activeMenu = "Inicio";
        this.openSubmenu = null;
      }
      //
      this.mobileMenuOpen = false;
    },
    toggleSubmenu(menuId) {
      if (this.openSubmenu === menuId) {
        this.openSubmenu = null;
      } else {
        this.openSubmenu = menuId;
        this.activeMenu = menuId;
      }
    },
    cargarDatosUsuario() {
      // Recupera los datos almacenados en localStorage (que se asignaron en Login.vue)
      const userData = JSON.parse(localStorage.getItem("user"));
      if (userData) {
        this.usuarioNombre = `${userData.pers_nombres} ${userData.pers_apellidos}`;
        this.centroEducativo = userData.cliente;
        // Se espera que userData.modulos sea un arreglo con la información de los módulos.
        this.modulosLogin = userData.modulos.map(modulo => ({
          ...modulo,
          icono: "mdi-folder" // Valor por defecto; se personaliza según el nombre
        }));
        // Personaliza los íconos según el nombre del módulo.
        this.modulosLogin.forEach(mod => {
          if (mod.modu_nombre === "Mi asistencia") {
            mod.icono = "mdi-calendar-check";
          } else if (mod.modu_nombre === "Mis estudios") {
            mod.icono = "mdi-book";
          } else if (mod.modu_nombre === "Mis cursos") {
            mod.icono = "mdi-book"; 
          } else if (mod.modu_nombre === "Mis trámites") {
            mod.icono = "mdi-note-outline";
          } else if (mod.modu_nombre === "Mis finanzas") {
            mod.icono = "mdi-finance";
          } else if (mod.modu_nombre === "Incidencias") {
            mod.icono = "mdi-account-plus";
          }
          // Puedes agregar más condiciones según otros módulos.
        });
      } else {
        console.error("No se encontraron datos del usuario en localStorage.");
      }
    },
    cargarSubmenus() {
      // Recupera los datos del servicio wsConsultaUsuarioPermisos desde localStorage.
      // Se asume que en el login se guardó la respuesta completa bajo la clave "submenus".
      const subData = JSON.parse(localStorage.getItem("submenus"));
      console.log("Datos de submenus obtenidos:", subData); // Depuración
      if (subData && subData.data) {
        // Agrupa los submenús por modu_id.
        this.submenusGrouped = {};
        subData.data.forEach(item => {
          // console.log("Submenú procesado:", item); // Verificar estructura de datos
          // Se asume que cada objeto tiene la propiedad 'modu_id'
          const mid = item.modu_id;
          if (!this.submenusGrouped[mid]) {
            this.submenusGrouped[mid] = [];
          }
          this.submenusGrouped[mid].push(item);
        });
      } else {
        console.error("No se encontraron datos de submenús en localStorage.");
      }
    },
    parseJwt(token) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        return JSON.parse(jsonPayload);
      } catch (e) {
        console.error("Error al decodificar el token manualmente:", e);
        return null;
      }
    }

  },
  mounted() {
    //Para mobile
    window.addEventListener("resize", () => {
      this.isMobile = window.innerWidth <= 768;
    });
    //Validar expiración del token
    const token = localStorage.getItem("token");
    if (token && this.tokenExpirado(token)) {
      this.showSessionExpiredModal();
    }

    this.cargarDatosUsuario();
    this.cargarSubmenus();
  }
};
</script>

<style scoped>
/* Diseño Layout 1 */
.layout1 {
  display: flex;
  flex-direction: column;
  height: 100vh;
  font-family: Arial, sans-serif;
}

.header {
  background-color: #1976D2;
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  position: relative;
}

.logo {
  width: 250px;
}

.logo img {
  height: 50px;
  width: 50px;
  position: center;
}

.NombreCentroEducativo {
  flex: 1;
  text-align: left;
}

.user {
  display: flex;
  align-items: center;
}

.user-info {
  position: relative;
  display: inline-block;
  cursor: pointer;
}

.menu-toggle {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.user-img {
  height: 60px;
  width: 60px;
  border-radius: 50%;
  margin-right: 8px;
}

.user-menu {
  position: absolute;
  top: 100%;
  left: 0;
  background: white;
  color: black;
  border: 1px solid #ccc;
  padding: 5px 0;
  z-index: 10;
  width: 100%;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
}

.user-menu div {
  padding: 5px 10px;
  cursor: pointer;
}

.user-menu div:hover {
  background: #eee;
}

.main-content {
  flex: 1;
  display: flex;
}

.sidebar {
  width: 250px;
  background: #f0f0f0;
  padding: 10px;
  flex: none;
}

.menu {
  list-style: none;
  padding: 0;
  margin: 0;
}

.menu > li {
  
  align-items: center; /* Asegura que el ícono y el texto estén alineados */
  padding: 12px 10px;
  cursor: pointer;
  border-bottom: 1px solid #ddd;
  font-weight: bold;
  font-size: 1.1em;
  background: #e8e8e8;
  transition: background-color 0.3s ease;
  /* Se elimina el display: flex para que el submenu se muestre en bloque debajo */
}

.menu > li.active,
.menu > li:hover {
  background: #d0d0d0;
}

.menu .menu-icon {
  display: inline-block;
  vertical-align: middle;
  width: 20px; /* Asegura un espacio reservado para el ícono */
  text-align: center;
  margin-right: 8px; /* Espacio entre el ícono y el texto */
}

.submenu {
  list-style: none;
  padding-left: 20px;
  margin-top: 5px;
}

.submenu > li {
  padding: 8px 10px;
  cursor: pointer;
  font-weight: normal;
  font-size: 0.95em;
  background: #fafafa;
  border-left: 3px solid transparent;
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.submenu > li.selected,
.submenu > li:hover {
  background: #eee;
  border-left: 3px solid #1976D2;
}

.content {
  flex: 1;
  padding: 10px;
  background: white;
}

.rightbar {
  flex: none;
  max-width: 400px;
  background: #e8e8e8;
  padding: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* 🔹 Reducir la altura del banner */
.rightbar v-sheet {
  padding: 5px; /* Reduce el padding */
  height: 160px; /* Limita la altura total */
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
  overflow: hidden;
}

/* 🔹 Reducir altura del carrusel */
.rightbar v-carousel {
  max-height: 120px; /* Reduce la altura del carrusel */
  overflow: hidden;
}

.rightbar v-carousel-item {
  height: 120px; /* Asegura que los elementos no sean más altos */
}

/* 🔹 Ajustar las imágenes dentro del carrusel */
.rightbar v-img {
  max-height: 120px; /* Limita la altura de la imagen */
  object-fit: cover; /* Asegura que la imagen se ajuste */
}

/* 🔹 Ajustar la posición de la sección "Anuncios" */
.rightbar h3 {
  margin-top: 20px; /* Reduce el espacio entre el banner y los anuncios */
  text-align: center;
}

/* 🔹 Ajuste del carrusel */
.banner-carousel {
  width: 100%;
  max-width: 100%;
  height: auto;
}

/* 🔹 Ocultar los botones de navegación del carrusel */
.banner-carousel .v-carousel__controls,
.banner-carousel .v-carousel__controls button {
  display: none !important;
}

/* Transición para el submenu */
.fade-enter-active, .fade-leave-active {
  transition: all 0.3s ease;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
  }
  .sidebar,
  .logo,
  .NombreCentroEducativo {
    display: none;
  }
  .rightbar {
    width: 100%;
  }
  .menu-header {
    display: flex;
    align-items: center;
    /* Opcional: un padding o margin si deseas */
    /* padding: 8px; */
  }

  .menu-logo-mobile {
    max-width: 40px; /* Ajusta este valor a tu preferencia */
    height: auto;
    margin-right: 8px; /* separa un poco la imagen del texto */
  }

  @media (max-width: 768px) {
    /* Ajustes extra si deseas que sea aún más pequeño en móviles */
    .menu-logo-mobile {
      max-width: 35px;
    }
  }
}
</style>
