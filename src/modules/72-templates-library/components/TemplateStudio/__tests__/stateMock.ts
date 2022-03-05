/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { set } from 'lodash-es'
import produce from 'immer'
import type { TemplateContextInterface } from '@templates-library/components/TemplateStudio/TemplateContext/TemplateContext'
import type { JsonNode, NGTemplateInfoConfig } from 'services/template-ng'
import { TemplateType } from '@templates-library/utils/templatesUtils'
import { DrawerTypes } from '@templates-library/components/TemplateStudio/TemplateContext/TemplateActions'

export const stepTemplateMock: NGTemplateInfoConfig = {
  name: 'Test Template',
  identifier: 'Test_Template',
  versionLabel: 'v1',
  type: 'Step',
  projectIdentifier: 'Yogesh_Test',
  orgIdentifier: 'default',
  tags: {},
  spec: {
    type: 'Http',
    timeout: '1m 40s',
    spec: { url: '<+input>', method: 'GET', headers: [], outputVariables: [], requestBody: '<+input>' }
  } as JsonNode
}

export const stageTemplateMock: NGTemplateInfoConfig = {
  name: 'Test Template',
  identifier: 'Test_Template',
  versionLabel: 'v1',
  type: 'Stage',
  projectIdentifier: 'Yogesh_Test',
  orgIdentifier: 'default',
  tags: {},
  spec: {
    type: 'Deployment',
    spec: {
      serviceConfig: { serviceRef: 'Some_Service', serviceDefinition: { type: 'Kubernetes', spec: { variables: [] } } },
      infrastructure: {
        environmentRef: 'Some_Environment',
        infrastructureDefinition: {
          type: 'KubernetesDirect',
          spec: { connectorRef: 'account.arpitconn', namespace: '<+input>', releaseName: 'release-<+INFRA_KEY>' }
        },
        allowSimultaneousDeployments: false
      },
      execution: {
        steps: [
          {
            step: {
              name: 'Rollout Deployment',
              identifier: 'rolloutDeployment',
              type: 'K8sRollingDeploy',
              timeout: '10m',
              spec: { skipDryRun: false }
            }
          },
          {
            step: {
              type: 'ShellScript',
              name: 'Step 1',
              identifier: 'Step_1',
              spec: {
                shell: 'Bash',
                onDelegate: true,
                source: { type: 'Inline', spec: { script: '<+input>' } },
                environmentVariables: [],
                outputVariables: [],
                executionTarget: {}
              },
              timeout: '10m'
            }
          }
        ],
        rollbackSteps: [
          {
            step: {
              name: 'Rollback Rollout Deployment',
              identifier: 'rollbackRolloutDeployment',
              type: 'K8sRollingRollback',
              timeout: '10m',
              spec: {}
            }
          }
        ]
      }
    },
    failureStrategies: [{ onFailure: { errors: ['AllErrors'], action: { type: 'StageRollback' } } }],
    when: { pipelineStatus: 'Success' }
  } as JsonNode
}

export const getTemplateContextMock = (type: TemplateType): TemplateContextInterface => {
  const defaultTemplateContextMock: TemplateContextInterface = {
    state: {
      template: stepTemplateMock,
      originalTemplate: stepTemplateMock,
      stableVersion: 'v1',
      lastPublishedVersion: 'v3',
      versions: ['v1', 'v2', 'v3'],
      templateIdentifier: 'Test_Template',
      templateView: {
        isDrawerOpened: false,
        isYamlEditable: false,
        drawerData: { type: DrawerTypes.AddStep, data: { paletteData: { onSelection: () => undefined } } }
      },
      isLoading: false,
      isBETemplateUpdated: false,
      isDBInitialized: true,
      isUpdated: false,
      isInitialized: true,
      gitDetails: {},
      entityValidityDetails: {},
      templateYaml: ''
    },
    view: 'VISUAL',
    isReadonly: false,
    setView: () => void 0,
    fetchTemplate: () => new Promise<void>(() => undefined),
    setYamlHandler: () => undefined,
    updateTemplate: jest.fn(),
    updateTemplateView: jest.fn(),
    deleteTemplateCache: jest.fn(),
    setLoading: () => void 0,
    updateGitDetails: () => new Promise<void>(() => undefined)
  }

  switch (type) {
    case TemplateType.Step:
      return produce(defaultTemplateContextMock, draft => {
        set(draft, 'state.template', stepTemplateMock)
        set(draft, 'state.originalTemplate', stepTemplateMock)
      })
    case TemplateType.Stage:
      return produce(defaultTemplateContextMock, draft => {
        set(draft, 'state.template', stageTemplateMock)
        set(draft, 'state.originalTemplate', stageTemplateMock)
      })
    default:
      return defaultTemplateContextMock
  }
}
