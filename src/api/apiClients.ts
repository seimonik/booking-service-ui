import { BookingApiClient, type IBookingApiClient } from './bookingApiClient.generated'

export const getBookingClient = (): IBookingApiClient => {
  return new BookingApiClient('https://localhost:7163', {
    // http://localhost:8001
    fetch(url, init) {
      return fetch(url, init)
    },
  })
}
