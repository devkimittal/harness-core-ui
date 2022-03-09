/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'

import MockRecommendationData from '@ce/pages/node-recommendation-details/__test__/NodeRecommendationResponse.json'
import type { NodeRecommendationDto, RecommendationOverviewStats } from 'services/ce/services'
import { TimeRange, TimeRangeType } from '@ce/types'
import NodeRecommendationDetails from '../NodeRecommendation'
import MockInstanceFamilyData from './MockInstanceFamilyData.json'

jest.mock('@ce/components/RecommendationDetailsSummaryCards/RecommendationDetailsSummaryCards', () => ({
  RecommendationDetailsSpendCard: () => 'recommendation-details-spend-card-mock',
  RecommendationDetailsSavingsCard: () => 'recommendation-details-savings-card-mock'
}))

jest.mock('@ce/components/InstanceFamiliesModalTab/InstanceFamiliesModalTab', () => ({
  InstanceFamiliesModalTab: () => 'Instance-Families-Modal-Tab'
}))

jest.mock('services/ce/recommenderService', () => ({
  useRecommendCluster: jest.fn().mockImplementation(() => ({
    loading: false,
    mutate: jest.fn().mockImplementation(() => {
      return {
        status: 'SUCCESS'
      }
    })
  }))
}))

jest.mock('services/ce/publicPricingService', () => ({
  useGetSeries: jest.fn().mockImplementation(() => ({
    loading: false,
    data: MockInstanceFamilyData
  }))
}))

describe('test cases for node recommendations details', () => {
  test('should be able to render node recommendations details', async () => {
    const { container } = render(
      <TestWrapper>
        <NodeRecommendationDetails
          recommendationDetails={MockRecommendationData.data.recommendationDetails as NodeRecommendationDto}
          recommendationName="MOCK_RECOMMENDATION"
          recommendationStats={MockRecommendationData.data.recommendationStatsV2 as RecommendationOverviewStats}
          timeRange={{ value: TimeRangeType.LAST_7, label: TimeRange.LAST_7 }}
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})
