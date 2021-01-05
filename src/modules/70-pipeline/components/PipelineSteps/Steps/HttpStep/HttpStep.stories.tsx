import React from 'react'
import type { Meta, Story } from '@storybook/react'
import { stringify } from 'yaml'
import { Card, RUNTIME_INPUT_VALUE } from '@wings-software/uicore'

import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import type { StepWidgetProps } from '@pipeline/components/AbstractSteps/StepWidget'

import { factory, TestStepWidget } from '../__tests__/StepTestUtil'
import { HttpStep } from './HttpStep'

factory.registerStep(new HttpStep())

export default {
  title: 'Pipelines / Pipeline Steps / HTTP Step',
  component: TestStepWidget,
  argTypes: {
    type: { control: { disable: true } },
    stepViewType: {
      control: {
        type: 'inline-radio',
        options: Object.keys(StepViewType)
      }
    },
    onUpdate: { control: { disable: true } },
    initialValues: {
      control: {
        type: 'object'
      }
    }
  }
} as Meta

export const HTTPStep: Story<Omit<StepWidgetProps, 'factory'>> = args => {
  const [value, setValue] = React.useState({})
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '480px 1fr', columnGap: '20px' }}>
      <Card>
        <TestStepWidget {...args} onUpdate={setValue} />
      </Card>
      <Card>
        <pre>{stringify(value)}</pre>
      </Card>
    </div>
  )
}

HTTPStep.args = {
  initialValues: { identifier: 'Test_A', type: StepType.K8sRollingDeploy },
  type: StepType.K8sRollingDeploy,
  stepViewType: StepViewType.Edit,
  path: '',
  template: {
    identifier: 'Test_A',
    type: StepType.K8sRollingDeploy,
    spec: { skipDryRun: RUNTIME_INPUT_VALUE, timeout: RUNTIME_INPUT_VALUE }
  },
  allValues: {
    type: StepType.K8sRollingDeploy,
    name: 'Test A',
    identifier: 'Test_A',
    spec: { skipDryRun: RUNTIME_INPUT_VALUE, timeout: RUNTIME_INPUT_VALUE }
  }
}
