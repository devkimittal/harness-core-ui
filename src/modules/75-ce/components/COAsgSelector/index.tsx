/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import type { CellProps } from 'react-table'
import { isEmpty as _isEmpty } from 'lodash-es'
import { Radio } from '@blueprintjs/core'
import { Text, Container, ExpandingSearchInput, Layout, Button, Icon, TableV2 } from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import type { GatewayDetails } from '@ce/components/COCreateGateway/models'
import { useStrings } from 'framework/strings'
import type { ASGMinimal, PortConfig, TargetGroupMinimal } from 'services/lw'
import { Utils } from '@ce/common/Utils'

interface COAsgSelectorprops {
  scalingGroups: ASGMinimal[]
  selectedScalingGroup: ASGMinimal | undefined
  setSelectedAsg: (asg: ASGMinimal) => void
  search: (t: string) => void
  gatewayDetails: GatewayDetails
  onAsgAddSuccess?: (updatedGatewayDetails: GatewayDetails) => void
  loading: boolean
  refresh?: () => void
}

function TableCell(tableProps: CellProps<ASGMinimal>): JSX.Element {
  return (
    <Text lineClamp={3} color={Color.BLACK}>
      {tableProps.value}
    </Text>
  )
}
function NameCell(tableProps: CellProps<ASGMinimal>): JSX.Element {
  return (
    <Text lineClamp={1} color={Color.BLACK}>
      {`${tableProps.value} ${tableProps.row.original.id}`}
    </Text>
  )
}

const TOTAL_ITEMS_PER_PAGE = 5

const COAsgSelector: React.FC<COAsgSelectorprops> = props => {
  const [selectedAsg, setSelectedAsg] = useState<ASGMinimal | undefined>(props.selectedScalingGroup)
  const [pageIndex, setPageIndex] = useState<number>(0)
  const isAsgSelected = !_isEmpty(selectedAsg)
  const { getString } = useStrings()
  function TableCheck(tableProps: CellProps<ASGMinimal>): JSX.Element {
    return (
      <Radio
        checked={selectedAsg?.name === tableProps.row.original.name}
        onClick={_ => setSelectedAsg(tableProps.row.original)}
      />
    )
  }

  const addAsg = () => {
    /**
     * desired capacity can't be 0
     * it can be either > 0 or
     * summation of od + spot or
     * equal to max capacity
     *  */
    const desiredCapacityValue =
      selectedAsg?.desired || (selectedAsg?.on_demand || 0) + (selectedAsg?.spot || 0) || selectedAsg?.max
    const newAsg = {
      ...selectedAsg,
      desired: desiredCapacityValue,
      on_demand: selectedAsg?.on_demand || desiredCapacityValue
    }
    const ports = (newAsg as ASGMinimal).target_groups?.map((tg: TargetGroupMinimal) =>
      Utils.getTargetGroupObject(tg.port as number, tg.protocol as string)
    ) as PortConfig[]
    props.setSelectedAsg(newAsg)
    const updatedGatewayDetails = {
      ...props.gatewayDetails,
      routing: {
        ...props.gatewayDetails.routing,
        instance: { ...props.gatewayDetails.routing.instance, scale_group: newAsg },
        ports
      }
    }
    props.onAsgAddSuccess?.(updatedGatewayDetails)
  }

  const refreshPageParams = () => {
    setPageIndex(0)
  }

  const handleRefresh = () => {
    refreshPageParams()
    props.refresh?.()
  }

  return (
    <Container>
      <Layout.Vertical spacing="large">
        <Container style={{ paddingBottom: 20, borderBottom: '1px solid #CDD3DD' }}>
          <Text font={'large'}>Select Auto scaling group</Text>
        </Container>
        <Layout.Horizontal
          style={{
            paddingBottom: 20,
            paddingTop: 20,
            borderBottom: '1px solid #CDD3DD',
            justifyContent: 'space-between'
          }}
        >
          <Layout.Horizontal flex={{ alignItems: 'center' }}>
            <Button
              onClick={addAsg}
              disabled={!isAsgSelected}
              style={{
                backgroundColor: isAsgSelected ? '#0278D5' : 'inherit',
                color: isAsgSelected ? '#F3F3FA' : 'inherit',
                marginRight: 20
              }}
            >
              {'Add selected'}
            </Button>
            <div onClick={handleRefresh}>
              <Icon name="refresh" color="primary7" size={14} />
              <span style={{ color: 'var(--primary-7)', margin: '0 5px', cursor: 'pointer' }}>Refresh</span>
            </div>
          </Layout.Horizontal>
          <ExpandingSearchInput onChange={(text: string) => props.search(text)} />
        </Layout.Horizontal>
        <Container>
          {props.loading && (
            <Layout.Horizontal flex={{ justifyContent: 'center' }}>
              <Icon name="spinner" size={24} color="blue500" />
            </Layout.Horizontal>
          )}
          {!props.loading && (
            <TableV2<ASGMinimal>
              data={(props.scalingGroups || []).slice(
                pageIndex * TOTAL_ITEMS_PER_PAGE,
                pageIndex * TOTAL_ITEMS_PER_PAGE + TOTAL_ITEMS_PER_PAGE
              )}
              pagination={{
                pageSize: TOTAL_ITEMS_PER_PAGE,
                pageIndex: pageIndex,
                pageCount: Math.ceil((props.scalingGroups || []).length / TOTAL_ITEMS_PER_PAGE),
                itemCount: (props.scalingGroups || []).length,
                gotoPage: newPageIndex => setPageIndex(newPageIndex)
              }}
              columns={[
                {
                  Header: '',
                  id: 'selected',
                  Cell: TableCheck,
                  width: '5%',
                  disableSortBy: true
                },
                {
                  accessor: 'name',
                  Header: getString('ce.co.instanceSelector.name'),
                  width: '70%',
                  Cell: NameCell,
                  disableSortBy: true
                },
                {
                  accessor: 'desired',
                  Header: 'Instances',
                  width: '10%',
                  Cell: TableCell,
                  disableSortBy: true
                },
                {
                  accessor: 'region',
                  Header: getString('regionLabel'),
                  width: '10%',
                  Cell: TableCell,
                  disableSortBy: true
                }
              ]}
            />
          )}
        </Container>
      </Layout.Vertical>
    </Container>
  )
}

export default COAsgSelector
