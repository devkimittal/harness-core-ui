/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { act, fireEvent, queryByAttribute, render, waitFor } from '@testing-library/react'
import React from 'react'
import { mockTemplates } from '@templates-library/TemplatesTestHelper'
import { Sort, SortFields } from '@templates-library/pages/TemplatesPage/TemplatesPageUtils'
import ResultsViewHeader from '../ResultsViewHeader'

jest.mock('framework/strings', () => ({
  ...(jest.requireActual('framework/strings') as any),
  useStrings: jest.fn().mockReturnValue({
    getString: jest.fn().mockImplementation(val => val)
  })
}))

describe('<ResultsViewHeader /> tests', () => {
  test('should match snapshot', async () => {
    const setSort = jest.fn()
    const setPage = jest.fn()
    const { container, getByTestId } = render(
      <ResultsViewHeader templateData={mockTemplates.data || {}} setSort={setSort} setPage={setPage} />
    )
    expect(container).toMatchSnapshot()

    const sortButton = getByTestId('dropdown-button')
    await act(async () => {
      fireEvent.click(sortButton)
    })
    await waitFor(() => queryByAttribute('class', document.body, 'bp3-popover-content'))
    const menuItems = document.querySelectorAll('[class*="menuItem"]')
    expect(menuItems?.length).toBe(3)

    await act(async () => {
      fireEvent.click(menuItems[0])
    })
    expect(setSort).toBeCalledWith([SortFields.LastUpdatedAt, Sort.DESC])
    expect(setPage).toBeCalledWith(0)

    await act(async () => {
      fireEvent.click(menuItems[1])
    })
    expect(setSort).toBeCalledWith([SortFields.Name, Sort.ASC])
    expect(setPage).toBeCalledWith(0)

    await act(async () => {
      fireEvent.click(menuItems[2])
    })
    expect(setSort).toBeCalledWith([SortFields.Name, Sort.DESC])
    expect(setPage).toBeCalledWith(0)
  })
})
