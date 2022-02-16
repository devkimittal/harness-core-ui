import React from 'react'
import { Color, Container, Icon, NoDataCard } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import type { LogAnalysisRadarChartProps } from './LogAnalysisRadarChart.types'
import styles from '../LogAnalysis.module.scss'

const LogAnalysisRadarChart: React.FC<LogAnalysisRadarChartProps> = ({ clusterChartLoading, clusterChartData }) => {
  const { getString } = useStrings()
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
    return <h1>Chart</h1>
  }
}

export default LogAnalysisRadarChart
