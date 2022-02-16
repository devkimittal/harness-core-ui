import type { ClusterTypes } from '../LogAnalysisView.container.types'

export interface ClusterTypeFiltersForLogsProps {
  totalClustersCount: number
  clusterTypeFilters: ClusterTypes
  onFilterChange: (checked: boolean, itemName: string) => void
}
