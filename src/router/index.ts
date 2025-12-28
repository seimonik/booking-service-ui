import { createRouter, createWebHistory } from 'vue-router'
// import HomeView from '../views/HomeView.vue'
import MainView from '@/views/MainView.vue'
import SearchView from '@/views/SearchView.vue'
import BookingView from '@/views/BookingView.vue'
import HotelsView from '@/views/HotelsView.vue'
import PaymentView from '@/views/PaymentView.vue'
import ClientBookingsView from '@/views/ClientBookingsView.vue'
import EmailLoginView from '@/views/EmailLoginView.vue'

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
          path: '/hotels',
          name: 'Hotels',
          component: HotelsView,
          meta: {
            title: 'Отели',
          },
          props: (route) => ({
            destination: route.query.destination,
            checkIn: route.query.checkIn,
            checkOut: route.query.checkOut,
          }),
        },
        {
          path: '/booking/:hotelId',
          name: 'Booking',
          component: BookingView,
          meta: {
            title: 'Бронирование',
          },
          props: (route) => ({
            hotelId: route.params.hotelId,
            checkIn: route.query.checkIn,
            checkOut: route.query.checkOut,
          }),
        },
        {
          path: '/my-bookings',
          name: 'MyBookings',
          component: ClientBookingsView,
          meta: {
            title: 'Мои бронирования',
          },
        },
        {
          path: '/login',
          name: 'Login',
          component: EmailLoginView,
          meta: {
            title: 'Аутентификация',
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
    {
      path: '/payment/:amount',
      name: 'Payment',
      component: PaymentView,
      meta: {
        title: 'Оплата',
      },
      props: (route) => ({
        amount: route.params.amount,
        bookingId: route.query.bookingId,
      }),
    },
  ],
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title as string
  if (to.name === 'root') {
    next('/home')
  }
  next()
})

export default router
