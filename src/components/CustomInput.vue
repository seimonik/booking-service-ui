<template>
  <div>
    <label for="custom-input" class="form-label">{{ props.label }}</label>
    <input
      id="custom-input"
      v-model="text"
      type="text"
      :placeholder="props.placeholder"
      class="form-input"
    />
  </div>
</template>

<script lang="ts" setup>
const text = defineModel<string>()
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
</script>

<style scoped>
.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #333;
}
</style>
