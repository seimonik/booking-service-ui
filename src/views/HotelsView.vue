<template>
  <div class="booking">
    <div class="search-form">
      <div class="input-container">
        <CustomInput v-model="searchParams.destination" placeholder="Куда хотите поехать?" />
        <DateInput v-model="searchParams.checkIn" placeholder="Заезд" />
        <DateInput v-model="searchParams.checkOut" placeholder="Выезд" />
        <CustomButton text="Найти отель" />
        <CustomButton text="Показать все отели" type="secondary" />
      </div>
    </div>
    <div class="hotel-container">
      <simplebar class="test">
        <HotelCard
          v-for="hotel in hotels"
          :key="hotel.id"
          :hotel="hotel"
          @book-now="handleBookNow"
        />
      </simplebar>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { SearchParams } from '@/types/hotel'
import { onMounted, ref } from 'vue'
import CustomInput from '@/components/CustomInput.vue'
import DateInput from '@/components/DateInput.vue'
import CustomButton from '@/components/CustomButton.vue'
import { useBookingStore } from '@/stores/bookingStore'
import HotelCard from '@/components/HotelCard.vue'
import type { HotelModel } from '@/api/bookingApiClient.generated'
import { useRouter } from 'vue-router'
// import simplebar from 'simplebar-vue'

const router = useRouter()
const searchParams = ref<SearchParams>({
  destination: '',
  checkIn: '',
  checkOut: '',
  guests: 2,
})
// const today = new Date().toISOString().slice(0, 10)
const tomorrowDate = new Date()
tomorrowDate.setDate(tomorrowDate.getDate() + 1)
// const tomorrow = tomorrowDate.toISOString().slice(0, 10)

const BookingStore = useBookingStore()
const hotels = ref<HotelModel[]>([
  { name: 'название', address: 'адрес', roomTypes: [{ price: 0 }] },
])

onMounted(async () => {
  hotels.value = await BookingStore.GetBookings()
})

// const hotelData = ref<HotelInfo>({
//   id: 1,
//   name: 'Гранд Отель',
//   location: 'Москва, Россия',
//   imageUrl:
//     'https://avatars.mds.yandex.net/get-tycoon/12301581/2a0000018cfd0949943b86c18766fe171c65/priority-headline-background',
//   rating: 4.5,
//   pricePerNight: 5000,
//   features: ['Бесплатный Wi-Fi', 'Бассейн', 'Спа'],
//   nights: 3,
//   isFavorite: false,
// })

const handleBookNow = (hotelId: string | undefined) => {
  console.log(`Забронировать отель с ID: ${hotelId}`)
  // Логика бронирования
  router.push({
    name: 'Booking',
    params: { hotelId: hotelId },
    query: {
      checkIn: '2025-12-26', //today,
      checkOut: '2025-12-27', //tomorrow,
    },
  })
}
</script>

<style scoped>
.booking {
  height: calc(100vh - 72px);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.input-container {
  display: flex;
  gap: 1rem;
}

.search-form {
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.hotel-container {
  display: flex;
  background: white;
  max-width: 1000px; /* Максимальная ширина контента */
  width: 100%; /* Ширина будет 100%, пока не достигнет max-width */
  margin-inline: auto; /* Автоматические отступы слева и справа - это и есть центрирование */
  flex-direction: column;
  gap: 20px;

  padding: 2rem;
  border-radius: 16px;

  flex: 1;
  min-height: 0; /* важно для корректной работы flex */
  overflow: auto;
}

.test {
  height: 65vh;
}
</style>
