/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import { Container, Text, Color, FontVariation, Checkbox, TableV2 } from '@harness/uicore'
import type { Column } from 'react-table'

import { flatten } from 'lodash-es'
import { Action, ACTIONS, IState } from '../NodeRecommendation/NodeRecommendation'

enum CheckboxStatus {
  CHECKED = 'checked',
  UNCHECKED = 'unchecked',
  INDETERMINATE = 'indeterminate'
}

interface TabProps {
  data?: Record<string, string[]>
  state: IState
  dispatch: React.Dispatch<Action>
}

export const InstanceFamiliesModalTab: React.FC<TabProps> = ({ data, state, dispatch }) => {
  const categoryData = data || {}

  const series = Object.keys(categoryData).sort()
  const types = flatten(Object.values(categoryData))

  const getCheckboxStatus = (val: string): CheckboxStatus => {
    if (state.includeTypes.includes(val)) {
      return CheckboxStatus.CHECKED
    } else if (state.excludeTypes.includes(val)) {
      return CheckboxStatus.INDETERMINATE
    } else {
      return CheckboxStatus.UNCHECKED
    }
  }

  const formatData = (seriesList: string[], typesList: string[]): Record<string, boolean>[] => {
    const formattedData: Record<string, boolean>[] = []

    seriesList.map(() => {
      const d: Record<string, boolean> = {}

      typesList.map(t => (d[t] = state.includeTypes.includes(t)))

      formattedData.push(d)
    })

    return formattedData
  }

  const columns: Column<Record<string, boolean>>[] = useMemo(
    () => [
      {
        Header: '',
        id: 'series',
        width: '50px',
        Cell: ({ row }: { row: any }) => <Text font={{ variation: FontVariation.SMALL_SEMI }}>{series[row.index]}</Text>
      },
      ...types.map(type => ({
        Header: type,
        accessor: type,
        id: type,
        Cell: ({ row }: { row: any }) => {
          const status = getCheckboxStatus(type)

          if (!categoryData[series[row.index]].includes(type)) {
            return null
          }

          return (
            <Container flex={{ justifyContent: 'center', alignItems: 'center' }} background={row.index}>
              <Checkbox
                checked={status === CheckboxStatus.CHECKED}
                indeterminate={status === CheckboxStatus.INDETERMINATE}
                onClick={() => {
                  console.log(status)
                  if (status === CheckboxStatus.UNCHECKED) {
                    dispatch({ type: ACTIONS.INCLUDE_TYPES, data: type })
                  } else if (status === CheckboxStatus.CHECKED) {
                    dispatch({ type: ACTIONS.INCLUDE_TYPES, data: type })
                    dispatch({ type: ACTIONS.EXCLUDE_TYPES, data: type })
                  } else {
                    dispatch({ type: ACTIONS.EXCLUDE_TYPES, data: type })
                  }
                }}
              />
            </Container>
          )
        }
      }))
    ],
    [state]
  )

  return (
    <Container background={Color.GREY_50} flex style={{ overflow: 'scroll', border: '1px solid #D9DAE6' }}>
      <TableV2 minimal data={formatData(series, types)} columns={columns} />
    </Container>
  )
}
