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
import { TemplateContext } from '@templates-library/components/TemplateStudio/TemplateContext/TemplateContext'
import { TestWrapper } from '@common/utils/testUtils'
import { StepTemplateDiagram } from '@templates-library/components/TemplateStudio/StepTemplateCanvas/StepTemplateDiagram/StepTemplateDiagram'
import type { NGTemplateInfoConfig } from 'services/template-ng'
import type { StepPopoverProps } from '@pipeline/components/PipelineStudio/StepPalette/StepPopover/StepPopover'
import { TemplateType } from '@templates-library/utils/templatesUtils'
import { getTemplateContextMock } from '@templates-library/components/TemplateStudio/__tests__/stateMock'

const stepTemplateMockWithoutType = {
  name: 'Test Template',
  identifier: 'Test_Template',
  versionLabel: 'v1',
  type: 'Step',
  projectIdentifier: 'Yogesh_Test',
  orgIdentifier: 'default',
  tags: {},
  spec: {}
} as NGTemplateInfoConfig

const stepTemplateMock = {
  name: 'Test Template',
  identifier: 'Test_Template',
  versionLabel: 'v1',
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

const stepTemplateContextMock = getTemplateContextMock(TemplateType.Step)

describe('<StepTemplateDiagram /> tests', () => {
  test('should match snapshot when step type is not set', async () => {
    const stepTemplateContextMockWithoutType = produce(stepTemplateContextMock, draft => {
      set(draft, 'state.template', stepTemplateMockWithoutType)
    })
    const { container } = render(
      <TestWrapper>
        <TemplateContext.Provider value={stepTemplateContextMockWithoutType}>
          <StepTemplateDiagram />
        </TemplateContext.Provider>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test.only('should open step selection on load when step type is not set', async () => {
    const stepTemplateContextMockWithoutType = produce(stepTemplateContextMock, draft => {
      set(draft, 'state.template', stepTemplateMockWithoutType)
    })
    render(
      <TestWrapper>
        <TemplateContext.Provider value={stepTemplateContextMockWithoutType}>
          <StepTemplateDiagram />
        </TemplateContext.Provider>
      </TestWrapper>
    )
    expect(stepTemplateContextMockWithoutType.updateTemplateView).toBeCalledWith({
      drawerData: { data: { paletteData: { onSelection: expect.any(Function) } }, type: 'AddCommand' },
      isDrawerOpened: true,
      isYamlEditable: false
    })
  })

  test('should match snapshot when step type is set', async () => {
    const stepTemplateContextMockWithType = produce(stepTemplateContextMock, draft => {
      set(draft, 'state.template', stepTemplateMock)
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
