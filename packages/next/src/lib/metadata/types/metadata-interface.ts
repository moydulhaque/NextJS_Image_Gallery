import type {
  AlternateURLs,
  ResolvedAlternateURLs,
} from './alternative-urls-types'
import type {
  AppleWebApp,
  AppLinks,
  FormatDetection,
  ItunesApp,
  ResolvedAppleWebApp,
  ResolvedAppLinks,
  Viewport,
} from './extra-types'
import type {
  AbsoluteTemplateString,
  Author,
  ColorSchemeEnum,
  Icon,
  Icons,
  IconURL,
  ReferrerEnum,
  ResolvedIcons,
  ResolvedVerification,
  Robots,
  ResolvedRobots,
  TemplateString,
  Verification,
} from './metadata-types'
import type { OpenGraph, ResolvedOpenGraph } from './opengraph-types'
import type { ResolvedTwitterMetadata, Twitter } from './twitter-types'

/**
 * Metadata interface to describe all the metadata fields that can be set in a document.
 * @interface
 */
interface Metadata {
  /**
   * The base path and origin for absolute urls for various metadata links such as OpenGraph images.
   * @type {null | URL}
   */
  metadataBase?: null | URL

  /**
   * The document title.
   * @type {null | string | TemplateString}
   * @example
   * "My Blog"
   * <title>My Blog</title>
   *
   * { default: "Dashboard", template: "%s | My Website" }
   * <title>Dashboard | My Website</title>
   *
   * { absolute: "My Blog", template: "%s | My Website" }
   * <title>My Blog</title>
   *
   */
  title?: null | string | TemplateString

  /**
   * The document description, and optionally the OpenGraph and twitter descriptions.
   * @type {null | string}
   * @example
   * "My Blog Description"
   * <meta name="description" content="My Blog Description" />
   */
  description?: null | string

  // Standard metadata names
  // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta/name

  /**
   * The application name.
   * @type {null | string}
   * @example
   * "My Blog"
   * <meta name="application-name" content="My Blog" />
   */
  applicationName?: null | string

  /**
   * The authors of the document.
   * @type {null | Author | Array<Author>}
   * @example
   * [{ name: "Next.js Team", url: "https://nextjs.org" }]
   * <meta name="author" content="Next.js Team" />
   * <link rel="author" href="https://nextjs.org" />
   *
   */
  authors?: null | Author | Array<Author>

  /**
   * The generator used for the document.
   * @type {null | string}
   * @example
   * "Next.js"
   * <meta name="generator" content="Next.js" />
   *
   */
  generator?: null | string

  /**
   * The keywords for the document. If an array is provided, it will be flattened into a single tag with comma separation.
   * @type {null | string | Array<string>}
   * @example
   * "nextjs, react, blog"
   * <meta name="keywords" content="nextjs, react, blog" />
   *
   * ["react", "server components"]
   * <meta name="keywords" content="react, server components" />
   *
   */
  keywords?: null | string | Array<string>

  /**
   * The referrer setting for the document.
   * @type {null | ReferrerEnum}
   * @example
   * "origin"
   * <meta name="referrer" content="origin" />
   *
   */
  referrer?: null | ReferrerEnum

  /**
   * The theme color for the document.
   * @type {null | string}
   * @example
   * "#000000"
   * <meta name="theme-color" content="#000000" />
   *
   */
  themeColor?: null | string

  /**
   * The color scheme for the document.
   * @type {null | ColorSchemeEnum}
   * @example
   * "dark"
   * <meta name="color-scheme" content="dark" />
   */
  colorScheme?: null | ColorSchemeEnum

  /**
   * The viewport setting for the document.
   * @type {null | string | Viewport}
   * @example
   * "width=device-width, initial-scale=1"
   * <meta name="viewport" content="width=device-width, initial-scale=1" />
   *
   * { width: "device-width", initialScale: 1 }
   * <meta name="viewport" content="width=device-width, initial-scale=1" />
   *
   */
  viewport?: null | string | Viewport

  /**
   * The creator of the document.
   * @type {null | string}
   * @example
   * "Next.js Team"
   * <meta name="creator" content="Next.js Team" />
   *
   */
  creator?: null | string

  /**
   * The publisher of the document.
   * @type {null | string}
   * @example
   * "Vercel"
   * <meta name="publisher" content="Vercel" />
   *
   */
  publisher?: null | string

  // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta/name#other_metadata_names

  /**
   * The robots setting for the document.
   * @type {null | string | Robots}
   * @example
   * "index, follow"
   * <meta name="robots" content="index, follow" />
   *
   * { index: false, follow: false }
   * <meta name="robots" content="noindex, nofollow" />
   *
   */
  robots?: null | string | Robots

  /**
   * The canonical and alternate URLs for the document.
   * @type {null | AlternateURLs}
   * @example
   * { canonical: "https://example.com" }
   * <link rel="canonical" href="https://example.com" />
   *
   * { canonical: "https://example.com", hreflang: { "en-US": "https://example.com/en-US" } }
   * <link rel="canonical" href="https://example.com" />
   * <link rel="alternate" href="https://example.com/en-US" hreflang="en-US" />
   *
   */
  alternates?: null | AlternateURLs

  /**
   * The icons for the document. Defaults to rel="icon".
   * @type {null | IconURL | Array<Icon> | Icons}
   * @example
   * "https://example.com/icon.png"
   * <link rel="icon" href="https://example.com/icon.png" />
   *
   * { icon: "https://example.com/icon.png", appleIcon: "https://example.com/apple-icon.png" }
   * <link rel="icon" href="https://example.com/icon.png" />
   * <link rel="apple-touch-icon" href="https://example.com/apple-icon.png" />
   *
   * [{ rel: "icon", href: "https://example.com/icon.png" }, { rel: "apple-touch-icon", href: "https://example.com/apple-icon.png" }]
   * <link rel="icon" href="https://example.com/icon.png" />
   * <link rel="apple-touch-icon" href="https://example.com/apple-icon.png" />
   *
   */
  icons?: null | IconURL | Array<Icon> | Icons

  /**
   * The manifest.json file is the only file that every extension using WebExtension APIs must contain
   *
   * @type {null | string | URL}
   * @example
   * "https://example.com/manifest.json"
   * <link rel="manifest" href="https://example.com/manifest.json" />
   *
   */
  manifest?: null | string | URL

  /**
   * @example
   * {
   *   type: "website",
   *   url: "https://example.com",
   *   siteName: "My Website",
   *   title: "My Website",
   *   images: [{
   *     url: "https://example.com/og.png",
   *   }],
   * }
   *
   */
  openGraph?: null | OpenGraph

  /**
   * The Twitter metadata for the document.
   * @type {null | Twitter}
   * @example
   * { card: "summary_large_image", site: "@site", creator: "@creator", "images": "https://example.com/og.png" }
   *
   * <meta name="twitter:card" content="summary_large_image" />
   * <meta name="twitter:site" content="@site" />
   * <meta name="twitter:creator" content="@creator" />
   * <meta name="twitter:title" content="My Website" />
   * <meta name="twitter:description" content="My Website Description" />
   * <meta name="twitter:image" content="https://example.com/og.png" />
   *
   */
  twitter?: null | Twitter

  /**
   * The common verification tokens for the document.
   * @type {Verification}
   * @example
   * { verification: { google: "google-site-verification=1234567890", yandex: "1234567890", "me": "1234567890" } }
   * <meta name="google-site-verification" content="1234567890" />
   * <meta name="yandex-verification" content="1234567890" />
   * <meta name="me" content="@me" />
   *
   */
  verification?: Verification

  /**
   * The Apple web app metadata for the document.
   * https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariHTMLRef/Articles/MetaTags.html
   * @type {null | boolean | AppleWebApp}
   * @example
   * { capable: true, title: "My Website", statusBarStyle: "black-translucent" }
   * <meta name="apple-mobile-web-app-capable" content="yes" />
   * <meta name="apple-mobile-web-app-title" content="My Website" />
   * <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
   *
   */
  appleWebApp?: null | boolean | AppleWebApp

  /**
   * Indicates if devices should try to interpret various formats and make actionable links out of them. For example it controles
   * if telephone numbers on mobile that can be clicked to dial or not.
   * @type {null | FormatDetection}
   * @example
   * { telephone: false }
   * <meta name="format-detection" content="telephone=no" />
   *
   */
  formatDetection?: null | FormatDetection

  /**
   * The metadata for the iTunes App.
   * It adds the `name="apple-itunes-app"` meta tag.
   * @type {null | ItunesApp}
   * @example
   * { app: { id: "123456789", affiliateData: "123456789", appArguments: "123456789" } }
   * <meta name="apple-itunes-app" content="app-id=123456789, affiliate-data=123456789, app-arguments=123456789" />
   *
   */
  itunes?: null | ItunesApp

  /**
   * A brief description of what this web-page is about. Not recommended, superseded by description.
   * It adds the `name="abstract"` meta tag.
   * https://www.metatags.org/all-meta-tags-overview/meta-name-abstract/
   * @type {null | string}
   * @example
   * "My Website Description"
   * <meta name="abstract" content="My Website Description" />
   *
   */
  abstract?: null | string

  /**
   * The Facebook AppLinks metadata for the document.
   * @type {null | AppLinks}
   * @example
   * { ios: { appStoreId: "123456789", url: "https://example.com" }, android: { packageName: "com.example", url: "https://example.com" } }
   *
   * <meta property="al:ios:app_store_id" content="123456789" />
   * <meta property="al:ios:url" content="https://example.com" />
   * <meta property="al:android:package" content="com.example" />
   * <meta property="al:android:url" content="https://example.com" />
   *
   */
  appLinks?: null | AppLinks

  /**
   * The archives link rel property.
   * @type {null | string | Array<string>}
   * @example
   * { archives: "https://example.com/archives" }
   * <link rel="archives" href="https://example.com/archives" />
   *
   */
  archives?: null | string | Array<string>

  /**
   * The assets link rel property.
   * @type {null | string | Array<string>}
   * @example
   * "https://example.com/assets"
   * <link rel="assets" href="https://example.com/assets" />
   *
   */
  assets?: null | string | Array<string>

  /**
   * The bookmarks link rel property.
   * @type {null | string | Array<string>}
   * @example
   * "https://example.com/bookmarks"
   * <link rel="bookmarks" href="https://example.com/bookmarks" />
   *
   */
  bookmarks?: null | string | Array<string> // This is technically against HTML spec but is used in wild

  // meta name properties

  /**
   * The category meta name property.
   * @type {null | string}
   * @example
   * "My Category"
   * <meta name="category" content="My Category" />
   */
  category?: null | string

  /**
   * The classification meta name property.
   * @type {null | string}
   * @example
   * "My Classification"
   * <meta name="classification" content="My Classification" />
   *
   */
  classification?: null | string

  /**
   * Arbitrary name/value pairs for the document.
   * @type {{ [name: string]: string | number | Array<string | number> }}
   */
  other?: {
    [name: string]: string | number | Array<string | number>
  }

  /**
   * Deprecated options that have a preferred method.
   * Use appWebApp to configure apple-mobile-web-app-capable which provides
   * https://www.appsloveworld.com/coding/iphone/11/difference-between-apple-mobile-web-app-capable-and-apple-touch-fullscreen-ipho
   * @deprecated
   */
  'apple-touch-fullscreen'?: never

  /**
   * Deprecated options that have a preferred method.
   * Obsolete since iOS 7. use icons.apple or "app-touch-icon" instead
   * https://web.dev/apple-touch-icon/
   * @deprecated
   */
  'apple-touch-icon-precomposed'?: never
}

interface ResolvedMetadata {
  // origin and base path for absolute urls for various metadata links such as
  // opengraph-image
  metadataBase: null | URL

  // The Document title and template if defined
  title: null | AbsoluteTemplateString

  // The Document description, and optionally the opengraph and twitter descriptions
  description: null | string

  // Standard metadata names
  // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta/name
  applicationName: null | string
  authors: null | Array<Author>
  generator: null | string
  // if you provide an array it will be flattened into a single tag with comma separation
  keywords: null | Array<string>
  referrer: null | ReferrerEnum
  themeColor: null | string
  colorScheme: null | ColorSchemeEnum
  viewport: null | string
  creator: null | string
  publisher: null | string

  // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta/name#other_metadata_names
  robots: null | ResolvedRobots

  // The canonical and alternate URLs for this location
  alternates: null | ResolvedAlternateURLs

  // Defaults to rel="icon" but the Icons type can be used
  // to get more specific about rel types
  icons: null | ResolvedIcons

  openGraph: null | ResolvedOpenGraph

  manifest: null | string | URL

  twitter: null | ResolvedTwitterMetadata

  // common verification tokens
  verification: null | ResolvedVerification

  // Apple web app metadata
  // https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariHTMLRef/Articles/MetaTags.html
  appleWebApp: null | ResolvedAppleWebApp

  // Should devices try to interpret various formats and make actionable links
  // out of them? The canonical example is telephone numbers on mobile that can
  // be clicked to dial
  formatDetection: null | FormatDetection

  // meta name="apple-itunes-app"
  itunes: null | ItunesApp

  // meta name="abstract"
  // A brief description of what this web-page is about.
  // Not recommended, superceded by description.
  // https://www.metatags.org/all-meta-tags-overview/meta-name-abstract/
  abstract: null | string

  // Facebook AppLinks
  appLinks: null | ResolvedAppLinks

  // link rel properties
  archives: null | Array<string>
  assets: null | Array<string>
  bookmarks: null | Array<string> // This is technically against HTML spec but is used in wild

  // meta name properties
  category: null | string
  classification: null | string

  // Arbitrary name/value pairs
  other: null | {
    [name: string]: string | number | Array<string | number>
  }

  /**
   *  Deprecated options that have a preferred method
   * */
  // Use appWebApp to configure apple-mobile-web-app-capable which provides
  // https://www.appsloveworld.com/coding/iphone/11/difference-between-apple-mobile-web-app-capable-and-apple-touch-fullscreen-ipho
  'apple-touch-fullscreen'?: never

  // Obsolete since iOS 7. use icons.apple or "app-touch-icon" instead
  // https://web.dev/apple-touch-icon/
  'apple-touch-icon-precomposed'?: never
}

export type ResolvingMetadata = Promise<ResolvedMetadata>
export { Metadata, ResolvedMetadata }
