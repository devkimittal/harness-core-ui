/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import TemplateStageSetupShell from '@templates-library/components/TemplateStageSetupShell/TemplateStageSetupShell'

jest.mock('@templates-library/components/TemplateStageSpecifications/TemplateStageSpecifications', () => ({
  ...(jest.requireActual(
    '@templates-library/components/TemplateStageSpecifications/TemplateStageSpecifications'
  ) as any),
  TemplateStageSpecifications: () => {
    return <div className="template-stage-specifications" />
  }
}))

describe('<TemplateStageSetupShell /> tests', () => {
  test('snapshot test', async () => {
    const { container } = render(<TemplateStageSetupShell />)
    expect(container).toMatchSnapshot()
  })
})
