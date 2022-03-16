/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

/* eslint-disable no-console */
import React, { useEffect, useLayoutEffect, useState, useRef, useMemo } from 'react'
import classNames from 'classnames'
import Draggable from 'react-draggable'
import { v4 as uuid } from 'uuid'
import { Event } from '@pipeline/components/Diagram'
import {
  getScaleToFitValue,
  getSVGLinksFromPipeline,
  getTerminalNodeLinks,
  INITIAL_ZOOM_LEVEL,
  scrollZoom,
  setupDragEventListeners
} from './PipelineGraphUtils'
import GraphActions from '../GraphActions/GraphActions'
import { PipelineGraphRecursive } from './PipelineGraphNode'
import type { NodeCollapsibleProps, NodeDetails, NodeIds, PipelineGraphState, SVGPathRecord } from '../types'
import css from './PipelineGraph.module.scss'

interface ControlPosition {
  x: number
  y: number
}

const DEFAULT_POSITION: ControlPosition = { x: 30, y: 60 }
export interface PipelineGraphProps {
  data: PipelineGraphState[]
  fireEvent: (event: any) => void
  getNode: (type?: string | undefined) => NodeDetails | undefined
  getDefaultNode(): NodeDetails | null
  selectedNodeId?: string
  collapsibleProps?: NodeCollapsibleProps
  readonly?: boolean
}

function PipelineGraph({
  data,
  getNode,
  fireEvent,
  collapsibleProps,
  getDefaultNode,
  selectedNodeId = '',
  readonly
}: PipelineGraphProps): React.ReactElement {
  const [svgPath, setSvgPath] = useState<SVGPathRecord[]>([])
  const [treeRectangle, setTreeRectangle] = useState<DOMRect | void>()
  const [state, setState] = useState<PipelineGraphState[]>(data)
  const [graphScale, setGraphScale] = useState(INITIAL_ZOOM_LEVEL)
  const canvasRef = useRef<HTMLDivElement>(null)
  const draggableRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const uniqueNodeIds = useMemo(
    (): NodeIds => ({
      startNode: uuid(),
      endNode: uuid(),
      createNode: uuid()
    }),
    []
  )

  const updateGraphScale = (newScale: number) => {
    setGraphScale(newScale)
  }

  const updateTreeRect = (): void => {
    const treeContainer = document.getElementById('tree-container')
    const rectBoundary = treeContainer?.getBoundingClientRect()
    setTreeRectangle(rectBoundary)
  }

  useLayoutEffect(() => {
    setState(data)
  }, [treeRectangle, data])

  useLayoutEffect(() => {
    setSVGLinks()
  }, [state])

  const setSVGLinks = (): void => {
    const lastNode = state?.[state?.length - 1]
    const terminalNodeLinks: SVGPathRecord[] = getTerminalNodeLinks({
      startNodeId: uniqueNodeIds.startNode,
      endNodeId: uniqueNodeIds.endNode,
      firstNodeId: state?.[0]?.id,
      lastNodeId: lastNode?.id,
      createNodeId: uniqueNodeIds.createNode,
      readonly
    })
    const SVGLinks = getSVGLinksFromPipeline(
      state,
      undefined,
      undefined,
      readonly ? uniqueNodeIds.endNode : uniqueNodeIds.createNode
    )
    return setSvgPath([...SVGLinks, ...terminalNodeLinks])
  }

  useEffect(() => {
    updateTreeRect()
    const draggableParent = draggableRef.current
    const overlay = overlayRef.current as HTMLElement
    if (draggableParent && overlay) {
      setupDragEventListeners(draggableParent, overlay)
      scrollZoom(overlay, 40, 0.01, updateGraphScale)
    }
  }, [])

  const handleScaleToFit = (): void => {
    setGraphScale(getScaleToFitValue(canvasRef.current as unknown as HTMLElement))
  }

  return (
    <div id="draggable-parent" className={css.draggableParent} ref={draggableRef}>
      <Draggable scale={graphScale} defaultPosition={DEFAULT_POSITION} offsetParent={document.body}>
        <div
          id="overlay"
          onClick={() => {
            fireEvent({ type: Event.CanvasClick })
          }}
          className={css.overlay}
          ref={overlayRef}
        >
          <div className={css.graphMain} ref={canvasRef} style={{ transform: `scale(${graphScale})` }}>
            <SVGComponent svgPath={svgPath} />
            <PipelineGraphRecursive
              fireEvent={fireEvent}
              getNode={getNode}
              nodes={state}
              selectedNode={selectedNodeId}
              uniqueNodeIds={uniqueNodeIds}
              updateGraphLinks={setSVGLinks}
              collapsibleProps={collapsibleProps}
              getDefaultNode={getDefaultNode}
              readonly={readonly}
            />
          </div>
        </div>
      </Draggable>
      <GraphActions setGraphScale={setGraphScale} graphScale={graphScale} handleScaleToFit={handleScaleToFit} />
    </div>
  )
}

interface SVGComponentProps {
  svgPath: SVGPathRecord[]
  className?: string
}

export function SVGComponent({ svgPath, className }: SVGComponentProps): React.ReactElement {
  return (
    <svg className={css.common}>
      {svgPath.map((path, idx) => {
        const [[nodeId, pathValue]] = Object.entries(path)
        return <path className={classNames(css.svgArrow, className)} id={`${nodeId}-link`} key={idx} d={pathValue} />
      })}
    </svg>
  )
}

export default PipelineGraph
