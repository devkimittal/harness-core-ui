/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { Color } from '@harness/design-system'
import { Icon, Layout, Table, Select, SelectOption, TextInput, Text } from '@wings-software/uicore'
import type { CellProps } from 'react-table'
import type { Service, ServiceDep } from 'services/lw'
import css from './COGatewayConfig.module.scss'

interface CORuleDendencySelectorProps {
  deps: ServiceDep[]
  setDeps: (s: ServiceDep[]) => void
  service_id: number | undefined
  allServices: Service[]
}

const CORuleDendencySelector: React.FC<CORuleDendencySelectorProps> = props => {
  const [serviceList, setServiceList] = useState<SelectOption[]>([])
  const [error, setError] = useState<{ indices: number[]; val: string }>()

  useEffect(() => {
    if (!props.allServices) {
      setServiceList([])
      return
    }
    const services: SelectOption[] = !props.allServices
      ? []
      : props.allServices
          .filter(x => x.id != props.service_id)
          .map(r => {
            return {
              label: r.name as string,
              value: r.id as number
            }
          }) || []
    setServiceList(services)
  }, [props.allServices])

  const removeError = (index: number) => {
    if (error?.indices.includes(index)) {
      if (error.indices.length === 1) setError(undefined)
      else
        setError(prevData => ({
          indices: prevData?.indices.filter(_i => _i !== index) as number[],
          val: prevData?.val as string
        }))
    }
  }

  function updateDependency(index: number, column: string, value: number) {
    if (isNaN(value)) {
      setError(prevData => ({
        indices: [...new Set([...(prevData?.indices || []), index])],
        val: 'Input value is not valid'
      }))
    } else {
      removeError(index)
    }
    const depsConfig = [...props.deps]
    switch (column) {
      case 'dep_id': {
        depsConfig[index]['dep_id'] = value
        break
      }
      case 'delay_secs': {
        depsConfig[index]['delay_secs'] = value
        break
      }
    }
    props.setDeps(depsConfig)
  }
  function deleteDependency(index: number) {
    removeError(index)
    const depConfig = [...props.deps]
    depConfig.splice(index, 1)
    props.setDeps(depConfig)
  }
  function getItembyValue(items: SelectOption[], value: string): SelectOption {
    return items.filter(x => x.value == value)[0]
  }
  function ServiceCell(tableProps: CellProps<ServiceDep>): JSX.Element {
    return (
      <Select
        className={css.selectCell}
        value={getItembyValue(serviceList, tableProps.value)}
        items={serviceList}
        onChange={e => {
          updateDependency(tableProps.row.index, tableProps.column.id, e.value as number)
        }}
      />
    )
  }
  function TableCell(tableProps: CellProps<ServiceDep>): JSX.Element {
    return (
      <>
        <TextInput
          defaultValue={tableProps.value}
          className={css.advancedConfigInput}
          style={{ border: 'none' }}
          onBlur={e => {
            const value = (e.currentTarget as HTMLInputElement).value
            updateDependency(tableProps.row.index, tableProps.column.id, +value)
          }}
        />
        {error?.val && error.indices.includes(tableProps.row.index) && <Text color={Color.RED_500}>{error.val}</Text>}
      </>
    )
  }
  function DeleteCell(tableProps: CellProps<ServiceDep>): JSX.Element {
    return <Icon name="trash" onClick={() => deleteDependency(tableProps.row.index)}></Icon>
  }

  return (
    <Layout.Vertical>
      <Table<ServiceDep>
        data={props.deps}
        className={css.dependencyTable}
        bpTableProps={{}}
        columns={[
          {
            accessor: 'dep_id',
            Header: 'RULES',
            width: '16.5%',
            Cell: ServiceCell
          },
          {
            accessor: 'delay_secs',
            Header: 'DELAY IN SECS',
            width: '16.5%',
            Cell: TableCell,
            disableSortBy: true
          },
          {
            Header: '',
            id: 'menu',
            accessor: row => row.dep_id,
            width: '16.5%',
            Cell: DeleteCell
          }
        ]}
      />
    </Layout.Vertical>
  )
}

export default CORuleDendencySelector
