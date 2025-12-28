<template>
  <div class="booking-form">
    <div class="hotel-booking">
      <div class="hotel-header">
        <img src="" :alt="hotel.name" class="hotel-image" />
        <div class="hotel-info">
          <h2>{{ hotel.name }}</h2>
          <p><i class="fas fa-map-marker-alt"></i> {{ hotel.address }}</p>
        </div>
      </div>

      <div class="booking-content">
        <div class="section">
          <h3 class="section-title"><i class="fas fa-bed"></i> Выбор номера</h3>
          <div class="room-options">
            <div
              v-for="room in hotel.roomTypes"
              :key="room.id"
              :class="['room-option', { selected: selectedRoomId === room.id }]"
              @click="selectRoom(room)"
            >
              <h3 class="room-type">{{ room.name }}</h3>
              <div class="room-price">{{ room.price }} ₽ / ночь</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h3 class="section-title"><i class="fas fa-receipt"></i> Сводка бронирования</h3>
          <div class="booking-summary">
            <div class="summary-item">
              <span>Даты проживания:</span>
              <span>{{ formatDate(props.checkIn!) }} - {{ formatDate(props.checkOut!) }}</span>
            </div>
            <div class="summary-item">
              <span>Количество ночей:</span>
              <span>{{ nightsCount }}</span>
            </div>
            <div v-if="selectedRoom" class="summary-item">
              <span>Тип номера:</span>
              <span>{{ selectedRoom.name }}</span>
            </div>
            <div v-if="selectedRoom" class="summary-item">
              <span>Цена за ночь:</span>
              <span>{{ selectedRoom.price }} ₽</span>
            </div>

            <!-- Базовая стоимость -->
            <div class="summary-item">
              <span>Стоимость проживания:</span>
              <span>{{ totalPrice }} ₽</span>
            </div>

            <!-- Скидка (если есть) -->
            <div v-if="discountAmount > 0" class="summary-item discount-item">
              <span>Скидка:</span>
              <span class="discount-amount">-{{ discountAmount }} ₽</span>
            </div>

            <!-- Итоговая цена -->
            <div class="total-price">Итого: {{ finalPrice }} ₽</div>

            <!-- Экономия (если есть скидка) -->
            <div v-if="discountAmount > 0" class="savings">
              Вы экономите: {{ discountAmount }} ₽
            </div>

            <!-- <div class="total-price">Итого: {{ totalPrice }} ₽</div> -->
          </div>
        </div>

        <!-- Секция промокода -->
        <div class="promo-section">
          <h3>Применить промокод</h3>

          <div class="promo-input-group">
            <input
              v-model="promoCodeInput"
              type="text"
              placeholder="Введите промокод"
              class="promo-input"
              :class="{ error: promoError }"
              @keyup.enter="applyPromoCode"
            />
            <button
              @click="applyPromoCode"
              :disabled="!promoCodeInput || applyingPromo"
              class="apply-promo-btn"
            >
              <span v-if="!applyingPromo">Применить</span>
              <span v-else>Проверка...</span>
            </button>
          </div>

          <div v-if="promoError" class="promo-error">
            <i class="fas fa-exclamation-circle"></i>
            {{ promoError }}
          </div>

          <div v-if="appliedPromo" class="promo-success">
            <div class="promo-info">
              <i class="fas fa-check-circle"></i>
              <span
                >Промокод "<strong>{{ appliedPromo.code }}</strong
                >" применен</span
              >
              <span class="promo-description">{{ appliedPromo.description }}</span>
            </div>
            <button @click="removePromoCode" class="remove-promo-btn" title="Удалить промокод">
              <svg width="12" height="12" viewBox="0 0 14 14" fill="currentColor">
                <path
                  d="M13 1.938L12.062 1L7 6.062L1.938 1L1 1.938L6.062 7L1 12.062L1.938 13L7 7.938L12.062 13L13 12.062L7.938 7L13 1.938Z"
                />
              </svg>
            </button>

            <!-- <button @click="removePromoCode" class="remove-promo-btn" title="Удалить промокод">
              <i class="fas fa-times"></i>
            </button> -->
          </div>
        </div>

        <div class="section">
          <h3 class="section-title"><i class="fas fa-user"></i> Информация о покупателе</h3>
          <div class="customer-form">
            <div class="form-group">
              <label for="firstName">Имя *</label>
              <input
                id="firstName"
                v-model="customer.firstName"
                type="text"
                placeholder="Введите имя"
                required
              />
            </div>

            <div class="form-group">
              <label for="lastName">Фамилия *</label>
              <input
                id="lastName"
                v-model="customer.lastName"
                type="text"
                placeholder="Введите фамилию"
                required
              />
            </div>

            <div class="form-group">
              <label for="email">Email *</label>
              <input
                id="email"
                v-model="customer.email"
                type="email"
                placeholder="Введите email"
                required
              />
            </div>

            <div class="form-group">
              <label for="phone">Телефон *</label>
              <input
                id="phone"
                v-model="customer.phone"
                type="tel"
                placeholder="Введите телефон"
                required
              />
            </div>

            <button
              type="button"
              class="submit-btn"
              :disabled="!isFormValid || submitting"
              @click="submitBooking"
            >
              <i class="fas fa-check"></i>
              {{ submitting ? 'Обработка...' : 'Забронировать' }}
            </button>
          </div>
        </div>
      </div>

      <div v-if="notification.show" :class="['notification', notification.type]">
        <i :class="notification.icon"></i>
        {{ notification.message }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AddBookingModel, HotelModel, RoomTypeModel } from '@/api/bookingApiClient.generated'
import { useBookingStore } from '@/stores/bookingStore'
import { ref, computed, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { v4 as uuidv4 } from 'uuid'

const idempotencyKey = uuidv4()
const BookingStore = useBookingStore()
const router = useRouter()
const props = defineProps({
  hotelId: {
    type: String,
    required: true,
  },
  checkIn: String,
  checkOut: String,
})

const hotel = ref<HotelModel>({ roomTypes: [{ name: 'name' }] })
onMounted(async () => {
  console.log(props.hotelId)
  console.log(props.checkIn)
  console.log(props.checkOut)

  hotel.value = await BookingStore.GetHotel(props.hotelId)
})

interface Customer {
  firstName: string
  lastName: string
  email: string
  phone: string
  specialRequests: string
}

interface Notification {
  show: boolean
  type: string
  message: string
  icon: string
}

interface Promocode {
  code: string
  description: string
}

const today = ref<string>(new Date().toISOString().split('T')[0]!)
// const checkIn = ref<string>(new Date().toISOString().split('T')[0])
// const checkOut = ref<string>(new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0])
const selectedRoomId = ref<string>()
const submitting = ref<boolean>(false)

const customer = reactive<Customer>({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  specialRequests: '',
})

const notification = ref<Notification>({
  show: false,
  type: 'success',
  message: '',
  icon: 'fas fa-check',
})

// Переменные для промокода
const promoCodeInput = ref<string>('')
const applyingPromo = ref<boolean>(false)
const promoError = ref<string>('')
const appliedPromo = ref<Promocode>()
const discountAmount = ref<number>(0)
// Итоговая цена (вычисляемое свойство)
const finalPrice = computed(() => {
  return totalPrice.value - discountAmount.value
})
const applyPromoCode = async () => {
  console.log('Promo is active')
  console.log(finalPrice.value)
  if (
    promoCodeInput.value &&
    selectedRoomId.value &&
    customer.email &&
    customer.firstName &&
    customer.lastName
  ) {
    const promocodeValidationResult = await BookingStore.ValidatePromocode(
      promoCodeInput.value,
      selectedRoomId.value,
      customer.email,
      `${customer.lastName} ${customer.firstName}`,
    )

    if (promocodeValidationResult.isValid) {
      discountAmount.value = promocodeValidationResult.discountAmount!
      promoError.value = ''
      appliedPromo.value = {
        code: promoCodeInput.value,
        description: promocodeValidationResult.description,
      } as Promocode
    } else {
      promoError.value = promocodeValidationResult.message!
      appliedPromo.value = undefined
      discountAmount.value = 0
    }
  } else {
    console.log('Необходимо заполнить обязательные поля')
  }
}

const removePromoCode = () => {
  appliedPromo.value = undefined //{} as Promocode
  discountAmount.value = 0
  promoCodeInput.value = ''
  promoError.value = ''
}

const selectedRoom = computed(() => {
  if (!selectedRoomId.value) return null
  return hotel.value.roomTypes!.find((room) => room.id === selectedRoomId.value)
})

const nightsCount = computed(() => {
  if (!props.checkIn! || !props.checkOut!) return 0
  const diffTime = Math.abs(new Date(props.checkOut).getTime() - new Date(props.checkIn).getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
})

const totalPrice = computed(() => {
  if (!selectedRoom.value || nightsCount.value === 0) return 0
  return selectedRoom.value.price! * nightsCount.value
})

// const checkInMin = computed(() => {
//   if (!checkIn.value) return today.value
//   const nextDay = new Date(checkIn.value)
//   nextDay.setDate(nextDay.getDate() + 1)
//   return nextDay.toISOString().split('T')[0]
// })

const isFormValid = computed(() => {
  return (
    customer.firstName &&
    customer.lastName &&
    customer.email &&
    customer.phone &&
    selectedRoomId.value !== null &&
    props.checkIn &&
    props.checkOut
  )
})

const selectRoom = (room: RoomTypeModel) => {
  selectedRoomId.value = room.id
}

const formatDate = (date: string) => {
  if (!date) return 'Не указано'
  return new Date(date).toLocaleDateString('ru-RU')
}

const showNotification = (type: string, message: string) => {
  notification.value = {
    show: true,
    type,
    message,
    icon: type === 'success' ? 'fas fa-check' : 'fas fa-exclamation-triangle',
  }

  setTimeout(() => {
    notification.value.show = false
  }, 3000)
}

// Валидация промокода
// const checkPromo = async () => {
//   try {
//     const response = await api.get('/booking/validate-promo', {
//       params: {
//         code: promoInput.value,
//         roomTypeId: props.roomTypeId,
//         clientId: userStore.userId,
//       },
//     })

//     if (response.data.isValid) {
//       discountInfo.value = `Скидка: ${response.data.discountAmount} руб.`
//       totalPrice.value = response.data.finalPrice
//     } else {
//       error.value = response.data.message
//     }
//   } catch (e) {
//     console.error('Ошибка проверки промокода')
//   }
// }

const submitBooking = async () => {
  submitting.value = true

  try {
    // Имитация API запроса
    // await new Promise((resolve) => setTimeout(resolve, 1500))

    const bookingData = {
      hotelId: hotel.value.name,
      roomId: selectedRoomId.value,
      checkIn: props.checkIn,
      checkOut: props.checkOut,
      customer: { ...customer },
      totalPrice: finalPrice.value,
    }

    console.log('Booking data:', bookingData)

    const addBookingModel: AddBookingModel = {
      roomTypeId: selectedRoomId.value,
      checkInDate: props.checkIn,
      checkOutDate: props.checkOut,
      idempotencyKey: idempotencyKey,
      promocode: promoCodeInput.value || undefined,
      email: customer.email,
      fullName: `${customer.lastName} ${customer.firstName}`,
    }
    const bookingModel = await BookingStore.AddBooking(addBookingModel)

    // запрос на оплату
    router.push({
      name: 'Payment',
      params: {
        amount: finalPrice.value,
      },
      query: {
        bookingId: bookingModel.id,
      },
    })

    // Открываем в новой вкладке
    // const routeData = router.resolve({
    //   name: 'Payment',
    //   params: {
    //     amount: totalPrice.value.toString(),
    //   },
    // })
    // window.open(routeData.href, '_blank', 'noopener,noreferrer')

    showNotification('success', 'Бронирование успешно отправлено!')

    // Сброс формы
    customer.firstName = ''
    customer.lastName = ''
    customer.email = ''
    customer.phone = ''
    customer.specialRequests = ''
    selectedRoomId.value = ''
    props.checkIn = today.value
    props.checkOut = new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]!
  } catch {
    showNotification('error', 'Ошибка при бронировании')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.booking-form {
  padding: 15px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.hotel-booking {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.hotel-header {
  background: linear-gradient(to right, #3498db, #2c3e50);
  color: white;
  padding: 25px;
  display: flex;
  align-items: center;
  gap: 20px;
}

.hotel-image {
  width: 120px;
  height: 120px;
  border-radius: 10px;
  object-fit: cover;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.hotel-info h2 {
  font-size: 28px;
  margin-bottom: 8px;
}

.hotel-info p {
  margin-bottom: 5px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.rating {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #f39c12;
  font-weight: bold;
}

.booking-content {
  padding: 25px;
}

.section {
  margin-bottom: 30px;
}

.section-title {
  font-size: 22px;
  color: #2c3e50;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #ecf0f1;
  display: flex;
  align-items: center;
  gap: 10px;
}

.dates-selection {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.date-input {
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  width: 100%;
}

.date-input:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.room-options {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.room-option {
  border: 2px solid #ecf0f1;
  border-radius: 10px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.room-option:hover {
  border-color: #3498db;
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.room-option.selected {
  border-color: #3498db;
  background-color: #f7f9fa;
}

.room-image {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 15px;
}

.room-type {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 8px;
  color: #2c3e50;
}

.room-description {
  color: #7f8c8d;
  margin-bottom: 12px;
  font-size: 14px;
}

.room-features {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 15px;
}

.feature-tag {
  background-color: #ecf0f1;
  color: #7f8c8d;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
}

.room-price {
  font-weight: bold;
  color: #27ae60;
  font-size: 20px;
}

.booking-summary {
  background-color: #f7f9fa;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 30px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #ecf0f1;
}

.total-price {
  font-size: 24px;
  font-weight: bold;
  color: #2c3e50;
  text-align: right;
  padding-top: 15px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  padding: 8px 0;
  border-bottom: 1px solid #e9ecef;
}

.summary-item:last-child {
  border-bottom: none;
}

.discount-item {
  color: #28a745;
  font-weight: 600;
}

.discount-amount {
  color: #dc3545;
  font-weight: bold;
}

/* .total-price {
  font-size: 1.2em;
  font-weight: bold;
  color: #2c3e50;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 2px solid #dee2e6;
  display: flex;
  justify-content: space-between;
} */

.savings {
  background: #d4edda;
  color: #155724;
  padding: 8px 12px;
  border-radius: 4px;
  margin-top: 10px;
  font-size: 0.9em;
  text-align: center;
  border: 1px solid #c3e6cb;
}

/* Анимация для появления скидки */
.discount-item {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.customer-form .form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: #2c3e50;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  transition: all 0.3s;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.submit-btn {
  background: linear-gradient(to right, #27ae60, #219a52);
  color: white;
  border: none;
  padding: 16px 32px;
  border-radius: 8px;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.submit-btn:disabled {
  background: #95a5a6;
  cursor: not-allowed;
}

.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 15px 20px;
  border-radius: 8px;
  color: white;
  font-weight: bold;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 10px;
  transform: translateX(100%);
  transition: transform 0.3s ease;
}

.notification.success {
  background-color: #27ae60;
  transform: translateX(0);
}

.notification.error {
  background-color: #e74c3c;
  transform: translateX(0);
}

.loading {
  text-align: center;
  padding: 30px;
  color: #7f8c8d;
}

.promo-section {
  margin: 20px 0;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  border: 1px solid #eee;
}

.promo-section h3 {
  margin-bottom: 15px;
  color: #333;
  font-size: 18px;
}

.promo-input-group {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.promo-input {
  flex: 1;
  padding: 12px 15px;
  border: 2px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  transition: border-color 0.3s ease;
}

.promo-input:focus {
  outline: none;
  border-color: #3498db;
}

.promo-input.error {
  border-color: #e74c3c;
}

.apply-promo-btn {
  padding: 12px 20px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.3s ease;
}

.apply-promo-btn:hover:not(:disabled) {
  background-color: #2980b9;
}

.apply-promo-btn:disabled {
  background-color: #95a5a6;
  cursor: not-allowed;
}

.promo-error {
  color: #e74c3c;
  padding: 10px;
  background-color: #ffeaea;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.promo-success {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background-color: #e8f5e8;
  border-radius: 6px;
  border: 1px solid #c8e6c9;
}

.promo-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.promo-description {
  color: #388e3c;
  font-size: 14px;
}

/* .remove-promo-btn {
  background: none;
  border: none;
  color: #7f8c8d;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: background-color 0.3s ease;
}

.remove-promo-btn:hover {
  background-color: #ffebee;
  color: #e53935;
} */

.remove-promo-btn {
  background: none;
  border: none;
  color: #7f8c8d;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  transition: all 0.3s ease;
}

.remove-promo-btn:hover,
.remove-promo-btn:focus {
  background-color: #ffebee;
  color: #e53935;
  outline: none;
}

.remove-promo-btn:focus {
  box-shadow: 0 0 0 2px rgba(229, 57, 53, 0.3);
}

.remove-promo-btn svg {
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .hotel-header {
    flex-direction: column;
    text-align: center;
  }

  .room-options {
    grid-template-columns: 1fr;
  }

  .dates-selection {
    grid-template-columns: 1fr;
  }
}
</style>
