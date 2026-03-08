import type { SiteAction } from './site'
import type { Store, UserConfig, UserConfigKey } from './types'

export function openOptionsPage() {
  return chrome.runtime.openOptionsPage()
}

export async function getStore() {
  return await chrome.storage.sync.get() as Store
}

export async function setUserConfig(userConfig: UserConfig) {
  const store = await getStore()
  await chrome.storage.sync.set(<Store>{
    ...store,
    userConfig,
  })
}

export async function toggleSiteAction(siteAction: SiteAction) {
  await toggleUserConfigKey(siteAction.params.requiredUserConfigKey)
}

export async function toggleUserConfigKey(key: UserConfigKey) {
  const store = await getStore()
  let value: boolean
  if (!store.userConfig) {
    value = true
  }
  else if (store.userConfig[key] === undefined) {
    value = true
  }
  else {
    value = !store.userConfig[key]
  }
  const userConfig: UserConfig = { ...store.userConfig, [key]: value }
  await setUserConfig(userConfig)

  // Reset snoozedUntilTimestamp for this site action if the site action is disabled back
  if (!value) {
    await setSnoozedUntilTimestampPerSiteAction(key, 0)
  }
}

export async function getSnoozeMinutes() {
  const result = await chrome.storage.sync.get(['snoozeMinutes'])
  return (result.snoozeMinutes as number) ?? 5
}

export function setSnoozeMinutes(minutes: number) {
  return chrome.storage.sync.set({ snoozeMinutes: minutes })
}

export async function getSnoozedUntilTimestamp() {
  const result = await chrome.storage.sync.get(['snoozedUntilTimestamp'])
  return (result.snoozedUntilTimestamp as number) ?? 0
}

export async function getSnoozedUntilTimestampPerSiteAction(key: UserConfigKey) {
  let result = await chrome.storage.sync.get(['snoozedUntil'])
  if (!result.snoozedUntil) {
    await chrome.storage.sync.set({ snoozedUntil: {} })
    result = await chrome.storage.sync.get(['snoozedUntil'])
  }
  const snoozedUntil = result.snoozedUntil as Record<UserConfigKey, number>

  return snoozedUntil[key as UserConfigKey] ?? 0
}

export async function atLeastOneSnoozePerSiteAction(): Promise<boolean> {
  const result = await chrome.storage.sync.get(['snoozedUntil'])

  if (!result.snoozedUntil) {
    return false
  }

  const snoozedUntil = result.snoozedUntil as Record<UserConfigKey, number>

  return Object.values(snoozedUntil).some(value => value !== 0)
}

export function setSnoozedUntilTimestamp(timestamp: number) {
  return chrome.storage.sync.set({ snoozedUntilTimestamp: timestamp })
}

export async function setSnoozedUntilTimestampPerSiteAction(key: UserConfigKey, timestamp: number) {
  const result = await chrome.storage.sync.get(['snoozedUntil'])
  const snoozedUntil = result.snoozedUntil as Record<UserConfigKey, number>
  snoozedUntil[key] = timestamp
  return chrome.storage.sync.set({ snoozedUntil })
}

export async function checkSnoozedPerSiteAction(key: UserConfigKey) {
  const until = await getSnoozedUntilTimestampPerSiteAction(key)
  const now = Date.now()
  return until > now
}

export async function checkSnoozed() {
  const until = await getSnoozedUntilTimestamp()
  const now = Date.now()
  return until > now
}
