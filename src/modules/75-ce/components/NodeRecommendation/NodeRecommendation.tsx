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
  ButtonVariation,
  ButtonSize,
  Icon,
  Tabs
} from '@wings-software/uicore'
import { Dialog, Position, Toaster } from '@blueprintjs/core'
import { useModalHook } from '@harness/use-modal'
import moment from 'moment'
import { isEqual } from 'lodash-es'
import pDebounce from 'p-debounce'
import { useToaster } from '@common/exports'

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
import {
  TuneRecommendationCardHeader,
  TuneRecommendationCard
} from '@ce/components/NodeRecommendation/TuneNodeRecommendationCard'
import { RecommendationResponse, RecommendClusterRequest, useRecommendCluster } from 'services/ce/recommenderService'
import { useGetSeries } from 'services/ce/publicPricingService'
import { InstanceFamiliesModalTab } from '../InstanceFamiliesModalTab/InstanceFamiliesModalTab'
import resourceUtilizationCpu from './images/resource-utilization-cpu.svg'
import resourceUtilizationMem from './images/resource-utilization-memory.svg'
import resourceUtilizationNodeCount from './images/resource-utilization-node-count.svg'

import css from './NodeRecommendation.module.scss'

export interface IState {
  minCpu: number
  minMem: number
  sumCpu: number
  sumMem: number
  maxNodes: number
  minNodes: number
  includeTypes: string[]
  includeSeries: string[]
  excludeTypes: string[]
  excludeSeries: string[]
}

export enum ACTIONS {
  'SUM_CPUS',
  'SUM_MEM',
  'MIN_CPUS',
  'MIN_MEM',
  'MIN_NODES',
  'MAX_NODES',
  'INCLUDE_TYPES',
  'INCLUDE_SERIES',
  'EXCLUDE_TYPES',
  'EXCLUDE_SERIES',
  'CLEAR_INSTACE_FAMILY',
  'RESET_TO_DEFAULT'
}

export interface Action {
  type: ACTIONS
  data: any
}

const insertOrRemoveIntoArray = (array: string[], val: string): string[] =>
  array.indexOf(val) > -1 ? array.filter(ele => ele !== val) : [...array, val]

const reducer = (state: IState, action: Action) => {
  const { type, data } = action

  switch (type) {
    case ACTIONS.SUM_CPUS:
      return { ...state, sumCpu: data }
    case ACTIONS.SUM_MEM:
      return { ...state, sumMem: data }
    case ACTIONS.MIN_CPUS:
      return { ...state, minCpu: data }
    case ACTIONS.MIN_MEM:
      return { ...state, minMem: data }
    case ACTIONS.MIN_NODES:
      return { ...state, minNodes: data }
    case ACTIONS.MAX_NODES:
      return { ...state, maxNodes: data }
    case ACTIONS.INCLUDE_TYPES:
      return {
        ...state,
        includeTypes: insertOrRemoveIntoArray(state.includeTypes, data)
      }
    case ACTIONS.INCLUDE_SERIES:
      return {
        ...state,
        includeSeries: insertOrRemoveIntoArray(state.includeSeries, data)
      }
    case ACTIONS.EXCLUDE_TYPES:
      return {
        ...state,
        excludeTypes: insertOrRemoveIntoArray(state.excludeTypes, data)
      }
    case ACTIONS.EXCLUDE_SERIES:
      return {
        ...state,
        excludeSeries: insertOrRemoveIntoArray(state.excludeSeries, data)
      }
    case ACTIONS.CLEAR_INSTACE_FAMILY:
      return {
        ...state,
        includeTypes: data.includeTypes,
        includeSeries: data.includeSeries,
        excludeTypes: data.excludeTypes,
        excludeSeries: data.excludeSeries
      }
    case ACTIONS.RESET_TO_DEFAULT:
      return data
    default:
      return state
  }
}

export const UpdatePreferenceToaster = Toaster.create({
  className: css.toaster,
  position: Position.BOTTOM_RIGHT
})

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
  const { showError } = useToaster()

  const timeRangeFilter = GET_DATE_RANGE[timeRange.value]

  const [buffer, setBuffer] = useState(0)
  // const [autoScaling, setAutoScaling] = useState(false)
  const [tuneRecomVisible, setTuneRecomVisible] = useState(true)

  const {
    minCpu,
    sumCpu,
    minMem,
    sumMem,
    maxNodes,
    minNodes,
    includeTypes,
    includeSeries,
    excludeTypes,
    excludeSeries
  } = (recommendationDetails.resourceRequirement || {}) as RecommendClusterRequest
  const { provider, region, service } = (recommendationDetails.recommended || {}) as RecommendationResponse

  const initialState = {
    minCpu: +(minCpu || 0).toFixed(2),
    minMem: +(minMem || 0).toFixed(2),
    sumCpu: +(sumCpu || 0).toFixed(2),
    sumMem: +(sumMem || 0).toFixed(2),
    maxNodes: +(maxNodes || 0).toFixed(2),
    minNodes: +(minNodes || 0).toFixed(2),
    includeTypes: includeTypes || [],
    includeSeries: includeSeries || [],
    excludeTypes: excludeTypes || [],
    excludeSeries: excludeSeries || []
  }

  const [recomDetails, setRecomDetails] = useState(recommendationDetails)
  const [state, dispatch] = useReducer(
    reducer,
    useMemo(() => initialState as IState, [])
  )

  const [updatedState, setUpdatedState] = useState(initialState)

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
    setUpdatedState(state)

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

      UpdatePreferenceToaster.show({ message: getString('ce.nodeRecommendation.updatePreferences'), icon: 'tick' })
    } catch (e) {
      showError('Error in fetching recommended cluster')
    }
  }

  useDidMountEffect(() => {
    updateRecommendationDetails()
  }, [])

  const [showModal, hideModal] = useModalHook(() => {
    return (
      <Dialog isOpen={true} enforceFocus={false} onClose={hideModal} style={{ width: 1175 }}>
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
                    state={state}
                    dispatch={dispatch}
                  />
                )
              }))}
            />
          </Container>
          <Layout.Horizontal spacing="medium">
            <Button variation={ButtonVariation.PRIMARY} onClick={hideModal} disabled={isEqual(state, updatedState)}>
              {getString('ce.nodeRecommendation.savePreferences')}
            </Button>
            <Button
              variation={ButtonVariation.TERTIARY}
              onClick={() => {
                hideModal()
                dispatch({
                  type: ACTIONS.CLEAR_INSTACE_FAMILY,
                  data: {
                    includeTypes: updatedState.includeTypes,
                    includeSeries: updatedState.includeSeries,
                    excludeTypes: updatedState.excludeTypes,
                    excludeSeries: updatedState.excludeSeries
                  }
                })
              }}
            >
              {getString('cancel')}
            </Button>
          </Layout.Horizontal>
        </Layout.Vertical>
      </Dialog>
    )
  }, [seriesDataLoading, state, updatedState])

  return (
    <>
      <Layout.Vertical>
        <Card style={{ paddingLeft: 0, paddingRight: 0 }}>
          <Layout.Horizontal padding={{ left: 'large' }}>
            <Container width={400}>
              <RecommendationDetailsSpendCard
                withRecommendationAmount={formatCost(
                  recommendationStats?.totalMonthlyCost - recommendationStats?.totalMonthlySaving
                )}
                withoutRecommendationAmount={formatCost(recommendationStats?.totalMonthlyCost)}
                title={`${getString('ce.recommendation.listPage.monthlyPotentialCostText')}`}
                spentBy={moment(timeRangeFilter[1]).format('MMM DD')}
              />
            </Container>
            <Container>
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
            </Container>
          </Layout.Horizontal>
          <Recommender stats={recommendationStats} details={recomDetails} loading={loading} />
          <Container margin="medium" className={css.tuneRecomInfoContainer} padding="medium" background={Color.BLUE_50}>
            <Layout.Horizontal spacing="xsmall">
              <Icon name="info-messaging" />
              <Container>
                <Text inline color={Color.GREY_700} font={{ variation: FontVariation.SMALL }}>
                  {getString('ce.nodeRecommendation.tuneRecommendationsInfo1')}
                </Text>
                <Text
                  inline
                  color={Color.PRIMARY_7}
                  font={{ variation: FontVariation.SMALL }}
                  onClick={() => setTuneRecomVisible(true)}
                  className={css.pointer}
                >
                  {getString('ce.recommendation.detailsPage.tuneRecommendations').toLowerCase()}
                </Text>
                <Text inline color={Color.GREY_700} font={{ variation: FontVariation.SMALL }}>
                  {getString('ce.nodeRecommendation.tuneRecommendationsInfo2')}
                </Text>
              </Container>
            </Layout.Horizontal>
          </Container>
        </Card>
      </Layout.Vertical>
      <Layout.Vertical spacing="large" padding="xlarge">
        <Layout.Horizontal flex={{ justifyContent: 'space-between' }}>
          <Container>
            <Text font={{ variation: FontVariation.H6 }}>
              {getString('ce.nodeRecommendation.resourceUtilInLast', { timeRange: timeRange.label.toLowerCase() })}
            </Text>
          </Container>
          <Button size={ButtonSize.SMALL} variation={ButtonVariation.SECONDARY}>
            {getString('ce.recommendation.detailsPage.viewMoreDetailsText')}
          </Button>
        </Layout.Horizontal>
        <Layout.Horizontal padding={{ top: 'large' }} flex={{ justifyContent: 'space-between' }}>
          <Layout.Vertical height="100%" flex={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Container padding={{ bottom: 'medium' }}>
              <Text inline font={{ variation: FontVariation.SMALL }}>
                {getString('delegate.delegateCPU')}
              </Text>
              <Text inline font={{ variation: FontVariation.H6 }} color={Color.GREY_400}>{` ${+(sumCpu || 0).toFixed(
                2
              )}vCPU`}</Text>
            </Container>
            <img src={resourceUtilizationCpu} />
          </Layout.Vertical>

          <Layout.Vertical height="100%" flex={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Container padding={{ bottom: 'medium' }}>
              <Text inline font={{ variation: FontVariation.SMALL }}>
                {getString('ce.recommendation.recommendationChart.memoryLabelRegular')}
              </Text>
              <Text inline font={{ variation: FontVariation.H6 }} color={Color.GREY_400}>{` ${+(sumMem || 0).toFixed(
                2
              )}GiB`}</Text>
            </Container>
            <img src={resourceUtilizationMem} />
          </Layout.Vertical>
          <Layout.Vertical height="100%" flex={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Container padding={{ bottom: 'medium' }}>
              <Text inline font={{ variation: FontVariation.SMALL }}>
                {getString('ce.nodeRecommendation.nodeCount')}
              </Text>
              <Text inline font={{ variation: FontVariation.H6 }} color={Color.GREY_400}>
                {` ${+(minNodes || 0).toFixed(2)}`}
              </Text>
            </Container>
            <img src={resourceUtilizationNodeCount} />
          </Layout.Vertical>
        </Layout.Horizontal>
        <Text font={{ variation: FontVariation.H5 }} padding={{ top: 'xsmall' }}>
          {getString('ce.recommendation.detailsPage.tuneRecommendations')}
        </Text>
        {/* <Layout.Horizontal style={{ alignItems: 'center' }}>
          <Checkbox checked={autoScaling} onChange={() => setAutoScaling(!autoScaling)} />
          <Text font={{ variation: FontVariation.SMALL_SEMI }}>{getString('ce.nodeRecommendation.autoScaling')}</Text>
        </Layout.Horizontal> */}
        <Card className={css.tuneRecommendationCard}>
          <TuneRecommendationCardHeader
            cardVisible={tuneRecomVisible}
            toggleCardVisible={() => setTuneRecomVisible(prevState => !prevState)}
          />
          {tuneRecomVisible ? (
            <Container padding="medium" background={Color.PRIMARY_1}>
              <TuneRecommendationCard
                state={state}
                dispatch={dispatch}
                buffer={buffer}
                setBuffer={setBuffer}
                showInstanceFamiliesModal={showModal}
                initialState={initialState}
                updatedState={updatedState}
                updateRecommendationDetails={updateRecommendationDetails}
              />
            </Container>
          ) : null}
        </Card>
      </Layout.Vertical>
    </>
  )
}

export default NodeRecommendationDetails
