/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
import React from 'react'
import { v4 as uuid } from 'uuid'
import { NodeType } from './Node'
// import CreateNode from './Nodes/CreateNode/CreateNodeStage'
import PipelineGraph from './PipelineGraph/PipelineGraph'
import GroupNode from './Nodes/GroupNode/GroupNode'
import type {
  BaseListener,
  NodeCollapsibleProps,
  ListenerHandle,
  NodeBank,
  NodeDetails,
  PipelineGraphState
} from './types'
import { StepGroupNode } from './Nodes/StepGroupNode/StepGroupNode'
import DefaultNode from './Nodes/DefaultNode/DefaultNode'

export class DiagramFactory {
  /**
   * Couples the factory with the nodes it generates
   */
  type = ''
  canCreate = false
  canDelete = false
  nodeBank: NodeBank
  groupNode: React.FC = GroupNode
  listeners: { [id: string]: BaseListener }
  constructor(diagramType: string) {
    this.nodeBank = new Map<string, NodeDetails>()
    this.type = diagramType
    this.registerNode(NodeType.Default, DefaultNode)
    this.registerNode(NodeType.StepGroupNode, StepGroupNode)
    this.listeners = {}
  }

  getType(): string {
    return this.type
  }

  registerNode(type: string | string[], Component: React.FC, isDefault = false): void {
    if (Array.isArray(type)) {
      type.forEach(nodeType => this.nodeBank.set(nodeType, { component: Component, isDefault }))
    } else {
      this.nodeBank.set(type, { component: Component, isDefault })
    }
  }

  registerListeners(listeners: Record<string, BaseListener>): Record<string, ListenerHandle> {
    const result: Record<string, ListenerHandle> = {}
    Object.entries(listeners).forEach(listener => {
      const id = uuid()
      this.listeners[listener[0]] = listener[1]
      result[id] = {
        id: id,
        listener: listener[1],
        deregister: () => {
          delete this.listeners[id]
        }
      }
    })
    return result
  }

  deregisterListener(listenerKey: string): boolean {
    if (this.listeners[listenerKey]) {
      delete this.listeners[listenerKey]
      return true
    }
    return false
  }

  getDefaultNode(): NodeDetails | null {
    let defaultNode = null

    for (const node of this.nodeBank.entries()) {
      if (node[1].isDefault) {
        defaultNode = node[1]
      }
    }
    return defaultNode
  }

  registerGroupNode(Component: React.FC): void {
    this.groupNode = Component
  }

  getGroupNode(): React.FC {
    return this.groupNode
  }

  getListenerHandle(listener: string): ListenerHandle | undefined {
    let listenerHandle
    if (typeof listener === 'string') {
      const listernHandle = this.listeners[listener]
      return {
        id: listener,
        listener: listernHandle,
        deregister: () => {
          delete this.listeners[listener]
        }
      }
    }

    return listenerHandle
  }

  getNode(type?: string): NodeDetails | undefined {
    return this.nodeBank.get(type as string)
  }

  deregisterNode(type: string): void {
    const deletedNode = this.nodeBank.get(type)
    if (deletedNode) {
      this.nodeBank.delete(type)
    }
  }

  fireEvent(event: any): void {
    this.getListenerHandle(event.type)?.listener?.(event)
  }

  render(): React.FC<{
    data: PipelineGraphState[]
    collapsibleProps?: NodeCollapsibleProps
    selectedNodeId?: string
    readonly?: boolean
  }> {
    function PipelineStudioHOC(
      this: DiagramFactory,
      props: {
        data: PipelineGraphState[]
        collapsibleProps?: NodeCollapsibleProps
        selectedNodeId?: string
        readonly?: boolean
      }
    ): React.ReactElement {
      return (
        <PipelineGraph
          getDefaultNode={this.getDefaultNode.bind(this)}
          getNode={this.getNode.bind(this)}
          fireEvent={this.fireEvent.bind(this)}
          {...props}
        />
      )
    }
    return PipelineStudioHOC.bind(this)
  }
}

const DiagramNodes = {
  [NodeType.Default]: DefaultNode,
  [NodeType.GroupNode]: GroupNode,
  [NodeType.StepGroupNode]: StepGroupNode
}

export { DiagramNodes, NodeType }
