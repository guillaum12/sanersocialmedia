<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { getTimeSpentForDate } from '~/storage/timeSpent'

function getTodayDateKey(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function dateKeyToDate(dateKey: string): Date {
  const [y, m, d] = dateKey.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function formatDateLabel(dateKey: string): string {
  const today = getTodayDateKey()
  if (dateKey === today) {
    return 'Today'
  }
  const yesterday = (() => {
    const d = new Date()
    d.setDate(d.getDate() - 1)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  })()
  if (dateKey === yesterday) {
    return 'Yesterday'
  }
  const date = dateKeyToDate(dateKey)
  return date.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })
}

const selectedDateKey = ref(getTodayDateKey())
const timeSpentEntries = ref<Array<{ hostname: string, elapsedMs: number }>>([])

const todayDateKey = computed(() => getTodayDateKey())
const canGoNext = computed(() => selectedDateKey.value < todayDateKey.value)
const dateLabel = computed(() => formatDateLabel(selectedDateKey.value))

async function refreshTimeSpent() {
  const timeSpentByHost = await getTimeSpentForDate(selectedDateKey.value)
  timeSpentEntries.value = Object.entries(timeSpentByHost)
    .sort(([, a], [, b]) => b - a)
    .map(([hostname, elapsedMs]) => ({ hostname, elapsedMs }))
}

function goPrevDay() {
  const d = dateKeyToDate(selectedDateKey.value)
  d.setDate(d.getDate() - 1)
  selectedDateKey.value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function goNextDay() {
  if (!canGoNext.value) return
  const d = dateKeyToDate(selectedDateKey.value)
  d.setDate(d.getDate() + 1)
  selectedDateKey.value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
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
watch(selectedDateKey, refreshTimeSpent)
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
    <div class="mb-2 flex items-center justify-between gap-2">
      <button
        type="button"
        class="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-dark-800 text-gray-300 ring-blue-500 hover:bg-dark-600 hover:text-white active:ring-2"
        aria-label="Previous day"
        @click="goPrevDay()"
      >
        <span class="i-mdi:chevron-left text-lg" />
      </button>
      <span class="min-w-0 flex-1 truncate text-center text-sm font-medium">
        {{ dateLabel }}
      </span>
      <button
        type="button"
        class="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-dark-800 text-gray-300 ring-blue-500 hover:bg-dark-600 hover:text-white active:ring-2 disabled:opacity-40 disabled:pointer-events-none"
        aria-label="Next day"
        :disabled="!canGoNext"
        @click="goNextDay()"
      >
        <span class="i-mdi:chevron-right text-lg" />
      </button>
    </div>
    <div v-if="timeSpentEntries.length === 0" class="text-xs text-gray-400">
      No tracked time for this day.
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
