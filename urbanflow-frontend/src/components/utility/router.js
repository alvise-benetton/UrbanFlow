import { createRouter, createWebHistory } from 'vue-router';
import Home from '@/components/generalComponents/Home.vue';
import Login from '@/components/generalComponents/Login.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: true } // Protegge questa route
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Middleware per proteggere le route
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('JWT'); // Controlla se esiste un token
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login'); // Reindirizza se non è autenticato
  } else {
    next();
  }
});

export default router;
