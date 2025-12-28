import { getBookingClient } from '@/api/apiClients'
import type { AddBookingModel, PaymentRequest } from '@/api/bookingApiClient.generated'
import { defineStore } from 'pinia'

export const useBookingStore = defineStore('bookingStore', {
  state: () => ({ clientId: '', clientFullName: '', clientEmail: '', isAuthenticated: false }), // { clientId: '', clientFullName: '', clientEmail: '', isAuthenticated: false }
  actions: {
    GetBookings(city: string | undefined, start: string | undefined, end: string | undefined) {
      return getBookingClient().bookingAll(city, start, end)
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
    ValidatePromocode(code: string, roomTypeId: string, email: string, fullName: string) {
      return getBookingClient().validatePromo(code, roomTypeId, email, fullName)
    },
    GetClientBookings(clientId: string) {
      return getBookingClient().byClient(clientId)
    },
    CalculateRefundAmount(bookingId: string) {
      return getBookingClient().calculateRefund(bookingId)
    },
    CancelBooking(bookingId: string) {
      return getBookingClient().cancel(bookingId)
    },
    SendCode(email: string) {
      return getBookingClient().sendCode(email)
    },
    async VerifyCode(email: string, code: string) {
      const result = await getBookingClient().verify(email, code)

      this.clientId = result.id!
      this.clientEmail = result.email!
      this.clientFullName = result.fullName!
      this.isAuthenticated = true

      return result
    },
  },
})
