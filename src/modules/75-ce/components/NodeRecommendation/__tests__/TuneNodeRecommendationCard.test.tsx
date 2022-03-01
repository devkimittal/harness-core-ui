/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import TuneRecommendationCard from '../TuneNodeRecommendationCard'

const mockState = {
  minCpu: 44,
  minMem: 100,
  sumCpu: 30,
  sumMem: 120,
  maxNodes: 12,
  minNodes: 10,
  includeTypes: [],
  includeSeries: [],
  excludeTypes: [],
  excludeSeries: []
}

describe('test cases for tune recommendation card', () => {
  test('should be able to render tune recommendation card', async () => {
    const { container } = render(
      <TestWrapper>
        <TuneRecommendationCard buffer={0} dispatch={jest.fn()} setBuffer={jest.fn()} state={mockState} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})
