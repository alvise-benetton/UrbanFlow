import { createRouter, createWebHistory } from 'vue-router';
import { API_BASE_URL } from '@/services/apiConfig';
import { jwtDecode } from 'jwt-decode';

const Home = () => import('@/components/generalComponents/Home.vue');
const Login = () => import('@/components/generalComponents/Login.vue');
const UserView = () => import('@/components/generalComponents/UserView.vue');
const UserInfo = () => import('@/components/generalComponents/UserInfo.vue');
const UserManage = () => import('@/components/generalComponents/UserManage.vue');

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: "/login", name: "Login", component: Login },
    { path: "/", redirect: "/Mappa" },
    { path: "/Mappa", name: "Mappa", component: Home, meta: { requiresAuth: true } },
    { path: "/Eventi", name: "Eventi", component: Home, meta: { requiresAuth: true } },
    { path: "/Eventi/:id", name: "EventoDettaglio", component: Home, meta: { requiresAuth: true } },
    { path: "/Zone", name: "Zone", component: Home, meta: { requiresAuth: true } },
    { path: "/Zone/:id", name: "ZonaDettaglio", component: Home, meta: { requiresAuth: true } },
    { path: "/User", name: "User", component: Home, meta: { requiresAuth: true } },
    {
      path: "/AreaRiservata", name: "AreaRiservata", component: UserView, children: [
        { path: "info", component: UserInfo , meta: { requiresAuth: true } },
        { path: "manage", component: UserManage, meta: { requiresAuth: true } },
    ]},
    { path: "/:pathMatch(.*)*", name: "NotFound", component: { template: "<h1>404 Page Not Found</h1>" } }
  ]
});

// Middleware per proteggere le route
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('JWT'); // Controlla se esiste un token

  if(to.meta.admin){
    if (isTokenValid(token)) {
      const decoded = jwtDecode(token);
      if (decoded.role === 'admin') {
        next();
      } else {
        next('/'); // Reindirizza se non è un admin
      }
    } else {
      next('/login'); // Reindirizza se il token non è valido
    }
  }

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

export async function authFetch(url, options = {}) {
  const baseUrl = API_BASE_URL;
  const targetUrl = url.startsWith('http')
    ? url
    : `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;

  const response = await fetch(targetUrl, options);

  if (response.status === 401 || response.status === 403) {
    if (window.location.pathname !== '/login') {
      router.push('/login');
    }
  }
  return response;
}
export default router;

