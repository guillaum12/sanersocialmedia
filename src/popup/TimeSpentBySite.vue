<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getTimeSpentByHost } from '~/chrome'

const timeSpentEntries = ref<Array<{ hostname: string, elapsedMs: number }>>([])

async function refreshTimeSpent() {
  const timeSpentByHost = await getTimeSpentByHost()
  timeSpentEntries.value = Object.entries(timeSpentByHost)
    .sort(([, a], [, b]) => b - a)
    .map(([hostname, elapsedMs]) => ({ hostname, elapsedMs }))
}

function formatElapsedMs(elapsedMs: number) {
  const totalSeconds = Math.floor(elapsedMs / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }

  if (minutes > 0) {
    return `${minutes}m ${seconds}s`
  }

  return `${seconds}s`
}

onMounted(refreshTimeSpent)
chrome.storage.onChanged.addListener((_changes, areaName) => {
  if (areaName === 'local') {
    refreshTimeSpent()
  }
})
</script>

<template>
  <section class="mt-3 border border-dark-300 rounded-lg bg-dark-500 p-3">
    <h3 class="mb-2 text-xs text-gray-400 font-semibold uppercase tracking-wide">
      Time spent by site
    </h3>
    <div v-if="timeSpentEntries.length === 0" class="text-xs text-gray-400">
      No tracked time yet.
    </div>
    <div v-else class="space-y-1">
      <div
        v-for="entry in timeSpentEntries"
        :key="entry.hostname"
        class="flex items-center justify-between text-sm"
      >
        <span class="mr-2 truncate">{{ entry.hostname }}</span>
        <span class="text-gray-300">{{ formatElapsedMs(entry.elapsedMs) }}</span>
      </div>
    </div>
  </section>
</template>
