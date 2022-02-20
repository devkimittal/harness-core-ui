/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, queryByText, render } from '@testing-library/react'
import { findDialogContainer, findPopoverContainer, TestWrapper } from '@common/utils/testUtils'
import MonacoEditor from '@common/components/MonacoEditor/__mocks__/MonacoEditor'
import { mockTemplatesSuccessResponse } from '@templates-library/TemplatesTestHelper'
import TemplatesPage from '@templates-library/pages/TemplatesPage/TemplatesPage'

jest.mock('@blueprintjs/core', () => ({
  ...(jest.requireActual('@blueprintjs/core') as any),
  // eslint-disable-next-line react/display-name
  Drawer: ({ children, title }: any) => (
    <div className="drawer-mock">
      {title}
      {children}
    </div>
  )
}))

jest.mock('@common/components/YAMLBuilder/YamlBuilder')
jest.mock('@wings-software/monaco-yaml/lib/esm/languageservice/yamlLanguageService', () => ({
  getLanguageService: jest.fn()
}))

jest.mock('@common/hooks', () => ({
  ...(jest.requireActual('@common/hooks') as any),
  useMutateAsGet: jest.fn().mockImplementation(() => mockTemplatesSuccessResponse)
}))

jest.mock('react-monaco-editor', () => ({
  MonacoDiffEditor: MonacoEditor
}))

jest.mock('@common/components/MonacoEditor/MonacoEditor', () => MonacoEditor)

describe('<TemplatesPage /> tests', () => {
  test('snapshot test in grid view', async () => {
    const { container } = render(
      <TestWrapper>
        <TemplatesPage />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
  test('delete dialog test in grid view', async () => {
    const { container } = render(
      <TestWrapper>
        <TemplatesPage />
      </TestWrapper>
    )

    const firstCard = container.querySelector('.templateCard')
    const optionsMenu = firstCard && firstCard.querySelector('.bp3-icon-more')
    await act(async () => {
      fireEvent.click(optionsMenu!)
    })
    const popover = findPopoverContainer()
    const deleteBtn = queryByText(popover!, 'templatesLibrary.deleteTemplate')
    expect(deleteBtn).toBeDefined()
    await act(async () => {
      fireEvent.click(deleteBtn!)
    })
    expect(findDialogContainer()).toBeTruthy()
  })
  test('setting dialog test in grid view', async () => {
    const { container } = render(
      <TestWrapper>
        <TemplatesPage />
      </TestWrapper>
    )

    const firstCard = container.querySelector('.templateCard')
    const optionsMenu = firstCard && firstCard.querySelector('.bp3-icon-more')
    await act(async () => {
      fireEvent.click(optionsMenu!)
    })
    const popover = findPopoverContainer()
    const settingsBtn = queryByText(popover!, 'templatesLibrary.templateSettings')
    expect(settingsBtn).toBeDefined()
    await act(async () => {
      fireEvent.click(settingsBtn!)
    })
    expect(findDialogContainer()).toBeTruthy()
  })
  test('snapshot test in list view after toggle', async () => {
    const { container } = render(
      <TestWrapper>
        <TemplatesPage />
      </TestWrapper>
    )
    const listViewBtn = container.querySelector('[data-testid="list-view"]')
    expect(listViewBtn).toBeTruthy()
    await act(async () => {
      fireEvent.click(listViewBtn!)
    })
    expect(container).toMatchSnapshot()
  })
  test('should open template drawer when clicked on template card', async () => {
    const { container } = render(
      <TestWrapper>
        <TemplatesPage />
      </TestWrapper>
    )

    const templateCards = container.querySelectorAll('.bp3-card.templateCard')
    expect(templateCards).toHaveLength(1)
    await act(async () => {
      fireEvent.click(templateCards[0])
    })
    const drawer = document.querySelector('.drawer-mock')
    expect(drawer).toBeTruthy()
    expect(drawer!.querySelector('[data-template-id="manjutesttemplate"]')).toBeTruthy()
  })
})
