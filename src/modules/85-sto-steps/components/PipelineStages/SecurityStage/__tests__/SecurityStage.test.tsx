/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { PipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { StageType } from '@pipeline/utils/stageHelpers'
import { SecurityStage } from '../SecurityStage'
import { getMockPipelineContextValue } from './SecurityStageHelpers'
import '../SecurityStage' // eslint-disable-line @typescript-eslint/no-duplicate-imports

describe('Security Stage view', () => {
  test('Basic render, selection and setup stage', async () => {
    const { container } = render(
      <TestWrapper>
        <PipelineContext.Provider value={getMockPipelineContextValue()}>
          <SecurityStage
            name={'Security'}
            type={StageType.SECURITY}
            icon={'sto-color-filled'}
            isDisabled={false}
            isApproval={false}
            title="My Security Stage"
            description={'desc'}
          />
        </PipelineContext.Provider>
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})
