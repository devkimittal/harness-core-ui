/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import _refiner from 'refiner-js'
import { Button, ButtonVariation, Layout, Text } from '@wings-software/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import css from './ResourceCenter.module.scss'

type FeedbackProps = {
  label: string
}
const refinerProjectId = window.refinerProjectToken
const refinerSurveryId = window.refinerFeedbackToken

const Feedback = ({ label }: FeedbackProps): React.ReactElement => {
  const [buttonDisabled, setButtonDisabled] = useState(false)

  const { currentUserInfo } = useAppStore()

  useEffect(() => {
    _refiner('dismissForm', refinerSurveryId)
    _refiner('setProject', refinerProjectId)

    // callback function so that upon survey completion,
    // the feedback button will be disabled for 6s
    _refiner('onComplete', function () {
      setButtonDisabled(true)
      setTimeout(function () {
        setButtonDisabled(false)
      }, 6000)
    })
  }, [])

  const refinerSurvey = (): void => {
    _refiner('identifyUser', {
      email: currentUserInfo.email,
      id: currentUserInfo.email
    })
    _refiner('showForm', refinerSurveryId, true)
  }

  return (
    <Layout.Horizontal
      padding={{ bottom: 'medium' }}
      flex={{ justifyContent: 'space-between' }}
      className={css.bottomBorder}
    >
      <Layout.Vertical>
        <Text
          font={{ variation: FontVariation.H4 }}
          padding={{ bottom: 'xsmall' }}
          color={buttonDisabled ? Color.GREY_300 : Color.PRIMARY_3}
        >
          {label}
        </Text>
      </Layout.Vertical>
      <Layout.Horizontal flex={{ alignItems: 'center' }} spacing={'medium'}>
        <Button
          disabled={buttonDisabled}
          icon="chevron-right"
          variation={ButtonVariation.ICON}
          iconProps={buttonDisabled ? { color: Color.GREY_300 } : { color: Color.PRIMARY_4 }}
          onClick={refinerSurvey}
          data-testid="feedback"
        />
      </Layout.Horizontal>
    </Layout.Horizontal>
  )
}

export default Feedback
