/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { FontVariation, Heading, Layout, Container, Text, Color, Select, Checkbox, SelectOption } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import { useGetVerifyStepDeploymentActivitySummary, useGetVerifyStepHealthSources } from 'services/cv'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { getHealthSourceOptions } from '../useLogContentHook.utils'
import type { ExecutionLogHeaderProps } from '../useLogContentHook.types'
import css from '../useLogContentHook.module.scss'

const ExecutionLogHeader: React.FC<ExecutionLogHeaderProps> = ({
  activityId,
  healthSource,
  setHealthSource,
  errorLogsOnly,
  setErrorLogsOnly,
  actions,
  setPageNumber
}) => {
  const { getString } = useStrings()
  const { accountId } = useParams<AccountPathProps>()

  const { data: verifyStepDeploymentActivitySummary } = useGetVerifyStepDeploymentActivitySummary({
    queryParams: { accountId },
    verifyStepExecutionId: activityId
  })

  const { serviceName, envName } = verifyStepDeploymentActivitySummary?.resource ?? {}

  const { data, loading } = useGetVerifyStepHealthSources({
    verifyStepExecutionId: activityId,
    queryParams: {
      accountId
    }
  })

  const handleHealthSource = (_healthSource: SelectOption): void => {
    if (_healthSource.value !== healthSource.value) {
      actions.resetExecutionLogs()
      setPageNumber(0)
      setHealthSource(_healthSource)
    }
  }

  const handleDisplayOnlyErrors = (e: React.FormEvent<HTMLInputElement>): void => {
    actions.resetExecutionLogs()
    setPageNumber(0)
    setErrorLogsOnly(e.currentTarget.checked)
  }

  return (
    <div>
      <Heading level={2} font={{ variation: FontVariation.FORM_TITLE }} padding="xlarge" border={{ bottom: true }}>
        {getString('cv.executionLogs')}
      </Heading>
      <Layout.Horizontal padding="xlarge" spacing="medium">
        <Container>
          <Text font={{ variation: FontVariation.TINY_SEMI }} color={Color.GREY_400}>
            {getString('connectors.cdng.monitoredService.label')}
          </Text>
          <Text
            inline
            color={Color.BLACK}
            font={{ variation: FontVariation.TINY, weight: 'bold' }}
            padding={{ right: 'xsmall' }}
          >
            {serviceName}
          </Text>
          <Text inline font={{ variation: FontVariation.TINY_SEMI }} color={Color.GREY_700}>
            {envName}
          </Text>
        </Container>
        <Container border={{ left: true }} />
        <Select
          value={{
            label: `${getString('pipeline.verification.healthSourceLabel')}: ${healthSource.label}`,
            value: healthSource.value
          }}
          items={getHealthSourceOptions(getString, data?.resource)}
          onChange={handleHealthSource}
          disabled={loading}
          className={css.healthSource}
        />
        <Checkbox
          label={getString('cv.displayOnlyErrors')}
          checked={errorLogsOnly}
          onChange={handleDisplayOnlyErrors}
        />
      </Layout.Horizontal>
    </div>
  )
}

export default ExecutionLogHeader
