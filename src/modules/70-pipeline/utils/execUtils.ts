import type { PipelineGraphState } from '@pipeline/components/AbstractNode/types'
import type { ExecutionPipelineNode } from '@pipeline/components/ExecutionStageDiagram/ExecutionPipelineModel'
import type { ExecutionGraph, ExecutionNode } from 'services/pipeline-ng'
import {
  StepGroupRollbackIdentifier,
  NodeType,
  RollbackContainerCss,
  getIconDataBasedOnType,
  LITE_ENGINE_TASK,
  getExecutionPipelineNodeType,
  processLiteEngineTask
} from './executionUtils'
import type { ExecutionStatus } from './statusHelpers'

export const processNodeDataV1 = (
  children: string[],
  nodeMap: ExecutionGraph['nodeMap'],
  nodeAdjacencyListMap: ExecutionGraph['nodeAdjacencyListMap'],
  rootNodes: PipelineGraphState[]
): any[] => {
  const items: any[] = []
  children?.forEach(item => {
    const nodeData = nodeMap?.[item]
    const isRollback = nodeData?.name?.endsWith(StepGroupRollbackIdentifier) ?? false
    if (nodeData?.stepType === NodeType.FORK) {
      const [parentNode, ...childNodes] = nodeAdjacencyListMap?.[item].children as any[]

      const iconData = getIconDataBasedOnType(parentNode)
      items.push({
        id: item as string,
        identifier: item as string,
        name: parentNode?.name as string,
        icon: iconData.icon,
        type: 'StepGroup',
        nodeType: getExecutionPipelineNodeType(parentNode?.stepType),
        data: {
          name: parentNode.name || /* istanbul ignore next */ '',
          identifier: item,
          data: parentNode,
          containerCss: {
            ...(isRollback ? RollbackContainerCss : {})
          },
          status: parentNode.status as ExecutionStatus,
          isOpen: true,
          skipCondition: parentNode.skipInfo?.evaluatedCondition ? parentNode.skipInfo.skipCondition : undefined,
          when: parentNode.nodeRunInfo,
          ...iconData
        },
        children: processNodeDataV1(
          childNodes || /* istanbul ignore next */ [],
          nodeMap,
          nodeAdjacencyListMap,
          rootNodes
        )
      })
    } else if (
      nodeData?.stepType === NodeType.STEP_GROUP ||
      nodeData?.stepType === NodeType.NG_SECTION ||
      (nodeData && isRollback)
    ) {
      const iconData = getIconDataBasedOnType(nodeData)
      items.push({
        id: item as string,
        identifier: item as string,
        name: nodeData?.name as string,
        icon: iconData.icon,
        type: 'StepGroup',
        nodeType: getExecutionPipelineNodeType(nodeData?.stepType),
        data: {
          name: nodeData.name || /* istanbul ignore next */ '',
          identifier: item,
          data: nodeData,
          containerCss: {
            ...(isRollback ? RollbackContainerCss : {})
          },
          status: nodeData.status as ExecutionStatus,
          isOpen: true,
          skipCondition: nodeData.skipInfo?.evaluatedCondition ? nodeData.skipInfo.skipCondition : undefined,
          when: nodeData.nodeRunInfo,
          ...getIconDataBasedOnType(nodeData)
        },
        children: processNodeDataV1(
          nodeAdjacencyListMap?.[item].children || /* istanbul ignore next */ [],
          nodeMap,
          nodeAdjacencyListMap,
          rootNodes
        )
      } as PipelineGraphState)
    } else {
      if (nodeData?.stepType === LITE_ENGINE_TASK) {
        const parentNodeId =
          Object.entries(nodeAdjacencyListMap || {}).find(([_, val]) => {
            return (val?.children?.indexOf(nodeData.uuid!) ?? -1) >= 0
          })?.[0] || ''
        processLiteEngineTask(nodeData, rootNodes, nodeMap?.[parentNodeId])
      } else {
        const iconData = getIconDataBasedOnType(nodeData)
        items.push({
          id: item as string,
          identifier: item as string,
          name: nodeData?.name as string,
          icon: iconData.icon,
          type: nodeData?.stepType,
          nodeType: getExecutionPipelineNodeType(nodeData?.stepType),
          data: {
            name: nodeData?.name || /* istanbul ignore next */ '',
            ...iconData,
            identifier: item,
            skipCondition: nodeData?.skipInfo?.evaluatedCondition ? nodeData?.skipInfo.skipCondition : undefined,
            when: nodeData?.nodeRunInfo,
            status: nodeData?.status as ExecutionStatus,
            type: getExecutionPipelineNodeType(nodeData?.stepType),
            data: nodeData
          }
        } as PipelineGraphState)
      }
    }
    const nextIds = nodeAdjacencyListMap?.[item].nextIds || /* istanbul ignore next */ []
    nextIds.forEach(id => {
      const nodeDataNext = nodeMap?.[id]
      const isRollbackNext = nodeDataNext?.name?.endsWith(StepGroupRollbackIdentifier) ?? false
      if (nodeDataNext?.stepType === NodeType.FORK) {
        // items.push({
        //   parallel: processNodeDataV1(
        //     nodeAdjacencyListMap?.[id].children || /* istanbul ignore next */ [],
        //     nodeMap,
        //     nodeAdjacencyListMap,
        //     rootNodes
        //   )
        // })

        const [parentNode, ...childNodes] = nodeAdjacencyListMap?.[id].children as any[]

        const iconData = getIconDataBasedOnType(parentNode)
        items.push({
          id: item as string,
          identifier: item as string,
          name: parentNode?.name as string,
          icon: iconData.icon,
          type: 'StepGroup',
          nodeType: getExecutionPipelineNodeType(parentNode?.stepType),
          data: {
            name: parentNode.name || /* istanbul ignore next */ '',
            identifier: item,
            data: parentNode,
            containerCss: {
              ...(isRollback ? RollbackContainerCss : {})
            },
            status: parentNode.status as ExecutionStatus,
            isOpen: true,
            skipCondition: parentNode.skipInfo?.evaluatedCondition ? parentNode.skipInfo.skipCondition : undefined,
            when: parentNode.nodeRunInfo,
            ...iconData
          },
          children: processNodeDataV1(
            childNodes || /* istanbul ignore next */ [],
            nodeMap,
            nodeAdjacencyListMap,
            rootNodes
          )
        })
      } else if (nodeDataNext?.stepType === NodeType.STEP_GROUP || (isRollbackNext && nodeDataNext)) {
        // type: 'StepGroup',
        // nodeType: 'StepGroup',

        const iconData = getIconDataBasedOnType(nodeDataNext)
        items.push({
          id: item as string,
          identifier: item as string,
          name: nodeData?.name as string,
          icon: iconData.icon,
          type: 'StepGroup',
          nodeType: 'StepGroup',
          data: {
            name: nodeDataNext.name || /* istanbul ignore next */ '',
            identifier: id,
            data: nodeDataNext,
            containerCss: {
              ...(isRollbackNext ? RollbackContainerCss : {})
            },
            skipCondition: nodeDataNext.skipInfo?.evaluatedCondition ? nodeDataNext.skipInfo.skipCondition : undefined,
            when: nodeDataNext.nodeRunInfo,
            status: nodeDataNext.status as ExecutionStatus,
            isOpen: true,
            ...iconData
          },
          children: processNodeDataV1(
            nodeAdjacencyListMap?.[id].children || /* istanbul ignore next */ [],
            nodeMap,
            nodeAdjacencyListMap,
            rootNodes
          )
        })
      } else {
        const iconData = getIconDataBasedOnType(nodeDataNext)
        items.push({
          id: id as string,
          identifier: id as string,
          name: nodeDataNext?.name as string,
          icon: iconData.icon,
          type: nodeDataNext?.stepType,
          nodeType: getExecutionPipelineNodeType(nodeDataNext?.stepType),
          data: {
            name: nodeDataNext?.name || /* istanbul ignore next */ '',
            ...iconData,
            identifier: id,
            skipCondition: nodeDataNext?.skipInfo?.evaluatedCondition ? nodeDataNext.skipInfo.skipCondition : undefined,
            when: nodeDataNext?.nodeRunInfo,
            status: nodeDataNext?.status as ExecutionStatus,
            type: getExecutionPipelineNodeType(nodeDataNext?.stepType),
            data: nodeDataNext
          },
          children: []
        } as PipelineGraphState)
      }
      const nextLevels = nodeAdjacencyListMap?.[id].nextIds
      if (nextLevels) {
        items.push(...processNodeDataV1(nextLevels, nodeMap, nodeAdjacencyListMap, rootNodes))
      }
    })
  })
  return items
}
