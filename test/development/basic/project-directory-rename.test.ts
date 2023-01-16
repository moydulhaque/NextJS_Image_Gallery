import fs from 'fs-extra'
import webdriver from 'next-webdriver'
import { check, findPort, hasRedbox } from 'next-test-utils'
import { NextInstance } from 'test/lib/next-modes/base'
import { createNext } from 'e2e-utils'

describe('Project Directory Renaming', () => {
  let next: NextInstance

  beforeAll(async () => {
    next = await createNext({
      files: {
        'pages/index.js': `
          export default function Page() {
            return <p>hello world</p>
          }
        `,
      },
      skipStart: true,
    })
    next.forcedPort = (await findPort()) + ''
    await next.start()
  })
  afterAll(() => next.destroy())

  it('should detect project dir rename and restart', async () => {
    const browser = await webdriver(next.url, '/')
    await browser.eval('window.beforeNav = 1')

    let newTestDir = `${next.testDir}-renamed`
    await fs.remove(newTestDir)
    await fs.move(next.testDir, newTestDir)

    next.testDir = newTestDir

    await check(
      () => next.cliOutput,
      /Detected project directory rename, restarting in new location/
    )
    await check(async () => {
      return (await browser.eval('window.beforeNav')) === 1 ? 'pending' : 'done'
    }, 'done')
    expect(await hasRedbox(browser, false)).toBe(false)

    try {
      // should still HMR correctly
      await next.patchFile(
        'pages/index.js',
        (
          await next.readFile('pages/index.js')
        ).replace('hello world', 'hello again')
      )
      await check(async () => {
        if (!(await browser.eval('!!window.next'))) {
          await browser.refresh()
        }
        return browser.eval('document.documentElement.innerHTML')
      }, /hello again/)
    } finally {
      await next.patchFile(
        'pages/index.js',
        (
          await next.readFile('pages/index.js')
        ).replace('hello again', 'hello world')
      )
    }
  })

  it.skip('should detect project removal and exit gracefully', async () => {
    await fs.remove(next.testDir)
    await check(
      () => next.cliOutput,
      /Project directory could not be found, restart Next\.js in your new directory/
    )
  })
})
