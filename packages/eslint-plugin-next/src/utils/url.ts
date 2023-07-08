import * as path from 'path'
import * as fs from 'fs'
import { normalizeAppPath } from '../../../next/src/shared/lib/router/utils/app-paths'

// Cache for fs.lstatSync lookup.
// Prevent multiple blocking IO requests that have already been calculated.
const fsLstatSyncCache = {}
const fsLstatSync = (source) => {
  fsLstatSyncCache[source] = fsLstatSyncCache[source] || fs.lstatSync(source)
  return fsLstatSyncCache[source]
}

/**
 * Checks if the source is a directory.
 */
function isDirectory(source: string) {
  return fsLstatSync(source).isDirectory()
}

/**
 * Checks if the source is a directory.
 */
function isSymlink(source: string) {
  return fsLstatSync(source).isSymbolicLink()
}

// Cache for fs.readdirSync lookup.
// Prevent multiple blocking IO requests that have already been calculated.
const fsReadDirSyncCache = {}

/**
 * Recursively parse directory for page URLs.
 */
function parseUrlForPages(urlprefix: string, directory: string) {
  fsReadDirSyncCache[directory] =
    fsReadDirSyncCache[directory] || fs.readdirSync(directory)
  const res = []
  fsReadDirSyncCache[directory].forEach((fname) => {
    // TODO: this should account for all page extensions
    // not just js(x) and ts(x)
    if (/(\.(j|t)sx?)$/.test(fname)) {
      if (/^index(\.(j|t)sx?)$/.test(fname)) {
        res.push(`${urlprefix}${fname.replace(/^index(\.(j|t)sx?)$/, '')}`)
      }
      res.push(`${urlprefix}${fname.replace(/(\.(j|t)sx?)$/, '')}`)
    } else {
      const dirPath = path.join(directory, fname)
      if (isDirectory(dirPath) && !isSymlink(dirPath)) {
        res.push(...parseUrlForPages(urlprefix + fname + '/', dirPath))
      }
    }
  })
  return res
}

/**
 * Recursively parse app directory for URLs.
 */
function parseUrlForAppDir(urlprefix: string, directory: string) {
  fsReadDirSyncCache[directory] =
    fsReadDirSyncCache[directory] || fs.readdirSync(directory)
  const res = []
  fsReadDirSyncCache[directory].forEach((fname) => {
    // TODO: this should account for all page extensions
    // not just js(x) and ts(x)
    if (/(\.(j|t)sx?)$/.test(fname)) {
      if (/^page(\.(j|t)sx?)$/.test(fname)) {
        res.push(`${urlprefix}${fname.replace(/^page(\.(j|t)sx?)$/, '')}`)
      } else if (!/^layout(\.(j|t)sx?)$/.test(fname)) {
        res.push(`${urlprefix}${fname.replace(/(\.(j|t)sx?)$/, '')}`)
      }
    } else {
      const dirPath = path.join(directory, fname)
      if (isDirectory(dirPath) && !isSymlink(dirPath)) {
        res.push(...parseUrlForPages(urlprefix + fname + '/', dirPath))
      }
    }
  })
  return res.map((route) => normalizeAppPath(route))
}

/**
 * Takes a URL and does the following things.
 *  - Replaces `index.html` with `/`
 *  - Makes sure all URLs are have a trailing `/`
 *  - Removes query string
 */
export function normalizeURL(url: string) {
  if (!url) {
    return
  }
  url = url.split('?')[0]
  url = url.split('#')[0]
  url = url = url.replace(/(\/index\.html)$/, '/')
  // Empty URLs should not be trailed with `/`, e.g. `#heading`
  if (url === '') {
    return url
  }
  url = url.endsWith('/') ? url : url + '/'
  return url
}

/**
 * Gets the possible URLs from a directory.
 */
export function getUrlFromPagesDirectories(
  urlPrefix: string,
  directories: string[]
) {
  return Array.from(
    // De-duplicate similar pages across multiple directories.
    new Set(
      directories
        .map((directory) => parseUrlForPages(urlPrefix, directory))
        .flat()
        .map(
          // Since the URLs are normalized we add `^` and `$` to the RegExp to make sure they match exactly.
          (url) => `^${normalizeURL(url)}$`
        )
    )
  ).map((urlReg) => {
    urlReg = urlReg.replace(/\[.*\]/g, '((?!.+?\\..+?).*?)')
    return new RegExp(urlReg)
  })
}

export function getUrlFromAppDirectory(
  urlPrefix: string,
  directories: string[]
) {
  return Array.from(
    // De-duplicate similar pages across multiple directories.
    new Set(
      directories
        .map((directory) => parseUrlForAppDir(urlPrefix, directory))
        .flat()
        .map(
          // Since the URLs are normalized we add `^` and `$` to the RegExp to make sure they match exactly.
          (url) => `^${normalizeURL(url)}$`
        )
    )
  ).map((urlReg) => {
    urlReg = urlReg.replace(/\[.*\]/g, '((?!.+?\\..+?).*?)')
    return new RegExp(urlReg)
  })
}

export function execOnce<TArgs extends any[], TResult extends unknown>(
  fn: (...args: TArgs) => TResult
): (...args: TArgs) => TResult {
  let used = false
  let result: TResult

  return (...args: TArgs) => {
    if (!used) {
      used = true
      result = fn(...args)
    }
    return result
  }
}
