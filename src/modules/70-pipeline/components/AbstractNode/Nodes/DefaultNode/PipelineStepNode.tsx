/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { Icon, Text, Color, Button, ButtonVariation, IconName, Utils } from '@wings-software/uicore'
import { DiagramDrag, DiagramType, Event } from '@pipeline/components/Diagram'
import { ExecutionStatus, ExecutionStatusEnum } from '@pipeline/utils/statusHelpers'
import stepsfactory from '@pipeline/components/PipelineSteps/PipelineStepFactory'
import { RunningIcon } from '@pipeline/components/ExecutionCard/MiniExecutionGraph/StageNode'
import { getStatusProps } from '@pipeline/components/ExecutionStageDiagram/ExecutionStageDiagramUtils'
import { ExecutionPipelineNodeType } from '@pipeline/components/ExecutionStageDiagram/ExecutionPipelineModel'
import SVGMarker from '../SVGMarker'
import { NodeType } from '../../Node'
import css from './DefaultNode.module.scss'

const CODE_ICON: IconName = 'command-echo'

function PipelineStepNode(props: any): JSX.Element {
  const allowAdd = props.allowAdd ?? false
  const [showAddNode, setVisibilityOfAdd] = React.useState(false)
  const [showAddLink, setShowAddLink] = React.useState(false)
  const stepType = props.type || props?.data?.step?.stepType || ''
  const stepData = stepsfactory.getStepData(stepType)
  let stepIconColor = stepsfactory.getStepIconColor(stepType)
  if (stepIconColor && Object.values(Color).includes(stepIconColor)) {
    stepIconColor = Utils.getRealCSSColor(stepIconColor)
  }
  const CreateNode: React.FC<any> | undefined = props?.getNode(NodeType.CreateNode)?.component

  const stepStatus = props?.status || (props?.data?.step?.status as ExecutionStatus)
  const { secondaryIconProps, secondaryIcon, secondaryIconStyle } = getStatusProps(
    stepStatus,
    ExecutionPipelineNodeType.NORMAL
  )
  return (
    <div
      className={cx(css.defaultNode, 'default-node', { draggable: !props.readOnly })}
      // ref={nodeRef}
      onMouseOver={() => allowAdd && setVisibilityOfAdd(true)}
      onMouseLeave={() => allowAdd && setVisibilityOfAdd(false)}
      onClick={event => {
        event.stopPropagation()
        if (props?.onClick) {
          props.onClick()
          return
        }
        props?.fireEvent({
          type: Event.ClickNode,
          entityType: DiagramType.Default,
          identifier: props?.identifier,
          parentIdentifier: props?.parentIdentifier
        })
      }}
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
      onDrop={event => {
        event.stopPropagation()
        props?.fireEvent({
          type: Event.DropNodeEvent,
          entityType: DiagramType.Default,
          node: JSON.parse(event.dataTransfer.getData(DiagramDrag.NodeDrag)),
          destination: props
        })
      }}
    >
      <div className={cx(css.markerStart, css.stepMarker)}>
        <SVGMarker />
      </div>
      <div
        id={props.id}
        data-nodeid={props.id}
        draggable={true}
        className={cx(css.defaultCard, {
          [css.selected]: props?.isSelected,
          [css.failed]: stepStatus === ExecutionStatusEnum.Failed
        })}
        style={{
          width: 64,
          height: 64
        }}
        onDragStart={event => {
          event.stopPropagation()
          event.dataTransfer.setData(DiagramDrag.NodeDrag, JSON.stringify(props))
          // NOTE: onDragOver we cannot access dataTransfer data
          // in order to detect if we can drop, we are setting and using "keys" and then
          // checking in onDragOver if this type (AllowDropOnLink/AllowDropOnNode) exist we allow drop
          event.dataTransfer.setData(DiagramDrag.AllowDropOnLink, '1')
          event.dataTransfer.setData(DiagramDrag.AllowDropOnNode, '1')
          // if (options.allowDropOnNode) event.dataTransfer.setData(DiagramDrag.AllowDropOnNode, '1')
          event.dataTransfer.dropEffect = 'move'
        }}
        onDragEnd={event => {
          event.preventDefault()
          event.stopPropagation()
        }}
      >
        <div className="execution-running-animation" />
        {(stepData?.icon || props?.icon) && (
          <Icon
            size={28}
            color={props.isSelected ? Utils.getRealCSSColor(Color.WHITE) : stepIconColor}
            name={stepData?.icon || props?.icon || 'cross'}
            inverse={props?.isSelected || (stepStatus as string) === ExecutionStatusEnum.Failed}
          />
        )}
        {secondaryIcon && (
          <Icon
            name={secondaryIcon}
            style={secondaryIconStyle}
            size={13}
            className={css.secondaryIcon}
            {...secondaryIconProps}
          />
        )}
        {CODE_ICON && <Icon className={css.codeIcon} size={8} name={CODE_ICON} />}

        <Button
          className={cx(css.closeNode, { [css.readonly]: props.readonly })}
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
      <div className={cx(css.markerEnd, css.stepMarker)}>
        <SVGMarker />
      </div>
      {props.name && (
        <Text
          width={64}
          font={{ size: 'normal', align: 'center' }}
          color={props.defaultSelected ? Color.GREY_900 : Color.GREY_600}
          className={css.nameText}
          padding={'small'}
          lineClamp={2}
        >
          {props.name}
        </Text>
      )}
      {allowAdd && CreateNode && !props.readonly && (
        <CreateNode
          onMouseOver={() => allowAdd && setVisibilityOfAdd(true)}
          onMouseLeave={() => allowAdd && setVisibilityOfAdd(false)}
          onClick={(event: MouseEvent) => {
            event.stopPropagation()
            props?.fireEvent({
              type: Event.AddParallelNode,
              identifier: props?.identifier,
              parentIdentifier: props?.parentIdentifier,
              entityType: DiagramType.Default,
              node: props,
              target: event.target
            })
          }}
          className={cx(css.addNode, css.stepAddNode, { [css.visible]: showAddNode })}
          data-nodeid="add-parallel"
        />
      )}
      {!props.isParallelNode && !props.readonly && (
        <div
          data-linkid={props?.identifier}
          onMouseOver={event => event.stopPropagation()}
          onMouseEnter={event => event.stopPropagation()}
          onMouseLeave={event => event.stopPropagation()}
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
          className={cx(css.addNodeIcon, css.left, css.stepAddIcon, {
            [css.show]: showAddLink
          })}
        >
          <Icon name="plus" color={Color.WHITE} />
        </div>
      )}
      {!props?.nextNode && props?.parentIdentifier && !props.readonly && !props.isParallelNode && (
        <div
          data-linkid={props?.identifier}
          onMouseOver={event => event.stopPropagation()}
          onMouseEnter={event => event.stopPropagation()}
          onMouseLeave={event => event.stopPropagation()}
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
          className={cx(css.addNodeIcon, css.right, css.stepAddIcon, {
            [css.show]: showAddLink
          })}
        >
          <Icon name="plus" color={Color.WHITE} />
        </div>
      )}
    </div>
  )
}

export default PipelineStepNode
