/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export interface IState {
  minCpu: number
  minMem: number
  sumCpu: number
  sumMem: number
  maxNodes: number
  minNodes: number
  includeTypes: string[]
  includeSeries: string[]
  excludeTypes: string[]
  excludeSeries: string[]
}

export enum ACTIONS {
  'SUM_CPUS',
  'SUM_MEM',
  'MIN_CPUS',
  'MIN_MEM',
  'MIN_NODES',
  'MAX_NODES',
  'INCLUDE_TYPES',
  'INCLUDE_SERIES',
  'EXCLUDE_TYPES',
  'EXCLUDE_SERIES',
  'CLEAR_INSTACE_FAMILY',
  'RESET_TO_DEFAULT'
}

export interface Action {
  type: ACTIONS
  data: any
}
