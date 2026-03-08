<script setup lang="ts">
import { onMounted, ref, shallowRef, watch } from 'vue'
import { checkSnoozedPerSiteAction, getSnoozedUntilTimestampPerSiteAction, setSnoozedUntilTimestampPerSiteAction } from '~/chrome';

import { SiteAction } from '~/site';

const props = defineProps<{
  siteAction: SiteAction
}>();

const siteActionKey = props.siteAction.params.requiredUserConfigKey
const ready = ref(false)
const snoozed = ref(false)
// chrome.storage.onChanged.addListener(async () => snoozed.value = await checkSnoozedPerSiteAction(siteActionKey))


async function init() {
  snoozed.value = await checkSnoozedPerSiteAction(siteActionKey)
  ready.value = true
}

onMounted(init)

const timer = shallowRef({ minutes: 0, seconds: 0 })
const timerInterval = shallowRef<NodeJS.Timeout>()

async function updateTimer() {
  const now = new Date()
  const until = await getSnoozedUntilTimestampPerSiteAction(siteActionKey)
  const diff = until - now.getTime()

  timer.value = {
    minutes: Math.floor(diff / 1000 / 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
}

function setupTimer() {
  clearInterval(timerInterval.value)
  if (!snoozed.value) {
    return
  }

  updateTimer()
  timerInterval.value = setInterval(() => updateTimer(), 1000)
}

watch(snoozed, setupTimer)

function withLeadingZero(value: number) {
  return value < 10 ? `0${value}` : value
}
</script>

<template>
    <button @click="props.siteAction.activateSnooze()">
      <span v-if="snoozed">Disactivated for : {{ withLeadingZero(timer.minutes) }}:{{ withLeadingZero(timer.seconds) }}</span>
      <!-- <span v-else>Snooze</span> -->
    </button>
  </template>
  