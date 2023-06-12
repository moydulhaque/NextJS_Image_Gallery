const fs = require('fs/promises')
const path = require('path')
const AllThirdParties = require('third-party-capital')
const prettier = require('prettier')

const scriptStrategy = {
  server: 'beforeInteractive',
  client: 'afterInteractive',
  idle: 'lazyOnload',
  worker: 'worker',
}

;(async () => {
  let thirdPartyFunctions = `/**
  * This is an autogenerated file by update-third-parties.js
  */
  import React from 'react'
  import Script from 'next/script'

  import Base from './base'
  `

  const insertScripts = (id, scripts, stylesheets) => {
    let props = ''

    if (stylesheets?.length > 0) {
      props += ` stylesheets={${JSON.stringify(stylesheets)}}`
    }

    return scripts
      .map((script) => {
        if (typeof script === 'string') {
          // External script with only URL
          return `<Script src="${script}"${props} />`
        } else if (script.url) {
          // External script with additional properties
          const { url, strategy } = script
          return `<Script src={\`${url}\`} strategy="${scriptStrategy[strategy]}"${props} />`
        } else if (script.code) {
          // Inline script with additional properties
          const { code, strategy } = script
          return `<Script
            id="${id}"
            strategy="${scriptStrategy[strategy]}"
            dangerouslySetInnerHTML={{
              __html: \`${code}\`,
            }}${props}
          />`
        }

        return ''
      })
      .join('')
  }

  Object.keys(AllThirdParties).forEach((thirdParty) => {
    const { id, description, content, scripts, stylesheets } =
      AllThirdParties[thirdParty]

    thirdPartyFunctions += `
    // ${description}
    export function ${thirdParty}(args: any) {
      return (
        <Base
          ${content ? 'height={args.height || null}' : ''}
          ${content ? 'width={args.width || null}' : ''}
          ${content ? `content={\`${content}\`}` : ''}>
          ${scripts?.length > 0 ? insertScripts(id, scripts, stylesheets) : ''}
          </Base>
      )
    }
    `
  })

  await Promise.all([
    fs.writeFile(
      path.join(__dirname, './src/index.tsx'),
      prettier.format(thirdPartyFunctions, { semi: false, parser: 'babel' })
    ),
  ])
})()
