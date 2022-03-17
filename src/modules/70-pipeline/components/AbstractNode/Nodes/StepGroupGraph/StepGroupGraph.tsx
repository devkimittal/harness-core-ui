/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { defaultTo } from 'lodash-es'
import { DiagramType, Event } from '@pipeline/components/Diagram'
import { SVGComponent } from '../../PipelineGraph/PipelineGraph'
import { PipelineGraphRecursive } from '../../PipelineGraph/PipelineGraphNode'
import {
  getFinalSVGArrowPath,
  getPipelineGraphData,
  getSVGLinksFromPipeline
} from '../../PipelineGraph/PipelineGraphUtils'
import type { NodeDetails, NodeIds, PipelineGraphState, SVGPathRecord } from '../../types'
// import CreateNode from '../CreateNode/CreateNode'
import { NodeType } from '../../Node'
import css from './StepGroupGraph.module.scss'
interface StepGroupGraphProps {
  id?: string
  data?: any[]
  getNode: (type?: string | undefined) => NodeDetails | undefined
  getDefaultNode(): NodeDetails | null
  selectedNodeId?: string
  uniqueNodeIds?: NodeIds
  fireEvent: (event: any) => void
  startEndNodeNeeded?: boolean
  updateSVGLinks?: (svgPath: string[]) => void
  prevNodeIdentifier?: string
  identifier?: string
  isNodeCollapsed: boolean
  updateGraphLinks: () => void
  readonly?: boolean
}

interface LayoutStyles {
  height: string
  width: string
  marginLeft?: string
}
const getCalculatedStyles = (data: PipelineGraphState[]): LayoutStyles => {
  let width = 0
  let maxChildLength = 0
  data.forEach(node => {
    width += 170
    maxChildLength = Math.max(maxChildLength, node?.children?.length || 0)
  })
  return { height: `${(maxChildLength + 1) * 100}px`, width: `${width - 80}px` }
}

function StepGroupGraph(props: StepGroupGraphProps): React.ReactElement {
  const [svgPath, setSvgPath] = useState<SVGPathRecord[]>([])
  const [treeRectangle, setTreeRectangle] = useState<DOMRect | void>()
  const [layoutStyles, setLayoutStyles] = useState<LayoutStyles>({ height: 'auto', width: 'auto' })
  const [state, setState] = useState<PipelineGraphState[]>([])
  const graphRef = useRef<HTMLDivElement>(null)
  const CreateNode: React.FC<any> | undefined = props?.getNode(NodeType.CreateNode)?.component

  const updateTreeRect = (): void => {
    const treeContainer = document.getElementById('tree-container')
    const rectBoundary = treeContainer?.getBoundingClientRect()
    setTreeRectangle(rectBoundary)
  }

  useLayoutEffect(() => {
    props?.data?.length && setState(getPipelineGraphData(props.data!))
  }, [treeRectangle, props.data])

  useLayoutEffect(() => {
    if (state?.length) {
      setSVGLinks()
      setLayoutStyles(getCalculatedStyles(state))
    }
  }, [state, props?.isNodeCollapsed])

  useLayoutEffect(() => {
    if (state?.length) {
      setSVGLinks()
      props?.updateGraphLinks()
    }
  }, [layoutStyles])

  const setSVGLinks = (): void => {
    const SVGLinks = getSVGLinksFromPipeline(state)
    const firstNodeIdentifier = state?.[0]?.id
    const lastNodeIdentifier = state?.[state?.length - 1]?.id
    const parentElement = graphRef.current?.querySelector('#tree-container') as HTMLDivElement

    return setSvgPath([
      ...SVGLinks,
      getFinalSVGArrowPath(props?.id, firstNodeIdentifier as string, {
        direction: 'ltl',
        parentElement
      }),
      getFinalSVGArrowPath(lastNodeIdentifier as string, props?.id, {
        direction: 'rtr',
        parentElement
      })
    ])
  }

  useEffect(() => {
    updateTreeRect()
  }, [])
  return (
    <div className={css.main} style={layoutStyles} ref={graphRef}>
      <SVGComponent svgPath={svgPath} className={css.stepGroupSvg} />
      {props?.data?.length ? (
        <PipelineGraphRecursive
          getDefaultNode={props?.getDefaultNode}
          parentIdentifier={props?.identifier}
          fireEvent={props.fireEvent}
          getNode={props.getNode}
          nodes={state}
          selectedNode={defaultTo(props?.selectedNodeId, '')}
          startEndNodeNeeded={false}
        />
      ) : (
        CreateNode &&
        !props.readonly && (
          <CreateNode
            {...props}
            isInsideStepGroup={true}
            onClick={(event: any) => {
              props?.fireEvent({
                type: Event.ClickNode,
                identifier: props?.identifier,
                parentIdentifier: props?.identifier,
                entityType: DiagramType.CreateNew,
                node: props,
                target: event.target
              })
            }}
            name={null}
          />
        )
      )}
    </div>
  )
}

export default StepGroupGraph
