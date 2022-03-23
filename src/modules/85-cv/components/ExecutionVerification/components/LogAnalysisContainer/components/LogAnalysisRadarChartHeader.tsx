import React from 'react'
import { Icon, Color, Text, Layout, FontVariation, Container } from '@harness/uicore'
import { getEventTypeChartColor } from '@cv/utils/CommonUtils'
import { useStrings } from 'framework/strings'
import css from '../LogAnalysis.module.scss'

const mockCounts = [
  {
    displayName: 'Baseline',
    count: 3,
    type: 'BASELINE'
  },
  {
    displayName: 'Known',
    count: 4,
    type: 'KNOWN'
  },
  {
    displayName: 'Frequency',
    count: 6,
    type: 'FREQUENCY'
  },
  {
    displayName: 'Unknown',
    count: 2,
    type: 'UNKNOWN'
  }
]

export default function LogAnalysisRadarChartHeader() {
  const { getString } = useStrings()
  return (
    <Container margin={{ bottom: 'large' }}>
      <Layout.Horizontal margin={{ bottom: 'small' }}>
        {mockCounts.map(detail => {
          return (
            <Layout.Horizontal style={{ alignItems: 'center' }} margin={{ right: 'small' }} key={detail.type}>
              <span
                className={css.radarChartTypeIndicator}
                style={{ background: getEventTypeChartColor(detail.type) }}
              ></span>
              <Text font={{ variation: FontVariation.SMALL }}>
                {detail.displayName} ({detail.count})
              </Text>
            </Layout.Horizontal>
          )
        })}
      </Layout.Horizontal>
      <Layout.Horizontal>
        <Icon margin={{ right: 'small' }} name="main-issue" color={Color.PRIMARY_7} />
        <Text color={Color.GREY_600} font={{ variation: FontVariation.SMALL }}>
          {getString('cv.logs.radarChartInfo')}
        </Text>
      </Layout.Horizontal>
    </Container>
  )
}
