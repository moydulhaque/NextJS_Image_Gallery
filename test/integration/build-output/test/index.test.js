/* eslint-env jest */
/* global jasmine */
import 'flat-map-polyfill'
import { remove } from 'fs-extra'
import { nextBuild } from 'next-test-utils'
import { join } from 'path'

jasmine.DEFAULT_TIMEOUT_INTERVAL = 1000 * 60 * 2

const fixturesDir = join(__dirname, '..', 'fixtures')

describe('Build Output', () => {
  describe('Basic Application Output', () => {
    const appDir = join(fixturesDir, 'basic-app')

    beforeAll(async () => {
      await remove(join(appDir, '.next'))
    })

    it('should not include internal pages', async () => {
      const { stdout } = await nextBuild(appDir, [], {
        stdout: true,
      })

      expect(stdout).toMatch(/\/ [ ]* \d{1,} B/)
      expect(stdout).toMatch(/\+ shared by all [ 0-9]* kB/)
      expect(stdout).toMatch(/ runtime\/main\.js [ 0-9]* kB/)

      expect(stdout).not.toContain('/_document')
      expect(stdout).not.toContain('/_app')
      expect(stdout).not.toContain('/_error')

      expect(stdout).toContain('○ /')
    })
  })

  describe('Custom App Output', () => {
    const appDir = join(fixturesDir, 'with-app')

    beforeAll(async () => {
      await remove(join(appDir, '.next'))
    })

    it('should not include custom error', async () => {
      const { stdout } = await nextBuild(appDir, [], {
        stdout: true,
      })

      expect(stdout).toMatch(/\/ [ ]* \d{1,} B/)
      expect(stdout).toMatch(/\/_app [ ]* \d{1,} B/)
      expect(stdout).toMatch(/\+ shared by all [ 0-9]* kB/)
      expect(stdout).toMatch(/ runtime\/main\.js [ 0-9]* kB/)

      expect(stdout).not.toContain('/_document')
      expect(stdout).not.toContain('/_error')

      expect(stdout).toContain('/_app')
      expect(stdout).toContain('○ /')
    })
  })

  describe('Custom Error Output', () => {
    const appDir = join(fixturesDir, 'with-error')

    beforeAll(async () => {
      await remove(join(appDir, '.next'))
    })

    it('should not include custom app', async () => {
      const { stdout } = await nextBuild(appDir, [], {
        stdout: true,
      })

      expect(stdout).toMatch(/\/ [ ]* \d{1,} B/)
      expect(stdout).toMatch(/\/_error [ ]* \d{1,} B/)
      expect(stdout).toMatch(/\+ shared by all [ 0-9]* kB/)
      expect(stdout).toMatch(/ runtime\/main\.js [ 0-9]* kB/)

      expect(stdout).not.toContain('/_document')
      expect(stdout).not.toContain('/_app')

      expect(stdout).toContain('/_error')
      expect(stdout).toContain('○ /')
    })
  })
})
