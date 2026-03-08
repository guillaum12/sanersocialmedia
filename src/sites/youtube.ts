import logoSvg from 'super-tiny-icons/images/svg/youtube.svg'
import { Site, SiteAction } from '~/site'
import { UserConfigKey } from '~/types'
import { mute, waitForElement } from '~/utils'

const youtube = new Site({
  logoSvg,
  name: 'YouTube',
  validateUrl: url => url.host.replace('www.', '') === 'youtube.com',
  siteActions: [
    new SiteAction({
      name: chrome.i18n.getMessage('blockHomeFeed'),
      validateUrl: url => url.pathname === '/',
      requiredUserConfigKey: UserConfigKey.YouTubeHomeFeed,
      injectCss: `
        ytd-browse[page-subtype="home"] #primary {
          display: none!important;
        }
      `,
      manipulateDom: ({ siteAction }) => waitForElement('ytd-browse[page-subtype="home"] #primary').then((container) => {
        if (!container) {
          return
        }

        mute(container)

        const widget = siteAction.createWidget(container)
        if (!widget) {
          return
        }

        widget.style.padding = '40px'
        container.after(widget)
      }),
    }),
    new SiteAction({
      name: chrome.i18n.getMessage('blockHomeFeedShorts'),
      validateUrl: url => url.pathname === '/',
      requiredUserConfigKey: UserConfigKey.YouTubeHomeFeedShorts,
      injectCss: `
        ytd-rich-shelf-renderer[is-shorts] {
          display: none!important;
        }
        ytd-guide-entry-renderer:nth-child(2) {
          display: none!important;
        }
      `,
      manipulateDom: () => { },
    }),
    new SiteAction({
      name: chrome.i18n.getMessage('blockSidebarVideoSuggestions'),
      validateUrl: () => true,
      requiredUserConfigKey: UserConfigKey.YouTubeVideoSidebarSuggestions,
      injectCss: `
        #secondary #related {
          display: none!important;
        }
      `,
      manipulateDom: ({ siteAction }) => waitForElement('#secondary #related').then((container) => {
        if (!container) {
          return
        }

        const widget = siteAction.createWidget(container)
        if (!widget) {
          return
        }

        widget.style.paddingBottom = '40px'
        container.after(widget)
      }),
    }),
    new SiteAction({
      name: chrome.i18n.getMessage('blockVideoCommentsOnWatch'),
      validateUrl: () => true,
      requiredUserConfigKey: UserConfigKey.YouTubeVideoComments,
      injectCss: `
        #comments #contents {
          opacity: 0!important;
          height: 0px!important;
          overflow: hidden!important;
        }
      `,
      manipulateDom: ({ siteAction }) => waitForElement('#comments #contents').then((container) => {
        if (!container) {
          return
        }

        const widget = siteAction.createWidget(container)
        if (!widget) {
          return
        }

        widget.style.paddingBottom = '40px'
        container.after(widget)
      }),
    }),
    new SiteAction({
      name: chrome.i18n.getMessage('blockVideoEndRecommendations'),
      validateUrl: url => url.href.includes('/watch?v='),
      requiredUserConfigKey: UserConfigKey.YouTubeVideoEndRecommendations,
      injectCss: `
        .ytp-fullscreen-grid-main-content {
          display: none!important;
        }
      `,
      manipulateDom: () => { },
    }),
    new SiteAction({
      name: chrome.i18n.getMessage('blockShortsFeed'),
      validateUrl: url => url.pathname.includes('/shorts/'),
      requiredUserConfigKey: UserConfigKey.YouTubeShorts,
      injectCss: `
        ytd-shorts {
          opacity: 0!important;
          height: 0px!important;
          overflow: hidden!important;
        }
      `,
      manipulateDom: ({ siteAction }) => waitForElement('ytd-shorts').then((container) => {
        if (!container) {
          return
        }
        mute(container)

        const widget = siteAction.createWidget(container)
        if (!widget) {
          return
        }

        widget.style.padding = '40px'
        widget.style.width = '100%'
        container.after(widget)
      }),
    }),
    new SiteAction({
      name: chrome.i18n.getMessage('blockSubscriptionsFeed'),
      validateUrl: url => url.pathname === '/feed/subscriptions',
      requiredUserConfigKey: UserConfigKey.YouTubeSubscriptionsFeed,
      injectCss: `
        ytd-browse[page-subtype="subscriptions"] #primary {
          display: none!important;
        }
      `,
      manipulateDom: ({ siteAction }) => waitForElement('ytd-browse[page-subtype="subscriptions"] #primary').then((container) => {
        if (!container) {
          return
        }

        mute(container)

        const widget = siteAction.createWidget(container)
        if (!widget) {
          return
        }

        widget.style.padding = '40px'
        container.after(widget)
      }),
    }),
    new SiteAction({
      name: chrome.i18n.getMessage('blockSubscriptionsFeedShorts'),
      validateUrl: url => url.pathname === '/feed/subscriptions',
      requiredUserConfigKey: UserConfigKey.YouTubeSubscriptionsFeedShorts,
      injectCss: `
        ytd-rich-shelf-renderer[is-shorts] {
          display: none!important;
        }
      `,
      manipulateDom: () => { },
    }),
    new SiteAction({
      name: chrome.i18n.getMessage('blockShortsSearchResults'),
      validateUrl: url => url.pathname === '/results',
      requiredUserConfigKey: UserConfigKey.YouTubeSearchResultsShorts,
      injectCss: `
        grid-shelf-view-model {
          display: none!important;
        }
      `,
      manipulateDom: () => { },
    }),
  ],
})

export default youtube
