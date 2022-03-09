/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import {
  Container,
  Layout,
  Text,
  TextInput,
  FontVariation,
  Color,
  Button,
  Icon,
  ButtonVariation
} from '@wings-software/uicore'
import { Slider } from '@blueprintjs/core'
import { isEqual } from 'lodash-es'
import { useStrings } from 'framework/strings'
import { Action, ACTIONS, IState } from '@ce/components/NodeRecommendation/NodeRecommendation'
import css from './NodeRecommendation.module.scss'

const addBufferToValue = (bufferPercentage: number, value: number): number =>
  +(((100 + bufferPercentage) / 100) * value).toFixed(2)

interface TuneRecommendationCardHeaderProps {
  cardVisible: boolean
  toggleCardVisible: () => void
}

export const TuneRecommendationCardHeader: React.FC<TuneRecommendationCardHeaderProps> = ({
  cardVisible,
  toggleCardVisible
}) => {
  const { getString } = useStrings()

  return (
    <Container padding="medium" flex={{ justifyContent: 'space-between' }}>
      <Text
        className={css.pointer}
        font={{ variation: FontVariation.H6 }}
        color={cardVisible ? Color.GREY_700 : Color.PRIMARY_7}
        onClick={toggleCardVisible}
      >
        {getString('ce.nodeRecommendation.setInstancePreferences')}
      </Text>
      <Icon
        name={cardVisible ? 'caret-up' : 'caret-down'}
        onClick={toggleCardVisible}
        color={Color.PRIMARY_7}
        className={css.pointer}
      />
    </Container>
  )
}

interface TuneRecommendationCardProps {
  state: IState
  dispatch: React.Dispatch<Action>
  buffer: number
  setBuffer: React.Dispatch<React.SetStateAction<number>>
  showInstanceFamiliesModal: () => void
  initialState: IState
  updatedState: IState
  updateRecommendationDetails: () => void
}

export const TuneRecommendationCard = (props: TuneRecommendationCardProps) => {
  const {
    state,
    dispatch,
    buffer,
    setBuffer,
    showInstanceFamiliesModal,
    initialState,
    updateRecommendationDetails,
    updatedState
  } = props
  const { getString } = useStrings()

  return (
    <Container className={css.preferences}>
      <Layout.Vertical spacing="medium">
        <Container>
          <Text font={{ variation: FontVariation.SMALL_SEMI }}>
            {getString('ce.nodeRecommendation.prefResourceNeeds')}
          </Text>
          <Layout.Horizontal flex={{ justifyContent: 'space-between' }} spacing="medium" margin={{ top: 'small' }}>
            <Layout.Horizontal spacing="medium">
              <Resources state={state} dispatch={dispatch} />
              <Container flex={{ justifyContent: 'center' }}>
                <Container style={{ borderWidth: 1, borderStyle: 'solid', borderLeft: 0, width: 14, height: 60 }} />
              </Container>
              <Container flex={{ justifyContent: 'center' }} margin={{ right: 'small' }}>
                <Icon name="plus" size={12} color={Color.GREY_700} />
              </Container>
            </Layout.Horizontal>
            <Buffer state={state} dispatch={dispatch} buffer={buffer} setBuffer={setBuffer} />
          </Layout.Horizontal>
          <Layout.Horizontal padding={{ top: 'medium' }} spacing="medium">
            <LargestResources state={state} dispatch={dispatch} />
            <Nodes state={state} dispatch={dispatch} />
          </Layout.Horizontal>
        </Container>
        <InstanceFamilies showInstanceFamiliesModal={showInstanceFamiliesModal} state={state} />
        <ApplyPreferencesButtonGroup
          dispatch={dispatch}
          setBuffer={setBuffer}
          state={state}
          initialState={initialState}
          updatedState={updatedState}
          updateRecommendationDetails={updateRecommendationDetails}
        />
      </Layout.Vertical>
    </Container>
  )
}

const Resources = ({ dispatch, state }: { dispatch: React.Dispatch<Action>; state: IState }) => {
  const { getString } = useStrings()

  return (
    <Container>
      <Layout.Vertical spacing="small">
        <Container flex={{ justifyContent: 'space-between' }}>
          <Text
            padding={{ right: 'small' }}
            inline
            color={Color.GREY_500}
            font={{ variation: FontVariation.SMALL_SEMI }}
          >
            {getString('ce.nodeRecommendation.cpus')}
          </Text>
          <TextInput
            defaultValue={`${state.sumCpu}`}
            wrapperClassName={css.input}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              dispatch({ type: ACTIONS.SUM_CPUS, data: +e.target.value })
            }
          />
        </Container>
        <Container flex={{ justifyContent: 'space-between' }}>
          <Text
            padding={{ right: 'small' }}
            inline
            color={Color.GREY_500}
            font={{ variation: FontVariation.SMALL_SEMI }}
          >
            {getString('ce.nodeRecommendation.mem')}
          </Text>
          <TextInput
            defaultValue={`${state.sumMem}`}
            wrapperClassName={css.input}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              dispatch({ type: ACTIONS.SUM_MEM, data: +e.target.value })
            }
          />
        </Container>
      </Layout.Vertical>
    </Container>
  )
}

const Buffer = ({
  dispatch,
  state,
  buffer,
  setBuffer
}: {
  dispatch: React.Dispatch<Action>
  state: IState
  buffer: number
  setBuffer: React.Dispatch<React.SetStateAction<number>>
}) => {
  const { getString } = useStrings()
  const [recomDetails] = useState(state)

  return (
    <Container width="60%">
      <Layout.Vertical spacing="xxsmall">
        <Layout.Horizontal style={{ justifyContent: 'space-between' }}>
          <Text font={{ variation: FontVariation.SMALL_SEMI }} rightIcon="info" rightIconProps={{ size: 12 }}>
            {getString('ce.nodeRecommendation.buffer')}
          </Text>
          <Text font={{ variation: FontVariation.SMALL_SEMI }} color={Color.GREY_400}>{`${buffer}%`}</Text>
        </Layout.Horizontal>
        <Slider
          min={0}
          max={100}
          stepSize={1}
          labelRenderer={false}
          value={buffer}
          onChange={val => setBuffer(val)}
          onRelease={val => {
            dispatch({
              type: ACTIONS.SUM_CPUS,
              data: addBufferToValue(val, recomDetails.sumCpu)
            })
            dispatch({
              type: ACTIONS.SUM_MEM,
              data: addBufferToValue(val, recomDetails.sumMem)
            })
          }}
          className={css.bufferSlider}
        />
        <Container>
          <Text inline font={{ variation: FontVariation.SMALL }}>{`${getString('delegate.delegateCPU')}: ${
            Math.floor((100 + buffer) * state.sumCpu) / 100
          } vCPU `}</Text>
          <Text inline font={{ variation: FontVariation.SMALL }}>{`${getString('ce.nodeRecommendation.ram')}: ${
            Math.floor((100 + buffer) * state.sumMem) / 100
          } GiB`}</Text>
        </Container>
      </Layout.Vertical>
    </Container>
  )
}

const LargestResources = ({ dispatch, state }: { dispatch: React.Dispatch<Action>; state: IState }) => {
  const { getString } = useStrings()
  return (
    <Container>
      <Layout.Vertical spacing="small">
        <Text font={{ variation: FontVariation.SMALL_SEMI }}>
          {getString('ce.nodeRecommendation.largestWorkloadReq')}
        </Text>
        <Container flex={{ justifyContent: 'space-between' }} width="75%">
          <Text inline color={Color.GREY_500} font={{ variation: FontVariation.SMALL_SEMI }}>
            {getString('ce.nodeRecommendation.cpus')}
          </Text>
          <TextInput
            defaultValue={`${state.minCpu}`}
            wrapperClassName={css.input}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              dispatch({ type: ACTIONS.MIN_CPUS, data: +e.target.value })
            }
          />
        </Container>
        <Container flex={{ justifyContent: 'space-between' }} width="75%">
          <Text inline color={Color.GREY_500} font={{ variation: FontVariation.SMALL_SEMI }}>
            {getString('ce.nodeRecommendation.mem')}
          </Text>
          <TextInput
            defaultValue={`${state.minMem}`}
            wrapperClassName={css.input}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              dispatch({ type: ACTIONS.MIN_MEM, data: +e.target.value })
            }
          />
        </Container>
      </Layout.Vertical>
    </Container>
  )
}

const Nodes = ({ dispatch, state }: { dispatch: React.Dispatch<Action>; state: IState }) => {
  const { getString } = useStrings()

  return (
    <Container padding={{ left: 'large' }}>
      <Layout.Vertical spacing="small">
        <Text font={{ variation: FontVariation.SMALL_SEMI }}>
          {getString('ce.nodeRecommendation.prefMinNodeCount')}
        </Text>
        <Layout.Horizontal spacing="small" className={css.minNodeContainer}>
          <Button
            icon="minus"
            variation={ButtonVariation.SECONDARY}
            onClick={() => {
              dispatch({ type: ACTIONS.MIN_NODES, data: state.minNodes - 1 })
            }}
          />
          <TextInput
            value={`${state.minNodes}`}
            wrapperClassName={css.minNodeInput}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              dispatch({ type: ACTIONS.MIN_NODES, data: +e.target.value })
            }
          />
          <Button
            icon="plus"
            variation={ButtonVariation.SECONDARY}
            onClick={() => {
              dispatch({ type: ACTIONS.MIN_NODES, data: state.minNodes + 1 })
            }}
          />
        </Layout.Horizontal>
      </Layout.Vertical>
    </Container>
  )
}

const InstanceFamilies = ({
  state,
  showInstanceFamiliesModal
}: {
  state: IState
  showInstanceFamiliesModal: () => void
}) => {
  const { getString } = useStrings()

  return (
    <Container>
      <Container margin={{ bottom: 'small' }}>
        <Text inline font={{ variation: FontVariation.SMALL_SEMI }}>
          {getString('ce.nodeRecommendation.preferredInstanceFamilies')}
        </Text>
        {state.includeSeries.length || state.includeTypes.length ? (
          <Button
            inline
            variation={ButtonVariation.LINK}
            icon="edit"
            onClick={showInstanceFamiliesModal}
            iconProps={{ size: 12 }}
          >
            {getString('edit')}
          </Button>
        ) : null}
      </Container>
      {state.includeSeries.length || state.includeTypes.length ? (
        <TextInput
          value={[...state.includeSeries, ...state.includeTypes].toString()}
          contentEditable={false}
          className={css.instaceFamilyInput}
          readOnly
        />
      ) : null}
      <Button
        icon="plus"
        variation={ButtonVariation.LINK}
        margin={{ bottom: 'small' }}
        onClick={showInstanceFamiliesModal}
      >
        {getString('ce.nodeRecommendation.addPreferredInstanceFamilies')}
      </Button>
    </Container>
  )
}

const ApplyPreferencesButtonGroup = ({
  updateRecommendationDetails,
  state,
  initialState,
  updatedState,
  dispatch,
  setBuffer
}: {
  updateRecommendationDetails: () => void
  state: IState
  initialState: IState
  updatedState: IState
  dispatch: React.Dispatch<Action>
  setBuffer: React.Dispatch<React.SetStateAction<number>>
}) => {
  const { getString } = useStrings()

  return (
    <Layout.Horizontal spacing="small">
      <Button
        variation={ButtonVariation.PRIMARY}
        onClick={updateRecommendationDetails}
        disabled={isEqual(state, updatedState)}
      >
        {getString('ce.nodeRecommendation.applyPreferences')}
      </Button>
      {!isEqual(state, initialState) ? (
        <Button
          variation={ButtonVariation.SECONDARY}
          onClick={() => {
            setBuffer(0)
            dispatch({
              type: ACTIONS.RESET_TO_DEFAULT,
              data: initialState
            })
          }}
        >
          {getString('ce.recommendation.detailsPage.resetRecommendationText')}
        </Button>
      ) : null}
    </Layout.Horizontal>
  )
}
