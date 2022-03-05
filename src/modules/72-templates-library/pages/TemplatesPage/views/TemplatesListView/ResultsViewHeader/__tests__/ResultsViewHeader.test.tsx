/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { act, fireEvent, render, waitFor } from '@testing-library/react'
import React from 'react'
import { defaultTo } from 'lodash-es'
import { mockTemplates } from '@templates-library/TemplatesTestHelper'
import { Sort, SortFields } from '@templates-library/pages/TemplatesPage/TemplatesPageUtils'
import { findPopoverContainer, TestWrapper } from '@common/utils/testUtils'
import ResultsViewHeader, { ResultsViewHeaderProps } from '../ResultsViewHeader'

const baseProps: ResultsViewHeaderProps = {
  templateData: defaultTo(mockTemplates.data, {}),
  setSort: jest.fn(),
  setPage: jest.fn()
}

describe('<ResultsViewHeader /> tests', () => {
  test('should match snapshot', async () => {
    const { container } = render(
      <TestWrapper>
        <ResultsViewHeader {...baseProps} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('should call correct methods when dropdown items are clicked', async () => {
    const { getByTestId } = render(
      <TestWrapper>
        <ResultsViewHeader {...baseProps} />
      </TestWrapper>
    )

    const sortButton = getByTestId('dropdown-button')
    act(() => {
      fireEvent.click(sortButton)
    })

    const popover = findPopoverContainer() as HTMLElement
    await waitFor(() => popover)

    const menuItems = popover.querySelectorAll('[class*="menuItem"]')
    expect(menuItems?.length).toBe(3)

    act(() => {
      fireEvent.click(menuItems[0])
    })
    expect(baseProps.setSort).toBeCalledWith([SortFields.LastUpdatedAt, Sort.DESC])
    expect(baseProps.setPage).toBeCalledWith(0)

    act(() => {
      fireEvent.click(menuItems[1])
    })
    expect(baseProps.setSort).toBeCalledWith([SortFields.Name, Sort.ASC])
    expect(baseProps.setPage).toBeCalledWith(0)

    act(() => {
      fireEvent.click(menuItems[2])
    })
    expect(baseProps.setSort).toBeCalledWith([SortFields.Name, Sort.DESC])
    expect(baseProps.setPage).toBeCalledWith(0)
  })
})
