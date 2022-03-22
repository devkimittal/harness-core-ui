/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { queryByText, render, fireEvent, act } from '@testing-library/react'
import { Provider } from 'urql'
import { fromValue } from 'wonka'
import { TestWrapper } from '@common/utils/testUtils'
import BusinessMapping from '../BusinessMapping'

const params = {
  accountId: 'TEST_ACC',
  perspetiveId: 'perspectiveId',
  perspectiveName: 'sample perspective'
}

jest.mock('services/ce', () => ({
  useGetBusinessMappingList: jest.fn().mockImplementation(() => ({
    mutate: async () => {
      return {
        status: 'SUCCESS',
        data: {}
      }
    }
  })),
  useCreateBusinessMapping: jest.fn().mockImplementation(() => ({
    mutate: async () => {
      return {
        status: 'SUCCESS',
        data: {}
      }
    }
  }))
}))

describe('test cases for Business Mapping List Page', () => {
  test('should be able to render the list page', async () => {
    const { container } = render(
      <TestWrapper pathParams={params}>
        <BusinessMapping />
      </TestWrapper>
    )

    expect(queryByText(container, 'ce.businessMapping.newButton')).toBeInTheDocument()
  })

  test('should be able to render the list page and open side drawer', async () => {
    const responseState = {
      executeQuery: () => {
        return fromValue({})
      }
    }
    const { container } = render(
      <TestWrapper pathParams={params}>
        <Provider value={responseState as any}>
          <BusinessMapping />
        </Provider>
      </TestWrapper>
    )

    const newButton = queryByText(container, 'ce.businessMapping.newButton')
    act(() => {
      fireEvent.click(newButton!)
    })

    expect(queryByText(document.body, 'ce.businessMapping.costBucket.title')).toBeInTheDocument()
  })
})
