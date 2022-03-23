/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import * as React from 'react'
import { isEmpty } from 'lodash-es'
import cx from 'classnames'
import { Text, IconName, Icon, Button, ButtonVariation, Color } from '@wings-software/uicore'
import { Position } from '@blueprintjs/core'
import { DiagramDrag, DiagramType, Event } from '@pipeline/components/Diagram'
// import CreateNode from '../CreateNode/CreateNodeStage'
import { PipelineGraphType } from '../../types'
import { NodeType } from '../../Node'
import cssDefault from '../DefaultNode/DefaultNode.module.scss'
import css from './IconNode.module.scss'

export function IconNode(props: any): React.ReactElement {
  const allowAdd = props.allowAdd ?? false
  const [showAdd, setVisibilityOfAdd] = React.useState(false)
  const CreateNode: React.FC<any> | undefined = props?.getNode(NodeType.CreateNode)?.component

  return (
    <div
      className={cx(cssDefault.defaultNode, css.iconNodeContainer)}
      onMouseDown={e => e.stopPropagation()}
      onDragOver={event => {
        event.stopPropagation()

        if (event.dataTransfer.types.indexOf(DiagramDrag.AllowDropOnNode) !== -1) {
          if (allowAdd) {
            setVisibilityOfAdd(true)
            event.preventDefault()
          }
        }
      }}
      onDragLeave={event => {
        event.stopPropagation()

        if (event.dataTransfer.types.indexOf(DiagramDrag.AllowDropOnNode) !== -1) {
          if (allowAdd) {
            setVisibilityOfAdd(false)
          }
        }
      }}
      onClick={event => {
        event.stopPropagation()
        if (props?.onClick) {
          props.onClick()
          return
        }
        props?.fireEvent({
          type: Event.ClickNode,
          target: event.target,
          data: {
            entityType: DiagramType.IconNode,
            ...props
          }
        })
      }}
      onDrop={event => {
        props?.fireEvent({
          type: Event.DropNodeEvent,
          target: event.target,
          data: {
            entityType: DiagramType.Default,
            node: JSON.parse(event.dataTransfer.getData(DiagramDrag.NodeDrag)),
            destination: props
          }
        })
      }}
      onMouseEnter={event => {
        event.stopPropagation()

        props?.fireEvent({
          type: Event.MouseEnterNode,
          target: event.target,
          data: { ...props }
        })
      }}
      onMouseLeave={event => {
        event.stopPropagation()

        props?.fireEvent({
          type: Event.MouseLeaveNode,
          target: event.target,
          data: { ...props }
        })
      }}
    >
      <div
        id={props.id}
        className={cx(cssDefault.defaultCard, css.iconNode, { [cssDefault.selected]: props.isSelected })}
        data-nodeid={props.identifier}
        draggable={!props.readonly}
        onDragStart={event => {
          event.stopPropagation()
          event.dataTransfer.setData(DiagramDrag.NodeDrag, JSON.stringify(props))
          // NOTE: onDragOver we cannot access dataTransfer data
          // in order to detect if we can drop, we are setting and using "keys" and then
          // checking in onDragOver if this type (AllowDropOnLink/AllowDropOnNode) exist we allow drop
          event.dataTransfer.setData(DiagramDrag.AllowDropOnLink, '1')
          //   event.dataTransfer.setData(DiagramDrag.AllowDropOnNode, '1')
          // if (options.allowDropOnNode) event.dataTransfer.setData(DiagramDrag.AllowDropOnNode, '1')
          event.dataTransfer.dropEffect = 'move'
        }}
        onDragEnd={event => {
          event.preventDefault()
          event.stopPropagation()
        }}
      >
        <div>
          {props.isInComplete && <Icon className={css.inComplete} size={12} name={'warning-sign'} color="orange500" />}
          {props.canDelete && !props.readonly && (
            <Button
              className={cx(cssDefault.closeNode)}
              variation={ButtonVariation.PRIMARY}
              minimal
              withoutCurrentColor
              icon="cross"
              iconProps={{ size: 10 }}
              onMouseDown={e => {
                e.stopPropagation()
                props?.fireEvent({
                  type: Event.RemoveNode,
                  identifier: props?.identifier,
                  node: props
                })
              }}
            />
          )}
          <Icon name={props.icon as IconName} size={50} inverse={props.isSelected} />
        </div>
      </div>
      {!isEmpty(props.name) && (
        <Text
          font={{ size: 'normal', align: 'center' }}
          style={{
            cursor: 'pointer',
            lineHeight: '1.6',
            overflowWrap: 'normal',
            wordBreak: 'keep-all',
            marginLeft: '0px',
            marginRight: '0px'
          }}
          padding="xsmall"
          lineClamp={2}
          tooltipProps={{ position: Position.RIGHT, portalClassName: css.hoverName }}
        >
          {props.name}
        </Text>
      )}
      {allowAdd && !props.readonly && CreateNode && (
        <CreateNode
          onMouseOver={() => allowAdd && setVisibilityOfAdd(true)}
          onMouseLeave={() => allowAdd && setVisibilityOfAdd(false)}
          onClick={(event: MouseEvent) => {
            event.stopPropagation()
            props?.fireEvent({
              type: Event.AddParallelNode,
              target: event.target,
              data: {
                identifier: props?.identifier,
                parentIdentifier: props?.parentIdentifier,
                entityType: DiagramType.Default,
                node: props
              }
            })
          }}
          className={cx(
            cssDefault.addNode,
            { [cssDefault.visible]: showAdd },
            {
              [cssDefault.stepAddNode]: props.graphType === PipelineGraphType.STEP_GRAPH
            },
            {
              [cssDefault.stageAddNode]: props.graphType === PipelineGraphType.STAGE_GRAPH
            }
          )}
          data-nodeid="add-parallel"
        />
      )}
      {!props.isParallelNode && !props.readonly && (
        <div
          data-linkid={props?.identifier}
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
          }}
          onDrop={event => {
            event.stopPropagation()
            props?.fireEvent({
              type: Event.DropLinkEvent,
              linkBeforeStepGroup: false,
              entityType: DiagramType.Link,
              node: JSON.parse(event.dataTransfer.getData(DiagramDrag.NodeDrag)),
              destination: props
            })
          }}
          className={cx(
            cssDefault.addNodeIcon,
            cssDefault.left,
            {
              [cssDefault.stepAddIcon]: props.graphType === PipelineGraphType.STEP_GRAPH
            },
            {
              [cssDefault.stageAddIcon]: props.graphType === PipelineGraphType.STAGE_GRAPH
            }
          )}
        >
          <Icon name="plus" color={Color.WHITE} />
        </div>
      )}
      {(props?.nextNode?.nodeType === NodeType.StepGroupNode || (!props?.nextNode && props?.parentIdentifier)) &&
        !props.isParallelNode && (
          <div
            data-linkid={props?.identifier}
            onClick={event => {
              event.stopPropagation()
              props?.fireEvent({
                type: Event.AddLinkClicked,
                linkBeforeStepGroup: true,
                prevNodeIdentifier: props?.prevNodeIdentifier,
                parentIdentifier: props?.parentIdentifier,
                entityType: DiagramType.Link,
                identifier: props?.identifier,
                node: props
              })
            }}
            onDragOver={event => {
              event.stopPropagation()
              event.preventDefault()
            }}
            onDrop={event => {
              event.stopPropagation()
              props?.fireEvent({
                type: Event.DropLinkEvent,
                linkBeforeStepGroup: true,
                entityType: DiagramType.Link,
                node: JSON.parse(event.dataTransfer.getData(DiagramDrag.NodeDrag)),
                destination: props
              })
            }}
            className={cx(
              cssDefault.addNodeIcon,
              cssDefault.right,
              {
                [cssDefault.stepAddIcon]: props.graphType === PipelineGraphType.STEP_GRAPH
              },
              {
                [cssDefault.stageAddIcon]: props.graphType === PipelineGraphType.STAGE_GRAPH
              }
            )}
          >
            <Icon name="plus" color={Color.WHITE} />
          </div>
        )}
    </div>
  )
}
