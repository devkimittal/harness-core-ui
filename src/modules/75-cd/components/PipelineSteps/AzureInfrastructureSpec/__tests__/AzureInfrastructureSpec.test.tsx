/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, getByText, render, waitFor } from '@testing-library/react'
import { RUNTIME_INPUT_VALUE } from '@wings-software/uicore'
import type { CompletionItemInterface } from '@common/interfaces/YAMLBuilderProps'
import { StepFormikRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import type { AzureInfrastructure } from 'services/cd-ng'
import { factory, TestStepWidget } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { AzureInfrastructureSpec } from '../AzureInfrastructureSpec'
import {
  connectorsResponse,
  connectorResponse,
  subscriptionsResponse,
  resourceGroupsResponse,
  clustersResponse
} from './mock/mocks'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')

jest.mock('services/cd-ng', () => ({
  useGetConnector: jest.fn(() => connectorResponse),
  useGetSubscriptionsForAzure: jest.fn(() => subscriptionsResponse),
  useGetResourceGroupsForAzure: jest.fn(() => resourceGroupsResponse),
  useGetClustersForAzure: jest.fn(() => clustersResponse),
  getConnectorListV2Promise: jest.fn(() => Promise.resolve(connectorsResponse.data)),
  getSubscriptionsForAzurePromise: jest.fn(() => Promise.resolve(subscriptionsResponse.data)),
  getResourceGroupsForAzurePromise: jest.fn(() => Promise.resolve(resourceGroupsResponse.data)),
  getClustersForAzurePromise: jest.fn(() => Promise.resolve(clustersResponse.data))
}))

const getRuntimeInputsValues = () => ({
  connectorRef: RUNTIME_INPUT_VALUE,
  subscription: RUNTIME_INPUT_VALUE,
  resourceGroup: RUNTIME_INPUT_VALUE,
  cluster: RUNTIME_INPUT_VALUE,
  namespace: RUNTIME_INPUT_VALUE,
  releaseName: RUNTIME_INPUT_VALUE
})

const getInitialValues = (): AzureInfrastructure => ({
  connectorRef: 'connectorRef',
  subscription: 'subscription',
  resourceGroup: 'resourceGroup',
  cluster: 'cluster',
  namespace: 'namespace',
  releaseName: 'releasename'
})

const getEmptyInitialValues = (): AzureInfrastructure => ({
  connectorRef: '',
  subscription: '',
  resourceGroup: '',
  cluster: '',
  namespace: '',
  releaseName: ''
})

const getInvalidYaml = (): string => `p ipe<>line:
sta ges:
   - st<>[]age:
              s pe<> c: <> sad-~`

const getYaml = () => `pipeline:
    stages:
        - stage:
              spec:
                  infrastructure:
                      infrastructureDefinition:
                          type: Azure
                          spec:
                              connectorRef: account.connectorRef
                              subscription: subscription
                              resourceGroup: resourceGroup
                              cluster: cluster
                              namespace: namespace
                              releaseName: releaseName`

const getParams = () => ({
  accountId: 'accountId',
  module: 'cd',
  orgIdentifier: 'default',
  pipelineIdentifier: '-1',
  projectIdentifier: 'projectIdentifier'
})

const connectorRefPath = 'pipeline.stages.0.stage.spec.infrastructure.infrastructureDefinition.spec.connectorRef'
const subscriptionPath = 'pipeline.stages.0.stage.spec.infrastructure.infrastructureDefinition.spec.subscription'
const resourceGroupPath = 'pipeline.stages.0.stage.spec.infrastructure.infrastructureDefinition.spec.resourceGroup'
const clusterPath = 'pipeline.stages.0.stage.spec.infrastructure.infrastructureDefinition.spec.cluster'

describe('Test Azure Infrastructure Spec snapshot', () => {
  beforeEach(() => {
    factory.registerStep(new AzureInfrastructureSpec())
  })

  test('Should render edit view with empty initial values', () => {
    const { container } = render(
      <TestStepWidget initialValues={{}} type={StepType.Azure} stepViewType={StepViewType.Edit} />
    )
    expect(container).toMatchSnapshot()
  })

  test('Should render edit view with values ', () => {
    const { container } = render(
      <TestStepWidget initialValues={getInitialValues()} type={StepType.Azure} stepViewType={StepViewType.Edit} />
    )
    expect(container).toMatchSnapshot()
  })

  test('Should render edit view with runtime values ', () => {
    const { container } = render(
      <TestStepWidget initialValues={getRuntimeInputsValues()} type={StepType.Azure} stepViewType={StepViewType.Edit} />
    )
    expect(container).toMatchSnapshot()
  })

  test('Should render edit view for inputset view', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={getInitialValues()}
        template={getRuntimeInputsValues()}
        allValues={getInitialValues()}
        type={StepType.Azure}
        stepViewType={StepViewType.InputSet}
      />
    )
    expect(container).toMatchSnapshot()
  })

  test('Should render variable view', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={getInitialValues()}
        template={getRuntimeInputsValues()}
        allValues={getInitialValues()}
        type={StepType.Azure}
        stepViewType={StepViewType.InputVariable}
      />
    )

    expect(container).toMatchSnapshot()
  })
})

describe('Test Azure Infrastructure Spec behavior', () => {
  beforeEach(() => {
    factory.registerStep(new AzureInfrastructureSpec())
  })

  test('Should call onUpdate if valid values entered - inputset', async () => {
    const onUpdateHandler = jest.fn()
    const { container } = render(
      <TestStepWidget
        initialValues={getInitialValues()}
        template={getRuntimeInputsValues()}
        allValues={getInitialValues()}
        type={StepType.Azure}
        stepViewType={StepViewType.InputSet}
        onUpdate={onUpdateHandler}
      />
    )

    await act(async () => {
      fireEvent.click(getByText(container, 'Submit'))
    })
    expect(onUpdateHandler).toHaveBeenCalledWith(getInitialValues())
  })

  test('Should not call onUpdate if invalid values entered - inputset', async () => {
    const onUpdateHandler = jest.fn()
    const { container } = render(
      <TestStepWidget
        initialValues={getEmptyInitialValues()}
        template={getRuntimeInputsValues()}
        allValues={getEmptyInitialValues()}
        type={StepType.Azure}
        stepViewType={StepViewType.InputSet}
        onUpdate={onUpdateHandler}
      />
    )

    await act(async () => {
      fireEvent.click(getByText(container, 'Submit'))
    })

    expect(onUpdateHandler).not.toHaveBeenCalled()
  })

  test('Should call onUpdate if valid values entered - edit view', async () => {
    const onUpdateHandler = jest.fn()
    const ref = React.createRef<StepFormikRef<unknown>>()
    const { container } = render(
      <TestStepWidget
        initialValues={getInitialValues()}
        template={getRuntimeInputsValues()}
        allValues={getInitialValues()}
        type={StepType.Azure}
        stepViewType={StepViewType.Edit}
        onUpdate={onUpdateHandler}
        ref={ref}
      />
    )

    await act(async () => {
      const namespaceInput = container.querySelector(
        '[placeholder="pipeline.infraSpecifications.namespacePlaceholder"]'
      )
      fireEvent.change(namespaceInput!, { target: { value: 'namespace changed' } })

      await ref.current?.submitForm()
    })

    await waitFor(() => expect(onUpdateHandler).toHaveBeenCalled())
  })
})

describe('Test Azure Infrastructure Spec autocomplete', () => {
  test('Test connector autocomplete', async () => {
    const step = new AzureInfrastructureSpec() as any
    let list: CompletionItemInterface[]

    list = await step.getConnectorsListForYaml(connectorRefPath, getYaml(), getParams())
    expect(list).toHaveLength(2)
    expect(list[0].insertText).toBe('AWS')

    list = await step.getConnectorsListForYaml('invalid path', getYaml(), getParams())
    expect(list).toHaveLength(0)

    list = await step.getConnectorsListForYaml(connectorRefPath, getInvalidYaml(), getParams())
    expect(list).toHaveLength(0)
  })

  test('Test subscription names autocomplete', async () => {
    const step = new AzureInfrastructureSpec() as any
    let list: CompletionItemInterface[]

    list = await step.getSubscriptionListForYaml(subscriptionPath, getYaml(), getParams())
    expect(list).toHaveLength(2)
    expect(list[0].insertText).toBe('sub1')

    list = await step.getSubscriptionListForYaml('invalid path', getYaml(), getParams())
    expect(list).toHaveLength(0)

    list = await step.getSubscriptionListForYaml(subscriptionPath, getInvalidYaml(), getParams())
    expect(list).toHaveLength(0)
  })

  test('Test resource groups names autocomplete', async () => {
    const step = new AzureInfrastructureSpec() as any
    let list: CompletionItemInterface[]

    list = await step.getResourceGroupListForYaml(resourceGroupPath, getYaml(), getParams())
    expect(list).toHaveLength(2)
    expect(list[0].insertText).toBe('rg1')

    list = await step.getResourceGroupListForYaml('invalid path', getYaml(), getParams())
    expect(list).toHaveLength(0)

    list = await step.getResourceGroupListForYaml(resourceGroupPath, getInvalidYaml(), getParams())
    expect(list).toHaveLength(0)
  })

  test('Test cluster names autocomplete', async () => {
    const step = new AzureInfrastructureSpec() as any
    let list: CompletionItemInterface[]

    list = await step.getClusterListForYaml(clusterPath, getYaml(), getParams())
    expect(list).toHaveLength(2)
    expect(list[0].insertText).toBe('us-west2/abc')

    list = await step.getClusterListForYaml('invalid path', getYaml(), getParams())
    expect(list).toHaveLength(0)

    list = await step.getClusterListForYaml(clusterPath, getInvalidYaml(), getParams())
    expect(list).toHaveLength(0)
  })
})
