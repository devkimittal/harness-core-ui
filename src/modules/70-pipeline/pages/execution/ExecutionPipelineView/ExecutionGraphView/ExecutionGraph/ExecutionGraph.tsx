/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { isEmpty, get } from 'lodash-es'
import { Icon, Layout, Text } from '@wings-software/uicore'
import { Intent, Color } from '@harness/design-system'
import { GraphLayoutNode, NodeRunInfo, useGetBarriersExecutionInfo } from 'services/pipeline-ng'
import {
  getIconFromStageModule,
  processLayoutNodeMap,
  ProcessLayoutNodeMapResponse
} from '@pipeline/utils/executionUtils'
import {
  ExecutionStatus,
  isExecutionIgnoreFailed,
  isExecutionNotStarted,
  isExecutionSkipped
} from '@pipeline/utils/statusHelpers'
import { useStrings } from 'framework/strings'
import type { DynamicPopoverHandlerBinding } from '@common/components/DynamicPopover/DynamicPopover'
import { DynamicPopover } from '@common/exports'
import HoverCard from '@pipeline/components/HoverCard/HoverCard'
import { StageType } from '@pipeline/utils/stageHelpers'
import {
  ExecutionPipelineNode,
  ExecutionPipelineNodeType,
  ExecutionPipeline
} from '@pipeline/components/ExecutionStageDiagram/ExecutionPipelineModel'
import { useExecutionLayoutContext } from '@pipeline/components/ExecutionLayout/ExecutionLayoutContext'
import ExecutionStageDiagram from '@pipeline/components/ExecutionStageDiagram/ExecutionStageDiagram'
import type { ExecutionPathProps } from '@common/interfaces/RouteInterfaces'
import ConditionalExecutionTooltipWrapper from '@pipeline/components/ConditionalExecutionToolTip/ConditionalExecutionTooltipWrapper'
import { StepMode as Modes } from '@pipeline/utils/stepUtils'
import { useExecutionContext } from '@pipeline/context/ExecutionContext'
import CDInfo from './components/CD/CDInfo/CDInfo'
import css from './ExecutionGraph.module.scss'

const barrierSupportedStageTypes = [StageType.DEPLOY, StageType.APPROVAL]

const processExecutionData = (
  stages?: ProcessLayoutNodeMapResponse[]
): Array<ExecutionPipelineNode<GraphLayoutNode>> => {
  const items: Array<ExecutionPipelineNode<GraphLayoutNode>> = []
  stages?.forEach(item => {
    if (item.parallel) {
      const parallel: Array<ExecutionPipelineNode<GraphLayoutNode>> = []
      item.parallel.forEach(node => {
        parallel.push({
          item: {
            icon: getIconFromStageModule(node?.module, node.nodeType),
            identifier: node?.nodeUuid || /* istanbul ignore next */ '',
            name: node?.name || node?.nodeIdentifier || /* istanbul ignore next */ '',
            status: node?.status as any,
            barrierFound: node?.barrierFound,
            type:
              node?.nodeType === StageType.APPROVAL
                ? ExecutionPipelineNodeType.DIAMOND
                : ExecutionPipelineNodeType.NORMAL,
            skipCondition: node?.skipInfo?.evaluatedCondition ? node.skipInfo.skipCondition : undefined,
            disableClick: isExecutionNotStarted(node?.status) || isExecutionSkipped(node?.status),
            when: node?.nodeRunInfo,
            data: node
          }
        })
      })
      items.push({ parallel })
    } else {
      const stage = item.stage
      items.push({
        item: {
          icon: getIconFromStageModule(stage?.module, stage?.nodeType),
          identifier: stage?.nodeUuid || /* istanbul ignore next */ '',
          name: stage?.name || stage?.nodeIdentifier || /* istanbul ignore next */ '',
          status: stage?.status as any,
          barrierFound: stage?.barrierFound,
          type:
            stage?.nodeType === StageType.APPROVAL
              ? ExecutionPipelineNodeType.DIAMOND
              : ExecutionPipelineNodeType.NORMAL,
          skipCondition: stage?.skipInfo?.evaluatedCondition ? stage.skipInfo.skipCondition : undefined,
          disableClick: isExecutionNotStarted(stage?.status) || isExecutionSkipped(stage?.status),
          when: stage?.nodeRunInfo,
          data: stage
        }
      })
    }
  })
  return items
}

export interface ExecutionGraphProps {
  onSelectedStage(stage: string): void
}

export default function ExecutionGraph(props: ExecutionGraphProps): React.ReactElement {
  const { executionIdentifier } = useParams<ExecutionPathProps>()
  const { getString } = useStrings()
  const [dynamicPopoverHandler, setDynamicPopoverHandler] = React.useState<
    DynamicPopoverHandlerBinding<unknown> | undefined
  >()
  const [stageSetupId, setStageSetupIdId] = React.useState('')
  const { pipelineExecutionDetail, selectedStageId } = useExecutionContext()
  const { primaryPaneSize } = useExecutionLayoutContext()
  const nodeData = processLayoutNodeMap(pipelineExecutionDetail?.pipelineExecutionSummary)
  const data: ExecutionPipeline<GraphLayoutNode> = {
    items: processExecutionData(nodeData),
    identifier: pipelineExecutionDetail?.pipelineExecutionSummary?.pipelineIdentifier || /* istanbul ignore next */ '',
    status: pipelineExecutionDetail?.pipelineExecutionSummary?.status as any,
    allNodes: Object.keys(pipelineExecutionDetail?.pipelineExecutionSummary?.layoutNodeMap || {})
  }

  const {
    data: barrierInfoData,
    refetch: fetchBarrierInfo,
    loading: barrierInfoLoading
  } = useGetBarriersExecutionInfo({
    lazy: true
  })

  React.useEffect(() => {
    if (stageSetupId) {
      fetchBarrierInfo({
        queryParams: {
          stageSetupId: stageSetupId,
          planExecutionId: executionIdentifier
        }
      })
    }
  }, [stageSetupId, executionIdentifier])

  const onMouseEnter = (event: any) => {
    const stage = event.stage
    dynamicPopoverHandler?.show(
      event.stageTarget,
      {
        event,
        data: stage
      },
      { useArrows: true, darkMode: false, fixedPosition: false }
    )
    const isFinished = stage?.data?.endTs
    const hasStarted = stage?.data?.startTs
    if (!isFinished && hasStarted) {
      setStageSetupIdId(stage?.data?.nodeUuid)
    }
  }

  const renderPopover = ({
    data: popoverData
  }: {
    data: {
      identifier: string
      stepType: string
      name: string
      status: ExecutionStatus
      data: { failureInfo?: { message: string } }
      when: NodeRunInfo
    }
  }): JSX.Element => {
    return (
      <HoverCard data={popoverData}>
        {popoverData?.when && <ConditionalExecutionTooltipWrapper data={popoverData.when} mode={Modes.STAGE} />}
        {barrierSupportedStageTypes.indexOf(get(popoverData, 'data.nodeType', '')) !== -1 && (
          <CDInfo barrier={{ barrierInfoLoading, barrierData: barrierInfoData }} data={popoverData} />
        )}
      </HoverCard>
    )
  }

  return (
    <div className={css.main}>
      {isExecutionIgnoreFailed(pipelineExecutionDetail?.pipelineExecutionSummary?.status) ? (
        <Layout.Horizontal spacing="medium" background={Color.GREY_200} className={css.executionError}>
          <Icon name="warning-sign" intent={Intent.WARNING} />
          <Text lineClamp={1}>{getString('pipeline.execution.ignoreFailedWarningText')}</Text>
        </Layout.Horizontal>
      ) : null}
      {!isEmpty(pipelineExecutionDetail?.pipelineExecutionSummary?.executionErrorInfo?.message) ? (
        <Layout.Horizontal spacing="medium" background={Color.RED_100} className={css.executionError}>
          <Icon name="warning-sign" intent={Intent.DANGER} />
          <Text color={Color.GREY_900} lineClamp={1}>
            {pipelineExecutionDetail?.pipelineExecutionSummary?.executionErrorInfo?.message}
          </Text>
        </Layout.Horizontal>
      ) : null}
      {!isEmpty(pipelineExecutionDetail?.pipelineExecutionSummary?.pipelineIdentifier) && data.items?.length > 0 && (
        <>
          <ExecutionStageDiagram
            itemMouseEnter={onMouseEnter}
            itemMouseLeave={() => {
              dynamicPopoverHandler?.hide()
              setStageSetupIdId('')
            }}
            selectedIdentifier={selectedStageId}
            itemClickHandler={e => props.onSelectedStage(e.stage.identifier)}
            diagramContainerHeight={primaryPaneSize}
            data={data}
            nodeStyle={{
              width: 90,
              height: 40
            }}
            graphConfiguration={{
              NODE_WIDTH: 90,
              ALLOW_PORT_HIDE: false
            }}
            gridStyle={{
              startX: 50,
              startY: 50
            }}
          />
          <DynamicPopover
            darkMode={true}
            render={renderPopover}
            bind={setDynamicPopoverHandler as any}
            closeOnMouseOut
          />
        </>
      )}
    </div>
  )
}
