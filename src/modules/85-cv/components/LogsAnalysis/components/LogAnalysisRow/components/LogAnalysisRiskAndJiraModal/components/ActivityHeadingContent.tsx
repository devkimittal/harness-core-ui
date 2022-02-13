import React, { useMemo } from 'react'
import { Container, Text, Color, Layout } from '@wings-software/uicore'
import HighchartsReact from 'highcharts-react-official'
import Highcharts from 'highcharts'
import { useStrings } from 'framework/strings'
import { getEventTypeColor, getEventTypeLightColor } from '@cv/utils/CommonUtils'
import type { ActivityHeadingContentProps } from '../LogAnalysisRiskAndJiraModal.types'
import { getChartsConfigForDrawer } from '../LogAnalysisRiskAndJiraModal.utils'
import css from '../LogAnalysisRiskAndJiraModal.module.scss'
import logRowStyle from '../../../LogAnalysisRow.module.scss'

export function ActivityHeadingContent(props: ActivityHeadingContentProps): JSX.Element {
  const { count, trendData, activityType } = props
  const { getString } = useStrings()

  const chartsConfig = useMemo(
    () => getChartsConfigForDrawer(trendData?.series, trendData?.series[0]?.data.length, getString),
    [trendData]
  )

  return (
    <>
      <Container className={css.activityContainer}>
        <Layout.Horizontal className={css.firstRow}>
          <Container>
            <Text>{getString('pipeline.verification.logs.eventType')}</Text>
            <Text
              className={logRowStyle.eventTypeTag}
              font="normal"
              style={{
                color: getEventTypeColor(activityType),
                background: getEventTypeLightColor(activityType)
              }}
            >
              {activityType}
            </Text>
          </Container>
          <Container>
            <Text>{getString('instanceFieldOptions.instanceHolder')}</Text>
            <Text color={Color.BLACK}>{count}</Text>
          </Container>
          <Container>
            <Text>{getString('pipeline.verification.logs.firstOccurence')}</Text>
            <Text color={Color.BLACK}>09/01/2022 04:30:45 PM</Text>
          </Container>
          <Container>
            <Text>{getString('pipeline.verification.logs.lastKnownOccurence')}</Text>
            <Text color={Color.BLACK}>09/01/2022 04:57:23 PM</Text>
          </Container>
        </Layout.Horizontal>
      </Container>
      <Container className={css.chartContainer}>
        <HighchartsReact highchart={Highcharts} options={chartsConfig} />
      </Container>
    </>
  )
}
