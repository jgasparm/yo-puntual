// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import Login from '../components/Login.vue';
import Principal from '../components/PaginaPrincipal.vue';
import Inicio from '../components/PaginaInicio.vue';
import ConsultaAsistenciaAlumnos from '../components/Asistencia/PaginaConsultaAsistenciaAlumnos.vue';
import ConsultaAsistenciaEmpleados from '../components/Asistencia/PaginaConsultaAsistenciaEmpleados.vue';
import ConsultaAsistenciaAlumno from '../components/Asistencia/PaginaConsultaAsistenciaAlumno.vue';
import ConsultaAsistenciaEmpleado from '../components/Asistencia/PaginaConsultaAsistenciaEmpleado.vue';
import CalendarioEscolar from '../components/Estudios/PaginaCalendarioEscolar.vue';
import RegistroAsistencia from '../components/Asistencia/PaginaAsistencia.vue';
import AlumnoMisNotas from '../components/Estudios/PaginaAlumnoMisNotas.vue';
import DashboardAlumno from '../components/Dashboard/PaginaDashboardAlumno.vue';
import DocenteMisCursos from '../components/Estudios/PaginaDocenteMisCursos.vue';
import DocenteMisCursosRegistroNotas from '../components/Estudios/PaginaDocenteMisCursosRegistroNotas.vue';
import DocenteMisCursosConsultaNotas from '../components/Estudios/PaginaDocenteMisCursosConsultaNotas.vue';

const routes = [
  {
    path: '/',
    name: 'login',
    component: Login
  },
  {
    path: '/principal',
    component: Principal,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'inicio',
        component: Inicio
      },
      {
        path: 'consulta-asistencia-alumnos',
        name: 'ConsultaAsistenciaAlumnos',
        component: ConsultaAsistenciaAlumnos
      },
      {
        path: 'consulta-asistencia-empleados',
        name: 'ConsultaAsistenciaEmpleados',
        component: ConsultaAsistenciaEmpleados
      },
      {
        path: 'consulta-asistencia-alumno',
        name: 'ConsultaAsistenciaAlumno',
        component: ConsultaAsistenciaAlumno
      },
      {
        path: 'consulta-asistencia-empleado',
        name: 'ConsultaAsistenciaEmpleado',
        component: ConsultaAsistenciaEmpleado
      },
      {
        path: 'calendario-escolar',
        name: 'CalendarioEscolar',
        component: CalendarioEscolar
      },
      {
        path: 'registro-asistencia',
        name: 'RegistroAsistencia',
        component: RegistroAsistencia
      },
      {
        path: 'mis-notas',
        name: 'AlumnoMisNotas',
        component: AlumnoMisNotas
      },
      {
        path: 'dashboard-alumno',
        name: 'DashboardAlumno',
        component: DashboardAlumno
      },
      {
        path: 'mis-cursos',
        name: 'DocenteMisCursos',
        component: DocenteMisCursos
      },
      {
        path: 'mis-cursos-registro-notas',
        name: 'DocenteMisCursosRegistroNotas',
        component: DocenteMisCursosRegistroNotas
      },
      {
        path: 'mis-cursos-consulta-notas',
        name: 'DocenteMisCursosConsultaNotas',
        component: DocenteMisCursosConsultaNotas
      }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Guardia de navegación para proteger rutas
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('auth') === 'true';

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/'); // Redirige a login si no está autenticado
  } else {
    next(); // Permite el acceso a la ruta
  }
});

export default router;
