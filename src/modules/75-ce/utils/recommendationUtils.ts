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

export const isResourceConsistent = (sumCpu: number, sumMemory: number, maxCpu: number, maxMemory: number): boolean => {
  const isInconsistent = Math.round(sumCpu) < Math.round(maxCpu) || Math.round(sumMemory) < Math.round(maxMemory)

  const anyZero =
    Math.round(sumCpu) === 0 || Math.round(sumMemory) === 0 || Math.round(maxCpu) === 0 || Math.round(maxMemory) === 0

  return !isInconsistent || !anyZero
}

export const calculateNodes = (
  sumCpu: number,
  sumMemory: number,
  maxCpu: number,
  maxMemory: number,
  minNodes: number
): { maximumNodes: number; minimumNodes: number } => {
  let minimumNodes = minNodes || 3

  let maximumNodes = Math.min(Math.floor(sumCpu / maxCpu), Math.floor(sumMemory / maxMemory))
  maximumNodes = Math.max(maximumNodes, 1)

  if (maximumNodes < minNodes) {
    minimumNodes = maximumNodes
  }

  return { maximumNodes, minimumNodes }
}

export const convertStateToRecommendClusterPayload = (
  state: IState,
  resourceRequirement: RecommendClusterRequest,
  buffer: number
) => {
  const sumCpuWithBuffer = addBufferToValue(state.sumCpu, buffer)
  const sumMemWithBuffer = addBufferToValue(state.sumMem, buffer)

  const { maximumNodes, minimumNodes } = calculateNodes(
    sumCpuWithBuffer,
    sumMemWithBuffer,
    state.maxCpu,
    state.maxMemory,
    state.minNodes
  )

  return {
    ...resourceRequirement,
    ...state,
    sumCpu: sumCpuWithBuffer,
    sumMemL: sumMemWithBuffer,
    minCpu: state.maxCpu,
    minMem: state.maxMemory,
    maxNodes: maximumNodes,
    minNodes: minimumNodes
  }
}

export const addBufferToState = (state: IState, buffer: number): IState => ({
  ...state,
  sumCpu: addBufferToValue(state.sumCpu, buffer),
  sumMem: addBufferToValue(state.sumMem, buffer)
})
