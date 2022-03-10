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
