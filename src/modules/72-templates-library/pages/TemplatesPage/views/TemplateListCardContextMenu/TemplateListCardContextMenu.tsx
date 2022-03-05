/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Button, IconName } from '@wings-software/uicore'
import type { PopoverProps } from '@wings-software/uicore/dist/components/Popover/Popover'
import { useParams } from 'react-router-dom'
import { Classes } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import { TemplatesActionPopover } from '@templates-library/components/TemplatesActionPopover/TemplatesActionPopover'
import type { TemplateSummaryResponse } from 'services/template-ng'
import { usePermission } from '@rbac/hooks/usePermission'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import type { TemplateStudioPathProps } from '@common/interfaces/RouteInterfaces'
import css from './TemplateListCardContextMenu.module.scss'

export interface ContextMenuProps extends PopoverProps {
  template: TemplateSummaryResponse
  onPreview?: (template: TemplateSummaryResponse) => void
  onOpenEdit?: (template: TemplateSummaryResponse) => void
  onOpenSettings?: (templateIdentifier: string) => void
  onDelete?: (template: TemplateSummaryResponse) => void
  className?: string
}

export const TemplateListCardContextMenu: React.FC<ContextMenuProps> = (props): JSX.Element => {
  const { getString } = useStrings()
  const { template, onPreview, onOpenEdit, onOpenSettings, onDelete, className, ...popoverProps } = props
  const [menuOpen, setMenuOpen] = React.useState(false)
  const { accountId, orgIdentifier, projectIdentifier, templateIdentifier } = useParams<TemplateStudioPathProps>()
  const [canView, canEdit, canDelete] = usePermission(
    {
      resourceScope: {
        accountIdentifier: accountId,
        orgIdentifier,
        projectIdentifier
      },
      resource: {
        resourceType: ResourceType.TEMPLATE,
        resourceIdentifier: template.identifier
      },
      permissions: [
        PermissionIdentifier.VIEW_TEMPLATE,
        PermissionIdentifier.EDIT_TEMPLATE,
        PermissionIdentifier.DELETE_TEMPLATE
      ]
    },
    [orgIdentifier, projectIdentifier, accountId, templateIdentifier]
  )
  const getItems = (): { icon: IconName; label: string; disabled: boolean; onClick: () => void }[] => {
    return [
      {
        icon: 'main-view',
        label: getString('connectors.ceAws.crossAccountRoleExtention.step1.p2'),
        disabled: !canView,
        onClick: () => {
          onPreview?.(template)
        }
      },
      {
        icon: 'main-share',
        label: getString('templatesLibrary.openEditTemplate'),
        disabled: !canEdit,
        onClick: () => {
          onOpenEdit?.(template)
        }
      },
      {
        icon: 'main-setup',
        label: getString('templatesLibrary.templateSettings'),
        disabled: !canEdit,
        onClick: () => {
          onOpenSettings?.(template.identifier || '')
        }
      },
      {
        icon: 'main-trash',
        label: getString('templatesLibrary.deleteTemplate'),
        disabled: !canDelete,
        onClick: () => {
          onDelete?.(template)
        }
      }
    ]
  }

  return (
    <TemplatesActionPopover
      open={menuOpen}
      items={getItems()}
      setMenuOpen={setMenuOpen}
      className={className}
      portalClassName={Classes.DARK}
      {...popoverProps}
    >
      <Button
        minimal
        className={css.actionButton}
        icon="more"
        onClick={e => {
          e.stopPropagation()
          setMenuOpen(true)
        }}
      />
    </TemplatesActionPopover>
  )
}
