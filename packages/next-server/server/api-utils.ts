import { IncomingMessage, IncomingHttpHeaders, OutgoingMessage } from 'http'
import { parse as parseCookie } from 'cookie'
import { NextApiResponse } from '../lib/utils'
import { Stream } from 'stream'

/**
 * Parse cookies from request header
 * @param cookie from headers
 */
export function parseCookies({ cookie }: IncomingHttpHeaders) {
  // If there is no cookie return empty object
  if (!cookie) {
    return {}
  }

  return parseCookie(cookie)
}

/**
 * Parsing query arguments from request `url` string
 * @param url of request
 * @returns Object with key name of query argument and its value
 */
export function parseQuery({ url, headers }: IncomingMessage) {
  if (url) {
    const params = new URL(`${headers.host}${url}`).searchParams

    return reduceParams(params.entries())
  } else {
    return {}
  }
}

/**
 * Send `any` body to response
 * @param res response object
 * @param statusCode `HTTP` status code of response
 * @param body of response
 */
export function sendData(res: NextApiResponse, statusCode: number, body: any) {
  res.statusCode = statusCode

  if (body === null) {
    res.end()
    return
  }

  const contentType = res.getHeader('Content-Type')

  if (Buffer.isBuffer(body)) {
    if (!contentType) {
      res.setHeader('Content-Type', 'application/octet-stream')
    }
    res.setHeader('Content-Length', body.length)
    res.end(body)
    return
  }

  if (body instanceof Stream) {
    if (!contentType) {
      res.setHeader('Content-Type', 'application/octet-stream')
    }
    body.pipe(res)
    return
  }

  let str = body

  // Stringyfy json body
  if (typeof body === 'object' || typeof body === 'number') {
    str = JSON.stringify(body)
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
  }

  res.setHeader('Content-Length', Buffer.byteLength(str))
  res.end(str)
}

/**
 * Send `JSON` object
 * @param res response object
 * @param statusCode `HTTP` status code of response
 * @param jsonBody of data
 */
export function sendJson(
  res: NextApiResponse,
  statusCode: number,
  jsonBody: any,
): void {
  // Set header to application/json
  res.setHeader('Content-Type', 'application/json; charset=utf-8')

  // Use send to handle request
  res.send(statusCode, jsonBody)
}

function reduceParams(params: IterableIterator<[string, string]>) {
  const obj: any = {}
  for (const [key, value] of params) {
    obj[key] = value
  }
  return obj
}
