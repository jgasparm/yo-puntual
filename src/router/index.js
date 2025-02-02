// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import Login from '../components/Login.vue';
import Principal from '../components/PaginaPrincipal.vue';
import Inicio from '../components/PaginaInicio.vue';

const routes = [
  {
    path: '/',
    name: 'login',
    component: Login
  },
  {
    path: '/principal',
    name: 'principal',
    component: Principal,
    meta: { requiresAuth: true }  // Se marca esta ruta como protegida
  },
  {
    path: "/inicio",
    name: "inicio",
    component: Inicio,
    meta: { requiresAuth: true }  // Se marca esta ruta como protegida
  }
  
];

const router = createRouter({
//  history: createWebHistory(process.env.BASE_URL),
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
