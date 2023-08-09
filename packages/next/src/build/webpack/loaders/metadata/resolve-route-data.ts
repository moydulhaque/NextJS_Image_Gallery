import type { MetadataRoute } from '../../../../lib/metadata/types/metadata-interface'
import type { Languages } from '../../../../lib/metadata/types/alternative-urls-types'
import { resolveArray } from '../../../../lib/metadata/generate/utils'

// convert robots data to txt string
export function resolveRobots(data: MetadataRoute.Robots): string {
  let content = ''
  const rules = Array.isArray(data.rules) ? data.rules : [data.rules]
  for (const rule of rules) {
    const userAgent = resolveArray(rule.userAgent || ['*'])
    for (const agent of userAgent) {
      content += `User-Agent: ${agent}\n`
    }
    if (rule.allow) {
      const allow = resolveArray(rule.allow)
      for (const item of allow) {
        content += `Allow: ${item}\n`
      }
    }
    if (rule.disallow) {
      const disallow = resolveArray(rule.disallow)
      for (const item of disallow) {
        content += `Disallow: ${item}\n`
      }
    }
    if (rule.crawlDelay) {
      content += `Crawl-delay: ${rule.crawlDelay}\n`
    }
    content += '\n'
  }
  if (data.host) {
    content += `Host: ${data.host}\n`
  }
  if (data.sitemap) {
    const sitemap = resolveArray(data.sitemap)
    // TODO-METADATA: support injecting sitemap url into robots.txt
    sitemap.forEach((item) => {
      content += `Sitemap: ${item}\n`
    })
  }

  return content
}

// TODO-METADATA: support multi sitemap files
// convert sitemap data to xml string
export function resolveSitemap(data: MetadataRoute.Sitemap): string {
  const hasAlternates = data.some(
    (item) => Object.keys(item.alternates ?? {}).length > 0
  )

  let content = ''
  content += '<?xml version="1.0" encoding="UTF-8"?>\n'
  content += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"'
  if (hasAlternates) {
    content += ' xmlns:xhtml="http://www.w3.org/1999/xhtml">\n'
  } else {
    content += '>\n'
  }
  for (const item of data) {
    content += '<url>\n'
    content += `<loc>${item.url}</loc>\n`
    if (
      item.alternates?.languages &&
      Object.keys(item.alternates.languages).length
    ) {
      for (const language in item.alternates.languages) {
        content += `<xhtml:link rel="alternate" hreflang="${language}" href="${
          item.alternates.languages[language as keyof Languages<string>]
        }" />\n`
      }
    }
    if (item.lastModified) {
      const serializedDate =
        item.lastModified instanceof Date
          ? item.lastModified.toISOString()
          : item.lastModified

      content += `<lastmod>${serializedDate}</lastmod>\n`
    }

    if (item.changeFrequency) {
      content += `<changefreq>${item.changeFrequency}</changefreq>\n`
    }

    if (typeof item.priority === 'number') {
      content += `<priority>${item.priority}</priority>\n`
    }

    content += '</url>\n'
  }

  content += '</urlset>\n'

  return content
}

export function resolveManifest(data: MetadataRoute.Manifest): string {
  return JSON.stringify(data)
}

export function resolveRouteData(
  data: MetadataRoute.Robots | MetadataRoute.Sitemap | MetadataRoute.Manifest,
  fileType: 'robots' | 'sitemap' | 'manifest'
): string {
  if (fileType === 'robots') {
    return resolveRobots(data as MetadataRoute.Robots)
  }
  if (fileType === 'sitemap') {
    return resolveSitemap(data as MetadataRoute.Sitemap)
  }
  if (fileType === 'manifest') {
    return resolveManifest(data as MetadataRoute.Manifest)
  }
  return ''
}
