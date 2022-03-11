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
import { TemplateType } from '@templates-library/utils/templatesUtils'
import { getTemplateContextMock } from '@templates-library/components/TemplateStudio/__tests__/stateMock'
import { PipelineTemplateCanvasWithRef } from '../PipelineTemplateCanvas'

jest.mock('@pipeline/components/PipelineStudio/StageBuilder/StageBuilder', () => () => (
  <div className="stage-builder-mock"></div>
))

const pipelineTemplateContextMock = getTemplateContextMock(TemplateType.Pipeline)

describe('<PipelineTemplateCanvas/> tests', () => {
  test('should match snapshot', async () => {
    const { container } = render(
      <TestWrapper>
        <TemplateContext.Provider value={pipelineTemplateContextMock}>
          <PipelineTemplateCanvasWithRef />
        </TemplateContext.Provider>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
