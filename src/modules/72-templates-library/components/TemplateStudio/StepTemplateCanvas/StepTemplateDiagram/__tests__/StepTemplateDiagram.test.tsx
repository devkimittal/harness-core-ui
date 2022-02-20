/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { set } from 'lodash-es'
import produce from 'immer'
import {
  TemplateContext,
  TemplateContextInterface
} from '@templates-library/components/TemplateStudio/TemplateContext/TemplateContext'
import { TestWrapper } from '@common/utils/testUtils'
import { StepTemplateDiagram } from '@templates-library/components/TemplateStudio/StepTemplateCanvas/StepTemplateDiagram/StepTemplateDiagram'
import type { NGTemplateInfoConfig } from 'services/template-ng'
import type { StepPopoverProps } from '@pipeline/components/PipelineStudio/StepPalette/StepPopover/StepPopover'

const stepTemplateMockWithoutType = {
  name: 'Test Harness Approval Step Template',
  identifier: 'Test_Harness_Approval_Step_Template',
  versionLabel: 'Version1',
  type: 'Step',
  projectIdentifier: 'Yogesh_Test',
  orgIdentifier: 'default',
  tags: {},
  spec: {}
} as NGTemplateInfoConfig

const stepTemplateMock = {
  name: 'Test Harness Approval Step Template',
  identifier: 'Test_Harness_Approval_Step_Template',
  versionLabel: 'Version1',
  type: 'Step',
  projectIdentifier: 'Yogesh_Test',
  orgIdentifier: 'default',
  tags: {},
  spec: {
    type: 'HarnessApproval',
    timeout: '1d',
    spec: {
      approvalMessage: 'Please review the following information and approve the pipeline progression',
      includePipelineExecutionHistory: true,
      approvers: {
        userGroups: '<+input>',
        minimumCount: 1,
        disallowPipelineExecutor: false
      },
      approverInputs: []
    }
  }
} as NGTemplateInfoConfig

const stepStateMockWithoutType = {
  template: stepTemplateMockWithoutType,
  originalTemplate: stepTemplateMockWithoutType,
  stableVersion: 'Version1',
  versions: ['Version1', 'Version2', 'Version3'],
  templateIdentifier: 'Test_Harness_Approval_Step_Template',
  templateView: { isDrawerOpened: false, isYamlEditable: false, drawerData: { type: 'AddCommand' } },
  isLoading: false,
  isBETemplateUpdated: false,
  isDBInitialized: true,
  isUpdated: false,
  isInitialized: true,
  gitDetails: {},
  error: ''
}

const stepTemplateContextMockWithoutType: TemplateContextInterface = {
  state: stepStateMockWithoutType as any,
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

jest.mock('@pipeline/components/PipelineStudio/StepPalette/StepPopover/StepPopover', () => ({
  ...(jest.requireActual('@pipeline/components/PipelineStudio/StepPalette/StepPopover/StepPopover') as any),
  StepPopover: ({ stepData }: StepPopoverProps) => {
    return (
      <div className="step-popover-mock">
        {stepData?.name}
        {stepData?.type}
      </div>
    )
  }
}))

describe('<StepTemplateDiagram /> tests', () => {
  test('should match snapshot when step type is not set', async () => {
    const { container } = render(
      <TestWrapper>
        <TemplateContext.Provider value={stepTemplateContextMockWithoutType}>
          <StepTemplateDiagram />
        </TemplateContext.Provider>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
    expect(stepTemplateContextMockWithoutType.updateTemplateView).toBeCalled()
  })
  test('should open step selection on load when step type is not set', async () => {
    render(
      <TestWrapper>
        <TemplateContext.Provider value={stepTemplateContextMockWithoutType}>
          <StepTemplateDiagram />
        </TemplateContext.Provider>
      </TestWrapper>
    )
    expect(stepTemplateContextMockWithoutType.updateTemplateView).toBeCalled()
  })
  test('should match snapshot when step type is set', async () => {
    const stepTemplateContextMockWithType = produce(stepTemplateContextMockWithoutType, draft => {
      set(draft, 'state.template', stepTemplateMock)
      set(draft, 'state.originalTemplate', stepTemplateMock)
    })
    const { container } = render(
      <TestWrapper>
        <TemplateContext.Provider value={stepTemplateContextMockWithType}>
          <StepTemplateDiagram />
        </TemplateContext.Provider>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
