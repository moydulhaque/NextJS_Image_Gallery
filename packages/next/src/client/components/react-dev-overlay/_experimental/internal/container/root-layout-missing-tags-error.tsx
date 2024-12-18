import type { VersionInfo } from '../../../../../../server/dev/parse-version-info'
import { useCallback } from 'react'
import { HotlinkedText } from '../components/hot-linked-text'
import { ErrorOverlay } from '../components/ErrorOverlay/ErrorOverlay'

type RootLayoutMissingTagsErrorProps = {
  missingTags: string[]
  versionInfo?: VersionInfo
}

export function RootLayoutMissingTagsError({
  missingTags,
  versionInfo,
}: RootLayoutMissingTagsErrorProps) {
  const noop = useCallback(() => {}, [])
  return (
    <ErrorOverlay
      errorType="Missing Required HTML Tag"
      errorMessage={
        <HotlinkedText
          text={`The following tags are missing in the Root Layout: ${missingTags
            .map((tagName) => `<${tagName}>`)
            .join(
              ', '
            )}.\nRead more at https://nextjs.org/docs/messages/missing-root-layout-tags`}
        />
      }
      onClose={noop}
      versionInfo={versionInfo}
    />
  )
}
