/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { debounce, defaultTo } from 'lodash-es'
import { Layout, PageError } from '@wings-software/uicore'
import cx from 'classnames'
import SplitPane from 'react-split-pane'
import { parse } from 'yaml'
import { useParams } from 'react-router-dom'
import { Container, PageSpinner } from '@harness/uicore'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import {
  DefaultSplitPaneSize,
  MaximumSplitPaneSize,
  MinimumSplitPaneSize
} from '@pipeline/components/PipelineStudio/PipelineConstants'
import {
  getIdentifierFromValue,
  getScopeFromValue,
  getScopeBasedProjectPathParams
} from '@common/components/EntityReference/EntityReference'
import type { GitQueryParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import { useGetTemplate } from 'services/template-ng'
import type { Error, PipelineInfoConfig } from 'services/cd-ng'
import { TemplateBar } from '@pipeline/components/PipelineStudio/TemplateBar/TemplateBar'
import { usePipelineTemplateActions } from '@pipeline/utils/usePipelineTemplateActions'
import { TemplatePipelineCanvas } from '@pipeline/components/PipelineStudio/PipelineTemplateBuilder/TemplatePipelineCanvas/TemplatePipelineCanvas'
import { TemplatePipelineSpecifications } from '@pipeline/components/PipelineStudio/PipelineTemplateBuilder/TemplatePipelineSpecifications/TemplatePipelineSpecifications'
import css from './TemplatePipelineBuilder.module.scss'

export function TemplatePipelineBuilder(): React.ReactElement {
  const {
    state: { pipeline }
  } = usePipelineContext()
  const queryParams = useParams<ProjectPathProps>()
  const { branch, repoIdentifier } = useQueryParams<GitQueryParams>()
  const [splitPaneSize, setSplitPaneSize] = React.useState(DefaultSplitPaneSize)
  const [resolvedPipeline, setResolvedPipeline] = React.useState<PipelineInfoConfig>()

  const setSplitPaneSizeDeb = React.useRef(debounce(setSplitPaneSize, 200))
  const templateRef = getIdentifierFromValue(defaultTo(pipeline.template?.templateRef, ''))
  const scope = getScopeFromValue(defaultTo(pipeline.template?.templateRef, ''))

  const {
    data: templateResponse,
    error: templateError,
    refetch: refetchTemplate,
    loading: templateLoading
  } = useGetTemplate({
    templateIdentifier: templateRef,
    queryParams: {
      ...getScopeBasedProjectPathParams(queryParams, scope),
      versionLabel: defaultTo(pipeline.template?.versionLabel, ''),
      repoIdentifier,
      branch,
      getDefaultFromOtherRepo: true
    }
  })

  React.useEffect(() => {
    if (templateResponse?.data?.yaml) {
      const newResolvedPipeline = parse(defaultTo(templateResponse?.data?.yaml, '')).template.spec
      setResolvedPipeline(newResolvedPipeline)
    }
  }, [templateResponse?.data?.yaml])

  function handleStageResize(size: number): void {
    setSplitPaneSizeDeb.current(size)
  }

  // eslint-disable-next-line
  const resizerStyle = !!navigator.userAgent.match(/firefox/i)
    ? { display: 'flow-root list-item' }
    : { display: 'inline-table' }

  const { onRemoveTemplate, onOpenTemplateSelector } = usePipelineTemplateActions()

  return (
    <Container className={css.mainContainer}>
      {templateLoading && <PageSpinner />}
      {!templateLoading && templateError && (
        <PageError
          message={defaultTo((templateError?.data as Error)?.message, templateError?.message)}
          onClick={() => refetchTemplate()}
        />
      )}
      {!templateLoading && !templateError && (
        <Layout.Vertical height={'100%'}>
          {pipeline.template && (
            <TemplateBar
              templateLinkConfig={pipeline.template}
              onRemoveTemplate={onRemoveTemplate}
              onOpenTemplateSelector={onOpenTemplateSelector}
              className={css.templateBar}
            />
          )}
          {resolvedPipeline && (
            <Container className={cx(css.canvasContainer)}>
              <SplitPane
                size={splitPaneSize}
                split="horizontal"
                minSize={MinimumSplitPaneSize}
                maxSize={MaximumSplitPaneSize}
                style={{ overflow: 'auto' }}
                pane2Style={{ overflow: 'initial', zIndex: 2 }}
                resizerStyle={resizerStyle}
                onChange={handleStageResize}
                allowResize={true}
              >
                <TemplatePipelineCanvas pipeline={resolvedPipeline} />
                <TemplatePipelineSpecifications />
              </SplitPane>
            </Container>
          )}
        </Layout.Vertical>
      )}
    </Container>
  )
}
