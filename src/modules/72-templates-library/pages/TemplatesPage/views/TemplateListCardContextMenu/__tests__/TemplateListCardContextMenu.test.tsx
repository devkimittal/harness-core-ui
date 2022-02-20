/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { findByText, fireEvent, getByRole, render } from '@testing-library/react'
import { defaultTo } from 'lodash-es'
import { findPopoverContainer, TestWrapper } from '@common/utils/testUtils'
import { mockTemplates } from '@templates-library/TemplatesTestHelper'
import { TemplateListCardContextMenu } from '../TemplateListCardContextMenu'

describe('<TemplateListCardContextMenu /> tests', () => {
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
    const baseProps = {
      template: defaultTo(mockTemplates.data?.content?.[0], {}),
      onDelete: jest.fn(),
      onOpenSettings: jest.fn(),
      onPreview: jest.fn(),
      onOpenEdit: jest.fn()
    }

    const { container } = render(
      <TestWrapper>
        <TemplateListCardContextMenu {...baseProps} />
      </TestWrapper>
    )

    const menuBtn = getByRole(container, 'button', { name: 'more' })
    fireEvent.click(menuBtn)

    const popover = findPopoverContainer()

    const previewBtn = await findByText(popover as HTMLElement, 'connectors.ceAws.crossAccountRoleExtention.step1.p2')
    fireEvent.click(previewBtn)
    expect(baseProps.onPreview).toBeCalledWith(template)

    const editBtn = await findByText(popover as HTMLElement, 'templatesLibrary.openEditTemplate')
    fireEvent.click(editBtn)
    expect(baseProps.onOpenEdit).toBeCalledWith(template)

    const settingsBtn = await findByText(popover as HTMLElement, 'templatesLibrary.templateSettings')
    fireEvent.click(settingsBtn)
    expect(baseProps.onOpenSettings).toBeCalledWith(template.identifier)

    const deleteBtn = await findByText(popover as HTMLElement, 'templatesLibrary.deleteTemplate')
    fireEvent.click(deleteBtn)
    expect(baseProps.onDelete).toBeCalledWith(template)
  })
})
