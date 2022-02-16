/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Container } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import {
  useGetDeploymentLogAnalysisResult,
  useGetDeploymentLogAnalysisClusters,
  RestResponsePageLogAnalysisClusterDTO
} from 'services/cv'
import { useToaster } from '@common/exports'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import LogAnalysis from './LogAnalysis'
import { pageSize, initialPageNumber, POLLING_INTERVAL, StepStatus } from './LogAnalysis.constants'
import type { ClusterTypes } from './LogAnalysisView.container.types'
import type { LogAnalysisContainerProps } from './LogAnalysis.types'
import { getActivityId } from '../../ExecutionVerificationView.utils'
import { getClusterTypes } from './LogAnalysis.utils'
import ClusterTypeFiltersForLogs from './components/ClusterTypeFiltersForLogs'
import css from './LogAnalysisView.container.module.scss'

export default function LogAnalysisContainer({
  step,
  hostName,
  isErrorTracking
}: LogAnalysisContainerProps): React.ReactElement {
  const { accountId } = useParams<AccountPathProps>()
  const { showError } = useToaster()
  const { getString } = useStrings()
  const [clusterTypeFilters, setClusterTypeFilters] = useState<ClusterTypes>(
    () => getClusterTypes(getString).map(i => i.value) as ClusterTypes
  )
  const [selectedHealthSource, setSelectedHealthSource] = useState<string>()
  const [logsDataState, setLogsDataState] = useState<RestResponsePageLogAnalysisClusterDTO | null>(null)
  const [pollingIntervalId, setPollingIntervalId] = useState<any>(-1)
  const activityId = useMemo(() => getActivityId(step), [step])

  const logsAnalysisQueryParams = useMemo(() => {
    return {
      accountId,
      pageNumber: initialPageNumber,
      pageSize,
      ...(hostName && { hostName }),
      clusterTypes: clusterTypeFilters?.length ? clusterTypeFilters : undefined,
      healthSources: selectedHealthSource ? [selectedHealthSource] : undefined
    }
  }, [accountId, hostName, clusterTypeFilters, selectedHealthSource])

  const clusterAnalysisQueryParams = useMemo(() => {
    return {
      accountId,
      ...(hostName && { hostName }),
      clusterTypes: clusterTypeFilters?.length ? clusterTypeFilters : undefined,
      healthSources: selectedHealthSource ? [selectedHealthSource] : undefined
    }
  }, [accountId, hostName, clusterTypeFilters, selectedHealthSource])

  const {
    data: logsData,
    loading: logsLoading,
    error: logsError,
    refetch: fetchLogAnalysis
  } = useGetDeploymentLogAnalysisResult({
    activityId: activityId as unknown as string,
    queryParams: logsAnalysisQueryParams,
    queryParamStringifyOptions: {
      arrayFormat: 'repeat'
    },
    lazy: true
  })

  const {
    data: clusterChartData,
    loading: clusterChartLoading,
    error: clusterChartError,
    refetch: fetchClusterAnalysis
  } = useGetDeploymentLogAnalysisClusters({
    activityId: activityId as unknown as string,
    queryParams: clusterAnalysisQueryParams,
    queryParamStringifyOptions: {
      arrayFormat: 'repeat'
    },
    lazy: true
  })

  // useEffect(() => {
  //   console.log('data', logsData)
  //   console.log('logsLoading', logsLoading)
  //   // console.log('clusterTypeFilters', clusterTypeFilters)
  //   if (!logsLoading) {
  //     setLogsDataState(() => {
  //       return { ...logsData }
  //     })
  //   }
  // }, [logsData, logsLoading, clusterAnalysisQueryParams, logsAnalysisQueryParams])

  const logsData2 = useMemo(() => ({ ...logsData }), [logsData])

  // Fetching logs and cluster data for selected cluster type
  useEffect(() => {
    fetchLogsDataForCluster(clusterTypeFilters)
    fetchLogsClusterDataForCluster(clusterTypeFilters)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clusterTypeFilters])

  useEffect(() => {
    if (logsError) showError(logsError.message)
    if (clusterChartError) showError(clusterChartError.message)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logsError, clusterChartError])

  // Fetching logs and cluster data when different host name or activityId is selected
  useEffect(() => {
    Promise.all([
      fetchLogAnalysis({ queryParams: logsAnalysisQueryParams }),
      fetchClusterAnalysis({ queryParams: clusterAnalysisQueryParams })
    ])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hostName, activityId])

  // Polling for Logs and Cluster Chart data
  useEffect(() => {
    let intervalId = pollingIntervalId
    clearInterval(intervalId)
    if (step?.status === StepStatus.Running || step?.status === StepStatus.AsyncWaiting) {
      intervalId = setInterval(() => {
        Promise.all([
          fetchLogAnalysis({ queryParams: logsAnalysisQueryParams }),
          fetchClusterAnalysis({ queryParams: clusterAnalysisQueryParams })
        ])
      }, POLLING_INTERVAL)
      setPollingIntervalId(intervalId)
    }
    return () => clearInterval(intervalId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clusterAnalysisQueryParams, logsAnalysisQueryParams, step?.status])

  const handleFilterChange = useCallback((checked: boolean, filterName: string): void => {
    setClusterTypeFilters((currentFilters: any) => {
      if (checked) {
        return [...(currentFilters as string[]), filterName]
      } else {
        return currentFilters?.filter((item: string) => item !== filterName)
      }
    })
  }, [])

  const fetchLogsDataForCluster = useCallback(
    appliedClusterTypeFilters => {
      fetchLogAnalysis({
        queryParams: {
          ...logsAnalysisQueryParams,
          clusterTypes: appliedClusterTypeFilters.length ? [appliedClusterTypeFilters] : undefined
        }
      })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [logsAnalysisQueryParams]
  )

  const fetchLogsClusterDataForCluster = useCallback(
    appliedClusterTypeFilters => {
      fetchClusterAnalysis({
        queryParams: {
          ...clusterAnalysisQueryParams,
          clusterTypes: appliedClusterTypeFilters.length ? [appliedClusterTypeFilters] : undefined
        }
      })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [logsAnalysisQueryParams]
  )

  const goToLogsPage = useCallback(
    pageNumber => {
      fetchLogAnalysis({
        queryParams: { ...logsAnalysisQueryParams, pageNumber }
      })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [logsAnalysisQueryParams]
  )

  return (
    <Container className={css.main}>
      <ClusterTypeFiltersForLogs
        totalClustersCount={200}
        clusterTypeFilters={clusterTypeFilters}
        onFilterChange={handleFilterChange}
      />
      <Container className={css.divider} />
      <LogAnalysis
        data={logsData2}
        clusterChartData={clusterChartData}
        logsLoading={logsLoading}
        clusterChartLoading={clusterChartLoading}
        goToPage={goToLogsPage}
        onChangeHealthSource={setSelectedHealthSource}
        activityId={activityId}
        isErrorTracking={isErrorTracking}
      />
    </Container>
  )
}
