import React, { useState } from 'react'
import { Container, Text, Link, Card, Color } from '@wings-software/uikit'
import css from './MetricPackTable.module.scss'
import type { MetricPack } from '@wings-software/swagger-ts/definitions'

interface TableWithCheckColumnsProps {
  metrics: MetricPack
  metricPackName: string
  onChange?: (selectedMetrics: MetricPack) => void
}

export function MetricPackTable(props: TableWithCheckColumnsProps): JSX.Element {
  const { metrics, onChange, metricPackName } = props
  const [metricData, setMetricData] = useState<MetricPack>(metrics)

  return (
    <Container className={css.main}>
      <Card className={css.metricTableCard}>
        <Container className={css.metricPackHeader}>
          <Text className={css.metricPackName}>
            {metricPackName} ({metricData?.metrics?.length})
          </Text>
          <Link withoutHref>Configure Thresholds</Link>
        </Container>
        <ul className={css.metricList}>
          {metricData?.metrics?.map((metric, index) => (
            <li key={metric.name} className={css.metricContent}>
              <input
                type="checkbox"
                checked={metric.included || false}
                onChange={(e: React.FormEvent<HTMLInputElement>) => {
                  const updatedMetricPack = { ...metricData }
                  if (updatedMetricPack?.metrics?.[index]) {
                    updatedMetricPack.metrics[index].included = e.currentTarget.checked
                    setMetricData(updatedMetricPack)
                    onChange?.(updatedMetricPack)
                  }
                }}
                className={css.included}
              />
              <Text width={200} lineClamp={1} color={Color.BLACK}>
                {metric.name}
              </Text>
            </li>
          ))}
        </ul>
      </Card>
    </Container>
  )
}
