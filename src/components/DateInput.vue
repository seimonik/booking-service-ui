<template>
  <div class="date-picker" ref="datePickerRef">
    <label for="date-input" class="form-label">{{ props.label }}</label>
    <div class="input-wrapper" @click="toggleCalendar">
      <input
        id="date-input"
        type="text"
        :value="formattedDate"
        readonly
        :placeholder="props.placeholder"
        class="date-input"
      />
      <span class="calendar-icon">📅</span>
    </div>

    <div v-if="isOpen" class="calendar-dropdown">
      <div class="calendar-header">
        <button @click="prevMonth" class="nav-btn">&lt;</button>
        <span class="month-year">{{ currentMonth }} {{ currentYear }}</span>
        <button @click="nextMonth" class="nav-btn">&gt;</button>
      </div>

      <div class="calendar-grid">
        <div v-for="day in ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']" :key="day" class="week-day">
          {{ day }}
        </div>

        <div
          v-for="day in calendarDays"
          :key="day.date.getTime()"
          :class="[
            'calendar-day',
            {
              'other-month': !day.isCurrentMonth,
              selected: day.isSelected,
              today: day.isToday,
            },
          ]"
          @click="selectDate(day.date)"
        >
          {{ day.date.getDate() }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface CalendarDay {
  date: Date
  isCurrentMonth: boolean
  isSelected: boolean
  isToday: boolean
}

const currentDate = defineModel<string>()
const props = defineProps({
  label: {
    type: String,
    default: '',
    required: false,
  },
  placeholder: {
    type: String,
    default: '',
    required: false,
  },
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const datePickerRef = ref<HTMLDivElement>()
const isOpen = ref(false)
const selectedDate = ref<Date | null>(null)
const currentViewDate = ref(new Date())

// Форматированная дата для отображения в поле ввода
const formattedDate = computed(() => {
  if (!selectedDate.value) return ''
  return selectedDate.value.toLocaleDateString('ru-RU')
})

// Текущий месяц и год для отображения в заголовке календаря
const currentMonth = computed(() => {
  return currentViewDate.value.toLocaleDateString('ru-RU', { month: 'long' })
})

const currentYear = computed(() => {
  return currentViewDate.value.getFullYear()
})

// Дни для отображения в календаре
const calendarDays = computed((): CalendarDay[] => {
  const year = currentViewDate.value.getFullYear()
  const month = currentViewDate.value.getMonth()

  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)

  // Начинаем с понедельника недели, содержащей 1 число месяца
  const startDate = new Date(firstDayOfMonth)
  startDate.setDate(startDate.getDate() - (firstDayOfMonth.getDay() || 7) + 1)

  // Заканчиваем воскресеньем недели, содержащей последнее число месяца
  const endDate = new Date(lastDayOfMonth)
  endDate.setDate(endDate.getDate() + (7 - (lastDayOfMonth.getDay() || 7)))

  const days: CalendarDay[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
    const dateCopy = new Date(date)
    days.push({
      date: new Date(date),
      isCurrentMonth: date.getMonth() === month,
      isSelected: selectedDate.value
        ? dateCopy.setHours(0, 0, 0, 0) === selectedDate.value.setHours(0, 0, 0, 0)
        : false,
      isToday: dateCopy.setHours(0, 0, 0, 0) === today.getTime(),
    })
  }

  return days
})

// Переключение видимости календаря
const toggleCalendar = () => {
  isOpen.value = !isOpen.value
}

// Выбор даты
const selectDate = (date: Date) => {
  selectedDate.value = new Date(date)
  emit('update:modelValue', selectedDate.value.toISOString().split('T')[0]!)
  isOpen.value = false
}

// Навигация по месяцам
const prevMonth = () => {
  currentViewDate.value = new Date(
    currentViewDate.value.getFullYear(),
    currentViewDate.value.getMonth() - 1,
    1,
  )
}

const nextMonth = () => {
  currentViewDate.value = new Date(
    currentViewDate.value.getFullYear(),
    currentViewDate.value.getMonth() + 1,
    1,
  )
}

// Закрытие календаря при клике вне компонента
const handleClickOutside = (event: MouseEvent) => {
  if (datePickerRef.value && !datePickerRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

// Обработка клавиши Escape
const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    isOpen.value = false
  }
}

// Установка начального значения
onMounted(() => {
  if (currentDate.value) {
    selectedDate.value = new Date(currentDate.value)
  }

  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleEscape)
})

// Очистка
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleEscape)
})
</script>

<style scoped>
.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #333;
}

.date-picker {
  position: relative;
  max-width: 250px;
  /* width: 250px; */
}

.input-wrapper {
  position: relative;
  cursor: pointer;
}

.date-input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s;
  cursor: pointer;
}

.date-input:focus {
  outline: none;
  border-color: #667eea;
}

.calendar-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
}

.calendar-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  width: 280px;
  background: white;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  padding: 16px;
  margin-top: 8px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.month-year {
  font-weight: 600;
  font-size: 16px;
}

.nav-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
}

.nav-btn:hover {
  background-color: #f8f9fa;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.week-day {
  text-align: center;
  font-weight: 600;
  font-size: 12px;
  color: #666;
  padding: 4px;
}

.calendar-day {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.calendar-day:hover {
  background-color: #f8f9fa;
}

.calendar-day.other-month {
  color: #ccc;
}

.calendar-day.selected {
  background-color: #667eea;
  color: white;
}

.calendar-day.today {
  background-color: #e3f2fd;
  color: #1976d2;
  font-weight: 600;
}

.calendar-day.today.selected {
  background-color: #667eea;
  color: white;
}
</style>
