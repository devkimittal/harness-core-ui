/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect, ReactNode } from 'react'
import { useParams } from 'react-router-dom'
import type { CellProps } from 'react-table'
import { isEmpty as _isEmpty, defaultTo as _defaultTo } from 'lodash-es'
import {
  Text,
  Container,
  ExpandingSearchInput,
  Layout,
  Checkbox,
  Button,
  Icon,
  TableV2,
  Select,
  SelectOption
} from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import type { GatewayDetails, InstanceDetails } from '@ce/components/COCreateGateway/models'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { ResourceGroup, useAllResourceGroups, useAllZones } from 'services/lw'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import useRegionsForSelection from '@ce/common/hooks/useRegionsForSelection'
import { useStrings } from 'framework/strings'
import { Utils } from '@ce/common/Utils'
import css from './COInstanceSelector.module.scss'

interface COInstanceSelectorprops {
  instances: InstanceDetails[]
  selectedInstances: InstanceDetails[]
  setSelectedInstances: (selectedInstances: InstanceDetails[]) => void
  setGatewayDetails: (gatewayDetails: GatewayDetails) => void
  gatewayDetails: GatewayDetails
  onInstancesAddSuccess?: () => void
  loading: boolean
  refresh?: (tomlString?: string) => void
  isEditFlow: boolean
}

interface GCPFiltersProps {
  region?: SelectOption
  zone?: SelectOption
}

function TableCell(tableProps: CellProps<InstanceDetails>): JSX.Element {
  return (
    <Text lineClamp={3} color={Color.BLACK}>
      {tableProps.value}
    </Text>
  )
}
function NameCell(tableProps: CellProps<InstanceDetails>): JSX.Element {
  return (
    <Text lineClamp={3} color={Color.BLACK} style={{ overflowWrap: 'anywhere', paddingRight: 5 }}>
      {tableProps.value} {tableProps.row.original.id}
    </Text>
  )
}

const TOTAL_ITEMS_PER_PAGE = 8

const COInstanceSelector: React.FC<COInstanceSelectorprops> = props => {
  const { trackEvent } = useTelemetry()
  const { getString } = useStrings()
  const [filteredInstances, setFilteredInstances] = useState<InstanceDetails[]>([])
  const [selectedInstances, setSelectedInstances] = useState<InstanceDetails[]>(_defaultTo(props.selectedInstances, []))
  const [pageIndex, setPageIndex] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [selectedResourceGroup, setSelectedResourceGroup] = useState<SelectOption>()
  const [gcpFilters, setGcpFilters] = useState<GCPFiltersProps>()

  const isAzureProvider = Utils.isProviderAzure(props.gatewayDetails.provider)
  const isGcpProvider = Utils.isProviderGcp(props.gatewayDetails.provider)

  useEffect(() => {
    setFilteredInstances(props.instances)
  }, [props.instances])

  const onResourceGroupSelect = (selectedRg: SelectOption | null, resourceGroupLoading: boolean) => {
    if (selectedRg) {
      setSelectedResourceGroup(selectedRg)
      const groupText = _defaultTo(selectedRg.label, '')
      props.refresh?.(`resource_groups=['${groupText}']`)
    }
    setIsLoading(resourceGroupLoading)
  }

  const onGcpFiltersChange = (filters: GCPFiltersProps, loadingFilters: boolean) => {
    setGcpFilters(filters)
    if (filters.zone) {
      const filterText = `regions=['${filters.zone.label}']`
      props.refresh?.(filterText)
    }
    setIsLoading(loadingFilters)
  }

  const onCheckboxChange = (e: React.FormEvent<HTMLInputElement>, alreadyChecked: boolean, data: InstanceDetails) => {
    if (e.currentTarget.checked && !alreadyChecked) {
      setSelectedInstances([...selectedInstances, data])
    } else if (!e.currentTarget.checked && alreadyChecked) {
      const updatedInstances = [...selectedInstances]
      updatedInstances.splice(selectedInstances.indexOf(data), 1)
      setSelectedInstances(updatedInstances)
    }
  }

  const addInstances = () => {
    const newInstances = [...selectedInstances]
    props.setSelectedInstances(newInstances)
    const updatedGatewayDetails = { ...props.gatewayDetails, selectedInstances: newInstances }
    props.setGatewayDetails(updatedGatewayDetails)
    handleSearch('')
    props.onInstancesAddSuccess?.()
  }

  const handleSearch = (text: string): void => {
    pageIndex !== 0 && setPageIndex(0)
    if (!text) {
      setFilteredInstances(props.instances)
      return
    }
    text = text.toLowerCase()
    const instances = props.instances.filter(
      t => t.name.toLowerCase().indexOf(text) >= 0 || t.id.toLowerCase().indexOf(text) >= 0
    )
    setFilteredInstances(instances)
  }

  useEffect(() => {
    trackEvent('SelectedInstances', {})
  }, [])

  const refreshPageParams = () => {
    setPageIndex(0)
  }

  const handleRefresh = () => {
    refreshPageParams()
    if (isAzureProvider && selectedResourceGroup) {
      props.refresh?.(`resource_groups=['${selectedResourceGroup.label}']`)
    } else if (isGcpProvider && gcpFilters?.zone) {
      props.refresh?.(`regions=['${gcpFilters.zone.label}']`)
    } else {
      props.refresh?.()
    }
  }

  const hasSelectedInstances = !_isEmpty(selectedInstances)

  return (
    <Container>
      <Layout.Vertical spacing="large">
        <Container style={{ paddingBottom: 20, borderBottom: '1px solid #CDD3DD' }}>
          <Text font={'large'}>Select Instances</Text>
          <Text style={{ marginTop: 15 }}>
            {getString('ce.co.autoStoppingRule.configuration.instanceModal.description')}
          </Text>
        </Container>
        <Layout.Vertical
          style={{
            paddingBottom: 20,
            paddingTop: 20,
            borderBottom: '1px solid #CDD3DD'
          }}
        >
          <Layout.Horizontal
            style={{
              justifyContent: 'space-between'
            }}
          >
            <Layout.Horizontal flex={{ alignItems: 'center' }}>
              <Button
                onClick={addInstances}
                disabled={!hasSelectedInstances}
                style={{
                  backgroundColor: hasSelectedInstances ? '#0278d5' : 'inherit',
                  color: hasSelectedInstances ? '#F3F3FA' : 'inherit',
                  marginRight: 20
                }}
              >
                {`Add selected ${Utils.getConditionalResult(
                  hasSelectedInstances,
                  `(${selectedInstances.length})`,
                  ''
                )}`}
              </Button>
              <div onClick={handleRefresh}>
                <Icon name="refresh" color="primary7" size={14} />
                <span style={{ color: 'var(--primary-7)', margin: '0 5px', cursor: 'pointer' }}>Refresh</span>
              </div>
            </Layout.Horizontal>
            <ExpandingSearchInput className={css.search} onChange={handleSearch} />
          </Layout.Horizontal>
          <InstancesFilter
            gatewayDetails={props.gatewayDetails}
            onResourceGroupSelectCallback={onResourceGroupSelect}
            onGcpFiltersChangeCallback={onGcpFiltersChange}
            selectedInstances={selectedInstances}
            isEditFlow={props.isEditFlow}
          />
        </Layout.Vertical>
        <InstanceSelectorBody
          isLoading={props.loading || isLoading}
          selectedResourceGroup={selectedResourceGroup}
          instances={filteredInstances}
          pageProps={{
            index: pageIndex,
            setIndex: setPageIndex,
            totalCount: _defaultTo(props.instances.length, 0)
          }}
          onCheckboxChange={onCheckboxChange}
          selectedInstances={selectedInstances}
          isAzureSelection={isAzureProvider}
          isGcpSelection={isGcpProvider}
          selectedGcpFilters={gcpFilters}
        />
      </Layout.Vertical>
    </Container>
  )
}

interface InstancesFilterProps {
  gatewayDetails: GatewayDetails
  onResourceGroupSelectCallback: (resourceGroup: SelectOption | null, resourceGroupLoading: boolean) => void
  onGcpFiltersChangeCallback: (values: GCPFiltersProps, loading: boolean) => void
  selectedInstances: InstanceDetails[]
  isEditFlow: boolean
}

const InstancesFilter: React.FC<InstancesFilterProps> = ({
  gatewayDetails,
  onResourceGroupSelectCallback,
  onGcpFiltersChangeCallback,
  selectedInstances,
  isEditFlow
}) => {
  const { accountId } = useParams<AccountPathProps>()
  const { getString } = useStrings()
  const isAzureProvider = Utils.isProviderAzure(gatewayDetails.provider)
  const isGcpProvider = Utils.isProviderGcp(gatewayDetails.provider)

  // Azure filters data
  const [resourceGroupData, setResourceGroupData] = useState<SelectOption[]>([])
  const [selectedResourceGroup, setSelectedResourceGroup] = useState<SelectOption>()

  // GCP filters data
  const { data: regionsData, loading: regionsLoading } = useRegionsForSelection({
    cloudAccountId: gatewayDetails.cloudAccount.id,
    additionalProps: { lazy: !isGcpProvider }
  })
  const [selectedRegion, setSelectedRegion] = useState<SelectOption>()
  const [zonesData, setZonesData] = useState<SelectOption[]>([])
  const [selectedZone, setSelectedZone] = useState<SelectOption>()

  const { data: resourceGroups, loading: resourceGroupsLoading } = useAllResourceGroups({
    account_id: accountId, // eslint-disable-line
    queryParams: {
      cloud_account_id: gatewayDetails.cloudAccount.id, // eslint-disable-line
      accountIdentifier: accountId
    },
    lazy: !isAzureProvider
  })

  const {
    data: zones,
    loading: zonesLoading,
    refetch: fetchZones
  } = useAllZones({
    account_id: accountId,
    queryParams: {
      cloud_account_id: gatewayDetails.cloudAccount.id,
      accountIdentifier: accountId,
      region: ''
    },
    lazy: true
  })

  useEffect(() => {
    setResourceGroupDataFromResponse(resourceGroups?.response)
  }, [resourceGroups?.response])

  useEffect(() => {
    if (isAzureProvider) {
      handleAzureFiltersUpdate()
    }
  }, [resourceGroupData])

  useEffect(() => {
    onResourceGroupSelectCallback(_defaultTo(selectedResourceGroup, null), resourceGroupsLoading)
  }, [selectedResourceGroup, resourceGroupsLoading])

  useEffect(() => {
    handleGcpRegionsFilterUpdate()
  }, [regionsData])

  useEffect(() => {
    if (selectedRegion) {
      fetchZones({
        queryParams: {
          cloud_account_id: gatewayDetails.cloudAccount.id,
          accountIdentifier: accountId,
          region: selectedRegion.label
        }
      })
    }
    if (isGcpProvider) {
      onGcpFiltersChangeCallback({ region: selectedRegion }, regionsLoading)
    }
  }, [selectedRegion, regionsLoading])

  useEffect(() => {
    if (zones?.response) {
      setZonesData(zones.response.map(z => ({ label: z, value: z })))
    }
  }, [zones?.response])

  useEffect(() => {
    handleGcpZonesFilterUpdate()
  }, [zonesData])

  useEffect(() => {
    if (selectedRegion) {
      onGcpFiltersChangeCallback({ region: selectedRegion, zone: selectedZone }, zonesLoading)
    }
  }, [selectedZone, zonesLoading])

  const handleAzureFiltersUpdate = () => {
    if (!selectedResourceGroup && !_isEmpty(selectedInstances)) {
      const groupName = selectedInstances?.[0]?.metadata?.resourceGroup?.toLowerCase()
      const groupToSelect = resourceGroupData.find(d => d.label.toLowerCase() === groupName)
      setSelectedResourceGroup(groupToSelect)
    }
  }

  const handleGcpRegionsFilterUpdate = () => {
    if (isGcpProvider && !selectedRegion && !_isEmpty(selectedInstances)) {
      const region = selectedInstances?.[0]?.region?.toLowerCase()
      const regionToSelect = regionsData.find(r => r.label.toLowerCase() === region)
      setSelectedRegion(regionToSelect)
    }
  }

  const handleGcpZonesFilterUpdate = () => {
    if (isGcpProvider && !selectedZone && !_isEmpty(selectedInstances)) {
      const zone = selectedInstances?.[0]?.metadata?.availabilityZone?.toLowerCase()
      const zoneToSelect = zonesData.find(z => z.label.toLowerCase() === zone)
      setSelectedZone(zoneToSelect)
    }
  }

  const setResourceGroupDataFromResponse = (response: ResourceGroup[] = []) => {
    const loaded = response.map(r => ({
      label: r.name as string,
      value: r.name as string
    }))
    setResourceGroupData(loaded)
  }

  if (isAzureProvider) {
    return (
      <Layout.Horizontal flex={{ justifyContent: 'flex-start' }} spacing={'large'} style={{ maxWidth: '40%' }}>
        <Select
          disabled={resourceGroupsLoading}
          items={resourceGroupData}
          onChange={setSelectedResourceGroup}
          value={selectedResourceGroup}
          inputProps={{
            placeholder: getString('ce.co.selectResourceGroupPlaceholder')
          }}
          name="resourceGroupSelector"
        />
      </Layout.Horizontal>
    )
  }

  if (isGcpProvider) {
    return (
      <Layout.Horizontal flex={{ justifyContent: 'flex-start' }} spacing={'large'} style={{ maxWidth: '40%' }}>
        <Select
          disabled={regionsLoading || isEditFlow}
          items={regionsData}
          onChange={setSelectedRegion}
          value={selectedRegion}
          inputProps={{
            placeholder: 'Region'
          }}
          name="regionsSelector"
        />
        <Select
          disabled={zonesLoading || isEditFlow}
          items={zonesData}
          onChange={setSelectedZone}
          value={selectedZone}
          inputProps={{
            placeholder: 'Zone'
          }}
          name="zoneSelector"
        />
      </Layout.Horizontal>
    )
  }

  return null
}

interface InstanceSelectorBodyProps {
  isLoading: boolean
  selectedResourceGroup?: SelectOption
  instances: InstanceDetails[]
  pageProps: { index: number; setIndex: (page: number) => void; totalCount: number }
  onCheckboxChange: (e: React.FormEvent<HTMLInputElement>, alreadyChecked: boolean, data: InstanceDetails) => void
  selectedInstances: InstanceDetails[]
  isAzureSelection: boolean
  isGcpSelection: boolean
  selectedGcpFilters?: GCPFiltersProps
}

interface WarningMessageProps {
  messageText: string
}

const WarningMessage = ({ messageText }: WarningMessageProps) => {
  return (
    <Text icon={'execution-warning'} font={{ size: 'medium' }} iconProps={{ size: 20 }}>
      {messageText}
    </Text>
  )
}

const InstanceSelectorBody: React.FC<InstanceSelectorBodyProps> = ({
  isLoading,
  selectedResourceGroup,
  instances,
  pageProps,
  onCheckboxChange,
  selectedInstances,
  isAzureSelection,
  isGcpSelection,
  selectedGcpFilters
}) => {
  const { getString } = useStrings()

  const isSelectedInstance = (item: InstanceDetails): boolean => {
    return selectedInstances.findIndex(s => s.id === item.id) >= 0
  }

  const TableCheck = (tableProps: CellProps<InstanceDetails>): JSX.Element => {
    const alreadyChecked = isSelectedInstance(tableProps.row.original)
    return (
      <Checkbox checked={alreadyChecked} onChange={e => onCheckboxChange(e, alreadyChecked, tableProps.row.original)} />
    )
  }

  const renderInstancesTable = (): ReactNode => {
    return (
      <TableV2
        className={css.instancesTable}
        data={instances.slice(
          pageProps.index * TOTAL_ITEMS_PER_PAGE,
          pageProps.index * TOTAL_ITEMS_PER_PAGE + TOTAL_ITEMS_PER_PAGE
        )}
        pagination={{
          pageSize: TOTAL_ITEMS_PER_PAGE,
          pageIndex: pageProps.index,
          pageCount: Math.ceil(instances.length / TOTAL_ITEMS_PER_PAGE),
          itemCount: pageProps.totalCount,
          gotoPage: newPageIndex => pageProps.setIndex(newPageIndex)
        }}
        columns={[
          {
            Header: '',
            id: 'selected',
            Cell: TableCheck,
            width: '5%'
          },
          {
            accessor: 'name',
            Header: getString('ce.co.instanceSelector.name'),
            width: '35%',
            Cell: NameCell,
            disableSortBy: true
          },
          {
            accessor: 'ipv4',
            Header: getString('ce.co.instanceSelector.ipAddress'),
            width: '15%',
            Cell: TableCell,
            disableSortBy: true
          },
          {
            accessor: 'region',
            Header: getString('regionLabel'),
            width: '15%',
            Cell: TableCell,
            disableSortBy: true
          },
          {
            accessor: 'type',
            Header: getString('typeLabel'),
            width: '15%',
            Cell: TableCell,
            disableSortBy: true
          },
          {
            accessor: 'status',
            Header: getString('status'),
            width: '10%',
            Cell: TableCell,
            disableSortBy: true
          }
        ]}
      />
    )
  }

  const azureBodyRenderer = (): ReactNode => {
    return _isEmpty(selectedResourceGroup) ? (
      <Layout.Horizontal flex={{ justifyContent: 'center' }}>
        <WarningMessage
          messageText={getString('ce.co.autoStoppingRule.configuration.instanceModal.rgEmptyDescription')}
        />
      </Layout.Horizontal>
    ) : _isEmpty(instances) ? (
      <Layout.Horizontal flex={{ justifyContent: 'center' }}>
        <Text font={{ size: 'medium' }} iconProps={{ size: 20 }}>
          {getString('ce.co.autoStoppingRule.configuration.instanceModal.rgEmptyInstancesDescription', {
            region: selectedResourceGroup?.label
          })}
        </Text>
      </Layout.Horizontal>
    ) : (
      renderInstancesTable()
    )
  }

  const gcpBodyRenderer = (): ReactNode => {
    return _isEmpty(selectedGcpFilters?.region) ? (
      <Layout.Horizontal flex={{ justifyContent: 'center' }}>
        <WarningMessage
          messageText={getString('ce.co.autoStoppingRule.configuration.instanceModal.gcpFiltersNotSelectedDescription')}
        />
      </Layout.Horizontal>
    ) : _isEmpty(selectedGcpFilters?.zone) ? (
      <Layout.Horizontal flex={{ justifyContent: 'center' }}>
        <WarningMessage
          messageText={getString(
            'ce.co.autoStoppingRule.configuration.instanceModal.gcpZoneFilterNotSelectedDescription'
          )}
        />
      </Layout.Horizontal>
    ) : _isEmpty(instances) ? (
      <Layout.Horizontal flex={{ justifyContent: 'center' }}>
        <Text font={{ size: 'medium' }} iconProps={{ size: 20 }}>
          {getString('ce.co.autoStoppingRule.configuration.instanceModal.gcpEmptyInstancesDescription')}
        </Text>
      </Layout.Horizontal>
    ) : (
      renderInstancesTable()
    )
  }

  const renderBody = (): ReactNode => {
    let body = null
    if (isAzureSelection) {
      body = azureBodyRenderer()
    } else if (isGcpSelection) {
      body = gcpBodyRenderer()
    } else {
      body = renderInstancesTable()
    }
    return body
  }

  return (
    <Container style={{ minHeight: 250 }}>
      {isLoading ? (
        <Layout.Horizontal flex={{ justifyContent: 'center' }}>
          <Icon name="spinner" size={24} color="blue500" />
        </Layout.Horizontal>
      ) : (
        renderBody()
      )}
    </Container>
  )
}

export default COInstanceSelector
