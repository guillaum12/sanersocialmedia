import type { UserConfig, UserConfigKey } from './types'
import { checkSnoozed, checkSnoozedPerSiteAction, getSnoozeMinutes, setSnoozedUntilTimestampPerSiteAction } from './chrome'
import { getRandomQuote } from './quotes/getRandomQuote'
import { hasDarkBackground } from './utils'

interface SiteParams {
  name: string
  logoSvg: string
  validateUrl: (url: URL) => boolean
  siteActions: SiteAction[]
}

export class Site {
  public params: SiteParams

  constructor(params: SiteParams) {
    this.params = params
  }

  isValidUrl(url: URL): boolean {
    return this.params.validateUrl(url)
  }

  async runSiteActions(url: URL, userConfig: UserConfig) {
    for (const siteAction of this.params.siteActions) {
      siteAction.setUserConfig(userConfig)
      const snoozed = await checkSnoozed()
      const snoozedPerSiteAction = await checkSnoozedPerSiteAction(siteAction.params.requiredUserConfigKey)
      if (snoozed || snoozedPerSiteAction || !siteAction.canRun(url)) {
        siteAction.removeInjectedElements()
        continue
      }

      siteAction.injectCss()
      siteAction.manipulateDom()
    }
  }
}

interface SiteActionParams {
  name: string
  validateUrl: (url: URL) => boolean
  requiredUserConfigKey: UserConfigKey
  injectCss: string
  manipulateDom: (params: { siteAction: SiteAction }) => void
}

export class SiteAction {
  public params: SiteActionParams
  private id: string
  private readonly idDataAttribute = 'data-site-action-id'
  private userConfig?: UserConfig

  constructor(params: SiteActionParams) {
    this.params = params
    this.id = globalThis.btoa(params.name)
  }

  setUserConfig(userConfig?: UserConfig) {
    this.userConfig = userConfig
  }

  canRun(url: URL): boolean {
    if (!this.userConfig) {
      return false
    }

    if (!this.userConfig[this.params.requiredUserConfigKey]) {
      return false
    }

    return this.params.validateUrl(url)
  }

  injectCss(): HTMLStyleElement {
    const foundStyle = <HTMLStyleElement>document.querySelector(`style[${this.idDataAttribute}="${this.id}"]`)
    if (foundStyle) {
      return foundStyle
    }

    const style = document.createElement('style')
    style.appendChild(document.createTextNode(this.params.injectCss))
    style.setAttribute(this.idDataAttribute, this.id)
    document.querySelector('head')!.appendChild(style)

    return style
  }

  manipulateDom() {
    return this.params.manipulateDom({ siteAction: this })
  }

  removeInjectedElements() {
    const elements = document.querySelectorAll(`[${this.idDataAttribute}="${this.id}"]`)
    elements.forEach(element => element.remove())
  }

  findWidget(parent: HTMLElement): HTMLElement | null {
    if (parent.parentElement) {
      return parent.parentElement.querySelector(`[${this.idDataAttribute}="${this.id}"][data-sanersocialmedia-widget]`)
    }

    return null
  }

  async createWidget(parent: HTMLElement): Promise<HTMLElement | undefined> {
    const foundWidget = this.findWidget(parent)
    if (foundWidget) {
      // widget already exists
      return undefined
    }

    const randomQuote = await getRandomQuote()
    const widget = document.createElement('div')
    widget.setAttribute(this.idDataAttribute, this.id)
    widget.setAttribute('data-sanersocialmedia-widget', '')
    if (hasDarkBackground(parent)) {
      widget.setAttribute('data-is-dark', '')
    }
    else {
      widget.setAttribute('data-is-light', '')
    }

    const quote = document.createElement('div')
    quote.setAttribute('data-quote', '')

    const quoteText = document.createElement('div')
    quoteText.setAttribute('data-quote-text', '')
    quoteText.textContent = randomQuote.text

    const quoteAuthor = document.createElement('div')
    quoteAuthor.setAttribute('data-quote-author', '')
    quoteAuthor.textContent = `— ${randomQuote.author}`

    const numberOfClickToUnhide = 7
    const attributeClickLeft = 'number-of-clicks-left'

    quote.setAttribute(attributeClickLeft, numberOfClickToUnhide.toString())

    quote.addEventListener('click', async () => {
      const numberOfClickLeft = Number.parseInt(quote.getAttribute(attributeClickLeft)!)

      if (numberOfClickLeft) {
        quote.setAttribute(attributeClickLeft, (numberOfClickLeft - 1).toString())
      }
      else {
        quote.setAttribute(attributeClickLeft, numberOfClickToUnhide.toString())
        await this.activateSnooze()
      }
    })

    quote.appendChild(quoteText)
    quote.appendChild(quoteAuthor)
    widget.appendChild(quote)

    return widget
  }

  async activateSnooze() {
    const numberOfMinutes = await getSnoozeMinutes()
    const ms = numberOfMinutes * 60 * 1000
    const now = new Date()
    const timestamp = now.getTime() + ms
    await setSnoozedUntilTimestampPerSiteAction(this.params.requiredUserConfigKey, timestamp)
  }
}

export function getSiteByUrl(sites: Site[], url: URL) {
  return sites.find(site => site.isValidUrl(url))
}
