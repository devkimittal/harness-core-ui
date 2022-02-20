/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, render } from '@testing-library/react'
import { set } from 'lodash-es'
import produce from 'immer'
import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { accountPathProps, pipelineModuleParams, templatePathProps } from '@common/utils/routeUtils'
import { stageTemplateMock } from '@templates-library/components/TemplateStudio/SaveTemplatePopover/__tests__/stateMock'
import { PipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import pipelineContextMock from '@pipeline/components/PipelineStudio/RightDrawer/__tests__/stateMock'
import {
  DefaultNewStageId,
  DefaultNewStageName
} from '@templates-library/components/TemplateStudio/StageTemplateCanvas/StageTemplateForm/StageTemplateForm'
import { StageType } from '@pipeline/utils/stageHelpers'
import { StageTemplateDiagram } from '../StageTemplateDiagram'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')
jest.mock('@wings-software/monaco-yaml/lib/esm/languageservice/yamlLanguageService', () => ({
  getLanguageService: jest.fn()
}))

describe('<StageTemplateDiagram /> tests', () => {
  test('should render plus button when stage is not selected', async () => {
    const context = produce(pipelineContextMock, draft => {
      delete draft.state.pipeline.stages
      draft.getStageFromPipeline = _stageId => {
        return {}
      }
      draft.stagesMap = {
        Deployment: {
          name: 'Deploy',
          type: StageType.DEPLOY,
          icon: 'cd-main',
          iconColor: 'var(--pipeline-deploy-stage-color)',
          isApproval: false,
          openExecutionStrategy: true
        }
      }
    })
    const { container } = render(
      <PipelineContext.Provider value={context}>
        <TestWrapper
          path={routes.toTemplateStudio({ ...accountPathProps, ...templatePathProps, ...pipelineModuleParams })}
          pathParams={{
            templateIdentifier: '-1',
            accountId: 'accountId',
            orgIdentifier: 'default',
            projectIdentifier: 'Yogesh_Test',
            module: 'cd',
            templateType: 'Stage'
          }}
        >
          <StageTemplateDiagram />
        </TestWrapper>
      </PipelineContext.Provider>
    )
    expect(container).toMatchSnapshot()
    const node = container.querySelector('[data-nodeid="create-node"] .defaultNode') as HTMLElement
    expect(node).toBeDefined()
    let dynamicPopover = document.querySelector('[class*="dynamicPopover"]')
    expect(dynamicPopover).toBeNull()
    await act(async () => {
      fireEvent.click(node)
    })
    dynamicPopover = document.querySelector('[class*="dynamicPopover"]')
    expect(dynamicPopover).toBeDefined()
  })

  test('should render stage button when stage is selected', async () => {
    const context = produce(pipelineContextMock, draft => {
      delete draft.state.pipeline.stages
      set(draft, 'state.pipeline.stages[0].stage', {
        ...stageTemplateMock.spec,
        name: DefaultNewStageName,
        identifier: DefaultNewStageId
      })
      draft.stagesMap = {
        Deployment: {
          name: 'Deploy',
          type: StageType.DEPLOY,
          icon: 'cd-main',
          iconColor: 'var(--pipeline-deploy-stage-color)',
          isApproval: false,
          openExecutionStrategy: true
        }
      }
    })

    const { container } = render(
      <PipelineContext.Provider value={context}>
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
          <StageTemplateDiagram />
        </TestWrapper>
      </PipelineContext.Provider>
    )
    expect(container).toMatchSnapshot()
  })
})
