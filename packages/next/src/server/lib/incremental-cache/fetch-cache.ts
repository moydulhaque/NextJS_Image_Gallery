import LRUCache from 'next/dist/compiled/lru-cache'
import { FETCH_CACHE_HEADER } from '../../../client/components/app-router-headers'
import type { CacheHandler, CacheHandlerContext, CacheHandlerValue } from './'

let memoryCache: LRUCache<string, CacheHandlerValue> | undefined

export default class FetchCache implements CacheHandler {
  private headers: Record<string, string>
  private cacheEndpoint: string
  private debug: boolean

  constructor(ctx: CacheHandlerContext) {
    if (ctx.maxMemoryCacheSize && !memoryCache) {
      memoryCache = new LRUCache({
        max: ctx.maxMemoryCacheSize,
        length({ value }) {
          if (!value) {
            return 25
          } else if (value.kind === 'REDIRECT') {
            return JSON.stringify(value.props).length
          } else if (value.kind === 'IMAGE') {
            throw new Error('invariant image should not be incremental-cache')
          } else if (value.kind === 'FETCH') {
            return JSON.stringify(value.data || '').length
          } else if (value.kind === 'ROUTE') {
            return value.body.length
          }
          // rough estimate of size of cache value
          return (
            value.html.length + (JSON.stringify(value.pageData)?.length || 0)
          )
        },
      })
    }
    this.debug = !!process.env.NEXT_PRIVATE_DEBUG_CACHE
    this.headers = {}
    this.headers['Content-Type'] = 'application/json'

    if (FETCH_CACHE_HEADER in ctx._requestHeaders) {
      const newHeaders = JSON.parse(
        ctx._requestHeaders[FETCH_CACHE_HEADER] as string
      )
      for (const k in newHeaders) {
        this.headers[k] = newHeaders[k]
      }
    }
    this.cacheEndpoint = `https://${ctx._requestHeaders['x-vercel-sc-host']}${
      ctx._requestHeaders['x-vercel-sc-basepath'] || ''
    }`
    if (this.debug) {
      console.log('using cache endpoint', this.cacheEndpoint)
    }
  }

  public async get(key: string, fetchCache?: boolean) {
    if (!fetchCache) return null

    let data = memoryCache?.get(key)

    // get data from fetch cache
    if (!data) {
      try {
        const start = Date.now()
        const res = await fetch(
          `${this.cacheEndpoint}/v1/suspense-cache/${key}`,
          {
            method: 'GET',
            headers: this.headers,
          }
        )

        if (!res.ok) {
          console.error(await res.text())
          throw new Error(`invalid response from cache ${res.status}`)
        }

        const cached = await res.json()

        if (!cached || cached.kind !== 'FETCH') {
          this.debug && console.log({ cached })
          throw new Error(`invalid cache value`)
        }

        const cacheState = res.headers.get('x-vercel-cache-state')
        const age = res.headers.get('age')

        data = {
          age: age === null ? undefined : parseInt(age, 10),
          cacheState: cacheState || undefined,
          value: cached,
        }
        if (this.debug) {
          console.log(
            `got fetch cache entry for ${key}, duration: ${
              Date.now() - start
            }ms, size: ${Object.keys(cached).length}`
          )
        }

        if (data) {
          memoryCache?.set(key, data)
        }
      } catch (err) {
        // unable to get data from fetch-cache
        console.error(`Failed to get from fetch-cache`, err)
      }
    }
    return data || null
  }

  public async set(
    key: string,
    data: CacheHandlerValue['value'],
    fetchCache?: boolean
  ) {
    if (!fetchCache) return

    memoryCache?.set(key, {
      value: data,
      lastModified: Date.now(),
    })

    try {
      const start = Date.now()
      if (data !== null && 'revalidate' in data) {
        this.headers['x-vercel-revalidate'] = data.revalidate.toString()
      }
      if (data !== null && 'data' in data) {
        this.headers['x-vercel-cache-control'] =
          data.data.headers['cache-control']
      }
      const body = JSON.stringify(data)
      const res = await fetch(
        `${this.cacheEndpoint}/v1/suspense-cache/${key}`,
        {
          method: 'POST',
          headers: this.headers,
          body: body,
        }
      )

      if (!res.ok) {
        this.debug && console.log(await res.text())
        throw new Error(`invalid response ${res.status}`)
      }

      if (this.debug) {
        console.log(
          `successfully set to fetch-cache for ${key}, duration: ${
            Date.now() - start
          }ms, size: ${body.length}`
        )
      }
    } catch (err) {
      // unable to set to fetch-cache
      console.error(`Failed to update fetch cache`, err)
    }
    return
  }
}
