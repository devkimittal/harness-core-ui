/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { queryByText, render } from '@testing-library/react'
import { Provider } from 'urql'
import { fromValue } from 'wonka'
import { TestWrapper } from '@common/utils/testUtils'
import BusinessMappingBuilder from '../BusinessMappingBuilder'

describe('test cases for Business Mapping Builder', () => {
  test('should be able to render the component', () => {
    const responseState = {
      executeQuery: () => {
        return fromValue({})
      }
    }
    const { container } = render(
      <TestWrapper>
        <Provider value={responseState as any}>
          <BusinessMappingBuilder />
        </Provider>
      </TestWrapper>
    )
    expect(queryByText(container, 'ce.businessMapping.manageUnallocatedCost.title')).toBeInTheDocument()
    expect(queryByText(container, 'ce.businessMapping.sharedCostBucket.title')).toBeInTheDocument()
    expect(queryByText(container, 'ce.businessMapping.costBucket.title')).toBeInTheDocument()
  })
})
