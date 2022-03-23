/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useCallback } from 'react'
import { Container, Heading, Button, Text } from '@wings-software/uicore'
import { Drawer } from '@blueprintjs/core'
import { Color } from '@harness/design-system'
import HighchartsReact from 'highcharts-react-official'
import Highcharts from 'highcharts'
import { useStrings } from 'framework/strings'
import type {
  DataNameAndDataProps,
  ActivityHeadingContentProps,
  SampleDataProps,
  LogAnalysisRiskAndJiraModalProps
} from './LogAnalysisRiskAndJiraModal.types'
import { DrawerProps } from './LogAnalysisRiskAndJiraModal.constants'
import css from './LogAnalysisRiskAndJiraModal.module.scss'

export function DataNameAndData(props: DataNameAndDataProps): JSX.Element {
  const { dataName, data } = props
  return data ? (
    <Container className={css.dataNameData}>
      <Text color={Color.BLACK}>{dataName}</Text>
      <Text className={css.dataContent}>{data}</Text>
    </Container>
  ) : (
    <></>
  )
}

export function ActivityHeadingContent(props: ActivityHeadingContentProps): JSX.Element {
  const { count, trendData } = props
  const { getString } = useStrings()
  return (
    <Container className={css.activityContainer}>
      <DataNameAndData dataName={getString('instanceFieldOptions.instanceHolder')} data={count} />
      <Container className={css.trendChart}>
        <Text color={Color.BLACK}>{getString('pipeline.verification.logs.trend')}</Text>
        <Container className={css.chartContainer}>
          <HighchartsReact highchart={Highcharts} options={trendData} />
        </Container>
      </Container>
    </Container>
  )
}

// Note - This code will be uncommented once the backend support is available.

// function RiskAndMessageForm(props: RiskAndMessageFormProps): JSX.Element {
//   const { hasSubmitted, handleSubmit } = props
//   useEffect(() => {
//     if (hasSubmitted) {
//       handleSubmit()
//     }
//   }, [hasSubmitted, handleSubmit])
//   return (
//     <FormikForm className={css.formContainer}>
//       <FormInput.Select name="risk" items={RiskOptions} label="Risk" />
//       <FormInput.TextArea name="message" label="Message" className={css.message} />
//     </FormikForm>
//   )
// }

// function ShareLinkPopoverContent(): JSX.Element {
//   const [copiedToClipboard, setCopied] = useState(false)
//   const onCopyURLCallback = useCallback(() => {
//     Utils.copy(window.location.href)
//     setCopied(true)
//   }, [])
//   const { getString } = useStrings()
//   return (
//     <Container className={css.sharePopoverContent}>
//       <Container className={css.urlContent}>
//         <Text>{window.location.href}</Text>
//       </Container>
//       {!copiedToClipboard ? (
//         <Link withoutHref className={css.copyButton} onClick={onCopyURLCallback}>
//           {getString('pipeline.verification.logs.copyURL')}
//         </Link>
//       ) : (
//         <Container className={css.copySuccess}>
//           <Icon name="deployment-success-new" size={11} />
//           <Text>{getString('pipeline.verification.logs.urlCopied')}</Text>
//         </Container>
//       )}
//     </Container>
//   )
// }

// function IconHeading(): JSX.Element {
//   const popoverContent = <ShareLinkPopoverContent />
//   const { getString } = useStrings()
//   return (
//     <Container flex>
//       <Container className={css.iconContainer}>
//         <Popover {...ShareContentPopoverProps} content={popoverContent}>
//           <Container flex>
//             <Icon name="main-share" className={css.logo} />
//             <Text>{getString('pipeline.verification.logs.share')}</Text>
//           </Container>
//         </Popover>
//       </Container>
//     </Container>
//   )
// }

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
  const {
    onHide,
    activityType,
    count,
    trendData,
    logMessage
    // feedback
  } = props
  const [isOpen, setOpen] = useState(true)
  // const [hasSubmitted, setSubmit] = useState(false)
  const { getString } = useStrings()
  const onHideCallback = useCallback(() => {
    setOpen(false)
    onHide()
  }, [onHide])
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
        <Heading level={2} color={Color.BLACK} padding={{ bottom: 'small' }}>
          {activityType}
        </Heading>
        {/* <IconHeading /> */}
      </Container>
      <Container className={css.formAndMessageContainer}>
        {/* <Formik initialValues={feedback ?? {}} onSubmit={onSubmitCallback}>
          {formikProps => <RiskAndMessageForm handleSubmit={formikProps.handleSubmit} hasSubmitted={hasSubmitted} />}
        </Formik> */}
        <Container>
          <ActivityHeadingContent trendData={trendData} count={count} />
          <SampleData logMessage={logMessage} />
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
