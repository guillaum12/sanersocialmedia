import logoSvg from 'super-tiny-icons/images/svg/tiktok.svg'
import { Site, SiteAction } from '~/site'
import { UserConfigKey } from '~/types'
import { mute, waitForElement } from '~/utils'

const tiktok = new Site({
  logoSvg,
  name: 'TikTok',
  validateUrl: url => url.host.replace('www.', '') === 'tiktok.com',
  siteActions: [
    new SiteAction({
      name: chrome.i18n.getMessage('blockHomeFeed'),
      validateUrl: url => url.pathname === '/',
      requiredUserConfigKey: UserConfigKey.TikTokHomeFeed,
      injectCss: `
        [data-e2e="recommend-list-item-container"] {
          display: none!important;
        }
      `,
      manipulateDom: ({ siteAction }) => waitForElement('[data-e2e="recommend-list-item-container"]').then(async (container) => {
        if (!container) {
          return
        }
        mute(container)
        const widget = await siteAction.createWidget(container)
        if (widget) {
          widget.style.padding = '40px'
          container.before(widget)
        }
      }),
    }),
    new SiteAction({
      name: chrome.i18n.getMessage('blockVideoComments'),
      validateUrl: url => url.pathname.includes('/video/'),
      requiredUserConfigKey: UserConfigKey.TikTokVideoComments,
      injectCss: `
        .e1vrjtg50,
        .e1395o4f9 {
          opacity: 0!important;
          height: 0px!important;
          overflow: hidden!important;
        }
      `,
      manipulateDom: ({ siteAction }) => {
        waitForElement('.e178qcw44').then(async (container) => {
          if (!container) {
            return
          }

          const widget = await siteAction.createWidget(container)
          if (!widget) {
            return
          }

          widget.style.paddingTop = '10px'
          container.after(widget)
        })
        waitForElement('.e1v8eaq60').then(async (container) => {
          if (!container) {
            return
          }

          const widget = await siteAction.createWidget(container)
          if (!widget) {
            return
          }

          widget.style.paddingTop = '10px'
          container.before(widget)
        })
      },
    }),
  ],
})

export default tiktok
