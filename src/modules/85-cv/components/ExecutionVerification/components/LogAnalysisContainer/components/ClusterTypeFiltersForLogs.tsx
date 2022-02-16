import React from 'react'
import { Checkbox, Container, Layout } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import type { ClusterTypeFiltersForLogsProps } from './ClusterTypeFiltersForLogs.types'
import { getClusterTypes } from '../LogAnalysis.utils'
import css from './ClusterTypeFiltersForLogs.module.scss'

const ClusterTypeFiltersForLogs: React.FC<ClusterTypeFiltersForLogsProps> = ({
  totalClustersCount,
  clusterTypeFilters,
  onFilterChange
}) => {
  const { getString } = useStrings()

  const checkboxItems = getClusterTypes(getString)

  return (
    <Container className={css.main}>
      <Layout.Horizontal className={css.filterContainer}>
        <span>
          {getString('pipeline.verification.logs.totalClusters')} : {totalClustersCount}
        </span>
        <Layout.Horizontal>
          {checkboxItems.map(item => (
            <Checkbox
              key={item.label}
              label={item.label}
              value={item.value as string}
              defaultChecked={clusterTypeFilters?.includes(item.value as any)}
              onChange={inputEl => {
                onFilterChange((inputEl.target as any).checked as boolean, item.value as string)
              }}
            />
          ))}
        </Layout.Horizontal>
      </Layout.Horizontal>
    </Container>
  )
}

export default ClusterTypeFiltersForLogs
