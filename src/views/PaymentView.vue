<template>
  <div class="outer-container">
    <div class="container">
      <h2>Оплата заказа</h2>

      <form @submit.prevent="processPayment">
        <div class="form-group">
          <label for="amount">Сумма платежа (руб)</label>
          <input type="number" id="amount" :value="amount" readonly class="readonly-input" />
        </div>

        <div class="form-group">
          <label for="cardNumber">Номер карты</label>
          <input
            type="text"
            id="cardNumber"
            v-model="paymentData.cardNumber"
            maxlength="19"
            required
            placeholder="0000 0000 0000 0000"
            @input="formatCardNumber"
          />
        </div>

        <div class="row">
          <div class="form-group">
            <label for="expiryDate">Срок действия</label>
            <input
              type="text"
              id="expiryDate"
              v-model="paymentData.expiryDate"
              required
              placeholder="MM/YY"
              maxlength="5"
              @input="formatExpiryDate"
            />
          </div>

          <div class="form-group">
            <label for="cvv">CVV</label>
            <input
              type="text"
              id="cvv"
              v-model="paymentData.cvv"
              maxlength="3"
              required
              placeholder="123"
              @input="restrictToNumbers"
            />
          </div>
        </div>

        <div class="form-group">
          <label for="cardHolder">Имя владельца карты</label>
          <input
            type="text"
            id="cardHolder"
            v-model="paymentData.cardHolderName"
            required
            placeholder="IVAN IVANOV"
            @input="formatCardHolder"
          />
        </div>

        <button type="submit" :disabled="processing">
          {{ processing ? 'Обработка...' : `Оплатить ${amount} руб` }}
        </button>
      </form>

      <div v-if="message" :class="['message', messageType]">
        {{ message }}
        <div v-if="transactionId">ID транзакции: {{ transactionId }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PaymentRequest } from '@/api/bookingApiClient.generated'
import { useBookingStore } from '@/stores/bookingStore'
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'

interface PaymentData {
  cardNumber: string
  expiryDate: string
  cvv: string
  cardHolderName: string
}

const router = useRouter()
const BookingStore = useBookingStore()
// Определяем props с значением по умолчанию
const props = defineProps({
  amount: Number,
  bookingId: String,
})
// const props = withDefaults(
//   defineProps<{
//     amount?: number
//   }>(),
//   {
//     amount: 1000,
//   },
// )

const paymentData = reactive<PaymentData>({
  cardNumber: '',
  expiryDate: '',
  cvv: '',
  cardHolderName: '',
})

const processing = ref(false)
const message = ref('')
const messageType = ref('')
const transactionId = ref('')

// Форматирование номера карты (добавляем пробелы каждые 4 цифры)
const formatCardNumber = (event: Event) => {
  const input = event.target as HTMLInputElement
  let value = input.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')

  if (value.length > 16) {
    value = value.substring(0, 16)
  }

  const formattedValue = value.replace(/(\d{4})/g, '$1 ').trim()
  paymentData.cardNumber = formattedValue
}

// Форматирование срока действия карты
const formatExpiryDate = (event: Event) => {
  const input = event.target as HTMLInputElement
  let value = input.value.replace(/\D/g, '')

  if (value.length > 4) {
    value = value.substring(0, 4)
  }

  if (value.length > 2) {
    value = value.substring(0, 2) + '/' + value.substring(2)
  }

  paymentData.expiryDate = value
}

// Ограничение ввода только цифрами для CVV
const restrictToNumbers = (event: Event) => {
  const input = event.target as HTMLInputElement
  input.value = input.value.replace(/\D/g, '')
}

// Форматирование имени владельца карты (в верхний регистр)
const formatCardHolder = (event: Event) => {
  const input = event.target as HTMLInputElement
  paymentData.cardHolderName = input.value.toUpperCase()
}

const processPayment = async (): Promise<void> => {
  processing.value = true
  message.value = ''
  transactionId.value = ''
  messageType.value = 'processing'

  try {
    // Подготовка данных для отправки (убираем форматирование)
    const payload = {
      cardNumber: paymentData.cardNumber.replace(/\s+/g, ''),
      expiry: paymentData.expiryDate,
      cvv: paymentData.cvv,
      amount: props.amount,
    } as PaymentRequest

    const response = await BookingStore.ProcessPayment(payload)

    // const response = await fetch('http://localhost:5000/process-payment', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(payload),
    // })

    // const result: PaymentResponse = await response.json()

    if (response.isValid) {
      message.value = response.message!
      messageType.value = 'success'

      // Вызов сервиса PaymentService для подтверждения оплаты
      await sendPaymentRequest(props.bookingId!)
      await new Promise((resolve) => setTimeout(resolve, 1000))
      router.push({ name: 'Home' })
    } else {
      message.value = response.message!
      messageType.value = 'error'
    }
  } catch (error) {
    message.value = 'Ошибка соединения с сервером'
    messageType.value = 'error'
    console.error('Payment error:', error)
  } finally {
    processing.value = false
  }
}

const sendPaymentRequest = async (bookingId: string): Promise<void> => {
  const url = `http://localhost:8002/api/payment?bookingId=${bookingId}`

  try {
    await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    console.log(error)
  }
}
</script>

<style scoped>
body {
  font-family: 'Arial', sans-serif;
  background-color: #f5f5f5;
  margin: 0;
  padding: 20px;
  color: #333;
}
.outer-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
.container {
  max-width: 500px;
  width: 100%;
  background: white;
  padding: 40px;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  margin: 0 auto;
}
/* .container {
  max-width: 500px;
  margin: 0 auto;
  background: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
} */
h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #2c3e50;
}
.form-group {
  margin-bottom: 20px;
}
label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
}
input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
  font-size: 16px;
}
.readonly-input {
  background-color: #f8f9fa;
  color: #6c757d;
  cursor: not-allowed;
}
.row {
  display: flex;
  gap: 15px;
}
.row .form-group {
  flex: 1;
}
button {
  width: 100%;
  padding: 12px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}
button:hover {
  background-color: #2980b9;
}
button:disabled {
  background-color: #95a5a6;
  cursor: not-allowed;
}
.message {
  padding: 15px;
  margin-top: 20px;
  border-radius: 4px;
  text-align: center;
}
.success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}
.error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}
.processing {
  background-color: #d1ecf1;
  color: #0c5460;
  border: 1px solid #bee5eb;
}
</style>
