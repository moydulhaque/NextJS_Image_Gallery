import { unstable_noStore } from 'next/cache'
import Link from 'next/link'
import { Suspense } from 'react'

export const locales = ['en', 'fr']

export const links = [
  { href: '/', text: 'Home' },
  ...locales
    .map((locale) => {
      return [
        { href: `/${locale}`, text: locale },
        { href: `/${locale}/about`, text: `${locale} - About` },
        { href: `/${locale}/static`, text: `${locale} - Static` },
      ]
    })
    .flat(),
]

function Dynamic({ noDynamic = false }) {
  if (!noDynamic) unstable_noStore()
  return <div id="dynamic">Dynamic</div>
}

export function TestPage({ pathname, noDynamic = false }) {
  return (
    <div>
      <ul>
        {links.map(({ href, text }) => (
          <li key={href}>
            <Link href={href}>{text}</Link>
          </li>
        ))}
      </ul>
      <code data-value={pathname}>{pathname}</code>
      <Suspense fallback={<div>Loading...</div>}>
        <Dynamic noDynamic={noDynamic} />
      </Suspense>
    </div>
  )
}
