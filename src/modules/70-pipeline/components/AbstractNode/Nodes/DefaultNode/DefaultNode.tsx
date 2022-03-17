/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { Icon, Text, Color, Button, ButtonVariation } from '@wings-software/uicore'
import { DiagramDrag, DiagramType, Event } from '@pipeline/components/Diagram'
import SVGMarker from '../SVGMarker'
import css from './DefaultNode.module.scss'

function DefaultNode(props: any): JSX.Element {
  const allowAdd = props.allowAdd ?? false
  const nodeRef = React.useRef<HTMLDivElement>(null)
  const [showAdd, setVisibilityOfAdd] = React.useState(false)

  React.useEffect(() => {
    const currentNode = nodeRef.current
    const onMouseOver = (_e: MouseEvent): void => {
      if (allowAdd) {
        setVisibilityOfAdd(true)
      }
    }
    const onMouseLeave = (_e: MouseEvent): void => {
      if (allowAdd) {
        setTimeout(() => {
          setVisibilityOfAdd(false)
        }, 100)
      }
    }
    if (currentNode) {
      currentNode.addEventListener('mouseover', onMouseOver)
      currentNode.addEventListener('mouseleave', onMouseLeave)
    }
    return () => {
      if (currentNode) {
        currentNode.removeEventListener('mouseover', onMouseOver)
        currentNode.removeEventListener('mouseleave', onMouseLeave)
      }
    }
  }, [nodeRef, allowAdd])

  return (
    <div
      className={`${cx(css.defaultNode, 'default-node', { [css.marginBottom]: props.isParallelNode })} draggable`}
      ref={nodeRef}
      onClick={event => {
        event.stopPropagation()

        props?.fireEvent({
          ...props,
          type: Event.ClickNode,
          entityType: DiagramType.Default
        })
        props?.setSelectedNode(props?.identifier)
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
      <div
        id={props.id}
        data-nodeid={props.id}
        draggable={true}
        className={cx(css.defaultCard, { [css.selected]: props?.isSelected })}
        style={{
          width: props.width || 90,
          height: props.height || 40,
          cursor: props.disableClick ? 'not-allowed' : props.draggable ? 'move' : 'pointer',
          opacity: props.dragging ? 0.4 : 1
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
        <div className={css.markerStart}>
          <SVGMarker />
        </div>
        <div className="execution-running-animation" />
        {props.icon && (
          <Icon
            size={28}
            name={props.icon}
            inverse={props?.isSelected}
            style={{ pointerEvents: 'none', ...props?.iconStyle }}
          />
        )}
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
        <div className={css.markerEnd}>
          <SVGMarker />
        </div>
      </div>
      {props.name && (
        <Text
          width={props.width || 90}
          font={{ size: 'normal', align: 'center' }}
          color={props.defaultSelected ? Color.GREY_900 : Color.GREY_600}
          className={css.nameText}
          padding={'small'}
          lineClamp={2}
        >
          {props.name}
        </Text>
      )}
      {allowAdd && (
        <div
          onClick={event => {
            event.stopPropagation()
            props?.fireEvent({
              type: Event.AddParallelNode,
              entityType: DiagramType.Default,
              target: event.target,
              identifier: props?.identifier,
              parentIdentifier: props?.parentIdentifier,
              node: props
            })
          }}
          className={css.addNode}
          data-nodeid="add-parallel"
          style={{
            width: props.width || 90,
            height: props.height || 40,
            visibility: showAdd ? 'visible' : 'hidden'
          }}
        >
          <Icon name="plus" size={22} color={'var(--diagram-add-node-color)'} />
        </div>
      )}
    </div>
  )
}

export default DefaultNode
