/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import { findPopoverContainer, TestWrapper } from '@common/utils/testUtils'
import { TemplateContext } from '@templates-library/components/TemplateStudio/TemplateContext/TemplateContext'
import { DefaultNewTemplateId } from 'framework/Templates/templates'
import routes from '@common/RouteDefinitions'
import { accountPathProps, pipelineModuleParams, templatePathProps } from '@common/utils/routeUtils'
import { TemplateType } from '@templates-library/utils/templatesUtils'
import { getTemplateContextMock } from '@templates-library/components/TemplateStudio/__tests__/stateMock'
import { SaveTemplatePopover } from '../SaveTemplatePopover'

const PATH = routes.toTemplateStudio({ ...accountPathProps, ...templatePathProps, ...pipelineModuleParams })
const PATH_PARAMS = {
  templateIdentifier: 'Test_Template',
  accountId: 'accountId',
  orgIdentifier: 'orgIdentifier',
  projectIdentifier: 'projectIdentifier',
  module: 'cd',
  templateType: 'Step'
}

const stepTemplateContextMock = getTemplateContextMock(TemplateType.Step)

describe('<SaveTemplatePopover /> tests', () => {
  test('should match snapshot', async () => {
    const { container } = render(
      <TestWrapper path={PATH} pathParams={PATH_PARAMS}>
        <TemplateContext.Provider value={stepTemplateContextMock}>
          <SaveTemplatePopover />
        </TemplateContext.Provider>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('should not show popover on click when creating a template', async () => {
    const { getByText } = render(
      <TestWrapper path={PATH} pathParams={{ ...PATH_PARAMS, templateIdentifier: DefaultNewTemplateId }}>
        <TemplateContext.Provider value={stepTemplateContextMock}>
          <SaveTemplatePopover />
        </TemplateContext.Provider>
      </TestWrapper>
    )

    const saveButton = getByText('save')
    act(() => {
      fireEvent.click(saveButton)
    })

    const popover = findPopoverContainer()
    expect(popover).not.toBeTruthy()
  })

  test('should show popover on click when editing a template', async () => {
    const { getByText } = render(
      <TestWrapper path={PATH} pathParams={PATH_PARAMS}>
        <TemplateContext.Provider value={stepTemplateContextMock}>
          <SaveTemplatePopover />
        </TemplateContext.Provider>
      </TestWrapper>
    )

    const saveButton = getByText('save')
    act(() => {
      fireEvent.click(saveButton)
    })

    const popover = findPopoverContainer()
    expect(popover).toBeTruthy()
  })
})
