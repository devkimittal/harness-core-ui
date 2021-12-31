import React, { useEffect, useMemo, useState } from 'react'
import { Button, Container, Utils } from '@wings-software/uicore'
import { PopoverInteractionKind } from '@blueprintjs/core'
import type { GroupedCreatedMetrics } from '@cv/pages/health-source/connectors/AppDynamics/Components/AppDMappedMetric/AppDMappedMetric.types'
import { SelectedAppsSideNav } from './components/SelectedAppsSideNav/SelectedAppsSideNav'
import css from './MultiItemsSideNav.module.scss'

export interface MultiItemsSideNavProps {
  onSelectMetric: (selectedMetric: string, updatedList: string[], selectedMetricIndex: number) => void
  onRemoveMetric: (
    removedMetric: string,
    newSelectedMetric: string,
    updatedList: string[],
    selectedMetricIndex: number
  ) => void
  isValidInput: boolean
  renamedMetric?: string
  createdMetrics?: string[]
  defaultSelectedMetric?: string
  defaultMetricName: string
  tooptipMessage: string
  addFieldLabel: string
  groupedCreatedMetrics?: GroupedCreatedMetrics
}

export function MultiItemsSideNav(props: MultiItemsSideNavProps): JSX.Element {
  const {
    onSelectMetric,
    createdMetrics: propsCreatedMetrics,
    renamedMetric,
    onRemoveMetric,
    isValidInput,
    defaultSelectedMetric,
    defaultMetricName,
    tooptipMessage,
    addFieldLabel,
    groupedCreatedMetrics
  } = props
  const [filter, setFilter] = useState<string | undefined>()
  const [createdMetrics, setCreatedMetrics] = useState<string[]>(
    propsCreatedMetrics?.length ? propsCreatedMetrics : [defaultMetricName]
  )
  const [selectedMetric, setSelectedMetric] = useState<string | undefined>(defaultSelectedMetric || createdMetrics[0])

  useEffect(() => {
    if (renamedMetric && renamedMetric === selectedMetric) {
      return
    }

    let selectedMetricIndex = -1
    for (let metricIndex = 0; metricIndex < createdMetrics.length; metricIndex++) {
      const metric = createdMetrics[metricIndex]
      if (metric === renamedMetric) {
        // duplicate metric found so skip updating
        return
      }
      if (selectedMetric === metric) {
        selectedMetricIndex = metricIndex
      }
    }

    setCreatedMetrics(oldMetrics => {
      if (selectedMetricIndex !== -1) oldMetrics[selectedMetricIndex] = renamedMetric as string
      return Array.from(oldMetrics)
    })
    setSelectedMetric(renamedMetric)
  }, [renamedMetric])

  const metricsToRender = useMemo(() => {
    return filter
      ? createdMetrics.filter(metric => metric.toLocaleLowerCase().includes(filter?.toLocaleLowerCase()))
      : createdMetrics
  }, [filter, createdMetrics])

  return (
    <Container className={css.main}>
      <Button
        icon="plus"
        minimal
        intent="primary"
        disabled={!isValidInput}
        tooltip={!isValidInput ? tooptipMessage : undefined}
        tooltipProps={{ interactionKind: PopoverInteractionKind.HOVER_TARGET_ONLY }}
        onClick={() => {
          if (isValidInput) {
            setCreatedMetrics(oldMetrics => {
              const newMetricName = `${defaultMetricName} ${Utils.randomId()}`
              onSelectMetric(newMetricName, [newMetricName, ...oldMetrics], 0)
              setSelectedMetric(newMetricName)
              return [newMetricName, ...oldMetrics]
            })
          }
        }}
      >
        {addFieldLabel}
      </Button>
      <SelectedAppsSideNav
        onSelect={(newlySelectedMetric, index) => {
          onSelectMetric(newlySelectedMetric, createdMetrics, index)
          setSelectedMetric(newlySelectedMetric)
        }}
        selectedItem={selectedMetric}
        selectedApps={metricsToRender}
        groupedSelectedApps={groupedCreatedMetrics}
        onRemoveItem={
          createdMetrics.length > 1
            ? (removedItem, index) => {
                setCreatedMetrics(oldMetrics => {
                  if (groupedCreatedMetrics) {
                    const copyMetric = Object.values(groupedCreatedMetrics)
                      .map(item => item[0].metricName || '')
                      .reverse()
                      .reverse()

                    copyMetric.splice(index, 1)
                    const updateIndex = index === 0 ? 0 : index - 1
                    const updatedMetric = copyMetric[updateIndex] || ''
                    setSelectedMetric(updatedMetric)
                    onRemoveMetric(removedItem, updatedMetric, [...copyMetric], updateIndex)
                    return [...copyMetric]
                  } else {
                    oldMetrics.splice(index, 1)
                    const updateIndex = index === 0 ? 0 : index - 1
                    const updatedMetric = oldMetrics[updateIndex]
                    setSelectedMetric(updatedMetric)
                    onRemoveMetric(removedItem, updatedMetric, [...oldMetrics], updateIndex)
                    return [...oldMetrics]
                  }
                })
              }
            : undefined
        }
        filterProps={{
          onFilter: setFilter,
          className: css.metricsFilter
        }}
      />
    </Container>
  )
}
