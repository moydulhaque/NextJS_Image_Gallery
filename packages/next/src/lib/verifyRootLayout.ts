import path from 'path'
import { promises as fs } from 'fs'
import chalk from 'next/dist/compiled/chalk'
import { APP_DIR_ALIAS } from './constants'

const globOrig =
  require('next/dist/compiled/glob') as typeof import('next/dist/compiled/glob')
const glob = (cwd: string, pattern: string): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    globOrig(pattern, { cwd }, (err, files) => {
      if (err) {
        return reject(err)
      }
      resolve(files)
    })
  })
}

function getRootLayout(isTs: boolean) {
  if (isTs) {
    return `export const metadata = {
  title: 'Next.js',
  description: 'Generated by Next.js',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
`
  }

  return `export const metadata = {
  title: 'Next.js',
  description: 'Generated by Next.js',
}

export default function RootLayout({ children }) {
 return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
`
}

export async function verifyRootLayout({
  dir,
  appDir,
  tsconfigPath,
  pagePath,
  pageExtensions,
}: {
  dir: string
  appDir: string
  tsconfigPath: string
  pagePath: string
  pageExtensions: string[]
}): Promise<[boolean, string | undefined]> {
  let rootLayoutPath: string | undefined
  try {
    const layoutFiles = await glob(
      appDir,
      `**/layout.{${pageExtensions.join(',')}}`
    )
    const isFileUnderAppDir = pagePath.startsWith(`${APP_DIR_ALIAS}/`)
    const normalizedPagePath = pagePath.replace(`${APP_DIR_ALIAS}/`, '')
    const pagePathSegments = normalizedPagePath.split('/')

    // Find an available dir to place the layout file in, the layout file can't affect any other layout.
    // Place the layout as close to app/ as possible.
    let availableDir: string | undefined

    if (isFileUnderAppDir) {
      if (layoutFiles.length === 0) {
        // If there's no other layout file we can place the layout file in the app dir.
        // However, if the page is within a route group directly under app (e.g. app/(routegroup)/page.js)
        // prefer creating the root layout in that route group.
        const firstSegmentValue = pagePathSegments[0]
        availableDir = firstSegmentValue.startsWith('(')
          ? firstSegmentValue
          : ''
      } else {
        pagePathSegments.pop() // remove the page from segments

        let currentSegments: string[] = []
        for (const segment of pagePathSegments) {
          currentSegments.push(segment)
          // Find the dir closest to app/ where a layout can be created without affecting other layouts.
          if (
            !layoutFiles.some((file) =>
              file.startsWith(currentSegments.join('/'))
            )
          ) {
            availableDir = currentSegments.join('/')
            break
          }
        }
      }
    } else {
      availableDir = ''
    }

    if (typeof availableDir === 'string') {
      const resolvedTsConfigPath = path.join(dir, tsconfigPath)
      const hasTsConfig = await fs.access(resolvedTsConfigPath).then(
        () => true,
        () => false
      )

      rootLayoutPath = path.join(
        appDir,
        availableDir,
        `layout.${hasTsConfig ? 'tsx' : 'js'}`
      )
      await fs.writeFile(rootLayoutPath, getRootLayout(hasTsConfig))

      console.log(
        chalk.green(
          `\nYour page ${chalk.bold(
            `app/${normalizedPagePath}`
          )} did not have a root layout. We created ${chalk.bold(
            `app${rootLayoutPath.replace(appDir, '')}`
          )} for you.`
        ) + '\n'
      )

      // Created root layout
      return [true, rootLayoutPath]
    }
  } catch (e) {
    console.error(e)
  }

  // Didn't create root layout
  return [false, rootLayoutPath]
}
