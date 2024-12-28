import { nextTestSetup } from 'e2e-utils'
import type * as Playwright from 'playwright'

describe('segment cache (incremental opt in)', () => {
  const { next, isNextDev, skipped } = nextTestSetup({
    files: __dirname,
    skipDeployment: true,
  })
  if (isNextDev || skipped) {
    test('ppr is disabled', () => {})
    return
  }

  async function testPrefetchDeduping(linkHref) {
    // This e2e test app is designed to verify that if you prefetch a link
    // multiple times, the prefetches are deduped by the client cache
    // (unless/until they become stale). It works by toggling the visibility of
    // the links and checking whether any prefetch requests are issued.
    //
    // Throughout the duration of the test, we collect all the prefetch requests
    // that occur. Then at the end we confirm there are no duplicates.
    const prefetches = new Map()
    const duplicatePrefetches = new Map()

    let act
    const browser = await next.browser('/', {
      async beforePageLoad(page: Playwright.Page) {
        act = createRouterAct(page)
        await page.route('**/*', async (route: Playwright.Route) => {
          const request = route.request()
          const isPrefetch =
            request.headerValue('rsc') !== null &&
            request.headerValue('next-router-prefetch') !== null
          if (isPrefetch) {
            const request = route.request()
            const headers = await request.allHeaders()
            const prefetchInfo = {
              href: new URL(request.url()).pathname,
              segment: headers['Next-Router-Segment-Prefetch'.toLowerCase()],
              base: headers['Next-Router-State-Tree'.toLowerCase()] ?? null,
            }
            const key = JSON.stringify(prefetchInfo)
            if (prefetches.has(key)) {
              duplicatePrefetches.set(key, prefetchInfo)
            } else {
              prefetches.set(key, prefetchInfo)
            }
          }
          route.continue()
        })
      },
    })

    // Each link on the test page has a checkbox that controls its visibility.
    // It starts off as hidden.
    const checkbox = await browser.elementByCss(
      `input[data-link-accordion="${linkHref}"]`
    )
    // Confirm the checkbox is not checked
    expect(await checkbox.isChecked()).toBe(false)

    // Click the checkbox to reveal the link and trigger a prefetch
    await act(async () => {
      await checkbox.click()
      await browser.elementByCss(`a[href="${linkHref}"]`)
    })

    // Toggle the visibility of the link. Prefetches are initiated on viewport,
    // so if the cache does not dedupe then properly, this test will detect it.
    await checkbox.click() // hide
    await checkbox.click() // show
    const link = await browser.elementByCss(`a[href="${linkHref}"]`)

    // Navigate to the target link
    await link.click()

    // Confirm the navigation happened
    await browser.elementById('page-content')
    expect(new URL(await browser.url()).pathname).toBe(linkHref)

    // Finally, assert there were no duplicate prefetches
    expect(prefetches.size).not.toBe(0)
    expect(duplicatePrefetches.size).toBe(0)
  }

  describe('multiple prefetches to same link are deduped', () => {
    it('page with PPR enabled', () => testPrefetchDeduping('/ppr-enabled'))
    it('page with PPR enabled, and has a dynamic param', () =>
      testPrefetchDeduping('/ppr-enabled/dynamic-param'))
    it('page with PPR disabled', () => testPrefetchDeduping('/ppr-disabled'))
    it('page with PPR disabled, and has a loading boundary', () =>
      testPrefetchDeduping('/ppr-disabled-with-loading-boundary'))
  })

  it(
    'prefetches a shared layout on a PPR-enabled route that was previously ' +
      'omitted from a non-PPR-enabled route',
    async () => {
      let act
      const browser = await next.browser('/mixed-fetch-strategies', {
        beforePageLoad(p: Playwright.Page) {
          act = createRouterAct(p)
        },
      })

      // Initiate a prefetch for the PPR-disabled route first. This will not
      // include the /shared-layout/ segment, because it's inside the
      // loading boundary.
      await act(async () => {
        const checkbox = await browser.elementById('ppr-disabled')
        await checkbox.click()
      })

      // Then initiate a prefetch for the PPR-enabled route. This prefetch
      // should include the /shared-layout/ segment despite the presence of
      // the loading boundary, and despite the earlier non-PPR attempt
      await act(async () => {
        const checkbox = await browser.elementById('ppr-enabled')
        await checkbox.click()
      })

      // Navigate to the PPR-enabled route
      await act(async () => {
        const link = await browser.elementByCss('#ppr-enabled + a')
        await link.click()

        // If we prefetched all the segments correctly, we should be able to
        // reveal the page's loading state, before the server responds.
        await browser.elementById('page-loading-boundary')
      })
    }
  )

  it(
    'when a link is prefetched with <Link prefetch=true>, no dynamic request ' +
      'is made on navigation',
    async () => {
      let act
      const browser = await next.browser('/mixed-fetch-strategies', {
        beforePageLoad(p: Playwright.Page) {
          act = createRouterAct(p)
        },
      })

      await act(
        async () => {
          const checkbox = await browser.elementById(
            'ppr-enabled-prefetch-true'
          )
          await checkbox.click()
        },
        {
          includes: 'Dynamic page content',
        }
      )

      // Navigate to fully prefetched route
      const link = await browser.elementByCss('#ppr-enabled-prefetch-true + a')
      await act(
        async () => {
          await link.click()

          // We should be able to fully load the page content, including the
          // dynamic data, before the server responds.
          await browser.elementById('page-content')
        },
        {
          // Assert that no network requests are initiated within this block.
          cached: true,
        }
      )
    }
  )

  it(
    'when prefetching with prefetch=true, refetches cache entries that only ' +
      'contain partial data',
    async () => {
      let act
      const browser = await next.browser('/mixed-fetch-strategies', {
        beforePageLoad(p: Playwright.Page) {
          act = createRouterAct(p)
        },
      })

      // Prefetch a link with PPR
      await act(
        async () => {
          const checkbox = await browser.elementById('ppr-enabled')
          await checkbox.click()
        },
        { includes: 'Loading (PPR shell of shared-layout)...' }
      )

      // Prefetch the same link again, this time with prefetch=true to include
      // the dynamic data
      await act(
        async () => {
          const checkbox = await browser.elementById(
            'ppr-enabled-prefetch-true'
          )
          await checkbox.click()
        },
        {
          includes: 'Dynamic content in shared layout',
        }
      )

      // Navigate to the PPR-enabled route
      const link = await browser.elementByCss('#ppr-enabled-prefetch-true + a')
      await act(
        async () => {
          await link.click()

          // If we prefetched all the segments correctly, we should be able to
          // fully load the page content, including the dynamic data, before the
          // server responds.
          //
          // If this fails, it like means that the partial cache entry that
          // resulted from prefetching the normal link (<Link prefetch={false}>)
          // was not properly re-fetched when the full link (<Link
          // prefetch={true}>) was prefetched.
          await browser.elementById('page-content')
        },
        {
          // Assert that no network requests are initiated within this block.
          cached: true,
        }
      )
    }
  )

  it(
    'when prefetching with prefetch=true, refetches partial cache entries ' +
      "even if there's already a pending PPR request",
    async () => {
      // This test is hard to describe succinctly because it involves a fairly
      // complex race condition between a non-PPR prefetch, a PPR prefetch, and
      // a "full" prefetch. However, I don't think it's that unlikely to happen
      // in real world conditions.

      let act
      const browser = await next.browser('/mixed-fetch-strategies', {
        beforePageLoad(p: Playwright.Page) {
          act = createRouterAct(p)
        },
      })

      // Initiate a prefetch for the PPR-disabled route first. This will not
      // include the /shared-layout/ segment, because it's inside the
      // loading boundary.
      await act(
        async () => {
          const checkbox = await browser.elementById('ppr-disabled')
          await checkbox.click()
        },
        { includes: 'Loading (has-loading-boundary/loading.tsx)...' }
      )

      // Then initiate a prefetch for the PPR-enabled route.
      await act(async () => {
        // Create an inner act scope so we initate a prefetch but block it
        // from responding.
        await act(
          async () => {
            const checkbox = await browser.elementById('ppr-enabled')
            await checkbox.click()
          },
          // This prefetch should include the /shared-layout/ segment despite the
          // presence of the loading boundary, and despite the earlier non-PPR
          // attempt.
          //
          // We're going to block it from responding, so we can test what happens
          // if another prefetch is initiated in the meantime.
          { block: 'Loading (PPR shell of shared-layout)...' }
        )

        // Before the previous prefetch finishes, prefetch the same link again,
        // this time with prefetch=true to include the dynamic data.
        await act(
          async () => {
            const checkbox = await browser.elementById(
              'ppr-enabled-prefetch-true'
            )
            await checkbox.click()
          },
          // This prefetch should load the dynamic data in the shared layout
          {
            includes: 'Dynamic content in shared layout',
          }
        )
      })

      // Navigate to the PPR-enabled route.
      await act(
        async () => {
          const link = await browser.elementByCss(
            '#ppr-enabled-prefetch-true + a'
          )
          await link.click()

          // If we prefetched all the segments correctly, we should be able to
          // fully load the page content, including the dynamic data, before the
          // server responds.
          //
          // If this fails, it like means that the pending cache entry that
          // resulted from prefetching the normal link (<Link prefetch={false}>)
          // was not properly re-fetched when the full link (<Link
          // prefetch={true}>) was prefetched.
          await browser.elementById('page-content')
        },
        {
          // Assert that no network requests are initiated within this block.
          cached: true,
        }
      )
    }
  )
})

function createRouterAct(page: Playwright.Page) {
  type Batch = {
    pending: Set<PendingRSCRequest>
  }

  type PendingRSCRequest = {
    route: Playwright.Route
    cached: { body: string; headers: Record<string, string> } | null
  }

  let currentBatch: Batch | null = null

  /**
   * Test utility for requests initiated by the Next.js Router, such as
   * prefetches and navigations. Calls the given async function then intercepts
   * any router requests that are initiated as a result. It will then wait for
   * all the requests to complete before exiting. Inspired by the React
   * `act` API.
   */
  async function act(
    scope: () => Promise<void> | void,
    options?: {
      /**
       * Asserts that a response containing the given string is received.
       */
      includes?: string
      /**
       * Same as `includes`, but it also blocks the response from finishing.
       * Only supported when nested inside an outer `act` scope.
       */
      block?: string
      /**
       * Asserts that no router requests are initiated within the scope.
       */
      cached?: boolean
      /**
       * Number of milliseconds to wait for the first request to be initiated
       * before timing out (unless `cached` is set to true). Default is 1000ms.
       */
      timeout?: number
    }
  ) {
    // Capture a stack trace for better async error messages.
    const error = new Error()
    if (Error.captureStackTrace) {
      Error.captureStackTrace(error, act)
    }

    const includes = options?.includes ?? null
    // When `includes` is set, this tracks whether the expected string was
    // found in any of the responses.
    let didReceiveExpectedResponse = false

    // If `cached` is true, error if any router requests are initiated.
    const errorIfAnyRequests = options?.cached ?? false

    const block = options?.block ?? null
    if (block !== null && currentBatch === null) {
      error.message =
        '`block` option only supported when nested inside an outer `act` scope.'
      throw error
    }

    // Set a timer to error if no requests are initiated within a certain time.
    // Default is 500ms.
    const timeout = options?.timeout ?? 500

    // Attach a route handler to intercept router requests for the duration
    // of the `act` scope. It will be removed before `act` exits.
    let onDidIssueFirstRequest = null
    let pendingRequestChecks: Set<Promise<void>> = new Set()
    const routeHandler = async (route: Playwright.Route) => {
      const request = route.request()

      // Because reading the headers is an async operation, we collect these
      // promises so we can await them at the end of the `act` scope to see
      // whether any additional requests were initiated.
      const checkIfRouterRequest = request
        .headerValue('rsc')
        .then((isRouterRequest) => {
          if (isRouterRequest) {
            // This request was initiated by the Next.js Router. Intercept it and
            // add it to the current batch.
            batch.pending.add({
              route,
              cached: null,
            })
            if (onDidIssueFirstRequest !== null) {
              onDidIssueFirstRequest()
              onDidIssueFirstRequest = null
            }
            return
          }
          // This is some other request not related to the Next.js Router. Allow
          // it to continue as normal.
          route.continue()
        })

      pendingRequestChecks.add(checkIfRouterRequest)
      await checkIfRouterRequest
      // Once we've read the header, we can remove it from the pending set.
      pendingRequestChecks.delete(checkIfRouterRequest)
    }

    const prevBatch = currentBatch
    const batch: Batch = {
      pending: new Set(),
    }
    currentBatch = batch
    await page.route('**/*', routeHandler)
    try {
      // Call the user-provided scope function
      const returnValue = await scope()

      // Wait until the first request is initiated, up to some timeout.
      if (batch.pending.size === 0 && !errorIfAnyRequests) {
        await new Promise<void>((resolve, reject) => {
          const timerId = setTimeout(() => {
            error.message = 'Timed out waiting for a request to be initiated.'
            reject(error)
          }, timeout)
          onDidIssueFirstRequest = () => {
            clearTimeout(timerId)
            resolve()
          }
        })
      }

      // Fulfill all the requests that were initiated by the scope function.
      // Because responding to one request may unblock additional requests,
      // keep checking for more requests until the queue has settled.
      const remaining = new Set<PendingRSCRequest>()
      while (batch.pending.size > 0) {
        const pending = batch.pending
        batch.pending = new Set()
        for (const item of pending) {
          const route = item.route
          const request = route.request()
          let fulfilled
          if (item.cached !== null) {
            // This response was already processed by an inner `act` call.
            fulfilled = item.cached
          } else {
            if (errorIfAnyRequests) {
              error.message = 'Expected no network requests to be initiated.'
              throw error
            }
            const originalResponse = await page.request.fetch(request)
            fulfilled = {
              body: await originalResponse.text(),
              headers: originalResponse.headers(),
            }
            item.cached = fulfilled
          }
          if (
            includes !== null &&
            !didReceiveExpectedResponse &&
            fulfilled.body.includes(includes)
          ) {
            didReceiveExpectedResponse = true
          }
          if (block !== null && fulfilled.body.includes(block)) {
            // This response was blocked by the `block` option. Don't fulfill
            // it yet.
            remaining.add(item)
          } else {
            await route.fulfill(fulfilled)
            const browserResponse = await request.response()
            await browserResponse.finished()
          }
        }

        // After flushing the queue, wait for the microtask queue to be
        // exhausted, then check if any additional requests are initiated. A
        // microtask should be enough because if the router queue is network
        // throttled, the next request is issued within a microtask of the
        // previous one finishing.
        await page.evaluate(() => Promise.resolve())
        const prevChecks = pendingRequestChecks
        pendingRequestChecks = new Set()
        await Promise.all(prevChecks)
      }

      if (includes !== null && !didReceiveExpectedResponse) {
        error.message =
          'Expected a response containing the given string:\n\n' + includes
        throw error
      }

      if (block !== null) {
        // Some of the requests were blocked. Transfer them to the outer `act`
        // batch so it can flush them.
        if (remaining.size === 0) {
          error.message =
            'Expected a response containing the given string:\n\n' + block
          throw error
        }
        if (prevBatch !== null) {
          for (const item of remaining) {
            prevBatch.pending.add(item)
          }
        }
      }

      return returnValue
    } finally {
      // Clean up
      currentBatch = prevBatch
      await page.unroute('**/*', routeHandler)
    }
  }

  return act
}
