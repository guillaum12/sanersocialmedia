<script setup lang="ts">
import type { SiteAction } from '~/site'
import type { UserConfig } from '~/types'
import { onMounted, onUnmounted, ref } from 'vue'
import logo from '~/assets/logo.svg'
import { getStore, setUserConfig, toggleSiteAction } from '~/chrome'
import { sites } from '~/sites'
import QuotesScreen from './QuotesScreen.vue'
import SnoozeButton from './SnoozeButton.vue'

const chromeWebStoreLink = 'https://chromewebstore.google.com/detail/saner-social-media-feed-b/opnoobcmpioggidgaejfkbopdphbfkkk'
const githubLink = 'https://github.com/tobiasdalhof/sanersocialmedia'

const userConfig = ref<UserConfig>()
async function getUserConfig() {
  const store = await getStore()
  userConfig.value = store.userConfig
}

const ready = ref(false)
onMounted(async () => {
  chrome.storage.onChanged.addListener(getUserConfig)
  await getUserConfig()
  ready.value = true
})

onUnmounted(() => {
  chrome.storage.onChanged.removeListener(getUserConfig)
})

function isSiteEnabled(siteAction: SiteAction): boolean {
  if (!userConfig.value) {
    return false
  }
  return userConfig.value[siteAction.params.requiredUserConfigKey] === true
}

async function enableAllSiteActions() {
  const config: UserConfig = {}

  sites.forEach((site) => {
    site.params.siteActions.forEach((siteAction) => {
      config[siteAction.params.requiredUserConfigKey] = true
    })
  })

  await setUserConfig({ ...userConfig.value, ...config })
}

async function disableAllSiteActions() {
  const config: UserConfig = {}

  for (const site of Object.values(sites)) {
    site.params.siteActions.forEach((siteAction) => {
      config[siteAction.params.requiredUserConfigKey] = false
    })
  }

  await setUserConfig({ ...userConfig.value, ...config })
}

function i18n(key: string): string {
  return chrome.i18n.getMessage(key)
}

const showQuotesScreen = ref(false)
</script>

<template>
  <div v-if="ready" class="select-none">
    <div class="mb-6 bg-black bg-opacity-50">
      <div class="container mx-auto max-w-4xl flex items-center justify-between px-4 py-3.5 leading-none">
        <div class="flex items-center">
          <img :src="logo" alt="Saner Social Media" class="mr-4 h-32px rounded-full">
          <div class="font-semibold">
            Saner Social Media
          </div>
        </div>
        <div class="space-x-6">
          <a
            :href="chromeWebStoreLink"
            class="inline-flex items-center"
            target="_blank"
          >
            <span class="i-mdi:google-chrome inline-block text-24px" />
            <span class="ml-2">{{ i18n('rateUs') }}</span>
          </a>
          <a
            :href="githubLink"
            class="inline-flex items-center"
            target="_blank"
          >
            <span class="i-mdi:github inline-block text-24px" />
            <span class="ml-2">{{ i18n('sourceCode') }}</span>
          </a>
        </div>
      </div>
    </div>

    <QuotesScreen v-if="showQuotesScreen" @close="showQuotesScreen = false" />

    <div v-else class="container mx-auto max-w-4xl px-4">
      <div class="my-8">
        <button
          type="button"
          class="w-1/2 rounded bg-dark-800 px-4 py-2.5 text-sm leading-none ring-blue-500 transition-all hover:bg-dark-500 active:ring-2"
          @click="showQuotesScreen = true"
        >
          <span>{{ i18n('quotesParameters') }}</span>
        </button>
      </div>

      <div class="mb-2 flex border-dark-200 space-x-2">
        <button
          class="w-full rounded bg-dark-800 px-4 py-2.5 text-sm leading-none ring-blue-500 transition-all hover:bg-dark-500 active:ring-2"
          @click.prevent="enableAllSiteActions()"
        >
          <span>{{ i18n('enableAll') }}</span>
        </button>
        <button
          class="w-full rounded bg-dark-800 px-4 py-2.5 text-sm leading-none ring-blue-500 transition-all hover:bg-dark-500 active:ring-2"
          @click.prevent="disableAllSiteActions()"
        >
          <span>{{ i18n('disableAll') }}</span>
        </button>
      </div>

      <div class="mb-8">
        <div v-for="(site, siteIndex) in sites" :key="`site-${siteIndex}`">
          <div
            v-for="(siteAction, siteActionIndex) in site.params.siteActions"
            :key="`site-action-${siteActionIndex}`"
            class="mb-2 flex cursor-pointer items-center justify-between rounded bg-dark-800 bg-opacity-80 px-3 py-2 leading-none ring-blue-500 transition-all hover:bg-dark-500 active:ring-2"
            :class="{
              'opacity-40': !isSiteEnabled(siteAction),
            }"
            @click="toggleSiteAction(siteAction)"
          >
            <div class="flex items-center">
              <div
                class="mr-4 h-7 w-7 rounded-full bg-center"
                :style="{ backgroundImage: `url(${site.params.logoSvg})` }"
              />
              <div>{{ site.params.name }}</div>
              <div class="i-mdi:chevron-right mx-1 text-24px" />
              <div>{{ siteAction.params.name }}</div>
            </div>
            <div class="ml-4 flex items-center gap-2">
              <SnoozeButton :site-action="siteAction" />
              <div v-if="isSiteEnabled(siteAction)" class="i-mdi:check text-28px text-green-500" />
              <div v-else class="i-mdi:close text-28px text-red-500" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
