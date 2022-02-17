/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useMemo, useReducer, useState } from 'react'
import {
  Container,
  Layout,
  Text,
  Color,
  FontVariation,
  Card,
  Button,
  Checkbox,
  ButtonVariation,
  ButtonSize,
  Icon,
  Tabs
} from '@wings-software/uicore'
import { Dialog } from '@blueprintjs/core/lib/esm/components'
import { useModalHook } from '@harness/use-modal'
import moment from 'moment'
import { isEqual } from 'lodash-es'
import pDebounce from 'p-debounce'

import useDidMountEffect from '@ce/common/useDidMountEffect'

import type { TimeRangeValue } from '@ce/types'
import { GET_DATE_RANGE } from '@ce/utils/momentUtils'
import type { NodeRecommendationDto, RecommendationOverviewStats } from 'services/ce/services'
import { useStrings } from 'framework/strings'
import Recommender from '@ce/components/NodeRecommendation/Recommender'
import formatCost from '@ce/utils/formatCost'
import {
  RecommendationDetailsSavingsCard,
  RecommendationDetailsSpendCard
} from '@ce/components/RecommendationDetailsSummaryCards/RecommendationDetailsSummaryCards'
import TuneNodeRecommendationCard from '@ce/components/NodeRecommendation/TuneNodeRecommendationCard'
import { RecommendationResponse, RecommendClusterRequest, useRecommendCluster } from 'services/ce/recommenderService'
import { useGetSeries } from 'services/ce/publicPricingService'
import { InstanceFamiliesModalTab } from '../InstanceFamiliesModalTab/InstanceFamiliesModalTab'
import resourceUtilization from './images/resource-utilization.svg'
// import css from './NodeRecommendation.module.scss'

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

const reducer = (state: IState, action: Action) => {
  const { type, data } = action

  switch (type) {
    case ACTIONS.CPUS:
      return { ...state, sumCpu: data }
    case ACTIONS.MEM:
      return { ...state, sumMem: data }
    case ACTIONS.MIN_NODES:
      return { ...state, minNodes: data }
    case ACTIONS.MAX_NODES:
      return { ...state, maxNodes: data }
    default:
      return state
  }
}

interface NodeRecommendationDetailsProps {
  recommendationStats: RecommendationOverviewStats
  recommendationDetails: NodeRecommendationDto
  timeRange: TimeRangeValue
  recommendationName: string
}

const NodeRecommendationDetails: React.FC<NodeRecommendationDetailsProps> = ({
  recommendationDetails,
  recommendationStats,
  timeRange,
  recommendationName
}) => {
  const { getString } = useStrings()
  const timeRangeFilter = GET_DATE_RANGE[timeRange.value]

  const [buffer, setBuffer] = useState(0)
  const [tuneRecomVisible, setTuneRecomVisible] = useState(false)
  const [autoScaling, setAutoScaling] = useState(false)

  const { sumCpu, sumMem, maxNodes, minNodes } = (recommendationDetails.resourceRequirement ||
    {}) as RecommendClusterRequest
  const { provider, region, service } = (recommendationDetails.recommended || {}) as RecommendationResponse

  const [recomDetails, setRecomDetails] = useState(recommendationDetails)
  const [state, dispatch] = useReducer(
    reducer,
    useMemo(
      () =>
        ({
          sumCpu: +(sumCpu || 0).toFixed(2),
          sumMem: +(sumMem || 0).toFixed(2),
          maxNodes: +(maxNodes || 0).toFixed(2),
          minNodes: +(minNodes || 0).toFixed(2)
        } as IState),
      []
    )
  )

  const { mutate: fetchNewRecommendation, loading } = useRecommendCluster({
    provider: provider || '',
    region: region || '',
    service: service || ''
  })

  const { data: seriesData, loading: seriesDataLoading } = useGetSeries({
    provider: provider || '',
    service: service || '',
    region: region || ''
  })

  const debouncedFetchNewRecomm = useCallback(pDebounce(fetchNewRecommendation, 500), [])

  const updateRecommendationDetails = async () => {
    const payload = { ...recommendationDetails.resourceRequirement, ...state }
    try {
      const response = await debouncedFetchNewRecomm(payload as RecommendClusterRequest)
      const newState = {
        ...recomDetails,
        recommended: { ...recomDetails.recommended, ...response }
      } as NodeRecommendationDto

      // TODO: check how we can avoid it.
      if (!isEqual(recomDetails, newState)) {
        setRecomDetails(newState)
      }
    } catch (e) {
      // console.log('Error in fetching recommended cluster ', e)
    }
  }

  useDidMountEffect(() => {
    updateRecommendationDetails()
  }, [])

  const [showModal, hideModal] = useModalHook(() => {
    return (
      <Dialog isOpen={true} enforceFocus={false} onClose={hideModal} style={{ width: 1175, height: 640 }}>
        <Layout.Vertical spacing="medium" padding="xxlarge" height="100%">
          <Text font={{ variation: FontVariation.H4 }} icon="gcp">
            {`${recommendationName}: Preferred Instance Families`}
          </Text>
          <Text>{getString('ce.nodeRecommendation.instaceFamiliesModalDesc')}</Text>
          <Container height="100%">
            <Tabs
              id={'horizontalTabs'}
              tabList={Object.keys(seriesData?.categoryDetails || {}).map(key => ({
                id: key,
                title: key,
                panel: (
                  <InstanceFamiliesModalTab
                    data={seriesData?.categoryDetails ? seriesData?.categoryDetails[key] : {}}
                  />
                )
              }))}
            />
          </Container>
          <Layout.Horizontal spacing="medium">
            <Button variation={ButtonVariation.PRIMARY}>Save Preferences</Button>
            <Button variation={ButtonVariation.TERTIARY} onClick={hideModal}>
              {getString('cancel')}
            </Button>
          </Layout.Horizontal>
        </Layout.Vertical>
      </Dialog>
    )
  }, [seriesDataLoading])

  return (
    <>
      <Layout.Vertical>
        <Card style={{ paddingLeft: 0, paddingRight: 0 }}>
          <Layout.Horizontal spacing="large" padding={{ left: 'xlarge', right: 'xlarge' }}>
            <RecommendationDetailsSpendCard
              withRecommendationAmount={formatCost(
                recommendationStats?.totalMonthlyCost - recommendationStats?.totalMonthlySaving
              )}
              withoutRecommendationAmount={formatCost(recommendationStats?.totalMonthlyCost)}
              title={`${getString('ce.recommendation.listPage.monthlyPotentialCostText')}`}
              spentBy={moment(timeRangeFilter[1]).format('MMM DD')}
            />
            <RecommendationDetailsSavingsCard
              amount={formatCost(recommendationStats?.totalMonthlySaving)}
              title={getString('ce.recommendation.listPage.monthlySavingsText')}
              amountSubTitle={`(${Math.floor(
                (recommendationStats?.totalMonthlySaving / recommendationStats?.totalMonthlyCost) * 100
              )}%)`}
              subTitle={`${moment(timeRangeFilter[0]).format('MMM DD')} - ${moment(timeRangeFilter[1]).format(
                'MMM DD'
              )}`}
            />
          </Layout.Horizontal>
          <Recommender stats={recommendationStats} details={recomDetails} loading={loading} />
          <Container style={{ width: 354, float: 'right' }} margin="large" padding="medium" background={Color.BLUE_50}>
            <Text icon="info-messaging" color={Color.GREY_700} font={{ variation: FontVariation.SMALL }}>
              {getString('ce.nodeRecommendation.tuneRecommendationsInfo')}
            </Text>
          </Container>
        </Card>
      </Layout.Vertical>
      <Layout.Vertical spacing="large" padding="xlarge">
        <Layout.Horizontal flex={{ justifyContent: 'space-between' }}>
          <Container width="50%">
            <Text font={{ variation: FontVariation.H6 }}>
              {getString('ce.nodeRecommendation.resourceUtilInLast', { timeRange: timeRange.label.toLowerCase() })}
            </Text>
          </Container>
          <Button size={ButtonSize.SMALL} variation={ButtonVariation.SECONDARY}>
            {getString('ce.recommendation.detailsPage.viewMoreDetailsText')}
          </Button>
        </Layout.Horizontal>
        <Layout.Horizontal flex={{ justifyContent: 'space-between' }}>
          <Container>
            <Text inline font={{ variation: FontVariation.SMALL }}>
              {getString('delegate.delegateCPU')}
            </Text>
            <Text inline font={{ variation: FontVariation.H6 }} color={Color.GREY_400}>{` ${+(sumCpu || 0).toFixed(
              2
            )}vCPU`}</Text>
          </Container>
          <Container>
            <Text inline font={{ variation: FontVariation.SMALL }}>
              {getString('ce.recommendation.recommendationChart.memoryLabelRegular')}
            </Text>
            <Text inline font={{ variation: FontVariation.H6 }} color={Color.GREY_400}>{` ${+(sumMem || 0).toFixed(
              2
            )}GiB`}</Text>
          </Container>
          <Container>
            <Text inline font={{ variation: FontVariation.SMALL }}>
              {getString('ce.nodeRecommendation.nodeCount')}
            </Text>
            <Text inline font={{ variation: FontVariation.H6 }} color={Color.GREY_400}>
              {` ${+(minNodes || 0).toFixed(2)}`}
            </Text>
          </Container>
        </Layout.Horizontal>
        <img src={resourceUtilization} />
        <Text font={{ variation: FontVariation.H5 }} margin={{ bottom: 'small' }}>
          {getString('ce.recommendation.detailsPage.tuneRecommendations')}
        </Text>
        <Layout.Horizontal style={{ alignItems: 'center' }}>
          <Checkbox checked={autoScaling} onChange={() => setAutoScaling(prevState => !prevState)} />
          <Text font={{ variation: FontVariation.SMALL_SEMI }}>{getString('ce.nodeRecommendation.autoScaling')}</Text>
        </Layout.Horizontal>
        <Card style={{ padding: 0 }}>
          <Container padding="medium" flex={{ justifyContent: 'space-between' }}>
            <Text font={{ variation: FontVariation.H6 }} color={tuneRecomVisible ? Color.GREY_700 : Color.PRIMARY_7}>
              {getString('ce.nodeRecommendation.setInstancePreferences')}
            </Text>
            <Icon
              name={tuneRecomVisible ? 'caret-up' : 'caret-down'}
              onClick={() => setTuneRecomVisible(prevState => !prevState)}
              color={Color.PRIMARY_7}
            />
          </Container>
          {tuneRecomVisible ? (
            <Container padding="medium" background={Color.PRIMARY_1}>
              <TuneNodeRecommendationCard state={state} dispatch={dispatch} buffer={buffer} setBuffer={setBuffer} />
              <Text font={{ variation: FontVariation.SMALL_SEMI }} margin={{ bottom: 'small', top: 'medium' }}>
                {getString('ce.nodeRecommendation.preferredInstanceFamilies')}
              </Text>
              <Button icon="plus" variation={ButtonVariation.LINK} margin={{ bottom: 'medium' }} onClick={showModal}>
                {getString('ce.nodeRecommendation.addPreferredInstanceFamilies')}
              </Button>
              <Button variation={ButtonVariation.PRIMARY} onClick={updateRecommendationDetails}>
                {getString('ce.nodeRecommendation.applyPreferences')}
              </Button>
            </Container>
          ) : null}
        </Card>
      </Layout.Vertical>
    </>
  )
}

export default NodeRecommendationDetails
