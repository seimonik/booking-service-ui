<template>
  <div class="booking">
    <div class="search-form">
      <div class="input-container">
        <CustomInput v-model="searchParams.destination" placeholder="Куда хотите поехать?" />
        <DateInput v-model="searchParams.checkIn" placeholder="Заезд" />
        <DateInput v-model="searchParams.checkOut" placeholder="Выезд" />
        <CustomButton text="Найти отель" @click="handleSearch" />
        <CustomButton text="Показать все отели" type="secondary" @click="viewAllHotels" />
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

        <div v-if="!hotels.length" class="no-results-container">
          <div class="no-results-icon">🔍</div>
          <h3 class="no-results-title">Ничего не найдено</h3>
          <p class="no-results-subtitle">Попробуйте изменить запрос или фильтры</p>
          <slot name="actions"></slot>
        </div>
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
})
const today = new Date().toISOString().slice(0, 10)
const tomorrowDate = new Date()
tomorrowDate.setDate(tomorrowDate.getDate() + 1)
const tomorrow = tomorrowDate.toISOString().slice(0, 10)

const BookingStore = useBookingStore()
const hotels = ref<HotelModel[]>([
  { name: 'название', address: 'адрес', roomTypes: [{ price: 0 }] },
])

const props = defineProps({
  destination: String,
  checkIn: String,
  checkOut: String,
})

onMounted(async () => {
  hotels.value = await BookingStore.GetBookings(props.destination, props.checkIn, props.checkOut)

  searchParams.value.destination = props.destination || ''
  searchParams.value.checkIn = props.checkIn || ''
  searchParams.value.checkOut = props.checkOut || ''
})

const handleBookNow = (hotelId: string | undefined) => {
  console.log(`Забронировать отель с ID: ${hotelId}`)
  // Логика бронирования
  router.push({
    name: 'Booking',
    params: { hotelId: hotelId },
    query: {
      checkIn: props.checkIn || today,
      checkOut: props.checkOut || tomorrow,
    },
  })
}

const handleSearch = async () => {
  hotels.value = await BookingStore.GetBookings(
    searchParams.value.destination.trim(),
    searchParams.value.checkIn,
    searchParams.value.checkOut,
  )
  router.push({
    name: 'Hotels',
    query: {
      destination: searchParams.value.destination.trim(),
      checkIn: searchParams.value.checkIn,
      checkOut: searchParams.value.checkOut,
    },
  })
}

const viewAllHotels = async () => {
  hotels.value = await BookingStore.GetBookings(undefined, undefined, undefined)
  router.push({
    name: 'Hotels',
    query: {
      destination: undefined,
      checkIn: undefined,
      checkOut: undefined,
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

.no-results-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  color: #6b7280;
  min-height: 200px;
}

.no-results-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.no-results-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: #374151;
}

.no-results-subtitle {
  font-size: 1rem;
  margin: 0;
  line-height: 1.5;
}

.test {
  height: 65vh;
}
</style>
