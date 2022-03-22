/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { LogLineData } from '@pipeline/components/LogsContent/LogsState/types'
import type { LogLineData as ExecutionLog } from './ExecutionLog.types'

function convertSearchIndices(searchIndices: ExecutionLog['searchIndices']): LogLineData['searchIndices'] | undefined {
  if (searchIndices) {
    return {
      level: searchIndices.logLevel,
      time: searchIndices.createdAt,
      out: searchIndices.log
    }
  }
}

export function convertLogDataToLogLineData(data: ExecutionLog): LogLineData {
  const { text, searchIndices } = data

  switch (text.logLevel) {
    case 'WARN':
      return {
        text: {
          level: text.logLevel,
          time: text.createdAt,
          out: `\u001b[1;33m\u001b[40m${text.log}\u001b[0m`
        },
        searchIndices: convertSearchIndices(searchIndices)
      }
    case 'ERROR':
      return {
        text: {
          level: `\u001b[1;31m\u001b[40m${text.logLevel}\u001b[0m`,
          time: text.createdAt,
          out: `\u001b[1;31m\u001b[40m${text.log}\u001b[0m`
        },
        searchIndices: convertSearchIndices(searchIndices)
      }
    default:
      return {
        text: {
          level: text.logLevel,
          time: text.createdAt,
          out: text.log
        },
        searchIndices: convertSearchIndices(searchIndices)
      }
  }
}
