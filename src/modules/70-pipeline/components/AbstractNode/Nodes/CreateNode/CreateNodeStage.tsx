/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Text } from '@wings-software/uicore'
import { Icon } from '@blueprintjs/core'
import cx from 'classnames'
import { isEmpty } from 'lodash-es'
import { DiagramDrag, DiagramType, Event } from '@pipeline/components/Diagram'
import cssDefault from '../DefaultNode/DefaultNode.module.scss'
import css from './CreateNode.module.scss'

function CreateNodeStage(props: any): React.ReactElement {
  return (
    <div
      onMouseOver={() => {
        if (props?.onMouseOver) {
          props.onMouseOver()
        }
      }}
      onMouseLeave={() => {
        if (props?.onMouseLeave) {
          props.onMouseLeave()
        }
      }}
      className={cssDefault.defaultNode}
      onDragOver={event => {
        event.preventDefault()
        event.stopPropagation()
      }}
      onDrop={event => {
        props?.onDrop && props?.onDrop(event)
        event.stopPropagation()
        props?.fireEvent({
          type: Event.DropNodeEvent,
          data: {
            entityType: DiagramType.CreateNew,
            node: JSON.parse(event.dataTransfer.getData(DiagramDrag.NodeDrag)),
            destination: props
          }
        })
      }}
      onClick={event => {
        event.preventDefault()
        event.stopPropagation()
        if (props?.onClick) {
          props?.onClick(event)
          return
        }
        props?.fireEvent({
          type: Event.AddLinkClicked,
          data: {
            entityType: DiagramType.CreateNew,
            identifier: props.identifier,
            target: event.target
          }
        })
      }}
    >
      <div
        id={props.identifier}
        data-linkid={props.identifier}
        data-nodeid={props.identifier || props['data-nodeid']}
        className={cx(
          cssDefault.defaultCard,
          css.createNode,
          css.stageAddIcon,
          { [css.disabled]: props.disabled || false },
          { [css.selected]: props?.node?.isSelected },
          { [props.className]: props.className }
        )}
      >
        <div>
          <Icon icon="plus" iconSize={22} color={'var(--diagram-add-node-color)'} />
        </div>
      </div>
      {!isEmpty(props.name) && (
        <Text
          data-name="node-name"
          font={{ align: 'center' }}
          padding={{ top: 'small' }}
          lineClamp={2}
          style={{ marginLeft: '-30px', marginRight: '-30px' }}
        >
          {props.name}
        </Text>
      )}
    </div>
  )
}

export default CreateNodeStage
