import React, { useState, useEffect, useMemo } from 'react'
import { Container, Icon, Color, Pagination } from '@wings-software/uikit'
import cx from 'classnames'
import { useRouteParams } from 'framework/exports'
import {
  useGetAnomalousMetricDashboardData,
  TimeSeriesMetricDataDTO,
  useGetMetricData,
  RestResponsePageTimeSeriesMetricDataDTO,
  MetricData
} from 'services/cv'
import { NoDataCard } from '@common/components/Page/NoDataCard'
import { TimelineBar } from '@common/components/TimelineView/TimelineBar'
import { PageError } from '@common/components/Page/PageError'
import MetricAnalysisRow from './MetricsAnalysisRow/MetricAnalysisRow'
import { MetricAnalysisFilter } from './MetricAnalysisFilter/MetricAnalysisFilter'
import i18n from './MetricAnalysisView.i18n'
import { categoryNameToCategoryType } from '../../CVServicePageUtils'
import css from './MetricAnalysisView.module.scss'

interface MetricAnalysisViewProps {
  startTime: number
  endTime: number
  categoryName?: string
  environmentIdentifier?: string
  serviceIdentifier?: string
  className?: string
  historyStartTime?: number
  showHistorySelection?: boolean
}

function generatePointsForTimeSeries(
  data: RestResponsePageTimeSeriesMetricDataDTO,
  startTime: number,
  endTime: number
): RestResponsePageTimeSeriesMetricDataDTO {
  if (!data?.resource?.content?.length) {
    return data
  }

  const content = data.resource.content
  const timeRange = Math.floor((endTime - startTime) / 60000)
  for (const analysis of content) {
    if (!analysis?.metricDataList?.length) {
      continue
    }

    analysis.metricDataList.sort((a: MetricData, b: MetricData) => {
      if (!a?.timestamp) {
        return b?.timestamp ? -1 : 0
      }
      if (!b?.timestamp) {
        return 1
      }
      return a.timestamp - b.timestamp
    })
    const filledMetricData: MetricData[] = []
    let metricDataIndex = 0

    for (let i = 0; i < timeRange; i++) {
      const currTime = startTime + 60000 * i
      const instantData = analysis.metricDataList[metricDataIndex]
      if (instantData?.timestamp && instantData.timestamp === currTime) {
        filledMetricData.push(analysis.metricDataList[metricDataIndex])
        metricDataIndex++
      } else {
        filledMetricData.push({ timestamp: currTime, value: undefined })
      }
    }

    analysis.metricDataList = filledMetricData
  }

  return data
}

export default function MetricAnalysisView(props: MetricAnalysisViewProps): JSX.Element {
  const {
    className,
    startTime,
    endTime,
    historyStartTime,
    categoryName,
    environmentIdentifier,
    serviceIdentifier,
    showHistorySelection
  } = props
  const {
    params: { orgIdentifier = '', projectIdentifier = '', accountId = '' }
  } = useRouteParams()
  const finalStartTime = historyStartTime ?? startTime
  const queryParams = useMemo(
    () => ({
      accountId,
      orgIdentifier: orgIdentifier as string,
      projectIdentifier: projectIdentifier as string,
      environmentIdentifier,
      serviceIdentifier,
      monitoringCategory: (categoryName ? categoryNameToCategoryType(categoryName) : undefined) as string,
      startTime: finalStartTime,
      endTime
    }),
    [serviceIdentifier, environmentIdentifier, finalStartTime, endTime, categoryName, projectIdentifier, orgIdentifier]
  )
  const [isViewingAnomalousData, setMetricDataView] = useState(true)
  const [needsRefetch, setNeedsRefetch] = useState(true)

  const {
    data: anomalousMetricData,
    error: anomalousError,
    loading: loadingAnomalousData,
    cancel: cancelAnomalousCall,
    refetch: refetchAnomalousData
  } = useGetAnomalousMetricDashboardData({
    queryParams,
    lazy: true,
    resolve: response => generatePointsForTimeSeries(response, finalStartTime, endTime)
  })
  const {
    data: allMetricData,
    error: allMetricDataError,
    loading: loadingAllMetricData,
    cancel: cancelAllMetricDataCall,
    refetch: refetchAllMetricData
  } = useGetMetricData({
    queryParams,
    lazy: true,
    resolve: response => generatePointsForTimeSeries(response, finalStartTime, endTime)
  })

  useEffect(() => {
    if (isViewingAnomalousData) {
      refetchAnomalousData({ queryParams })
    } else {
      refetchAllMetricData({ queryParams })
    }
    setNeedsRefetch(true)
  }, [queryParams])

  if (allMetricDataError || anomalousError) {
    return (
      <PageError
        message={allMetricDataError?.message ?? anomalousError?.message}
        onClick={() => {
          if (isViewingAnomalousData) {
            refetchAnomalousData({ queryParams })
          } else {
            refetchAllMetricData({ queryParams })
          }
        }}
      />
    )
  }

  const data = isViewingAnomalousData ? anomalousMetricData : allMetricData
  const { pageSize, totalPages = 0, content, totalItems = 0, pageIndex, empty } = (data?.resource as any) || {}

  return (
    <Container className={cx(css.main, className)}>
      <Container className={css.header}>
        <MetricAnalysisFilter
          onChangeFilter={() => {
            cancelAllMetricDataCall()
            cancelAnomalousCall()
            setMetricDataView(prevView => {
              const isAnomalousView = !prevView
              if (isAnomalousView && (!anomalousMetricData?.resource?.content?.length || needsRefetch)) {
                refetchAnomalousData()
                setNeedsRefetch(false)
              } else if (!allMetricData?.resource?.content?.length || needsRefetch) {
                refetchAllMetricData()
                setNeedsRefetch(false)
              }
              return isAnomalousView
            })
          }}
        />
        <TimelineBar startDate={finalStartTime} endDate={endTime} className={css.timeline} columnWidth={70} />
      </Container>
      {(loadingAllMetricData || loadingAnomalousData) && (
        <Container className={css.errorOrLoading} margin="medium">
          <Icon name="steps-spinner" size={25} color={Color.GREY_600} />
        </Container>
      )}
      {!loadingAllMetricData && !loadingAnomalousData && !totalItems && (
        <NoDataCard
          message={isViewingAnomalousData ? i18n.noDataText.anomalous : i18n.noDataText.allMetricData}
          icon="warning-sign"
          buttonText={i18n.retryButtonText}
          className={css.noDataCard}
          onClick={isViewingAnomalousData ? () => refetchAnomalousData() : () => refetchAllMetricData()}
        />
      )}
      {!loadingAllMetricData &&
        !loadingAnomalousData &&
        content?.map((d: TimeSeriesMetricDataDTO) => {
          const { category, groupName, metricDataList, metricName } = d
          return metricName && groupName && metricDataList?.length ? (
            <MetricAnalysisRow
              key={`${categoryName}-${groupName}-${metricName}`}
              metricName={metricName}
              categoryName={category}
              startTime={finalStartTime}
              endTime={endTime}
              transactionName={groupName}
              analysisData={metricDataList}
              displaySelectedTimeRange={showHistorySelection}
            />
          ) : null
        })}
      {pageIndex !== -1 && !empty && (
        <Pagination
          pageSize={pageSize || 0}
          pageIndex={pageIndex}
          pageCount={totalPages}
          itemCount={totalItems}
          gotoPage={(selectedPageIndex: number) => {
            if (isViewingAnomalousData) {
              refetchAnomalousData({ queryParams: { ...queryParams, page: selectedPageIndex } })
            } else {
              refetchAllMetricData({ queryParams: { ...queryParams, page: selectedPageIndex } })
            }
          }}
        />
      )}
    </Container>
  )
}
