/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback } from 'react'
import { MultiTypeInputType, NestedAccordionProvider, PageError } from '@wings-software/uicore'
import { isEmpty, noop, omit, set } from 'lodash-es'
import { useTemplateVariables } from '@pipeline/components/TemplateVariablesContext/TemplateVariablesContext'
import { PageSpinner } from '@common/components'
import StageCard from '@pipeline/components/PipelineStudio/PipelineVariables/Cards/StageCard'
import { TemplateContext } from '@templates-library/components/TemplateStudio/TemplateContext/TemplateContext'
import type { PipelineInfoConfig, StageElementConfig, StepElementConfig } from 'services/cd-ng'
import { StepCardPanel } from '@pipeline/components/PipelineStudio/PipelineVariables/Cards/StepCard'
import factory from '@pipeline/components/PipelineSteps/PipelineStepFactory'
import { DefaultNewStageId } from '@templates-library/components/TemplateStudio/StageTemplateCanvas/StageTemplateForm/StageTemplateForm'
import { GitSyncStoreProvider } from 'framework/GitRepoStore/GitSyncStoreContext'
import { sanitize } from '@common/utils/JSONUtils'
import { VariablesHeader } from '@pipeline/components/PipelineStudio/PipelineVariables/VariablesHeader/VariablesHeader'
import { TemplateType } from '@templates-library/utils/templatesUtils'
import { PipelineCardPanel } from '@pipeline/components/PipelineStudio/PipelineVariables/PipelineVariables'
import css from '@pipeline/components/PipelineStudio/PipelineVariables/PipelineVariables.module.scss'

const TemplateVariables: React.FC = (): JSX.Element => {
  const {
    state: { template },
    updateTemplate
  } = React.useContext(TemplateContext)
  const { originalTemplate, variablesTemplate, metadataMap, error, initLoading } = useTemplateVariables()

  const onUpdate = useCallback(
    async (stage: StageElementConfig | StepElementConfig) => {
      const processNode = omit(stage, 'name', 'identifier', 'description', 'tags')
      sanitize(processNode, { removeEmptyArray: false, removeEmptyObject: false, removeEmptyString: false })
      set(originalTemplate, 'spec', processNode)
      await updateTemplate(originalTemplate)
    },
    [originalTemplate, updateTemplate]
  )

  if (initLoading) {
    return <PageSpinner />
  }

  const allowableTypes = [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]

  return (
    <div className={css.pipelineVariables}>
      {error ? (
        <PageError message={(error?.data as Error)?.message || error?.message} />
      ) : !isEmpty(variablesTemplate) ? (
        <div className={css.content}>
          <VariablesHeader enableSearch={false} />
          <div className={css.variableList}>
            <GitSyncStoreProvider>
              {originalTemplate.type === TemplateType.Pipeline && (
                <PipelineCardPanel
                  variablePipeline={variablesTemplate as PipelineInfoConfig}
                  pipeline={{ ...template.spec, identifier: DefaultNewStageId } as PipelineInfoConfig}
                  originalPipeline={{ ...originalTemplate.spec, identifier: DefaultNewStageId } as PipelineInfoConfig}
                  readonly={true}
                  metadataMap={metadataMap}
                  allowableTypes={allowableTypes}
                  stepsFactory={factory}
                  updateStage={onUpdate}
                  updatePipeline={noop}
                />
              )}
              {originalTemplate.type === TemplateType.Stage && (
                <StageCard
                  stage={variablesTemplate as StageElementConfig}
                  unresolvedStage={{ ...template.spec, identifier: DefaultNewStageId } as StageElementConfig}
                  originalStage={{ ...originalTemplate.spec, identifier: DefaultNewStageId } as StageElementConfig}
                  metadataMap={metadataMap}
                  path="template"
                  allowableTypes={allowableTypes}
                  stepsFactory={factory}
                  updateStage={onUpdate}
                />
              )}
              {originalTemplate.type === TemplateType.Step && (
                <StepCardPanel
                  step={variablesTemplate as StepElementConfig}
                  originalStep={originalTemplate.spec as StepElementConfig}
                  metadataMap={metadataMap}
                  readonly={true}
                  stepPath="template"
                  allowableTypes={allowableTypes}
                  stageIdentifier={DefaultNewStageId}
                  onUpdateStep={onUpdate}
                  stepsFactory={factory}
                />
              )}
            </GitSyncStoreProvider>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default function TemplateVariablesWrapper(): React.ReactElement {
  return (
    <NestedAccordionProvider>
      <TemplateVariables />
    </NestedAccordionProvider>
  )
}
