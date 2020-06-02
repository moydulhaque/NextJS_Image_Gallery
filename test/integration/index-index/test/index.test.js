/* eslint-env jest */

import cheerio from 'cheerio'
import fs from 'fs-extra'
import {
  fetchViaHTTP,
  findPort,
  killApp,
  launchApp,
  nextBuild,
  nextStart,
  renderViaHTTP,
} from 'next-test-utils'
import webdriver from 'next-webdriver'
import { join } from 'path'

jest.setTimeout(1000 * 60 * 2)

let app
let appPort
const appDir = join(__dirname, '../')

function runTests() {
  it('should ssr page /', async () => {
    const html = await renderViaHTTP(appPort, '/')
    const $ = cheerio.load(html)
    expect($('#page').text()).toBe('index')
  })

  it('should client render page /', async () => {
    const browser = await webdriver(appPort, '/')
    try {
      const text = await browser.elementByCss('#page').text()
      expect(text).toBe('index')
    } finally {
      await browser.close()
    }
  })

  it('should ssr page /index', async () => {
    const html = await renderViaHTTP(appPort, '/index')
    const $ = cheerio.load(html)
    expect($('#page').text()).toBe('index > index')
  })

  it('should client render page /index', async () => {
    const browser = await webdriver(appPort, '/index')
    try {
      const text = await browser.elementByCss('#page').text()
      expect(text).toBe('index > index')
    } finally {
      await browser.close()
    }
  })

  it('should ssr page /index/index', async () => {
    const html = await renderViaHTTP(appPort, '/index/index')
    const $ = cheerio.load(html)
    expect($('#page').text()).toBe('index > index > index')
  })

  it('should client render page /index/index', async () => {
    const browser = await webdriver(appPort, '/index/index')
    try {
      const text = await browser.elementByCss('#page').text()
      expect(text).toBe('index > index > index')
    } finally {
      await browser.close()
    }
  })

  it('should 404 on /index/index/index', async () => {
    const response = await fetchViaHTTP(appPort, '/index/index/index')
    expect(response.status).toBe(404)
  })
}

const nextConfig = join(appDir, 'next.config.js')

describe('Dynamic Optional Routing', () => {
  describe('dev mode', () => {
    beforeAll(async () => {
      appPort = await findPort()
      app = await launchApp(appDir, appPort)
    })
    afterAll(() => killApp(app))

    runTests()
  })

  describe('production mode', () => {
    beforeAll(async () => {
      const curConfig = await fs.readFile(nextConfig, 'utf8')

      if (curConfig.includes('target')) {
        await fs.writeFile(
          nextConfig,
          `module.exports = { experimental: { optionalCatchAll: true } }`
        )
      }
      await nextBuild(appDir)

      appPort = await findPort()
      app = await nextStart(appDir, appPort)
    })
    afterAll(() => killApp(app))

    runTests()
  })

  describe('serverless mode', () => {
    let origNextConfig

    beforeAll(async () => {
      origNextConfig = await fs.readFile(nextConfig, 'utf8')
      await fs.writeFile(
        nextConfig,
        `module.exports = { target: 'serverless', experimental: { optionalCatchAll: true } }`
      )

      await nextBuild(appDir)

      appPort = await findPort()
      app = await nextStart(appDir, appPort)
    })
    afterAll(async () => {
      await fs.writeFile(nextConfig, origNextConfig)
      await killApp(app)
    })
    runTests()
  })
})
