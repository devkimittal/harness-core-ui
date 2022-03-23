/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useContext, useMemo } from 'react'
import ReactDOM from 'react-dom'
import { useParams } from 'react-router-dom'
import type { SeriesAreaOptions } from 'highcharts'
import { Card, Container, Layout, Text, PageError } from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import { Ticker, TickerVerticalAlignment } from '@common/components/Ticker/Ticker'
import { getBucketSizeForTimeRange } from '@common/components/TimeRangeSelector/TimeRangeSelector'
import { PageSpinner, TimeSeriesAreaChart } from '@common/components'
import type { TimeSeriesAreaChartProps } from '@common/components/TimeSeriesAreaChart/TimeSeriesAreaChart'
import {
  DeploymentsTimeRangeContext,
  getFixed,
  INVALID_CHANGE_RATE,
  numberFormatter
} from '@cd/components/Services/common'
import { getReadableDateTime } from '@common/utils/dateUtils'
import DeploymentsEmptyState from '@cd/icons/DeploymentsEmptyState.svg'
import {
  GetServiceDeploymentsInfoQueryParams,
  ServiceDeploymentListInfo,
  useGetServiceDeploymentsInfo
} from 'services/cd-ng'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import css from '@cd/components/Services/DeploymentsWidget/DeploymentsWidget.module.scss'

export interface ChangeValue {
  value: string
  change: number
}

interface DeploymentWidgetData {
  deployments: ChangeValue
  failureRate: ChangeValue
  frequency: ChangeValue
  data: TimeSeriesAreaChartProps['seriesData']
}

export interface DeploymentWidgetProps {
  serviceIdentifier?: string
}

const TickerValue: React.FC<{ value: number; color: Color }> = props => (
  <Text font={{ size: 'xsmall' }} color={props.color}>{`${numberFormatter(Math.abs(props.value), {
    truncate: false
  })}%`}</Text>
)

const DeploymentsTooltip: React.FC<any> = props => {
  const {
    x: timestamp,
    failureRate,
    failureRateLabel,
    failureRateChangeRate,
    frequency,
    frequencyChangeRate,
    frequencyLabel
  } = props.options || {}
  const currentDate = getReadableDateTime(timestamp)
  const isFailureBoost = failureRateChangeRate === INVALID_CHANGE_RATE
  const isFrequencyBoost = frequencyChangeRate === INVALID_CHANGE_RATE
  return (
    <Card className={css.tooltipCard}>
      <Layout.Vertical>
        <Text
          font={{ size: 'small' }}
          width="100%"
          className={css.tooltipTimestamp}
          margin={{ bottom: 'medium' }}
          padding={{ bottom: 'small' }}
        >
          {currentDate}
        </Text>
        <Layout.Horizontal flex={{ justifyContent: 'space-between' }}>
          <Text font={{ size: 'small', weight: 'semi-bold' }}>{failureRateLabel}</Text>
          <Ticker
            value={
              isFailureBoost ? (
                <></>
              ) : (
                <TickerValue
                  value={getFixed(failureRateChangeRate || 0)}
                  color={!isFailureBoost || failureRateChangeRate < 0 ? Color.GREEN_600 : Color.RED_500}
                />
              )
            }
            decreaseMode={!isFailureBoost && failureRateChangeRate < 0}
            boost={isFailureBoost}
            color={!isFailureBoost || failureRateChangeRate < 0 ? Color.GREEN_600 : Color.RED_500}
            verticalAlign={TickerVerticalAlignment.TOP}
            size={isFailureBoost ? 10 : 6}
          >
            <Text color={Color.BLACK} font={{ weight: 'bold' }} margin={{ right: 'medium' }}>
              {numberFormatter(failureRate, { truncate: false })}%
            </Text>
          </Ticker>
        </Layout.Horizontal>
        <Layout.Horizontal flex={{ justifyContent: 'space-between' }}>
          <Text font={{ size: 'small', weight: 'semi-bold' }}>{frequencyLabel}</Text>
          <Ticker
            value={
              isFrequencyBoost ? (
                <></>
              ) : (
                <TickerValue
                  value={getFixed(frequencyChangeRate || 0)}
                  color={isFrequencyBoost || frequencyChangeRate > 0 ? Color.GREEN_600 : Color.RED_500}
                />
              )
            }
            decreaseMode={!isFrequencyBoost && frequencyChangeRate < 0}
            boost={isFrequencyBoost}
            color={isFrequencyBoost || frequencyChangeRate > 0 ? Color.GREEN_600 : Color.RED_500}
            verticalAlign={TickerVerticalAlignment.TOP}
            size={isFrequencyBoost ? 10 : 6}
          >
            <Text color={Color.BLACK} font={{ weight: 'bold' }} margin={{ right: 'medium' }}>
              {numberFormatter(frequency)}
            </Text>
          </Ticker>
        </Layout.Horizontal>
      </Layout.Vertical>
    </Card>
  )
}

export const DeploymentsWidget: React.FC<DeploymentWidgetProps> = props => {
  const { getString } = useStrings()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()

  const { serviceIdentifier } = props
  const { timeRange } = useContext(DeploymentsTimeRangeContext)

  const queryParams: GetServiceDeploymentsInfoQueryParams = useMemo(() => {
    return {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      serviceId: serviceIdentifier,
      startTime: timeRange?.range[0]?.getTime() || 0,
      endTime: timeRange?.range[1]?.getTime() || 0,
      bucketSizeInDays: getBucketSizeForTimeRange(timeRange?.range)
    }
  }, [accountId, orgIdentifier, projectIdentifier, serviceIdentifier, timeRange])

  const {
    loading,
    data: serviceDeploymentsInfo,
    error,
    refetch
  } = useGetServiceDeploymentsInfo({
    queryParams
  })

  const parseData = useCallback(
    (serviceDeploymentListInfo: ServiceDeploymentListInfo): DeploymentWidgetData => {
      const deployments = (serviceDeploymentListInfo.serviceDeploymentList || []).filter(
        deployment => deployment.time !== undefined
      )
      deployments.sort((deploymentA, deploymentB) => ((deploymentA.time || 0) < (deploymentB.time || 0) ? -1 : 1))

      const success: SeriesAreaOptions['data'] = []
      const failed: SeriesAreaOptions['data'] = []

      deployments.forEach(deployment => {
        const { failureRate, failureRateChangeRate, frequency, frequencyChangeRate } = deployment.rate || {}
        const rates = {
          failureRate,
          failureRateChangeRate,
          frequency,
          frequencyChangeRate,
          frequencyLabel: getString('common.frequency'),
          failureRateLabel: getString('common.failureRate')
        }
        success.push({ x: deployment.time || 0, y: deployment.deployments?.success || 0, ...rates })
        failed.push({ x: deployment.time || 0, y: deployment.deployments?.failure || 0, ...rates })
      })

      return {
        deployments: {
          value: numberFormatter(serviceDeploymentListInfo.totalDeployments),
          change: serviceDeploymentListInfo.totalDeploymentsChangeRate || 0
        },
        failureRate: {
          value: numberFormatter(serviceDeploymentListInfo.failureRate),
          change: serviceDeploymentListInfo.failureRateChangeRate || 0
        },
        frequency: {
          value: numberFormatter(serviceDeploymentListInfo.frequency),
          change: serviceDeploymentListInfo.frequencyChangeRate || 0
        },
        data: [
          {
            name: getString('success'),
            data: success,
            color: '#3dc7f6'
          },
          {
            name: getString('failed'),
            data: failed,
            color: '#ee5f54'
          }
        ]
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const DeploymentWidgetContainer: React.FC = ({ children }) => {
    return (
      <Card className={css.card}>
        <Layout.Vertical height={'100%'}>{children}</Layout.Vertical>
      </Card>
    )
  }

  if (
    loading ||
    error ||
    !serviceDeploymentsInfo?.data ||
    (serviceDeploymentsInfo.data.totalDeployments === 0 && serviceDeploymentsInfo.data.totalDeploymentsChangeRate === 0)
  ) {
    const component = (() => {
      if (loading) {
        return (
          <Container data-test="deploymentsWidgetLoader">
            <PageSpinner />
          </Container>
        )
      }
      if (error) {
        return (
          <Container data-test="deploymentsWidgetError" height={'100%'}>
            <PageError onClick={() => refetch()} />
          </Container>
        )
      }
      return (
        <Layout.Vertical height="100%" flex={{ align: 'center-center' }} data-test="deploymentsWidgetEmpty">
          <img width="150" height="100" src={DeploymentsEmptyState} style={{ alignSelf: 'center' }} />
          <Text color={Color.GREY_400} margin={{ top: 'medium' }}>
            {getString('cd.serviceDashboard.noDeployments', {
              timeRange: timeRange?.label
            })}
          </Text>
        </Layout.Vertical>
      )
    })()
    return <DeploymentWidgetContainer>{component}</DeploymentWidgetContainer>
  }

  const { deployments, failureRate, frequency, data } = parseData(serviceDeploymentsInfo.data)

  const customChartOptions: Highcharts.Options = {
    chart: { height: 170, spacing: [25, 0, 25, 0] },
    legend: { padding: 0 },
    xAxis: {
      allowDecimals: false,
      labels: {
        enabled: false
      }
    },
    yAxis: {
      max: Math.max(
        ...(serviceDeploymentsInfo?.data?.serviceDeploymentList || []).map(
          deployment => (deployment.deployments?.failure || 0) + (deployment.deployments?.success || 0)
        )
      )
    },
    tooltip: {
      useHTML: true,
      borderWidth: 0,
      padding: 0,
      formatter: function () {
        return '<div id="deployments-widget-tooltip" style="width: 300px"></div>'
      }
    },
    plotOptions: {
      area: {
        pointStart: 0,
        stacking: 'normal',
        animation: false,
        point: {
          events: {
            mouseOver: function () {
              const el = document.getElementById('deployments-widget-tooltip')
              if (el) {
                ReactDOM.render(<DeploymentsTooltip {...this} />, el)
              }
            }
          }
        }
      }
    }
  }

  const isDeploymentBoost = deployments.change === INVALID_CHANGE_RATE
  return (
    <DeploymentWidgetContainer>
      <Container data-test="deploymentsWidgetContent">
        <Text font={{ weight: 'semi-bold' }} color={Color.GREY_600}>
          {getString('deploymentsText')}
        </Text>
        <Layout.Horizontal flex={{ alignItems: 'flex-end', justifyContent: 'flex-start' }}>
          <Layout.Horizontal width={240}>
            <Ticker
              value={
                isDeploymentBoost ? (
                  <></>
                ) : (
                  <TickerValue
                    value={deployments.change}
                    color={isDeploymentBoost || deployments.change > 0 ? Color.GREEN_600 : Color.RED_500}
                  />
                )
              }
              decreaseMode={!isDeploymentBoost && deployments.change < 0}
              boost={isDeploymentBoost}
              color={isDeploymentBoost || deployments.change > 0 ? Color.GREEN_600 : Color.RED_500}
              verticalAlign={TickerVerticalAlignment.CENTER}
              size={isDeploymentBoost ? 10 : 6}
            >
              <Layout.Vertical>
                <Text color={Color.BLACK} font={{ weight: 'semi-bold' }} className={css.text} data-test="tickerText">
                  {deployments.value}
                </Text>
                <Text font={{ size: 'xsmall', weight: 'semi-bold' }} color={Color.GREY_400}>
                  {getString('cd.serviceDashboard.in', {
                    timeRange: timeRange?.label
                  })}
                </Text>
              </Layout.Vertical>
            </Ticker>
          </Layout.Horizontal>
          {[
            { ...failureRate, name: getString('common.failureRate') },
            { ...frequency, name: getString('cd.serviceDashboard.frequency') }
          ].map((item, index) => {
            const colors = index ? [Color.GREEN_600, Color.RED_500] : [Color.RED_500, Color.GREEN_600]
            const isBoost = item.change === INVALID_CHANGE_RATE
            return (
              <Layout.Vertical
                padding={'small'}
                margin={{ right: 'medium' }}
                className={css.tickerCard}
                key={item.name}
              >
                <Text
                  font={{ size: 'xsmall', weight: 'semi-bold' }}
                  margin={{ bottom: 'small' }}
                  color={Color.GREY_600}
                >
                  {item.name}
                </Text>
                <Ticker
                  value={
                    isBoost ? (
                      <></>
                    ) : (
                      <TickerValue value={item.change} color={isBoost || item.change > 0 ? colors[0] : colors[1]} />
                    )
                  }
                  decreaseMode={!isBoost && item.change < 0}
                  boost={isBoost}
                  size={isBoost ? 10 : 6}
                  color={isBoost || item.change > 0 ? colors[0] : colors[1]}
                  tickerContainerStyles={css.tickerContainerStyles}
                  verticalAlign={TickerVerticalAlignment.CENTER}
                >
                  <Text
                    color={Color.BLACK}
                    font={{ weight: 'semi-bold', size: 'medium' }}
                    margin={{ right: 'xsmall' }}
                    data-test="tickerText"
                  >
                    {item.value}
                  </Text>
                </Ticker>
              </Layout.Vertical>
            )
          })}
        </Layout.Horizontal>
        <TimeSeriesAreaChart seriesData={data} customChartOptions={customChartOptions} />
      </Container>
    </DeploymentWidgetContainer>
  )
}
