import React from 'react'
import { noop } from 'lodash-es'
import { render } from '@testing-library/react'
import { act } from 'react-dom/test-utils'

import { TestWrapper } from '@common/utils/testUtils'
import { clickSubmit, fillAtForm, InputTypes } from '@common/utils/JestFormHelper'
import CreateAwsKmsConnector from '../CreateAwsKmsConnector'

const delegateNameresponse = {
  metaData: {},
  resource: true,
  responseMessages: 'true'
}

const validateResponse = {
  status: 'SUCCESS',
  data: true,
  metaData: null
}

const mockRegions = {
  resource: [{ name: 'region1', value: 'region1' }]
}

jest.mock('services/cd-ng', () => ({
  useUpdateConnector: jest.fn().mockImplementation(() => ({
    mutate: async () => {
      return {
        status: 'SUCCESS'
      }
    },
    loading: false
  })),
  useCreateConnector: jest.fn().mockImplementation(() => ({
    mutate: async () => {
      return {
        status: 'SUCCESS'
      }
    },
    loading: false
  })),
  useGetTestConnectionResult: jest.fn().mockImplementation(() => jest.fn()),
  validateTheIdentifierIsUniquePromise: jest.fn(() => Promise.resolve(validateResponse))
}))

jest.mock('services/portal', () => ({
  useGetDelegateFromId: jest.fn().mockImplementation(() => {
    return { ...delegateNameresponse, refetch: jest.fn(), error: null, loading: false }
  }),
  useListAwsRegions: jest.fn().mockImplementation(() => {
    return { data: mockRegions, refetch: jest.fn(), error: null, loading: false }
  })
}))

describe('Create Secret Manager Wizard', () => {
  test('should be able to render first and second step form', async () => {
    const { container } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <CreateAwsKmsConnector onClose={noop} onSuccess={noop} mock={true} isEditMode={false} />
      </TestWrapper>
    )

    // match step 1
    expect(container).toMatchSnapshot()

    // fill step 1
    fillAtForm([
      {
        container,
        type: InputTypes.TEXTFIELD,
        fieldId: 'name',
        value: 'dummy name'
      }
    ])

    expect(container).toMatchSnapshot()

    await act(async () => {
      clickSubmit(container)
    })

    expect(container).toMatchSnapshot()
  })
})
