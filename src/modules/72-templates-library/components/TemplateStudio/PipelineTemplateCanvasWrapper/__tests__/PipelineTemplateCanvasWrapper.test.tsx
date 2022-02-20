/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { TemplateContext } from '@templates-library/components/TemplateStudio/TemplateContext/TemplateContext'
import { getTemplateContextMock } from '@templates-library/components/TemplateStudio/SaveTemplatePopover/__tests__/stateMock'
import { TemplateType } from '@templates-library/utils/templatesUtils'
import { PipelineTemplateCanvasWrapperWithRef } from '../PipelineTemplateCanvasWrapper'

describe('<PipelineTemplateCanvasWrapper/> tests', () => {
  const pipelineTemplateContextMock = getTemplateContextMock(TemplateType.Pipeline)
  test('should match snapshot', async () => {
    const { container } = render(
      <TestWrapper>
        <TemplateContext.Provider value={pipelineTemplateContextMock}>
          <PipelineTemplateCanvasWrapperWithRef />
        </TemplateContext.Provider>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
