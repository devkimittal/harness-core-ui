/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Layout, Text } from '@wings-software/uicore'
import { defaultTo, set, get, isEmpty } from 'lodash-es'
import { Color } from '@harness/design-system'
import type { AllNGVariables as Variable } from '@pipeline/utils/types'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { PredefinedOverrideSets } from '@pipeline/components/PredefinedOverrideSets/PredefinedOverrideSets'
import { usePipelineVariables } from '@pipeline/components/PipelineVariablesContext/PipelineVariablesContext'
import type {
  CustomVariablesData,
  CustomVariableEditableExtraProps
} from '@pipeline/components/PipelineSteps/Steps/CustomVariables/CustomVariableEditable'

import { useStrings } from 'framework/strings'
import type { DeploymentStageElementConfig } from '@pipeline/utils/pipelineTypes'
import type { StageElementWrapperConfig } from 'services/cd-ng'
import type { AbstractStepFactory } from '../AbstractSteps/AbstractStepFactory'
import { getFlattenedStages, getStageIndexFromPipeline } from '../PipelineStudio/StageBuilder/StageBuilderUtil'
import { StepViewType } from '../AbstractSteps/Step'
import { StepWidget } from '../AbstractSteps/StepWidget'

export interface WorkflowVariablesProps {
  isForOverrideSets?: boolean
  identifierName?: string
  isForPredefinedSets?: boolean
  overrideSetIdentifier?: string
  isPropagating?: boolean
  tabName?: string
  formName?: string
  factory: AbstractStepFactory
  readonly?: boolean
}

export default function WorkflowVariables({
  isForOverrideSets = false,
  identifierName,
  isForPredefinedSets = false,
  overrideSetIdentifier = '',
  isPropagating = false,
  tabName,
  formName,
  factory,
  readonly
}: WorkflowVariablesProps): JSX.Element {
  const {
    state: {
      pipeline,
      selectionState: { selectedStageId }
    },
    allowableTypes,
    getStageFromPipeline,
    updatePipeline
  } = usePipelineContext()
  const { getString } = useStrings()

  const { stage } = getStageFromPipeline<DeploymentStageElementConfig>(selectedStageId || '')
  const serviceConfig = stage?.stage?.spec?.serviceConfig || {}
  const parentStage = serviceConfig.useFromStage?.stage
  const { variablesPipeline, metadataMap } = usePipelineVariables()

  const [parentStageData, setParentStageData] = React.useState<StageElementWrapperConfig>()
  React.useEffect(() => {
    if (isEmpty(parentStageData) && parentStage) {
      const { stages } = getFlattenedStages(pipeline)
      const { index } = getStageIndexFromPipeline(pipeline, parentStage)
      setParentStageData(stages[index])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceConfig.useFromStage?.stage, pipeline])

  const stageSpec = defaultTo(serviceConfig.serviceDefinition?.spec, {})
  const predefinedSetsPath = defaultTo(serviceConfig.stageOverrides, {})
  const updateVariables = (vars: Variable[]): void => {
    if (stageSpec || predefinedSetsPath) {
      if (isPropagating) {
        predefinedSetsPath.variables = [...vars]
        updatePipeline(pipeline)
        return
      }
      if (!isForOverrideSets) {
        if (isForPredefinedSets) {
          predefinedSetsPath.variables = vars
        } else {
          stageSpec.variables = vars
        }
      } else {
        const overrideSets = stageSpec.variableOverrideSets || []
        overrideSets.forEach(variableSet => {
          if (variableSet?.overrideSet?.identifier === identifierName) {
            set(variableSet, 'overrideSet.variables', vars)
          }
        })
      }
    }
    updatePipeline(pipeline)
  }

  const getInitialValues = (): Variable[] => {
    if (isPropagating) {
      return get(predefinedSetsPath, 'variables', []) as Variable[]
    }
    if (!isForOverrideSets) {
      if (isForPredefinedSets) {
        return (predefinedSetsPath?.variables || []) as Variable[]
      }
      return (stageSpec?.variables || []) as Variable[]
    }
    if (isForPredefinedSets) {
      return (predefinedSetsPath?.variables || []) as Variable[]
    }
    const overrideSets = stageSpec.variableOverrideSets
    return defaultTo(
      overrideSets
        ?.map(variableSet => {
          if (variableSet?.overrideSet?.identifier === identifierName) {
            return variableSet.overrideSet?.variables
          }
        })
        .filter(x => x !== undefined)[0],
      []
    ) as Variable[]
  }

  const getYamlPropertiesForVariables = (): Variable[] => {
    const { stage: variablesStage } = getStageFromPipeline<DeploymentStageElementConfig>(
      parentStage || selectedStageId || '',
      variablesPipeline
    )
    const variablesServiceConfig = variablesStage?.stage?.spec?.serviceConfig || {}
    const variablesStageSpec = variablesServiceConfig.serviceDefinition?.spec

    if (isPropagating) {
      return get(predefinedSetsPath, 'variables', []) as Variable[]
    }
    if (!isForOverrideSets) {
      if (isForPredefinedSets) {
        return (predefinedSetsPath?.variables || []) as Variable[]
      }
      return (variablesStageSpec?.variables || []) as Variable[]
    }
    if (isForPredefinedSets) {
      return (variablesServiceConfig?.stageOverrides?.variables || []) as Variable[]
    }

    const overrideSets = variablesStageSpec?.variableOverrideSets

    return defaultTo(
      overrideSets
        ?.map(variableSet => {
          if (variableSet?.overrideSet?.identifier === identifierName) {
            return variableSet.overrideSet?.variables
          }
        })
        .filter(x => x !== undefined)[0],
      []
    ) as Variable[]
  }

  return (
    <Layout.Vertical style={{ borderRadius: '5px' }}>
      {isForPredefinedSets && <PredefinedOverrideSets context="VARIABLES" currentStage={stage} />}

      <section>
        {overrideSetIdentifier?.length === 0 && !isForOverrideSets && (
          <Text color={Color.GREY_500} style={{ fontSize: '13px' }}>
            {getString('workflowVariableInfo')}
          </Text>
        )}
        <StepWidget<CustomVariablesData, CustomVariableEditableExtraProps>
          factory={factory}
          stepViewType={StepViewType.StageVariable}
          initialValues={{
            variables: getInitialValues(),
            isPropagating,
            canAddVariable: !overrideSetIdentifier?.length
          }}
          allowableTypes={allowableTypes}
          readonly={readonly}
          type={StepType.CustomVariable}
          onUpdate={({ variables }: { variables: Variable[] }) => {
            updateVariables(variables)
          }}
          customStepProps={{
            tabName,
            formName,
            yamlProperties: getYamlPropertiesForVariables().map(
              variable => metadataMap[variable.value || '']?.yamlProperties || {}
            ),
            enableValidation: true
          }}
        />
      </section>
    </Layout.Vertical>
  )
}
