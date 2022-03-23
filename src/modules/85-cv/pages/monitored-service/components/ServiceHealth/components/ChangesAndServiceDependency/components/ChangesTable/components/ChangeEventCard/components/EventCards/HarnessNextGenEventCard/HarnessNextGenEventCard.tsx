/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import { Divider } from '@blueprintjs/core'
import { Card, Container, Text } from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import type { ChangeEventDTO, VerifyStepSummary } from 'services/cv'
import { useStrings } from 'framework/strings'
import { verificationResultToIcon } from '@cv/components/ActivitiesTimelineView/TimelineTooltip'
import VerificationStatusCard from '@cv/components/ExecutionVerification/components/DeploymentProgressAndNodes/components/VerificationStatusCard/VerificationStatusCard'
import type { EventData } from '@cv/components/ActivitiesTimelineView/ActivitiesTimelineView'
import ChangeEventServiceHealth from '@cv/pages/monitored-service/components/ServiceHealth/components/ChangesAndServiceDependency/components/ChangesTable/components/ChangeCard/components/ChangeEventServiceHealth/ChangeEventServiceHealth'
import type { ChangeTitleData, ChangeDetailsDataInterface } from '../../../ChangeEventCard.types'
import { createChangeTitleData, createChangeDetailsData } from '../../../ChangeEventCard.utils'
import ChangeDetails from '../../ChangeDetails/ChangeDetails'
import ChangeTitle from '../../ChangeTitle/ChangeTitle'
import DeploymentTimeDuration from '../../DeploymentTimeDuration/DeploymentTimeDuration'
import css from '../../../ChangeEventCard.module.scss'

export default function HarnessNextGenEventCard({ data }: { data: ChangeEventDTO }): JSX.Element {
  const { getString } = useStrings()
  const changeTitleData: ChangeTitleData = useMemo(() => createChangeTitleData(data), [])
  const changeDetailsData: ChangeDetailsDataInterface = useMemo(() => createChangeDetailsData(data), [])

  const { artifactType = '', artifactTag = '', verifyStepSummaries = [] } = data?.metadata || {}
  const changeInfoData = { artifactType, artifactTag }

  const summary: {
    name: string
    verificationStatus: string
  }[] = verifyStepSummaries

  return (
    <Card className={css.main}>
      <ChangeTitle changeTitleData={changeTitleData} />
      <Divider className={css.divider} />
      <ChangeDetails ChangeDetailsData={changeDetailsData} />
      <Divider className={css.divider} />
      <Container>
        <Text font={{ size: 'medium', weight: 'bold' }} color={Color.GREY_800}>
          {getString('cv.changeSource.changeSourceCard.information')}
        </Text>
        <ChangeDetails ChangeDetailsData={{ details: changeInfoData }} />
        <DeploymentTimeDuration
          startTime={data?.metadata?.deploymentStartTime}
          endTime={data?.metadata?.deploymentEndTime}
        />
      </Container>
      <Divider className={css.divider} />
      {summary?.length ? (
        <Container margin={{ bottom: 'var(--spacing-small)' }}>
          <Text font={{ size: 'medium', weight: 'bold' }} color={Color.GREY_800}>
            {getString('cv.changeSource.changeSourceCard.deploymentHealth')}
          </Text>
          <Container className={css.verificationContainer}>
            {summary?.map(item => {
              const icon = verificationResultToIcon(item.verificationStatus as EventData['verificationResult'])
              return (
                <Container className={css.flexColumn} key={item.name}>
                  <Text icon={icon} className={css.summarylabel} font={{ size: 'xsmall' }} color={Color.GREY_400}>
                    {item.name}
                  </Text>
                  <VerificationStatusCard status={item.verificationStatus as VerifyStepSummary['verificationStatus']} />
                </Container>
              )
            })}
          </Container>
        </Container>
      ) : null}
      {data?.eventTime && data.monitoredServiceIdentifier && (
        <ChangeEventServiceHealth
          monitoredServiceIdentifier={data.monitoredServiceIdentifier}
          startTime={data.eventTime}
          eventType={data.type}
        />
      )}
    </Card>
  )
}
