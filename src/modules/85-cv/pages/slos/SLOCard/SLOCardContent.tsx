/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo, useState } from 'react'
import { Layout, Container, Heading, PillToggle, PillToggleProps, Text } from '@wings-software/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { PageSpinner } from '@common/components'
import { useStrings } from 'framework/strings'
import { SLOTargetChart } from '@cv/pages/slos/components/SLOTargetChart/SLOTargetChart'
import { getDataPointsWithMinMaxXLimit } from '@cv/pages/slos/components/SLOTargetChart/SLOTargetChart.utils'
import ChangeTimeline from '@cv/components/ChangeTimeline/ChangeTimeline'
import ErrorBudgetGauge from './ErrorBudgetGauge'
import { getErrorBudgetGaugeOptions, getSLOAndErrorBudgetGraphOptions } from '../CVSLOListingPage.utils'
import { SLOCardContentProps, SLOCardToggleViews } from '../CVSLOsListingPage.types'
import css from '../CVSLOsListingPage.module.scss'

const SLOCardContent: React.FC<SLOCardContentProps> = ({ serviceLevelObjective }) => {
  const { getString } = useStrings()
  const { sloPerformanceTrend, sloTargetPercentage, errorBudgetBurndown, monitoredServiceIdentifier } =
    serviceLevelObjective

  const [toggle, setToggle] = useState(SLOCardToggleViews.SLO)
  const startTime = sloPerformanceTrend[0]?.timestamp
  const endTime = sloPerformanceTrend[sloPerformanceTrend.length - 1]?.timestamp

  const toggleProps: PillToggleProps<SLOCardToggleViews> = {
    options: [
      {
        label: getString('cv.SLO'),
        value: SLOCardToggleViews.SLO
      },
      {
        label: getString('cv.errorBudget'),
        value: SLOCardToggleViews.ERROR_BUDGET
      }
    ],
    onChange: view => setToggle(view),
    selectedView: toggle,
    className: css.pillToggle
  }

  const sloPerformanceTrendData = useMemo(
    () => getDataPointsWithMinMaxXLimit(sloPerformanceTrend),
    [sloPerformanceTrend]
  )
  const errorBudgetBurndownData = useMemo(
    () => getDataPointsWithMinMaxXLimit(errorBudgetBurndown),
    [errorBudgetBurndown]
  )

  const renderChangeTimelineSummary = (): JSX.Element => {
    if (startTime && endTime) {
      return (
        <ChangeTimeline
          monitoredServiceIdentifier={monitoredServiceIdentifier}
          startTime={startTime}
          endTime={endTime}
          hideTimeline
        />
      )
    } else {
      return <></>
    }
  }

  return (
    <Layout.Vertical
      spacing="large"
      margin={{ top: 'medium' }}
      padding={{ top: 'medium' }}
      border={{ color: Color.GREY_100, top: true }}
    >
      <Container flex={{ justifyContent: 'center' }}>
        <PillToggle {...toggleProps} />
      </Container>

      <Container style={{ position: 'relative' }}>
        {toggle === SLOCardToggleViews.SLO && (
          <>
            <Container flex>
              <Heading level={2} font={{ variation: FontVariation.FORM_HELP }}>
                {getString('cv.SLOPerformanceTrend')}
              </Heading>
              {serviceLevelObjective.recalculatingSLI && (
                <PageSpinner className={css.sloCardSpinner} message={getString('cv.sloRecalculationInProgress')} />
              )}
            </Container>
            <Layout.Horizontal spacing="medium">
              <Layout.Vertical spacing="medium" margin={{ top: 'large' }}>
                <Container width={120} background={Color.GREY_100} padding="small" className={css.sloGlanceCard}>
                  <Text font={{ variation: FontVariation.FORM_LABEL }}>{getString('cv.SLO')}</Text>
                  <Heading level={2} color={Color.GREY_800} font={{ variation: FontVariation.H4 }}>
                    {(Number(sloTargetPercentage) || 0).toFixed(2)}%
                  </Heading>
                </Container>
                <Container width={120} background={Color.GREY_100} padding="small" className={css.sloGlanceCard}>
                  <Text font={{ variation: FontVariation.FORM_LABEL }}>{getString('cv.slos.sli')}</Text>
                  <Heading inline level={2} color={Color.GREY_800} font={{ variation: FontVariation.H4 }}>
                    {sloPerformanceTrend[sloPerformanceTrend.length - 1]?.value?.toFixed(2) ?? 0}%
                  </Heading>
                </Container>
              </Layout.Vertical>
              <Container style={{ position: 'relative' }} className={css.flexGrowOne}>
                <SLOTargetChart
                  dataPoints={sloPerformanceTrendData.dataPoints}
                  customChartOptions={getSLOAndErrorBudgetGraphOptions({
                    type: SLOCardToggleViews.SLO,
                    serviceLevelObjective,
                    minXLimit: sloPerformanceTrendData.minXLimit,
                    maxXLimit: sloPerformanceTrendData.maxXLimit
                  })}
                />
                {renderChangeTimelineSummary()}
              </Container>
            </Layout.Horizontal>
          </>
        )}
        {toggle === SLOCardToggleViews.ERROR_BUDGET && (
          <Layout.Horizontal spacing="medium">
            {serviceLevelObjective.recalculatingSLI && (
              <PageSpinner
                className={css.sloCardSpinner}
                message={getString('cv.errorBudgetRecalculationInProgress')}
              />
            )}
            <Container width={185} height={200} className={css.errorBudgetGaugeContainer}>
              <Heading font={{ variation: FontVariation.FORM_HELP }}>{getString('cv.errorBudgetRemaining')}</Heading>
              <ErrorBudgetGauge customChartOptions={getErrorBudgetGaugeOptions(serviceLevelObjective)} />
              <Text font={{ variation: FontVariation.SMALL }} className={css.errorBudgetRemaining} width={175}>
                {serviceLevelObjective.errorBudgetRemaining}
                <span style={{ display: 'block' }}>{getString('cv.minutesRemaining')}</span>
              </Text>
            </Container>
            <Container className={css.flexGrowOne}>
              <Heading font={{ variation: FontVariation.FORM_HELP }}>{getString('cv.errorBudgetBurnDown')}</Heading>
              <SLOTargetChart
                dataPoints={errorBudgetBurndownData.dataPoints}
                customChartOptions={getSLOAndErrorBudgetGraphOptions({
                  serviceLevelObjective,
                  type: SLOCardToggleViews.ERROR_BUDGET,
                  minXLimit: errorBudgetBurndownData.minXLimit,
                  maxXLimit: errorBudgetBurndownData.maxXLimit
                })}
              />
              {renderChangeTimelineSummary()}
            </Container>
          </Layout.Horizontal>
        )}
      </Container>
    </Layout.Vertical>
  )
}

export default SLOCardContent
