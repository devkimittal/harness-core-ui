/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { defaultTo, get } from 'lodash-es'
import type { IconName } from '@harness/uicore'
import { v4 as uuid } from 'uuid'
import type { ExecutionWrapperConfig, StageElementWrapperConfig } from 'services/cd-ng'
import { StepTypeToPipelineIconMap } from '@pipeline/components/PipelineStudio/ExecutionGraph/ExecutionGraphUtil'
import { stageTypeToIconMap } from '@pipeline/utils/constants'
import type { PipelineGraphState, SVGPathRecord } from '../types'
import { PipelineGraphType } from '../types'

const INITIAL_ZOOM_LEVEL = 1
const ZOOM_INC_DEC_LEVEL = 0.1
interface DrawSVGPathOptions {
  isParallelNode?: boolean
  parentElement?: HTMLDivElement
  direction?: 'rtl' | 'ltl' | 'rtr'
  styles?: React.CSSProperties
  nextNode?: string
  parentNode?: string
}
/**
 * Direction of SVG Path (Only supported for straight horizontal lines)
 * 'rtl' ---> Right of Element1 to Left of Element2
 * 'ltl' ---> Left of Element1 to Left of Element2
 * 'rtr' ---> Left of Element1 to Right of Element2
 **/
const getFinalSVGArrowPath = (id1 = '', id2 = '', options?: DrawSVGPathOptions): { [key: string]: string } => {
  const node1 = getComputedPosition(id1, options?.parentElement)
  const node2 = getComputedPosition(id2, options?.parentElement)
  if (!node1 || !node2) {
    return { [id1]: '' }
  }
  let finalSVGPath = ''
  const node1VerticalMid = node1.top + node1.height / 2
  const node2VerticalMid = node2.top + node2.height / 2

  const startPoint = `${node1.right},${node1VerticalMid}`
  const horizontalMid = Math.abs((node1.right + node2.left) / 2)
  const endPoint = `${node2.left},${node2VerticalMid}`

  const node1Y = Math.round(node1.y * 10) / 10
  const node2Y = Math.round(node2.y * 10) / 10

  if (node2Y < node1Y) {
    //  child node is at top
    const curveLeftToTop = `Q${horizontalMid},${node1VerticalMid} ${horizontalMid},${node1VerticalMid - 20}`
    const curveBottomToRight = `Q${horizontalMid},${node2VerticalMid} ${horizontalMid + 20},${node2VerticalMid}`
    finalSVGPath = `M${startPoint} L${horizontalMid - 20},${node1VerticalMid} ${curveLeftToTop} 
    L${horizontalMid},${node2VerticalMid + 20} ${curveBottomToRight} L${endPoint}`
  } else if (node1Y === node2Y) {
    // both nodes are at same level vertically
    if (options?.direction === 'ltl') {
      const startPointLeft = `${node1.left},${node1VerticalMid}`
      finalSVGPath = `M${startPointLeft}  L${endPoint}`
    } else if (options?.direction === 'rtr') {
      const endPointRight = `${node2.right},${node2VerticalMid}`
      finalSVGPath = `M${startPoint}  L${endPointRight}`
    } else finalSVGPath = `M${startPoint}  L${endPoint}`
  } else {
    //  child node is at bottom
    const curveLeftToBottom = `Q${horizontalMid},${node1VerticalMid} ${horizontalMid},${node1VerticalMid + 20}`

    const curveTopToRight = `Q${horizontalMid},${node2VerticalMid} ${horizontalMid + 20},${node2VerticalMid}`

    if (options?.isParallelNode) {
      const updatedStart = node1.left - 45 // new start point
      const parallelLinkStart = `${
        updatedStart // half of link length
      },${node1VerticalMid}`

      const curveLBparallel = `Q${updatedStart + 20},${node1VerticalMid} ${updatedStart + 20},${node1VerticalMid + 20} `
      const curveTRparallel = `Q${updatedStart + 20},${node2VerticalMid} ${updatedStart + 40},${node2VerticalMid}`

      const firstCurve = `M${parallelLinkStart} 
      ${curveLBparallel} 
      L${updatedStart + 20},${node2VerticalMid - 20} 
      ${curveTRparallel} 
      L${node2.left},${node2VerticalMid}`

      let secondCurve = ''
      if (options?.nextNode && options?.parentNode) {
        const nextNode = getComputedPosition(options.nextNode, options?.parentElement)
        const parentNode = getComputedPosition(options.parentNode, options?.parentElement)
        if (!nextNode || !parentNode) return { [id1]: '' }
        const newRight = parentNode?.right > node2.right ? parentNode?.right : node2.right
        const nextNodeVerticalMid = nextNode.top + nextNode.height / 2
        secondCurve = `M${node2.right},${node2VerticalMid}
        L${newRight + 10},${node2VerticalMid}
        Q${newRight + 25},${node2VerticalMid} ${newRight + 25},${node2VerticalMid - 20}
        L${newRight + 25},${nextNodeVerticalMid + 20}
        Q${newRight + 25},${nextNodeVerticalMid} ${newRight + 40},${nextNodeVerticalMid}`
      } else {
        secondCurve = `M${node2.right},${node2VerticalMid}
        L${node2.right + 10},${node2VerticalMid}
        Q${node2.right + 25},${node2VerticalMid} ${node2.right + 25},${node2VerticalMid - 20}
        L${node2.right + 25},${node1VerticalMid + 20}
        Q${node2.right + 25},${node1VerticalMid} ${node2.right + 40},${node1VerticalMid}`
      }
      finalSVGPath = firstCurve + secondCurve
    } else {
      finalSVGPath = `M${startPoint} L${horizontalMid - 20},${node1VerticalMid} ${curveLeftToBottom} 
    L${horizontalMid},${node2VerticalMid - 20} ${curveTopToRight} L${endPoint}`
    }
  }
  return { [id1]: finalSVGPath }
}

const getComputedPosition = (childId: string | HTMLElement, parentElement?: HTMLDivElement): DOMRect | null => {
  try {
    const childEl = typeof childId === 'string' ? (document.getElementById(childId) as HTMLDivElement) : childId
    const childPos = childEl?.getBoundingClientRect() as DOMRect
    const parentPos = defaultTo(parentElement, childEl.closest('#tree-container'))?.getBoundingClientRect() as DOMRect

    const updatedTop = childPos.top - parentPos.top
    const updatedLeft = childPos.left - parentPos.left
    const updatedRight = updatedLeft + childPos.width
    const updatedBottom = updatedTop + childPos.height
    const updatedPos: DOMRect = {
      ...childPos,
      left: updatedLeft,
      top: updatedTop,
      right: updatedRight,
      bottom: updatedBottom,
      width: childPos.width,
      height: childPos.height,
      x: childPos.x,
      y: childPos.y
    }
    return updatedPos
  } catch (e) {
    return null
  }
}

export const scrollZoom = (
  container: HTMLElement,
  max_scale: number,
  factor: number,
  callback: (newScale: number) => void
): void => {
  let scale = 1
  container.style.transformOrigin = '0 0'
  container.onwheel = scrolled

  function scrolled(e: any): void {
    e.preventDefault()
    let delta = e.delta || e.wheelDelta
    if (delta === undefined) {
      //we are on firefox
      delta = e.detail
    }
    delta = Math.max(-1, Math.min(1, delta)) // cap the delta to [-1,1] for cross browser consistency
    // apply zoom
    scale += delta * factor * scale
    scale = Math.min(max_scale, scale)
    callback(scale)
  }
}

const setupDragEventListeners = (draggableParent: HTMLElement, overlay: HTMLElement): void => {
  draggableParent.onmousedown = function (event) {
    if (event?.target !== draggableParent) return
    const initialX = event.pageX
    const initialY = event.pageY
    const overlayPosition = getComputedPosition(overlay, draggableParent as HTMLDivElement) as DOMRect
    const moveAt = (pageX: number, pageY: number): void => {
      const newX = overlayPosition?.left + pageX - initialX
      const newY = overlayPosition?.top + pageY - initialY
      overlay.style.transform = `translate(${newX}px,${newY}px)`
    }

    function onMouseMove(e: MouseEvent): void {
      moveAt(e.pageX, e.pageY)
    }
    draggableParent.addEventListener('mousemove', onMouseMove)
    draggableParent.onmouseup = function () {
      draggableParent.removeEventListener('mousemove', onMouseMove)
      draggableParent.onmouseup = null
    }
    draggableParent.onmouseleave = function () {
      draggableParent.removeEventListener('mousemove', onMouseMove)
    }
  }
}

const getSVGLinksFromPipeline = (
  states?: PipelineGraphState[],
  parentElement?: HTMLDivElement,
  resultArr: { [key: string]: string }[] = [],
  endNodeId?: string
): { [key: string]: string }[] => {
  let prevElement: PipelineGraphState
  states?.forEach((state, index) => {
    if (state?.children?.length) {
      const nextNodeId = states?.[index + 1]?.id || endNodeId
      getParallelNodeLinks(state?.children, state, resultArr, parentElement, nextNodeId, state.id)
    }
    if (prevElement) {
      resultArr.push(getFinalSVGArrowPath(prevElement.id, state.id, { isParallelNode: false, parentElement }))
    }
    prevElement = state
  })
  return resultArr
}

const getParallelNodeLinks = (
  stages: PipelineGraphState[],
  firstStage: PipelineGraphState | undefined,
  resultArr: { [key: string]: string }[] = [],
  parentElement?: HTMLDivElement,
  nextNode?: string,
  parentNode?: string
): void => {
  stages?.forEach(stage => {
    resultArr.push(
      getFinalSVGArrowPath(firstStage?.id as string, stage?.id, {
        isParallelNode: true,
        parentElement,
        nextNode,
        parentNode
      })
    )
  })
}

const getScaleToFitValue = (elm: HTMLElement, paddingFromBottom = 20): number => {
  return (
    1 /
    Math.max(
      elm.clientWidth / window.innerWidth,
      elm.clientHeight / (window.innerHeight - elm.offsetTop - paddingFromBottom)
    )
  )
}

const NodeTypeToNodeMap: Record<string, string> = {
  Deployment: 'default-node',
  CI: 'default-node',
  Pipeline: 'default-node',
  Custom: 'default-node',
  Approval: 'default-node'
}

const getPipelineGraphData = (
  data: StageElementWrapperConfig[] | ExecutionWrapperConfig[] = []
): PipelineGraphState[] => {
  let graphState: PipelineGraphState[] = []
  const pipGraphDataType = getPipelineGraphDataType(data)
  if (pipGraphDataType === PipelineGraphType.STAGE_GRAPH) {
    graphState = trasformStageData(data, pipGraphDataType)
  } else {
    graphState = trasformStepsData(data, pipGraphDataType)
  }

  return graphState
}

const trasformStageData = (stages: StageElementWrapperConfig[], graphType: PipelineGraphType): PipelineGraphState[] => {
  const finalData: PipelineGraphState[] = []
  stages.forEach((stage: StageElementWrapperConfig) => {
    if (stage?.stage) {
      const { nodeType, iconName } = getNodeInfo(defaultTo(stage.stage.type, ''), graphType)
      finalData.push({
        id: uuid() as string,
        identifier: stage.stage.identifier as string,
        name: stage.stage.name as string,
        type: stage.stage.type as string,
        nodeType: nodeType as string,
        icon: iconName,
        graphType,
        data: stage
      })
    } else if (stage?.parallel?.length) {
      const [first, ...rest] = stage.parallel
      const { nodeType, iconName } = getNodeInfo(defaultTo(first?.stage?.type, ''), graphType)
      finalData.push({
        id: uuid() as string,
        identifier: first?.stage?.identifier as string,
        name: first?.stage?.name as string,
        nodeType: nodeType as string,
        type: first?.stage?.type as string,
        icon: iconName,
        graphType,
        data: stage,
        children: trasformStageData(rest, graphType)
      })
    }
  })
  return finalData
}

const trasformStepsData = (steps: ExecutionWrapperConfig[], graphType: PipelineGraphType): PipelineGraphState[] => {
  const finalData: PipelineGraphState[] = []
  steps.forEach((step: ExecutionWrapperConfig) => {
    if (step?.step) {
      const { nodeType, iconName } = getNodeInfo(defaultTo(step.step.type, ''), graphType)
      finalData.push({
        id: uuid() as string,
        identifier: step.step.identifier as string,
        name: step.step.name as string,
        type: step.step.type as string,
        nodeType: nodeType as string,
        icon: iconName,
        graphType,
        data: step
      })
    } else if (step?.parallel?.length) {
      const [first, ...rest] = step.parallel
      if (first.stepGroup) {
        const { iconName } = getNodeInfo('', graphType)
        finalData.push({
          id: uuid() as string,
          identifier: first.stepGroup?.identifier as string,
          name: first.stepGroup?.name as string,
          type: 'StepGroup',
          nodeType: 'StepGroup',
          icon: iconName,
          data: first,
          children: trasformStepsData(rest as ExecutionWrapperConfig[], graphType),
          graphType
        })
      } else {
        const { nodeType, iconName } = getNodeInfo(first?.step?.type || '', graphType)
        finalData.push({
          id: uuid() as string,
          identifier: first?.step?.identifier as string,
          name: first?.step?.name as string,
          type: first?.step?.type as string,
          nodeType: nodeType as string,
          icon: iconName,
          data: first,
          children: trasformStepsData(rest, graphType),
          graphType
        })
      }
    } else {
      const { iconName } = getNodeInfo('', graphType)
      finalData.push({
        id: uuid() as string,
        identifier: step.stepGroup?.identifier as string,
        name: step.stepGroup?.name as string,
        type: 'StepGroup',
        nodeType: 'StepGroup',
        icon: iconName,
        data: step,
        graphType

        // children: trasformStepsData(step.stepGroup?.steps as ExecutionWrapperConfig[], graphType)
      })
    }
  })
  return finalData
}

const getNodeInfo = (type: string, graphType: PipelineGraphType): { iconName: IconName; nodeType: string } => {
  return graphType === PipelineGraphType.STEP_GRAPH
    ? {
        iconName: StepTypeToPipelineIconMap[type],
        nodeType: NodeTypeToNodeMap[type]
      }
    : {
        iconName: stageTypeToIconMap[type],
        nodeType: NodeTypeToNodeMap[type]
      }
}

const getPipelineGraphDataType = (data: StageElementWrapperConfig[] | ExecutionWrapperConfig[]): PipelineGraphType => {
  const hasStageData = defaultTo(get(data, '[0].parallel.[0].stage'), get(data, '[0].stage'))
  if (hasStageData) {
    return PipelineGraphType.STAGE_GRAPH
  }
  return PipelineGraphType.STEP_GRAPH
}
const getTerminalNodeLinks = ({
  firstNodeId = '',
  lastNodeId = '',
  createNodeId,
  startNodeId,
  endNodeId,
  readonly = false
}: {
  startNodeId: string
  endNodeId: string
  firstNodeId?: string
  lastNodeId?: string
  createNodeId?: string
  readonly?: boolean
}): SVGPathRecord[] => {
  const finalNodeLinks: SVGPathRecord[] = []
  if (firstNodeId && !readonly) {
    finalNodeLinks.push(
      ...[
        getFinalSVGArrowPath(startNodeId, firstNodeId),
        getFinalSVGArrowPath(lastNodeId, createNodeId),
        getFinalSVGArrowPath(createNodeId, endNodeId)
      ]
    )
  }
  if (firstNodeId && readonly) {
    finalNodeLinks.push(
      ...[getFinalSVGArrowPath(startNodeId, firstNodeId), getFinalSVGArrowPath(lastNodeId, endNodeId)]
    )
  }
  if (!firstNodeId && !readonly) {
    finalNodeLinks.push(
      ...[getFinalSVGArrowPath(startNodeId, createNodeId), getFinalSVGArrowPath(createNodeId, endNodeId)]
    )
  }
  return finalNodeLinks
}
export {
  ZOOM_INC_DEC_LEVEL,
  INITIAL_ZOOM_LEVEL,
  NodeTypeToNodeMap,
  getScaleToFitValue,
  getComputedPosition,
  getFinalSVGArrowPath,
  getPipelineGraphData,
  setupDragEventListeners,
  getSVGLinksFromPipeline,
  getTerminalNodeLinks
}
