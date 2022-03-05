/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, render } from '@testing-library/react'
import { noop } from 'lodash-es'
import { mockTemplates } from '@templates-library/TemplatesTestHelper'
import { TemplatesListView } from '@templates-library/pages/TemplatesPage/views/TemplatesListView/TemplatesListView'
import { TestWrapper } from '@common/utils/testUtils'
import type { TemplatesViewProps } from '@templates-library/pages/TemplatesPage/views/TemplatesView'

const baseProps: TemplatesViewProps = {
  data: mockTemplates.data,
  gotoPage: jest.fn(),
  onSelect: jest.fn()
}

describe('<TemplatesListView /> tests', () => {
  test('should match snapshot without three dots', async () => {
    const { container } = render(
      <TestWrapper>
        <TemplatesListView {...baseProps} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('should match snapshot with three dots', async () => {
    const { container } = render(
      <TestWrapper>
        <TemplatesListView {...baseProps} onPreview={noop} onOpenEdit={noop} onOpenSettings={noop} onDelete={noop} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('should call onSelect with correct when item is clicked', async () => {
    const { container } = render(
      <TestWrapper>
        <TemplatesListView {...baseProps} />
      </TestWrapper>
    )
    const templateRows = container.querySelectorAll('.TableV2--body [role="row"]')
    expect(templateRows.length).toEqual(mockTemplates.data?.content?.length)
    act(() => {
      fireEvent.click(templateRows[0])
    })
    expect(baseProps.onSelect).toBeCalledWith(mockTemplates.data?.content?.[0])
  })
})
