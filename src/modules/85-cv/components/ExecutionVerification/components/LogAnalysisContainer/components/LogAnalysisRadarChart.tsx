import React, { useCallback, useEffect, useState } from 'react'
import { Color, Container, Icon, NoDataCard } from '@wings-software/uicore'
import HighchartsReact from 'highcharts-react-official'
import Highcharts from 'highcharts'
import { useStrings } from 'framework/strings'
import type { LogAnalysisRadarChartProps, MinMaxAngleState } from './LogAnalysisRadarChart.types'
import MultiRangeSlider from './MinMaxSlider'
import LogAnalysisRadarChartHeader from './LogAnalysisRadarChartHeader'
import getLogAnalysisSpiderChartOptions, { getRadarChartSeries } from './LogAnalysisRadarChart.utils'
import styles from '../LogAnalysis.module.scss'

const mockChartData = [
  {
    label: 0,
    text: '* Connection #0 to host localhost left intact',
    hostName: 'dummy',
    risk: 'HEALTHY',
    angle: 60,
    radius: 'KNOWN',
    clusterType: 'KNOWN_EVENT'
  },
  {
    label: 0,
    text: 'Some message',
    hostName: 'dummy 2',
    risk: 'HEALTHY',
    angle: 90,
    radius: 'UNKNOWN',
    clusterType: 'UNKNOWN_EVENT'
  },
  {
    label: 0,
    text: 'Some message',
    hostName: 'dummy 3',
    risk: 'HEALTHY',
    angle: 240,
    radius: 'UNEXPECTED',
    clusterType: 'UNEXPECTED'
  },
  {
    label: 0,
    text: 'Some message',
    hostName: 'dummy 3',
    risk: 'HEALTHY',
    angle: 330,
    radius: 'KNOWN',
    clusterType: 'KNOWN_EVENT'
  },
  {
    label: 0,
    text: 'Some message',
    hostName: 'dummy 3',
    risk: 'HEALTHY',
    angle: 10,
    radius: 'KNOWN',
    clusterType: 'KNOWN_EVENT'
  },
  {
    label: 0,
    text: 'Some message',
    hostName: 'dummy 3',
    risk: 'HEALTHY',
    angle: 10,
    radius: 'KNOWN',
    clusterType: 'KNOWN_EVENT'
  },
  {
    label: 0,
    text: 'Some message',
    hostName: 'dummy 3',
    risk: 'HEALTHY',
    angle: 72,
    radius: 'KNOWN',
    clusterType: 'KNOWN_EVENT'
  },
  {
    label: 0,
    text: 'Some message',
    hostName: 'dummy 3',
    risk: 'HEALTHY',
    angle: 10,
    radius: 'KNOWN',
    clusterType: 'KNOWN_EVENT'
  },
  {
    label: 0,
    text: 'Some message',
    hostName: 'dummy 3',
    risk: 'HEALTHY',
    angle: 85,
    radius: 'KNOWN',
    clusterType: 'KNOWN_EVENT'
  },
  {
    label: 0,
    text: 'Some message',
    hostName: 'dummy 3',
    risk: 'HEALTHY',
    angle: 86,
    radius: 'KNOWN',
    clusterType: 'KNOWN_EVENT'
  },
  {
    label: 0,
    text: 'Some message',
    hostName: 'dummy 3',
    risk: 'HEALTHY',
    angle: 64,
    radius: 'KNOWN',
    clusterType: 'KNOWN_EVENT'
  },
  {
    label: 0,
    text: 'Some message',
    hostName: 'dummy 3',
    risk: 'HEALTHY',
    angle: 89,
    radius: 'KNOWN',
    clusterType: 'KNOWN_EVENT'
  },
  {
    label: 0,
    text: 'Some message',
    hostName: 'dummy 3',
    risk: 'HEALTHY',
    angle: 85,
    radius: 'KNOWN',
    clusterType: 'KNOWN_EVENT'
  },
  {
    label: 0,
    text: 'Some message',
    hostName: 'dummy 3',
    risk: 'HEALTHY',
    angle: 77,
    radius: 'KNOWN',
    clusterType: 'KNOWN_EVENT'
  },
  {
    label: 0,
    text: 'Some message',
    hostName: 'dummy 3',
    risk: 'HEALTHY',
    angle: 66,
    radius: 'KNOWN',
    clusterType: 'KNOWN_EVENT'
  },
  {
    label: 0,
    text: 'Some message',
    hostName: 'dummy 3',
    risk: 'HEALTHY',
    angle: 63,
    radius: 'KNOWN',
    clusterType: 'KNOWN_EVENT'
  },
  {
    label: 0,
    text: 'Some message',
    hostName: 'dummy 3',
    risk: 'HEALTHY',
    angle: 90,
    radius: 'KNOWN',
    clusterType: 'KNOWN_EVENT'
  },
  {
    label: 0,
    text: 'Some message',
    hostName: 'dummy 3',
    risk: 'HEALTHY',
    angle: 88,
    radius: 'KNOWN',
    clusterType: 'KNOWN_EVENT'
  },
  {
    label: 0,
    text: 'Some message',
    hostName: 'dummy 3',
    risk: 'HEALTHY',
    angle: 87,
    radius: 'KNOWN',
    clusterType: 'KNOWN_EVENT'
  },
  {
    label: 0,
    text: 'Some message',
    hostName: 'dummy 3',
    risk: 'HEALTHY',
    angle: 85,
    radius: 'KNOWN',
    clusterType: 'KNOWN_EVENT'
  },
  {
    label: 0,
    text: 'Some message',
    hostName: 'dummy 3',
    risk: 'HEALTHY',
    angle: 82,
    radius: 'KNOWN',
    clusterType: 'KNOWN_EVENT'
  },
  {
    label: 0,
    text: 'Some message',
    hostName: 'dummy 3',
    risk: 'HEALTHY',
    angle: 80,
    radius: 'KNOWN',
    clusterType: 'KNOWN_EVENT'
  },
  {
    label: 0,
    text: 'Some message',
    hostName: 'dummy 3',
    risk: 'HEALTHY',
    angle: 79,
    radius: 'KNOWN',
    clusterType: 'KNOWN_EVENT'
  },
  {
    label: 0,
    text: 'Some message',
    hostName: 'dummy 3',
    risk: 'HEALTHY',
    angle: 78,
    radius: 'KNOWN',
    clusterType: 'KNOWN_EVENT'
  },
  {
    label: 0,
    text: 'Some message',
    hostName: 'dummy 3',
    risk: 'HEALTHY',
    angle: 74,
    radius: 'KNOWN',
    clusterType: 'KNOWN_EVENT'
  },
  {
    label: 0,
    text: 'Some message',
    hostName: 'dummy 3',
    risk: 'HEALTHY',
    angle: 71,
    radius: 'KNOWN',
    clusterType: 'KNOWN_EVENT'
  },
  {
    label: 0,
    text: 'Some message',
    hostName: 'dummy 3',
    risk: 'HEALTHY',
    angle: 67,
    radius: 'KNOWN',
    clusterType: 'KNOWN_EVENT'
  },
  {
    label: 0,
    text: 'Some message',
    hostName: 'dummy 3',
    risk: 'HEALTHY',
    angle: 64,
    radius: 'KNOWN',
    clusterType: 'KNOWN_EVENT'
  },
  {
    label: 0,
    text: 'Some message',
    hostName: 'dummy 3',
    risk: 'HEALTHY',
    angle: 63,
    radius: 'KNOWN',
    clusterType: 'KNOWN_EVENT'
  },
  {
    label: 0,
    text: 'Some message',
    hostName: 'dummy 3',
    risk: 'HEALTHY',
    angle: 62,
    radius: 'KNOWN',
    clusterType: 'KNOWN_EVENT'
  },
  {
    label: 0,
    text: 'Some message',
    hostName: 'dummy 3',
    risk: 'HEALTHY',
    angle: 61,
    radius: 'KNOWN',
    clusterType: 'KNOWN_EVENT'
  },
  {
    label: 0,
    text: 'Some message',
    hostName: 'dummy 3',
    risk: 'HEALTHY',
    angle: 60,
    radius: 'KNOWN',
    clusterType: 'KNOWN_EVENT'
  }
]

const LogAnalysisRadarChart: React.FC<LogAnalysisRadarChartProps> = ({ clusterChartLoading, clusterChartData }) => {
  const [minMaxAngle, setMinMaxAngle] = useState({ min: 0, max: 360 })

  const radarChartSeries = getRadarChartSeries(mockChartData)

  const [chartData, setChartData] = useState(() => radarChartSeries)

  const { getString } = useStrings()

  const handleMinMaxChange = useCallback((updatedAngle: MinMaxAngleState): void => {
    setMinMaxAngle(updatedAngle)
  }, [])

  useEffect(() => {
    setChartData(() => {
      return radarChartSeries?.filter(data => data.data[0].x >= minMaxAngle.min && data.data[0].x <= minMaxAngle.max)
    })
  }, [minMaxAngle])

  if (clusterChartLoading) {
    return (
      <Container className={styles.loading}>
        <Icon name="steps-spinner" color={Color.GREY_400} size={30} />
      </Container>
    )
  } else if (!clusterChartData?.resource?.length) {
    return (
      <Container className={styles.noData}>
        <NoDataCard message={getString('pipeline.verification.logs.noAnalysis')} icon="warning-sign" />
      </Container>
    )
  } else {
    // return <ClusterChart data={clusterChartData?.resource || []} />
    return (
      <>
        <LogAnalysisRadarChartHeader />
        <HighchartsReact highchart={Highcharts} options={getLogAnalysisSpiderChartOptions(chartData, minMaxAngle)} />
        <MultiRangeSlider min={0} max={360} onChange={handleMinMaxChange} />
      </>
    )
  }
}

export default LogAnalysisRadarChart
