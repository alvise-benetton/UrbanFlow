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
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: "/login", name: "Login", component: Login },
    { path: "/", redirect: "/Mappa" },
    { path: "/Mappa", name: "Mappa", component: Home , meta: { requiresAuth: true } },
    { path: "/Eventi", name: "Eventi", component: Home , meta: { requiresAuth: true } },
    { path: "/Eventi/:id", name: "EventoDettaglio", component: Home , meta: { requiresAuth: true } },
    { path: "/Zone", name: "Zone", component: Home , meta: { requiresAuth: true } },
    { path: "/Zone/:id", name: "ZonaDettaglio", component: Home , meta: { requiresAuth: true } },
    { path: "/User", name: "User", component: Home, meta: { requiresAuth: true } },
    { path: "/:pathMatch(.*)*", name: "NotFound", component: { template: "<h1>404 Page Not Found</h1>" } }
  ]
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

export function isTokenValid(token) {
    if (!token) return false;

    try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        return decoded.exp > currentTime;
    } catch (error) {
        console.error("Errore nella decodifica del token:", error);
        return false;
    }
}

export default router;

