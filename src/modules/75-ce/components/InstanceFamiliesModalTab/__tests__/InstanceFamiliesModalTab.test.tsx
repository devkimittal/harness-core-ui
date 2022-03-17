/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'

import MockInstanceFamilyData from '@ce/components/NodeRecommendation/__tests__/MockInstanceFamilyData.json'
import { InstanceFamiliesModalTab } from '../InstanceFamiliesModalTab'

const mockState = {
  maxCpu: 44,
  maxMemory: 100,
  sumCpu: 30,
  sumMem: 120,
  minNodes: 10,
  includeTypes: ['c2d-highcpu-4'],
  includeSeries: ['e2'],
  excludeTypes: ['n1-highcpu-8'],
  excludeSeries: ['n1']
}

describe('test cases for instance family modal tab', () => {
  test('should be able to render instance family modal tab', async () => {
    const { container, getByTestId } = render(
      <TestWrapper>
        <InstanceFamiliesModalTab
          dispatch={jest.fn()}
          state={mockState}
          data={MockInstanceFamilyData.categoryDetails['Compute optimized']}
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()

    expect(getByTestId('series-checkbox-c2d')).not.toBeChecked()
    fireEvent.click(getByTestId('series-checkbox-c2d'))
    expect(getByTestId('series-checkbox-e2')).toBeChecked()
    fireEvent.click(getByTestId('series-checkbox-e2'))
    expect(getByTestId('type-checkbox-c2d-highcpu-4')).toBeChecked()
    fireEvent.click(getByTestId('type-checkbox-c2d-highcpu-4'))
    expect(getByTestId('type-checkbox-n1-highcpu-8')).not.toBeChecked()
    fireEvent.click(getByTestId('type-checkbox-n1-highcpu-8'))

    expect(getByTestId('type-header-checkbox-n1-highcpu-8')).not.toBeChecked()
    fireEvent.click(getByTestId('type-header-checkbox-n1-highcpu-8'))

    fireEvent.mouseEnter(getByTestId('type-checkbox-c2d-highcpu-4'))
    fireEvent.mouseLeave(getByTestId('type-checkbox-c2d-highcpu-4'))

    fireEvent.mouseEnter(getByTestId('type-header-checkbox-c2d-highcpu-4'))
    fireEvent.mouseLeave(getByTestId('type-header-checkbox-c2d-highcpu-4'))
  })

  test('should be able to render instance family modal tab when instance families are not present', async () => {
    const { container } = render(
      <TestWrapper>
        <InstanceFamiliesModalTab dispatch={jest.fn()} state={mockState} data={{}} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})
