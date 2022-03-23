/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useRef, useState, useLayoutEffect, ForwardedRef } from 'react'
import { defaultTo } from 'lodash-es'
import classNames from 'classnames'
import { NodeType } from '../Node'
import GroupNode from '../Nodes/GroupNode/GroupNode'
import type { NodeCollapsibleProps, NodeDetails, NodeIds, PipelineGraphState } from '../types'
import { useNodeResizeObserver } from '../hooks/useResizeObserver'
import css from './PipelineGraph.module.scss'
export interface PipelineGraphRecursiveProps {
  nodes?: PipelineGraphState[]
  getNode: (type?: string | undefined) => NodeDetails | undefined
  getDefaultNode(): NodeDetails | null
  updateGraphLinks?: () => void
  fireEvent?: (event: any) => void
  selectedNode: string
  uniqueNodeIds?: NodeIds
  startEndNodeNeeded?: boolean
  parentIdentifier?: string
  collapsibleProps?: NodeCollapsibleProps
  readonly?: boolean
}
export function PipelineGraphRecursive({
  nodes,
  getNode,
  selectedNode,
  fireEvent,
  uniqueNodeIds,
  startEndNodeNeeded = true,
  parentIdentifier,
  updateGraphLinks,
  collapsibleProps,
  getDefaultNode,
  readonly = false
}: PipelineGraphRecursiveProps): React.ReactElement {
  const StartNode: React.FC<any> | undefined = getNode(NodeType.StartNode)?.component
  const CreateNode: React.FC<any> | undefined = getNode(NodeType.CreateNode)?.component
  const EndNode: React.FC<any> | undefined = getNode(NodeType.EndNode)?.component
  return (
    <div id="tree-container" className={classNames(css.graphTree, css.common)}>
      {StartNode && startEndNodeNeeded && (
        <StartNode id={uniqueNodeIds?.startNode} className={classNames(css.graphNode)} />
      )}
      {nodes?.map((node, index) => {
        return (
          <PipelineGraphNode
            getDefaultNode={getDefaultNode}
            parentIdentifier={parentIdentifier}
            fireEvent={fireEvent}
            selectedNode={selectedNode}
            data={node}
            key={node?.identifier}
            getNode={getNode}
            isNextNodeParallel={!!nodes?.[index + 1]?.children?.length}
            isPrevNodeParallel={!!nodes?.[index - 1]?.children?.length}
            prevNodeIdentifier={nodes?.[index - 1]?.identifier}
            nextNode={nodes?.[index + 1]}
            prevNode={nodes?.[index - 1]}
            updateGraphLinks={updateGraphLinks}
            collapsibleProps={collapsibleProps}
            readonly={readonly}
          />
        )
      })}
      {CreateNode && startEndNodeNeeded && !readonly && (
        <CreateNode identifier={uniqueNodeIds?.createNode} name={'Add Stage'} fireEvent={fireEvent} getNode={getNode} />
      )}
      {EndNode && startEndNodeNeeded && <EndNode id={uniqueNodeIds?.endNode} className={classNames(css.graphNode)} />}
      <div></div>
    </div>
  )
}

interface PipelineGraphNodeWithoutCollapseProps {
  className?: string
  data: PipelineGraphState
  fireEvent?: (event: any) => void
  getNode?: (type?: string | undefined) => NodeDetails | undefined
  selectedNode: string
  setSelectedNode?: (nodeId: string) => void
  isParallelNode?: boolean
  isNextNodeParallel?: boolean
  isPrevNodeParallel?: boolean
  isLastChild?: boolean
  prevNodeIdentifier?: string
  parentIdentifier?: string
  nextNode?: PipelineGraphState
  prevNode?: PipelineGraphState
  updateGraphLinks?: () => void
  getDefaultNode(): NodeDetails | null
  collapseOnIntersect?: boolean
  intersectingIndex?: number
  readonly?: boolean
}
const PipelineGraphNodeWithoutCollapse = React.forwardRef(
  (
    {
      fireEvent,
      getNode,
      data,
      className,
      isLastChild,
      selectedNode,
      isParallelNode,
      prevNodeIdentifier,
      isNextNodeParallel,
      isPrevNodeParallel,
      parentIdentifier,
      prevNode,
      nextNode,
      updateGraphLinks,
      collapseOnIntersect,
      getDefaultNode,
      intersectingIndex = -1,
      readonly
    }: PipelineGraphNodeWithoutCollapseProps,
    ref: ForwardedRef<HTMLDivElement>
  ): React.ReactElement | null => {
    const defaultNode = getDefaultNode()?.component
    const NodeComponent: React.FC<any> | undefined = getNode?.(data?.type)?.component || defaultNode

    const readOnlyValue = readonly || data.readonly
    return (
      <div
        className={classNames(
          { [css.nodeRightPadding]: isNextNodeParallel, [css.nodeLeftPadding]: isPrevNodeParallel },
          css.node
        )}
      >
        <>
          <div
            id={`ref_${data?.identifier}`}
            ref={intersectingIndex === 0 && data.children && collapseOnIntersect ? ref : null}
            key={data?.identifier}
            data-index={0}
          >
            {intersectingIndex == 0 && collapseOnIntersect ? (
              <GroupNode
                key={data?.identifier}
                fireEvent={fireEvent}
                getNode={getNode}
                className={classNames(css.graphNode, className)}
                isSelected={selectedNode === data?.identifier}
                isParallelNode={true}
                allowAdd={true}
                prevNodeIdentifier={prevNodeIdentifier}
                intersectingIndex={intersectingIndex}
                readonly={readOnlyValue}
                updateGraphLinks={updateGraphLinks}
                selectedNodeId={selectedNode}
                {...data}
              />
            ) : (
              NodeComponent && (
                <NodeComponent
                  parentIdentifier={parentIdentifier}
                  key={data?.identifier}
                  getNode={getNode}
                  fireEvent={fireEvent}
                  getDefaultNode={getDefaultNode}
                  className={classNames(css.graphNode, className)}
                  isSelected={selectedNode === data?.identifier}
                  isParallelNode={isParallelNode}
                  allowAdd={(!data?.children?.length && !isParallelNode) || (isParallelNode && isLastChild)}
                  isFirstParallelNode={true}
                  prevNodeIdentifier={prevNodeIdentifier}
                  prevNode={prevNode}
                  nextNode={nextNode}
                  updateGraphLinks={updateGraphLinks}
                  readonly={readOnlyValue}
                  selectedNodeId={selectedNode}
                  {...data}
                />
              )
            )}
          </div>
          {data?.children?.map((currentNodeData, index) => {
            const ChildNodeComponent: React.FC<any> | undefined =
              getNode?.(currentNodeData?.type)?.component || defaultNode
            const lastChildIndex = defaultTo(data.children?.length, 0) - 1
            const indexRelativeToParent = index + 1 // counting parent as 0 and children from 1
            const isCurrentChildLast = index === lastChildIndex
            const attachRef =
              intersectingIndex === -1 ? isCurrentChildLast : intersectingIndex === indexRelativeToParent
            return !collapseOnIntersect ? (
              ChildNodeComponent && (
                <ChildNodeComponent
                  parentIdentifier={parentIdentifier}
                  {...currentNodeData}
                  getNode={getNode}
                  fireEvent={fireEvent}
                  getDefaultNode={getDefaultNode}
                  className={classNames(css.graphNode, className)}
                  isSelected={selectedNode === currentNodeData?.identifier}
                  isParallelNode={true}
                  key={currentNodeData?.identifier}
                  allowAdd={indexRelativeToParent === data?.children?.length}
                  isFirstParallelNode={true}
                  prevNodeIdentifier={prevNodeIdentifier}
                  prevNode={prevNode}
                  nextNode={nextNode}
                  readonly={readOnlyValue}
                  updateGraphLinks={updateGraphLinks}
                  selectedNodeId={selectedNode}
                />
              )
            ) : (
              <div
                ref={attachRef ? ref : null}
                data-index={indexRelativeToParent}
                id={`ref_${currentNodeData?.identifier}`}
                key={currentNodeData?.identifier}
              >
                {attachRef && !isCurrentChildLast ? (
                  <GroupNode
                    {...data}
                    fireEvent={fireEvent}
                    getNode={getNode}
                    className={classNames(css.graphNode, className)}
                    isSelected={selectedNode === currentNodeData?.identifier}
                    isParallelNode={true}
                    key={currentNodeData?.identifier}
                    allowAdd={true}
                    prevNodeIdentifier={prevNodeIdentifier}
                    identifier={currentNodeData.identifier}
                    intersectingIndex={intersectingIndex}
                    readonly={readOnlyValue}
                    selectedNodeId={selectedNode}
                    updateGraphLinks={updateGraphLinks}
                  />
                ) : indexRelativeToParent > intersectingIndex && intersectingIndex !== -1 ? null : (
                  ChildNodeComponent && (
                    <ChildNodeComponent
                      parentIdentifier={parentIdentifier}
                      {...currentNodeData}
                      getNode={getNode}
                      fireEvent={fireEvent}
                      getDefaultNode={getDefaultNode}
                      className={classNames(css.graphNode, className)}
                      isSelected={selectedNode === currentNodeData?.identifier}
                      isParallelNode={true}
                      key={currentNodeData?.identifier}
                      allowAdd={index + 1 === data?.children?.length}
                      prevNodeIdentifier={prevNodeIdentifier}
                      prevNode={prevNode}
                      nextNode={nextNode}
                      readonly={readOnlyValue}
                      updateGraphLinks={updateGraphLinks}
                      selectedNodeId={selectedNode}
                    />
                  )
                )}
              </div>
            )
          })}
        </>
      </div>
    )
  }
)
PipelineGraphNodeWithoutCollapse.displayName = 'PipelineGraphNodeWithoutCollapse'

function PipelineGraphNodeWithCollapse(
  props: PipelineGraphNodeWithoutCollapseProps & {
    collapsibleProps?: NodeCollapsibleProps
  }
): React.ReactElement {
  const ref = useRef<HTMLDivElement>(null)
  const resizeState = useNodeResizeObserver(ref?.current, props.collapsibleProps)
  const [intersectingIndex, setIntersectingIndex] = useState<number>(-1)

  useLayoutEffect(() => {
    const element = (ref?.current || ref) as HTMLElement
    if (resizeState.shouldCollapse) {
      const indexToGroupFrom = Number(element?.dataset.index || -1) as unknown as number
      Number.isInteger(indexToGroupFrom) && indexToGroupFrom > 0 && setIntersectingIndex(indexToGroupFrom - 1)
    }
    if (resizeState.shouldExpand) {
      if (intersectingIndex < (props.data?.children?.length as number)) {
        const indexToGroupFrom = Number(element?.dataset.index || -1) as unknown as number
        Number.isInteger(indexToGroupFrom) &&
          indexToGroupFrom < (props.data.children as unknown as [])?.length &&
          setIntersectingIndex(indexToGroupFrom + 1)
      }
    }
  }, [resizeState])

  useLayoutEffect(() => {
    props.updateGraphLinks?.()
  }, [intersectingIndex])

  return (
    <PipelineGraphNodeWithoutCollapse
      {...props}
      ref={ref}
      intersectingIndex={intersectingIndex}
      collapseOnIntersect={true}
    />
  )
}

function PipelineGraphNodeBasic(props: any): React.ReactElement {
  return props?.collapsibleProps ? (
    <PipelineGraphNodeWithCollapse {...props} />
  ) : (
    <PipelineGraphNodeWithoutCollapse {...props} />
  )
}
const PipelineGraphNode = React.memo(PipelineGraphNodeBasic)
export { PipelineGraphNode }
