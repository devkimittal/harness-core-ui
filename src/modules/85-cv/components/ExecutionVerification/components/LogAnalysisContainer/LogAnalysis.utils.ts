/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { getEventTypeChartColor, getRiskColorValue } from '@cv/utils/CommonUtils'
import type { SelectOption } from '@pipeline/components/PipelineSteps/Steps/StepsTypes'
import type { UseStringsReturn } from 'framework/strings'
import type { LogData, RestResponsePageLogAnalysisClusterDTO } from 'services/cv'
import type { LogAnalysisRowData } from './LogAnalysis.types'

export enum EVENT_TYPE {
  KNOWN = 'KNOWN',
  UNKNOWN = 'UNKNOWN',
  FREQUENCY = 'FREQUENCY',
  BASELINE = 'BASELINE'
}

export const mapClusterType = (type: string): LogData['tag'] => {
  switch (type) {
    case 'KNOWN_EVENT':
      return 'KNOWN'
    case 'UNKNOWN_EVENT':
      return 'UNKNOWN'
    case 'UNEXPECTED_FREQUENCY':
      return 'UNEXPECTED'
    default:
      return 'KNOWN'
  }
}

export const getClusterTypes = (getString: UseStringsReturn['getString']): SelectOption[] => {
  return [
    // { label: getString('pipeline.verification.logs.allEvents'), value: '' },
    { label: getString('pipeline.verification.logs.knownEvent'), value: 'KNOWN_EVENT' },
    { label: getString('pipeline.verification.logs.unknownEvent'), value: 'UNKNOWN_EVENT' },
    { label: getString('pipeline.verification.logs.unexpectedFrequency'), value: 'UNEXPECTED_FREQUENCY' }
  ]
}

export function getLogAnalysisData(data: RestResponsePageLogAnalysisClusterDTO | null): LogAnalysisRowData[] {
  return (
    data?.resource?.content?.map(d => ({
      clusterType: mapClusterType(d?.clusterType as string),
      count: d?.count as number,
      message: d?.message as string,
      messageFrequency: [
        {
          name: 'testData',
          type: 'column',
          color: getEventTypeChartColor(d.clusterType),
          data: d?.testFrequencyData
        }
      ],
      riskScore: d?.score as number,
      riskStatus: d?.risk
    })) ?? []
  )
}
