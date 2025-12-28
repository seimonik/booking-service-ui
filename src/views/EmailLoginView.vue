<template>
  <div class="auth-container">
    <div class="auth-card">
      <h2>Вход в систему бронирования</h2>

      <!-- Шаг 1: Ввод email -->
      <form v-if="step === 'email'" @submit.prevent="sendCode" class="auth-form">
        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            placeholder="your@email.com"
            :class="{ error: errors.email }"
            autocomplete="email"
            required
          />
          <div v-if="errors.email" class="error-message">{{ errors.email }}</div>
        </div>

        <button type="submit" class="btn btn-primary" :disabled="loading">
          {{ loading ? 'Отправка...' : 'Отправить код' }}
        </button>
      </form>

      <!-- Шаг 2: Ввод кода -->
      <form v-else-if="step === 'code'" @submit.prevent="verifyCode" class="auth-form">
        <div class="form-group">
          <label>Код из письма</label>
          <p class="email-info">
            Отправлен на: <strong>{{ form.email }}</strong>
          </p>
          <input
            v-model="form.code"
            type="text"
            inputmode="numeric"
            maxlength="6"
            :class="{ error: errors.code }"
            autocomplete="one-time-code"
            autofocus
            @input="handleCodeInput"
            required
          />
          <div v-if="errors.code" class="error-message">{{ errors.code }}</div>
          <small class="code-hint">Введите 6-значный код из письма (действует 10 минут)</small>
        </div>

        <div class="form-actions">
          <button type="button" class="btn btn-secondary" @click="step = 'email'">Назад</button>
          <button type="submit" class="btn btn-success" :disabled="loading || !isCodeValid">
            Войти
          </button>
        </div>
      </form>

      <!-- Успешный вход -->
      <div v-else-if="step === 'success'" class="success-message">
        <div class="success-icon">✓</div>
        <h3>Вход выполнен!</h3>
        <p>Перенаправление...</p>
        <button class="btn btn-primary" @click="goToBookings">Перейти к бронированиям</button>
      </div>

      <!-- Ошибка -->
      <div v-if="globalError" class="alert alert-danger">
        {{ globalError }}
        <button @click="globalError = ''" class="alert-close">&times;</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBookingStore } from '@/stores/bookingStore'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

interface EmailLoginForm {
  email: string
  code: string
}

const router = useRouter()
const BookingStore = useBookingStore()

// Reactive state
const step = ref<'email' | 'code' | 'success'>('email')
const loading = ref(false)
const form = ref<EmailLoginForm>({
  email: '',
  code: '',
})
const errors = ref<Record<string, string>>({})
const globalError = ref('')

// Computed
const isCodeValid = computed(() => form.value.code.length === 6 && /^\d{6}$/.test(form.value.code))

// API функции
const apiBase = '/api/auth'

const sendCode = async () => {
  loading.value = true
  errors.value = {}

  try {
    await BookingStore.SendCode(form.value.email)
    // const response = await fetch(`${apiBase}/send-code`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ email: form.value.email }),
    // })

    // const data = await response.json()

    // if (!response.ok) {
    //   throw new Error(data.message || 'Ошибка отправки кода')
    // }

    step.value = 'code'
  } catch (error) {
    globalError.value = error instanceof Error ? error.message : 'Ошибка отправки кода'
  } finally {
    loading.value = false
  }
}

const verifyCode = async () => {
  loading.value = true
  errors.value = {}

  try {
    const response = await BookingStore.VerifyCode(form.value.email, form.value.code)
    // const response = await fetch(`${apiBase}/verify`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     email: form.value.email,
    //     code: form.value.code,
    //   }),
    // })

    // const data = await response.json()

    // if (!response.ok) {
    //   errors.value.code = data.message || 'Неверный или просроченный код'
    //   return
    // }

    // // Сохраняем токен или email в localStorage
    // localStorage.setItem('userEmail', form.value.email)
    // localStorage.setItem('authToken', data.token || '')

    step.value = 'success'

    // Автоперенаправление через 2 секунды
    setTimeout(() => {
      goToBookings()
    }, 700)
  } catch {
    globalError.value = 'Ошибка проверки кода'
  } finally {
    loading.value = false
  }
}

// Методы
const handleCodeInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  // Только цифры
  form.value.code = target.value.replace(/\D/g, '').slice(0, 6)
}

const goToBookings = () => {
  router.push('/my-bookings')
}

// Обработка Enter в поле кода
// const handleKeydown = (event: KeyboardEvent) => {
//   if (event.key === 'Enter' && isCodeValid.value) {
//     verifyCode()
//   }
// }
</script>

<style scoped>
.auth-container {
  min-height: 92vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
}

.auth-card {
  background: white;
  padding: 2.5rem;
  border-radius: 16px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
  max-width: 420px;
  width: 100%;
}

h2 {
  text-align: center;
  margin-bottom: 0.5rem;
  color: #333;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

label {
  font-weight: 600;
  color: #333;
  font-size: 0.95rem;
}

input {
  padding: 1rem;
  border: 2px solid #e1e5e9;
  border-radius: 10px;
  font-size: 1.1rem;
  transition: all 0.2s;
}

input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

input.error {
  border-color: #e74c3c;
}

.email-info {
  background: #f8f9fa;
  padding: 0.75rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 0.95rem;
  color: #666;
}

.code-hint {
  color: #666;
  font-size: 0.85rem;
  margin-top: 0.25rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.btn {
  padding: 1rem 2rem;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  flex: 1;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #5a67d8;
  transform: translateY(-1px);
}

.btn-success {
  background: #48bb78;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background: #38a169;
}

.btn-secondary {
  background: #f7fafc;
  color: #4a5568;
  border: 2px solid #e2e8f0;
}

.btn-secondary:hover {
  background: #edf2f7;
}

.success-message {
  text-align: center;
  padding: 2rem;
}

.success-icon {
  width: 80px;
  height: 80px;
  background: #48bb78;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  font-weight: bold;
  margin: 0 auto 1rem;
}

.error-message {
  color: #e74c3c;
  font-size: 0.85rem;
}

.alert {
  position: relative;
  padding: 1rem 1.5rem;
  border-radius: 10px;
  margin-bottom: 1.5rem;
}

.alert-danger {
  background: #fed7d7;
  color: #c53030;
  border: 1px solid #fc8181;
}

.alert-close {
  position: absolute;
  top: 0.5rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: inherit;
}
</style>
