<template>
  <section>
    <button v-for="item in items" @click="$emit('select', item)">
      {{ item }}
    </button>
    <div v-html="html" />
  </section>
</template>

<script setup lang="ts">
await Promise.resolve()

defineExpose({
  open: () => undefined,
})

onMounted(() => undefined)

const props = defineProps<{
  html: string
  items: string[]
}>()

const selectedItem = ref(null)

const doubled = computed(() => {
  props.items.push('x')

  return props.items.length * 2
})

console.log(selectedItem)
console.log(doubled)
</script>
