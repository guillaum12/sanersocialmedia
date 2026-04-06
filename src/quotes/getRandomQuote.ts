import type { Quote } from '~/types'
import { getStore } from '~/chrome'
import { quotes as builtInQuotes } from './quotes'

function quoteFromUserQuote(q: { text: string, author?: string }): Quote {
  return { text: q.text, author: 'You' }
}

export async function getRandomQuote(): Promise<Quote> {
  const store = await getStore()
  const useBuiltIns = store.useDefaultQuotes !== false
  const custom = (store.customQuotes ?? []).map(quoteFromUserQuote)

  let pool: Quote[]
  if (useBuiltIns) {
    pool = [...builtInQuotes, ...custom]
  }
  else {
    pool = custom.length > 0 ? custom : builtInQuotes
  }

  return pool[Math.floor(Math.random() * pool.length)]
}
