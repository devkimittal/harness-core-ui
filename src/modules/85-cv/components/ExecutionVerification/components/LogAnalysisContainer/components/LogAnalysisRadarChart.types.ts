import type { RestResponseListLogAnalysisClusterChartDTO } from 'services/cv'

export interface LogAnalysisRadarChartProps {
  clusterChartLoading: boolean
  clusterChartData: RestResponseListLogAnalysisClusterChartDTO | null
}

export interface MinMaxAngleState {
  min: number
  max: number
}

export interface MultiRangeSliderProps {
  min: number
  max: number
  onChange: (value: MinMaxAngleState) => void
}
