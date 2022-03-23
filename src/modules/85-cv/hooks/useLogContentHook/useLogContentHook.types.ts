/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { SelectOption } from '@harness/uicore'
import type { State, UseActionCreatorReturn } from './views/ExecutionLog/ExecutionLog.types'

export interface UseLogContentHookProps {
  activityId: string
}

export interface UseLogContentHookReturn {
  openLogContentHook: () => void
  closeLogContentHook: () => void
}

export interface ExecutionLogHeaderProps {
  activityId: string
  healthSource: SelectOption
  setHealthSource: (healthSource: SelectOption) => void
  errorLogsOnly: boolean
  setErrorLogsOnly: (errorLogsOnly: boolean) => void
  actions: UseActionCreatorReturn
  setPageNumber: (pageNumber: number) => void
}

export interface ExecutionLogToolbarProps {
  state: State
  actions: UseActionCreatorReturn
  isFullScreen: boolean
  setIsFullScreen: (isFullScreen: React.SetStateAction<boolean>) => void
}

export enum LogTypes {
  ApiCallLog = 'ApiCallLog',
  ExecutionLog = 'ExecutionLog'
}
