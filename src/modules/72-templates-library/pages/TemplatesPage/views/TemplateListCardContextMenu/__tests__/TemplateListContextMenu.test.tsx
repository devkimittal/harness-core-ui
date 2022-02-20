/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { findByText, fireEvent, getByRole, render } from '@testing-library/react'
import { findPopoverContainer, TestWrapper } from '@common/utils/testUtils'
import { mockTemplates } from '@templates-library/TemplatesTestHelper'
import { TemplateListCardContextMenu } from '../TemplateListCardContextMenu'

describe('<TemplateListContextMenu /> tests', () => {
  const template = mockTemplates.data?.content?.[0] || {}
  test('snapshot test', async () => {
    const { container } = render(
      <TestWrapper>
        <TemplateListCardContextMenu template={template} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
  test('menu should open on click', async () => {
    const onDelete = jest.fn()
    const onOpenSettings = jest.fn()
    const onPreview = jest.fn()
    const onOpenEdit = jest.fn()

    const { container } = render(
      <TestWrapper>
        <TemplateListCardContextMenu
          template={mockTemplates.data?.content?.[0] || {}}
          onDelete={onDelete}
          onOpenSettings={onOpenSettings}
          onPreview={onPreview}
          onOpenEdit={onOpenEdit}
        />
      </TestWrapper>
    )

    const menuBtn = getByRole(container, 'button', { name: 'more' })
    fireEvent.click(menuBtn)

    const popover = findPopoverContainer()

    const previewBtn = await findByText(popover as HTMLElement, 'connectors.ceAws.crossAccountRoleExtention.step1.p2')
    fireEvent.click(previewBtn)
    expect(onPreview).toBeCalledWith(template)

    const editBtn = await findByText(popover as HTMLElement, 'templatesLibrary.openEditTemplate')
    fireEvent.click(editBtn)
    expect(onOpenEdit).toBeCalledWith(template)

    const settingsBtn = await findByText(popover as HTMLElement, 'templatesLibrary.templateSettings')
    fireEvent.click(settingsBtn)
    expect(onOpenSettings).toBeCalledWith(template.identifier)

    const deleteBtn = await findByText(popover as HTMLElement, 'templatesLibrary.deleteTemplate')
    fireEvent.click(deleteBtn)
    expect(onDelete).toBeCalledWith(template)
  })
})
