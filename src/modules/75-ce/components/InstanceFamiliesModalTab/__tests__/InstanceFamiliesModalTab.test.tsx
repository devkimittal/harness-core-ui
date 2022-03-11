/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'

import MockInstanceFamilyData from '@ce/components/NodeRecommendation/__tests__/MockInstanceFamilyData.json'
import { InstanceFamiliesModalTab } from '../InstanceFamiliesModalTab'

const mockState = {
  maxCpu: 44,
  maxMemory: 100,
  sumCpu: 30,
  sumMem: 120,
  minNodes: 10,
  includeTypes: [],
  includeSeries: [],
  excludeTypes: [],
  excludeSeries: []
}

describe('test cases for instance family modal tab', () => {
  test('should be able to render instance family modal tab', async () => {
    const { container } = render(
      <TestWrapper>
        <InstanceFamiliesModalTab
          dispatch={jest.fn()}
          state={mockState}
          data={MockInstanceFamilyData.categoryDetails['Compute optimized']}
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})
