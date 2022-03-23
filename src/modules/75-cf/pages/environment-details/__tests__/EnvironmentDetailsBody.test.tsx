/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { RenderResult, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import mockImport from 'framework/utils/mockImport'
import { TestWrapper } from '@common/utils/testUtils'
import EnvironmentDetailsBody from '@cf/pages/environment-details/EnvironmentDetailsBody'
import * as cfServices from 'services/cf'
import type { ApiKey } from 'services/cf'

const showSuccess = jest.fn()
jest.mock('@common/exports', () => ({
  useToaster: () => ({
    showSuccess
  })
}))

const getMockResponseData = (keys: ApiKey[] = []) => ({
  loading: false,
  error: null,
  refetch: jest.fn(),
  absolutePath: '',
  response: {} as Response,
  cancel: jest.fn(),
  data: {
    itemCount: keys.length,
    pageCount: 1,
    pageIndex: 0,
    pageSize: 1,
    apiKeys: keys
  }
})

const renderComponent = (): RenderResult =>
  render(
    <TestWrapper>
      <EnvironmentDetailsBody
        environment={{
          accountId: 'ZIi1smI9R2SGLNcXKZcoTw',
          orgIdentifier: 'org1',
          projectIdentifier: 'FFrbac',
          identifier: 'dev',
          name: 'dev',
          description: '',
          color: '#0063F7',
          type: 'PreProduction',
          deleted: false,
          tags: {},
          version: 0
        }}
      />
    </TestWrapper>
  )

const mutateMock = jest.fn()
const useGetAllAPIKeysMock = jest.spyOn(cfServices, 'useGetAllAPIKeys')
jest.spyOn(cfServices, 'useAddAPIKey').mockReturnValue({
  cancel: jest.fn(),
  error: null,
  loading: false,
  mutate: mutateMock
})

describe('EnvironmentDetailsBody', () => {
  const addNewAPIKey = (newKey: ApiKey): void => {
    mutateMock.mockResolvedValue({ ...newKey })

    userEvent.click(screen.getByRole('button', { name: /addKey/ }))
    userEvent.type(screen.getByRole('textbox'), newKey.name)

    useGetAllAPIKeysMock.mockReturnValue(getMockResponseData([{ ...newKey }]))

    userEvent.click(screen.getByRole('button', { name: /create/ }))
  }

  beforeAll(() => {
    const { getComputedStyle } = window
    window.getComputedStyle = elt => getComputedStyle(elt)
  })

  beforeEach(() => {
    jest.clearAllMocks()
    useGetAllAPIKeysMock.mockReturnValue(getMockResponseData())
  })

  test('it should display the copy button and redaction warning when new API key is created', async () => {
    const newKey: ApiKey = {
      identifier: 'NewKey',
      apiKey: 'api-key',
      name: 'NewKey',
      type: 'server'
    }

    renderComponent()
    addNewAPIKey(newKey)

    await waitFor(() => {
      expect(screen.getByText(newKey.name)).toBeInTheDocument()

      const apiKeyEl = screen.getByText(newKey.apiKey)
      expect(apiKeyEl).toBeInTheDocument()
      expect(apiKeyEl.querySelector('svg')).toBeInTheDocument()

      expect(screen.getByText('cf.environments.apiKeys.redactionWarning')).toBeInTheDocument()
    })
  })

  test('it should not show the copy button and redaction warning when displaying existing keys', async () => {
    const existingKey: ApiKey = {
      name: 'EXISTING KEY NAME',
      identifier: 'EXISTING KEY IDENTIFIER',
      apiKey: 'existing-api-key',
      type: 'server'
    }

    useGetAllAPIKeysMock.mockReturnValue(getMockResponseData([existingKey]))
    renderComponent()

    expect(screen.getByText(existingKey.name)).toBeInTheDocument()

    const apiKeyEl = screen.getByText(existingKey.apiKey)
    expect(apiKeyEl).toBeInTheDocument()
    expect(apiKeyEl.querySelector('svg')).not.toBeInTheDocument()

    expect(screen.queryByText('cf.environments.apiKeys.redactionWarning')).not.toBeInTheDocument()
  })

  test('it should show Delete SDK key confirmation modal when trash icon is clicked', async () => {
    const existingKey: ApiKey = {
      name: 'EXISTING KEY NAME',
      identifier: 'EXISTING KEY IDENTIFIER',
      apiKey: 'existing-api-key',
      type: 'server'
    }

    const mutate = jest.fn(() => {
      return Promise.resolve({ data: {} })
    })

    mockImport('services/cf', {
      useDeleteAPIKey: () => ({ mutate })
    })

    useGetAllAPIKeysMock.mockReturnValue(getMockResponseData([existingKey]))
    renderComponent()

    userEvent.click(screen.getByRole('button', { name: 'trash' }))

    await waitFor(() => {
      expect(screen.queryByText('cf.environments.apiKeys.deleteTitle')).toBeInTheDocument()
    })

    userEvent.click(screen.getByRole('button', { name: 'confirm' }))

    await waitFor(() => {
      expect(mutate).toBeCalledWith(existingKey.identifier)
      expect(showSuccess).toHaveBeenCalledWith('cf.environments.apiKeys.deleteSuccess')
      expect(screen.queryByText('cf.environments.apiKeys.deleteTitle')).not.toBeInTheDocument()
    })
  })
})
