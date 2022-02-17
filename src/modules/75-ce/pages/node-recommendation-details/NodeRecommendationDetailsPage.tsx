/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  Layout,
  Text,
  Color,
  FontVariation,
  Card,
  Popover,
  Container,
  Tabs,
  Button,
  ButtonVariation
} from '@wings-software/uicore'
import { Position, Menu, MenuItem, Dialog } from '@blueprintjs/core'
import { useModalHook } from '@harness/use-modal'

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
import NodeRecommendation from '@ce/components/NodeRecommendation/NodeRecommendation'
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

  const [showModal, hideModal] = useModalHook(() => {
    return (
      <Dialog isOpen={true} enforceFocus={false} onClose={hideModal} style={{ width: 1175, height: 640 }}>
        <Layout.Vertical spacing="medium" padding="xxlarge">
          <Text font={{ variation: FontVariation.H4 }} icon="gcp">
            {`${recommendationName}: Preferred Instance Families`}
          </Text>
          <Text>
            You can specify Preferred Instance Families for Compute Optimised or Storage Optimised Performance. The
            alogrithm will create a recommendation out of this pool of preferred instances that is most economical to
            you.
          </Text>
          <Tabs
            id={'horizontalTabs'}
            defaultSelectedTabId={'tab1'}
            tabList={[
              { id: 'tab1', title: 'Compute Optimized', panel: <div>Tab 1 content</div> },
              { id: 'tab2', title: 'Storage Optimized', panel: <div>Tab 2 content</div> }
            ]}
          />
          <Layout.Horizontal spacing="medium">
            <Button variation={ButtonVariation.PRIMARY}>Save Preferences</Button>
            <Button variation={ButtonVariation.TERTIARY}>Cancel</Button>
          </Layout.Horizontal>
        </Layout.Vertical>
      </Dialog>
    )
  }, [])

  // const goToWNodePoolDetails = () => {
  //   if (nodePoolData) {
  //     trackEvent(USER_JOURNEY_EVENTS.RECOMMENDATION_VIEW_MORE_CLICK, {})
  //     nodePoolData.clusterName &&
  //       nodePoolData.resourceName &&
  //       nodePoolData.namespace &&
  //       history.push(
  //         routes.toCERecommendationDetails({
  //           accountId,
  //           recommendation,
  //           recommendationName,
  //           clusterName: nodePoolData.clusterName,
  //           namespace: nodePoolData.namespace,
  //           workloadName: nodePoolData.resourceName
  //         })
  //       )
  //   }

  if (fetching) {
    return <Page.Spinner />
  }

  const recommendationStats = (data?.recommendationStatsV2 || {}) as RecommendationOverviewStats
  const recommendationDetails = (data?.recommendationDetails || {}) as NodeRecommendationDto

  return (
    <>
      <Page.Header
        title={
          <Layout.Horizontal style={{ alignItems: 'baseline' }} spacing="small">
            <Text icon="gcp" font={{ variation: FontVariation.BODY1 }}>
              Recommendations for
            </Text>
            <Text font={{ variation: FontVariation.H4 }}>{nodePoolData.resourceName}</Text>
          </Layout.Horizontal>
        }
        breadcrumbs={<NGBreadcrumbs className={css.breadCrumb} links={breadCrumbLinks} />}
      />
      <Page.Body>
        <Card style={{ width: '100%' }}>
          <Layout.Horizontal spacing="medium">
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
          <NodeRecommendation
            recommendationStats={recommendationStats}
            recommendationDetails={recommendationDetails}
            timeRange={timeRange}
            showModal={showModal}
          />
        </Container>
      </Page.Body>
    </>
  )
}

export default NodeRecommendationDetailsPage
