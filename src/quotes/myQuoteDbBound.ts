import type { Quote, Store, UserQuote } from '~/types'
import { getStore } from '~/chrome'

class MyQuoteDbBound {
  async insert(quote: Quote): Promise<UserQuote> {
    const store = await getStore()
    const existing = store.customQuotes ?? []
    const userQuote: UserQuote = {
      ...quote,
      id: crypto.randomUUID(),
    }
    const customQuotes = [...existing, userQuote]
    await chrome.storage.sync.set(<Store>{
      ...store,
      customQuotes,
    })
    return userQuote
  }

  async deleteById(id: string): Promise<void> {
    const store = await getStore()
    const existing = store.customQuotes ?? []
    const customQuotes = existing.filter(q => q.id !== id)
    if (customQuotes.length === existing.length) {
      return
    }
    await chrome.storage.sync.set(<Store>{
      ...store,
      customQuotes,
    })
  }

  async getAll(): Promise<UserQuote[]> {
    const store = await getStore()
    return store.customQuotes ?? []
  }
}

export const myQuoteDbBound = new MyQuoteDbBound()
