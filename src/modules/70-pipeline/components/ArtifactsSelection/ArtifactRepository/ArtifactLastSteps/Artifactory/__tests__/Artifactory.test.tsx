/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, findByText, fireEvent, queryByAttribute, render, waitFor } from '@testing-library/react'
import { MultiTypeInputType } from '@wings-software/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import { ArtifactType, TagTypes } from '@pipeline/components/ArtifactsSelection/ArtifactInterface'
import Artifactory from '../Artifactory'

const props = {
  name: 'Artifact details',
  expressions: [],
  allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION],
  context: 2,
  handleSubmit: jest.fn(),
  artifactIdentifiers: [],
  selectedArtifact: 'Nexus3Registry' as ArtifactType
}

jest.mock('services/cd-ng', () => ({
  useGetBuildDetailsForArtifactoryArtifact: jest.fn().mockImplementation(() => {
    return { data: {}, refetch: jest.fn(), error: null, loading: false }
  })
}))
const initialValues = {
  identifier: '',
  artifactPath: '',
  tag: '',
  tagType: TagTypes.Value,
  tagRegex: '',
  repository: '',
  repositoryUrl: ''
}

describe('Nexus Artifact tests', () => {
  test(`renders without crashing`, () => {
    const { container } = render(
      <TestWrapper>
        <Artifactory key={'key'} initialValues={initialValues} {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
  test(`tag is disabled if imagepath and repository is empty`, () => {
    const { container } = render(
      <TestWrapper>
        <Artifactory key={'key'} initialValues={initialValues} {...props} />
      </TestWrapper>
    )
    const tagInput = container.querySelector('input[name="tag"]')
    expect(tagInput).toBeDisabled()
  })
  test(`unable to submit the form when either of imagename, repository are empty`, async () => {
    const { container } = render(
      <TestWrapper>
        <Artifactory key={'key'} initialValues={initialValues} {...props} />
      </TestWrapper>
    )
    const submitBtn = container.querySelector('button[type="submit"]')!
    fireEvent.click(submitBtn)

    const repositoryRequiredErr = await findByText(container, 'common.git.validation.repoRequired')
    expect(repositoryRequiredErr).toBeDefined()

    const imagePahRequiredErr = await findByText(container, 'pipeline.artifactsSelection.validation.artifactPath')
    expect(imagePahRequiredErr).toBeDefined()
  })

  test(`able to submit form when the form is non empty`, async () => {
    const { container } = render(
      <TestWrapper>
        <Artifactory key={'key'} initialValues={initialValues} {...props} />
      </TestWrapper>
    )
    const submitBtn = container.querySelector('button[type="submit"]')!
    fireEvent.click(submitBtn)
    const repositoryRequiredErr = await findByText(container, 'common.git.validation.repoRequired')
    expect(repositoryRequiredErr).toBeDefined()

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)
    await act(async () => {
      fireEvent.change(queryByNameAttribute('identifier')!, { target: { value: 'testidentifier' } })
      fireEvent.change(queryByNameAttribute('artifactPath')!, { target: { value: 'artifact-path' } })
      fireEvent.change(queryByNameAttribute('repository')!, { target: { value: 'repository' } })
    })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(props.handleSubmit).toBeCalled()
      expect(props.handleSubmit).toHaveBeenCalledWith({
        identifier: 'testidentifier',
        spec: {
          connectorRef: '',
          artifactPath: 'artifact-path',
          repository: 'repository',
          tag: '<+input>',
          repositoryFormat: 'docker'
        }
      })
    })
  })

  test(`form renders correctly in Edit Case`, async () => {
    const filledInValues = {
      identifier: 'nexusSidecarId',
      artifactPath: 'nexus-imagepath',
      tagType: TagTypes.Value,
      tag: 'tag',
      tagRegex: '',
      repository: 'repository-name',
      repositoryUrl: 'repositoryUrl'
    }
    const { container } = render(
      <TestWrapper>
        <Artifactory key={'key'} initialValues={filledInValues} {...props} />
      </TestWrapper>
    )
    const repositoryField = container.querySelector('input[name="repository"]')
    expect(repositoryField).not.toBeNull()
    expect(container.querySelector('input[name="artifactPath"]')).not.toBeNull()
    expect(container.querySelector('input[name="repositoryUrl"]')).not.toBeNull()

    expect(container).toMatchSnapshot()
  })

  test(`submits correctly with tagregex data`, async () => {
    const defaultValues = {
      identifier: '',
      artifactPath: '',
      tag: '',
      tagType: TagTypes.Value,
      tagRegex: '',
      repository: '',
      repositoryUrl: ''
    }
    const { container } = render(
      <TestWrapper>
        <Artifactory key={'key'} initialValues={defaultValues} {...props} />
      </TestWrapper>
    )
    const submitBtn = container.querySelector('button[type="submit"]')!
    fireEvent.click(submitBtn)
    const repositoryRequiredErr = await findByText(container, 'common.git.validation.repoRequired')
    expect(repositoryRequiredErr).toBeDefined()

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)
    await act(async () => {
      fireEvent.change(queryByNameAttribute('identifier')!, { target: { value: 'testidentifier' } })
      fireEvent.change(queryByNameAttribute('artifactPath')!, { target: { value: 'artifact-path' } })
      fireEvent.change(queryByNameAttribute('repository')!, { target: { value: 'repository' } })
      fireEvent.change(queryByNameAttribute('repositoryUrl')!, { target: { value: 'repositoryUrl' } })
    })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(props.handleSubmit).toBeCalled()
      expect(props.handleSubmit).toHaveBeenCalledWith({
        identifier: 'testidentifier',
        spec: {
          connectorRef: '',
          artifactPath: 'artifact-path',
          repository: 'repository',
          tag: '<+input>',
          repositoryUrl: 'repositoryUrl',
          repositoryFormat: 'docker'
        }
      })
    })
    await waitFor(() => expect(container.querySelector('input[name="repository"]')).toHaveValue('repository'))
    await waitFor(() => expect(container.querySelector('input[name="artifactPath"]')).toHaveValue('artifact-path'))
    await waitFor(() => expect(container.querySelector('input[name="repositoryUrl"]')).toHaveValue('repositoryUrl'))
  })
})
