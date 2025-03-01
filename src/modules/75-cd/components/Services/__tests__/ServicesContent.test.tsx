/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { ServicesContent } from '../ServicesContent/ServicesContent'

jest.mock('services/cd-ng', () => {
  return {
    GetServiceDetailsQueryParams: jest.fn(),
    useGetServiceDetails: jest.fn(() => ({ loading: false })),
    useGetWorkloads: jest.fn(() => ({ loading: false, data: null })),
    useGetServicesGrowthTrend: jest.fn(() => ({ data: null })),
    useGetServiceDeploymentsInfo: jest.fn(() => ({ loading: false }))
  }
})

describe('ServicesContent', () => {
  test('render', () => {
    const { container } = render(
      <TestWrapper>
        <ServicesContent />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
