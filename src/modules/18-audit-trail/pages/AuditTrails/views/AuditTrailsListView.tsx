/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { ReactElement, useState } from 'react'
import { TableV2, Text, Layout, Avatar, Icon, Container, Popover } from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import type { Column, Renderer, CellProps } from 'react-table'
import { Link, useParams } from 'react-router-dom'
import { PopoverInteractionKind, Position, Classes } from '@blueprintjs/core'
import type { IconProps } from '@harness/uicore/dist/icons/Icon'
import {
  actionToLabelMap,
  getModuleNameFromAuditModule,
  resourceTypeToLabelMapping
} from '@audit-trail/utils/RequestUtil'
import type { AuditEventDTO, PageAuditEventDTO } from 'services/audit'
import { useStrings } from 'framework/strings'
import { getReadableDateTime } from '@common/utils/dateUtils'
import AuditTrailFactory from '@audit-trail/factories/AuditTrailFactory'
import type { OrgPathProps } from '@common/interfaces/RouteInterfaces'
import EventSummary from '@audit-trail/components/EventSummary/EventSummary'

import css from './AuditTrailsListView.module.scss'

const DEFAULT_CELL_PLACEHOLDER = 'N/A'
interface AuditTrailsListViewProps {
  data: PageAuditEventDTO
  setPage: (page: number) => void
}

const renderColumnTimeStamp: Renderer<CellProps<AuditEventDTO>> = ({ row }) => {
  const time = getReadableDateTime(row.original.timestamp, 'hh:mm a')
  const date = getReadableDateTime(row.original.timestamp, 'MMM DD, YYYY')
  return (
    <>
      <Text margin={{ bottom: 'small' }}>{time}</Text>
      <Text>{date}</Text>
    </>
  )
}

const renderColumnUser: Renderer<CellProps<AuditEventDTO>> = ({ row }) => {
  const { labels, principal } = row.original.authenticationInfo
  return (
    <Layout.Horizontal padding={{ right: 'xlarge' }} flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
      <Avatar className={css.avatar} name={row.original.authenticationInfo.principal.identifier} hoverCard={false} />
      <Text lineClamp={1}>{labels?.username || principal.identifier}</Text>
    </Layout.Horizontal>
  )
}

const renderColumnOrganization: Renderer<CellProps<AuditEventDTO>> = ({ row }) => {
  return (
    <Text padding={{ right: 'xlarge' }} lineClamp={1}>
      {row.original.resourceScope.orgIdentifier || DEFAULT_CELL_PLACEHOLDER}
    </Text>
  )
}

const renderColumnProject: Renderer<CellProps<AuditEventDTO>> = ({ row }) => {
  return (
    <Text padding={{ right: 'xlarge' }} lineClamp={1}>
      {row.original?.resourceScope?.projectIdentifier || DEFAULT_CELL_PLACEHOLDER}
    </Text>
  )
}

const AuditTrailsListView: React.FC<AuditTrailsListViewProps> = ({ data, setPage }) => {
  const { orgIdentifier } = useParams<OrgPathProps>()
  const [showEventSummary, setShowEventSummary] = useState<boolean>(true)
  const [selectedAuditEvent, setSelectedAuditEvent] = useState<AuditEventDTO | undefined>()
  const { getString } = useStrings()

  const renderColumnResource: Renderer<CellProps<AuditEventDTO>> = ({ row }) => {
    const { resourceScope, resource, module } = row.original
    const { accountIdentifier } = resourceScope

    const url = accountIdentifier
      ? AuditTrailFactory.getResourceHandler(resource.type)?.resourceUrl?.(
          row.original.resource,
          {
            ...resourceScope,
            accountIdentifier: accountIdentifier
          },
          getModuleNameFromAuditModule(module)
        )
      : undefined

    return (
      <Layout.Vertical padding={{ right: 'xlarge' }}>
        {url ? (
          <Link className={css.resourceLink} to={url}>
            <Text lineClamp={1}>{resource.labels?.resourceName || resource.identifier}</Text>
          </Link>
        ) : (
          <Text lineClamp={1}>{resource.labels?.resourceName || resource.identifier}</Text>
        )}
        <Text padding={{ top: 'xsmall' }} lineClamp={1}>{`${getString('typeLabel')}: ${getString(
          resourceTypeToLabelMapping[row.original.resource.type]
        )}`}</Text>
      </Layout.Vertical>
    )
  }

  const renderModuleIcon = (icon: IconProps): ReactElement => {
    const navSettingsIcon = icon.name === 'nav-settings'
    return <Icon className={navSettingsIcon ? css.navSettingIcon : undefined} name={icon.name} size={icon.size || 30} />
  }

  const renderColumnModule: Renderer<CellProps<AuditEventDTO>> = ({ row }) => {
    const { moduleIcon, moduleLabel } = AuditTrailFactory.getResourceHandler(row.original.resource.type) || {}
    return moduleIcon?.name ? (
      <Container flex={{ justifyContent: 'center' }}>
        {moduleLabel ? (
          <Popover
            position={Position.TOP}
            interactionKind={PopoverInteractionKind.HOVER}
            className={Classes.DARK}
            content={
              <Text color={Color.WHITE} padding="small">
                {getString(moduleLabel)}
              </Text>
            }
          >
            {renderModuleIcon(moduleIcon)}
          </Popover>
        ) : (
          renderModuleIcon(moduleIcon)
        )}
      </Container>
    ) : (
      ''
    )
  }

  const renderColumnAction: Renderer<CellProps<AuditEventDTO>> = ({ row }) => {
    return (
      <Layout.Horizontal padding={{ right: 'xlarge' }}>
        <Text lineClamp={1}>{getString(actionToLabelMap[row.original.action])}</Text>
      </Layout.Horizontal>
    )
  }

  const renderEventSummary: Renderer<CellProps<AuditEventDTO>> = ({ row }) => {
    return (
      <Layout.Horizontal flex={{ justifyContent: 'center' }}>
        <Icon
          name="main-notes"
          size={20}
          className={css.notesIcon}
          onClick={() => {
            setShowEventSummary(true)
            setSelectedAuditEvent(row.original)
          }}
        />
      </Layout.Horizontal>
    )
  }

  const columns: Column<AuditEventDTO>[] = [
    {
      Header: getString('common.timePstLabel'),
      id: 'time',
      accessor: row => row.timestamp,
      width: '8%',
      Cell: renderColumnTimeStamp
    },
    {
      Header: getString('common.userLabel'),
      id: 'user',
      accessor: row => row.authenticationInfo.principal.identifier,
      width: orgIdentifier ? '18%' : '16%',
      Cell: renderColumnUser
    },
    {
      Header: getString('action'),
      id: 'action',
      accessor: row => row.action,
      width: '10%',
      Cell: renderColumnAction
    },
    {
      Header: getString('common.resourceLabel'),
      id: 'resource',
      accessor: row => row.resource.identifier,
      width: orgIdentifier ? '23%' : '18%',
      Cell: renderColumnResource
    },
    // If orgIdentifier is not present, organisation column will be visible
    ...(!orgIdentifier
      ? [
          {
            Header: getString('orgLabel'),
            id: 'organization',
            accessor: row => row.resourceScope.orgIdentifier,
            width: '15%',
            Cell: renderColumnOrganization
          } as Column<AuditEventDTO>
        ]
      : []),
    {
      Header: getString('projectLabel'),
      id: 'project',
      accessor: row => row.resourceScope.projectIdentifier,
      width: orgIdentifier ? '18' : '13%',
      Cell: renderColumnProject
    },
    {
      Header: (
        <Text color={Color.GREY_900} flex={{ justifyContent: 'center' }}>
          {getString('common.moduleLabel')}
        </Text>
      ),
      id: 'module',
      accessor: row => row.module,
      width: '12%',
      Cell: renderColumnModule
    },
    {
      Header: '',
      id: 'eventSummary',
      width: '8%',
      Cell: renderEventSummary
    }
  ]

  return (
    <>
      <TableV2<AuditEventDTO>
        data={data.content || []}
        columns={columns}
        className={css.table}
        pagination={{
          itemCount: data?.totalItems || 0,
          pageSize: data?.pageSize || 10,
          pageCount: data?.totalPages || 0,
          pageIndex: data?.pageIndex || 0,
          gotoPage: setPage,
          className: css.pagination
        }}
      />
      {showEventSummary && selectedAuditEvent && (
        <EventSummary auditEvent={selectedAuditEvent} onClose={() => setShowEventSummary(false)} />
      )}
    </>
  )
}

export default AuditTrailsListView
