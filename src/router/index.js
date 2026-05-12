import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/user'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: () => import('../pages/Login.vue'), meta: { guest: true } },
  { path: '/register', component: () => import('../pages/Register.vue'), meta: { guest: true } },
  { path: '/pending', component: () => import('../pages/Pending.vue'), meta: { guest: true } },
  { path: '/home', component: () => import('../pages/Home.vue'), meta: { requiresAuth: true } },
  { path: '/notes', component: () => import('../pages/Notes.vue'), meta: { requiresAuth: true } },
  { path: '/notes/new', component: () => import('../pages/NoteForm.vue'), meta: { requiresAuth: true } },
  { path: '/events', component: () => import('../pages/Events.vue'), meta: { requiresAuth: true } },
  { path: '/events/:id', component: () => import('../pages/EventDetail.vue'), meta: { requiresAuth: true } },
  { path: '/admin', component: () => import('../pages/Admin.vue'), meta: { requiresAuth: true, admin: true } },
  { path: '/profile', component: () => import('../pages/Profile.vue'), meta: { requiresAuth: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next('/login')
  } else if (to.meta.guest && userStore.isLoggedIn) {
    next('/home')
  } else {
    next()
  }
})

export default router
