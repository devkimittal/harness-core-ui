/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const addBufferToValue = (value: number, bufferPercentage: number): number =>
  +(((100 + bufferPercentage) / 100) * value).toFixed(2)

export const calculateSavingsPercentage = (savings: number, totalCost: number): string =>
  `(${Math.floor((savings / totalCost) * 100)}%)`

export const isResourceConsistent = (sumCpu: number, sumMemory: number, maxCpu: number, maxMemory: number): boolean => {
  const isInconsistent = Math.round(sumCpu) < Math.round(maxCpu) || Math.round(sumMemory) < Math.round(maxMemory)

  const anyZero =
    Math.round(sumCpu) == 0 || Math.round(sumMemory) == 0 || Math.round(maxCpu) == 0 || Math.round(maxMemory) == 0

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
