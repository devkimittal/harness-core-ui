/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, render, waitFor } from '@testing-library/react'
import { MultiTypeInputType } from '@wings-software/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import { ArtifactType, TagTypes } from '@pipeline/components/ArtifactsSelection/ArtifactInterface'
import { ServiceDeploymentType } from '@pipeline/utils/stageHelpers'
import { ModalViewFor } from '@pipeline/components/ArtifactsSelection/ArtifactHelper'
import { mockSubscriptions, mockRegistries, mockRepositories } from './mocks'
import { AcrArtifact } from '../AcrArtifact'

const props = {
  name: 'Artifact details',
  expressions: [],
  allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION],
  context: ModalViewFor.SIDECAR,
  handleSubmit: jest.fn(),
  artifactIdentifiers: [],
  selectedArtifact: 'Acr' as ArtifactType,
  selectedDeploymentType: ServiceDeploymentType.Kubernetes
}

jest.mock('services/portal', () => ({
  useListAzureSubscriptions: jest.fn().mockImplementation(() => {
    return {
      data: mockSubscriptions,
      refetch: jest.fn().mockReturnValue(mockSubscriptions),
      error: null,
      loading: false
    }
  }),
  useListAzureRegistries: jest.fn().mockImplementation(() => {
    return { data: mockRegistries, refetch: jest.fn().mockReturnValue(mockRegistries), error: null, loading: false }
  }),
  useListAzureRepositories: jest.fn().mockImplementation(() => {
    return { data: mockRepositories, refetch: jest.fn().mockReturnValue(mockRepositories), error: null, loading: false }
  })
}))

jest.mock('services/cd-ng', () => ({
  ...jest.requireActual('services/cd-ng'),
  useGetBuildDetailsForAcr: jest.fn().mockImplementation(() => {
    return { data: mockRepositories, refetch: jest.fn(), error: null, loading: false }
  })
}))

describe('Acr Artifact tests', () => {
  test('Should match snapshot for primary artifact', () => {
    const initialValues = {
      identifier: '',
      tag: '',
      tagRegex: '',
      repository: '',
      subscription: '',
      registry: '',
      tagType: TagTypes.Value
    }

    const { container } = render(
      <TestWrapper>
        <AcrArtifact
          key={'key'}
          prevStepData={{ connectorId: { value: 'connectorRef' } }}
          initialValues={initialValues}
          {...props}
          context={ModalViewFor.PRIMARY}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
  test('Should match snapshot for sidecar artifact', () => {
    const initialValues = {
      identifier: '',
      tag: '',
      tagRegex: '',
      repository: '',
      subscription: '',
      registry: '',
      tagType: TagTypes.Value
    }

    const { container } = render(
      <TestWrapper>
        <AcrArtifact
          key={'key'}
          prevStepData={{ connectorId: { value: 'connectorRef' } }}
          initialValues={initialValues}
          {...props}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('Should render correctly in edit case', async () => {
    const initialValues = {
      identifier: 'Identifier1',
      tag: '<+input>',
      tagRegex: '',
      repository: 'rep1',
      subscription: 'sub2',
      registry: 'reg1',
      tagType: TagTypes.Value
    }

    const { container } = render(
      <TestWrapper>
        <AcrArtifact
          key={'key'}
          prevStepData={{ connectorId: { value: 'connectorRef' } }}
          initialValues={initialValues}
          {...props}
        />
      </TestWrapper>
    )

    fireEvent.click(container.querySelector('button[type="submit"]')!)

    await waitFor(() => {
      expect(props.handleSubmit).toHaveBeenCalled()
    })

    expect(container).toMatchSnapshot()
  })

  test('Should render correctly in edit case for runtime fields', async () => {
    const initialValues = {
      identifier: 'Identifier1',
      tag: '<+input>',
      tagRegex: '',
      repository: '<+input>',
      subscription: '<+input>',
      registry: '<+input>',
      tagType: TagTypes.Value
    }

    const { container, getByText } = render(
      <TestWrapper>
        <AcrArtifact
          key={'key'}
          previousStep={jest.fn()}
          prevStepData={{ connectorId: { value: 'connectorRef' } }}
          initialValues={initialValues}
          {...props}
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()

    await act(() => {
      fireEvent.click(getByText('back')!)
    })

    expect(container).toMatchSnapshot()
  })

  test('Should render correctly in edit case for runtime fields regex', async () => {
    const initialValues = {
      identifier: 'Identifier1',
      tag: '',
      tagRegex: '<+input>',
      repository: '<+input>',
      subscription: '<+input>',
      registry: '<+input>',
      tagType: TagTypes.Regex
    }

    const { container } = render(
      <TestWrapper>
        <AcrArtifact
          key={'key'}
          prevStepData={{ connectorId: { value: 'connectorRef' } }}
          initialValues={initialValues}
          {...props}
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})
