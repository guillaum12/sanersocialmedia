<script setup lang="ts">
import type { Store, UserQuote } from '~/types'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { getStore } from '~/chrome'
import { myQuoteDbBound } from '~/quotes/myQuoteDbBound'

const emit = defineEmits<{
  close: []
}>()

function i18n(key: string): string {
  return chrome.i18n.getMessage(key)
}

const quotes = ref<UserQuote[]>([])
const draft = ref('')
const adding = ref(false)
const useDefaultQuotes = ref(true)

async function loadUseDefaultQuotes() {
  const store = await getStore()
  useDefaultQuotes.value = store.useDefaultQuotes !== false
}

async function toggleUseDefaultQuotes() {
  const next = !useDefaultQuotes.value
  const store = await getStore()
  await chrome.storage.sync.set({
    ...store,
    useDefaultQuotes: next,
  } as Store)
  useDefaultQuotes.value = next
}

const isTextContainingMultipleLines = computed(() => draft.value.split('\n').length > 1)

async function loadQuotes() {
  quotes.value = await myQuoteDbBound.getAll()
}

async function addQuote() {
  const t = draft.value.trim()
  if (!t || adding.value) {
    return
  }
  adding.value = true

  const quotesToAdd = isTextContainingMultipleLines.value ? t.split('\n') : [t]

  try {
    for (const quote of quotesToAdd) {
      await myQuoteDbBound.insert({
        text: quote,
      })
    }
    draft.value = ''
    await loadQuotes()
  }
  finally {
    adding.value = false
  }
}

async function removeQuote(id: string) {
  await myQuoteDbBound.deleteById(id)
  await loadQuotes()
}

function onStorageChanged(
  changes: Record<string, chrome.storage.StorageChange>,
  areaName: string,
) {
  if (areaName !== 'sync') {
    return
  }
  if (changes.customQuotes) {
    loadQuotes()
  }
  if (changes.useDefaultQuotes) {
    loadUseDefaultQuotes()
  }
}

onMounted(() => {
  loadQuotes()
  loadUseDefaultQuotes()
  chrome.storage.onChanged.addListener(onStorageChanged)
})

onUnmounted(() => {
  chrome.storage.onChanged.removeListener(onStorageChanged)
})
</script>

<template>
  <div class="container mx-auto max-w-4xl px-4 pb-8">
    <button
      type="button"
      class="mb-6 flex items-center gap-2 rounded bg-dark-800 px-3 py-2 text-sm leading-none ring-blue-500 transition-all hover:bg-dark-500 active:ring-2"
      @click="emit('close')"
    >
      <span class="i-mdi:arrow-left inline-block text-20px" />
      <span>{{ i18n('quotesBack') }}</span>
    </button>

    <div class="mb-6 w-1/2 flex items-start justify-between gap-4 rounded bg-dark-800 bg-opacity-80 px-4 py-3">
      <div class="min-w-0 flex-1">
        <div class="text-sm text-white font-medium">
          {{ i18n('quotesUseDefaultQuotes') }}
        </div>
        <p class="mt-1 text-xs text-white/80">
          {{ i18n('quotesUseDefaultQuotesHint') }}
        </p>
      </div>
      <button
        type="button"
        role="switch"
        :aria-checked="useDefaultQuotes"
        class="relative h-7 w-12 shrink-0 rounded-full ring-blue-500 transition-colors focus:outline-none focus-visible:ring-2"
        :class="useDefaultQuotes ? 'bg-yellow/80' : 'bg-dark-500'"
        @click="toggleUseDefaultQuotes"
      >
        <span
          class="absolute left-0.5 top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform"
          :class="useDefaultQuotes ? 'translate-x-5' : 'translate-x-0'"
        />
      </button>
    </div>

    <h2 class="mb-4 text-lg font-semibold">
      {{ i18n('quotesParameters') }}
    </h2>

    <div class="mb-8 rounded bg-dark-800 bg-opacity-80 p-4 space-y-3">
      <div>
        <label class="mb-1 block text-sm text-white" for="quote-text">{{ i18n('myQuotesTextLabel') }}</label>
        <textarea
          id="quote-text"
          v-model="draft"
          rows="3"
          class="w-full resize-y border border-dark-500 rounded bg-dark-900 px-3 py-2 text-sm outline-none ring-blue-500 focus:border-transparent focus:ring-2"
        />
      </div>
      <button
        type="button"
        class="rounded bg-white/80 px-4 py-2.5 text-sm text-dark-900 leading-none ring-blue-500 transition-all disabled:opacity-50 hover:opacity-60 active:ring-2"
        :disabled="adding || !draft.trim()"
        @click="addQuote"
      >
        {{ isTextContainingMultipleLines ? i18n('multipleQuotesAdd') : i18n('singleQuoteAdd') }}
      </button>
    </div>

    <h3 class="mb-3 text-base font-medium">
      {{ i18n('quotesYourQuotes') }}
    </h3>

    <p v-if="quotes.length === 0" class="text-sm text-dark-300">
      {{ i18n('quotesEmpty') }}
    </p>

    <ul v-else class="space-y-2">
      <li
        v-for="q in quotes"
        :key="q.id"
        class="flex items-start justify-between gap-3 rounded bg-dark-800 bg-opacity-80 px-3 py-3"
      >
        <div class="min-w-0 flex-1">
          <p class="whitespace-pre-wrap text-sm">
            {{ q.text }}
          </p>
        </div>
        <button
          type="button"
          class="shrink-0 rounded p-1.5 text-dark-300 ring-blue-500 transition-colors hover:bg-dark-500 hover:text-red-400 active:ring-2"
          :title="i18n('quotesDelete')"
          :aria-label="i18n('quotesDelete')"
          @click="removeQuote(q.id)"
        >
          <span class="i-mdi:delete-outline inline-block text-22px" />
        </button>
      </li>
    </ul>
  </div>
</template>
