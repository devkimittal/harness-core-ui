/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react'
import cx from 'classnames'
import { Layout, Container, StepsProgress, Button, Card, Icon, Text, ButtonVariation } from '@wings-software/uicore'
import { Color, Intent } from '@harness/design-system'
import { String, useStrings } from 'framework/strings'
import type { ConnectedArgoGitOpsInfoDTO } from 'services/cd-ng'
import type { BaseProviderStepProps } from '../../types'
import css from './TestConnection.module.scss'

export enum Status {
  PROCESS = 'PROCESS',
  DONE = 'DONE',
  ERROR = 'ERROR'
}

type TestConnectionProps = BaseProviderStepProps

export default function TestConnection(props: TestConnectionProps): React.ReactElement {
  const [currentStep] = useState(1)
  const [currentStatus, setCurrentStatus] = useState<Status>(Status.PROCESS)
  const [currentIntent, setCurrentIntent] = useState<Intent>(Intent.NONE)
  const url = (props?.prevStepData?.spec as ConnectedArgoGitOpsInfoDTO)?.adapterUrl
  const healthCheckURL = url?.endsWith('/') ? `${url}api/version` : `${url}/api/version`
  const stepName = (
    <String
      stringID="cd.testConnectionStepName"
      vars={{
        url: healthCheckURL
      }}
      useRichText
    />
  )

  const { getString } = useStrings()
  const handleSuccess = (): void => {
    props.onClose?.()
  }

  const launchArgoDashboard = (): void => {
    const provider = props?.prevStepData
    props.onLaunchArgoDashboard?.(provider)
  }

  const validateAdapterURL = (): void => {
    fetch(healthCheckURL)
      .then(() => {
        setCurrentStatus(Status.DONE)
        setCurrentIntent(Intent.SUCCESS)
      })
      .catch(() => {
        setCurrentStatus(Status.ERROR)
        setCurrentIntent(Intent.DANGER)
      })
  }

  useEffect(() => {
    validateAdapterURL()
  }, [])

  return (
    <Layout.Vertical className={css.stepContainer}>
      <div className={css.heading}>Test Connection</div>

      <Container className={css.connectorForm}>
        <Container style={{ minHeight: 460 }}>
          <Layout.Vertical spacing="large" className={css.stepFormContainer}>
            <StepsProgress
              steps={[stepName]}
              intent={currentIntent}
              current={currentStep}
              currentStatus={currentStatus}
            />

            {(currentStatus === Status.DONE || currentStatus === Status.ERROR) && (
              <div className={cx(css.validationStatus, { [css.success]: currentStatus === Status.DONE })}>
                {currentStatus === Status.DONE ? (
                  <> {getString('common.test.connectionSuccessful')} </>
                ) : (
                  <Card className={css.card}>
                    <Text color={Color.RED_700} font={{ weight: 'semi-bold' }} style={{ marginBottom: '16px' }}>
                      {getString('cd.notReachable')}
                      <a href={url} target="_blank" rel="noreferrer">
                        {healthCheckURL}
                      </a>
                    </Text>
                    <div className={css.issueInfo}>
                      <Icon color={Color.GREY_700} name="info" style={{ marginRight: '8px' }}></Icon>
                      <String stringID="cd.connectionIssueInfo" useRichText />
                    </div>

                    <div className={css.issueSuggestion}>
                      <Icon color={Color.GREY_700} name="lightbulb" style={{ marginRight: '8px' }}></Icon>
                      <String stringID="cd.connectionIssueSuggestion" useRichText />
                    </div>
                  </Card>
                )}
              </div>
            )}
          </Layout.Vertical>
        </Container>

        <Layout.Horizontal spacing="large">
          {currentStatus === Status.ERROR && (
            <Button
              variation={ButtonVariation.SECONDARY}
              text={getString('back')}
              icon="chevron-left"
              onClick={() => props?.previousStep?.(props?.prevStepData)}
              data-name="commonGitBackButton"
            />
          )}
          <Button
            variation={currentStatus === Status.ERROR ? ButtonVariation.PRIMARY : ButtonVariation.SECONDARY}
            text={getString('finish')}
            onClick={handleSuccess}
            className={css.nextButton}
          />

          {currentStatus === Status.DONE && (
            <Button
              variation={ButtonVariation.PRIMARY}
              text={getString('cd.launchArgo')}
              onClick={launchArgoDashboard}
              className={css.nextButton}
            />
          )}
        </Layout.Horizontal>
      </Container>
    </Layout.Vertical>
  )
}
