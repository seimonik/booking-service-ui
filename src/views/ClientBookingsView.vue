<template>
  <div class="user-bookings-wrapper">
    <div class="user-bookings">
      <div class="bookings-header">
        <h2>Мои бронирования</h2>
        <div class="bookings-controls">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Поиск по отелю или типу номера..."
            class="search-input"
          />
        </div>
      </div>

      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Загрузка бронирований...</p>
      </div>

      <div v-else-if="error" class="error-state">
        <p>Ошибка при загрузке бронирований: {{ error }}</p>
        <button @click="loadBookings" class="retry-btn">Попробовать снова</button>
      </div>

      <div v-else-if="filteredBookings.length === 0" class="empty-state">
        <p>Бронирования не найдены</p>
      </div>

      <div v-else class="bookings-list">
        <div
          v-for="booking in filteredBookings"
          :key="booking.id"
          class="booking-card"
          :class="[getStatusClass(booking.status!), { 'past-booking': isPastBooking(booking) }]"
        >
          <div class="booking-header">
            <div class="booking-info">
              <h3 class="booking-title">{{ booking.roomType?.hotel?.name }}</h3>
              <span class="booking-id">Бронирование #{{ booking.id?.slice(0, 8) }}</span>
              <div>
                <span class="booking-status" :class="getStatusBadgeClass(booking.status!)">
                  {{ getStatusText(booking.status!) }}
                </span>
                <span
                  v-if="isPastBooking(booking) && booking.status != BookingStatus._3"
                  class="past-badge"
                  >Завершено</span
                >
                <span
                  v-else-if="isCurrentBooking(booking) && booking.status != BookingStatus._3"
                  class="current-badge"
                  >Текущее</span
                >
                <span
                  v-else-if="isUpcomingBooking(booking) && booking.status != BookingStatus._3"
                  class="upcoming-badge"
                  >Предстоящее</span
                >
              </div>
            </div>
            <div class="booking-actions">
              <button
                v-if="booking.status === BookingStatus._1 && !isPastBooking(booking)"
                @click="showCancellationModal(booking)"
                class="cancel-btn"
              >
                Отменить
              </button>
              <button @click="showBookingDetails(booking)" class="details-btn">Подробнее</button>
            </div>
          </div>

          <div class="booking-details">
            <div class="detail-row">
              <div class="detail-item">
                <strong>Тип номера:</strong>
                <span>{{ booking.roomType.name }}</span>
              </div>
              <div class="detail-item">
                <strong>Цена:</strong>
                <span class="price">{{ formatPrice(booking.totalPrice) }}</span>
              </div>
            </div>

            <div class="detail-row">
              <div class="detail-item">
                <strong>Заезд:</strong>
                <span :class="{ 'past-date': isPastDate(booking.checkInDate) }">
                  {{ formatDate(booking.checkInDate) }}
                </span>
              </div>
              <div class="detail-item">
                <strong>Выезд:</strong>
                <span :class="{ 'past-date': isPastDate(booking.checkOutDate) }">
                  {{ formatDate(booking.checkOutDate) }}
                </span>
              </div>
            </div>

            <div class="detail-row">
              <div class="detail-item">
                <strong>Адрес отеля:</strong>
                <span
                  >{{ booking.roomType.hotel.address }}, {{ booking.roomType.hotel.country }}</span
                >
              </div>
              <div class="detail-item">
                <strong>Ночей:</strong>
                <span>{{ calculateNights(booking.checkInDate, booking.checkOutDate) }}</span>
              </div>
            </div>

            <div
              v-if="booking.roomType.cancellationPolicy && !isPastBooking(booking)"
              class="cancellation-info"
            >
              <strong>Условия отмены:</strong>
              <p>{{ getCancellationPolicyDescription(booking.roomType.cancellationPolicy) }}</p>
            </div>
          </div>

          <div class="booking-footer">
            <span class="booking-date">Создано: {{ formatDateTime(booking.createdAt) }}</span>
            <span v-if="isPastBooking(booking)" class="days-ago">
              Завершено {{ getDaysAgo(booking.checkOutDate) }} дней назад
            </span>
          </div>
        </div>
      </div>

      <!-- Модальное окно отмены бронирования -->
      <!-- <div v-if="showCancelModal" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Отмена бронирования #{{ selectedBooking?.id.slice(0, 8) }}</h3>
          <button @click="closeCancelModal" class="close-btn">&times;</button>
        </div>

        <div class="modal-body">
          <div class="booking-summary">
            <p><strong>Отель:</strong> {{ selectedBooking?.roomType.hotel.name }}</p>
            <p><strong>Тип номера:</strong> {{ selectedBooking?.roomType.name }}</p>
            <p>
              <strong>Период:</strong> {{ formatDate(selectedBooking?.checkInDate) }} -
              {{ formatDate(selectedBooking?.checkOutDate) }}
            </p>
            <p>
              <strong>Общая стоимость:</strong> {{ formatPrice(selectedBooking?.totalPrice || 0) }}
            </p>
          </div>

          <div v-if="cancellationCalculation" class="cancellation-calculation">
            <p>
              <strong>Условия отмены:</strong> {{ cancellationCalculation.appliedRuleDescription }}
            </p>
            <p><strong>Возврат:</strong> {{ formatPrice(cancellationCalculation.refundAmount) }}</p>
            <p><strong>Штраф:</strong> {{ formatPrice(cancellationCalculation.penaltyAmount) }}</p>
            <p>
              <strong>До заезда осталось:</strong>
              {{ cancellationCalculation.daysBeforeCheckin }} дней
            </p>
          </div>

          <div v-else class="loading-calculation">
            <p>Расчет условий отмены...</p>
          </div>

          <div class="cancellation-reason">
            <label for="reason">Причина отмены (необязательно):</label>
            <textarea
              v-model="cancellationReason"
              id="reason"
              rows="3"
              placeholder="Укажите причину отмены..."
            ></textarea>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="closeCancelModal" class="btn-secondary" :disabled="cancelling">
            Отмена
          </button>
          <button
            @click="confirmCancellation"
            class="btn-danger"
            :disabled="!cancellationCalculation?.canCancel || cancelling"
          >
            <span v-if="cancelling">Отмена...</span>
            <span v-else>Подтвердить отмену</span>
          </button>
        </div>
      </div>
    </div> -->

      <!-- Модальное окно отмены бронирования -->
      <div v-if="showCancelModal" class="modal-overlay">
        <div class="modal-content cancellation-modal">
          <div class="modal-header">
            <div class="header-content">
              <div class="header-icon">
                <span class="warning-icon">⚠️</span>
              </div>
              <div class="header-text">
                <h3>Отмена бронирования</h3>
                <p class="booking-reference">#{{ selectedBooking?.id?.slice(0, 8) }}</p>
              </div>
            </div>
            <button @click="closeCancelModal" class="close-btn">&times;</button>
          </div>

          <div class="modal-body">
            <!-- Краткая информация о бронировании -->
            <div class="booking-preview">
              <div class="hotel-info">
                <div class="hotel-name">{{ selectedBooking?.roomType?.hotel?.name }}</div>
                <div class="hotel-location">
                  {{ selectedBooking?.roomType?.hotel?.address }},
                  {{ selectedBooking?.roomType?.hotel?.country }}
                </div>
              </div>
              <div class="booking-dates">
                <div class="date-range">
                  <span class="check-in">{{ formatDate(selectedBooking?.checkInDate!) }}</span>
                  <span class="date-separator">→</span>
                  <span class="check-out">{{ formatDate(selectedBooking?.checkOutDate!) }}</span>
                </div>
                <div class="nights-count">
                  {{
                    calculateNights(selectedBooking?.checkInDate!, selectedBooking?.checkOutDate!)
                  }}
                  ночей
                </div>
              </div>
              <div class="room-type">{{ selectedBooking?.roomType?.name }}</div>
              <div class="total-price">{{ formatPrice(selectedBooking?.totalPrice || 0) }}</div>
            </div>

            <!-- Расчет отмены -->
            <div v-if="cancellationCalculation" class="cancellation-details">
              <div class="section-title">
                <h4>Условия отмены</h4>
                <span class="days-remaining"
                  >До заезда: {{ cancellationCalculation.daysBeforeCheckin }} дней</span
                >
              </div>

              <!-- Политика отмены -->
              <div class="policy-info">
                <div class="policy-name">
                  {{ getPolicyName(selectedBooking?.roomType?.cancellationPolicy?.penaltyType!) }}
                </div>
                <div class="policy-description">
                  {{ cancellationCalculation.appliedRuleDescription }}
                </div>
              </div>

              <!-- Финансовый расчет -->
              <div class="financial-calculation">
                <div class="calculation-row">
                  <span class="label">Изначальная стоимость:</span>
                  <span class="value">{{ formatPrice(selectedBooking?.totalPrice || 0) }}</span>
                </div>

                <!-- <div v-if="cancellationCalculation.penaltyAmount > 0" class="calculation-row penalty">
                <span class="label">Штраф за отмену:</span>
                <span class="value">-{{ formatPrice(cancellationCalculation.penaltyAmount) }}</span>
              </div> -->

                <div class="calculation-row total">
                  <span class="label">Сумма к возврату:</span>
                  <span class="value">{{ formatPrice(cancellationCalculation.refundAmount) }}</span>
                </div>

                <!-- Предупреждение о невозврате -->
                <div
                  v-if="cancellationCalculation.refundAmount === 0"
                  class="non-refundable-warning"
                >
                  <div class="warning-icon">💡</div>
                  <div class="warning-text">
                    <strong>Внимание!</strong> Данный тариф является невозвратным. При отмене
                    бронирования средства не возвращаются.
                  </div>
                </div>

                <!-- Информация о частичном возврате -->
                <div
                  v-else-if="cancellationCalculation.penaltyAmount > 0"
                  class="partial-refund-info"
                >
                  <div class="info-icon">ℹ️</div>
                  <div class="info-text">
                    Возвращается {{ calculateRefundPercentage() }}% от суммы бронирования
                  </div>
                </div>

                <!-- Бесплатная отмена -->
                <div v-else class="free-cancellation-info">
                  <div class="success-icon">✅</div>
                  <div class="success-text">
                    Бесплатная отмена! Полная сумма будет возвращена на ваш счет.
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="loading-calculation">
              <div class="spinner-small"></div>
              <p>Расчет условий отмены...</p>
            </div>
          </div>

          <div class="modal-footer">
            <div class="footer-actions">
              <button @click="closeCancelModal" class="btn-secondary" :disabled="cancelling">
                Вернуться к бронированиям
              </button>
              <button
                @click="confirmCancellation"
                class="btn-danger"
                :disabled="!cancellationCalculation?.canCancel || cancelling"
              >
                <span v-if="cancelling">
                  <span class="spinner-btn"></span>
                  Отмена...
                </span>
                <span v-else> Подтвердить отмену </span>
              </button>
            </div>

            <!-- Предупреждение о невозможности отмены -->
            <div
              v-if="cancellationCalculation && !cancellationCalculation.canCancel"
              class="cancellation-disabled"
            >
              <div class="disabled-warning">⚠️</div>
              <div class="disabled-text">
                Отмена данного бронирования невозможна согласно условиям тарифа.
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Модальное окно деталей бронирования -->
      <div v-if="showDetailsModal" class="modal-overlay">
        <div class="modal-content details-modal">
          <div class="modal-header">
            <h3>Детали бронирования #{{ selectedBooking?.id.slice(0, 8) }}</h3>
            <button @click="closeDetailsModal" class="close-btn">&times;</button>
          </div>

          <div class="modal-body">
            <div v-if="selectedBooking" class="booking-full-details">
              <!-- Блок статуса времени -->
              <div class="time-status-section">
                <div v-if="isPastBooking(selectedBooking)" class="status-banner past">
                  <!-- <span class="status-icon">📅</span> -->
                  <div class="status-info">
                    <h4>Бронирование завершено</h4>
                    <p>
                      Период проживания: {{ formatDate(selectedBooking.checkInDate) }} -
                      {{ formatDate(selectedBooking.checkOutDate) }}
                    </p>
                    <p class="days-ago">
                      Завершено {{ getDaysAgo(selectedBooking.checkOutDate) }} дней назад
                    </p>
                  </div>
                </div>
                <div v-else-if="isCurrentBooking(selectedBooking)" class="status-banner current">
                  <!-- <span class="status-icon">🏨</span> -->
                  <div class="status-info">
                    <h4>Текущее бронирование</h4>
                    <p>Вы сейчас проживаете в этом отеле</p>
                    <p class="remaining-days">
                      Осталось {{ getRemainingDays(selectedBooking.checkOutDate) }} дней
                    </p>
                  </div>
                </div>
                <div v-else-if="isUpcomingBooking(selectedBooking)" class="status-banner upcoming">
                  <!-- <span class="status-icon">⏰</span> -->
                  <div class="status-info">
                    <h4>Предстоящее бронирование</h4>
                    <p>До заезда осталось {{ getDaysUntil(selectedBooking.checkInDate) }} дней</p>
                  </div>
                </div>
              </div>

              <div class="details-section">
                <h4>Информация о бронировании</h4>
                <div class="detail-grid">
                  <div class="detail-item">
                    <strong>Статус:</strong>
                    <span :class="getStatusBadgeClass(selectedBooking.status)">
                      {{ getStatusText(selectedBooking.status) }}
                    </span>
                  </div>
                  <div class="detail-item">
                    <strong>ID бронирования:</strong>
                    <span>{{ selectedBooking.id }}</span>
                  </div>
                  <div class="detail-item">
                    <strong>Общая стоимость:</strong>
                    <span class="price">{{ formatPrice(selectedBooking.totalPrice) }}</span>
                  </div>
                  <div class="detail-item">
                    <strong>Период:</strong>
                    <span
                      >{{ formatDate(selectedBooking.checkInDate) }} -
                      {{ formatDate(selectedBooking.checkOutDate) }}</span
                    >
                  </div>
                  <div class="detail-item">
                    <strong>Ночей:</strong>
                    <span>{{
                      calculateNights(selectedBooking.checkInDate, selectedBooking.checkOutDate)
                    }}</span>
                  </div>
                </div>
              </div>

              <div class="details-section">
                <h4>Информация об отеле</h4>
                <div class="detail-grid">
                  <div class="detail-item">
                    <strong>Отель:</strong>
                    <span>{{ selectedBooking.roomType.hotel.name }}</span>
                  </div>
                  <div class="detail-item">
                    <strong>Адрес:</strong>
                    <span
                      >{{ selectedBooking.roomType.hotel.address }},
                      {{ selectedBooking.roomType.hotel.country }}</span
                    >
                  </div>
                  <div class="detail-item">
                    <strong>Тип номера:</strong>
                    <span>{{ selectedBooking.roomType.name }}</span>
                  </div>
                  <div class="detail-item">
                    <strong>Цена за ночь:</strong>
                    <span>{{ formatPrice(selectedBooking.roomType.price) }}</span>
                  </div>
                </div>
              </div>

              <div
                v-if="
                  selectedBooking.roomType.cancellationPolicy && !isPastBooking(selectedBooking)
                "
                class="details-section"
              >
                <h4>Условия отмены</h4>
                <p>
                  {{
                    getCancellationPolicyDescription(selectedBooking.roomType.cancellationPolicy)
                  }}
                </p>
              </div>

              <div class="details-section">
                <div class="detail-grid">
                  <div class="detail-item">
                    <strong>Создано:</strong>
                    <span>{{ formatDateTime(selectedBooking.createdAt) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button @click="closeDetailsModal" class="btn-primary">Закрыть</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  BookingStatus,
  PenaltyType,
  type CancellationPolicyModel,
  type FullBookingModel,
} from '@/api/bookingApiClient.generated'
import { useBookingStore } from '@/stores/bookingStore'
import type { CancellationResult } from '@/types/booking'
import { storeToRefs } from 'pinia'
import { ref, computed, onMounted } from 'vue'

const BookingStore = useBookingStore()
const { clientId, clientFullName, clientEmail, isAuthenticated } = storeToRefs(BookingStore)

const isPastBooking = (booking: FullBookingModel) => {
  return new Date(booking.checkOutDate!) < new Date()
}

const isCurrentBooking = (booking: FullBookingModel) => {
  const today = new Date()
  const checkIn = new Date(booking.checkInDate!)
  const checkOut = new Date(booking.checkOutDate!)
  return checkIn <= today && today <= checkOut
}

const isUpcomingBooking = (booking: FullBookingModel) => {
  return new Date(booking.checkInDate!) > new Date()
}

// Функции для определения статуса бронирования по времени
const isPastDate = (dateString: string) => {
  return new Date(dateString) < new Date()
}

const getDaysAgo = (dateString: string) => {
  const date = new Date(dateString)
  const today = new Date()
  const diffTime = Math.abs(today.getTime() - date.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

const getDaysUntil = (dateString: string) => {
  const date = new Date(dateString)
  const today = new Date()
  const diffTime = date.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

const getPolicyName = (penaltyType: PenaltyType): string => {
  switch (penaltyType) {
    case PenaltyType._1:
      return 'Процентный штраф'
    case PenaltyType._2:
      return 'Фиксированный штраф'
    case PenaltyType._3:
      return 'Штраф в ночах'
    default:
      return 'Стандартная политика'
  }
}

const calculateRefundPercentage = (): number => {
  if (!selectedBooking.value || !cancellationCalculation.value) return 0

  const totalPrice = selectedBooking.value.totalPrice
  const refundAmount = cancellationCalculation.value.refundAmount

  if (totalPrice === 0) return 0
  return Math.round((refundAmount / totalPrice!) * 100)
}

// Функция для расчета условий отмены (примерная реализация)
// const calculateCancellation = async (booking: FullBookingModel): Promise<CancellationResult> => {
//   const checkInDate = new Date(booking.checkInDate)
//   const today = new Date()
//   const daysBeforeCheckin = Math.ceil(
//     (checkInDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
//   )

//   const policy = booking.roomType.cancellationPolicy

//   if (!policy) {
//     // Если политики нет - стандартные условия
//     return {
//       canCancel: daysBeforeCheckin > 1,
//       refundAmount: daysBeforeCheckin > 1 ? booking.totalPrice : 0,
//       penaltyAmount: daysBeforeCheckin > 1 ? 0 : booking.totalPrice,
//       daysBeforeCheckin,
//       appliedRuleDescription:
//         daysBeforeCheckin > 1
//           ? 'Бесплатная отмена за 24 часа до заезда'
//           : 'Отмена менее чем за 24 часа до заезда не возможна',
//     }
//   }

//   let penaltyAmount = 0
//   let refundAmount = booking.totalPrice

//   if (daysBeforeCheckin <= policy.freeCancellationDays) {
//     // Применяем штраф
//     switch (policy.penaltyType) {
//       case PenaltyType.Percentage:
//         penaltyAmount = (booking.totalPrice * policy.penaltyValue) / 100
//         break
//       case PenaltyType.FixedAmount:
//         penaltyAmount = policy.penaltyValue
//         break
//       case PenaltyType.Nights:
//         const nights = calculateNights(booking.checkInDate, booking.checkOutDate)
//         const pricePerNight = booking.totalPrice / nights
//         penaltyAmount = pricePerNight * policy.penaltyValue
//         break
//     }

//     refundAmount = Math.max(0, booking.totalPrice - penaltyAmount)
//   }

//   const canCancel = daysBeforeCheckin > 0 && refundAmount >= 0

//   return {
//     canCancel,
//     refundAmount,
//     penaltyAmount,
//     daysBeforeCheckin,
//     appliedRuleDescription: generateRuleDescription(policy, daysBeforeCheckin),
//   }
// }

const generateRuleDescription = (
  policy: CancellationPolicyModel,
  daysBeforeCheckin: number,
): string => {
  if (daysBeforeCheckin > policy.freeCancellationDays!) {
    return `Бесплатная отмена за ${policy.freeCancellationDays} дней до заезда`
  }

  switch (policy.penaltyType) {
    case PenaltyType._1:
      return `Штраф ${policy.penaltyValue}% от стоимости бронирования`
    case PenaltyType._2:
      return `Штраф ${formatPrice(policy.penaltyValue!)}`
    case PenaltyType._3:
      return `Штраф за ${policy.penaltyValue} ночь(и)`
    default:
      return 'Условия отмены согласно политике отеля'
  }
}

// Реактивные данные
const bookings = ref<FullBookingModel[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const searchQuery = ref('')

// Модальные окна
const showCancelModal = ref(false)
const showDetailsModal = ref(false)
const selectedBooking = ref<FullBookingModel | null>(null)
const cancellationCalculation = ref<CancellationResult | null>(null)
const cancellationReason = ref('')
const cancelling = ref(false)

// Загрузка бронирований
const loadBookings = async () => {
  loading.value = true
  error.value = null

  try {
    if (isAuthenticated.value) {
      bookings.value = await BookingStore.GetClientBookings(clientId.value)
      console.log(clientFullName, clientEmail)
    } else {
      throw new Error('Ошибка при загрузке бронирований')
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Неизвестная ошибка'
  } finally {
    loading.value = false
  }
}

// Фильтрация и сортировка бронирований
const filteredBookings = computed(() => {
  let filtered = bookings.value

  // Поиск
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      (booking) =>
        booking.roomType!.hotel!.name!.toLowerCase().includes(query) ||
        booking.roomType!.name!.toLowerCase().includes(query) ||
        booking.id!.toLowerCase().includes(query),
    )
  }

  // Сортировка по дате создания (новые сначала)
  return filtered.sort(
    (a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime(),
  )
})

// Форматирование данных
const formatDate = (dateString: string | Date) => {
  if (!dateString) return ''
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString
  return date.toLocaleDateString('ru-RU')
}

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('ru-RU')
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
  }).format(price)
}

const calculateNights = (checkIn: string, checkOut: string) => {
  const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

// Работа со статусами
const getStatusText = (status: BookingStatus) => {
  const statusMap = {
    [BookingStatus._0]: 'Ожидание',
    [BookingStatus._1]: 'Подтверждено',
    [BookingStatus._3]: 'Отменено',
  }
  return statusMap[status] || 'Неизвестно'
}

const getStatusBadgeClass = (status: BookingStatus) => {
  const classMap = {
    [BookingStatus._0]: 'status-pending',
    [BookingStatus._1]: 'status-confirmed',
    [BookingStatus._3]: 'status-cancelled',
  }
  return `status-badge ${classMap[status] || ''}`
}

const getStatusClass = (status: BookingStatus) => {
  const classMap = {
    [BookingStatus._0]: 'booking-status-pending',
    [BookingStatus._1]: 'booking-status-confirmed',
    [BookingStatus._2]: 'booking-status-cancelled',
  }
  return classMap[status] || ''
}

// Политика отмены
const getCancellationPolicyDescription = (policy: CancellationPolicyModel) => {
  if (policy.freeCancellationDays! > 0) {
    return `Бесплатная отмена за ${policy.freeCancellationDays} дней до заезда`
  }

  const penaltyText = getPenaltyTypeText(policy.penaltyType!, policy.penaltyValue!)
  return `Не возвратный тариф. ${penaltyText}`
}

const getPenaltyTypeText = (type: PenaltyType, value: number) => {
  switch (type) {
    case PenaltyType._1:
      return `Штраф ${value}% от стоимости`
    case PenaltyType._2:
      return `Штраф ${formatPrice(value)}`
    case PenaltyType._3:
      return `Штраф ${value} ночей`
    default:
      return 'Штрафные условия'
  }
}

// Модальные окна
const showCancellationModal = async (booking: FullBookingModel) => {
  selectedBooking.value = booking
  showCancelModal.value = true
  cancellationCalculation.value = null
  cancellationReason.value = ''

  const refundAmount = await BookingStore.CalculateRefundAmount(booking.id!)
  const checkInDate = new Date(booking.checkInDate!)
  const today = new Date()
  const daysBeforeCheckin = Math.ceil(
    (checkInDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  )
  const policy = booking.roomType?.cancellationPolicy
  cancellationCalculation.value = {
    canCancel: true,
    refundAmount: refundAmount,
    penaltyAmount: booking.totalPrice! - refundAmount,
    daysBeforeCheckin: daysBeforeCheckin,
    appliedRuleDescription:
      policy == null
        ? 'Бесплатная отмена бронирования'
        : generateRuleDescription(policy!, daysBeforeCheckin),
  } as CancellationResult

  try {
    const response = await fetch(`/api/bookings/${booking.id}/cancellation-fee`)
    cancellationCalculation.value = await response.json()
  } catch (err) {
    console.error('Ошибка при расчете отмены:', err)
  }
}

const closeCancelModal = () => {
  showCancelModal.value = false
  selectedBooking.value = null
  cancellationCalculation.value = null
}

const showBookingDetails = (booking: FullBookingModel) => {
  selectedBooking.value = booking
  showDetailsModal.value = true
}

const closeDetailsModal = () => {
  showDetailsModal.value = false
  selectedBooking.value = null
}

// Подтверждение отмены
const confirmCancellation = async () => {
  if (!selectedBooking.value) return

  cancelling.value = true

  try {
    await BookingStore.CancelBooking(selectedBooking.value.id!)
    await loadBookings()
    closeCancelModal()
  } catch (err) {
    console.error('Ошибка:', err)
    error.value = 'Не удалось отменить бронирование'
  } finally {
    cancelling.value = false
  }
}

// Загрузка при монтировании
onMounted(() => {
  loadBookings()
})
</script>

<style scoped>
.user-bookings-wrapper {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* Стили для статусов времени */
.past-badge,
.current-badge,
.upcoming-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8em;
  font-weight: bold;
  margin-left: 10px;
}

.past-badge {
  background: #6c757d;
  color: white;
}

.current-badge {
  background: #17a2b8;
  color: white;
}

.upcoming-badge {
  background: #28a745;
  color: white;
}

.past-booking {
  opacity: 0.9;
  background: #f8f9fa;
}

.past-booking .booking-title {
  color: #6c757d;
}

.user-bookings {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background: white;
  padding: 2rem;

  border-radius: 16px;
}

.bookings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 20px;
}

.bookings-controls {
  display: flex;
  gap: 15px;
  align-items: center;
}

.search-input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  min-width: 300px;
}

.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 40px;
  color: #666;
}

.spinner {
  border: 3px solid #f3f3f3;
  border-top: 3px solid #007bff;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.retry-btn {
  padding: 10px 20px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.bookings-list {
  display: grid;
  gap: 20px;
}

.booking-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #ddd;
}

.booking-status-confirmed {
  border-left-color: #28a745;
}

.booking-status-cancelled {
  border-left-color: #dc3545;
}

.booking-status-pending {
  border-left-color: #ffc107;
}

.booking-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.booking-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.booking-title {
  margin: 0;
  font-size: 1.3em;
  color: #333;
}

.booking-id {
  font-size: 0.9em;
  color: #666;
}

.booking-actions {
  display: flex;
  gap: 10px;
}

.cancel-btn,
.details-btn {
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  font-size: 0.9em;
}

.cancel-btn {
  color: #dc3545;
  border-color: #dc3545;
}

.cancel-btn:hover {
  background: #dc3545;
  color: white;
}

.details-btn {
  color: #007bff;
  border-color: #007bff;
}

.details-btn:hover {
  background: #007bff;
  color: white;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8em;
  font-weight: bold;
  align-self: flex-start;
}

.status-confirmed {
  background: #d4edda;
  color: #155724;
}

.status-cancelled {
  background: #f8d7da;
  color: #721c24;
}

.status-pending {
  background: #fff3cd;
  color: #856404;
}

.booking-details {
  margin-bottom: 15px;
}

.detail-row {
  display: flex;
  gap: 30px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.detail-item {
  display: flex;
  gap: 8px;
  /* align-items: center; */
  min-width: 200px;
}

.price {
  font-weight: bold;
  color: #28a745;
}

.cancellation-info {
  margin-top: 10px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 4px;
}

.booking-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 15px;
  border-top: 1px solid #eee;
  font-size: 0.9em;
  color: #666;
}

/* Модальные окна */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  padding: 0;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.details-modal {
  max-width: 600px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5em;
  cursor: pointer;
  color: #666;
}

.modal-body {
  padding: 20px;
}

.booking-summary {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 20px;
  border-top: 1px solid #eee;
}

.btn-primary,
.btn-secondary,
.btn-danger {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9em;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.cancellation-calculation {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.cancellation-reason label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.cancellation-reason textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
}

.cancellation-modal {
  max-width: 500px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px 20px 10px;
  border-bottom: 1px solid #e9ecef;
}

.header-content {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.header-icon .warning-icon {
  font-size: 24px;
}

.header-text h3 {
  margin: 0 0 4px 0;
  color: #dc3545;
  font-size: 1.3em;
}

.booking-reference {
  margin: 0;
  color: #6c757d;
  font-size: 0.9em;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5em;
  cursor: pointer;
  color: #6c757d;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-body {
  padding: 20px;
  max-height: 60vh;
  overflow-y: auto;
}

.booking-preview {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.hotel-name {
  font-weight: bold;
  font-size: 1.1em;
  margin-bottom: 4px;
}

.hotel-location {
  color: #6c757d;
  font-size: 0.9em;
  margin-bottom: 10px;
}

.booking-dates {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.date-range {
  display: flex;
  align-items: center;
  gap: 8px;
}

.date-separator {
  color: #6c757d;
}

.nights-count {
  color: #6c757d;
  font-size: 0.9em;
}

.room-type {
  margin-bottom: 8px;
}

.total-price {
  font-weight: bold;
  font-size: 1.1em;
  color: #28a745;
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.section-title h4 {
  margin: 0;
  color: #495057;
}

.days-remaining {
  color: #6c757d;
  font-size: 0.9em;
}

.policy-info {
  margin-bottom: 20px;
}

.policy-name {
  font-weight: bold;
  color: #495057;
  margin-bottom: 5px;
}

.policy-description {
  color: #6c757d;
  font-size: 0.9em;
}

.financial-calculation {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 15px;
}

.calculation-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f8f9fa;
}

.calculation-row.penalty {
  color: #dc3545;
}

.calculation-row.total {
  font-weight: bold;
  font-size: 1.1em;
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
  border-top: 1px solid #e9ecef;
  padding-top: 8px;
}

.non-refundable-warning,
.partial-refund-info,
.free-cancellation-info {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-top: 15px;
  padding: 12px;
  border-radius: 6px;
}

.non-refundable-warning {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
}

.partial-refund-info {
  background: #d1ecf1;
  border: 1px solid #bee5eb;
}

.free-cancellation-info {
  background: #d4edda;
  border: 1px solid #c3e6cb;
}

.warning-text,
.info-text,
.success-text {
  font-size: 0.9em;
}

.cancellation-reason-section {
  margin-top: 20px;
}

.reason-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-weight: bold;
}

.optional {
  color: #6c757d;
  font-size: 0.8em;
  font-weight: normal;
}

.reason-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  resize: vertical;
  font-family: inherit;
}

.modal-footer {
  padding: 15px 20px;
  border-top: 1px solid #e9ecef;
  background: #f8f9fa;
}

.footer-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.cancellation-disabled {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 15px;
  padding: 12px;
  background: #fff3cd;
  border-radius: 6px;
  justify-content: center;
}

.disabled-text {
  font-size: 0.9em;
  color: #856404;
}

.loading-calculation {
  text-align: center;
  padding: 30px;
  color: #6c757d;
}

.spinner-small {
  width: 20px;
  height: 20px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 10px;
}

.spinner-btn {
  display: inline-block;
  width: 12px;
  height: 12px;
  border: 2px solid transparent;
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 6px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.btn-secondary {
  padding: 10px 20px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.btn-danger {
  padding: 10px 20px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.btn-danger:disabled {
  background: #a0a0a0;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .cancellation-modal {
    margin: 20px;
    max-width: none;
  }

  .footer-actions {
    flex-direction: column;
  }

  .section-title {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
}

.details-section {
  margin-bottom: 20px;
}

.details-section h4 {
  margin: 0 0 15px 0;
  color: #333;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 10px;
}

/* Адаптивность */
@media (max-width: 768px) {
  .bookings-header {
    flex-direction: column;
    align-items: stretch;
  }

  .bookings-controls {
    flex-direction: column;
  }

  .search-input {
    min-width: auto;
  }

  .booking-header {
    flex-direction: column;
    gap: 15px;
  }

  .booking-actions {
    align-self: flex-end;
  }

  .detail-row {
    flex-direction: column;
    gap: 10px;
  }

  .modal-content {
    width: 95%;
    margin: 20px;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }

  .detail-item {
    min-width: auto;
  }
}
</style>
