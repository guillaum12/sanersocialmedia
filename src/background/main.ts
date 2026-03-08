import type { SiteAction } from '~/site'
import { atLeastOneSnoozePerSiteAction, checkSnoozed, checkSnoozedPerSiteAction, getSnoozedUntilTimestamp, getSnoozedUntilTimestampPerSiteAction, openOptionsPage, setSnoozedUntilTimestamp, setSnoozedUntilTimestampPerSiteAction } from '~/chrome'
import { sites } from '~/sites'

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    openOptionsPage()
  }
})

let snoozeInterval: NodeJS.Timeout
let snoozeIntervalAllSiteActions: NodeJS.Timeout

async function snoozeTick() {
  const now = Date.now()
  const until = await getSnoozedUntilTimestamp()
  const diff = until - now

  if (diff <= 0) {
    await setSnoozedUntilTimestamp(0)
    return
  }

  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  await chrome.action.setBadgeText({ text: minutes.toString() })
  await chrome.action.setBadgeBackgroundColor({ color: '#666666' })
  await chrome.action.setBadgeTextColor({ color: '#EEEEEE' })
}

async function setupSnoozeForSiteAction(siteAction: SiteAction) {
  const snoozed = await checkSnoozedPerSiteAction(siteAction.params.requiredUserConfigKey)
  if (!snoozed) {
    return
  }

  const until = await getSnoozedUntilTimestampPerSiteAction(siteAction.params.requiredUserConfigKey)
  const now = Date.now()
  const diff = until - now
  if (diff <= 0) {
    await setSnoozedUntilTimestampPerSiteAction(siteAction.params.requiredUserConfigKey, 0)
  }
}

async function snoozeTickAllSiteActions() {
  const siteActions = sites.flatMap(site => site.params.siteActions)
  for (const siteAction of siteActions) {
    await setupSnoozeForSiteAction(siteAction)
  }
}

async function setupSnooze() {
  clearInterval(snoozeInterval)
  const snoozed = await checkSnoozed()
  if (!snoozed) {
    await chrome.action.setBadgeText({ text: '' })
    return
  }

  await snoozeTick()
  snoozeInterval = setInterval(() => snoozeTick(), 1000)
}

async function setupAllSnoozeSiteActions() {
  clearInterval(snoozeIntervalAllSiteActions)
  const snoozed = await atLeastOneSnoozePerSiteAction()
  if (!snoozed) {
    return
  }

  await snoozeTickAllSiteActions()
  snoozeIntervalAllSiteActions = setInterval(() => snoozeTickAllSiteActions(), 1000)
}

chrome.runtime.onInstalled.addListener(() => setupSnooze())
chrome.runtime.onStartup.addListener(() => setupSnooze())
chrome.storage.onChanged.addListener(() => setupSnooze())

chrome.runtime.onInstalled.addListener(() => setupAllSnoozeSiteActions())
chrome.runtime.onStartup.addListener(() => setupAllSnoozeSiteActions())
chrome.storage.onChanged.addListener(() => setupAllSnoozeSiteActions())
