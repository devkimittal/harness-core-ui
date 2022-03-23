/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, render } from '@testing-library/react'
import type { IconName } from '@blueprintjs/core'
import { MultiTypeInputType } from '@wings-software/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import { AbstractStepFactory } from '@pipeline/components/AbstractSteps/AbstractStepFactory'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { Step, StepProps } from '@pipeline/components/AbstractSteps/Step'
import { StageType } from '@pipeline/utils/stageHelpers'

import { StepCommandsWithRef } from '../StepCommands'

jest.mock('@common/components/MonacoEditor/MonacoEditor')

class StepFactory extends AbstractStepFactory {
  protected type = 'test-factory'
  protected stepName = 'stepOne'
  protected stepIcon: IconName = 'cross'
}

class StepOne extends Step<any> {
  protected type = StepType.Run
  protected stepName = 'stepOne'
  protected stepIcon: IconName = 'cross'
  validateInputSet(): any {
    return {}
  }
  protected defaultValues = { a: 'a' }
  renderStep(props: StepProps<any>): JSX.Element {
    return <div onClick={() => props.onUpdate?.(props.initialValues)}>{JSON.stringify(props.initialValues)}</div>
  }
}
const stepFactory = new StepFactory()
stepFactory.registerStep(new StepOne())

describe('<StepCommands /> tests', () => {
  test('renders ok', async () => {
    const { container } = render(
      <TestWrapper>
        <StepCommandsWithRef
          step={{
            identifier: 'testStep',
            name: 'testStep',
            type: 'Run',
            spec: {
              connectorRef: 'account.dockerdev',
              image: 'maven:3-openjdk-8',
              command: 'mvn clean compile war:war'
            }
          }}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          onUpdate={jest.fn()}
          stepsFactory={stepFactory}
          isStepGroup={false}
          isReadonly={false}
          ref={{ current: null }}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
  test('able to switch tab', async () => {
    const { queryByText, container } = render(
      <TestWrapper>
        <StepCommandsWithRef
          step={{
            identifier: 'testStep',
            name: 'testStep',
            type: 'Run',
            spec: {
              connectorRef: 'account.dockerdev',
              image: 'maven:3-openjdk-8',
              command: 'mvn clean compile war:war'
            }
          }}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          onUpdate={jest.fn()}
          stepsFactory={stepFactory}
          isStepGroup={false}
          isReadonly={false}
          ref={{ current: null }}
        />
      </TestWrapper>
    )

    act(() => {
      fireEvent.click(queryByText('advancedTitle') as HTMLElement)
    })
    expect(container).toMatchSnapshot()
  })

  test('should hide advanced tab for feature flags module', async () => {
    const { queryByText } = render(
      <TestWrapper
        path="/account/:accountId/:module/orgs/:orgIdentifier/projects/:projectIdentifier/pipelines/-1/pipeline-studio"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy', module: 'cf' }}
      >
        <StepCommandsWithRef
          step={{
            identifier: 'testStep',
            name: 'testStep',
            type: 'Run',
            spec: {
              connectorRef: 'account.dockerdev',
              image: 'maven:3-openjdk-8',
              command: 'mvn clean compile war:war'
            }
          }}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          onUpdate={jest.fn()}
          stepsFactory={stepFactory}
          isStepGroup={false}
          isReadonly={false}
          ref={{ current: null }}
        />
      </TestWrapper>
    )

    expect(queryByText('advancedTitle')).not.toBeInTheDocument()
  })

  test('should hide advanced tab for feature flag stage', async () => {
    const { queryByText } = render(
      <TestWrapper
        path="/account/:accountId/:module/orgs/:orgIdentifier/projects/:projectIdentifier/pipelines/-1/pipeline-studio"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy', module: 'cd' }}
      >
        <StepCommandsWithRef
          step={{
            identifier: 'testStep',
            name: 'testStep',
            type: 'Run',
            spec: {
              connectorRef: 'account.dockerdev',
              image: 'maven:3-openjdk-8',
              command: 'mvn clean compile war:war'
            }
          }}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          onUpdate={jest.fn()}
          stepsFactory={stepFactory}
          isStepGroup={false}
          isReadonly={false}
          ref={{ current: null }}
          stageType={StageType.FEATURE}
        />
      </TestWrapper>
    )

    expect(queryByText('advancedTitle')).not.toBeInTheDocument()
  })

  test('should show advanced tab for module and stage which are not feature flag', async () => {
    const { queryByText } = render(
      <TestWrapper
        path="/account/:accountId/:module/orgs/:orgIdentifier/projects/:projectIdentifier/pipelines/-1/pipeline-studio"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy', module: 'cd' }}
      >
        <StepCommandsWithRef
          step={{
            identifier: 'testStep',
            name: 'testStep',
            type: 'Run',
            spec: {
              connectorRef: 'account.dockerdev',
              image: 'maven:3-openjdk-8',
              command: 'mvn clean compile war:war'
            }
          }}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          onUpdate={jest.fn()}
          stepsFactory={stepFactory}
          isStepGroup={false}
          isReadonly={false}
          ref={{ current: null }}
          stageType={StageType.DEPLOY}
        />
      </TestWrapper>
    )

    expect(queryByText('advancedTitle')).toBeInTheDocument()
  })

  test('renders ok without tabs', async () => {
    const { queryByText, container } = render(
      <TestWrapper>
        <StepCommandsWithRef
          step={{
            identifier: 'testStep',
            name: 'testStep',
            type: 'Run',
            spec: {
              connectorRef: 'account.dockerdev',
              image: 'maven:3-openjdk-8',
              command: 'mvn clean compile war:war'
            }
          }}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          onUpdate={jest.fn()}
          stepsFactory={stepFactory}
          isStepGroup={false}
          isReadonly={false}
          ref={{ current: null }}
          withoutTabs={true}
        />
      </TestWrapper>
    )
    expect(queryByText('advancedTitle')).toBeNull()
    expect(container).toMatchSnapshot()
  })
})
