import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const routes = [
  { path: '/', name: 'home', component: () => import('../views/HomeView.vue') },
  { path: '/login', name: 'login', component: () => import('../views/LoginView.vue') },
  { path: '/register', name: 'register', component: () => import('../views/RegisterView.vue') },
  { path: '/planner', name: 'planner', component: () => import('../views/PlannerView.vue'), meta: { auth: true } },
  { path: '/planner/:id', name: 'planner-edit', component: () => import('../views/PlannerView.vue'), meta: { auth: true } },
  { path: '/ai', name: 'ai', component: () => import('../views/AiPlanView.vue'), meta: { auth: true } },
  { path: '/trips', name: 'trips', component: () => import('../views/TripsView.vue'), meta: { auth: true } },
  { path: '/trip/:id', name: 'trip-detail', component: () => import('../views/TripDetailView.vue') },
  { path: '/calendar', name: 'calendar', component: () => import('../views/CalendarView.vue'), meta: { auth: true } },
  { path: '/templates', name: 'templates', component: () => import('../views/TemplatesView.vue') },
  { path: '/profile', name: 'profile', component: () => import('../views/ProfileView.vue'), meta: { auth: true } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
});

router.beforeEach((to) => {
  const auth = useAuthStore();
  if (to.meta.auth && !auth.isLoggedIn) {
    return { name: 'login', query: { redirect: to.fullPath } };
  }
});

export default router;
