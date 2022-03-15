/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { IState } from '@ce/components/NodeRecommendation/constants'
import type { RecommendClusterRequest } from 'services/ce/recommenderService'

export const addBufferToValue = (value: number, bufferPercentage: number): number =>
  +(((100 + bufferPercentage) / 100) * value).toFixed(2)

export const calculateSavingsPercentage = (savings: number, totalCost: number): string =>
  `(${Math.floor((savings / totalCost) * 100)}%)`

export const convertStateToRecommendClusterPayload = (
  state: IState,
  resourceRequirement: RecommendClusterRequest,
  buffer: number
): RecommendClusterRequest => {
  const sumCpuWithBuffer = addBufferToValue(state.sumCpu, buffer)
  const sumMemWithBuffer = addBufferToValue(state.sumMem, buffer)

  return {
    ...resourceRequirement,
    ...state,
    sumCpu: sumCpuWithBuffer,
    sumMem: sumMemWithBuffer
  }
}

export const addBufferToState = (state: IState, buffer: number): IState => ({
  ...state,
  sumCpu: addBufferToValue(state.sumCpu, buffer),
  sumMem: addBufferToValue(state.sumMem, buffer)
})
