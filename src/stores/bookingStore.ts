import { getBookingClient } from '@/api/apiClients'
import { defineStore } from 'pinia'

export const useBookingStore = defineStore('bookingStore', {
  actions: {
    GetBookings() {
      return getBookingClient().bookingAll()
    },
  },
})
