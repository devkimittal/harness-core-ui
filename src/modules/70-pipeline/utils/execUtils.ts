// import type { PipelineGraphState } from '@pipeline/components/AbstractNode/types'
import type { IconName } from '@harness/uicore'
import { isEmpty } from 'lodash-es'
import type { PipelineGraphState } from '@pipeline/components/AbstractNode/types'
import type { ExecutionGraph, ExecutionNode, NodeRunInfo } from 'services/pipeline-ng'
import { getStatusProps } from '@pipeline/components/ExecutionStageDiagram/ExecutionStageDiagramUtils'
import { ExecutionPipelineNodeType } from '@pipeline/components/ExecutionStageDiagram/ExecutionPipelineModel'
import { Event } from '@pipeline/components/Diagram'
import {
  StepGroupRollbackIdentifier,
  NodeType,
  RollbackContainerCss,
  getIconDataBasedOnType,
  LITE_ENGINE_TASK,
  processLiteEngineTask,
  RollbackIdentifier,
  TopLevelNodes,
  hasOnlyLiteEngineTask,
  StepTypeIconsMap
} from './executionUtils'
import type { ExecutionStatus } from './statusHelpers'
interface ProcessParalellNodeArgs {
  nodeMap: ExecutionGraph['nodeMap']
  nodeAdjacencyListMap: ExecutionGraph['nodeAdjacencyListMap']
  rootNodes: Array<PipelineGraphState>
  items: Array<PipelineGraphState>
  id: string
}

interface StepPipelineGraphState {
  step?: ExecutionNode & { skipCondition?: string; when?: NodeRunInfo; type?: string; data: any }
}
interface ParallelStepPipelineGraphState {
  parallel: StepPipelineGraphState
}
const processParallelNodeData = ({
  items,
  nodeMap,
  nodeAdjacencyListMap,
  id,
  rootNodes
}: ProcessParalellNodeArgs): void => {
  const [parentNodeId, ...childNodeIds] = nodeAdjacencyListMap?.[id].children as string[]
  const parentNodeData = nodeMap?.[parentNodeId]
  const iconData = getIconDataBasedOnType(parentNodeData)
  items.push({
    name: parentNodeData?.name as string,
    identifier: parentNodeData?.identifier as string,
    id: parentNodeData?.uuid as string,
    nodeType: parentNodeData?.stepType,
    type: parentNodeData?.stepType as string,
    icon: iconData.icon,
    status: parentNodeData?.status as ExecutionStatus,
    data: {
      ...iconData,
      ...(parentNodeData?.stepType === NodeType.STEP_GROUP
        ? {
            stepGroup: {
              name: parentNodeData?.name || /* istanbul ignore next */ '',
              identifier: parentNodeData?.identifier,
              id: parentNodeData?.uuid as string,
              skipCondition: parentNodeData?.skipInfo?.evaluatedCondition
                ? parentNodeData.skipInfo.skipCondition
                : undefined,
              when: parentNodeData?.nodeRunInfo,
              status: parentNodeData?.status as ExecutionStatus,
              type: parentNodeData?.stepType,
              data: parentNodeData,
              steps: processStepGroupSteps({ nodeAdjacencyListMap, id: parentNodeId, nodeMap, rootNodes })
            }
          }
        : {
            name: parentNodeData?.name || /* istanbul ignore next */ '',
            identifier: parentNodeData?.identifier,
            id: parentNodeData?.uuid as string,
            skipCondition: parentNodeData?.skipInfo?.evaluatedCondition
              ? parentNodeData.skipInfo.skipCondition
              : undefined,
            when: parentNodeData?.nodeRunInfo,
            status: parentNodeData?.status as ExecutionStatus,
            type: parentNodeData?.stepType,
            data: parentNodeData
          })
    },
    children: processNodeDataV1(childNodeIds || /* istanbul ignore next */ [], nodeMap, nodeAdjacencyListMap, rootNodes)
  })
}

interface ProcessStepGroupStepsArgs {
  nodeMap: ExecutionGraph['nodeMap']
  nodeAdjacencyListMap: ExecutionGraph['nodeAdjacencyListMap']
  rootNodes: Array<PipelineGraphState>
  id: string
}
const processStepGroupSteps = ({ nodeAdjacencyListMap, id, nodeMap, rootNodes }: ProcessStepGroupStepsArgs): any[] => {
  const steps: any[] = []
  nodeAdjacencyListMap?.[id].children?.forEach((childId: string): void => {
    if (nodeMap?.[childId].stepType === NodeType.FORK) {
      const childrenNodes = processNodeDataV1(
        nodeAdjacencyListMap[childId].children || [],
        nodeMap,
        nodeAdjacencyListMap,
        rootNodes
      )
      if (nodeMap?.[childId].name === 'parallel') {
        steps.push({ parallel: childrenNodes.map(node => ({ step: node })) })
      } else {
        steps.push(...childrenNodes.map(node => ({ step: node })))
      }
    } else {
      steps.push({ step: nodeMap?.[childId] })
    }
    const processedNodes = processNextNodes({
      nodeMap,
      nodeAdjacencyListMap,
      nextIds: nodeAdjacencyListMap?.[childId].nextIds || [],
      rootNodes
    })

    steps.push(...processedNodes.map(step => ({ step })))
  })
  return steps
}
interface ProcessSingleItemArgs {
  nodeMap: ExecutionGraph['nodeMap']
  items: Array<PipelineGraphState>
  id: string
  nodeAdjacencyListMap: ExecutionGraph['nodeAdjacencyListMap']
  showInLabel?: boolean

  rootNodes: Array<PipelineGraphState>
}
const processSingleItem = ({
  items,
  id,
  nodeMap,
  showInLabel,
  nodeAdjacencyListMap,
  rootNodes
}: ProcessSingleItemArgs): void => {
  const nodeData = nodeMap?.[id]
  if (!nodeData) return
  const iconData = getIconDataBasedOnType(nodeData)
  const item = {
    name: nodeData?.name || /* istanbul ignore next */ '',
    identifier: nodeData?.identifier,
    id: nodeData?.uuid,
    skipCondition: nodeData?.skipInfo?.evaluatedCondition ? nodeData.skipInfo.skipCondition : undefined,
    when: nodeData?.nodeRunInfo,
    status: nodeData?.status as ExecutionStatus,
    type: nodeData?.stepType,
    data: nodeData,
    showInLabel
  }
  const finalItem = {
    name: nodeData?.name as string,
    identifier: nodeData?.identifier as string,
    id: nodeData?.uuid as string,
    nodeType: nodeData?.stepType,
    type: nodeData?.stepType as string,
    icon: iconData.icon as IconName,
    status: nodeData?.status as ExecutionStatus,
    data: {
      ...iconData,

      ...(nodeData?.stepType === NodeType.STEP_GROUP
        ? {
            stepGroup: {
              ...item,
              steps: processStepGroupSteps({ nodeAdjacencyListMap, id, nodeMap, rootNodes })
            }
          }
        : item)
    }
  }
  items.push(finalItem)
}

export const processNodeDataV1 = (
  children: string[],
  nodeMap: ExecutionGraph['nodeMap'],
  nodeAdjacencyListMap: ExecutionGraph['nodeAdjacencyListMap'],
  rootNodes: Array<PipelineGraphState>
): Array<PipelineGraphState> => {
  const items: Array<PipelineGraphState> = []
  children?.forEach(item => {
    const nodeData = nodeMap?.[item]
    const isRollback = nodeData?.name?.endsWith(StepGroupRollbackIdentifier) ?? false
    if (nodeData?.stepType === NodeType.FORK) {
      processParallelNodeData({ items, id: item, nodeAdjacencyListMap, nodeMap, rootNodes })
    } else if (
      nodeData?.stepType === NodeType.STEP_GROUP ||
      nodeData?.stepType === NodeType.NG_SECTION ||
      (nodeData && isRollback)
    ) {
      processGroupItem({ items, id: item, isRollbackNext: isRollback, nodeMap, nodeAdjacencyListMap, rootNodes })
    } else {
      if (nodeData?.stepType === LITE_ENGINE_TASK) {
        const parentNodeId =
          Object.entries(nodeAdjacencyListMap || {}).find(([_, val]) => {
            return (val?.children?.indexOf(nodeData.uuid!) ?? -1) >= 0
          })?.[0] || ''
        processLiteEngineTask(nodeData, rootNodes as any, nodeMap?.[parentNodeId])
      } else {
        processSingleItem({ id: item, items, nodeMap, nodeAdjacencyListMap, rootNodes })
      }
    }
    const nextIds = nodeAdjacencyListMap?.[item].nextIds || /* istanbul ignore next */ []
    const processedNodes = processNextNodes({ nodeMap, nodeAdjacencyListMap, nextIds, rootNodes })
    items.push(...processedNodes)
  })
  return items
}

interface ProcessGroupItemArgs {
  nodeMap: ExecutionGraph['nodeMap']
  nodeAdjacencyListMap: ExecutionGraph['nodeAdjacencyListMap']
  rootNodes: Array<PipelineGraphState>
  items: Array<PipelineGraphState>
  id: string
  isRollbackNext?: boolean
}
const processGroupItem = ({
  items,
  id,
  nodeMap,
  nodeAdjacencyListMap,
  rootNodes
}: // isRollbackNext
ProcessGroupItemArgs): void => {
  const nodeData = nodeMap?.[id]
  if (!nodeData) return

  const iconData = getIconDataBasedOnType(nodeData)

  const steps: Array<StepPipelineGraphState | ParallelStepPipelineGraphState> = []

  nodeAdjacencyListMap?.[id].children?.forEach(childId => {
    const childStep = nodeMap?.[childId]

    /** If we have parallel steps then create parallel object so that it can be processed by StepGroupGraphNode to create a Graph inside step group **/
    if (childStep?.name === 'parallel' && nodeAdjacencyListMap?.[childStep?.uuid as string]?.children?.length) {
      const stepGroupChildrenNodes = nodeAdjacencyListMap?.[childStep?.uuid as string]?.children
      steps.push({
        parallel: stepGroupChildrenNodes?.map(childItemId => ({
          step: nodeMap?.[childItemId]
        }))
      } as ParallelStepPipelineGraphState)
    } else {
      const childStepIconData = getIconDataBasedOnType(childStep)

      const childSecondaryIconProps = getStatusProps(
        childStep?.status as ExecutionStatus,
        ExecutionPipelineNodeType.NORMAL
      )

      steps.push({
        step: {
          name: childStep?.name || /* istanbul ignore next */ '',
          ...childStepIconData,
          identifier: childStep?.identifier as string,
          uuid: childStep?.uuid as string,
          skipCondition: childStep?.skipInfo?.evaluatedCondition ? childStep.skipInfo.skipCondition : undefined,
          when: childStep?.nodeRunInfo,
          status: childStep?.status as ExecutionStatus,
          type: childStep?.stepType as string,
          data: { ...childStep, ...childSecondaryIconProps }
        }
      })
    }
    let processedNodes: PipelineGraphState[] | StepPipelineGraphState[] = processNextNodes({
      nodeAdjacencyListMap,
      nodeMap,
      rootNodes,
      nextIds: nodeAdjacencyListMap?.[childStep?.uuid as string]?.nextIds || []
    })
    processedNodes = processedNodes.map(stepData => ({ step: stepData })) as StepPipelineGraphState[]
    steps.push(...processedNodes)
  })

  const item = {
    name: nodeData?.name || /* istanbul ignore next */ '',
    identifier: nodeData?.identifier,
    skipCondition: nodeData?.skipInfo?.evaluatedCondition ? nodeData.skipInfo.skipCondition : undefined,
    when: nodeData?.nodeRunInfo,
    status: nodeData?.status as ExecutionStatus,
    type: nodeData?.stepType,
    id: nodeData.uuid as string,
    data: nodeData
  }
  const finalDataItem = {
    id: nodeData.uuid as string,
    identifier: nodeData?.identifier as string,
    name: nodeData?.name as string,
    type: 'STEP_GROUP',
    nodeType: 'STEP_GROUP',
    icon: StepTypeIconsMap.STEP_GROUP as IconName,
    status: nodeData?.status as ExecutionStatus,
    data: {
      ...(nodeData?.stepType === NodeType.STEP_GROUP || nodeData.stepType === NodeType.ROLLBACK_OPTIONAL_CHILD_CHAIN
        ? {
            ...iconData,
            stepGroup: {
              ...item,
              type: 'STEP_GROUP',
              nodeType: 'STEP_GROUP',
              icon: StepTypeIconsMap.STEP_GROUP,
              steps
            }
          }
        : item)
    }
  }
  items.push(finalDataItem)
}
interface ProcessNextNodesParams {
  nextIds: string[]
  nodeMap: ExecutionGraph['nodeMap']
  nodeAdjacencyListMap: ExecutionGraph['nodeAdjacencyListMap']
  rootNodes: Array<PipelineGraphState>
}
export const processNextNodes = ({
  nodeMap,
  nodeAdjacencyListMap,
  nextIds,
  rootNodes
}: ProcessNextNodesParams): PipelineGraphState[] => {
  const result: any[] = []
  nextIds.forEach(id => {
    const nodeDataNext = nodeMap?.[id]

    const isRollbackNext = nodeDataNext?.name?.endsWith(StepGroupRollbackIdentifier) ?? false
    if (nodeDataNext?.stepType === NodeType.FORK) {
      processParallelNodeData({ items: result, id, nodeAdjacencyListMap, nodeMap, rootNodes })
    } else if (nodeDataNext?.stepType === NodeType.STEP_GROUP || (isRollbackNext && nodeDataNext)) {
      processGroupItem({ items: result, id, isRollbackNext, nodeMap, nodeAdjacencyListMap, rootNodes })
    } else {
      processSingleItem({ id, items: result, nodeMap, nodeAdjacencyListMap, rootNodes })
    }
    const nextLevels = nodeAdjacencyListMap?.[id].nextIds
    if (nextLevels) {
      result.push(...processNodeDataV1(nextLevels, nodeMap, nodeAdjacencyListMap, rootNodes))
    }
  })
  return result
}
export const processExecutionDataV1 = (graph?: ExecutionGraph): any => {
  const items: Array<any> = []
  /* istanbul ignore else */
  if (graph?.nodeAdjacencyListMap && graph?.rootNodeId) {
    const nodeAdjacencyListMap = graph.nodeAdjacencyListMap
    const rootNode = graph.rootNodeId
    // Ignore the graph when its fqn is pipeline, as this doesn't render pipeline graph
    if (graph?.nodeMap?.[rootNode].baseFqn === 'pipeline') {
      return items
    }
    let nodeId = nodeAdjacencyListMap[rootNode].children?.[0]
    while (nodeId && nodeAdjacencyListMap[nodeId]) {
      const nodeData = graph?.nodeMap?.[nodeId]

      if (nodeData) {
        /* istanbul ignore else */
        const isRollback = nodeData.name?.endsWith(StepGroupRollbackIdentifier) ?? false
        if (nodeData.stepType && (TopLevelNodes.indexOf(nodeData.stepType as NodeType) > -1 || isRollback)) {
          // NOTE: exception if we have only lite task engine in Execution group
          if (hasOnlyLiteEngineTask(nodeAdjacencyListMap[nodeId].children, graph)) {
            const liteTaskEngineId = nodeAdjacencyListMap?.[nodeId]?.children?.[0] || ''
            processLiteEngineTask(graph?.nodeMap?.[liteTaskEngineId], items, nodeData)
          } else if (!isEmpty(nodeAdjacencyListMap[nodeId].children)) {
            if (nodeData.identifier === 'execution') {
              /* All execution steps will be processed here */
              const exec = processNodeDataV1(
                nodeAdjacencyListMap[nodeId].children || /* istanbul ignore next */ [],
                graph?.nodeMap,
                graph?.nodeAdjacencyListMap,
                items
              )
              items.push(...exec)
            } else {
              items.push({
                group: {
                  name: nodeData.name || /* istanbul ignore next */ '',
                  identifier: nodeId,
                  id: nodeData.uuid as string,
                  data: nodeData,
                  skipCondition: nodeData.skipInfo?.evaluatedCondition ? nodeData.skipInfo.skipCondition : undefined,
                  when: nodeData.nodeRunInfo,
                  containerCss: {
                    ...(RollbackIdentifier === nodeData.identifier || isRollback ? RollbackContainerCss : {})
                  },

                  status: nodeData.status as ExecutionStatus,
                  isOpen: true,
                  ...getIconDataBasedOnType(nodeData),
                  items: processNodeDataV1(
                    nodeAdjacencyListMap[nodeId].children || /* istanbul ignore next */ [],
                    graph?.nodeMap,
                    graph?.nodeAdjacencyListMap,
                    items
                  )
                }
              })
            }
          }
        } else if (nodeData.stepType === NodeType.FORK) {
          items.push({
            parallel: processNodeDataV1(
              nodeAdjacencyListMap[nodeId].children || /* istanbul ignore next */ [],
              graph?.nodeMap,
              graph?.nodeAdjacencyListMap,
              items
            )
          })
        } else {
          const iconData = getIconDataBasedOnType(nodeData)

          items.push({
            id: nodeData.uuid as string,
            name: nodeData.name || /* istanbul ignore next */ '',
            identifier: nodeData.identifier as string,
            icon: iconData.icon as IconName,
            type: nodeData.stepType,
            nodeType: nodeData.stepType,
            status: nodeData?.status as ExecutionStatus,
            data: {
              ...iconData,
              name: nodeData.name || /* istanbul ignore next */ '',
              skipCondition: nodeData.skipInfo?.evaluatedCondition ? nodeData.skipInfo.skipCondition : undefined,
              when: nodeData.nodeRunInfo,
              showInLabel: nodeData.stepType === NodeType.SERVICE || nodeData.stepType === NodeType.INFRASTRUCTURE,
              identifier: nodeId,
              status: nodeData.status as ExecutionStatus,
              type: nodeData?.stepType,
              data: nodeData
            }
          })
        }
      }
      nodeId = nodeAdjacencyListMap[nodeId].nextIds?.[0]
    }
  }
  return items
}

interface GetExecutionStageDiagramListenersParams {
  data: any
  onMouseEnter: ({ data, event }: { data: any; event: any }) => void
  allNodeMap?: any
  onMouseLeave: () => void
}
export const getExecutionStageDiagramListeners = ({
  allNodeMap,
  onMouseEnter,
  onMouseLeave
}: GetExecutionStageDiagramListenersParams): { [key: string]: (event: any) => void } => {
  const nodeListeners: { [key: string]: (event?: any) => void } = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // [Event.ClickNode]: (event: any) => {
    //   // /* istanbul ignore else */ if (autoPosition) {
    //   //   setAutoPosition(false)
    //   // }
    //   const group = groupState?.get(event.entity.getIdentifier())
    //   if (group && group.collapsed) {
    //     updateGroupStage(event)
    //   } else {
    //     const stage = getStageFromDiagramEvent(event, data)
    //     /* istanbul ignore else */ if (stage) itemClickHandler(new ItemClickEvent(stage, event.target))
    //   }
    // },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [Event.MouseEnterNode]: (event: any) => {
      const stageData = allNodeMap[event?.data?.id]
      if (stageData) onMouseEnter({ data: stageData, event })
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [Event.MouseLeaveNode]: () => {
      onMouseLeave()
    }
  }
  return nodeListeners
}
