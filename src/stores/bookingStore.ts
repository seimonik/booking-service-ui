import { getBookingClient } from '@/api/apiClients'
import type { AddBookingModel, PaymentRequest } from '@/api/bookingApiClient.generated'
import { defineStore } from 'pinia'

export const useBookingStore = defineStore('bookingStore', {
  actions: {
    GetBookings() {
      return getBookingClient().bookingAll()
    },
    GetHotel(hotelId: string) {
      return getBookingClient().bookingGET(hotelId)
    },
    ProcessPayment(body: PaymentRequest) {
      return getBookingClient().payment(body)
    },
    AddBooking(body: AddBookingModel) {
      return getBookingClient().bookingPOST(body)
    },
  },
})
