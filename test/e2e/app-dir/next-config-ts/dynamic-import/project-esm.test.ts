import { nextTestSetup } from 'e2e-utils'

// TODO: Remove skip on CI if we bump the min Node.js version.
;(process.env.CI ? describe.skip : describe)(
  'next-config-ts - dynamic import (project ESM)',
  () => {
    const { next } = nextTestSetup({
      files: __dirname,
      packageJson: {
        type: 'module',
      },
    })

    it('should support dynamic import (project ESM)', async () => {
      const $ = await next.render$('/')
      expect($('p').text()).toBe('foo')
    })
  }
)
