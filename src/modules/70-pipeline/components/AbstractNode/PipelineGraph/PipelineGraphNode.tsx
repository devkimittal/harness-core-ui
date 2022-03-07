<<<<<<< HEAD
import React, { useRef, useState, useEffect, useLayoutEffect } from 'react'
=======
import React, { useRef, useState, useLayoutEffect } from 'react'
import { defaultTo } from 'lodash-es'
>>>>>>> bf25f373eca1a46613cb992ad4db5c969cb4fcb5
import classNames from 'classnames'
import { NodeType } from '../Node'
import GroupNode from '../Nodes/GroupNode/GroupNode'
import type { NodeDetails, NodeIds, PipelineGraphState } from '../types'
import { useNodeResizeObserver } from '../hooks/useResizeObserver'
import css from './PipelineGraph.module.scss'
<<<<<<< HEAD
import { defaultTo } from 'lodash-es'
=======
>>>>>>> bf25f373eca1a46613cb992ad4db5c969cb4fcb5
export interface PipelineGraphRecursiveProps {
  nodes?: PipelineGraphState[]
  getNode: (type?: string | undefined) => NodeDetails | undefined
  selectedNode: string
  uniqueNodeIds?: NodeIds
  fireEvent?: (event: any) => void
<<<<<<< HEAD
  setSelectedNode?: (nodeId: string) => void
=======
>>>>>>> bf25f373eca1a46613cb992ad4db5c969cb4fcb5
  startEndNodeNeeded?: boolean
  startEndNodeStyle?: { height?: string; width?: string }
  parentIdentifier?: string
  updateGraphLinks?: () => void
  collapseOnIntersect?: boolean
<<<<<<< HEAD
  updateSvgs?: () => void
  renderer?: boolean
=======
>>>>>>> bf25f373eca1a46613cb992ad4db5c969cb4fcb5
  getDefaultNode(): NodeDetails | null
}
export function PipelineGraphRecursive({
  nodes,
  getNode,
  selectedNode,
  fireEvent,
<<<<<<< HEAD
  setSelectedNode,
=======
>>>>>>> bf25f373eca1a46613cb992ad4db5c969cb4fcb5
  uniqueNodeIds,
  startEndNodeNeeded = true,
  startEndNodeStyle,
  parentIdentifier,
  updateGraphLinks,
  collapseOnIntersect,
<<<<<<< HEAD
  updateSvgs,
  renderer,
=======
>>>>>>> bf25f373eca1a46613cb992ad4db5c969cb4fcb5
  getDefaultNode
}: PipelineGraphRecursiveProps): React.ReactElement {
  const StartNode: React.FC<any> | undefined = getNode(NodeType.StartNode)?.component
  const CreateNode: React.FC<any> | undefined = getNode(NodeType.CreateNode)?.component
  const EndNode: React.FC<any> | undefined = getNode(NodeType.EndNode)?.component
  return (
    <div id="tree-container" className={classNames(css.graphTree, css.common)}>
      {StartNode && startEndNodeNeeded && (
        <div>
          <div style={startEndNodeStyle} id={uniqueNodeIds?.startNode} className={classNames(css.graphNode)}>
            <StartNode />
          </div>
        </div>
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
<<<<<<< HEAD
            setSelectedNode={setSelectedNode}
=======
>>>>>>> bf25f373eca1a46613cb992ad4db5c969cb4fcb5
            isNextNodeParallel={!!nodes?.[index + 1]?.children?.length}
            isPrevNodeParallel={!!nodes?.[index - 1]?.children?.length}
            prevNodeIdentifier={nodes?.[index - 1]?.identifier}
            nextNode={nodes?.[index + 1]}
            prevNode={nodes?.[index - 1]}
            updateGraphLinks={updateGraphLinks}
            collapseOnIntersect={collapseOnIntersect}
<<<<<<< HEAD
            updateSvgs={updateSvgs}
            renderer={renderer}
=======
>>>>>>> bf25f373eca1a46613cb992ad4db5c969cb4fcb5
          />
        )
      })}
      {CreateNode && startEndNodeNeeded && (
        <CreateNode
          graphType={nodes?.[0]?.graphType}
          identifier={uniqueNodeIds?.createNode}
          name={'Add Stage'}
          fireEvent={fireEvent}
          getNode={getNode}
        />
      )}
      {EndNode && startEndNodeNeeded && (
        <div style={startEndNodeStyle} id={uniqueNodeIds?.endNode} className={classNames(css.graphNode)}>
          <EndNode />
        </div>
      )}
      <div></div>
    </div>
  )
}

interface PipelineGraphNode {
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
  collapseOnIntersect?: boolean
<<<<<<< HEAD
  updateSvgs?: () => void
  renderer?: boolean
=======
>>>>>>> bf25f373eca1a46613cb992ad4db5c969cb4fcb5
  getDefaultNode(): NodeDetails | null
}

function PipelineGraphNodeBasic({
  fireEvent,
  getNode,
<<<<<<< HEAD
  setSelectedNode,
=======
>>>>>>> bf25f373eca1a46613cb992ad4db5c969cb4fcb5
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
<<<<<<< HEAD
  updateSvgs,
  renderer,
=======
>>>>>>> bf25f373eca1a46613cb992ad4db5c969cb4fcb5
  getDefaultNode
}: PipelineGraphNode): React.ReactElement | null {
  const defaultNode = getDefaultNode()?.component
  const NodeComponent: React.FC<any> | undefined = getNode?.(data?.type)?.component || defaultNode
  const ref = useRef<HTMLDivElement>(null)
  const resizeState = useNodeResizeObserver('.Pane1', ref?.current)
  const [intersectingIndex, setIntersectingIndex] = useState<number>(-1)

  useLayoutEffect(() => {
    const element = (ref?.current || ref) as HTMLElement
    if (resizeState.shouldCollapse) {
      const indexToGroupFrom = Number(element?.dataset.index || -1) as unknown as number
      Number.isInteger(indexToGroupFrom) && indexToGroupFrom > 0 && setIntersectingIndex(indexToGroupFrom - 1)
    }
    if (resizeState.shouldExpand) {
      if (intersectingIndex < (data?.children?.length as number)) {
        const indexToGroupFrom = Number(element?.dataset.index || -1) as unknown as number
        Number.isInteger(indexToGroupFrom) &&
          indexToGroupFrom < (data.children as unknown as [])?.length &&
          setIntersectingIndex(indexToGroupFrom + 1)
      }
    }
  }, [resizeState])

  useLayoutEffect(() => {
    updateGraphLinks?.()
  }, [intersectingIndex])
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
              className={classNames(css.graphNode, className)}
<<<<<<< HEAD
              setSelectedNode={setSelectedNode}
=======
>>>>>>> bf25f373eca1a46613cb992ad4db5c969cb4fcb5
              isSelected={selectedNode === data?.identifier}
              isParallelNode={true}
              allowAdd={true}
              prevNodeIdentifier={prevNodeIdentifier}
              intersectingIndex={intersectingIndex}
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
<<<<<<< HEAD
                setSelectedNode={setSelectedNode}
=======
>>>>>>> bf25f373eca1a46613cb992ad4db5c969cb4fcb5
                isSelected={selectedNode === data?.identifier}
                isParallelNode={isParallelNode}
                allowAdd={(!data?.children?.length && !isParallelNode) || (isParallelNode && isLastChild)}
                isFirstParallelNode={true}
                prevNodeIdentifier={prevNodeIdentifier}
                prevNode={prevNode}
                nextNode={nextNode}
<<<<<<< HEAD
                updateSvgs={updateSvgs}
                renderer={renderer}
=======
                updateGraphLinks={updateGraphLinks}
>>>>>>> bf25f373eca1a46613cb992ad4db5c969cb4fcb5
                {...data}
              />
            )
          )}
        </div>
        {data?.children?.map((currentStage, index) => {
<<<<<<< HEAD
          const ChildNodeComponent: React.FC<any> | undefined = getNode?.(data?.nodeType)?.component || defaultNode
=======
          const ChildNodeComponent: React.FC<any> | undefined = getNode?.(data?.type)?.component || defaultNode
>>>>>>> bf25f373eca1a46613cb992ad4db5c969cb4fcb5
          const lastChildIndex = defaultTo(data.children?.length, 0) - 1
          const indexRelativeToParent = index + 1 // counting parent as 0 and children from 1
          const isCurrentChildLast = index === lastChildIndex
          const attachRef = intersectingIndex === -1 ? isCurrentChildLast : intersectingIndex === indexRelativeToParent
          return !collapseOnIntersect ? (
            ChildNodeComponent && (
              <ChildNodeComponent
                parentIdentifier={parentIdentifier}
                {...currentStage}
                getNode={getNode}
                fireEvent={fireEvent}
                getDefaultNode={getDefaultNode}
                className={classNames(css.graphNode, className)}
<<<<<<< HEAD
                setSelectedNode={setSelectedNode}
=======
>>>>>>> bf25f373eca1a46613cb992ad4db5c969cb4fcb5
                isSelected={selectedNode === currentStage?.identifier}
                isParallelNode={true}
                key={currentStage?.identifier}
                allowAdd={indexRelativeToParent === data?.children?.length}
                isFirstParallelNode={true}
                prevNodeIdentifier={prevNodeIdentifier}
                prevNode={prevNode}
                nextNode={nextNode}
<<<<<<< HEAD
                updateSvgs={updateSvgs}
                renderer={renderer}
=======
                updateGraphLinks={updateGraphLinks}
>>>>>>> bf25f373eca1a46613cb992ad4db5c969cb4fcb5
              />
            )
          ) : (
            <div
              ref={attachRef ? ref : null}
              data-index={indexRelativeToParent}
              id={`ref_${currentStage?.identifier}`}
              key={currentStage?.identifier}
            >
              {attachRef && !isCurrentChildLast ? (
                <GroupNode
                  {...data}
                  fireEvent={fireEvent}
                  className={classNames(css.graphNode, className)}
<<<<<<< HEAD
                  setSelectedNode={setSelectedNode}
=======
>>>>>>> bf25f373eca1a46613cb992ad4db5c969cb4fcb5
                  isSelected={selectedNode === currentStage?.identifier}
                  isParallelNode={true}
                  key={currentStage?.identifier}
                  allowAdd={true}
                  prevNodeIdentifier={prevNodeIdentifier}
                  identifier={currentStage.identifier}
                  intersectingIndex={intersectingIndex}
                />
              ) : indexRelativeToParent > intersectingIndex && intersectingIndex !== -1 ? null : (
                ChildNodeComponent && (
                  <ChildNodeComponent
                    parentIdentifier={parentIdentifier}
                    {...currentStage}
                    getNode={getNode}
                    fireEvent={fireEvent}
                    getDefaultNode={getDefaultNode}
                    className={classNames(css.graphNode, className)}
<<<<<<< HEAD
                    setSelectedNode={setSelectedNode}
=======
>>>>>>> bf25f373eca1a46613cb992ad4db5c969cb4fcb5
                    isSelected={selectedNode === currentStage?.identifier}
                    isParallelNode={true}
                    key={currentStage?.identifier}
                    allowAdd={index + 1 === data?.children?.length}
                    prevNodeIdentifier={prevNodeIdentifier}
                    prevNode={prevNode}
                    nextNode={nextNode}
<<<<<<< HEAD
                    updateSvgs={updateSvgs}
                    renderer={renderer}
=======
                    updateGraphLinks={updateGraphLinks}
>>>>>>> bf25f373eca1a46613cb992ad4db5c969cb4fcb5
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

const PipelineGraphNode = React.memo(PipelineGraphNodeBasic)
export { PipelineGraphNode }
