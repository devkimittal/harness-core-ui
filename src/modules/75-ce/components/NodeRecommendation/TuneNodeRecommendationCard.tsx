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

import { useStrings } from 'framework/strings'
import { Action, ACTIONS, IState } from '@ce/components/NodeRecommendation/NodeRecommendation'
import css from './NodeRecommendation.module.scss'

interface NodeCountInstancePreferencesProps {
  state: IState
  dispatch: React.Dispatch<Action>
  buffer: number
  setBuffer: React.Dispatch<React.SetStateAction<number>>
}

const addBufferToValue = (bufferPercentage: number, value: number): number =>
  +(((100 + bufferPercentage) / 100) * value).toFixed(2)

const NodeCountInstancePreferences = (props: NodeCountInstancePreferencesProps) => {
  const { state, dispatch, buffer, setBuffer } = props
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
              dispatch({ type: ACTIONS.CPUS, data: +e.target.value })
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
              dispatch({ type: ACTIONS.MEM, data: +e.target.value })
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
    <Container width="50%">
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
              type: ACTIONS.CPUS,
              data: addBufferToValue(val, recomDetails.sumCpu)
            })
            dispatch({
              type: ACTIONS.MEM,
              data: addBufferToValue(val, recomDetails.sumMem)
            })
          }}
          className={css.bufferSlider}
        />
        <Container>
          <Text font={{ variation: FontVariation.SMALL }}>{`${getString('delegate.delegateCPU')}: ${
            Math.floor((100 + buffer) * state.sumCpu) / 100
          } vCPU `}</Text>
          <Text font={{ variation: FontVariation.SMALL }}>{`${getString('ce.nodeRecommendation.ram')}: ${
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
            defaultValue={`${state.sumCpu}`}
            wrapperClassName={css.input}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              dispatch({ type: ACTIONS.CPUS, data: +e.target.value })
            }
          />
        </Container>
        <Container flex={{ justifyContent: 'space-between' }} width="75%">
          <Text inline color={Color.GREY_500} font={{ variation: FontVariation.SMALL_SEMI }}>
            {getString('ce.nodeRecommendation.mem')}
          </Text>
          <TextInput
            defaultValue={`${state.sumMem}`}
            wrapperClassName={css.input}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              dispatch({ type: ACTIONS.MEM, data: +e.target.value })
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
            // disabled={state.minNodes <= 0}
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
            // disabled={state.minNodes <= state.maxNodes}
          />
        </Layout.Horizontal>
      </Layout.Vertical>
    </Container>
  )
}

export default NodeCountInstancePreferences
