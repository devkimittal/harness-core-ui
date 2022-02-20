/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { isEmpty, isUndefined, omit, omitBy, set } from 'lodash-es'
import { TemplateContext } from '@templates-library/components/TemplateStudio/TemplateContext/TemplateContext'
import type { GitQueryParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import { TemplatePipelineProvider } from '@pipeline/components/TemplatePipelineContext'
import { sanitize } from '@common/utils/JSONUtils'
import type { PipelineInfoConfig } from 'services/cd-ng'
import StageBuilder from '@pipeline/components/PipelineStudio/StageBuilder/StageBuilder'
import { PipelineContextType } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { TemplateDrawer } from '@templates-library/components/TemplateDrawer/TemplateDrawer'
import { RightDrawer } from '@pipeline/components/PipelineStudio/RightDrawer/RightDrawer'

export const DefaultNewPipelineName = 'Pipeline Name'
export const DefaultNewPipelineId = 'pipeline_name'

const PipelineTemplateCanvasWrapper = () => {
  const {
    state: { template, isLoading, isUpdated },
    updateTemplate,
    isReadonly
  } = React.useContext(TemplateContext)
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { branch, repoIdentifier } = useQueryParams<GitQueryParams>()

  const createPipelineFromTemplate = React.useCallback(
    () => ({ ...template.spec, name: DefaultNewPipelineName, identifier: DefaultNewPipelineId }),
    [template.spec]
  )

  const [pipeline, setPipeline] = React.useState<PipelineInfoConfig>(createPipelineFromTemplate())

  React.useEffect(() => {
    if (!isLoading && !isUpdated) {
      setPipeline(createPipelineFromTemplate())
    }
  }, [isLoading, isUpdated])

  const onUpdatePipeline = async (pipelineConfig: PipelineInfoConfig) => {
    const newPipeline = omitBy(omitBy(pipelineConfig, isUndefined), isEmpty)
    const processNode = omit(newPipeline, 'name', 'identifier', 'description', 'tags')
    sanitize(processNode, { removeEmptyArray: false, removeEmptyObject: false, removeEmptyString: false })
    set(template, 'spec', processNode)
    await updateTemplate(template)
  }

  if (pipeline) {
    return (
      <TemplatePipelineProvider
        queryParams={{ accountIdentifier: accountId, orgIdentifier, projectIdentifier, repoIdentifier, branch }}
        initialValue={pipeline as PipelineInfoConfig}
        onUpdatePipeline={onUpdatePipeline}
        contextType={PipelineContextType.PipelineTemplate}
        isReadOnly={isReadonly}
      >
        <StageBuilder />
        <RightDrawer />
        <TemplateDrawer />
      </TemplatePipelineProvider>
    )
  } else {
    return <></>
  }
}

export const PipelineTemplateCanvasWrapperWithRef = React.forwardRef(PipelineTemplateCanvasWrapper)
