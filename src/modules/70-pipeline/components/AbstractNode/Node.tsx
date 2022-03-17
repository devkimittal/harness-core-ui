/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { IconName } from '@wings-software/uicore'

export enum NodeStatus {
  Loading = 'Loading',
  Success = 'Success',
  Failure = 'Failure'
}

export enum NodeType {
  Default = 'default-node',
  EmptyNode = 'empty-node',
  CreateNode = 'create-node',
  DiamondNode = 'default-diamond',
  StartNode = 'start-node',
  GroupNode = 'group-node',
  IconNode = 'icon-node',
  EndNode = 'end-node',
  StepGroupNode = 'StepGroup'
}

export interface NodeProps<T> {
  width: number
  height: number
  onUpdate?: (data: T) => void
  onChange?: (data: T) => void
}

export interface NodeInterface {
  identifier: string
  type: NodeType
  name: string
  defaultIcon: IconName
  secondaryIcon?: IconName
  selectedColour?: string
  unSelectedColour?: string
  selectedIconColour?: string
  unSelectedIconColour?: string
}

export abstract class Node {
  protected identifier: string
  protected name: string
  protected abstract type: NodeType
  protected abstract defaultIcon: IconName
  protected abstract secondaryIcon?: IconName
  protected abstract selectedColour: string
  protected abstract unSelectedColour: string
  protected abstract selectedIconColour: string
  protected abstract unSelectedIconColour: string
  public render?(props?: any): React.ReactElement

  constructor(options?: NodeInterface) {
    this.identifier = options?.identifier || ''
    this.name = options?.name || ''
  }
  getType(): string {
    return this.type
  }

  getIdentifier(): string {
    return this.identifier
  }

  getName(): string {
    return this.name
  }

  getDefaultIconName(): IconName {
    return this.defaultIcon
  }

  getSecondaryIconName(): IconName | undefined {
    return this.secondaryIcon
  }

  getSelectedColour(): string {
    return this.selectedColour
  }

  getUnSelectedColour(): string {
    return this.unSelectedColour
  }

  getSelectedIconColour(): string {
    return this.selectedIconColour
  }

  getUnSelectedIconColour(): string {
    return this.unSelectedIconColour
  }
}
