<template>
  <div class="hotel-search-container">
    <section class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">Найдите идеальный отель для отдыха</h1>

        <div class="search-form">
          <div class="form-grid">
            <!-- Пункт назначения -->
            <CustomInput v-model="searchParams.destination" label="Куда" placeholder="Город" />

            <!-- Дата заезда -->
            <DateInput v-model="searchParams.checkIn" label="Заезд" placeholder="Выберите дату" />

            <!-- Дата выезда -->
            <DateInput v-model="searchParams.checkIn" label="Выезд" placeholder="Выберите дату" />
          </div>

          <!-- Кнопки действий -->
          <div class="action-buttons">
            <CustomButton text="Найти отель" :disabled="!isFormValid" @click="handleSearch" />
            <CustomButton text="Показать все отели" type="secondary" @click="viewAllHotels" />
          </div>
        </div>
      </div>
    </section>

    <!-- Популярные направления -->
    <section v-if="!isSearching" class="popular-destinations">
      <h2>Популярные направления</h2>
      <div class="destinations-grid">
        <div
          v-for="destination in popularDestinations"
          :key="destination"
          class="destination-card"
          @click="selectPopularDestination(destination)"
        >
          {{ destination }}
        </div>
      </div>
    </section>

    <!-- Результаты поиска -->
    <section v-if="isSearching" class="search-results">
      <h2>Результаты поиска</h2>
      <div class="results-grid">
        <div v-for="hotel in filteredHotels" :key="hotel.id" class="hotel-card">
          <img :src="hotel.image" :alt="hotel.name" class="hotel-image" />
          <div class="hotel-info">
            <h3>{{ hotel.name }}</h3>
            <p class="location">{{ hotel.location }}</p>
            <div class="rating">★ {{ hotel.rating }}</div>
            <div class="price">от {{ hotel.price }} ₽/ночь</div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import type { Hotel, SearchParams } from '@/types/hotel'
import CustomInput from '@/components/CustomInput.vue'
import DateInput from '@/components/DateInput.vue'
import CustomButton from '@/components/CustomButton.vue'

const router = useRouter()

const searchParams = reactive<SearchParams>({
  destination: '',
  checkIn: '',
  checkOut: '',
  guests: 2,
})

const isSearching = ref(false)

// Моковые данные для демонстрации
const popularDestinations = ref([
  'Москва',
  'Санкт-Петербург',
  'Сочи',
  'Калининград',
  'Казань',
  'Крым',
])

const hotels = ref<Hotel[]>([
  {
    id: 1,
    name: 'Отель Премиум',
    location: 'Москва',
    price: 5000,
    rating: 4.8,
    image: 'https://via.placeholder.com/300x200/667eea/ffffff?text=Отель+Премиум',
  },
  {
    id: 2,
    name: 'Гранд Отель',
    location: 'Санкт-Петербург',
    price: 4500,
    rating: 4.6,
    image: 'https://via.placeholder.com/300x200/764ba2/ffffff?text=Гранд+Отель',
  },
  {
    id: 3,
    name: 'Морской Бриз',
    location: 'Сочи',
    price: 3500,
    rating: 4.5,
    image: 'https://via.placeholder.com/300x200/667eea/ffffff?text=Морской+Бриз',
  },
])

const isFormValid = computed(() => {
  return (
    searchParams.destination.trim() !== '' &&
    searchParams.checkIn !== '' &&
    searchParams.checkOut !== '' &&
    searchParams.guests > 0
  )
})

const filteredHotels = computed(() => {
  if (!searchParams.destination) return hotels.value
  return hotels.value.filter((hotel) =>
    hotel.location.toLowerCase().includes(searchParams.destination.toLowerCase()),
  )
})

const selectPopularDestination = (destination: string) => {
  searchParams.destination = destination
}

const handleSearch = () => {
  if (isFormValid.value) {
    isSearching.value = true
    // Здесь будет логика API запроса
    console.log('Search params:', searchParams)
  }
}

const viewAllHotels = () => {
  router.push('/booking')
}
</script>

<style scoped>
/* Стили остаются без изменений */
.hotel-search-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.header {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 1rem 2rem;
}

.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
}

.nav-links {
  display: flex;
  gap: 2rem;
}

.nav-link {
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  transition: background-color 0.3s;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.hero-section {
  padding: 4rem 2rem;
  text-align: center;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
}

.hero-title {
  font-size: 2.5rem;
  color: white;
  margin-bottom: 2rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.search-form {
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.form-group {
  position: relative;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #333;
}

.form-input,
.form-select {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #667eea;
}

.suggestions-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 2px solid #e1e5e9;
  border-top: none;
  border-radius: 0 0 8px 8px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
}

.suggestion-item {
  padding: 0.75rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.suggestion-item:hover {
  background-color: #f8f9fa;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.search-btn,
.view-all-btn {
  padding: 1rem 2rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.search-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.search-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.search-btn:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.view-all-btn {
  background: transparent;
  color: #667eea;
  border: 2px solid #667eea;
}

.view-all-btn:hover {
  background: #667eea;
  color: white;
}

.popular-destinations,
.search-results {
  padding: 2rem;
  max-width: 1200px;
  margin: 2rem auto;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 16px;
}

.popular-destinations h2,
.search-results h2 {
  color: white;
  text-align: center;
  margin-bottom: 2rem;
}

.destinations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.destination-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  text-align: center;
  cursor: pointer;
  transition: transform 0.3s;
}

.destination-card:hover {
  transform: translateY(-4px);
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.hotel-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
}

.hotel-card:hover {
  transform: translateY(-4px);
}

.hotel-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.hotel-info {
  padding: 1.5rem;
}

.hotel-info h3 {
  margin: 0 0 0.5rem 0;
  color: #333;
}

.location {
  color: #666;
  margin: 0 0 1rem 0;
}

.rating {
  color: #ffa500;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.price {
  font-size: 1.2rem;
  font-weight: bold;
  color: #667eea;
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .action-buttons {
    flex-direction: column;
  }

  .hero-title {
    font-size: 2rem;
  }

  .nav {
    flex-direction: column;
    gap: 1rem;
  }

  .nav-links {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>
