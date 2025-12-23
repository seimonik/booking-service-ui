<template>
  <article class="hotel-card">
    <div class="hotel-image-container">
      <img
        src="https://avatars.mds.yandex.net/get-tycoon/12301581/2a0000018cfd0949943b86c18766fe171c65/priority-headline-background"
        :alt="'Изображение отеля ' + hotel.name"
        class="hotel-image"
        @error="handleImageError"
      />
    </div>

    <div class="hotel-info">
      <h3 class="hotel-name">{{ hotel.name }}</h3>
      <p class="hotel-location">
        <span class="location-icon">📍</span>
        {{ hotel.address }}
      </p>

      <div class="d-flex justify-content-end">
        <div class="price-section">
          <p class="total-price">
            <strong>Цена: от {{ calculateTotalPrice }} ₽</strong>
          </p>
        </div>

        <CustomButton text="Забронировать" type="secondary" width="230px" @click="handleBookNow" />
      </div>
      <!-- <div class="action-buttons">
        <button class="btn-primary" @click="handleBookNow">Забронировать</button>
      </div> -->
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import CustomButton from './CustomButton.vue'
import type { HotelModel } from '@/api/bookingApiClient.generated'

// Определяем интерфейс для данных отеля
// interface Hotel {
//   id: number
//   name: string
//   location: string
//   imageUrl: string
//   rating: number
//   pricePerNight: number
//   features: string[]
//   nights: number
//   isFavorite: boolean
// }

// Определяем пропсы компонента
interface Props {
  hotel: HotelModel
}

const props = defineProps<Props>()

// Эмитируем события
const emit = defineEmits<{
  (e: 'book-now', hotelId: string | undefined): void
  (e: 'toggle-favorite', hotelId: number): void
}>()

// Вычисляем общую стоимость
const calculateTotalPrice = computed(() => {
  return Math.min(...props.hotel.rooms!.map((room) => room.price!))
})

// Обработчик ошибки загрузки изображения
const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.src = 'https://via.placeholder.com/300x200/4f5b93/ffffff?text=Hotel+Image'
}

// Обработчик клика "Забронировать"
const handleBookNow = () => {
  emit('book-now', props.hotel.id)
}
</script>

<style scoped>
.hotel-card {
  display: flex;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background-color: #fff;
  margin-bottom: 20px;
  /* max-width: 800px; */
}

.hotel-image-container {
  position: relative;
  width: 300px;
  flex-shrink: 0;
}

.hotel-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.hotel-info {
  padding: 20px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.hotel-name {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  color: #2c3e50;
}

.hotel-location {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  color: #7f8c8d;
}

.location-icon {
  font-size: 14px;
}

.price-section {
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid #eaeaea;
}

.total-price {
  margin: 4px 0;
  font-size: 1.2rem;
  color: #2c3e50;
}

.action-buttons {
  width: 150px;
  display: flex;
  gap: 12px;
  margin-top: 12px;
}

.btn-primary {
  padding: 10px 20px;
  border-radius: 6px;
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  flex: 1;
}

.btn-primary {
  background-color: #3498db;
  color: white;
}

.btn-primary:hover {
  background-color: #2980b9;
}

@media (max-width: 768px) {
  .hotel-card {
    flex-direction: column;
  }

  .hotel-image-container {
    width: 100%;
    height: 200px;
  }

  .action-buttons {
    flex-direction: column;
  }
}
</style>
