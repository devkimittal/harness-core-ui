/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import routes from '@common/RouteDefinitions'
import { executionPathProps, pipelineModuleParams } from '@common/utils/routeUtils'
import type { TestWrapperProps } from '@common/utils/testUtils'
import { LogTypes } from '@cv/hooks/useLogContentHook/useLogContentHook.types'
import type {
  ExecutionLogDTO,
  RestResponseDeploymentActivitySummaryDTO,
  RestResponsePageCVNGLogDTO,
  RestResponseSetHealthSourceDTO
} from 'services/cv'

export const errorMessage = 'TEST ERROR MESSAGE'
const TEXT_LEARNING_ENGINE = 'Learning engine task info status: SUCCESS'

export const pathParams = {
  accountId: 'TEST_ACCOUNT_ID',
  orgIdentifier: 'TEST_ORG',
  projectIdentifier: 'TEST_PROJECT',
  pipelineIdentifier: 'TEST_PIPELINE',
  executionIdentifier: 'TEST_EXECUTION',
  module: 'cd',
  stageId: 'selectedStageId'
}

export const testWrapperProps: TestWrapperProps = {
  path: routes.toExecutionPipelineView({ ...executionPathProps, ...pipelineModuleParams }),
  pathParams
}

export const healthSourceResponse: RestResponseSetHealthSourceDTO = {
  metaData: {},
  resource: [
    {
      identifier: 'dynatrace_prod/dynatrace',
      name: 'dynatrace',
      type: 'DYNATRACE',
      verificationType: 'TIME_SERIES'
    },
    {
      identifier: 'dynatrace_prod/dyna',
      name: 'dyna',
      type: 'DYNATRACE',
      verificationType: 'TIME_SERIES'
    }
  ],
  responseMessages: []
}

export const executionLogs: ExecutionLogDTO[] = [
  {
    accountId: 'kmpySmUISimoRrJL6NL73w',
    traceableId: '6r2ndyuHT5qAdZZQVoE3RA',
    createdAt: 1647418990020,
    startTime: 1647418800000,
    endTime: 1647418860000,
    traceableType: 'VERIFICATION_TASK',
    log: TEXT_LEARNING_ENGINE,
    logLevel: 'INFO',
    type: LogTypes.ExecutionLog
  }
]

export const executionLogState = {
  data: [
    {
      text: { logLevel: 'INFO', createdAt: '3/16/2022 8:23:10 AM', log: TEXT_LEARNING_ENGINE }
    }
  ],
  searchData: { currentIndex: 0, linesWithResults: [], text: '' }
}

export const executionLogStateWithSearch = {
  data: [
    {
      text: { logLevel: 'INFO', createdAt: '3/16/2022 8:23:10 AM', log: TEXT_LEARNING_ENGINE },
      searchIndices: { logLevel: [0], log: [1] }
    }
  ],
  searchData: { currentIndex: 0, text: 'INFO', linesWithResults: [0, 0] }
}

export const executionLogsResponse: RestResponsePageCVNGLogDTO = {
  metaData: {},
  resource: {
    totalPages: 2,
    totalItems: 1,
    pageItemCount: 1,
    pageSize: 20,
    content: executionLogs,
    pageIndex: 0,
    empty: false
  },
  responseMessages: []
}

export const deploymentActivitySummaryResponse: RestResponseDeploymentActivitySummaryDTO = {
  metaData: {},
  resource: {
    serviceName: 'dynatrace',
    serviceIdentifier: 'dynatrace',
    envName: 'prod',
    envIdentifier: 'prod'
  },
  responseMessages: []
}
