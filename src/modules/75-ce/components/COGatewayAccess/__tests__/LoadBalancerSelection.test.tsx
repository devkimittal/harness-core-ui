/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import type { AccessPoint, AccessPointCore } from 'services/lw'
import * as lwServices from 'services/lw'
import LoadBalancerSelection from '../LoadBalancerSelection'
import { initialGatewayDetails } from './data'

const mockAccessPointList = {
  response: [
    {
      name: 'mock.com',
      id: 'mock.com',
      host_name: 'mock.com',
      metadata: {
        albArn: 'mockalbARN'
      }
    } as AccessPoint
  ]
}

const mockAccessPointResourceData = {
  response: [
    {
      details: {
        albARN: 'mockalbARN',
        name: 'mockALBname',
        id: 'mock.com'
      }
    }
  ] as AccessPointCore[]
}

jest.mock('services/lw', () => ({
  useListAccessPoints: jest.fn().mockImplementation(() => ({
    data: mockAccessPointList,
    loading: false,
    refetch: jest.fn(() => mockAccessPointList)
  })),
  useAccessPointResources: jest.fn().mockImplementation(() => ({
    data: mockAccessPointResourceData,
    loading: false,
    refetch: jest.fn(() => mockAccessPointResourceData)
  }))
}))

describe('load balancer selection cases', () => {
  test('no data available for access points and supported resources', () => {
    jest.spyOn(lwServices, 'useListAccessPoints').mockImplementation(
      () =>
        ({
          data: null,
          loading: false,
          refetch: jest.fn()
        } as any)
    )
    jest.spyOn(lwServices, 'useAccessPointResources').mockImplementation(
      () =>
        ({
          data: null,
          loading: false,
          refetch: jest.fn()
        } as any)
    )

    const { container } = render(
      <TestWrapper>
        <LoadBalancerSelection gatewayDetails={initialGatewayDetails} setGatewayDetails={jest.fn()} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})
