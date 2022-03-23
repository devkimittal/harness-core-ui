/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import userEvent from '@testing-library/user-event'
import { render, screen, waitFor } from '@testing-library/react'
import * as cvService from 'services/cv'
import { TestWrapper } from '@common/utils/testUtils'
import { LogTypes } from '@cv/hooks/useLogContentHook/useLogContentHook.types'
import ExecutionLog from '../ExecutionLog'
import {
  testWrapperProps,
  healthSourceResponse,
  executionLogsResponse,
  pathParams,
  errorMessage,
  deploymentActivitySummaryResponse
} from './ExecutionLog.mock'
import { PAGE_SIZE } from '../ExecutionLog.constants'

const STRING_ID_LOAD_MORE = 'pipeline.verification.loadMore'

jest.mock('services/cv', () => ({
  useGetVerifyStepHealthSources: jest
    .fn()
    .mockImplementation(() => ({ data: healthSourceResponse, loading: false, error: null, refetch: jest.fn() })),
  useGetVerifyStepLogs: jest
    .fn()
    .mockImplementation(() => ({ data: executionLogsResponse, loading: false, error: null, refetch: jest.fn() })),
  useGetVerifyStepDeploymentActivitySummary: jest.fn().mockImplementation(() => ({
    data: deploymentActivitySummaryResponse,
    loading: false,
    error: null,
    refetch: jest.fn()
  }))
}))

describe('ExecutionLog', () => {
  test('should render ExecutionLog component', () => {
    const { container } = render(
      <TestWrapper {...testWrapperProps}>
        <ExecutionLog activityId="activityId" />
      </TestWrapper>
    )

    expect(screen.getByText('cv.executionLogs')).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  test('should call the api by clicking the load more button', async () => {
    render(
      <TestWrapper {...testWrapperProps}>
        <ExecutionLog activityId="activityId" />
      </TestWrapper>
    )

    expect(screen.getByRole('button', { name: STRING_ID_LOAD_MORE })).toBeInTheDocument()

    userEvent.click(screen.getByRole('button', { name: STRING_ID_LOAD_MORE }))

    await waitFor(() => {
      expect(cvService.useGetVerifyStepLogs).toHaveBeenLastCalledWith({
        verifyStepExecutionId: 'activityId',
        queryParams: {
          accountId: pathParams.accountId,
          pageSize: PAGE_SIZE,
          logType: LogTypes.ExecutionLog,
          pageNumber: 1,
          errorLogsOnly: false
        },
        queryParamStringifyOptions: {
          arrayFormat: 'repeat'
        }
      })
      expect(screen.queryByRole('button', { name: STRING_ID_LOAD_MORE })).not.toBeInTheDocument()
    })
  })

  test('should handle the Top and Bottom navigation', () => {
    const { container } = render(
      <TestWrapper {...testWrapperProps}>
        <ExecutionLog activityId="activityId" />
      </TestWrapper>
    )

    expect(container.querySelector('[data-icon="arrow-down"]')).toBeInTheDocument()

    userEvent.click(container.querySelector('[data-icon="arrow-down"]')!)
  })

  test('should show the text Loading...', () => {
    jest
      .spyOn(cvService, 'useGetVerifyStepLogs')
      .mockReturnValue({ data: {}, loading: true, error: null, refetch: jest.fn() } as any)

    render(
      <TestWrapper {...testWrapperProps}>
        <ExecutionLog activityId="activityId" />
      </TestWrapper>
    )

    expect(screen.getByText('loading')).toBeInTheDocument()
  })

  test('should show the error message and fetch the logs by clicking on Retry', async () => {
    jest
      .spyOn(cvService, 'useGetVerifyStepLogs')
      .mockReturnValue({ data: {}, loading: false, error: { message: errorMessage }, refetch: jest.fn() } as any)

    render(
      <TestWrapper {...testWrapperProps}>
        <ExecutionLog activityId="activityId" />
      </TestWrapper>
    )

    expect(screen.getByText(errorMessage)).toBeInTheDocument()

    userEvent.click(screen.getByText('retry'))

    await waitFor(() => {
      expect(cvService.useGetVerifyStepLogs).toHaveBeenLastCalledWith({
        verifyStepExecutionId: 'activityId',
        queryParams: {
          accountId: pathParams.accountId,
          pageSize: PAGE_SIZE,
          logType: LogTypes.ExecutionLog,
          pageNumber: 0,
          errorLogsOnly: false
        },
        queryParamStringifyOptions: {
          arrayFormat: 'repeat'
        }
      })
    })
  })
})
