/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { IconName } from '@wings-software/uicore'
import { defaultTo, get } from 'lodash-es'
import type { UseStringsReturn } from 'framework/strings'
import { TemplateType } from '@templates-library/utils/templatesUtils'
import type { TemplateSummaryResponse } from 'services/template-ng'
import factory from '@pipeline/components/PipelineSteps/PipelineStepFactory'
import { stagesCollection } from '@pipeline/components/PipelineStudio/Stages/StagesCollection'
import type { NGTemplateInfoConfigWithGitDetails } from 'framework/Templates/TemplateConfigModal/TemplateConfigModal'

export const templateColorStyleMap: { [keyof in TemplateType]: React.CSSProperties } = {
  [TemplateType.Step]: {
    color: '#592BAA',
    stroke: '#E1D0FF',
    fill: '#EADEFF'
  },
  [TemplateType.Stage]: {
    color: '#06B7C3',
    stroke: '#C0FBFE',
    fill: '#D3FCFE'
  },
  [TemplateType.Pipeline]: {
    color: '#004BA4',
    stroke: '#CCCBFF',
    fill: '#E8E8FF'
  },
  [TemplateType.Service]: {
    color: '#299B2C',
    stroke: '#D4E7D1',
    fill: '#E4F7E1'
  },
  [TemplateType.StepGroup]: {
    color: '#299B2C',
    stroke: '#D4E7D1',
    fill: '#E4F7E1'
  },
  [TemplateType.Execution]: {
    color: '#299B2C',
    stroke: '#D4E7D1',
    fill: '#E4F7E1'
  },
  [TemplateType.Infrastructure]: {
    color: '#299B2C',
    stroke: '#D4E7D1',
    fill: '#E4F7E1'
  }
}

export const templateStudioColorStyleMap: { [keyof in TemplateType]: React.CSSProperties } = {
  [TemplateType.Step]: {
    color: '#EADEFF',
    stroke: '#6938C0',
    fill: '#7D4DD3'
  },
  [TemplateType.Stage]: {
    color: '#E8E8FF',
    stroke: '#03C0CD',
    fill: '#0BC8D6'
  },
  [TemplateType.Service]: {
    color: '#299B2C',
    stroke: '#D4E7D1',
    fill: '#E4F7E1'
  },
  [TemplateType.Pipeline]: {
    color: '#E8E8FF',
    stroke: '#5452F6',
    fill: '#6563F0'
  },
  [TemplateType.StepGroup]: {
    color: '#299B2C',
    stroke: '#D4E7D1',
    fill: '#E4F7E1'
  },
  [TemplateType.Execution]: {
    color: '#299B2C',
    stroke: '#D4E7D1',
    fill: '#E4F7E1'
  },
  [TemplateType.Infrastructure]: {
    color: '#299B2C',
    stroke: '#D4E7D1',
    fill: '#E4F7E1'
  }
}

export enum Sort {
  DESC = 'DESC',
  ASC = 'ASC'
}

export enum TemplateListType {
  Stable = 'Stable',
  LastUpdated = 'LastUpdated',
  All = 'All'
}

export enum SortFields {
  LastUpdatedAt = 'lastUpdatedAt',
  RecentActivity = 'executionSummaryInfo.lastExecutionTs',
  AZ09 = 'AZ09',
  ZA90 = 'ZA90',
  Name = 'name'
}

export const getTypeForTemplate = (
  template: TemplateSummaryResponse,
  getString: UseStringsReturn['getString']
): string => {
  const entityType = template.templateEntityType as TemplateType
  const type = defaultTo(template.childType, '')
  switch (entityType) {
    case TemplateType.Step:
      return defaultTo(factory.getStepName(type), '')
    case TemplateType.Stage:
      return defaultTo(stagesCollection.getStageAttributes(type, getString)?.name, '')
    default:
      return ''
  }
}

export const getIconForTemplate = (
  template: NGTemplateInfoConfigWithGitDetails | TemplateSummaryResponse,
  getString: UseStringsReturn['getString']
): IconName => {
  const entityType =
    (template as TemplateSummaryResponse)?.templateEntityType || (template as NGTemplateInfoConfigWithGitDetails)?.type
  const type =
    (template as TemplateSummaryResponse).childType ||
    get(template as NGTemplateInfoConfigWithGitDetails, 'spec.type', 'disable')
  switch (entityType) {
    case TemplateType.Step:
      return factory.getStepIcon(type)
    case TemplateType.Stage:
      return defaultTo(stagesCollection.getStageAttributes(type, getString)?.icon, 'disable')
    default:
      return 'disable'
  }
}
