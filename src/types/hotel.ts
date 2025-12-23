export interface Hotel {
  id: number
  name: string
  location: string
  price: number
  rating: number
  image: string
}

export interface HotelInfo {
  id: number
  name: string
  location: string
  imageUrl: string
  rating: number
  pricePerNight: number
  features: string[]
  nights: number
  isFavorite: boolean
}

export interface SearchParams {
  destination: string
  checkIn: string
  checkOut: string
  guests: number
}
