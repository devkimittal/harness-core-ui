import React from 'react'
import { Views } from '@wings-software/uicore'
import { TemplatesGridView } from '@templates-library/pages/TemplatesPage/views/TemplatesGridView/TemplatesGridView'
import type { PageTemplateSummaryResponse, TemplateSummaryResponse } from 'services/template-ng'
import { GitSyncStoreProvider } from 'framework/GitRepoStore/GitSyncStoreContext'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { TemplatesListView } from '@templates-library/pages/TemplatesPage/views/TemplatesListView/TemplatesListView'

export interface TemplatesViewProps {
  data?: PageTemplateSummaryResponse
  selectedIdentifier?: string
  gotoPage: (pageNumber: number) => void
  onSelect: (template: TemplateSummaryResponse) => void
  onPreview?: (template: TemplateSummaryResponse) => void
  onOpenEdit?: (template: TemplateSummaryResponse) => void
  onOpenSettings?: (templateIdentifier: string) => void
  onDelete?: (template: TemplateSummaryResponse) => void
}

export default function TemplatesView(props: TemplatesViewProps & { view: Views }): React.ReactElement {
  const { view, ...rest } = props
  const { isGitSyncEnabled } = useAppStore()

  const content = React.useMemo(
    () => (view === Views.GRID ? <TemplatesGridView {...rest} /> : <TemplatesListView {...rest} />),
    [rest]
  )

  if (isGitSyncEnabled) {
    return <GitSyncStoreProvider>{content}</GitSyncStoreProvider>
  } else {
    return <>{content}</>
  }
}
