<template>
  <div>
    <slot slot="header" />
    <Child :title.sync="title" />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>
