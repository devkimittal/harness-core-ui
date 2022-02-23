/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Layout, Text, Color, FontVariation, Card, Popover, Container } from '@wings-software/uicore'
import { Position, Menu, MenuItem } from '@blueprintjs/core'

import { TimeRange, TimeRangeType, TimeRangeValue } from '@ce/types'
import { GET_DATE_RANGE } from '@ce/utils/momentUtils'
import { Page } from '@common/exports'
import {
  NodeRecommendationDto,
  RecommendationItemDto,
  RecommendationOverviewStats,
  ResourceType,
  useFetchRecommendationQuery
} from 'services/ce/services'
import routes from '@common/RouteDefinitions'
import { useStrings } from 'framework/strings'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import { ViewTimeRange } from '@ce/components/RecommendationDetails/constants'
import NodeRecommendationDetails from '@ce/components/NodeRecommendation/NodeRecommendation'
import css from './NodeRecommendationDetailsPage.module.scss'

interface Params {
  recommendation: string
  recommendationName: string
  accountId: string
}

export interface IState {
  sumCpu: number
  sumMem: number
  maxNodes: number
  minNodes: number
}

export enum ACTIONS {
  'CPUS',
  'MEM',
  'MIN_NODES',
  'MAX_NODES'
}

export interface Action {
  type: ACTIONS
  data: number
}

const NodeRecommendationDetailsPage = () => {
  const { getString } = useStrings()
  const { recommendation, accountId, recommendationName } = useParams<Params>()
  const [timeRange, setTimeRange] = useState<TimeRangeValue>({ value: TimeRangeType.LAST_7, label: TimeRange.LAST_7 })
  const timeRangeFilter = GET_DATE_RANGE[timeRange.value]

  const breadCrumbLinks = useMemo(() => {
    return [
      { url: routes.toCERecommendations({ accountId }), label: getString('ce.recommendation.sideNavText') },
      { url: '', label: recommendationName }
    ]
  }, [])

  const [{ data, fetching }] = useFetchRecommendationQuery({
    variables: {
      id: recommendation,
      resourceType: ResourceType.NodePool,
      startTime: timeRangeFilter[0],
      endTime: timeRangeFilter[1]
    }
  })

  const nodePoolData =
    (data?.recommendationsV2?.items?.length && data?.recommendationsV2?.items[0]) || ({} as RecommendationItemDto)

  if (fetching) {
    return <Page.Spinner />
  }

  const recommendationStats = (data?.recommendationStatsV2 || {}) as RecommendationOverviewStats
  const recommendationDetails = (data?.recommendationDetails || {}) as NodeRecommendationDto

  return (
    <>
      <Page.Header
        title={
          <Layout.Horizontal spacing="small">
            <Text icon="gcp" font={{ variation: FontVariation.BODY1 }}>
              {getString('ce.recommendation.detailsPage.headerText')}
            </Text>
            <Text font={{ variation: FontVariation.H4 }} style={{ verticalAlign: 'middle' }}>
              {nodePoolData.resourceName}
            </Text>
          </Layout.Horizontal>
        }
        breadcrumbs={<NGBreadcrumbs className={css.breadCrumb} links={breadCrumbLinks} />}
      />
      <Page.Body>
        <Card style={{ width: '100%' }}>
          <Layout.Horizontal spacing="small">
            <Text color={Color.GREY_800} font={{ weight: 'semi-bold' }}>
              {getString('ce.recommendation.detailsPage.utilizationDataComputation')}
            </Text>
            <Popover
              position={Position.BOTTOM_LEFT}
              modifiers={{
                arrow: { enabled: false },
                flip: { enabled: true },
                keepTogether: { enabled: true },
                preventOverflow: { enabled: true }
              }}
              content={
                <Menu>
                  {ViewTimeRange.map(viewTimeRange => (
                    <MenuItem
                      onClick={() => {
                        setTimeRange(viewTimeRange)
                      }}
                      text={viewTimeRange.label}
                      key={viewTimeRange.value}
                    />
                  ))}
                </Menu>
              }
            >
              <Text
                color="primary5"
                rightIcon="caret-down"
                rightIconProps={{
                  color: 'primary5'
                }}
                className={css.actionText}
              >
                {timeRange?.label}
              </Text>
            </Popover>
          </Layout.Horizontal>
        </Card>
        <Container className={css.body}>
          <NodeRecommendationDetails
            recommendationStats={recommendationStats}
            recommendationDetails={recommendationDetails}
            timeRange={timeRange}
            recommendationName={recommendationName}
          />
        </Container>
      </Page.Body>
    </>
  )
}

export default NodeRecommendationDetailsPage
