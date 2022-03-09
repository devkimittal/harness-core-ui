/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { Provider } from 'urql'
import { fromValue } from 'wonka'
import { TestWrapper } from '@common/utils/testUtils'

import NodeRecommendationDetailsPage from '../NodeRecommendationDetailsPage'
import ResponseData from './NodeRecommendationResponse.json'

jest.mock('@ce/components/NodeRecommendation/NodeRecommendation', () => 'node-recommendation-details')

const params = {
  accountId: 'TEST_ACC',
  recommendation: 'RECOMMENDATION_ID'
}

describe('test cases for Node Recommendation page', () => {
  test('should be able to render the page', async () => {
    const responseState = {
      executeQuery: () => fromValue(ResponseData)
    }

    const { container, getByText } = render(
      <TestWrapper pathParams={params}>
        <Provider value={responseState as any}>
          <NodeRecommendationDetailsPage />
        </Provider>
      </TestWrapper>
    )

    expect(getByText('general-preemptible')).toBeDefined() // general-preemptible is the name of the mocked nodepool
    // expect(getByText('ce.nodeRecommendation.gke')).toBeDefined() // mocked response is of Google's k8s clsuter, that's why 'gke'
    // expect(getByText('ce.nodeRecommendation.gke')).toBeDefined()
    expect(container).toMatchSnapshot()
  })
})
