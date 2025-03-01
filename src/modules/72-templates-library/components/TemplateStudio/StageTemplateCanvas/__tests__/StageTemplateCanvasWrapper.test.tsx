/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { StageTemplateCanvasWrapperWithRef } from '../StageTemplateCanvasWrapper'

jest.mock('@templates-library/components/TemplateStudio/StageTemplateCanvas/StageTemplateCanvas', () => ({
  ...(jest.requireActual(
    '@templates-library/components/TemplateStudio/StageTemplateCanvas/StageTemplateCanvas'
  ) as any),
  // eslint-disable-next-line react/display-name
  StageTemplateCanvasWithRef: () => {
    return <div className="stage-template-canvas-mock"></div>
  }
}))

describe('<StageTemplateCanvasWrapper /> tests', () => {
  test('should match snapshot', async () => {
    const { container } = render(
      <TestWrapper>
        <StageTemplateCanvasWrapperWithRef />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
