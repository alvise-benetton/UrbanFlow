import { createRouter, createWebHistory } from 'vue-router';
import Home from '@/components/generalComponents/Home.vue';
import Login from '@/components/generalComponents/Login.vue';
import { jwtDecode } from 'jwt-decode';


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
  const token = localStorage.getItem('JWT'); // Controlla se esiste un token
  if (to.meta.requiresAuth) {

    if(isTokenValid(token)){
      next();
    }else{
      next('/login'); // Reindirizza se non è autenticato
    }   
  } else {
    next();
  }
});

function isTokenValid(token) {
    if (!token) return false;

    try {
        const decoded = jwtDecode(token);
        //console.log(decoded);
        const currentTime = Date.now() / 1000;
        return decoded.exp > currentTime;
    } catch (error) {
        console.error("Errore nella decodifica del token:", error);
        return false;
    }
}

export default router;
