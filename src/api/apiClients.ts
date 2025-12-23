import { BookingApiClient, type IBookingApiClient } from './bookingApiClient.generated'

export const getBookingClient = (): IBookingApiClient => {
  return new BookingApiClient('http://localhost:8001', {
    fetch(url, init) {
      return fetch(url, init)
    },
  })
}
