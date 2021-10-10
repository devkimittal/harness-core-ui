import React, { useMemo, useRef, useLayoutEffect, useState } from 'react'
import { Container, Text } from '@wings-software/uicore'
import moment from 'moment'
import { Popover, PopoverInteractionKind, PopoverPosition } from '@blueprintjs/core'
import type { TimelineDataPoint, TimelineRowProps } from './TimelineRow.types'
import { getDataWithPositions } from './TimelineRow.utils'
import TimelineRowLoading from './components/TimelineRowLoading'
import TimelineRowNoData from './components/TimelineRowNoData'
import { DATE_FORMAT } from './TimelineRow.constants'
import css from './TimelineRow.module.scss'

export function TimelineRow(props: TimelineRowProps): JSX.Element {
  const { labelName, labelWidth, data, isLoading, noDataMessage, leftOffset = 0, startTimestamp, endTimestamp } = props
  const timelineRowRef = useRef<HTMLDivElement>(null)
  const [dataWithPositions, setDataWithPositions] = useState<TimelineDataPoint[]>([])
  useLayoutEffect(() => {
    if (!timelineRowRef?.current) {
      return
    }
    const containerWidth = (timelineRowRef.current.parentElement?.getBoundingClientRect().width || 0) - leftOffset
    setDataWithPositions(getDataWithPositions(containerWidth, startTimestamp, endTimestamp, data))
  }, [timelineRowRef?.current, data, endTimestamp, startTimestamp])

  const renderTimelineRow = useMemo(() => {
    if (isLoading) {
      return <TimelineRowLoading />
    } else if (noDataMessage) {
      return <TimelineRowNoData noDataMessage={noDataMessage} />
    }
    return (
      <Container className={css.timeline}>
        <hr />
        {dataWithPositions?.map((datum, index) => {
          const { icon, leftOffset: position, startTime, tooltip } = datum
          return (
            <Container
              key={`${datum.startTime}-${position}-${index}`}
              className={css.event}
              style={{ left: position, height: icon.height, width: icon.width }}
            >
              <Popover
                interactionKind={PopoverInteractionKind.HOVER}
                popoverClassName={css.timelineRowPopover}
                position={PopoverPosition.TOP}
                minimal
                content={
                  <Container className={css.tooltipContainer}>
                    <Container className={css.colorSidePanel} style={{ backgroundColor: tooltip?.sideBorderColor }} />
                    <Text>{tooltip?.message}</Text>
                    <Text>{moment(new Date(startTime)).format(DATE_FORMAT)}</Text>
                  </Container>
                }
              >
                {icon.url === 'diamond' ? (
                  <Container
                    className={css.singleEvent}
                    style={{ background: icon.fillColor, width: icon.width, height: icon.height }}
                  />
                ) : (
                  <svg height={icon.height} width={icon.width}>
                    <image href={icon.url} height={icon.height} width={icon.width} fill={icon.fillColor} />
                  </svg>
                )}
              </Popover>
            </Container>
          )
        })}
      </Container>
    )
  }, [isLoading, noDataMessage, dataWithPositions])

  return (
    <Container className={css.main} ref={timelineRowRef}>
      <Container key={labelName} className={css.timelineRow}>
        <Text lineClamp={1} width={labelWidth} className={css.rowLabel}>
          {labelName}
        </Text>
        {renderTimelineRow}
      </Container>
    </Container>
  )
}
