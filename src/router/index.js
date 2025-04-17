// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
//import Login from '../components/Login.vue';
import Principal from '../components/PaginaPrincipal.vue';
import Inicio from '../components/PaginaInicio.vue';
import ConsultaAsistenciaAlumnos from '../components/Asistencia/PaginaConsultaAsistenciaAlumnos.vue';
import ConsultaAsistenciaEmpleados from '../components/Asistencia/PaginaConsultaAsistenciaEmpleados.vue';
import MiAsistencia from '../components/Asistencia/PaginaConsultaAsistenciaAlumno.vue';
import ConsultaAsistenciaEmpleado from '../components/Asistencia/PaginaConsultaAsistenciaEmpleado.vue';
import CalendarioEscolar from '../components/Estudios/PaginaCalendarioEscolar.vue';
import RegistroAsistencia from '../components/Asistencia/PaginaRegistroAsistencia.vue';
import AlumnoMisNotas from '../components/Estudios/PaginaAlumnoMisNotas.vue';
import DashboardAlumno from '../components/Dashboard/PaginaDashboardAlumno.vue';
import DocenteMisCursos from '../components/Estudios/PaginaDocenteMisCursos.vue';
import MisCursos from '../components/Estudios/PaginaMisCursos.vue';
import DocenteMisCursosRegistroNotas from '../components/Estudios/PaginaDocenteMisCursosRegistroNotas.vue';
import DocenteMisCursosConsultaNotas from '../components/Estudios/PaginaDocenteMisCursosConsultaNotas.vue';
import MisCursosConsultaNotas from '../components/Estudios/PaginaMisCursosConsultaNotas.vue';
import DocentesAnioEscolar from '../components/Mantenimiento/PaginaDocentesAnioEscolar.vue';
import MisAulas from '../components/Mantenimiento/PaginaMisAulas.vue';
import AlumnoHorarioEscolar from '../components/Estudios/PaginaAlumnoHorarioEscolar.vue';
import DocenteHorarioEscolar from '../components/Estudios/PaginaDocenteHorarioEscolar.vue';
import PlanEstudios from '../components/Mantenimiento/PaginaPlanEstudios.vue';
import Evaluaciones from '../components/Mantenimiento/PaginaEvaluaciones.vue';
import DocentePlanEstudios from '../components/Estudios/PaginaDocentePlanEstudios.vue';
import Matricula from '../components/Mantenimiento/PaginaMatricula.vue';
import Alumnos from '../components/Mantenimiento/PaginaAlumno.vue';
import Empleados from '../components/Mantenimiento/PaginaEmpleado.vue';

const routes = [
  {
    path: '/',
    name: 'login',
    component: () => import('@/components/Login.vue'),
      meta: {
        showBreadcrumb: false
      }
   //component: Login
  },
  {
    path: '/principal',
    component: Principal,
    meta: { requiresAuth: true, showBreadcrumb: false }, // evita breadcrumb en /principal directamente
    children: [
      {
        path: '',
        name: 'inicio',
        component: Inicio
      },
      {
        path: 'consulta-asistencia-alumnos',
        name: 'ConsultaAsistenciaAlumnos',
        component: ConsultaAsistenciaAlumnos,
        meta: { showBreadcrumb: true }
      },
      {
        path: 'consulta-asistencia-empleados',
        name: 'ConsultaAsistenciaEmpleados',
        component: ConsultaAsistenciaEmpleados,
        meta: { showBreadcrumb: true }
      },
      {
        path: 'consulta-asistencia-alumno',
        name: 'MiAsistencia',
        component: MiAsistencia,
        meta: { showBreadcrumb: true }
      },
      {
        path: 'consulta-asistencia-empleado',
        name: 'ConsultaAsistenciaEmpleado',
        component: ConsultaAsistenciaEmpleado,
        meta: { showBreadcrumb: true }
      },
      {
        path: 'calendario-escolar',
        name: 'CalendarioEscolar',
        component: CalendarioEscolar,
        meta: { showBreadcrumb: true }
      },
      {
        path: 'registro-asistencia',
        name: 'RegistroAsistencia',
        component: RegistroAsistencia,
        meta: { showBreadcrumb: true }
      },
      {
        path: 'mis-notas',
        name: 'AlumnoMisNotas',
        component: AlumnoMisNotas,
        meta: { showBreadcrumb: true }
      },
      {
        path: 'dashboard-alumno',
        name: 'DashboardAlumno',
        component: DashboardAlumno,
        meta: { showBreadcrumb: true }
      },
      {
        path: 'mis-cursos-docente',
        name: 'DocenteMisCursos',
        component: DocenteMisCursos,
        meta: {
          showBreadcrumb: true,
          breadcrumb: [
            { text: 'Principal', to: '/principal' },
            { text: 'Mis cursos' }
          ]
        }
      },
      {
        path: 'mis-cursos',
        name: 'MisCursos',
        component: MisCursos,
        meta: { showBreadcrumb: true }
      },
      {
        path: 'mis-cursos-registro-notas',
        name: 'DocenteMisCursosRegistroNotas',
        component: DocenteMisCursosRegistroNotas,
        meta: {
          showBreadcrumb: true,
          breadcrumb: [
            { text: 'Principal', to: '/principal' },
            { text: 'Mis cursos', to: '/principal/mis-cursos-docente' },
            { text: 'Registro de notas' }
          ]
        }
      },
      {
        path: 'docente-mis-cursos-consulta-notas',
        name: 'DocenteMisCursosConsultaNotas',
        component: DocenteMisCursosConsultaNotas,
        meta: {
          showBreadcrumb: true,
          breadcrumb: [
            { text: 'Principal', to: '/principal' },
            { text: 'Mis cursos', to: '/principal/mis-cursos-docente' },
            { text: 'Consulta de notas' }
          ]
        }
      },
      {
        path: 'mis-cursos-consulta-notas',
        name: 'MisCursosConsultaNotas',
        component: MisCursosConsultaNotas,
        meta: {
          showBreadcrumb: true,
          breadcrumb: [
            { text: 'Principal', to: '/principal' },
            { text: 'Mis cursos', to: '/principal/mis-cursos' },
            { text: 'Consulta de notas' }
          ]
        }
      },
      {
        path: 'docentes-anio-escolar',
        name: 'DocentesAnioEscolar',
        component: DocentesAnioEscolar,
        meta: { showBreadcrumb: true }
      },
      {
        path: 'mis-aulas',
        name: 'MisAulas',
        component: MisAulas,
        meta: { showBreadcrumb: true }
      },
      {
        path: 'mi-horario-escolar',
        name: 'AlumnoHorarioEscolar',
        component: AlumnoHorarioEscolar,
        meta: { showBreadcrumb: true }
      },
      {
        path: 'horario-escolar',
        name: 'DocenteHorarioEscolar',
        component: DocenteHorarioEscolar,
        meta: { showBreadcrumb: true }
      },
      {
        path: 'plan-estudios',
        name: 'PlanEstudios',
        component: PlanEstudios,
        meta: { showBreadcrumb: true }
      },
      {
        path: 'evaluaciones',
        name: 'Evaluaciones',
        component: Evaluaciones,
        meta: { showBreadcrumb: true }
      },
      {
        path: 'docente-plan-estudios',
        name: 'DocentePlanEstudios',
        component: DocentePlanEstudios,
        meta: { showBreadcrumb: true }
      },
      {
        path: 'matricula',
        name: 'Matricula',
        component: Matricula,
        meta: { showBreadcrumb: true }
      },
      {
        path: 'alumnos',
        name: 'Alumnos',
        component: Alumnos,
        meta: { showBreadcrumb: true }
      },
      {
        path: 'empleados',
        name: 'Empleados',
        component: Empleados,
        meta: { showBreadcrumb: true }
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
