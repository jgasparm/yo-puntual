<template>
  <div class="layout1">
    <!-- CABECERA -->
    <header class="header">
      <div class="logo">
        <img src="/logo.png" alt="Logo">       
      </div>
      <div class="left">
        <h1>{{ centroEducativo }}</h1>
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
    </header>

    <!-- CUERPO: 3 columnas -->
    <div class="main-content">
      <!-- Columna Izquierda: Menú -->
      <aside class="sidebar">
        <ul class="menu">
          <!-- Menú fijo: Inicio -->
          <li @click="mostrarVista('Inicio')" :class="{ active: activeMenu === 'Inicio' }">
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
        <component :is="vistaActual"></component>
      </section>

      <!-- Columna Derecha: Banner y Anuncios/Noticias -->
      <aside class="rightbar">
        <!-- Banner Superior (se muestra en la parte superior de la columna derecha) -->
        <v-sheet color="blue lighten-4" class="pa-6 text-center">
          <h2 class="text-h5 font-weight-bold">
            ¡Visita nuestra web y conoce los logros de nuestra comunidad UPCina! 
            <v-icon color="red">mdi-hand-pointing-right</v-icon>
          </h2>
          <v-carousel hide-delimiters cycle>
            <v-carousel-item v-for="(item, i) in bannerItems" :key="i">
              <v-img :src="item.src" contain height="auto" width="100%" class="banner-img"></v-img>
            </v-carousel-item>
          </v-carousel>
        </v-sheet>

        <!-- Sección de Anuncios/Noticias -->
        <h3>Anuncios</h3>
        <ul>
          <li v-for="(anuncio, index) in anuncios" :key="index">{{ anuncio }}</li>
        </ul>
      </aside>
    </div>
  </div>
</template>

<script>
// Importa tus componentes reales. Aquí se usan nombres de ejemplo.
import Inicio from "@/components/PaginaInicio.vue";
import RegistroAsistencia from "@/components/Asistencia/PaginaAsistencia.vue";
import ConsultaAsistencia from "@/components/Asistencia/PaginaConsultaAsistencia.vue";
import MisNotas from "@/components/PaginaEstudios.vue";
import MisCursos from "@/components/PaginaEstudios.vue";

export default {
  name: "MainLayoutDesign1",
  components: {
    Inicio,
    RegistroAsistencia,
    ConsultaAsistencia,
    MisNotas,
    MisCursos
  },
  data() {
    return {
      centroEducativo: "Centro Educativo Demo",
      imagenPerfil: require("@/assets/images_perfil/10030796.jpg"),
      usuarioNombre: "",
      showUserMenu: false,
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
      submenusGrouped: {}
    };
  },
  computed: {
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
    toggleUserMenu() {
      this.showUserMenu = !this.showUserMenu;
    },
    verPerfil() {
      alert("Ver perfil");
    },
    cerrarSesion() {
      localStorage.removeItem("auth");
      this.$router.push("/");
    },
    mostrarVista(vista) {
      console.log(`Vista: ${vista}`);
      const vistasDisponibles = {
        Inicio: "Inicio",
        "Consulta de asistencias": "ConsultaAsistencia",
        "Registro de asistencias": "RegistroAsistencia",
        "Mis notas": "MisNotas",
        "Mis cursos": "MisCursos"
      };

      // Verificar si la vista seleccionada existe en la lista
      if (vistasDisponibles[vista]) {
        this.vistaActual = vistasDisponibles[vista];
        this.activeSubmenu = vista;
      } else {
        console.warn(`Vista no encontrada para: ${vista}`);
      }

      if (vista === "Inicio") {
        this.activeMenu = "Inicio";
        this.openSubmenu = null;
      }
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
          console.log("Submenú procesado:", item); // Verificar estructura de datos
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
    }
  },
  mounted() {
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

.left {
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
  width: 400px;
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
  .rightbar {
    width: 100%;
  }
}
</style>
