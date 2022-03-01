/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, getByRole, queryByAttribute, render, waitFor } from '@testing-library/react'
import produce from 'immer'
import { set } from 'lodash-es'
import { useLocation } from 'react-router-dom'
import { findDialogContainer, TestWrapper } from '@common/utils/testUtils'
import { TemplateContext } from '@templates-library/components/TemplateStudio/TemplateContext/TemplateContext'
import routes from '@common/RouteDefinitions'
import { accountPathProps, pipelineModuleParams, templatePathProps } from '@common/utils/routeUtils'
import { useUpdateStableTemplate } from 'services/template-ng'
import { getTemplateContextMock } from '@templates-library/components/TemplateStudio/SaveTemplatePopover/__tests__/stateMock'
import { TemplateType } from '@templates-library/utils/templatesUtils'
import {
  TemplateStudioSubHeaderLeftView,
  TemplateStudioSubHeaderLeftViewProps
} from '../TemplateStudioSubHeaderLeftView'

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

function ComponentWrapper(props: TemplateStudioSubHeaderLeftViewProps): React.ReactElement {
  const location = useLocation()
  return (
    <React.Fragment>
      <TemplateStudioSubHeaderLeftView {...props} />
      <div data-testid="location">{`${location.pathname}${
        location.search ? `?${location.search.replace(/^\?/g, '')}` : ''
      }`}</div>
    </React.Fragment>
  )
}

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

  test('Change version should work as expected', async () => {
    const { getByTestId } = render(
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
        <TemplateContext.Provider value={stepTemplateContextMock}>
          <ComponentWrapper />
        </TemplateContext.Provider>
      </TestWrapper>
    )

    const selectVersionButton = getByTestId('dropdown-button')
    await act(async () => {
      fireEvent.click(selectVersionButton)
    })
    await waitFor(() => queryByAttribute('class', document.body, 'bp3-popover-content'))
    const menuItems = document.querySelectorAll('[class*="menuItem"]')
    expect(menuItems?.length).toBe(3)

    await act(async () => {
      fireEvent.click(menuItems[1])
    })
    expect(stepTemplateContextMock.deleteTemplateCache).toBeCalled()
    await waitFor(() => getByTestId('location'))
    expect(getByTestId('location')).toMatchInlineSnapshot(`
      <div
        data-testid="location"
      >
        /account/accountId/cd/orgs/default/projects/Yogesh_Test/setup/resources/template-studio/Step/template/Test_Template/?versionLabel=v2
      </div>
    `)
  })

  test('edit btn should work as expected', async () => {
    const { container, getByTestId } = render(
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
    expect(stepTemplateContextMock.updateTemplate).not.toBeCalled()

    await act(async () => {
      fireEvent.click(editBtn)
    })
    modal = findDialogContainer()
    const saveBtn = getByRole(modal!, 'button', { name: 'save' })
    await act(async () => {
      fireEvent.change(modal!.querySelector("input[name='name']")!, {
        target: { value: 'New Test Template' }
      })
    })
    await act(async () => {
      fireEvent.click(getByTestId('description-edit'))
    })
    await act(async () => {
      fireEvent.change(modal!.querySelector("textarea[name='description']")!, {
        target: { value: 'This is a new description' }
      })
    })
    await act(async () => {
      fireEvent.change(modal!.querySelector("input[name='versionLabel']")!, {
        target: { value: 'v4' }
      })
    })
    await act(async () => {
      fireEvent.click(saveBtn)
    })
    expect(stepTemplateContextMock.updateTemplate).toBeCalledWith({
      description: 'This is a new description',
      identifier: 'Test_Template',
      name: 'New Test Template',
      orgIdentifier: 'default',
      projectIdentifier: 'Yogesh_Test',
      spec: {
        spec: { headers: [], method: 'GET', outputVariables: [], requestBody: '<+input>', url: '<+input>' },
        timeout: '1m 40s',
        type: 'Http'
      },
      tags: {},
      type: 'Step',
      versionLabel: 'v4'
    })
  })
})
