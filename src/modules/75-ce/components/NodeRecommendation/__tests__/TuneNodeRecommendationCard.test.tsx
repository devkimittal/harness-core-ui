/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { TuneRecommendationCard } from '../TuneNodeRecommendationCard'
import type { IState } from '../constants'

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

const mockState2 = {
  maxCpu: 44,
  maxMemory: 100,
  sumCpu: 30,
  sumMem: 120,
  minNodes: 10,
  includeTypes: ['type1'],
  includeSeries: [],
  excludeTypes: ['type2'],
  excludeSeries: []
}

jest.mock('framework/strings', () => ({
  ...(jest.requireActual('framework/strings') as any),
  useStrings: jest.fn().mockReturnValue({
    getString: jest.fn().mockImplementation(val => val)
  })
}))

describe('test cases for tune recommendation card', () => {
  test('should be able to render tune recommendation card hidden', async () => {
    const { container } = render(
      <TestWrapper>
        <TuneRecommendationCard
          loading={false}
          cardVisible={false}
          toggleCardVisible={jest.fn()}
          buffer={0}
          dispatch={jest.fn()}
          setBuffer={jest.fn()}
          state={mockState}
          initialState={mockState as IState}
          showInstanceFamiliesModal={jest.fn()}
          updateRecommendationDetails={jest.fn()}
          updatedState={mockState as IState}
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('should be able to render tune recommendation card', async () => {
    const { container } = render(
      <TestWrapper>
        <TuneRecommendationCard
          loading={true}
          cardVisible={true}
          toggleCardVisible={jest.fn()}
          buffer={0}
          dispatch={jest.fn()}
          setBuffer={jest.fn()}
          state={mockState}
          initialState={mockState as IState}
          showInstanceFamiliesModal={jest.fn()}
          updateRecommendationDetails={jest.fn()}
          updatedState={mockState as IState}
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('should be able to render tune recommendation card when there are instance families', async () => {
    const { container } = render(
      <TestWrapper>
        <TuneRecommendationCard
          loading={true}
          cardVisible={true}
          toggleCardVisible={jest.fn()}
          buffer={0}
          dispatch={jest.fn()}
          setBuffer={jest.fn()}
          state={mockState2}
          initialState={mockState as IState}
          showInstanceFamiliesModal={jest.fn()}
          updateRecommendationDetails={jest.fn()}
          updatedState={mockState2 as IState}
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})
