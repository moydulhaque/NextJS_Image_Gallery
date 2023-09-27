import { useState, useEffect, useCallback } from 'react'
import { loadScript } from 'next/script'

declare global {
  interface Window {
    dataLayer: Object[] | undefined
  }
}

type GTMParams = {
  id: string
  dataLayer: string[]
  dataLayerName: string
  auth: string
  preview: string
}

export default function useGoogleTagManager() {
  const [initParams, setInitParams] = useState<GTMParams>()
  const init = useCallback(
    (params: GTMParams) => {
      if (initParams === undefined) {
        setInitParams(params)
      }
    },
    [initParams]
  )

  const sendData = useCallback(
    (data: Object) => {
      if (initParams === undefined) {
        console.warn('GTM has not been initialized yet.')
        return
      }

      const { dataLayerName = 'dataLayer' } = initParams
      if (window[dataLayerName]) {
        window[dataLayerName].push(data)
      } else {
        console.warn(`dataLayer ${dataLayerName} does not exist`)
      }
    },
    [initParams]
  )

  useEffect(() => {
    if (initParams !== undefined) {
      const {
        id,
        dataLayerName = 'dataLayer',
        auth,
        preview,
        dataLayer,
      } = initParams

      const gtmLayer =
        dataLayerName !== 'dataLayer' ? `$l=${dataLayerName}` : ''
      const gtmAuth = auth ? `&gtm_auth=${auth}` : ''
      const gtmPreview = preview
        ? `&gtm_preview=${preview}&gtm_cookies_win=x`
        : ''

      loadScript({
        id: '_next-gtm',
        dangerouslySetInnerHTML: {
          __html: `
        (function(w,l){
          w[l]=w[l]||[];
          w[l].push({'gtm.start': new Date().getTime(),event:'gtm.js'});
          ${dataLayer ? `w[l].push(${JSON.stringify(dataLayer)})` : ''}
        })(window,'${dataLayerName}');`,
        },
      })
      loadScript({
        src: `https://www.googletagmanager.com/gtm.js?id=${id}${gtmLayer}${gtmAuth}${gtmPreview}`,
      })
    }
  }, [initParams])

  return { init, sendData }
}
