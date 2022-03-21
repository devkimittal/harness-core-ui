/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { MultiTypeInputType } from '@wings-software/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import { ArtifactType, TagTypes } from '@pipeline/components/ArtifactsSelection/ArtifactInterface'
import { ServiceDeploymentType } from '@pipeline/utils/stageHelpers'
import { mockSubscriptions, mockRegistries, mockRepositories } from './mocks'
import { AcrArtifact } from '../AcrArtifact'

const props = {
  name: 'Artifact details',
  expressions: [],
  allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION],
  context: 2,
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

describe('Acr Artifact tests', () => {
  test('Should match snapshot', () => {
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
        <AcrArtifact key={'key'} initialValues={initialValues} {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('Should render correctly in edit case', () => {
    const initialValues = {
      identifier: 'Identifier1',
      tag: 'tag1',
      tagRegex: '',
      repository: 'rep1',
      subscription: 'sub2',
      registry: 'reg1',
      tagType: TagTypes.Value
    }

    const { container } = render(
      <TestWrapper>
        <AcrArtifact key={'key'} initialValues={initialValues} {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
