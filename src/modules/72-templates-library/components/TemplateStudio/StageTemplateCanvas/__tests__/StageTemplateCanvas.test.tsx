/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { StageTemplateCanvasWithRef } from '../StageTemplateCanvas'

jest.mock('@templates-library/components/TemplateStudio/StageTemplateCanvas/StageTemplateCanvasInternal', () => ({
  ...(jest.requireActual(
    '@templates-library/components/TemplateStudio/StageTemplateCanvas/StageTemplateCanvasInternal'
  ) as any),
  // eslint-disable-next-line react/display-name
  StageTemplateCanvasInternalWithRef: () => {
    return <div className="stage-template-canvas-internal-mock"></div>
  }
}))

describe('<StageTemplateCanvas /> tests', () => {
  test('should match snapshot', async () => {
    const { container } = render(
      <TestWrapper>
        <StageTemplateCanvasWithRef />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
