<template>
  <button
    class="custom-btn"
    :class="{
      'primary-btn': type === 'primary',
      'secondary-btn': type === 'secondary',
    }"
    :style="props.width ? `width: ${props.width}` : ''"
    :disabled="props.disabled"
    @click="() => emit('click')"
  >
    <span class="btn-text">{{ props.text }}</span>
  </button>
</template>

<script lang="ts" setup>
const props = defineProps({
  text: {
    type: String,
    default: '',
    required: true,
  },
  type: {
    type: String,
    default: 'primary',
    required: false,
  },
  disabled: {
    type: Boolean,
    default: false,
    required: false,
  },
  width: {
    type: String,
    default: '',
    required: false,
  },
})

const emit = defineEmits(['click'])
</script>

<style scoped>
.custom-btn {
  padding: 1rem 2rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.primary-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.primary-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.primary-btn:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.secondary-btn {
  background: transparent;
  color: #667eea;
  border: 2px solid #667eea;
}

.secondary-btn:hover {
  background: #667eea;
  color: white;
}
</style>
