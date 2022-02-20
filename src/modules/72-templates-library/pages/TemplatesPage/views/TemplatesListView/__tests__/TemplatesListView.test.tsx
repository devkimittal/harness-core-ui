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

describe('<TemplatesListView /> tests', () => {
  test('snapshot test without three dots', async () => {
    const { container } = render(
      <TestWrapper defaultAppStoreValues={{ isGitSyncEnabled: false }}>
        <TemplatesListView data={mockTemplates.data} gotoPage={noop} onSelect={noop} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('snapshot test with three dots', async () => {
    const { container } = render(
      <TestWrapper defaultAppStoreValues={{ isGitSyncEnabled: false }}>
        <TemplatesListView
          data={mockTemplates.data}
          gotoPage={noop}
          onSelect={noop}
          onPreview={noop}
          onOpenEdit={noop}
          onOpenSettings={noop}
          onDelete={noop}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('click on item should work', async () => {
    const onSelect = jest.fn()
    const { container } = render(
      <TestWrapper defaultAppStoreValues={{ isGitSyncEnabled: false }}>
        <TemplatesListView data={mockTemplates.data} gotoPage={noop} onSelect={onSelect} />
      </TestWrapper>
    )
    expect(container.querySelectorAll('.TableV2--body [role="row"]').length).toEqual(
      mockTemplates.data?.content?.length
    )
    act(() => {
      fireEvent.click(container.querySelector('.TableV2--body div[role="row"]') as HTMLElement)
    })
    expect(onSelect).toBeCalledWith(mockTemplates.data?.content?.[0])
  })
})
