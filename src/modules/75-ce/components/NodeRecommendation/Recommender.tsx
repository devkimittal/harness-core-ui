/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import cx from 'classnames'
import { get } from 'lodash-es'

import { Container, Icon, Text, Color, FontVariation } from '@wings-software/uicore'

import { useStrings } from 'framework/strings'
import type { NodeRecommendationDto, RecommendationOverviewStats, RecommendationResponse } from 'services/ce/services'
import formatCost from '@ce/utils/formatCost'
import css from './NodeRecommendation.module.scss'

interface RecommenderProps {
  stats: RecommendationOverviewStats
  details: NodeRecommendationDto
  loading: boolean
}

interface CardRow {
  label: string
  current: string | number
  spot: string | number
  demand: string | number
  renderer?: (data: CardRow, type: CardType) => React.ReactNode
}

const Recommender = (props: RecommenderProps) => {
  const { getString } = useStrings()
  const { stats, details, loading } = props

  const instanceTypeToLabel: Record<string, string> = useMemo(() => {
    return {
      ON_DEMAND: getString('ce.nodeRecommendation.onDemand'),
      SPOT: getString('ce.nodeRecommendation.spot')
    }
  }, [])

  const data: CardRow[] = useMemo(() => {
    const curInstanceType = details.current?.instanceCategory || ''
    const getCostPerNodePerHour = (obj: RecommendationResponse | null) => {
      if (curInstanceType === 'ON_DEMAND') {
        return get(obj, 'nodePools[0].vm.onDemandPrice', 0)
      }

      return get(obj, 'nodePools[0].vm.avgPrice', 0)
    }

    const getMonthlyCostFor = (type: CardType) => {
      const mp = details.recommended?.accuracy?.masterPrice || 0
      if (type === CardType.RECOMMENDED_SPOT) {
        return (mp + (details.recommended?.accuracy?.spotPrice || 0)) * 24 * 30
      }

      return (mp + (details.recommended?.accuracy?.workerPrice || 0)) * 24 * 30
    }

    const getEstimatedSavingsFor = (type: CardType) => {
      const recommendedMonthlyCost = getMonthlyCostFor(type)
      return stats.totalMonthlyCost - recommendedMonthlyCost
    }

    return [
      {
        label: '',
        current: curInstanceType,
        spot: 'SPOT',
        demand: 'ON_DEMAND',
        renderer: (value, type) => {
          const v = value[type!]
          return v && <div className={css.cardLabelPill}>{instanceTypeToLabel[v]}</div>
        }
      },
      {
        label: getString('ce.nodeRecommendation.estimatedSavings'),
        current: 0,
        spot: getEstimatedSavingsFor(CardType.RECOMMENDED_SPOT),
        demand: getEstimatedSavingsFor(CardType.RECOMMENDED_ON_DEMAND),
        renderer: (value, type) => {
          const v = value[type!]
          const isRecommendation = type === CardType.RECOMMENDED_SPOT || type === CardType.RECOMMENDED_ON_DEMAND
          const isLabel = type === CardType.LABEL

          let color = 'grey700'
          if (isRecommendation) {
            color = v < 0 ? 'red500' : 'green700'
          }

          return (
            <Text
              color={color}
              font={{
                weight: 'bold',
                size: isLabel ? 'small' : 'medium'
              }}
            >
              {isLabel ? v : formatCost(+v)}
            </Text>
          )
        }
      },
      {
        label: getString('ce.nodeRecommendation.instanceFam'),
        current: get(details.current, 'nodePools[0].vm.type', ''),
        spot: get(details.recommended, 'nodePools[0].vm.type', ''),
        demand: get(details.recommended, 'nodePools[0].vm.type', ''),
        renderer: (value, type) => {
          const v = value[type!]
          const isLabel = type === CardType.LABEL

          return (
            <>
              <Text
                font={{
                  variation: isLabel ? FontVariation.SMALL_SEMI : FontVariation.H6
                }}
              >
                {v}
              </Text>
            </>
          )
        }
      },
      {
        label: getString('ce.nodeRecommendation.nodeCount'),
        current: get(details.current, 'nodePools[0].sumNodes', 0),
        spot: get(details.recommended, 'nodePools[0].sumNodes', 0),
        demand: get(details.recommended, 'nodePools[0].sumNodes', 0),
        renderer: (value, type) => {
          const v = value[type!]
          const isLabel = type === CardType.LABEL

          return (
            <Text
              font={{
                variation: isLabel ? FontVariation.SMALL_SEMI : FontVariation.H6
              }}
            >
              {v}
            </Text>
          )
        }
      },
      {
        label: getString('ce.nodeRecommendation.cpus'),
        current: get(details.current, 'nodePools[0].vm.cpusPerVm', 0).toFixed(2),
        spot: get(details.recommended, 'nodePools[0].vm.cpusPerVm', 0).toFixed(2),
        demand: get(details.recommended, 'nodePools[0].vm.cpusPerVm', 0).toFixed(2)
      },

      {
        label: getString('ce.nodeRecommendation.memory'),
        current: get(details.current, 'nodePools[0].vm.memPerVm', 0).toFixed(2),
        spot: get(details.recommended, 'nodePools[0].vm.memPerVm', 0).toFixed(2),
        demand: get(details.recommended, 'nodePools[0].vm.memPerVm', 0).toFixed(2)
      },
      {
        label: getString('ce.nodeRecommendation.costPerHour'),
        current: formatCost(getCostPerNodePerHour(details.current)),
        spot: formatCost(get(details.recommended, 'nodePools[0].vm.avgPrice', 0)),
        demand: formatCost(get(details.recommended, 'nodePools[0].vm.onDemandPrice', 0))
      },
      {
        label: getString('regionLabel'),
        current: details.current?.region || '',
        spot: details.recommended?.region || '',
        demand: details.recommended?.region || ''
      },
      {
        label: getString('ce.nodeRecommendation.monthlyCost'),
        current: formatCost(stats.totalMonthlyCost),
        spot: formatCost(getMonthlyCostFor(CardType.RECOMMENDED_SPOT)),
        demand: formatCost(getMonthlyCostFor(CardType.RECOMMENDED_ON_DEMAND)),
        renderer: (value, type) => {
          const v = value[type!]
          const isLabel = type === CardType.LABEL

          return <Text font={{ variation: isLabel ? FontVariation.SMALL_SEMI : FontVariation.SMALL_BOLD }}>{v}</Text>
        }
      }
    ]
  }, [stats, details])

  return (
    <Container className={css.comparisonCtn}>
      <Container>
        <Container className={css.cardCategory}>
          <Container />
          <Text color={Color.GREY_700} font={{ variation: FontVariation.H5, align: 'center' }}>
            {getString('common.current')}
          </Text>
          <Container />
          <Container className={css.recommendationCategory}>
            <Text color={Color.GREY_700} font={{ variation: FontVariation.H5 }}>
              {getString('ce.nodeRecommendation.recommended')}
            </Text>
          </Container>
        </Container>
        <Container className={css.cards}>
          <Card data={data} classNames={cx(css.noBgColor, css.noShadow, css.leftAlign)} type={CardType.LABEL} />
          <Card data={data} classNames={cx(css.noBgColor, css.noShadow)} emptyCards />
          <Card data={data} classNames={css.white} type={CardType.CURRENT} />
          <Card data={data} classNames={cx(css.noBgColor, css.noShadow)} emptyCards />
          <Card data={data} classNames={css.blue} type={CardType.RECOMMENDED_SPOT} loading={loading} />
          <Card data={data} classNames={css.blue} type={CardType.RECOMMENDED_ON_DEMAND} loading={loading} />
          <Card data={data} classNames={cx(css.noBgColor, css.noShadow)} emptyCards />
        </Container>
      </Container>
    </Container>
  )
}

const enum CardType {
  LABEL = 'label',
  CURRENT = 'current',
  RECOMMENDED_SPOT = 'spot',
  RECOMMENDED_ON_DEMAND = 'demand'
}

interface CardProps {
  classNames?: string
  data: CardRow[]
  type?: CardType
  emptyCards?: boolean
  loading?: boolean
}

const Card = (props: CardProps) => {
  const { classNames, data = [], type, emptyCards = false, loading = false } = props
  const isRecommendationCard = type === CardType.RECOMMENDED_ON_DEMAND || type === CardType.RECOMMENDED_SPOT
  const isLabel = type === CardType.LABEL

  if (loading) {
    return (
      <div className={cx(css.card)}>
        <Loader />
      </div>
    )
  }

  if (emptyCards) {
    return (
      <div className={cx(css.card, classNames)}>
        {data.map((_, idx) => (
          <div key={idx} className={css.cardItem} />
        ))}
      </div>
    )
  }

  return (
    <div className={cx(css.card, classNames)}>
      {isRecommendationCard && <div className={css.cardOverlay} />}
      {data.map(d => {
        return typeof d.renderer === 'function' ? (
          <div className={cx(css.cardItem)}>{d.renderer(d, type!)}</div>
        ) : (
          <Text
            className={cx(css.cardItem)}
            font={{ variation: isLabel ? FontVariation.SMALL_SEMI : FontVariation.SMALL }}
          >
            {d[type!]}
          </Text>
        )
      })}
    </div>
  )
}

const Loader = (props: { className?: string }) => {
  return (
    <Container className={cx(css.cardLoadingContainer, props.className)}>
      <Icon name="spinner" color="primary5" size={30} />
    </Container>
  )
}

export default Recommender
