/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { noop, set } from 'lodash-es'
import produce from 'immer'
import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { accountPathProps, pipelineModuleParams, templatePathProps } from '@common/utils/routeUtils'
import { PipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import pipelineContextMock from '@pipeline/components/PipelineStudio/RightDrawer/__tests__/stateMock'
import { StageTemplateFormWithRef } from '../StageTemplateForm'

describe('<StageTemplateFormWithRef /> tests', () => {
  const contextMock = produce(pipelineContextMock, draft => {
    set(draft, 'contextType', 'Template')
  })
  test('snapshot test', async () => {
    const { container } = render(
      <TestWrapper
        path={routes.toTemplateStudio({ ...accountPathProps, ...templatePathProps, ...pipelineModuleParams })}
        pathParams={{
          templateIdentifier: 'new_stage_name',
          accountId: 'accountId',
          orgIdentifier: 'default',
          projectIdentifier: 'Yogesh_Test',
          module: 'cd',
          templateType: 'Stage'
        }}
      >
        <PipelineContext.Provider value={contextMock}>
          <StageTemplateFormWithRef />
        </PipelineContext.Provider>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
    expect(contextMock.renderPipelineStage).toBeCalledWith({
      stageType: 'CI',
      minimal: false,
      contextType: 'Template',
      templateTypes: contextMock.state.templateTypes,
      setTemplateTypes: contextMock.setTemplateTypes,
      openTemplateSelector: noop,
      closeTemplateSelector: noop
    })
  })
})
