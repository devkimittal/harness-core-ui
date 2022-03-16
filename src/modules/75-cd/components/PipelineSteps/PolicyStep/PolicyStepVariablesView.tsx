/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { pick } from 'lodash-es'

import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import type { VariableResponseMapValue } from 'services/pipeline-ng'

import type { PolicyStepData } from './PolicyStepTypes'

import pipelineVariableCss from '@pipeline/components/PipelineStudio/PipelineVariables/PipelineVariables.module.scss'

export interface PolicyStepVariablesViewProps {
  metadataMap: Record<string, VariableResponseMapValue>
  variablesData: PolicyStepData
  originalData: PolicyStepData
}

export function PolicyStepVariablesView(props: PolicyStepVariablesViewProps): React.ReactElement {
  const { variablesData = {} as PolicyStepData, originalData = {} as PolicyStepData, metadataMap } = props
  const data: Record<string, string> = pick(variablesData.spec, ['type'])

  // istanbul ignore else
  if (variablesData.spec?.policySpec?.payload) {
    data['policySpec.payload'] = variablesData.spec.policySpec.payload
  }

  // istanbul ignore else
  if (Array.isArray(variablesData.spec?.policySets)) {
    data['policySets'] = variablesData.spec.policySets.join(',')
  }

  return (
    <VariablesListTable
      className={pipelineVariableCss.variablePaddingL3}
      metadataMap={metadataMap}
      data={data}
      originalData={originalData?.spec}
    />
  )
}
