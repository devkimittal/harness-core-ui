/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, Layout, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import type { NodepoolTimeRangeValue } from '@ce/types'

import resourceUtilizationCpu from './images/resource-utilization-cpu.svg'
import resourceUtilizationMem from './images/resource-utilization-memory.svg'
import resourceUtilizationNodeCount from './images/resource-utilization-node-count.svg'

import css from './NodeRecommendation.module.scss'

interface ResourceUtilizationChartsProps {
  sumCpu: number
  sumMem: number
  minNodes: number
  timeRange: NodepoolTimeRangeValue
}

const ResourceUtilizationCharts = (props: ResourceUtilizationChartsProps) => {
  const { sumCpu, sumMem, minNodes } = props
  const { getString } = useStrings()

  return (
    <>
      <Layout.Horizontal flex={{ justifyContent: 'space-between' }}>
        <Container>
          <Text font={{ variation: FontVariation.H6 }} tooltipProps={{ dataTooltipId: 'resourceUtilisation' }}>
            {getString('ce.nodeRecommendation.resourceUtilInLast', { timeRange: props.timeRange.label.toLowerCase() })}
          </Text>
        </Container>
      </Layout.Horizontal>
      <Layout.Horizontal flex className={css.resourceUtilizationCharts}>
        <Layout.Vertical height="100%" flex className={css.chartContainer}>
          <Container className={css.chartLabel}>
            <Text inline font={{ variation: FontVariation.SMALL }}>
              {getString('delegate.delegateCPU')}
            </Text>
            <Text inline font={{ variation: FontVariation.H6 }} color={Color.GREY_400}>{` ${sumCpu}vCPU`}</Text>
          </Container>
          <img src={resourceUtilizationCpu} />
        </Layout.Vertical>
        <Layout.Vertical height="100%" flex className={css.chartContainer}>
          <Container className={css.chartLabel}>
            <Text inline font={{ variation: FontVariation.SMALL }}>
              {getString('ce.recommendation.recommendationChart.memoryLabelRegular')}
            </Text>
            <Text inline font={{ variation: FontVariation.H6 }} color={Color.GREY_400}>{` ${sumMem}GiB`}</Text>
          </Container>
          <img src={resourceUtilizationMem} />
        </Layout.Vertical>
        <Layout.Vertical height="100%" flex className={css.chartContainer}>
          <Container className={css.chartLabel}>
            <Text inline font={{ variation: FontVariation.SMALL }}>
              {getString('ce.nodeRecommendation.nodeCount')}
            </Text>
            <Text inline font={{ variation: FontVariation.H6 }} color={Color.GREY_400}>
              {` ${minNodes}`}
            </Text>
          </Container>
          <img src={resourceUtilizationNodeCount} />
        </Layout.Vertical>
      </Layout.Horizontal>
    </>
  )
}

export default ResourceUtilizationCharts
