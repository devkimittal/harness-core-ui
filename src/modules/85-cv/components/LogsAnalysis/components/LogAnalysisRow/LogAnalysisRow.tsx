/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo, useCallback, useState, useRef } from 'react'
import { Container, Text, Icon, Layout } from '@wings-software/uicore'
import cx from 'classnames'
import HighchartsReact from 'highcharts-react-official'
import Highcharts from 'highcharts'
import { useStrings } from 'framework/strings'
import { getRiskColorValue, getRiskLabelStringId } from '@cv/utils/CommonUtils'
import getLogAnalysisLineChartOptions from './LogAnalysisLineChartConfig'
import { LogAnalysisRiskAndJiraModal } from './components/LogAnalysisRiskAndJiraModal/LogAnalysisRiskAndJiraModal'
import type {
  LogAnalysisDataRowProps,
  LogAnalysisRowProps,
  CompareLogEventsInfo,
  LogAnalysisRowData
} from './LogAnalysisRow.types'
import { getEventTypeFromClusterType, onClickErrorTrackingRow } from './LogAnalysisRow.utils'
import css from './LogAnalysisRow.module.scss'

function ColumnHeaderRow(): JSX.Element {
  const { getString } = useStrings()
  return (
    <Container className={cx(css.mainRow, css.columnHeader)}>
      <Text padding={{ left: 'small' }}>{getString('pipeline.verification.logs.eventType')}</Text>
      <Text>{getString('cv.sampleMessage')}</Text>
      <Container>
        <Text>{getString('common.frequency')}</Text>
        <Text className={css.secondaryText}>({getString('pipeline.verification.logs.countPerMin')})</Text>
      </Container>

      {/* BELOW TWO COLUMNS HAS NO TITLE */}
      {/* LOG UPDATED INFO */}
      <span />

      {/* LOG ACTIONS */}
      <span />
    </Container>
  )
}

function DataRow(props: LogAnalysisDataRowProps): JSX.Element {
  const { getString } = useStrings()
  const { rowData, isErrorTracking } = props
  const { riskScore, riskStatus } = rowData
  const color = getRiskColorValue(riskStatus)
  const chartOptions = useMemo(
    () => getLogAnalysisLineChartOptions(rowData?.messageFrequency || []),
    [rowData?.messageFrequency]
  )
  const [displayRiskEditModal, setDisplayRiskEditModal] = useState(false)
  const [feedbackGiven, setFeedbackGiven] = useState<{ risk: string; message: string } | undefined>(undefined)
  const logTextRef = useRef<HTMLParagraphElement>(null)
  const onShowRiskEditModalCallback = useCallback(() => {
    if (isErrorTracking) {
      onClickErrorTrackingRow(rowData.message)
    } else {
      setDisplayRiskEditModal(true)
    }
  }, [isErrorTracking, rowData.message])

  const onHideRiskEditModalCallback = useCallback((data?) => {
    if (data?.risk || data?.message) setFeedbackGiven(data)
    setDisplayRiskEditModal(false)
  }, [])

  return (
    <Container className={cx(css.mainRow, css.dataRow)} data-testid={'logs-data-row'}>
      <Container
        padding={{ left: 'small' }}
        className={cx(css.openModalColumn, css.compareDataColumn, css.clusterType)}
      >
        {rowData.clusterType && (
          <Text onClick={onShowRiskEditModalCallback}>{getEventTypeFromClusterType(rowData.clusterType)}</Text>
        )}
      </Container>
      <Container className={cx(css.logText, css.openModalColumn, css.message)} onClick={onShowRiskEditModalCallback}>
        <p className={css.logRowText} ref={logTextRef}>
          {isErrorTracking ? rowData.message.split('|').slice(0, 4).join('|') : rowData.message}
        </p>
      </Container>
      {/* <Container
        className={cx(css.logRowText, css.openModalColumn, css.count)}
        onClick={onShowRiskEditModalCallback}
        padding={{ left: 'medium' }}
      >
        <p className={css.count}>{rowData.count}</p>
      </Container> */}
      <Container className={cx(css.lineChartContainer, css.messageFrequency)}>
        <HighchartsReact highchart={Highcharts} options={chartOptions} />
      </Container>
      {displayRiskEditModal ? (
        <LogAnalysisRiskAndJiraModal
          onHide={onHideRiskEditModalCallback}
          trendData={chartOptions}
          count={rowData.count || 0}
          activityType={rowData.clusterType}
          logMessage={rowData.message || ''}
          feedback={feedbackGiven}
        />
      ) : null}
      <span />
      <Layout.Horizontal style={{ alignItems: 'center' }}>
        <Icon name="description" size={24} onClick={onShowRiskEditModalCallback} />
      </Layout.Horizontal>
    </Container>
  )
}

export function LogAnalysisRow(props: LogAnalysisRowProps): JSX.Element {
  const { data = [], isErrorTracking } = props
  const [dataToCompare, setDataToCompare] = useState<CompareLogEventsInfo[]>([])

  const onCompareSelectCallback = useCallback(
    (isSelect: boolean, selectedData: LogAnalysisRowData, index: number) => {
      let updatedDataToCompare = [...dataToCompare]
      if (!isSelect) {
        updatedDataToCompare = updatedDataToCompare.filter(d => d.index !== index)
      } else {
        if (updatedDataToCompare.length === 2) updatedDataToCompare.pop()
        updatedDataToCompare.unshift({ data: selectedData, index })
      }
      setDataToCompare(updatedDataToCompare)
    },
    [dataToCompare]
  )
  const selectedIndices = useMemo(() => new Set(dataToCompare.map(d => d.index)), [dataToCompare])

  return (
    <Container className={cx(css.main, props.className)}>
      <ColumnHeaderRow />
      <Container className={css.dataContainer}>
        {data.map((row, index) => {
          if (!row) return null
          const { clusterType, count, message } = row
          return (
            <DataRow
              key={`${clusterType}-${count}-${message}`}
              rowData={row}
              index={index}
              onSelect={onCompareSelectCallback}
              isSelected={selectedIndices.has(index)}
              isErrorTracking={isErrorTracking}
            />
          )
        })}
      </Container>
    </Container>
  )
}
