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
import type {
  NodeRecommendationDto,
  RecommendationOverviewStats,
  RecommendNodePoolClusterRequest
} from 'services/ce/services'
import { NodepoolTimeRange, NodepoolTimeRangeType } from '@ce/types'
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

const mockNodeRecommendationRequestData = {
  recommendClusterRequest: { sumCpu: 1, sumMem: 1, minNodes: 3 },
  totalResourceUsage: { maxcpu: 4, maxmemory: 10 }
}

describe('test cases for node recommendations details', () => {
  test('should be able to render node recommendations details', async () => {
    const { container } = render(
      <TestWrapper>
        <NodeRecommendationDetails
          recommendationDetails={MockRecommendationData.data.recommendationDetails as NodeRecommendationDto}
          recommendationName="MOCK_RECOMMENDATION"
          recommendationStats={MockRecommendationData.data.recommendationStatsV2 as RecommendationOverviewStats}
          timeRange={{ value: NodepoolTimeRangeType.LAST_7, label: NodepoolTimeRange.LAST_7 }}
          nodeRecommendationRequestData={mockNodeRecommendationRequestData as RecommendNodePoolClusterRequest}
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})
