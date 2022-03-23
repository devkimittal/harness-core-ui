/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import type { CellProps } from 'react-table'
import { Text, Layout, Container, Button, Page, PageSpinner, Icon, TableV2 } from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import { useParams } from 'react-router-dom'
import type { IconName } from '@blueprintjs/icons'
import { Classes, Menu, Popover, Position } from '@blueprintjs/core'
// import { Dialog, IconName, IDialogProps } from '@blueprintjs/core'
import { AccessPoint, useAccessPointActivity, useAccessPointRules, useAllAccessPoints } from 'services/lw'
import { useToaster } from '@common/exports'
import { useStrings } from 'framework/strings'
// import CreateAccessPointWizard from '../COGatewayAccess/CreateAccessPointWizard'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import DeleteAccessPoint from '../COAccessPointDelete/DeleteAccessPoint'
import { getRelativeTime } from '../COGatewayList/Utils'
// import LoadBalancerDnsConfig from '../COGatewayAccess/LoadBalancerDnsConfig'
import useCreateAccessPointDialog from './COCreateAccessPointDialog'
import TextWithToolTip, { textWithToolTipStatus } from '../TextWithTooltip/TextWithToolTip'
import useEditAccessPoint from './EditAccessPoint'
import css from './COAcessPointList.module.scss'

function NameCell(tableProps: CellProps<AccessPoint>): JSX.Element {
  return (
    <div style={{ overflowWrap: 'anywhere' }}>
      <Text lineClamp={1} color={Color.BLACK} style={{ fontWeight: 600 }}>
        {tableProps.value}
      </Text>
      <Text lineClamp={1} color={Color.GREY_400}>
        {tableProps.row.original.host_name}
      </Text>
    </div>
  )
}

function DNSCell(tableProps: CellProps<AccessPoint>): JSX.Element {
  return <Text lineClamp={3}>{tableProps.row.original.metadata?.dns?.route53 ? 'Route 53' : 'Others'}</Text>
}
function CloudAccountCell(tableProps: CellProps<AccessPoint>): JSX.Element {
  return (
    <Layout.Horizontal spacing="medium" style={{ overflowWrap: 'anywhere' }}>
      <Icon name={`service-${tableProps.row.original.type || 'aws'}` as IconName} size={24} />
      <Text lineClamp={1} color={Color.GREY_500}>
        {tableProps.value}
      </Text>
    </Layout.Horizontal>
  )
}

const TableCell: React.FC<CellProps<AccessPoint>> = tableProps => {
  return (
    <div style={{ overflowWrap: 'anywhere', paddingRight: 10 }}>
      <Text lineClamp={2}>{tableProps.value}</Text>
    </div>
  )
}

const StatusCell = ({ row }: CellProps<AccessPoint>) => {
  return (
    <TextWithToolTip
      messageText={row.original.status}
      errors={row.original.metadata?.error ? [{ error: row.original.metadata?.error }] : []}
      status={row.original.status === 'errored' ? textWithToolTipStatus.ERROR : textWithToolTipStatus.SUCCESS}
      indicatorColor={row.original.status === 'submitted' ? Color.YELLOW_500 : undefined}
    />
  )
}

const COLoadBalancerList: React.FC = () => {
  const { showError } = useToaster()
  const { getString } = useStrings()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<{
    accountId: string
    orgIdentifier: string
    projectIdentifier: string
  }>()
  const [allAccessPoints, setAllAccessPoints] = useState<AccessPoint[]>([])
  const setAccessPoint = (newAccessPoint: AccessPoint) => {
    const newAccessPoints = [...allAccessPoints, newAccessPoint]
    setAllAccessPoints(newAccessPoints)
  }

  const { openCreateAccessPointModal } = useCreateAccessPointDialog(
    {
      onAccessPointSave: savedLb => {
        // if (isCreateMode) {
        //   setAccessPointsList([{ label: savedLb.name as string, value: savedLb.id as string }, ...accessPointsList])
        // }
        setAccessPoint(savedLb)
      }
    },
    [allAccessPoints]
  )

  const { openEditAccessPointModal } = useEditAccessPoint({})

  const [selectedAccessPoints, setSelectedAccessPoints] = useState<AccessPoint[]>([])

  const handleCheckboxChange = (e: { currentTarget: HTMLInputElement }, cellData: AccessPoint) => {
    const newAccessPoints = [...selectedAccessPoints]
    if (e.currentTarget.checked) {
      newAccessPoints.push(cellData)
    } else if (!e.currentTarget.checked && isSelectedAccessPoint(cellData)) {
      newAccessPoints.splice(selectedAccessPoints.indexOf(cellData), 1)
    }
    setSelectedAccessPoints(newAccessPoints)
  }

  function CheckBoxCell(tableProps: CellProps<AccessPoint>): JSX.Element {
    return (
      <input
        type="checkbox"
        checked={isSelectedAccessPoint(tableProps.row.original)}
        onChange={e => handleCheckboxChange(e, tableProps.row.original)}
      />
    )
  }
  function isSelectedAccessPoint(item: AccessPoint): boolean {
    return selectedAccessPoints.findIndex(s => s.id === item.id) >= 0
  }

  function ActivityCell(tableProps: CellProps<AccessPoint>): JSX.Element {
    const { data: details, error: detailsError } = useAccessPointActivity({
      lb_id: tableProps.row.original.id as string, // eslint-disable-line
      account_id: accountId, // eslint-disable-line
      queryParams: {
        accountIdentifier: accountId
      }
    })
    if (detailsError) {
      showError(detailsError.data || detailsError.message, undefined, 'ce.ap.activity.error')
    }
    return (
      <>
        {(details?.response?.created_at as string) && (
          <Layout.Horizontal spacing="medium">
            <Icon name="history" />
            <Text lineClamp={3} color={Color.GREY_500}>
              {getRelativeTime(details?.response?.created_at as string, 'YYYY-MM-DDTHH:mm:ssZ')}
            </Text>
          </Layout.Horizontal>
        )}
        {!(details?.response?.created_at as string) && !loading && '-'}
        {loading && <Icon name="spinner" size={12} color="blue500" />}
      </>
    )
  }
  function RulesCell(tableProps: CellProps<AccessPoint>): JSX.Element {
    const {
      data: details,
      error: detailsError,
      loading: detailsLoading
    } = useAccessPointRules({
      lb_id: tableProps.row.original.id as string, // eslint-disable-line
      account_id: accountId, // eslint-disable-line
      queryParams: {
        accountIdentifier: accountId
      }
    })
    if (detailsError) {
      showError(detailsError.message, undefined, 'ce.ap.rules.error')
    }
    return (
      <>
        {details?.response?.length && (
          <Layout.Horizontal spacing="medium">
            <Text lineClamp={3} color={Color.GREY_500}>
              {details?.response?.length} Rules
            </Text>
          </Layout.Horizontal>
        )}
        {!details?.response?.length && !detailsLoading && '0 Rules'}
        {detailsLoading && <Icon name="spinner" size={12} color="blue500" />}
      </>
    )
  }

  const RenderColumnMenu = (tableProps: CellProps<AccessPoint>): JSX.Element => {
    const row = tableProps.row
    const columnId = row.original.id
    const [menuOpen, setMenuOpen] = useState(false)

    return (
      <Layout.Horizontal className={css.layout}>
        <Popover
          isOpen={menuOpen}
          onInteraction={nextOpenState => {
            setMenuOpen(nextOpenState)
          }}
          className={Classes.DARK}
          position={Position.BOTTOM_RIGHT}
        >
          <Button
            minimal
            icon="Options"
            onClick={e => {
              e.stopPropagation()
              setMenuOpen(true)
            }}
            data-testid={`menu-${columnId}`}
          />
          <Menu style={{ minWidth: 'unset' }}>
            <Menu.Item icon="edit" text="Edit" onClick={() => openEditAccessPointModal(row.original)} />
          </Menu>
        </Popover>
      </Layout.Horizontal>
    )
  }

  const handleParentCheckboxChange = (e: { currentTarget: HTMLInputElement }) => {
    setSelectedAccessPoints(e.currentTarget.checked ? [...allAccessPoints] : [])
  }

  const getHeader = () => {
    return (
      <input
        type="checkbox"
        checked={data?.response?.length === selectedAccessPoints.length}
        onChange={handleParentCheckboxChange}
      />
    )
  }

  const { data, error, loading, refetch } = useAllAccessPoints({
    account_id: accountId, // eslint-disable-line
    queryParams: {
      accountIdentifier: accountId
    },
    debounce: 300
  })
  if (error) {
    showError(error.data || error.message, undefined, 'ce.all.ap.rules.error')
  }
  useEffect(() => {
    if (loading) {
      return
    }
    setAllAccessPoints(data?.response as AccessPoint[])
  }, [data?.response, loading])

  const refreshList = () => {
    refetch()
    setSelectedAccessPoints([])
  }
  return (
    <Container background={Color.WHITE} height="100vh">
      <>
        {!loading ? (
          <>
            <Page.Header
              breadcrumbs={<NGBreadcrumbs />}
              title={getString('ce.co.accessPoint.landingPageTitle')}
              className={css.header}
            />
            <>
              <Layout.Horizontal padding="large">
                <Layout.Horizontal width="55%" spacing="medium">
                  <Button
                    intent="primary"
                    text={getString('ce.co.accessPoint.new')}
                    icon="plus"
                    onClick={() => openCreateAccessPointModal()}
                  />
                  <DeleteAccessPoint
                    accessPoints={selectedAccessPoints}
                    orgID={orgIdentifier}
                    projectID={projectIdentifier}
                    accountId={accountId}
                    refresh={refreshList}
                  />
                </Layout.Horizontal>
              </Layout.Horizontal>
            </>
            {allAccessPoints?.length > 0 && (
              <Page.Body className={css.pageContainer}>
                <TableV2<AccessPoint>
                  data={allAccessPoints || []}
                  className={css.table}
                  columns={[
                    {
                      //eslint-disable-next-line
                      Header: getHeader(),
                      id: 'check',
                      width: '5%',
                      Cell: CheckBoxCell
                    },
                    {
                      accessor: 'name',
                      Header: getString('name').toUpperCase(),
                      width: '15%',
                      Cell: NameCell
                    },
                    {
                      accessor: 'cloud_account_id',
                      Header: getString('ce.co.accessPoint.cloudAccount').toUpperCase(),
                      width: '15%',
                      Cell: CloudAccountCell
                    },
                    {
                      accessor: 'id',
                      Header: getString('ce.co.accessPoint.dnsProvider').toUpperCase(),
                      width: '8%',
                      Cell: DNSCell,
                      disableSortBy: true
                    },
                    {
                      accessor: 'host_name',
                      Header: getString('ce.co.accessPoint.asssociatedRules').toUpperCase(),
                      width: '10%',
                      Cell: RulesCell
                    },
                    {
                      accessor: 'region',
                      Header: 'Region',
                      width: '10%',
                      Cell: TableCell
                    },
                    {
                      accessor: 'vpc',
                      Header: 'VPC',
                      width: '12%',
                      Cell: TableCell
                    },
                    {
                      accessor: 'status',
                      Header: getString('ce.co.accessPoint.lastActivity').toUpperCase(),
                      width: '10%',
                      Cell: ActivityCell
                    },
                    {
                      accessor: row => row.status,
                      Header: getString('ce.co.accessPoint.status').toUpperCase(),
                      Cell: StatusCell,
                      width: '10%'
                    },
                    {
                      id: 'menu',
                      accessor: row => row.id,
                      width: '5%',
                      Cell: RenderColumnMenu,
                      disableSortBy: true
                    }
                  ]}
                />
              </Page.Body>
            )}
          </>
        ) : (
          <div style={{ position: 'relative', height: 'calc(100vh - 128px)' }}>
            <PageSpinner />
          </div>
        )}
      </>
    </Container>
  )
}

export default COLoadBalancerList
