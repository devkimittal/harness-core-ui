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
  Icon,
  Tabs
} from '@wings-software/uicore'
import { Dialog, Position, Toaster } from '@blueprintjs/core'
import { useModalHook } from '@harness/use-modal'
import { defaultTo, isEqual } from 'lodash-es'
import pDebounce from 'p-debounce'
import { useToaster } from '@common/exports'

import useDidMountEffect from '@ce/common/useDidMountEffect'

import { NodepoolTimeRangeType, NodepoolTimeRangeValue } from '@ce/types'
import { getTimePeriodString, GET_NODEPOOL_DATE_RANGE } from '@ce/utils/momentUtils'
import type {
  NodeRecommendationDto,
  RecommendationOverviewStats,
  RecommendNodePoolClusterRequest,
  TotalResourceUsage
} from 'services/ce/services'
import { useStrings } from 'framework/strings'
import Recommender from '@ce/components/NodeRecommendation/Recommender'
import formatCost from '@ce/utils/formatCost'
import {
  RecommendationDetailsSavingsCard,
  RecommendationDetailsSpendCard
} from '@ce/components/RecommendationDetailsSummaryCards/RecommendationDetailsSummaryCards'
import {
  TuneRecommendationCardHeader,
  TuneRecommendationCardBody
} from '@ce/components/NodeRecommendation/TuneNodeRecommendationCard'
import { RecommendationResponse, RecommendClusterRequest, useRecommendCluster } from 'services/ce/recommenderService'
import { useGetSeries } from 'services/ce/publicPricingService'
import {
  addBufferToState,
  addBufferToValue,
  calculateSavingsPercentage,
  convertStateToRecommendClusterPayload,
  isResourceConsistent
} from '@ce/utils/recommendationUtils'
import { InstanceFamiliesModalTab } from '../InstanceFamiliesModalTab/InstanceFamiliesModalTab'
import ResourceUtilizationCharts from './ResourceUtilizationCharts'
import { ACTIONS, Action, IState } from './constants'
import css from './NodeRecommendation.module.scss'

const insertOrRemoveIntoArray = (array: string[], val: string): string[] =>
  array.indexOf(val) > -1 ? array.filter(ele => ele !== val) : [...array, val]

const reducer = (state: IState, action: Action) => {
  const { type, data } = action

  switch (type) {
    case ACTIONS.SUM_CPUS:
      return { ...state, sumCpu: data }
    case ACTIONS.SUM_MEM:
      return { ...state, sumMem: data }
    case ACTIONS.MAX_CPUS:
      return { ...state, maxCpu: data }
    case ACTIONS.MAX_MEM:
      return { ...state, maxMemory: data }
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
    case ACTIONS.UPDATE_TIME_RANGE:
      return {
        ...state,
        sumCpu: data.sumCpu,
        sumMem: data.sumMem,
        minNodes: data.minNodes,
        maxCpu: data.maxCpu,
        maxMemory: data.maxMemory
      }
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
  timeRange: NodepoolTimeRangeValue
  recommendationName: string
  nodeRecommendationRequestData: RecommendNodePoolClusterRequest
}

const NodeRecommendationDetails: React.FC<NodeRecommendationDetailsProps> = ({
  recommendationDetails,
  recommendationStats,
  timeRange,
  recommendationName,
  nodeRecommendationRequestData
}) => {
  const { getString } = useStrings()
  const { showError } = useToaster()

  const timeRangeFilter = GET_NODEPOOL_DATE_RANGE[timeRange.value]

  const [buffer, setBuffer] = useState(0)
  const [tuneRecomVisible, setTuneRecomVisible] = useState(true)

  const { includeTypes, includeSeries, excludeTypes, excludeSeries } = defaultTo(
    recommendationDetails.resourceRequirement,
    {}
  ) as RecommendClusterRequest

  const {
    sumCpu = 0,
    sumMem = 0,
    minNodes = 0,
    maxcpu = 0,
    maxmemory = 0
  } = useMemo(() => {
    const recommendClusterRequest = ((timeRange.value === NodepoolTimeRangeType.LAST_DAY
      ? recommendationDetails.resourceRequirement
      : nodeRecommendationRequestData.recommendClusterRequest) || {}) as RecommendClusterRequest

    const totalResourceUsage = ((timeRange.value === NodepoolTimeRangeType.LAST_DAY
      ? recommendationDetails.totalResourceUsage
      : nodeRecommendationRequestData.totalResourceUsage) || {}) as TotalResourceUsage

    return { ...recommendClusterRequest, ...totalResourceUsage }
  }, [timeRange])

  const { provider, region, service } = (recommendationDetails.recommended || {}) as RecommendationResponse

  const initialState = useMemo(
    () => ({
      maxCpu: +maxcpu.toFixed(3),
      maxMemory: +maxmemory.toFixed(3),
      sumCpu: +sumCpu.toFixed(3),
      sumMem: +sumMem.toFixed(3),
      minNodes: +minNodes.toFixed(3),
      includeTypes: includeTypes || [],
      includeSeries: includeSeries || [],
      excludeTypes: excludeTypes || [],
      excludeSeries: excludeSeries || []
    }),
    [timeRange]
  )

  const [recomDetails, setRecomDetails] = useState(recommendationDetails)
  const [state, dispatch] = useReducer(
    reducer,
    useMemo(() => initialState as IState, [])
  )

  const [updatedState, setUpdatedState] = useState(initialState)

  const pathParams = {
    provider: defaultTo(provider, ''),
    region: defaultTo(region, ''),
    service: defaultTo(service, '')
  }
  const { mutate: fetchNewRecommendation, loading } = useRecommendCluster(pathParams)

  const { data: seriesData, loading: seriesDataLoading } = useGetSeries(pathParams)

  const debouncedFetchNewRecomm = useCallback(pDebounce(fetchNewRecommendation, 500), [])

  const updateRecommendationDetails = async () => {
    const sumCpuWithBuffer = addBufferToValue(state.sumCpu, buffer)
    const sumMemWithBuffer = addBufferToValue(state.sumMem, buffer)

    if (isResourceConsistent(sumCpuWithBuffer, sumMemWithBuffer, state.maxCpu, state.maxMemory)) {
      const payload = convertStateToRecommendClusterPayload(
        state,
        defaultTo(recommendationDetails.resourceRequirement, {}) as RecommendClusterRequest,
        buffer
      )

      try {
        const response = await debouncedFetchNewRecomm(payload)
        const newState = {
          ...recomDetails,
          recommended: { ...recomDetails.recommended, ...response }
        } as NodeRecommendationDto

        if (!isEqual(recomDetails, newState)) {
          setRecomDetails(newState)
        }

        setUpdatedState(addBufferToState(state, buffer))

        UpdatePreferenceToaster.show({ message: getString('ce.nodeRecommendation.updatePreferences'), icon: 'tick' })
      } catch (e) {
        showError(getString('ce.nodeRecommendation.fetchRecommendationError'))
      }
    } else {
      showError('Inconsistent resource requirements')
    }
  }

  useDidMountEffect(() => {
    dispatch({
      type: ACTIONS.UPDATE_TIME_RANGE,
      data: {
        maxCpu: +maxcpu.toFixed(3),
        maxMemory: +maxmemory.toFixed(3),
        sumCpu: +sumCpu.toFixed(3),
        sumMem: +sumMem.toFixed(3),
        minNodes: +minNodes.toFixed(3)
      }
    })

    updateRecommendationDetails()
  }, [timeRange])

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
              tabList={Object.keys(defaultTo(seriesData?.categoryDetails, {})).map(key => ({
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
                spentBy={getTimePeriodString(timeRangeFilter[1], 'MMM DD')}
              />
            </Container>
            <Container>
              <RecommendationDetailsSavingsCard
                amount={formatCost(recommendationStats?.totalMonthlySaving)}
                title={getString('ce.recommendation.listPage.monthlySavingsText')}
                amountSubTitle={calculateSavingsPercentage(
                  recommendationStats?.totalMonthlySaving,
                  recommendationStats?.totalMonthlyCost
                )}
                subTitle={`${getTimePeriodString(timeRangeFilter[0], 'MMM DD')} - ${getTimePeriodString(
                  timeRangeFilter[1],
                  'MMM DD'
                )}`}
              />
            </Container>
          </Layout.Horizontal>
          <Recommender stats={recommendationStats} details={recomDetails} loading={loading} />
          <TuneRecommendationHelpText toggleCardVisible={() => setTuneRecomVisible(prevState => !prevState)} />
        </Card>
      </Layout.Vertical>
      <Layout.Vertical spacing="large" padding="xlarge">
        <ResourceUtilizationCharts
          sumCpu={+defaultTo(sumCpu, 0).toFixed(3)}
          sumMem={+defaultTo(sumMem, 0).toFixed(3)}
          minNodes={+defaultTo(minNodes, 0).toFixed(3)}
          timeRange={timeRange}
        />
        <Text font={{ variation: FontVariation.H5 }} padding={{ top: 'xsmall' }}>
          {getString('ce.recommendation.detailsPage.tuneRecommendations')}
        </Text>
        <Card className={css.tuneRecommendationCard}>
          <TuneRecommendationCardHeader
            cardVisible={tuneRecomVisible}
            toggleCardVisible={() => setTuneRecomVisible(prevState => !prevState)}
          />
          {tuneRecomVisible ? (
            <TuneRecommendationCardBody
              state={state}
              dispatch={dispatch}
              buffer={buffer}
              setBuffer={setBuffer}
              showInstanceFamiliesModal={showModal}
              initialState={initialState}
              updatedState={updatedState}
              updateRecommendationDetails={updateRecommendationDetails}
            />
          ) : null}
        </Card>
      </Layout.Vertical>
    </>
  )
}

export default NodeRecommendationDetails

const TuneRecommendationHelpText: React.FC<{ toggleCardVisible: () => void }> = ({ toggleCardVisible }) => {
  const { getString } = useStrings()

  return (
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
            onClick={toggleCardVisible}
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
  )
}
