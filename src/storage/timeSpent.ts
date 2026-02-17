const TIME_SPENT_BY_DAY_KEY = 'timeSpentByDay'

export type TimeSpentByHost = Record<string, number>

/** date string (YYYY-MM-DD) -> hostname -> ms */
export type TimeSpentByDay = Record<string, TimeSpentByHost>

function getTodayDateKey(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export async function getTimeSpentByDay(): Promise<TimeSpentByDay> {
  const result = await chrome.storage.local.get([TIME_SPENT_BY_DAY_KEY])
  return (result[TIME_SPENT_BY_DAY_KEY] as TimeSpentByDay) ?? {}
}

export function setTimeSpentByDay(timeSpentByDay: TimeSpentByDay) {
  return chrome.storage.local.set({ [TIME_SPENT_BY_DAY_KEY]: timeSpentByDay })
}

/** Get time spent per host for a given date (YYYY-MM-DD). */
export async function getTimeSpentForDate(dateKey: string): Promise<TimeSpentByHost> {
  const byDay = await getTimeSpentByDay()
  return byDay[dateKey] ?? {}
}

export async function addTimeSpentForHost(hostname: string, elapsedMs: number) {
  if (elapsedMs <= 0) {
    return
  }

  const dateKey = getTodayDateKey()
  const byDay = await getTimeSpentByDay()
  const dayData = byDay[dateKey] ?? {}
  const previousValue = dayData[hostname] ?? 0
  dayData[hostname] = previousValue + elapsedMs
  byDay[dateKey] = dayData
  await setTimeSpentByDay(byDay)
}
