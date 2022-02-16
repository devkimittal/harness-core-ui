import type { RestResponseListLogAnalysisClusterChartDTO } from 'services/cv'

export interface LogAnalysisRadarChartProps {
  clusterChartLoading: boolean
  clusterChartData: RestResponseListLogAnalysisClusterChartDTO | null
}
