/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  Container,
  Icon,
  Pagination,
  Select,
  Heading,
  NoDataCard,
  Layout,
  PageError,
  Card
} from '@wings-software/uicore'
import { FontVariation, Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import { useGetAllLogsClusterData, useGetAllLogsData } from 'services/cv'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import { HealthSourceDropDown } from '@cv/components/HealthSourceDropDown/HealthSourceDropDown'
import noDataImage from '@cv/assets/noData.svg'
import { LogAnalysisRow } from './components/LogAnalysisRow/LogAnalysisRow'
import { getClusterTypes, getLogAnalysisTableData } from './LogAnalysis.utils'
import { LogAnalysisContentProps, LogAnalysisProps, LogEvents } from './LogAnalysis.types'
import { PAGE_SIZE } from './LogAnalysis.constants'
import ClusterChart from './components/ClusterChart/ClusterChart'
import { VerificationType } from '../HealthSourceDropDown/HealthSourceDropDown.constants'
import css from './LogAnalysis.module.scss'

const ClusterChartContainer: React.FC<LogAnalysisContentProps> = ({
  monitoredServiceIdentifier,
  startTime,
  endTime,
  logEvent,
  healthSource
}) => {
  const { getString } = useStrings()
  const { orgIdentifier, projectIdentifier, accountId } = useParams<ProjectPathProps>()

  const { data, loading, error, refetch } = useGetAllLogsClusterData({
    queryParams: {
      accountId,
      orgIdentifier,
      projectIdentifier,
      monitoredServiceIdentifier,
      startTime,
      endTime,
      ...(logEvent ? { clusterTypes: [logEvent] } : {}),
      healthSources: healthSource ? [healthSource] : undefined
    },
    queryParamStringifyOptions: {
      arrayFormat: 'repeat'
    }
  })

  if (loading) {
    return (
      <Container flex={{ justifyContent: 'center' }} margin={{ top: 'xxxlarge' }}>
        <Icon name="steps-spinner" color={Color.GREY_400} size={30} />
      </Container>
    )
  }

  if (error) {
    return <PageError message={getErrorMessage(error)} onClick={() => refetch()} />
  }

  if (!data?.resource?.length) {
    return (
      <NoDataCard
        image={noDataImage}
        imageClassName={css.logClusterNoDataImage}
        className={css.noData}
        containerClassName={css.noDataContainer}
        message={getString('cv.monitoredServices.noAvailableData')}
      />
    )
  }

  return <ClusterChart data={data.resource} />
}

const LogAnalysisContent: React.FC<LogAnalysisContentProps> = ({
  monitoredServiceIdentifier,
  startTime,
  endTime,
  logEvent,
  healthSource
}) => {
  const { getString } = useStrings()
  const { orgIdentifier, projectIdentifier, accountId } = useParams<ProjectPathProps>()

  const queryParams = useMemo(() => {
    return {
      page: 0,
      size: PAGE_SIZE,
      accountId,
      orgIdentifier,
      projectIdentifier,
      monitoredServiceIdentifier,
      startTime,
      endTime,
      ...(logEvent ? { clusterTypes: [logEvent] } : {}),
      healthSources: healthSource ? [healthSource] : undefined
    }
  }, [
    accountId,
    endTime,
    healthSource,
    logEvent,
    orgIdentifier,
    projectIdentifier,
    monitoredServiceIdentifier,
    startTime
  ])

  const { data, refetch, loading, error } = useGetAllLogsData({
    queryParams,
    queryParamStringifyOptions: {
      arrayFormat: 'repeat'
    }
  })

  if (loading) {
    return (
      <Container flex={{ justifyContent: 'center' }} className={css.loadingContainer}>
        <Icon name="steps-spinner" color={Color.GREY_400} size={30} />
      </Container>
    )
  }

  if (error) {
    return <PageError message={getErrorMessage(error)} onClick={() => refetch()} />
  }

  if (!data?.resource?.content?.length) {
    return (
      <NoDataCard
        message={getString('cv.monitoredServices.noAvailableData')}
        image={noDataImage}
        containerClassName={css.logsAnalysisNoData}
      />
    )
  }

  const { pageSize = 0, totalPages = 0, totalItems = 0, pageIndex = 0 } = data.resource

  return (
    <>
      <LogAnalysisRow data={getLogAnalysisTableData(data.resource.content)} />
      <Pagination
        pageSize={pageSize}
        pageCount={totalPages}
        itemCount={totalItems}
        pageIndex={pageIndex}
        gotoPage={index => refetch({ queryParams: { ...queryParams, page: index } })}
      />
    </>
  )
}

const LogAnalysis: React.FC<LogAnalysisProps> = ({ monitoredServiceIdentifier, startTime, endTime }) => {
  const { getString } = useStrings()

  const [logEvent, setLogEvent] = useState<LogEvents>(LogEvents.UNKNOWN)
  const [healthSource, setHealthSource] = useState<string>()

  const clusterTypes = getClusterTypes(getString)

  return (
    <div className={css.container}>
      <Layout.Horizontal spacing="medium" margin={{ bottom: 'medium' }}>
        <Select
          items={clusterTypes}
          defaultSelectedItem={clusterTypes[2]}
          className={css.logsAnalysisFilters}
          inputProps={{ placeholder: getString('pipeline.verification.logs.filterByClusterType') }}
          onChange={item => setLogEvent(item.value as LogEvents)}
        />
        <HealthSourceDropDown
          onChange={setHealthSource}
          className={css.logsAnalysisFilters}
          monitoredServiceIdentifier={monitoredServiceIdentifier}
          verificationType={VerificationType.LOG}
        />
      </Layout.Horizontal>

      <Card className={css.clusterChart}>
        <Heading level={2} font={{ variation: FontVariation.CARD_TITLE }}>
          {getString('pipeline.verification.logs.logCluster')}
        </Heading>
        <ClusterChartContainer
          monitoredServiceIdentifier={monitoredServiceIdentifier}
          startTime={startTime}
          endTime={endTime}
          logEvent={logEvent}
          healthSource={healthSource}
        />
      </Card>

      <LogAnalysisContent
        monitoredServiceIdentifier={monitoredServiceIdentifier}
        startTime={startTime}
        endTime={endTime}
        logEvent={logEvent}
        healthSource={healthSource}
      />
    </div>
  )
}

export default LogAnalysis
