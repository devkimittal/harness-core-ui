/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, getByRole, render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { useMutateAsGet } from '@common/hooks'
import { mockTemplatesSuccessResponse } from '@templates-library/TemplatesTestHelper'
import { PipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import pipelineContextMock from '@pipeline/components/PipelineStudio/RightDrawer/__tests__/stateMock'
import { TemplateDrawer } from '@templates-library/components/TemplateDrawer/TemplateDrawer'
import routes from '@common/RouteDefinitions'
import { accountPathProps, pipelineModuleParams, pipelinePathProps } from '@common/utils/routeUtils'

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

jest.mock('@wings-software/monaco-yaml/lib/esm/languageservice/yamlLanguageService', () => ({
  getLanguageService: jest.fn()
}))

jest.mock('@common/hooks', () => ({
  ...(jest.requireActual('@common/hooks') as any),
  useMutateAsGet: jest.fn()
}))

describe('<TemplateDrawer /> tests', () => {
  beforeEach(() => {
    // eslint-disable-next-line
    // @ts-ignore
    useMutateAsGet.mockReturnValue(mockTemplatesSuccessResponse)
  })
  test('snapshot test', async () => {
    render(
      <PipelineContext.Provider value={pipelineContextMock}>
        <TestWrapper
          path={routes.toPipelineStudio({ ...accountPathProps, ...pipelinePathProps, ...pipelineModuleParams })}
          pathParams={{
            accountId: 'accountId',
            orgIdentifier: 'orgIdentifier',
            projectIdentifier: 'projectIdentifier',
            module: 'module',
            pipelineIdentifier: 'pipelineIdentifier'
          }}
        >
          <TemplateDrawer />
        </TestWrapper>
      </PipelineContext.Provider>
    )
    expect(useMutateAsGet).toHaveBeenCalled()
  })
  test('clicking on close button should close drawer', () => {
    const { container } = render(
      <PipelineContext.Provider value={pipelineContextMock}>
        <TestWrapper>
          <TemplateDrawer />
        </TestWrapper>
      </PipelineContext.Provider>
    )
    const closeBtn = getByRole(container, 'button', { name: 'cross' })
    act(() => {
      fireEvent.click(closeBtn)
    })
    expect(pipelineContextMock.updateTemplateView).toHaveBeenCalled()
  })
})
