/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { StepTemplateCanvasWithRef } from '@templates-library/components/TemplateStudio/StepTemplateCanvas/StepTemplateCanvas'

jest.mock(
  '@templates-library/components/TemplateStudio/StepTemplateCanvas/StepTemplateDiagram/StepTemplateDiagram',
  () => ({
    ...(jest.requireActual(
      '@templates-library/components/TemplateStudio/StepTemplateCanvas/StepTemplateDiagram/StepTemplateDiagram'
    ) as any),
    StepTemplateDiagram: () => {
      return <div className="step-template-diagram-mock" />
    }
  })
)

jest.mock('@templates-library/components/TemplateStudio/StepTemplateCanvas/StepTemplateForm/StepTemplateForm', () => ({
  ...(jest.requireActual(
    '@templates-library/components/TemplateStudio/StepTemplateCanvas/StepTemplateForm/StepTemplateForm'
  ) as any),
  StepTemplateFormWithRef: () => {
    return <div className="step-template-form-mock" />
  }
}))

describe('<StepTemplateCanvas /> test', () => {
  test('Should match snapshot', () => {
    const { container } = render(<StepTemplateCanvasWithRef />)
    expect(container).toMatchSnapshot()
    const resizer = container.querySelector('[class*="Resizer"]')
    expect(resizer).toBeTruthy()
  })
})
