/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, getByRole, render } from '@testing-library/react'
import produce from 'immer'
import { set } from 'lodash-es'
import { findDialogContainer, TestWrapper } from '@common/utils/testUtils'
import { TemplateContext } from '@templates-library/components/TemplateStudio/TemplateContext/TemplateContext'
import routes from '@common/RouteDefinitions'
import { accountPathProps, pipelineModuleParams, templatePathProps } from '@common/utils/routeUtils'
import { useUpdateStableTemplate } from 'services/template-ng'
import { getTemplateContextMock } from '@templates-library/components/TemplateStudio/SaveTemplatePopover/__tests__/stateMock'
import { TemplateType } from '@templates-library/utils/templatesUtils'
import { TemplateStudioSubHeaderLeftView } from '../TemplateStudioSubHeaderLeftView'

jest.mock('@wings-software/monaco-yaml/lib/esm/languageservice/yamlLanguageService', () => ({
  getLanguageService: jest.fn()
}))

jest.mock('services/template-ng', () => ({
  useUpdateStableTemplate: jest.fn().mockImplementation(() => {
    return {
      mutate: () =>
        Promise.resolve({
          data: { name: 'NewConnectorCreated' }
        }),
      loading: false
    }
  })
}))

describe('<TemplateStudioSubHeaderLeftView /> tests', () => {
  const stepTemplateContextMock = getTemplateContextMock(TemplateType.Step)
  test('snapshot test', async () => {
    const { container } = render(
      <TemplateContext.Provider value={stepTemplateContextMock}>
        <TestWrapper
          path={routes.toTemplateStudio({ ...accountPathProps, ...templatePathProps, ...pipelineModuleParams })}
          pathParams={{
            templateIdentifier: 'Test_Template',
            accountId: 'accountId',
            orgIdentifier: 'default',
            projectIdentifier: 'Yogesh_Test',
            module: 'cd',
            templateType: 'Step',
            versionLabel: 'v1'
          }}
        >
          <TemplateStudioSubHeaderLeftView />
        </TestWrapper>
      </TemplateContext.Provider>
    )
    expect(container).toMatchSnapshot()
  })

  test('update stable template test', async () => {
    const templateContextMock = produce(stepTemplateContextMock, draft => {
      set(draft, 'state.stableVersion', 'v2')
    })
    const { getByText } = render(
      <TemplateContext.Provider value={templateContextMock}>
        <TestWrapper
          path={routes.toTemplateStudio({ ...accountPathProps, ...templatePathProps, ...pipelineModuleParams })}
          pathParams={{
            templateIdentifier: 'Test_Template',
            accountId: 'accountId',
            orgIdentifier: 'default',
            projectIdentifier: 'Yogesh_Test',
            module: 'cd',
            templateType: 'Step',
            versionLabel: 'v1'
          }}
        >
          <TemplateStudioSubHeaderLeftView />
        </TestWrapper>
      </TemplateContext.Provider>
    )

    const stableBtn = getByText('common.setAsStable')
    await act(async () => {
      fireEvent.click(stableBtn)
    })

    const modal = findDialogContainer()
    expect(modal).toMatchSnapshot()
    const confirmBtn = getByRole(modal!, 'button', { name: 'confirm' })
    expect(confirmBtn).toBeDefined()
    await act(async () => {
      fireEvent.click(confirmBtn)
    })
    expect(useUpdateStableTemplate).toBeCalled()
  })

  test('edit btn should work as expected', async () => {
    const { container } = render(
      <TemplateContext.Provider value={stepTemplateContextMock}>
        <TestWrapper
          path={routes.toTemplateStudio({ ...accountPathProps, ...templatePathProps, ...pipelineModuleParams })}
          pathParams={{
            templateIdentifier: 'Test_Http_Template',
            accountId: 'accountId',
            orgIdentifier: 'default',
            projectIdentifier: 'Yogesh_Test',
            module: 'cd',
            templateType: 'Step',
            versionLabel: 'v1'
          }}
        >
          <TemplateStudioSubHeaderLeftView />
        </TestWrapper>
      </TemplateContext.Provider>
    )

    const editBtn = container.querySelector('[data-icon="Edit"]') as Element
    expect(editBtn).toBeDefined()
    await act(async () => {
      fireEvent.click(editBtn)
    })
    let modal = findDialogContainer()
    expect(modal).toMatchSnapshot()

    const cancelBtn = getByRole(modal!, 'button', { name: 'cancel' })
    await act(async () => {
      fireEvent.click(cancelBtn)
    })
    expect(stepTemplateContextMock.updateTemplate).toBeCalledTimes(0)

    await act(async () => {
      fireEvent.click(editBtn)
    })
    modal = findDialogContainer()
    const saveBtn = getByRole(modal!, 'button', { name: 'save' })
    await act(async () => {
      fireEvent.click(saveBtn)
    })
    expect(stepTemplateContextMock.updateTemplate).toBeCalled()
  })
})
