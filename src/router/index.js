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
//import DocenteHorarioEscolar from '../components/Estudios/PaginaDocenteHorarioEscolar.vue';
import DocenteMiHorario from '../components/Estudios/PaginaDocenteMiHorario.vue';
import DocentesHorarios from '../components/Estudios/PaginaDocentesHorarios.vue';
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
    //Desa
    //component: () => import('@/components/LoginDesa.vue'),
    //Prod
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
        meta: {
          showBreadcrumb: true,
          breadcrumb: [
            { text: 'Principal', to: '/principal' },
            { text: 'Consulta de asistencia de alumnos' }
          ]
        }
      },
      {
        path: 'consulta-asistencia-empleados',
        name: 'ConsultaAsistenciaEmpleados',
        component: ConsultaAsistenciaEmpleados,
        meta: {
          showBreadcrumb: true,
          breadcrumb: [
            { text: 'Principal', to: '/principal' },
            { text: 'Consulta de asistencia de empleados' }
          ]
        }
      },
      {
        path: 'consulta-asistencia-alumno',
        name: 'MiAsistencia',
        component: MiAsistencia,
        meta: {
          showBreadcrumb: true,
          breadcrumb: [
            { text: 'Principal', to: '/principal' },
            { text: 'Consulta de asistencia del alumno' }
          ]
        }
      },
      {
        path: 'consulta-asistencia-empleado',
        name: 'ConsultaAsistenciaEmpleado',
        component: ConsultaAsistenciaEmpleado,
        meta: {
          showBreadcrumb: true,
          breadcrumb: [
            { text: 'Principal', to: '/principal' },
            { text: 'Consulta de asistencia del empleado' }
          ]
        }
      },
      {
        path: 'calendario-escolar',
        name: 'CalendarioEscolar',
        component: CalendarioEscolar,
        meta: {
          showBreadcrumb: true,
          breadcrumb: [
            { text: 'Principal', to: '/principal' },
            { text: 'Calendario escolar' }
          ]
        }
      },
      {
        path: 'registro-asistencia',
        name: 'RegistroAsistencia',
        component: RegistroAsistencia,
        meta: {
          showBreadcrumb: true,
          breadcrumb: [
            { text: 'Principal', to: '/principal' },
            { text: 'Registro de asistencia' }
          ]
        }
      },
      {
        path: 'mis-notas',
        name: 'AlumnoMisNotas',
        component: AlumnoMisNotas,
        meta: {
          showBreadcrumb: true,
          breadcrumb: [
            { text: 'Principal', to: '/principal' },
            { text: 'Mis notas' }
          ]
        }
      },
      {
        path: 'dashboard-alumno',
        name: 'DashboardAlumno',
        component: DashboardAlumno,
        meta: {
          showBreadcrumb: true,
          breadcrumb: [
            { text: 'Principal', to: '/principal' },
            { text: 'Dashboard' }
          ]
        }
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
        meta: {
          showBreadcrumb: true,
          breadcrumb: [
            { text: 'Principal', to: '/principal' },
            { text: 'Mis cursos' }
          ]
        }
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
        meta: {
          showBreadcrumb: true,
          breadcrumb: [
            { text: 'Principal', to: '/principal' },
            { text: 'Docentes' }
          ]
        }
      },
      {
        path: 'mis-aulas',
        name: 'MisAulas',
        component: MisAulas,
        meta: {
          showBreadcrumb: true,
          breadcrumb: [
            { text: 'Principal', to: '/principal' },
            { text: 'Mis aulas' }
          ]
        }
      },
      {
        path: 'mi-horario-escolar',
        name: 'AlumnoHorarioEscolar',
        component: AlumnoHorarioEscolar,
        meta: {
          showBreadcrumb: true,
          breadcrumb: [
            { text: 'Principal', to: '/principal' },
            { text: 'Horario escolar' }
          ]
        }
      }, 
      {
        path: 'docentes-horarios',
        name: 'DocentesHorarios',
        component: DocentesHorarios,
        meta: {
          showBreadcrumb: true,
          breadcrumb: [
            { text: 'Principal', to: '/principal' },
            { text: 'Docentes', to: '/principal/docentes-anio-escolar' },
            { text: 'Horario escolar' }
          ]
        }
      },
      {
        path: 'docente-mi-horario',
        name: 'DocenteMiHorario',
        component: DocenteMiHorario,
        meta: {
          showBreadcrumb: true,
          breadcrumb: [
            { text: 'Principal', to: '/principal' },
            { text: 'Mi horario' }
          ]
        }
      },
/*       {
        path: 'docente-horario-escolar',
        name: 'DocenteHorarioEscolar',
        component: DocenteHorarioEscolar,
        meta: {
          showBreadcrumb: true
        }
      }, */
      {
        path: 'plan-estudios',
        name: 'PlanEstudios',
        component: PlanEstudios,
        meta: {
          showBreadcrumb: true,
          breadcrumb: [
            { text: 'Principal', to: '/principal' },
            { text: 'Plan de estudios' }
          ]
        }
      },
      {
        path: 'evaluaciones',
        name: 'Evaluaciones',
        component: Evaluaciones,
        meta: {
          showBreadcrumb: true,
          breadcrumb: [
            { text: 'Principal', to: '/principal' },
            { text: 'Evaluaciones' }
          ]
        }
      },
      {
        path: 'docente-plan-estudios',
        name: 'DocentePlanEstudios',
        component: DocentePlanEstudios,
        meta: {
          showBreadcrumb: true,
          breadcrumb: [
            { text: 'Principal', to: '/principal' },
            { text: 'Mi plan de estudios' }
          ]
        }
      },
      {
        path: 'matricula',
        name: 'Matricula',
        component: Matricula,
        meta: {
          showBreadcrumb: true,
          breadcrumb: [
            { text: 'Principal', to: '/principal' },
            { text: 'Matricula' }
          ]
        }
      },
      {
        path: 'alumnos',
        name: 'Alumnos',
        component: Alumnos,
        meta: {
          showBreadcrumb: true,
          breadcrumb: [
            { text: 'Principal', to: '/principal' },
            { text: 'Alumnos' }
          ]
        }
      },      
      {
        path: 'empleados',
        name: 'Empleados',
        component: Empleados,
        meta: {
          showBreadcrumb: true,
          breadcrumb: [
            { text: 'Principal', to: '/principal' },
            { text: 'Empleados' }
          ]
        }
      }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

/* router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('auth') === 'true';
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/');
  } else {
    next();
  }
}); */

router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('auth') === 'true';

  console.log('🔄 Navegando hacia:', to.fullPath);
  console.log('🔐 ¿Está autenticado?', isAuthenticated);

  if (to.meta.requiresAuth && !isAuthenticated) {
    console.warn('🚫 Ruta bloqueada. No autenticado.');
    next('/');
  } else {
    console.log('✅ Acceso permitido a:', to.fullPath);
    next();
  }
});


export default router;

