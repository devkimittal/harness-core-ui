/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container } from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import type { VerifyStepSummary } from 'services/cv'
import { useStrings } from 'framework/strings'
import css from './VerificationStatusCard.module.scss'

export default function VerificationStatusCard({ status }: { status: VerifyStepSummary['verificationStatus'] }) {
  let statusMessage: string | undefined = undefined
  let color: Color | undefined = undefined
  let backgroundColor: Color | undefined = undefined
  const { getString } = useStrings()
  switch (status) {
    case 'IN_PROGRESS':
      statusMessage = getString('inProgress')
      color = Color.PRIMARY_2
      backgroundColor = Color.PRIMARY_6
      break
    case 'VERIFICATION_FAILED':
      statusMessage = getString('failed')
      color = Color.RED_500
      backgroundColor = Color.RED_200
      break
    case 'ERROR':
      statusMessage = getString('error')
      color = Color.RED_500
      backgroundColor = Color.RED_200
      break
    case 'VERIFICATION_PASSED':
      statusMessage = getString('passed')
      color = Color.GREEN_700
      backgroundColor = Color.GREEN_350
      break
    default:
      statusMessage = undefined
  }
  if (!statusMessage) {
    return null
  }
  return (
    <Container className={css.verificationStatusCard} color={color} background={backgroundColor}>
      {statusMessage}
    </Container>
  )
}
