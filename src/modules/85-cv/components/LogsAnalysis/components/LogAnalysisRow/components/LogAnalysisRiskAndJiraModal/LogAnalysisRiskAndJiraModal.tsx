/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useCallback, useMemo } from 'react'
import { Container, Heading, Button, Text, Color, ButtonVariation, FontVariation } from '@wings-software/uicore'
import { Drawer } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import type { SampleDataProps, LogAnalysisRiskAndJiraModalProps } from './LogAnalysisRiskAndJiraModal.types'
import { ActivityHeadingContent } from './components/ActivityHeadingContent'
import useEventPreferenceUpdateModal from './components/EventPreferenceUpdateModal/EventPreferenceUpdateModal'
import { DrawerProps } from './LogAnalysisRiskAndJiraModal.constants'
import css from './LogAnalysisRiskAndJiraModal.module.scss'
import type { EventPreferenceForm } from './components/EventPreferenceUpdateModal/EventPreferenceUpdateModal.type'
import getLogAnalysisLineChartOptions from '../../LogAnalysisLineChartConfig'

export function SampleData(props: SampleDataProps): JSX.Element {
  const { logMessage } = props
  const { getString } = useStrings()
  return (
    <Container className={css.logMessageContainer}>
      <Text color={Color.BLACK} className={css.sampleEvent}>
        {getString('pipeline.verification.logs.sampleEvent')}
      </Text>
      <Text className={css.logMessage} lineClamp={30} tooltipProps={{ isOpen: false }} padding={{ top: 'small' }}>
        {logMessage}
      </Text>
    </Container>
  )
}

export function LogAnalysisRiskAndJiraModal(props: LogAnalysisRiskAndJiraModalProps): JSX.Element {
  const { onHide, rowData } = props
  const [isOpen, setOpen] = useState(true)
  // const [hasSubmitted, setSubmit] = useState(false)

  const { messageFrequency, count = 0, clusterType: activityType, message } = rowData

  const trendData = useMemo(() => getLogAnalysisLineChartOptions(messageFrequency || []), [messageFrequency])

  const { getString } = useStrings()
  const onHideCallback = useCallback(() => {
    setOpen(false)
    onHide()
  }, [onHide])

  const onSubmitOfEventPreferenceEdit = (values: EventPreferenceForm): void => {
    console.log('edit values', values)
  }

  const { openEventPreferenceEditModal } = useEventPreferenceUpdateModal({
    initialModalValue: {
      activityType
    },
    onSubmitOfEventPreferenceEdit
  })

  // const onSubmitCallback = useCallback(
  //   data => {
  //     setSubmit(false)
  //     setOpen(false)
  //     onHide(data)
  //   },
  //   [onHide]
  // )

  return (
    <Drawer {...DrawerProps} isOpen={isOpen} onClose={onHideCallback} className={css.main}>
      <Container className={css.headingContainer}>
        <Heading level={2} font={{ variation: FontVariation.H4 }}>
          {getString('pipeline.verification.logs.eventDetails')}
        </Heading>
        <Button variation={ButtonVariation.SECONDARY} onClick={() => openEventPreferenceEditModal()}>
          {getString('pipeline.verification.logs.updateEventPreference')}
        </Button>
        {/* <IconHeading /> */}
        {/* {} */}
      </Container>
      <Container className={css.formAndMessageContainer}>
        {/* <Formik initialValues={feedback ?? {}} onSubmit={onSubmitCallback}>
          {formikProps => <RiskAndMessageForm handleSubmit={formikProps.handleSubmit} hasSubmitted={hasSubmitted} />}
        </Formik> */}
        <Container>
          <ActivityHeadingContent activityType={activityType} trendData={trendData} count={count} />
          <SampleData logMessage={message} />
        </Container>
        <Container className={css.buttonContainer}>
          <Button onClick={() => onHide()}>{getString('back')}</Button>
          {/* <Button type="submit" intent="primary" onClick={() => setSubmit(true)}>
            {getString('save')}
          </Button> */}
        </Container>
      </Container>
    </Drawer>
  )
}
