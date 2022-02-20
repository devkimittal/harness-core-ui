/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, render, waitFor } from '@testing-library/react'
import { TemplateContext } from '@templates-library/components/TemplateStudio/TemplateContext/TemplateContext'
import {
  getTemplateContextMock,
  stepTemplateMock
} from '@templates-library/components/TemplateStudio/SaveTemplatePopover/__tests__/stateMock'
import { TestWrapper } from '@common/utils/testUtils'
import type { StepCommandsProps } from '@pipeline/components/PipelineStudio/StepCommands/StepCommandTypes'
import { StepTemplateFormWithRef } from '@templates-library/components/TemplateStudio/StepTemplateCanvas/StepTemplateForm/StepTemplateForm'
import { TemplateType } from '@templates-library/utils/templatesUtils'

jest.mock('@pipeline/components/PipelineStudio/StepCommands/StepCommands', () => ({
  ...(jest.requireActual('@pipeline/components/PipelineStudio/StepCommands/StepCommands') as any),
  StepCommandsWithRef: ({ onChange }: StepCommandsProps) => {
    return (
      <div className="step-commands-mock">
        <button
          onClick={() => {
            onChange?.({ ...stepTemplateMock.spec, timeout: '2m' })
          }}
        >
          onChange Button
        </button>
      </div>
    )
  }
}))

jest.mock('lodash-es', () => ({
  ...(jest.requireActual('lodash-es') as Record<string, any>),
  debounce: jest.fn(fn => {
    fn.cancel = jest.fn()
    return fn
  })
}))

describe('<StepTemplateForm /> tests', () => {
  const stepTemplateContextMock = getTemplateContextMock(TemplateType.Step)
  test('snapshot test', async () => {
    const { container, findByText } = render(
      <TestWrapper>
        <TemplateContext.Provider value={stepTemplateContextMock}>
          <StepTemplateFormWithRef />
        </TemplateContext.Provider>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()

    const button = await waitFor(() => findByText('onChange Button'))
    await act(async () => {
      fireEvent.click(button as HTMLElement)
    })
    expect(stepTemplateContextMock.updateTemplate).toBeCalled()
  })
})
