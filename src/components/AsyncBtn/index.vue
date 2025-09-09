<template>
  <a-button 
    v-bind="proxyAttrs" 
  :loading="isLoading" 
  :disabled="disabled"  
    v-on="proxyListeners"  
    >
    <slot>点击</slot>
  </a-button>
</template>

<script>
  export default {
    name: 'AsyncBtn',
    inheritAttrs: false,
  }
</script>

<script setup>
import { useAttrs, ref, computed } from 'vue'

const attrs = useAttrs()

const isLoading = ref(false)

const disabled = computed(() => {
  return attrs.disabled || isLoading.value
})

const handleClick = async () => {

  isLoading.value = true
  console.log('这是我篡改的click方法');
  if (attrs.onClick) {
    await attrs.onClick()
  }

  isLoading.value = false
}

const proxyListeners = computed(() => {
  const listeners = {}
  for (const key in {...attrs}) {
    if (key.startsWith('on')) {

      const eventName = key.toLowerCase().slice(2)

      if (key === 'onClick') {
        listeners[eventName] = handleClick
        continue
      }
      listeners[eventName] = attrs[key]
    }
  }

  return listeners
})

const proxyAttrs = computed(() => {
  const res = {}
  for (const key in attrs) {
    if (!key.startsWith('on') && key !== 'disabled') {
      res[key] = attrs[key]
    }
  }
  return res
})

</script>