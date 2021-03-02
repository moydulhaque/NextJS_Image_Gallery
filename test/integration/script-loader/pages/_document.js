import * as React from 'react'
/// @ts-ignore
import Document, { Main, NextScript, Head } from 'next/document'
import Script from 'next/experimental-script'

export default class MyDocument extends Document {
  constructor(props) {
    super(props)
    const { __NEXT_DATA__, ids } = props
    if (ids) {
      __NEXT_DATA__.ids = ids
    }
  }

  render() {
    return (
      <html>
        <Head>
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css?family=Voces"
          />
          <Script
            id="documentDefer"
            src="https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.20/lodash.min.js?a=documentDefer"
            strategy="defer"
          ></Script>
          <Script
            id="documentLazy"
            src="https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.20/lodash.min.js?a=documentLazy"
            strategy="lazy"
          ></Script>
          <Script
            id="documentBlock"
            src="https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.20/lodash.min.js?a=documentBlock"
            strategy="dangerouslyBlockRendering"
          ></Script>
          <Script
            id="documentEager"
            src="https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.20/lodash.min.js?a=documentEager"
            strategy="eager"
          ></Script>
        </Head>
        <body>
          <Main />
          <NextScript />
          <div id="text"></div>
        </body>
      </html>
    )
  }
}
