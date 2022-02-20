/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import {
  TemplateContext,
  TemplateContextInterface
} from '@templates-library/components/TemplateStudio/TemplateContext/TemplateContext'
import { TestWrapper } from '@common/utils/testUtils'
import { StepTemplateDiagram } from '@templates-library/components/TemplateStudio/StepTemplateCanvas/StepTemplateDiagram/StepTemplateDiagram'
import type { NGTemplateInfoConfig } from 'services/template-ng'

export const stepTemplateMock = {
  name: 'Test Http Template',
  identifier: 'Test_Http_Template',
  versionLabel: 'v1',
  type: 'Step',
  projectIdentifier: 'Yogesh_Test',
  orgIdentifier: 'default',
  tags: {},
  spec: {}
} as NGTemplateInfoConfig

const stepStateMock = {
  template: stepTemplateMock,
  originalTemplate: stepTemplateMock,
  stableVersion: 'v2',
  versions: ['v1', 'v2', 'v3'],
  templateIdentifier: 'Test_Http_Template',
  templateView: { isDrawerOpened: false, isYamlEditable: false, drawerData: { type: 'AddCommand' } },
  isLoading: false,
  isBETemplateUpdated: false,
  isDBInitialized: true,
  isUpdated: false,
  isInitialized: true,
  gitDetails: {},
  error: ''
}

const stepTemplateContextMock: TemplateContextInterface = {
  state: stepStateMock as any,
  view: 'VISUAL',
  isReadonly: false,
  setView: () => void 0,
  fetchTemplate: () => new Promise<void>(() => undefined),
  setYamlHandler: () => undefined,
  updateTemplate: jest.fn(),
  updateTemplateView: jest.fn(),
  deleteTemplateCache: () => new Promise<void>(() => undefined),
  setLoading: () => void 0,
  updateGitDetails: () => new Promise<void>(() => undefined)
}

describe('<StepTemplateDiagram /> tests', () => {
  test('snapshot test when step type is not set', async () => {
    const { container } = render(
      <TestWrapper>
        <TemplateContext.Provider value={stepTemplateContextMock}>
          <StepTemplateDiagram />
        </TemplateContext.Provider>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
    expect(stepTemplateContextMock.updateTemplateView).toBeCalled()
  })
  test('should open step selection on load when step type is not set', async () => {
    render(
      <TestWrapper>
        <TemplateContext.Provider value={stepTemplateContextMock}>
          <StepTemplateDiagram />
        </TemplateContext.Provider>
      </TestWrapper>
    )
    expect(stepTemplateContextMock.updateTemplateView).toBeCalled()
  })
})
