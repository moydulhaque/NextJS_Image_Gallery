/* eslint-env jest */

import webdriver from 'next-webdriver'

import cheerio from 'cheerio'
import {
  fetchViaHTTP,
  renderViaHTTP,
  findPort,
  killApp,
  launchApp,
  nextBuild,
  nextStart,
  File,
} from 'next-test-utils'
import { join } from 'path'
import webpack from 'webpack'

jest.setTimeout(1000 * 60 * 2)

const isWebpack5 = parseInt(webpack.version) === 5
let app
let appPort
const appDir = join(__dirname, '../')
const nextConfig = new File(join(appDir, 'next.config.js'))

function runTests() {
  it('ssr async page modules', async () => {
    const html = await renderViaHTTP(appPort, '/')
    const $ = cheerio.load(html)
    expect($('#app-value').text()).toBe('hello')
    expect($('#page-value').text()).toBe('42')
  })

  it('csr async page modules', async () => {
    let browser
    try {
      browser = await webdriver(appPort, '/')
      expect(await browser.elementByCss('#app-value').text()).toBe('hello')
      expect(await browser.elementByCss('#page-value').text()).toBe('42')
    } finally {
      if (browser) await browser.close()
    }
  })

  it('works on api routes', async () => {
    const res = await fetchViaHTTP(appPort, '/api/hello')
    expect(res.status).toBe(200)
    const result = await res.json()
    expect(result).toHaveProperty('value', 42)
  })
}

describe('Async modules', () => {
  if (!isWebpack5) {
    return
  }

  describe('dev mode', () => {
    beforeAll(async () => {
      appPort = await findPort()
      app = await launchApp(appDir, appPort)
    })
    afterAll(async () => {
      await killApp(app)
    })

    runTests()
  })

  describe('production mode', () => {
    beforeAll(async () => {
      await nextBuild(appDir)
      appPort = await findPort()
      app = await nextStart(appDir, appPort)
    })
    afterAll(async () => {
      await killApp(app)
    })

    runTests()
  })

  describe.skip('serverless mode', () => {
    beforeAll(async () => {
      nextConfig.replace(`// target:`, 'target:')
      await nextBuild(appDir)
      appPort = await findPort()
      app = await nextStart(appDir, appPort)
    })
    afterAll(async () => {
      await nextConfig.restore()
      await killApp(app)
    })

    runTests()
  })
})
