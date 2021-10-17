import React, { useCallback, useEffect, useMemo } from 'react'
import { Color, Container, Layout, Text } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import { getRiskColorValue } from '@cv/utils/CommonUtils'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useGetMonitoredServiceScoresFromServiceAndEnvironment } from 'services/cv'
import { useStrings } from 'framework/strings'
import type { HealthScoreCardProps } from './HealthScoreCard.types'
import HealthScoreCardLoading from './components/HealthScoreCardLoading/HealthScoreCardLoading'
import HealthScoreCardError from './components/HealthScoreError/HealthScoreCardError'
import css from './HealthScoreCard.module.scss'

export default function HealthScoreCard(props: HealthScoreCardProps): JSX.Element {
  const { orgIdentifier, projectIdentifier, accountId } = useParams<ProjectPathProps & { identifier: string }>()
  const { serviceIdentifier, environmentIdentifier } = props
  const { getString } = useStrings()

  const healthScoreQueryParams = useMemo(() => {
    return {
      orgIdentifier,
      projectIdentifier,
      accountId,
      serviceIdentifier,
      environmentIdentifier
    }
  }, [accountId, environmentIdentifier, orgIdentifier, projectIdentifier, serviceIdentifier])

  const {
    data: healthScoreData,
    refetch: fetchHealthScore,
    loading,
    error
  } = useGetMonitoredServiceScoresFromServiceAndEnvironment({
    lazy: true,
    queryParams: healthScoreQueryParams
  })

  useEffect(() => {
    if (serviceIdentifier && environmentIdentifier) {
      fetchHealthScore({ queryParams: healthScoreQueryParams })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceIdentifier, environmentIdentifier, healthScoreQueryParams])

  const { healthScore, color } = useMemo(() => {
    const { riskStatus: riskStatusData, healthScore: healthScoreValue = -2 } =
      healthScoreData?.data?.currentHealthScore || {}
    const colorData = getRiskColorValue(riskStatusData)
    return { healthScore: healthScoreValue, color: colorData }
  }, [healthScoreData?.data?.currentHealthScore])

  const renderHealthScore = useCallback(() => {
    if (loading) {
      return <HealthScoreCardLoading />
    } else if (!error) {
      return <HealthScoreCardError errorMessage={getString('cv.monitoredServices.failedToFetchHealthScore')} />
    } else if (healthScore !== null && healthScore > -1) {
      return (
        <>
          <div className={css.healthScoreCard} style={{ background: color }}>
            {healthScore}
          </div>
          <Text color={Color.BLACK} font={{ size: 'small' }}>
            {getString('cv.monitoredServices.monitoredServiceTabs.serviceHealth')}
          </Text>
        </>
      )
    } else if (healthScore === -2 || healthScore === null) {
      return (
        <Container className={css.noDataState}>
          <Text font={{ size: 'xsmall' }} padding={{ right: 'small' }} flex={{ alignItems: 'center' }}>
            {getString('cv.monitoredServices.healthScoreDataNotAvailable')}
          </Text>
          <Layout.Horizontal className={css.healthScoreCardContainer}>
            <div className={css.healthScoreCard} style={{ background: color }}></div>
            <Text color={Color.BLACK} font={{ size: 'small' }}>
              {getString('cv.monitoredServices.monitoredServiceTabs.serviceHealth')}
            </Text>
          </Layout.Horizontal>
        </Container>
      )
    } else {
      return <></>
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [color, healthScore, loading])

  return <Layout.Horizontal className={css.healthScoreCardContainer}>{renderHealthScore()}</Layout.Horizontal>
}
