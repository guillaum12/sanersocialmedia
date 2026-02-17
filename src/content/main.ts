import type { Store } from '~/types'
import { addTimeSpentForHost } from '~/storage/timeSpent'
import { getSiteByUrl } from '~/site'
import * as sites from '~/sites'
import { onRouteChange } from '~/utils'
import './styles.css'

function getNormalizedHostname(url: URL) {
  return url.hostname.replace(/^www\./, '')
}

let trackingHostname = getNormalizedHostname(new URL(window.location.href))
let trackingStartedAt: number | undefined

function startTracking() {
  if (trackingStartedAt !== undefined) {
    return
  }

  trackingStartedAt = Date.now()
}

async function stopTracking() {
  if (trackingStartedAt === undefined) {
    return
  }

  const elapsedMs = Date.now() - trackingStartedAt
  trackingStartedAt = undefined
  await addTimeSpentForHost(trackingHostname, elapsedMs)
}

function syncTrackingHostname() {
  const nextHostname = getNormalizedHostname(new URL(window.location.href))
  if (nextHostname === trackingHostname) {
    return
  }

  void stopTracking()
  trackingHostname = nextHostname
  if (document.visibilityState === 'visible') {
    startTracking()
  }
}

function setupTimeTracking() {
  if (document.visibilityState === 'visible') {
    startTracking()
  }

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      startTracking()
      return
    }
    void stopTracking()
  })

  window.addEventListener('pagehide', () => void stopTracking())
  window.addEventListener('beforeunload', () => void stopTracking())
}

let waitInit = false
async function init(url: URL) {
  if (waitInit) {
    return
  }

  waitInit = true
  const site = getSiteByUrl(Object.values(sites), url)
  if (!site) {
    return
  }

  const store = await chrome.storage.sync.get() as Store
  if (!store.userConfig) {
    return
  }

  await site.runSiteActions(url, store.userConfig)
  waitInit = false
}

init(new URL(window.location.href))
if (window.top === window.self) {
  setupTimeTracking()
}
setInterval(() => {
  if (window.top === window.self) {
    syncTrackingHostname()
  }
  init(new URL(window.location.href))
}, 1000)
onRouteChange(() => {
  if (window.top === window.self) {
    syncTrackingHostname()
  }
  init(new URL(window.location.href))
})
chrome.storage.onChanged.addListener(() => init(new URL(window.location.href)))
