var aa = {
  status: 'ERROR',
  code: 'SCHEMA_VALIDATION_FAILED',
  message: 'Invalid yaml: Invalid Yaml',
  correlationId: '6f548f04-7109-4c71-869a-d650395ac9d2',
  detailedMessage: null,
  responseMessages: [
    {
      code: 'SCHEMA_VALIDATION_FAILED',
      level: 'ERROR',
      message: 'Invalid yaml: Invalid Yaml',
      exception: null,
      failureTypes: []
    }
  ],
  metadata: {
    schemaErrors: [
      {
        message: 'userGroups: is missing but it is required',
        stageInfo: { identifier: 'approval1', type: 'Approval', name: 'approval3', fqn: '$.pipeline.stages[2].stage' },
        stepInfo: {
          identifier: 'approval',
          type: 'HarnessApproval',
          name: 'Approval',
          fqn: '$.pipeline.stages[2].stage.spec.execution.steps[0].step'
        },
        fqn: '$.pipeline.stages[2].stage.spec.execution.steps[0].step.spec.approvers',
        hintMessage: null
      },
      {
        message:
          'type: does not have a value in the enumeration [JiraUpdate, ServiceNowCreate, Http, JiraApproval, Barrier, ShellScript, ServiceNowApproval, HarnessApproval, FlagConfiguration, ServiceNowUpdate]',
        stageInfo: {
          identifier: 'approval2jira',
          type: 'Approval',
          name: 'approval2jira',
          fqn: '$.pipeline.stages[1].stage'
        },
        stepInfo: {
          identifier: 'jiraCreate',
          type: 'JiraCreate',
          name: 'Jira Create',
          fqn: '$.pipeline.stages[1].stage.spec.execution.steps[0].step'
        },
        fqn: '$.pipeline.stages[1].stage.spec.execution.steps[0].step.type',
        hintMessage: null
      },
      {
        message: 'connectorRef: is missing but it is required',
        stageInfo: {
          identifier: 'approval2jira',
          type: 'Approval',
          name: 'approval2jira',
          fqn: '$.pipeline.stages[1].stage'
        },
        stepInfo: {
          identifier: 'jiraUpdate',
          type: 'JiraUpdate',
          name: 'Jira Update',
          fqn: '$.pipeline.stages[1].stage.spec.execution.steps[2].step'
        },
        fqn: '$.pipeline.stages[1].stage.spec.execution.steps[2].step.spec',
        hintMessage: null
      },
      {
        message:
          'type: does not have a value in the enumeration [JiraCreate, JiraUpdate, ServiceNowCreate, Http, Barrier, ShellScript, ServiceNowApproval, HarnessApproval, FlagConfiguration, ServiceNowUpdate]',
        stageInfo: {
          identifier: 'approval2jira',
          type: 'Approval',
          name: 'approval2jira',
          fqn: '$.pipeline.stages[1].stage'
        },
        stepInfo: {
          identifier: 'jiraApproval',
          type: 'JiraApproval',
          name: 'Jira Approval',
          fqn: '$.pipeline.stages[1].stage.spec.execution.steps[1].step'
        },
        fqn: '$.pipeline.stages[1].stage.spec.execution.steps[1].step.type',
        hintMessage: null
      },
      {
        message: 'connectorRef: is missing but it is required',
        stageInfo: {
          identifier: 'approval2jira',
          type: 'Approval',
          name: 'approval2jira',
          fqn: '$.pipeline.stages[1].stage'
        },
        stepInfo: {
          identifier: 'jiraCreate',
          type: 'JiraCreate',
          name: 'Jira Create',
          fqn: '$.pipeline.stages[1].stage.spec.execution.steps[0].step'
        },
        fqn: '$.pipeline.stages[1].stage.spec.execution.steps[0].step.spec',
        hintMessage: null
      },
      {
        message: 'issueType: is missing but it is required',
        stageInfo: {
          identifier: 'approval2jira',
          type: 'Approval',
          name: 'approval2jira',
          fqn: '$.pipeline.stages[1].stage'
        },
        stepInfo: {
          identifier: 'jiraCreate',
          type: 'JiraCreate',
          name: 'Jira Create',
          fqn: '$.pipeline.stages[1].stage.spec.execution.steps[0].step'
        },
        fqn: '$.pipeline.stages[1].stage.spec.execution.steps[0].step.spec',
        hintMessage: null
      },
      {
        message: 'issueKey: is missing but it is required',
        stageInfo: {
          identifier: 'approval2jira',
          type: 'Approval',
          name: 'approval2jira',
          fqn: '$.pipeline.stages[1].stage'
        },
        stepInfo: {
          identifier: 'jiraUpdate',
          type: 'JiraUpdate',
          name: 'Jira Update',
          fqn: '$.pipeline.stages[1].stage.spec.execution.steps[2].step'
        },
        fqn: '$.pipeline.stages[1].stage.spec.execution.steps[2].step.spec',
        hintMessage: null
      },
      {
        message:
          'type: does not have a value in the enumeration [JiraCreate, ServiceNowCreate, Http, JiraApproval, Barrier, ShellScript, ServiceNowApproval, HarnessApproval, FlagConfiguration, ServiceNowUpdate]',
        stageInfo: {
          identifier: 'approval2jira',
          type: 'Approval',
          name: 'approval2jira',
          fqn: '$.pipeline.stages[1].stage'
        },
        stepInfo: {
          identifier: 'jiraUpdate',
          type: 'JiraUpdate',
          name: 'Jira Update',
          fqn: '$.pipeline.stages[1].stage.spec.execution.steps[2].step'
        },
        fqn: '$.pipeline.stages[1].stage.spec.execution.steps[2].step.type',
        hintMessage: null
      },
      {
        message: 'type: does not have a value in the enumeration [CI, Deployment, Approval, FeatureFlag]',
        stageInfo: { identifier: 'approval1', type: '', name: 'approval1', fqn: '$.pipeline.stages[0].stage' },
        stepInfo: null,
        fqn: '$.pipeline.stages[0].stage.type',
        hintMessage: null
      },
      {
        message: 'issueKey: is missing but it is required',
        stageInfo: {
          identifier: 'approval2jira',
          type: 'Approval',
          name: 'approval2jira',
          fqn: '$.pipeline.stages[1].stage'
        },
        stepInfo: {
          identifier: 'jiraApproval',
          type: 'JiraApproval',
          name: 'Jira Approval',
          fqn: '$.pipeline.stages[1].stage.spec.execution.steps[1].step'
        },
        fqn: '$.pipeline.stages[1].stage.spec.execution.steps[1].step.spec',
        hintMessage: null
      },
      {
        message: 'connectorRef: is missing but it is required',
        stageInfo: {
          identifier: 'approval2jira',
          type: 'Approval',
          name: 'approval2jira',
          fqn: '$.pipeline.stages[1].stage'
        },
        stepInfo: {
          identifier: 'jiraApproval',
          type: 'JiraApproval',
          name: 'Jira Approval',
          fqn: '$.pipeline.stages[1].stage.spec.execution.steps[1].step'
        },
        fqn: '$.pipeline.stages[1].stage.spec.execution.steps[1].step.spec',
        hintMessage: null
      },
      {
        message: 'projectKey: is missing but it is required',
        stageInfo: {
          identifier: 'approval2jira',
          type: 'Approval',
          name: 'approval2jira',
          fqn: '$.pipeline.stages[1].stage'
        },
        stepInfo: {
          identifier: 'jiraCreate',
          type: 'JiraCreate',
          name: 'Jira Create',
          fqn: '$.pipeline.stages[1].stage.spec.execution.steps[0].step'
        },
        fqn: '$.pipeline.stages[1].stage.spec.execution.steps[0].step.spec',
        hintMessage: null
      }
    ],
    type: 'YamlSchemaErrorWrapperDTO'
  }
}

var schemaErrors = aa.metadata.schemaErrors

var xyz = schemaErrors.reduce((accum, item) => {
  const isStageError = item.stageInfo && !item.stepInfo
  const addToAccum = () =>
    isStageError ? [item, ...accum[item.stageInfo.identifier]] : [...accum[item.stageInfo.identifier], item]
  accum[item.stageInfo.identifier] = accum[item.stageInfo.identifier] ? addToAccum() : [item]
  return accum
}, {})
