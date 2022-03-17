/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import * as React from 'react'
import classnames from 'classnames'
import { Icon, Layout, Text, Button, ButtonVariation, Color } from '@wings-software/uicore'
import { Event, DiagramDrag, DiagramType } from '@pipeline/components/Diagram'
import StepGroupGraph from '../StepGroupGraph/StepGroupGraph'
import { NodeType } from '../../Node'
import css from './StepGroupNode.module.scss'
import defaultCss from '../DefaultNode/DefaultNode.module.scss'

export function StepGroupNode(props: any): JSX.Element {
  const allowAdd = props.allowAdd ?? false
  const [showAdd, setVisibilityOfAdd] = React.useState(false)
  const [showAddLink, setShowAddLink] = React.useState(false)
  const [isNodeCollapsed, setNodeCollapsed] = React.useState(false)
  const CreateNode: React.FC<any> | undefined = props?.getNode(NodeType.CreateNode)?.component
  const DefaultNode: React.FC<any> | undefined = props?.getDefaultNode()?.component

  React.useEffect(() => {
    props?.updateGraphLinks()
  }, [isNodeCollapsed])

  return (
    <>
      {isNodeCollapsed && DefaultNode ? (
        <DefaultNode
          onClick={() => {
            setNodeCollapsed(false)
          }}
          {...props}
          icon="step-group"
        />
      ) : (
        <div style={{ position: 'relative' }}>
          <div
            onMouseOver={() => allowAdd && setVisibilityOfAdd(true)}
            onMouseLeave={() => allowAdd && setVisibilityOfAdd(false)}
            onDragLeave={() => allowAdd && setVisibilityOfAdd(false)}
            className={classnames(
              css.stepGroup,
              { [css.firstnode]: !props?.isParallelNode },
              { [css.marginBottom]: props?.isParallelNode }
            )}
          >
            <div id={props?.id} className={css.horizontalBar}></div>
            <div className={css.stepGroupHeader}>
              <Layout.Horizontal
                spacing="xsmall"
                onMouseOver={e => {
                  e.stopPropagation()
                }}
                onMouseOut={e => {
                  e.stopPropagation()
                }}
              >
                <Icon
                  className={css.collapseIcon}
                  name="minus"
                  onClick={e => {
                    e.stopPropagation()
                    setNodeCollapsed(true)
                  }}
                />
                <Text lineClamp={1}>{props.name}</Text>
              </Layout.Horizontal>
            </div>
            <div className={css.stepGroupBody}>
              <StepGroupGraph {...props} data={props?.data?.stepGroup?.steps} isNodeCollapsed={isNodeCollapsed} />
            </div>
            <Button
              className={classnames(css.closeNode, { [css.readonly]: props.readonly })}
              minimal
              icon="cross"
              variation={ButtonVariation.PRIMARY}
              iconProps={{ size: 10 }}
              onMouseDown={e => {
                e.stopPropagation()
                props?.fireEvent({
                  type: Event.RemoveNode,
                  identifier: props?.identifier,
                  node: props
                })
              }}
              withoutCurrentColor={true}
            />
          </div>
          {!props.isParallelNode && !props.readonly && (
            <div
              data-linkid={props?.identifier}
              onMouseOver={event => event.stopPropagation()}
              onClick={event => {
                event.stopPropagation()
                props?.fireEvent({
                  type: Event.AddLinkClicked,
                  entityType: DiagramType.Link,
                  node: props,
                  prevNodeIdentifier: props?.prevNodeIdentifier,
                  parentIdentifier: props?.parentIdentifier,
                  identifier: props?.identifier
                })
              }}
              onDragOver={event => {
                event.stopPropagation()
                event.preventDefault()
                setShowAddLink(true)
              }}
              onDragLeave={event => {
                event.stopPropagation()
                event.preventDefault()
                setShowAddLink(false)
              }}
              onDrop={event => {
                event.stopPropagation()
                setShowAddLink(false)
                props?.fireEvent({
                  type: Event.DropLinkEvent,
                  linkBeforeStepGroup: false,
                  entityType: DiagramType.Link,
                  node: JSON.parse(event.dataTransfer.getData(DiagramDrag.NodeDrag)),
                  destination: props
                })
              }}
              className={classnames(defaultCss.addNodeIcon, defaultCss.left, defaultCss.stepAddIcon, {
                [defaultCss.show]: showAddLink
              })}
            >
              <Icon name="plus" color={Color.WHITE} />
            </div>
          )}
          {allowAdd && !props.readonly && CreateNode && (
            <CreateNode
              className={classnames(
                defaultCss.addNode,
                defaultCss.stepGroupAddNode,
                { [defaultCss.visible]: showAdd },
                { [defaultCss.marginBottom]: props?.isParallelNode }
              )}
              onMouseOver={() => allowAdd && setVisibilityOfAdd(true)}
              onMouseLeave={() => allowAdd && setVisibilityOfAdd(false)}
              // onDragOver={() => allowAdd && setVisibilityOfAdd(true)}
              // onDragLeave={() => allowAdd && setVisibilityOfAdd(false)}
              onDrop={(event: any) => {
                props?.fireEvent({
                  type: Event.DropNodeEvent,
                  entityType: DiagramType.Default,
                  node: JSON.parse(event.dataTransfer.getData(DiagramDrag.NodeDrag)),
                  destination: props
                })
              }}
              onClick={(event: any) => {
                event.stopPropagation()
                props?.fireEvent({
                  type: Event.AddParallelNode,
                  identifier: props?.identifier,
                  parentIdentifier: props?.parentIdentifier,
                  entityType: DiagramType.StepGroupNode,
                  node: props,
                  target: event.target
                })
              }}
            />
          )}
        </div>
      )}
    </>
  )
}
