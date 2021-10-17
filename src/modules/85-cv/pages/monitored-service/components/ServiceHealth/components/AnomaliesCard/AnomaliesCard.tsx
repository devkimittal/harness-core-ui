import { Intent, Spinner } from '@blueprintjs/core'
import { Color, Container, Icon, Text } from '@wings-software/uicore'
import moment from 'moment'
import React, { useCallback, useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { getTimeFormatMoment } from '@cv/pages/monitored-service/components/ServiceHealth/ServiceHealth.utils'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useGetAnomaliesSummary } from 'services/cv'
import { getRiskColorValue } from '@cv/utils/CommonUtils'
import { getChangeSoureIconColor } from '@cv/components/ChangeTimeline/ChangeTimeline.utils'
import { areAnomaliesAvailable } from './AnomaliesCard.utils'
import type { AnomaliesCardProps } from './Anomalies.types'
import AnomaliesCardError from './components/AnomaliesCardError/AnomaliesCardError'
import css from './AnomaliesCard.module.scss'

export default function AnomaliesCard(props: AnomaliesCardProps): JSX.Element {
  const {
    timeRange,
    timeFormat,
    changeTimelineSummary,
    lowestHealthScoreBarForTimeRange,
    serviceIdentifier,
    environmentIdentifier,
    monitoredServiceIdentifier
  } = props
  const { orgIdentifier, projectIdentifier, accountId } = useParams<ProjectPathProps>()
  const { getString } = useStrings()

  const queryParams = useMemo(() => {
    return {
      accountId,
      orgIdentifier,
      projectIdentifier,
      serviceIdentifier,
      environmentIdentifier,
      startTime: timeRange?.startTime as number,
      endTime: timeRange?.endTime as number
    }
  }, [
    accountId,
    environmentIdentifier,
    orgIdentifier,
    projectIdentifier,
    serviceIdentifier,
    timeRange?.endTime,
    timeRange?.startTime
  ])

  // api for fetching anomaliesData
  const {
    data: anomaliesData,
    refetch: fetchAnomaliesData,
    loading: anomaliesLoading,
    error: anomaliesError
  } = useGetAnomaliesSummary({
    queryParams,
    lazy: true,
    identifier: monitoredServiceIdentifier as string,
    pathParams: {
      identifier: monitoredServiceIdentifier as string
    }
  })

  const {
    isTimeSeriesAnomaliesAvailable,
    isLogsAnomaliesAvailable,
    isTotalAnomaliesAvailable,
    isLowestHealthScoreAvailable
  } = areAnomaliesAvailable(anomaliesData, lowestHealthScoreBarForTimeRange?.healthScore)
  const momentTimeformat = getTimeFormatMoment(timeFormat)

  useEffect(() => {
    if (timeRange?.startTime || timeRange?.endTime) {
      fetchAnomaliesData({
        queryParams: { ...queryParams, startTime: timeRange?.startTime, endTime: timeRange?.endTime }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRange?.startTime, timeRange?.endTime, queryParams])

  const getAnomaliesFieldData = useCallback(
    field => {
      return !anomaliesError ? (
        <Icon padding={{ left: 'xsmall' }} name="warning-sign" size={12} intent={Intent.DANGER} />
      ) : (
        field
      )
    },
    [anomaliesError]
  )

  const renderAnomaliesData = useCallback(() => {
    if (anomaliesLoading) {
      return (
        <Container padding={{ left: 'medium', right: 'medium', top: 'medium', bottom: 'large' }}>
          <Spinner size={Spinner.SIZE_SMALL} />
        </Container>
      )
    } else if (anomaliesError) {
      return <AnomaliesCardError />
    } else {
      return (
        <Container padding={{ right: 'small', left: 'small' }}>
          {!anomaliesLoading && isTotalAnomaliesAvailable && (
            <Text
              padding={{ right: 'small', top: 'small' }}
              color={Color.WHITE}
              font={{ size: 'xsmall', weight: 'bold' }}
            >
              {`${getString('cv.monitoredServices.serviceHealth.anamolies')}:`}
              <span>{getAnomaliesFieldData(anomaliesData?.resource?.totalAnomalies)}</span>
            </Text>
          )}
          {isTimeSeriesAnomaliesAvailable && (
            <Text padding={{ top: 'small' }} color={Color.WHITE} font={{ size: 'xsmall', weight: 'bold' }}>
              {`${getString('pipeline.verification.analysisTab.metrics')}:`}
              <span>{getAnomaliesFieldData(anomaliesData?.resource?.timeSeriesAnomalies)}</span>
            </Text>
          )}
          {isLogsAnomaliesAvailable && (
            <Text
              padding={{ top: 'small', bottom: 'small' }}
              color={Color.WHITE}
              font={{ size: 'xsmall', weight: 'bold' }}
            >
              {`${getString('pipeline.verification.analysisTab.logs')}:`}
              <span>{getAnomaliesFieldData(anomaliesData?.resource?.logsAnomalies)}</span>
            </Text>
          )}
        </Container>
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    anomaliesData?.resource?.logsAnomalies,
    anomaliesData?.resource?.timeSeriesAnomalies,
    anomaliesLoading,
    isLogsAnomaliesAvailable,
    isTimeSeriesAnomaliesAvailable
  ])

  const renderChangesData = useCallback(() => {
    const allZero = changeTimelineSummary?.every(item => item.count === 0)
    return !allZero ? (
      <>
        <Container className={css.cardRow}>
          <Container className={css.cardColumn} padding={{ left: 'small', right: 'small' }}>
            {changeTimelineSummary?.map(item => {
              return (
                <Text
                  key={item.key}
                  icon={'symbol-square'}
                  className={css.changeSourceIcon}
                  iconProps={{ size: 10, color: getChangeSoureIconColor(item.key) }}
                  padding={{ top: 'small' }}
                  color={Color.WHITE}
                  font={{ size: 'xsmall' }}
                >
                  {item.message}
                </Text>
              )
            })}
          </Container>
        </Container>
        <hr className={css.seperator} />
      </>
    ) : null
  }, [changeTimelineSummary])

  return (
    <Container className={css.anomaliesContainer}>
      <Container className={css.cardRow}>
        <Text padding={{ left: 'small', top: 'small' }} color={Color.WHITE} font={{ size: 'xsmall' }}>
          {`${moment(timeRange?.startTime).format(momentTimeformat)} - ${moment(timeRange?.endTime).format(
            momentTimeformat
          )}`}
        </Text>
      </Container>
      <hr className={css.seperator} />
      {changeTimelineSummary && renderChangesData()}
      <Container className={css.cardRow}>
        {isLowestHealthScoreAvailable && (
          <Container className={css.cardColumn} padding={{ left: 'small', right: 'small' }}>
            <Text padding={{ top: 'small' }} color={Color.WHITE} font={{ size: 'xsmall' }}>
              {getString('cv.monitoredServices.serviceHealth.lowestHealthScore')}
            </Text>
            <Text
              padding={{ top: 'xsmall', bottom: 'xxsmall' }}
              color={getRiskColorValue(lowestHealthScoreBarForTimeRange?.riskStatus, false)}
              font={{ size: 'large', weight: 'bold' }}
            >
              {lowestHealthScoreBarForTimeRange?.healthScore}
            </Text>
          </Container>
        )}
        <Container className={css.cardColumn}>{renderAnomaliesData()}</Container>
      </Container>
    </Container>
  )
}
