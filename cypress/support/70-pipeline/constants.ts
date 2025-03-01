/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

const projectId = 'project1'
const accountId = 'accountId'
const orgIdentifier = 'default'
const pipelineIdentifier = 'testPipeline_Cypress'

export const pipelineListAPI = `/pipeline/api/pipelines/list?routingId=${accountId}&accountIdentifier=${accountId}&projectIdentifier=${projectId}&module=cd&orgIdentifier=${orgIdentifier}&searchTerm=&page=0&sort=lastUpdatedAt%2CDESC&size=20`
export const pipelineSummaryAPI = `/pipeline/api/pipelines/summary/appdtest?routingId=${accountId}&accountIdentifier=${accountId}&orgIdentifier=${orgIdentifier}&projectIdentifier=${projectId}`
export const pipelineDetailsAPI = `/pipeline/api/pipelines/appdtest?accountIdentifier=${accountId}&orgIdentifier=${orgIdentifier}&projectIdentifier=${projectId}`
export const pipelineExecutionSummaryAPI = `/pipeline/api/pipelines/execution/summary?routingId=${accountId}&accountIdentifier=${accountId}&projectIdentifier=${projectId}&orgIdentifier=${orgIdentifier}&module=cd&size=20&pipelineIdentifier=*&page=0&myDeployments=false`
export const pipelineExecutionAPI = `/pipeline/api/pipelines/execution/C9mgNjxSS7-B-qQek27iuA?routingId=${accountId}&orgIdentifier=${orgIdentifier}&projectIdentifier=${projectId}&accountIdentifier=${accountId}`
export const pipelineExecutionForNodeAPI = `/pipeline/api/pipelines/execution/C9mgNjxSS7-B-qQek27iuA?routingId=${accountId}&orgIdentifier=${orgIdentifier}&projectIdentifier=${projectId}&accountIdentifier=${accountId}&stageNodeId=g_LkakmWRPm-wC6rfC2ufg`
export const servicesCallV2 = `/ng/api/servicesV2/list/access?routingId=${accountId}&accountIdentifier=${accountId}&orgIdentifier=${orgIdentifier}&projectIdentifier=${projectId}`

export const gitSyncEnabledCall = `/ng/api/git-sync/git-sync-enabled?accountIdentifier=${accountId}&orgIdentifier=${orgIdentifier}&projectIdentifier=${projectId}`
export const pipelineSaveCall = `/pipeline/api/pipelines?accountIdentifier=${accountId}&projectIdentifier=${projectId}&orgIdentifier=${orgIdentifier}`
export const gitSyncMetaCall = `/ng/api/git-sync?routingId=${accountId}&accountIdentifier=${accountId}&orgIdentifier=${orgIdentifier}&projectIdentifier=${projectId}`
export const gitSyncBranchCall = `/ng/api/git-sync-branch/listBranchesWithStatus?routingId=${accountId}&accountIdentifier=${accountId}&orgIdentifier=${orgIdentifier}&projectIdentifier=${projectId}&yamlGitConfigIdentifier=&page=0&size=20&searchTerm=`
export const executionStratergies = `ng/api/pipelines/configuration/strategies?routingId=${accountId}`
export const yamlSnippet = `ng/api/pipelines/configuration/strategies/yaml-snippets?routingId=${accountId}&serviceDefinitionType=Kubernetes&strategyType=Rolling`
export const stepLibrary = `/pipeline/api/pipelines/v2/steps?routingId=${accountId}&accountId=${accountId}`
export const inputSetsTemplateCall = `/pipeline/api/inputSets/template?routingId=${accountId}&accountIdentifier=${accountId}&orgIdentifier=${orgIdentifier}&pipelineIdentifier=${pipelineIdentifier}&projectIdentifier=${projectId}`
export const pipelineDetails = `/pipeline/api/pipelines/testPipeline_Cypress?accountIdentifier=${accountId}&orgIdentifier=${orgIdentifier}&projectIdentifier=${projectId}`
export const applyTemplatesCall = `/template/api/templates/applyTemplates?routingId=${accountId}&accountIdentifier=${accountId}&orgIdentifier=${orgIdentifier}&projectIdentifier=${projectId}&getDefaultFromOtherRepo=true`
export const inputSetsCall = `/pipeline/api/inputSets?routingId=${accountId}&accountIdentifier=${accountId}&orgIdentifier=${orgIdentifier}&projectIdentifier=${projectId}&pipelineIdentifier=${pipelineIdentifier}&pageIndex=0&pageSize=20&searchTerm=`
export const pipelineDetailsWithRoutingIdCall = `/pipeline/api/pipelines/testPipeline_Cypress?routingId=${accountId}&accountIdentifier=${accountId}&orgIdentifier=${orgIdentifier}&projectIdentifier=${projectId}`
export const pipelineInputSetTemplate = `template/api/templates/applyTemplates?routingId=${accountId}&accountIdentifier=${accountId}&orgIdentifier=${orgIdentifier}&pipelineIdentifier=${pipelineIdentifier}&projectIdentifier=${projectId}&getDefaultFromOtherRepo=true`

export interface ValidObject {
  resourceName: StepResourceObject[]
  warningCheck?: boolean
}

export interface StepResourceObject {
  type: string
  name: string
  value: string
}
export interface StepConfigObject {
  [name: string]: { [name: string]: StepResourceObject | boolean }
}

export const pipelinesListCallResponse = {
  status: 'SUCCESS',
  data: {
    content: [
      {
        name: 'Parallel Pipelines',
        identifier: 'Parallel_Pipelines',
        tags: {},
        version: 33,
        numOfStages: 7,
        createdAt: 1643729398277,
        lastUpdatedAt: 1643729619074,
        modules: ['cd'],
        executionSummaryInfo: {
          numOfErrors: [0, 0, 0, 0, 0, 0, 15],
          deployments: [0, 0, 0, 0, 0, 0, 15],
          lastExecutionTs: 1643739804626,
          lastExecutionStatus: 'Failed',
          lastExecutionId: '-_gYM5jES1Wnow2BKbvDBQ'
        },
        filters: {
          cd: {
            deploymentTypes: ['Kubernetes'],
            environmentNames: ['prod environment'],
            serviceNames: ['Normal Service'],
            infrastructureTypes: ['KubernetesDirect']
          }
        },
        stageNames: ['Stage1', 'Stage2', 'Stage3', 'Stage4', 'Stage5', 'Stage6', 'Stage7'],
        gitDetails: {
          objectId: null,
          branch: null,
          repoIdentifier: null,
          rootFolder: null,
          filePath: null,
          repoName: null
        },
        entityValidityDetails: {
          valid: true,
          invalidYaml: null
        }
      },
      {
        name: 'ParallStage',
        identifier: 'ParallStage',
        tags: {},
        version: 154,
        numOfStages: 6,
        createdAt: 1641473199732,
        lastUpdatedAt: 1643184469790,
        modules: ['cd', 'ci'],
        executionSummaryInfo: {
          numOfErrors: [1, 0, 0, 0, 0, 0, 0],
          deployments: [6, 0, 20, 0, 0, 9, 0],
          lastExecutionTs: 1643601881783,
          lastExecutionStatus: 'Aborted',
          lastExecutionId: 'wjWjWYaBRNeT1Rrza4N9Dg'
        },
        filters: {
          cd: {
            deploymentTypes: ['Kubernetes'],
            environmentNames: [
              'test',
              'Devsf',
              'Very Long Env asd asd asd Kapil',
              'fdsggg',
              'asdasd',
              'prod environment'
            ],
            serviceNames: ['Newdds', 'test', 'Very Big Service Name Really', 'web', 'Normal Service', 'gfgfgf asdsad'],
            infrastructureTypes: ['KubernetesDirect']
          },
          ci: {
            repoNames: ['CCD']
          }
        },
        stageNames: ['Stage 5', 'Stage 6', 'Stage 3', 'Stage 4', 'Stage 1', 'Stage 2'],
        gitDetails: {
          objectId: null,
          branch: null,
          repoIdentifier: null,
          rootFolder: null,
          filePath: null,
          repoName: null
        },
        entityValidityDetails: {
          valid: true,
          invalidYaml: null
        }
      },
      {
        name: 'Pipeline 1911',
        identifier: 'Pipeline_1911',
        tags: {
          tag1: ''
        },
        version: 14,
        numOfStages: 1,
        createdAt: 1637310118606,
        lastUpdatedAt: 1640093470460,
        modules: ['cd'],
        executionSummaryInfo: {
          numOfErrors: [],
          deployments: []
        },
        filters: {
          cd: {
            deploymentTypes: ['Kubernetes'],
            environmentNames: ['env 2'],
            serviceNames: ['service 4'],
            infrastructureTypes: ['KubernetesDirect']
          }
        },
        stageNames: ['s1'],
        gitDetails: {
          objectId: '40d8e60d7e4b46f1a41deba2af7ee9c324726c13',
          branch: 'main',
          repoIdentifier: 'Git_Sync_Cypress',
          rootFolder: 'cypressQAResources/.harness/',
          filePath: 'Pipeline_1911.yaml',
          repoName: null
        },
        entityValidityDetails: {
          valid: false,
          invalidYaml:
            'pipeline:\n    name: Pipeline 1911\n    identifier: Pipeline_1911\n    projectIdentifier: Cypress_Git_Sync_Saas\n    orgIdentifier: default\n    tags:\n        tag1: ""\n    stages:\n        - stage:\n              name: s1\n              identifier: s1\n              description: ""\n              type: Deployme\n              spec:\n                  serviceConfig:\n                      serviceRef: service_4\n                      serviceDefinition:\n                          type: Kubernetes\n                          spec:\n                              variables: []\n                              manifests:\n                                  - manifest:\n                                        identifier: test\n                                        type: HelmChart\n                                        spec:\n                                            store:\n                                                type: Http\n                                                spec:\n                                                    connectorRef: account.puthrayahelm\n                                            chartName: test do\n                                            chartVersion: <+input>\n                                            helmVersion: V2\n                                            skipResourceVersioning: false\n                  infrastructure:\n                      environmentRef: env_2\n                      infrastructureDefinition:\n                          type: KubernetesDirect\n                          spec:\n                              connectorRef: <+input>\n                              namespace: <+input>\n                              releaseName: release-<+INFRA_KEY>\n                      allowSimultaneousDeployments: false\n                  execution:\n                      steps:\n                          - step:\n                                type: ShellScript\n                                name: test1\n                                identifier: test1\n                                spec:\n                                    shell: Bash\n                                    onDelegate: true\n                                    source:\n                                        type: Inline\n                                        spec:\n                                            script: <+input>\n                                    environmentVariables: []\n                                    outputVariables: []\n                                    executionTarget: {}\n                                timeout: 10m\n                      rollbackSteps: []\n              tags: {}\n              failureStrategies:\n                  - onFailure:\n                        errors:\n                            - AllErrors\n                        action:\n                            type: StageRollback\n    variables:\n        - name: var2411\n          type: Number\n          value: ""\n'
        }
      }
    ],
    pageable: {
      sort: {
        sorted: true,
        unsorted: false,
        empty: false
      },
      pageNumber: 0,
      pageSize: 20,
      offset: 0,
      paged: true,
      unpaged: false
    },
    last: false,
    totalPages: 1,
    totalElements: 3,
    first: true,
    sort: {
      sorted: true,
      unsorted: false,
      empty: false
    },
    numberOfElements: 3,
    size: 20,
    number: 0,
    empty: false
  },
  metaData: null,
  correlationId: 'f8b4e248-f6ba-47eb-938f-b205e6de5d4b'
}

export const servicesV2AccessResponse = {
  status: 'SUCCESS',
  data: [
    {
      service: {
        accountId: 'zEaak-FLS425IEO7OLzMUg',
        identifier: 'testService',
        orgIdentifier: 'CVNG',
        projectIdentifier: 'Dummy_Pipeline',
        name: 'testService',
        description: null,
        deleted: false,
        tags: {},
        version: 18
      },
      createdAt: 1643080660753,
      lastModifiedAt: 1645703389065
    },
    {
      service: {
        accountId: 'zEaak-FLS425IEO7OLzMUg',
        identifier: 'testService2',
        orgIdentifier: 'CVNG',
        projectIdentifier: 'Dummy_Pipeline',
        name: 'testService2',
        description: null,
        deleted: false,
        tags: {},
        version: 18
      },
      createdAt: 1643080660753,
      lastModifiedAt: 1645703389065
    },
    {
      service: {
        accountId: 'zEaak-FLS425IEO7OLzMUg',
        identifier: 'testService3',
        orgIdentifier: 'CVNG',
        projectIdentifier: 'Dummy_Pipeline',
        name: 'testService3',
        description: null,
        deleted: false,
        tags: {},
        version: 18
      },
      createdAt: 1643080660753,
      lastModifiedAt: 1645703389065
    }
  ],
  metaData: null,
  correlationId: 'dbfcc921-47f3-4841-b67a-7a4f85b7d5f3'
}

export const stepsData = {
  'BG Swap Services': { resourceName: [] },
  'Stage Deployment': { resourceName: [] },
  Apply: {
    resourceName: [{ type: 'resource', name: 'spec.filePaths[0].value', value: 'resource' }],
    warningCheck: true
  },
  Delete: {
    resourceName: [{ type: 'resource', name: 'spec.deleteResources.spec.resourceNames[0].value', value: 'resource' }]
  },
  'Canary Delete': { resourceName: [] },
  'Rolling Deployment': { resourceName: [] },
  'Canary Deployment': { resourceName: [] },
  Scale: { resourceName: [{ type: 'resource', name: 'spec.workload', value: 'resource' }] },
  'Rolling Rollback': { resourceName: [] },
  'Shell Script': {
    resourceName: [{ type: 'className', name: '.monaco-editor textarea:first', value: 'echo 1' }]
  },
  HTTP: {
    resourceName: [
      { type: 'resource', name: 'spec.url', value: 'https://abc.com' },
      { type: 'resource', name: 'spec.requestBody', value: 'resource' }
    ]
  }
}
