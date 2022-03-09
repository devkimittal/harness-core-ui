/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor } from '@testing-library/react'

import { MultiTypeInputType } from '@harness/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'

import { ArtifactSourceBaseFactory } from '@cd/factory/ArtifactSourceFactory/ArtifactSourceBaseFactory'
import type { ArtifactListConfig, ServiceSpec } from 'services/cd-ng'
import * as cdng from 'services/cd-ng'
import * as artifactSourceUtils from '../../artifactSourceUtils'
import { KubernetesPrimaryArtifacts } from '../../../KubernetesArtifacts/KubernetesPrimaryArtifacts/KubernetesPrimaryArtifacts'
import { KubernetesSidecarArtifacts } from '../../../KubernetesArtifacts/KubernetesSidecarArtifacts/KubernetesSidecarArtifacts'

import { template, artifacts, mockSubscriptions, mockRegistries, mockRepositories } from './mocks'

jest.mock('services/portal', () => ({
  useListAzureSubscriptions: jest.fn().mockImplementation(() => {
    return { data: mockSubscriptions, refetch: jest.fn(), error: null, loading: false }
  }),
  useListAzureRegistries: jest.fn().mockImplementation(() => {
    return { data: mockRegistries, refetch: jest.fn(), error: null, loading: false }
  }),
  useListAzureRepositories: jest.fn().mockImplementation(() => {
    return { data: mockRepositories, refetch: jest.fn(), error: null, loading: false }
  })
}))

jest.spyOn(artifactSourceUtils, 'fromPipelineInputTriggerTab')
jest.spyOn(artifactSourceUtils, 'isFieldfromTriggerTabDisabled')
jest.spyOn(artifactSourceUtils, 'resetTags').mockImplementation(() => jest.fn())
jest.spyOn(cdng, 'useGetBuildDetailsForAcrWithYaml')

describe('Acr Artifact Source tests', () => {
  test('snapshot test for Primary Acr artifact source', () => {
    const { container } = render(
      <TestWrapper>
        <KubernetesPrimaryArtifacts
          initialValues={{ artifacts: artifacts as ArtifactListConfig }}
          template={template as ServiceSpec}
          artifacts={artifacts as ArtifactListConfig}
          readonly={false}
          stageIdentifier="stage-0"
          artifactSourceBaseFactory={new ArtifactSourceBaseFactory()}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          stepViewType={StepViewType.DeploymentForm}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('snapshot test for Sidecar Acr artifact source', async () => {
    const { container } = render(
      <TestWrapper>
        <KubernetesSidecarArtifacts
          initialValues={{ artifacts: artifacts as ArtifactListConfig }}
          template={template as ServiceSpec}
          artifacts={artifacts as ArtifactListConfig}
          readonly={false}
          stageIdentifier="stage-0"
          artifactSourceBaseFactory={new ArtifactSourceBaseFactory()}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          stepViewType={StepViewType.DeploymentForm}
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
    expect(await waitFor(() => artifactSourceUtils.fromPipelineInputTriggerTab)).toBeCalled()
    expect(await waitFor(() => artifactSourceUtils.isFieldfromTriggerTabDisabled)).toBeCalled()
    expect(await waitFor(() => cdng.useGetBuildDetailsForAcrWithYaml)).toBeCalled()
  })
})
