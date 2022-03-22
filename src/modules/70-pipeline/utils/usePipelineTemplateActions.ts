/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { defaultTo, isEqual } from 'lodash-es'
import { parse } from 'yaml'
import produce from 'immer'
import { useCallback } from 'react'
import type { PipelineInfoConfig } from 'services/cd-ng'
import type { TemplateSummaryResponse } from 'services/template-ng'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { useTemplateSelector } from '@pipeline/utils/useTemplateSelector'
import { createTemplate } from '@pipeline/utils/templateUtils'
import { getIdentifierFromValue } from '@common/components/EntityReference/EntityReference'

interface TemplateActionsReturnType {
  onUseTemplate: (template: TemplateSummaryResponse, isCopied?: boolean) => Promise<void>
  onRemoveTemplate: () => Promise<void>
  onOpenTemplateSelector: () => void
}

export function usePipelineTemplateActions(): TemplateActionsReturnType {
  const {
    state: { pipeline, templateTypes },
    setTemplateTypes,
    updatePipeline
  } = usePipelineContext()
  const { openTemplateSelector, closeTemplateSelector } = useTemplateSelector()

  const onUseTemplate = useCallback(
    async (template: TemplateSummaryResponse, isCopied = false) => {
      closeTemplateSelector()
      if (
        !isCopied &&
        isEqual(pipeline?.template?.templateRef, template.identifier) &&
        isEqual(pipeline?.template?.versionLabel, template.versionLabel)
      ) {
        return
      }
      const processNode = isCopied
        ? produce(defaultTo(parse(template?.yaml || '')?.template.spec, {}) as PipelineInfoConfig, draft => {
            draft.name = defaultTo(pipeline?.name, '')
            draft.identifier = defaultTo(pipeline?.identifier, '')
          })
        : createTemplate(pipeline, template)
      await updatePipeline(processNode)
      if (!isCopied && template?.identifier && template?.childType) {
        templateTypes[template.identifier] = template.childType
        setTemplateTypes(templateTypes)
      }
    },
    [closeTemplateSelector, pipeline, updatePipeline]
  )

  const onOpenTemplateSelector = useCallback(() => {
    openTemplateSelector({
      templateType: 'Pipeline',
      selectedTemplateRef: getIdentifierFromValue(defaultTo(pipeline.template?.templateRef, '')),
      selectedVersionLabel: pipeline.template?.versionLabel,
      onUseTemplate
    })
  }, [pipeline.template, openTemplateSelector, onUseTemplate])

  const onRemoveTemplate = useCallback(async () => {
    const node = pipeline
    const processNode = produce({} as PipelineInfoConfig, draft => {
      draft.name = defaultTo(node?.name, '')
      draft.identifier = defaultTo(node?.identifier, '')
    })
    await updatePipeline(processNode)
  }, [pipeline, updatePipeline])

  return { onUseTemplate, onRemoveTemplate, onOpenTemplateSelector }
}
