import { createRouter, createWebHistory } from 'vue-router'
// import HomeView from '../views/HomeView.vue'
import MainView from '@/views/MainView.vue'
import SearchView from '@/views/SearchView.vue'
import BookingView from '@/views/BookingView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'root',
      component: MainView,
      children: [
        {
          path: '/home',
          name: 'Home',
          component: SearchView,
          meta: {
            title: 'Поиск отелей',
          },
        },
        {
          path: '/booking',
          name: 'Booking',
          component: BookingView,
          meta: {
            title: 'Отели',
          },
        },
        {
          path: '/about',
          name: 'about',
          // route level code-splitting
          // this generates a separate chunk (About.[hash].js) for this route
          // which is lazy-loaded when the route is visited.
          component: () => import('../views/AboutView.vue'),
        },
      ],
    },
  ],
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title
  if (to.name === 'root') {
    next('/home')
  }
  next()
})

export default router
