/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback } from 'react'
import { Menu, Position } from '@blueprintjs/core'
import { Button, ButtonVariation, Icon, IconName, Popover, Text } from '@wings-software/uicore'
import { useHistory, useParams } from 'react-router-dom'
import { noop } from 'lodash-es'
import cx from 'classnames'
import type { PopoverProps } from '@wings-software/uicore/dist/components/Popover/Popover'
import { useStrings } from 'framework/strings'
import routes from '@common/RouteDefinitions'
import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { usePermission } from '@rbac/hooks/usePermission'
import RBACTooltip from '@rbac/components/RBACTooltip/RBACTooltip'
import css from './NewPipelinePopover.module.scss'

export interface NewPipelinePopoverProps extends PopoverProps {
  className?: string
}

export interface NewPipelineMenuItem {
  icon?: IconName
  label: string
  disabled?: boolean
  onClick: () => void
}

export function NewPipelinePopover({
  className = '',
  portalClassName,
  ...popoverProps
}: NewPipelinePopoverProps): React.ReactElement {
  const { getString } = useStrings()
  const history = useHistory()
  const { projectIdentifier, orgIdentifier, accountId, module } = useParams<ProjectPathProps & ModulePathParams>()
  const [menuOpen, setMenuOpen] = React.useState(false)
  const rbacResourcePermission = {
    resource: {
      resourceType: ResourceType.PIPELINE
    }
  }
  const [canEdit] = usePermission({
    ...rbacResourcePermission,
    permissions: [PermissionIdentifier.EDIT_PIPELINE]
  })

  const goToPipeline = useCallback(
    (useTemplate?: boolean) => {
      history.push(
        routes.toPipelineStudio({
          projectIdentifier,
          orgIdentifier,
          pipelineIdentifier: '-1',
          accountId,
          module,
          ...(!!useTemplate && { useTemplate: true })
        })
      )
    },
    [history, projectIdentifier, orgIdentifier, accountId, module]
  )

  const menuItems = React.useMemo((): NewPipelineMenuItem[] => {
    return [
      {
        label: 'New Pipeline',
        onClick: () => goToPipeline()
      },
      {
        label: 'Use Template',
        onClick: () => goToPipeline(true),
        icon: 'template-library'
      }
    ]
  }, [goToPipeline])

  const tooltipBtn = React.useCallback(
    () =>
      !canEdit ? (
        <RBACTooltip permission={PermissionIdentifier.EDIT_PIPELINE} resourceType={ResourceType.PIPELINE} />
      ) : undefined,
    [canEdit]
  )

  return (
    <Popover
      isOpen={menuOpen}
      onInteraction={nextOpenState => {
        setMenuOpen(nextOpenState)
      }}
      position={Position.BOTTOM}
      className={cx(css.main, className)}
      portalClassName={cx(css.popover, portalClassName)}
      usePortal={false}
      minimal={true}
      disabled={!canEdit}
      {...popoverProps}
    >
      <Button
        variation={ButtonVariation.PRIMARY}
        icon="plus"
        rightIcon="chevron-down"
        text={getString('pipeline.newPipelineText')}
        onClick={noop}
        disabled={!canEdit}
        tooltip={tooltipBtn()}
      />
      <Menu>
        {menuItems.map(item => {
          return (
            <li
              key={item.label}
              className={cx(css.menuItem, { [css.disabled]: item.disabled })}
              onClick={e => {
                e.stopPropagation()
                item.onClick()
                setMenuOpen(false)
              }}
            >
              {item.icon && <Icon name={item.icon} size={12} />}
              <Text lineClamp={1}>{item.label}</Text>
            </li>
          )
        })}
      </Menu>
    </Popover>

    // <TemplatesActionPopover
    //   open={menuOpen}
    //   minimal={true}
    //   items={getMenu()}
    //   position={Position.BOTTOM}
    //   disabled={!canEdit}
    //   setMenuOpen={setMenuOpen}
    //   usePortal={false}
    // >
    //
    // </TemplatesActionPopover>
  )
}
