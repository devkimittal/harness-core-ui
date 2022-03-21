/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import { MultiTypeInputType, RUNTIME_INPUT_VALUE } from '@wings-software/uicore'
import type { UseGetMockData } from '@common/utils/testUtils'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import type {
  ResponseConnectorResponse,
  ResponseListServiceNowFieldNG,
  ResponsePageConnectorResponse,
  ServiceNowFieldSchemaNG
} from 'services/cd-ng'
import type { ServiceNowCreateDeploymentModeProps, ServiceNowCreateStepModeProps } from '../types'
import { FieldType } from '../types'
import { ServiceNowFieldNG } from 'services/cd-ng'

export const getServiceNowCreateEditModeProps = (): ServiceNowCreateStepModeProps => ({
  initialValues: {
    name: '',
    identifier: '',
    type: 'ServiceNowCreate',
    timeout: '5s',
    spec: {
      connectorRef: '',
      fields: [],
      ticketType: '',
      fieldType: FieldType.ConfigureFields
    }
  },
  onUpdate: jest.fn(),
  allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION],
  stepViewType: StepViewType.Edit
})

export const getServiceNowCreateEditModePropsWithConnectorId = (): ServiceNowCreateStepModeProps => ({
  initialValues: {
    name: '',
    identifier: '',
    type: 'ServiceNowCreate',
    timeout: '5s',
    spec: {
      connectorRef: 'cid',
      fields: [],
      ticketType: '',
      fieldType: FieldType.ConfigureFields
    }
  },
  onUpdate: jest.fn(),
  allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION],
  stepViewType: StepViewType.Edit
})

export const getServiceNowCreateEditModePropsWithValues = (): ServiceNowCreateStepModeProps => ({
  initialValues: {
    name: '',
    identifier: '',
    type: 'ServiceNowCreate',
    timeout: '1d',
    spec: {
      connectorRef: 'c1d1',
      fields: [
        { name: 'f21', value: 'value1' },
        { name: 'f2', value: 2233 },
        { name: 'date', value: '23-march' },
        { name: 'Summary', value: 'summaryval' },
        { name: 'Description', value: 'descriptionval' }
      ],

      ticketType: 'itd1',
      fieldType: FieldType.ConfigureFields
    }
  },
  onUpdate: jest.fn(),
  allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION],
  stepViewType: StepViewType.Edit
})

export const getServiceNowCreateDeploymentModeProps = (): ServiceNowCreateDeploymentModeProps => ({
  stepViewType: StepViewType.InputSet,
  initialValues: {
    name: '',
    identifier: '',
    type: 'ServiceNowCreate',
    spec: {
      connectorRef: '',

      ticketType: '',
      fieldType: FieldType.ConfigureFields,
      fields: []
    }
  },
  inputSetData: {
    path: '/ab/',
    template: {
      name: '',
      identifier: '',
      type: 'ServiceNowCreate',
      spec: {
        connectorRef: RUNTIME_INPUT_VALUE,
        ticketType: RUNTIME_INPUT_VALUE,
        fields: [],
        fieldType: FieldType.ConfigureFields
      }
    }
  },
  onUpdate: jest.fn(),
  allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]
})

export const getServiceNowCreateInputVariableModeProps = () => ({
  initialValues: {
    spec: {}
  },
  customStepProps: {
    stageIdentifier: 'qaStage',
    metadataMap: {
      'step-name': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.approval.name',
          localName: 'step.approval.name'
        }
      },
      'step-timeout': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.approval.timeout',
          localName: 'step.approval.timeout'
        }
      },
      'step-connectorRef': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.approval.spec.connectorRef',
          localName: 'step.approval.spec.connectorRef'
        }
      },
      'step-projectKey': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.approval.spec.projectKey',
          localName: 'step.approval.spec.projectKey'
        }
      },
      'step-issueType': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.approval.spec.issueType',
          localName: 'step.approval.spec.issueType'
        }
      }
    },
    variablesData: {
      type: StepType.ServiceNowCreate,
      identifier: 'jira_create',
      name: 'step-name',
      description: 'Description',
      timeout: 'step-timeout',
      spec: {
        connectorRef: 'step-connectorRef',
        projectKey: 'step-projectKey',
        issueType: 'step-issueType'
      }
    }
  },
  onUpdate: jest.fn()
})

export const mockConnectorResponse: UseGetMockData<ResponseConnectorResponse> = {
  loading: false,
  // eslint-disable-next-line
  // @ts-ignore
  refetch: jest.fn(),
  data: {
    correlationId: '',
    status: 'SUCCESS',
    metaData: null as unknown as undefined,
    data: {
      connector: { name: 'c1', identifier: 'cid1', type: 'ServiceNow', spec: {} }
    }
  }
}

export const mockConnectorsResponse: ResponsePageConnectorResponse = {
  correlationId: 'someid',
  status: 'SUCCESS',
  metaData: null as unknown as undefined,
  data: {
    content: [
      { connector: { name: 'c1', identifier: 'cid1', type: 'ServiceNow', spec: {} } },
      { connector: { name: 'c2', identifier: 'cid2', type: 'ServiceNow', spec: {} } }
    ]
  }
}

export const mockProjectMetadataResponse: UseGetMockData<ResponseListServiceNowFieldNG[]> = {
  data: [
    {
      key: 'f1',
      name: 'f1',
      allowedValues: [],
      schema: {
        type: 'string' as ServiceNowFieldSchemaNG['type'],
        typeStr: ''
      }
    },
    {
      key: 'f2',
      name: 'f2',
      allowedValues: [
        {
          id: 'av1',
          name: 'av1',
          value: 'av1'
        },
        {
          id: 'av2',
          name: 'av2'
        }
      ],
      schema: {
        type: 'string' as ServiceNowFieldSchemaNG['type'],
        typeStr: ''
      }
    }
  ],
  metaData: null,
  status: 'SUCCESS'
}
