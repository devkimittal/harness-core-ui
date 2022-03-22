/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { getHealthSourceOptions, isPositiveNumber } from '../useLogContentHook.utils'

const getString = (text: string): string => text

describe('utils', () => {
  test('isPositiveNumber', () => {
    expect(isPositiveNumber(0)).toBeTruthy()
    expect(isPositiveNumber(NaN)).toBeFalsy()
    expect(isPositiveNumber('1')).toBeFalsy()
    expect(isPositiveNumber(undefined)).toBeFalsy()
  })

  test('getHealthSourceOptions', () => {
    expect(getHealthSourceOptions(getString, undefined)).toEqual([{ label: 'all', value: '' }])
  })
})
