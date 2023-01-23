import type { ResolvedMetadata } from '../types/metadata-interface'
import type { Icon, IconDescriptor } from '../types/metadata-types'

import React from 'react'
import { resolveAsArrayOrUndefined } from './utils'

const resolveUrl = (url: string | URL) =>
  typeof url === 'string' ? url : url.toString()

function IconDescriptorLink({ icon }: { icon: IconDescriptor }) {
  const { url, rel = 'icon', ...props } = icon

  return <link rel={rel} href={resolveUrl(url)} {...props} />
}

function IconLink({ rel, icon }: { rel?: string; icon: Icon }) {
  if (typeof icon === 'object' && !(icon instanceof URL)) {
    if (rel) icon.rel = rel
    return <IconDescriptorLink icon={icon} />
  } else {
    const href = resolveUrl(icon)
    return <link rel={rel} href={href} />
  }
}

export function ResolvedIconsMetadata({
  icons,
}: {
  icons: ResolvedMetadata['icons']
}) {
  if (!icons) return null

  const shortcutList = resolveAsArrayOrUndefined(icons.shortcut)
  const iconList = resolveAsArrayOrUndefined(icons.icon)
  const appleList = resolveAsArrayOrUndefined(icons.apple)
  const otherList = resolveAsArrayOrUndefined(icons.other)

  return (
    <>
      {shortcutList
        ? shortcutList.map((icon, index) => (
            <IconLink
              key={`shortcut-${index}`}
              rel="shortcut icon"
              icon={icon}
            />
          ))
        : null}
      {iconList
        ? iconList.map((icon, index) => (
            <IconLink key={`shortcut-${index}`} rel="icon" icon={icon} />
          ))
        : null}
      {appleList
        ? appleList.map((icon, index) => (
            <IconLink
              key={`apple-${index}`}
              rel="apple-touch-icon"
              icon={icon}
            />
          ))
        : null}
      {otherList
        ? otherList.map((icon, index) => (
            <IconDescriptorLink key={`other-${index}`} icon={icon} />
          ))
        : null}
    </>
  )
}
