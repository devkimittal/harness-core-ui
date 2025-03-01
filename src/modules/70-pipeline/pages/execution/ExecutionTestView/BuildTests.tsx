/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Layout, Select, Heading, Container, Text, SelectOption, PageError } from '@wings-software/uicore'
import { Color, FontVariation } from '@harness/design-system'
import React, { useState, useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { get, uniqWith, isEqual, orderBy } from 'lodash-es'
import { useStrings } from 'framework/strings'
import {
  useReportSummary,
  useGetToken,
  useTestOverview,
  useReportsInfo,
  useTestInfo,
  TestReportSummary,
  SelectionOverview
} from 'services/ti-service'
import { PageSpinner } from '@common/components'
import { useExecutionContext } from '@pipeline/context/ExecutionContext'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { BuildZeroState } from './BuildZeroState'
import { TestsExecution } from './TestsExecution'
import { TestsOverview } from './TestsOverview'
import { TestsExecutionResult } from './TestsExecutionResult'
import { TestsSelectionBreakdown } from './TestsSelectionBreakdown'
import { TICallToAction } from './TICallToAction'
import { AllOption, AllStepsOption, AllStagesOption, getOptionalQueryParamKeys } from './TestsUtils'
// import { TestsCoverage } from './TestsCoverage'
import css from './BuildTests.module.scss'

/* eslint-disable @typescript-eslint/no-shadow */
enum UI {
  TIAndReports,
  TI,
  Reports,
  ZeroState,
  LoadingState
}
/* eslint-enable @typescript-eslint/no-shadow */

interface BuildTestsProps {
  reportSummaryMock?: TestReportSummary
  testOverviewMock?: SelectionOverview
}

const renderTestsOverview = ({
  testOverviewData,
  testsCountDiff
}: {
  testOverviewData?: SelectionOverview | null
  testsCountDiff?: number
}): JSX.Element | null => {
  if (
    typeof testOverviewData?.total_tests !== 'undefined' &&
    typeof testOverviewData?.skipped_tests !== 'undefined' &&
    typeof testOverviewData?.time_saved_ms !== 'undefined' &&
    typeof testOverviewData?.time_taken_ms !== 'undefined'
  ) {
    return (
      <TestsOverview
        totalTests={testOverviewData.total_tests}
        skippedTests={testOverviewData.skipped_tests}
        timeSavedMS={testOverviewData.time_saved_ms}
        durationMS={testOverviewData.time_taken_ms}
        testsCountDiff={testsCountDiff}
      />
    )
  }
  return null
}

export function TIAndReports({
  header,
  testOverviewData,
  reportSummaryData,
  stageId,
  stepId,
  serviceToken,
  testsCountDiff,
  isAggregatedReports
}: {
  header: JSX.Element
  testOverviewData?: SelectionOverview | null
  reportSummaryData?: TestReportSummary | null
  stageId?: string
  stepId?: string
  serviceToken?: string | null
  testsCountDiff?: number
  isAggregatedReports?: boolean
}): JSX.Element {
  return (
    <>
      {header}
      <Layout.Horizontal spacing="large" margin={{ bottom: 'xlarge' }}>
        {renderTestsOverview({ testOverviewData, testsCountDiff })}
        {typeof reportSummaryData?.total_tests !== 'undefined' &&
          typeof reportSummaryData?.failed_tests !== 'undefined' &&
          typeof reportSummaryData?.successful_tests !== 'undefined' &&
          typeof reportSummaryData?.skipped_tests !== 'undefined' && (
            <TestsExecutionResult
              totalTests={reportSummaryData.total_tests}
              failedTests={reportSummaryData.failed_tests}
              successfulTests={reportSummaryData.successful_tests}
              skippedTests={reportSummaryData.skipped_tests}
            />
          )}
        {typeof testOverviewData?.selected_tests?.source_code_changes !== 'undefined' &&
          typeof testOverviewData?.selected_tests?.new_tests !== 'undefined' &&
          typeof testOverviewData?.selected_tests?.updated_tests !== 'undefined' && (
            <TestsSelectionBreakdown
              sourceCodeChanges={testOverviewData.selected_tests.source_code_changes}
              newTests={testOverviewData.selected_tests.new_tests}
              updatedTests={testOverviewData.selected_tests.updated_tests}
            />
          )}
      </Layout.Horizontal>
      <Layout.Horizontal spacing="large">
        {/* <TestsCoverage /> */}
        {/* TI is above Reports which is 100% width */}
        {stageId && stepId && serviceToken && (
          <TestsExecution
            stageId={stageId}
            stepId={stepId}
            serviceToken={serviceToken}
            showCallGraph
            isAggregatedReports={isAggregatedReports}
          />
        )}
      </Layout.Horizontal>
    </>
  )
}

export function TI({
  header,
  testOverviewData,
  testsCountDiff
}: {
  header: JSX.Element
  testOverviewData?: SelectionOverview | null
  testsCountDiff?: number
}): JSX.Element {
  return (
    <>
      {header}
      <Layout.Horizontal spacing="large" margin={{ bottom: 'xlarge' }}>
        {renderTestsOverview({ testOverviewData, testsCountDiff })}
        {typeof testOverviewData?.selected_tests?.source_code_changes !== 'undefined' &&
          typeof testOverviewData?.selected_tests?.new_tests !== 'undefined' &&
          typeof testOverviewData?.selected_tests?.updated_tests !== 'undefined' && (
            <TestsSelectionBreakdown
              sourceCodeChanges={testOverviewData.selected_tests.source_code_changes}
              newTests={testOverviewData.selected_tests.new_tests}
              updatedTests={testOverviewData.selected_tests.updated_tests}
            />
          )}
      </Layout.Horizontal>
    </>
  )
}

export function Reports({
  header,
  reportSummaryData,
  stageId,
  stepId,
  serviceToken,
  testsCountDiff
}: {
  header: JSX.Element
  reportSummaryData?: TestReportSummary | null
  stageId?: string
  stepId?: string
  serviceToken?: string | null
  testsCountDiff?: number
}): JSX.Element {
  const { NG_LICENSES_ENABLED } = useFeatureFlags()

  return (
    <>
      {header}
      <Layout.Horizontal spacing="large" margin={{ bottom: 'xlarge' }}>
        {typeof reportSummaryData?.total_tests !== 'undefined' &&
          typeof reportSummaryData?.skipped_tests !== 'undefined' &&
          typeof reportSummaryData?.duration_ms !== 'undefined' &&
          typeof reportSummaryData?.failed_tests !== 'undefined' && (
            <TestsOverview
              totalTests={reportSummaryData.total_tests}
              skippedTests={reportSummaryData.skipped_tests}
              // timeSavedMS={reportSummaryData.time_saved_ms}
              durationMS={reportSummaryData.duration_ms}
              failedTests={reportSummaryData.failed_tests}
              testsCountDiff={testsCountDiff}
            />
          )}
        {typeof reportSummaryData?.total_tests !== 'undefined' &&
          typeof reportSummaryData?.failed_tests !== 'undefined' &&
          typeof reportSummaryData?.successful_tests !== 'undefined' &&
          typeof reportSummaryData?.skipped_tests !== 'undefined' && (
            <TestsExecutionResult
              totalTests={reportSummaryData.total_tests}
              failedTests={reportSummaryData.failed_tests}
              successfulTests={reportSummaryData.successful_tests}
              skippedTests={reportSummaryData.skipped_tests}
            />
          )}
        {NG_LICENSES_ENABLED && <TICallToAction />}
      </Layout.Horizontal>
      <Layout.Horizontal spacing="large">
        {/* <TestsCoverage /> */}
        {/* TI is above Reports which is 100% width */}
        {stageId && stepId && serviceToken && (
          <TestsExecution stageId={stageId} stepId={stepId} serviceToken={serviceToken} />
        )}
      </Layout.Horizontal>
    </>
  )
}
function BuildTests({ reportSummaryMock, testOverviewMock }: BuildTestsProps): React.ReactElement | null {
  const context = useExecutionContext()
  const { getString } = useStrings()

  const { accountId, orgIdentifier, projectIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()

  const {
    data: serviceToken,
    loading: serviceTokenLoading,
    error: serviceTokenError,
    refetch: refetchServiceToken
  } = useGetToken({
    queryParams: { accountId }
  })

  const [stageIdOptions, setStageIdOptions] = useState<SelectOption[]>([])
  const [selectedStageId, setSelectedStageId] = useState<SelectOption>()

  const [stepIdOptionsFromStageKeyMap, setStepIdOptionsFromStageKeyMap] = useState<{ [key: string]: SelectOption[] }>(
    {}
  )
  const [stepIdOptions, setStepIdOptions] = useState<SelectOption[]>([])
  const [selectedStepId, setSelectedStepId] = useState<SelectOption>()
  const stageId = selectedStageId?.value as string | undefined
  const stepId = selectedStepId?.value as string | undefined

  const isAggregatedStepsReport = stepId === AllOption.value
  // Second condition is cannot be All Steps with only 1 stage option aka All Stages
  const isAggregatedStageReports =
    stageId === AllOption.value || (stepId === AllOption.value && stageIdOptions.length === 1)
  const isAggregatedReports = isAggregatedStageReports || isAggregatedStepsReport
  const status = (context?.pipelineExecutionDetail?.pipelineExecutionSummary?.status || '').toUpperCase()
  const infoQueryParams = useMemo(
    () => ({
      accountId,
      orgId: orgIdentifier,
      projectId: projectIdentifier,
      pipelineId: context?.pipelineExecutionDetail?.pipelineExecutionSummary?.pipelineIdentifier || '',
      buildId: String(context?.pipelineExecutionDetail?.pipelineExecutionSummary?.runSequence || '')
    }),
    [
      accountId,
      orgIdentifier,
      projectIdentifier,
      context?.pipelineExecutionDetail?.pipelineExecutionSummary?.pipelineIdentifier,
      context?.pipelineExecutionDetail?.pipelineExecutionSummary?.runSequence
    ]
  )

  const {
    data: reportInfoData,
    error: reportInfoError,
    loading: reportInfoLoading,
    refetch: fetchReportInfo
  } = useReportsInfo({
    queryParams: infoQueryParams,
    lazy: true,
    requestOptions: {
      headers: {
        'X-Harness-Token': serviceToken || ''
      }
    }
  })

  const {
    data: testInfoData,
    error: testInfoError,
    loading: testInfoLoading,
    refetch: fetchTestInfo
  } = useTestInfo({
    queryParams: infoQueryParams,
    lazy: true,
    requestOptions: {
      headers: {
        'X-Harness-Token': serviceToken || ''
      }
    }
  })

  useEffect(() => {
    if (status && serviceToken) {
      fetchReportInfo()
      fetchTestInfo()
    }
  }, [status, serviceToken])

  useEffect(() => {
    if (reportInfoData && testInfoData) {
      const uniqItems = uniqWith([...reportInfoData, ...testInfoData], isEqual)
      if (uniqItems?.length < 1) {
        return // no test results
      }

      let uniqueStageIdOptions: SelectOption[] | any = [] // any includes additionally index for ordering below
      const uniqueStepIdOptionsFromStageKeyMap: { [key: string]: SelectOption[] | any } = {}
      const pipelineOrderedStagesMap: { [key: string]: number } = {}
      Array.from(context?.pipelineStagesMap?.values() || {})?.forEach(
        (stage, index) => (pipelineOrderedStagesMap[`${stage.nodeIdentifier}`] = index)
      )

      uniqItems.forEach(({ stage, step }) => {
        if (stage && !uniqueStageIdOptions.some((option: { value: string }) => option.value === stage)) {
          uniqueStageIdOptions.push({
            label: `Stage: ${stage}`,
            value: stage,
            index: typeof stage === 'string' && pipelineOrderedStagesMap[stage]
          })
        }
        if (stage && Array.isArray(uniqueStepIdOptionsFromStageKeyMap?.[stage])) {
          uniqueStepIdOptionsFromStageKeyMap[stage].push({
            label: `Step: ${step}`,
            value: step
          })
          if (!uniqueStepIdOptionsFromStageKeyMap[stage].includes(AllStepsOption)) {
            uniqueStepIdOptionsFromStageKeyMap[stage].unshift(AllStepsOption)
          }
        } else if (stage && step) {
          uniqueStepIdOptionsFromStageKeyMap[stage] = [
            {
              label: `Step: ${step}`,
              value: step
            }
          ]
        }
      })

      setStepIdOptionsFromStageKeyMap(uniqueStepIdOptionsFromStageKeyMap)

      let selectedStageIndex = 0
      if (uniqueStageIdOptions.length > 1) {
        uniqueStageIdOptions = orderBy(uniqueStageIdOptions, 'index')
        uniqueStageIdOptions.unshift(AllStagesOption)
        selectedStageIndex = 1
        setSelectedStageId(uniqueStageIdOptions[1])
      } else {
        setSelectedStageId(uniqueStageIdOptions[0])
      }

      const selectedStepOptions =
        typeof selectedStageIndex !== 'undefined' &&
        uniqueStepIdOptionsFromStageKeyMap[uniqueStageIdOptions[selectedStageIndex].value as string]

      if (selectedStepOptions.length > 1) {
        setSelectedStepId(selectedStepOptions[1])
      } else {
        setSelectedStepId(selectedStepOptions[0])
      }

      setStageIdOptions(uniqueStageIdOptions)
      setStepIdOptions(selectedStepOptions)
    }
  }, [reportInfoData, testInfoData])

  const queryParams = useMemo(() => {
    const optionalKeys = getOptionalQueryParamKeys({ stageId, stepId })

    return {
      accountId,
      orgId: orgIdentifier,
      projectId: projectIdentifier,
      pipelineId: context?.pipelineExecutionDetail?.pipelineExecutionSummary?.pipelineIdentifier || '',
      buildId: String(context?.pipelineExecutionDetail?.pipelineExecutionSummary?.runSequence || ''),
      ...optionalKeys
    }
  }, [
    accountId,
    orgIdentifier,
    projectIdentifier,
    context?.pipelineExecutionDetail?.pipelineExecutionSummary?.pipelineIdentifier,
    context?.pipelineExecutionDetail?.pipelineExecutionSummary?.runSequence,
    stageId,
    stepId
  ])

  const {
    data: reportSummaryData,
    error: reportSummaryError,
    loading: reportSummaryLoading,
    refetch: fetchReportSummary
  } = useReportSummary({
    queryParams: { ...queryParams, report: 'junit' as const },
    lazy: true,
    requestOptions: {
      headers: {
        'X-Harness-Token': serviceToken || ''
      }
    },
    mock: reportSummaryMock
      ? {
          data: reportSummaryMock
        }
      : undefined
  })

  const {
    data: testOverviewData,
    error: testOverviewError,
    loading: testOverviewLoading,
    refetch: fetchTestOverview
  } = useTestOverview({
    queryParams,
    lazy: true,
    requestOptions: {
      headers: {
        'X-Harness-Token': serviceToken || ''
      }
    },
    mock: testOverviewMock
      ? {
          data: testOverviewMock
        }
      : undefined
  })

  const reportSummaryHasTests = (reportSummaryData?.total_tests || 0) > 0
  const testOverviewHasTests = (testOverviewData?.total_tests || 0) > 0

  const uiType =
    reportSummaryHasTests && testOverviewHasTests
      ? UI.TIAndReports
      : !reportSummaryHasTests && testOverviewHasTests
      ? UI.TI
      : reportSummaryHasTests && !testOverviewHasTests
      ? UI.Reports
      : reportInfoLoading || testInfoLoading
      ? UI.LoadingState
      : UI.ZeroState

  useEffect(() => {
    if (status && stageId && stepId) {
      fetchReportSummary()
      if (!isAggregatedReports) {
        // do not need overview call for ti-related data when aggregated.
        // summary call above will provide ui overview data
        fetchTestOverview()
      }
    }
  }, [stageId, stepId, status])

  const testsCountDiff = useMemo(() => {
    const newTests = testOverviewData?.selected_tests?.new_tests
    const total = testOverviewData?.total_tests
    if (newTests && total) {
      return Number(Number(newTests / (total / 100)).toFixed(2))
    }
    return 0
  }, [testOverviewData?.total_tests, testOverviewData?.selected_tests?.new_tests])

  // When build/execution is not resolved from context, render nothing
  if (!status) {
    return null
  }

  const error =
    (reportInfoData && reportInfoData?.length > 0 && reportSummaryError) ||
    serviceTokenError ||
    (testInfoData && testInfoData?.length > 0 && testOverviewError) ||
    reportInfoError ||
    testInfoError

  if (error) {
    return (
      <PageError
        message={get(error, 'data.error_msg', error?.message)}
        onClick={() => {
          refetchServiceToken()

          if (serviceToken) {
            fetchReportInfo()
            fetchTestInfo()

            if (stageId && stepId) {
              fetchReportSummary()
              fetchTestOverview()
            }
          }
        }}
      />
    )
  }

  if (serviceTokenLoading || reportInfoLoading || testInfoLoading || testOverviewLoading || reportSummaryLoading) {
    return <PageSpinner />
  }

  const header = (
    <Container
      flex
      padding={{ bottom: 'small' }}
      margin={{ bottom: 'medium' }}
      style={{ borderBottom: '1px solid #D9DAE6', justifyContent: 'space-between' }}
    >
      <Container flex style={{ justifyContent: 'initial' }}>
        <Heading level={5} color={Color.BLACK} style={{ fontWeight: 600 }}>
          {getString('pipeline.testsReports.testExecutions')}
        </Heading>
        {stageIdOptions && selectedStageId && (
          <div style={{ width: '222px', marginLeft: 'var(--spacing-5)' }}>
            <Select
              fill
              value={selectedStageId}
              items={stageIdOptions}
              onChange={option => {
                setSelectedStageId(option)
                if (option.value === AllOption.value) {
                  const newStepIdOptions = [...stepIdOptions]
                  // Add All Steps option if not present
                  if (!stepIdOptions.some(stepIdOption => stepIdOption.value === AllOption.value)) {
                    newStepIdOptions.unshift(AllStepsOption)
                    setStepIdOptions(newStepIdOptions)
                  }
                  setSelectedStepId(newStepIdOptions[0])
                } else if (option.value) {
                  const stageStepIdOptions = stepIdOptionsFromStageKeyMap[option.value as string] || []
                  const newStepIdOptions = [...stageStepIdOptions].filter(
                    stepIdOption => stepIdOption.value !== AllOption.value
                  )
                  // Remove All Steps option if only 1 option available
                  if (newStepIdOptions.length === 1) {
                    setStepIdOptions(stageStepIdOptions)
                    setSelectedStepId(stageStepIdOptions[0])
                  } else {
                    setStepIdOptions(stageStepIdOptions)
                    setSelectedStepId(stageStepIdOptions[1])
                  }
                }
              }}
            />
          </div>
        )}
        {stepIdOptions && selectedStepId && (
          <div style={{ width: '222px', marginLeft: 'var(--spacing-5)' }}>
            <Select
              fill
              value={selectedStepId}
              items={stepIdOptions}
              disabled={selectedStageId?.value === AllOption.value && selectedStepId.value === AllOption.value}
              onChange={option => setSelectedStepId(option)}
            />
          </div>
        )}
      </Container>
      {testOverviewHasTests && (
        <Text
          className={css.poweredByTi}
          font={{ variation: FontVariation.TINY, weight: 'semi-bold' }}
          icon="upgrade-bolt"
          iconProps={{
            intent: 'primary',
            size: 16,
            color: Color.PRIMARY_8
          }}
          color={Color.PRIMARY_8}
        >
          {getString('pipeline.testsReports.poweredByTI')}
        </Text>
      )}
    </Container>
  )

  let ui = null
  switch (uiType) {
    case UI.LoadingState:
      ui = <BuildZeroState isLoading={true} />
      break
    case UI.ZeroState:
      ui = (
        <>
          {stageIdOptions?.length > 1 || stepIdOptions?.length > 1 ? header : null}
          <BuildZeroState />
        </>
      )
      break
    case UI.TIAndReports:
      ui = (
        <TIAndReports
          header={header}
          testOverviewData={testOverviewData}
          reportSummaryData={reportSummaryData}
          stageId={stageId}
          stepId={stepId}
          serviceToken={serviceToken}
          testsCountDiff={testsCountDiff}
          isAggregatedReports={isAggregatedReports}
        />
      )
      break
    case UI.TI:
      ui = <TI header={header} testOverviewData={testOverviewData} testsCountDiff={testsCountDiff} />
      break
    case UI.Reports:
      ui = (
        <Reports
          header={header}
          reportSummaryData={reportSummaryData}
          stageId={stageId}
          stepId={stepId}
          serviceToken={serviceToken}
          testsCountDiff={testsCountDiff}
        />
      )
      break
    default:
      ui = <BuildZeroState />
      break
  }

  return <div className={css.mainContainer}>{ui}</div>
}

export default BuildTests
