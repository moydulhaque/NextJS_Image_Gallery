/* globals __webpack_hash__ */
import { displayContent } from './fouc'
import initOnDemandEntries from './on-demand-entries-client'
import { addMessageListener, connectHMR } from './error-overlay/websocket'

declare global {
  const __webpack_runtime_id__: string
}

const data = JSON.parse(
  (document.getElementById('__NEXT_DATA__') as any).textContent
)
window.__NEXT_DATA__ = data

let { assetPrefix, page } = data
assetPrefix = assetPrefix || ''
let mostRecentHash: null | string = null
/* eslint-disable-next-line */
let curHash = __webpack_hash__
const hotUpdatePath =
  assetPrefix + (assetPrefix.endsWith('/') ? '' : '/') + '_next/static/webpack/'

// Is there a newer version of this code available?
function isUpdateAvailable() {
  // __webpack_hash__ is the hash of the current compilation.
  // It's a global variable injected by Webpack.
  /* eslint-disable-next-line */
  return mostRecentHash !== __webpack_hash__
}

// Webpack disallows updates in other states.
function canApplyUpdates() {
  // @ts-expect-error TODO: module.hot exists but type needs to be added. Can't use `as any` here as webpack parses for `module.hot` calls.
  return module.hot.status() === 'idle'
}

// This function reads code updates on the fly and hard
// reloads the page when it has changed.
async function tryApplyUpdates() {
  if (!isUpdateAvailable() || !canApplyUpdates()) {
    return
  }
  try {
    const res = await fetch(
      typeof __webpack_runtime_id__ !== 'undefined'
        ? // eslint-disable-next-line no-undef
          `${hotUpdatePath}${curHash}.${__webpack_runtime_id__}.hot-update.json`
        : `${hotUpdatePath}${curHash}.hot-update.json`
    )
    const jsonData = await res.json()
    const curPage = page === '/' ? 'index' : page
    // webpack 5 uses an array instead
    const pageUpdated = (
      Array.isArray(jsonData.c) ? jsonData.c : Object.keys(jsonData.c)
    ).some((mod: string) => {
      return (
        mod.includes(
          `pages${curPage.startsWith('/') ? curPage : `/${curPage}`}`
        ) ||
        mod.includes(
          `pages${curPage.startsWith('/') ? curPage : `/${curPage}`}`.replace(
            /\//g,
            '\\'
          )
        )
      )
    })

    if (pageUpdated) {
      window.location.reload()
    } else {
      curHash = mostRecentHash as string
    }
  } catch (err) {
    console.error('Error occurred checking for update', err)
    window.location.reload()
  }
}

addMessageListener((event) => {
  if (event.data === '\uD83D\uDC93') {
    return
  }

  try {
    const message = JSON.parse(event.data)

    if (message.action === 'sync' || message.action === 'built') {
      if (!message.hash) {
        return
      }
      mostRecentHash = message.hash
      tryApplyUpdates()
    } else if (message.action === 'reloadPage') {
      window.location.reload()
    }
  } catch (ex) {
    console.warn('Invalid HMR message: ' + event.data + '\n' + ex)
  }
})

connectHMR({
  assetPrefix,
  path: '/_next/webpack-hmr',
})
displayContent()

initOnDemandEntries(data.page)
