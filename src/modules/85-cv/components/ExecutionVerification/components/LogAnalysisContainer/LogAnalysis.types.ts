/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { SeriesColumnOptions } from 'highcharts'
import type { SelectOption } from '@pipeline/components/PipelineSteps/Steps/StepsTypes'
import type {
  LogData,
  RestResponseListLogAnalysisClusterChartDTO,
  RestResponsePageLogAnalysisClusterDTO
} from 'services/cv'
import type { ExecutionNode } from 'services/pipeline-ng'

export type LogAnalysisRowData = {
  clusterType: LogData['tag']
  message: string
  count: number
  messageFrequency: SeriesColumnOptions[]
  riskScore: number
  riskStatus: LogData['riskStatus']
}

export interface LogAnalysisContainerProps {
  step: ExecutionNode
  hostName?: string
  isErrorTracking?: boolean
}

export interface LogAnalysisProps {
  data: RestResponsePageLogAnalysisClusterDTO | null
  clusterChartData: RestResponseListLogAnalysisClusterChartDTO | null
  goToPage(val: number): void
  logsLoading: boolean
  clusterChartLoading: boolean
  onChangeHealthSource: (selectedHealthSource: string) => void
  activityId?: string
  isErrorTracking?: boolean
}
