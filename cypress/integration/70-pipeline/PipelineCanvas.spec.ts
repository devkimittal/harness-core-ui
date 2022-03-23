/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import {
  gitSyncEnabledCall,
  pipelineSaveCall,
  gitSyncMetaCall,
  gitSyncBranchCall,
  stepLibrary,
  inputSetsTemplateCall,
  pipelineDetails,
  applyTemplatesCall,
  inputSetsCall,
  pipelineDetailsWithRoutingIdCall,
  pipelineInputSetTemplate,
  ValidObject,
  servicesCallV2,
  servicesV2AccessResponse,
  stepsData,
  StepResourceObject,
  pipelineStudioRoute,
  inputSetsRoute
} from '../../support/70-pipeline/constants'
import { getIdentifierFromName } from '../../utils/stringHelpers'

describe('GIT SYNC DISABLED', () => {
  beforeEach(() => {
    cy.on('uncaught:exception', () => {
      // returning false here prevents Cypress from
      // failing the test
      return false
    })
    cy.intercept('GET', gitSyncEnabledCall, { connectivityMode: null, gitSyncEnabled: false })
    cy.login('test', 'test')

    cy.visitCreatePipeline()

    cy.fillName('testPipeline_Cypress')

    cy.clickSubmit()

    cy.get('[icon="plus"]').click()
    cy.findByTestId('stage-Deployment').click()

    cy.fillName('testStage_Cypress')
    cy.clickSubmit()
  })

  it('should display the error returned by pipeline save API', () => {
    cy.intercept('POST', pipelineSaveCall, { fixture: 'pipeline/api/pipelines.post' })
    cy.contains('span', 'New Service').click()

    cy.fillName('testService')
    cy.get('[data-id="service-save"]').click()

    cy.contains('span', 'Service created successfully').should('be.visible')

    cy.get('[value="testService"]').should('be.visible')

    cy.contains('span', '+ Add Variable').click()
    cy.fillName('testVariable')
    cy.findByTestId('addVariableSave').click()

    cy.get('[name="variables[0].value"]').type('varvalue')

    cy.contains('span', 'Next').click()

    cy.contains('span', 'New Environment').click()
    cy.fillName('testEnv')
    cy.contains('p', 'Production').click()
    cy.get('[data-id="environment-save"]').click()

    cy.contains('span', 'Environment created successfully').should('be.visible')

    cy.get('[value="testEnv"]').should('be.visible')

    cy.get('[data-name="toggle-option-two"]').click()

    // Enable YAML editing
    cy.contains('span', 'Edit YAML').click({ force: true })

    cy.get('[data-name="toggle-option-one"]').click()

    // try to save the pipleine, the mock data has error
    cy.contains('span', 'Save').click({ force: true })

    cy.contains(
      'span',
      'Invalid yaml: $.pipeline.stages[0].stage.spec.execution: is missing but it is required'
    ).should('be.visible')
  })

  it('should display the success message if pipeline save is success', () => {
    cy.intercept('POST', pipelineSaveCall, { fixture: 'pipeline/api/pipelines.postsuccess' })
    cy.contains('span', 'Save').click({ force: true })
    cy.contains('span', 'Pipeline published successfully').should('be.visible')
  })
})

describe('GIT SYNC ENABLED', () => {
  beforeEach(() => {
    cy.on('uncaught:exception', () => {
      // returning false here prevents Cypress from
      // failing the test
      return false
    })
    cy.intercept('GET', gitSyncEnabledCall, { connectivityMode: null, gitSyncEnabled: true })
    cy.intercept('POST', pipelineSaveCall, { fixture: 'pipeline/api/pipelines.postsuccess' })

    cy.intercept('GET', gitSyncMetaCall, { fixture: 'ng/api/git-sync' })
    cy.intercept('GET', gitSyncBranchCall, { fixture: 'ng/api/git-sync-branches' })
    cy.login('test', 'test')

    cy.visitCreatePipeline()

    cy.fillName('testPipeline_Cypress')

    cy.clickSubmit()

    cy.get('[icon="plus"]').click()
    cy.findByTestId('stage-Deployment').click()

    cy.fillName('testStage_Cypress')
    cy.clickSubmit()
  })

  it('should display the git sync dialog on save', () => {
    // open the sav confirmation dialog
    cy.contains('span', 'Save').click({ force: true })
    cy.contains(
      'p',
      'We don’t have your git credentials for the selected folder. Please update the credentials in user profile.'
    ).should('be.visible')
  })
})

describe('Execution Stages', () => {
  beforeEach(() => {
    cy.on('uncaught:exception', () => {
      // returning false here prevents Cypress from
      // failing the test
      return false
    })
    cy.initializeRoute()

    cy.intercept('GET', gitSyncEnabledCall, { connectivityMode: null, gitSyncEnabled: false })
    cy.intercept('POST', pipelineSaveCall, { fixture: 'pipeline/api/pipelines.post' })
    cy.intercept('POST', stepLibrary, { fixture: 'ng/api/stepLibrary' }).as('stepLibrary')
    cy.intercept('POST', pipelineSaveCall, { fixture: 'pipeline/api/pipelines.postsuccess' })
    // Input Set APIs
    cy.intercept('POST', inputSetsTemplateCall, { fixture: 'pipeline/api/inputSet/inputSetsTemplateCall' }).as(
      'inputSetsTemplateCall'
    )
    cy.intercept('GET', pipelineDetails, { fixture: 'pipeline/api/inputSet/pipelineDetails' }).as('pipelineDetails')
    cy.intercept('POST', applyTemplatesCall, { fixture: 'pipeline/api/inputSet/applyTemplatesCall' })
    cy.intercept('GET', inputSetsCall, { fixture: 'pipeline/api/inputSet/emptyInputSetsList' }).as('emptyInputSetList')
  })

  const stepFieldSelection = function (stepName: string, resourceName: StepResourceObject[]): void {
    cy.fillName(stepName)
    cy.fillField('timeout', '10m')

    resourceName.forEach(resource => {
      switch (resource?.type) {
        case 'resource': {
          cy.fillField(resource.name, resource.value)
          break
        }
        case 'className': {
          cy.get(resource.name).type(resource.value)
          break
        }
        default:
      }
    })

    cy.contains('span', 'Apply Changes').click()
    cy.wait(1000)
  }
  const yamlValidations = function (stepName: string, resourceName: StepResourceObject[]): void {
    // Toggle to YAML view
    cy.get('[data-name="toggle-option-two"]').click({ force: true })
    cy.wait(1000)
    cy.get('.monaco-editor .overflow-guard').scrollTo('0%', '25%', { ensureScrollable: false })
    cy.contains('span', stepName).should('be.visible')
    cy.contains('span', getIdentifierFromName(stepName)).should('be.visible')
    resourceName.forEach(resource => {
      resource?.value && cy.contains('span', resource.value).should('be.visible')
    })
  }

  const stepLibrarySelection = function (
    stageText: string,
    resourceName: StepResourceObject[],
    withWarning?: boolean
  ): void {
    cy.get('p[data-name="node-name"]').contains('Add step').click({ force: true })

    cy.get('[data-testid=addStepPipeline]').should('be.visible')
    cy.wait(500)
    cy.get('[data-testid=addStepPipeline]').click({ force: true })
    cy.wait('@stepLibrary').wait(500)
    cy.contains('section', stageText).click({ force: true })

    if (withWarning) {
      cy.get('.pipeline-studio-right-drawer span[icon="cross"]').click()
      cy.wait(1000)
      cy.get('span[icon="warning-sign"]').should('exist')
      cy.get('p').contains(stageText).click({ force: true })
    }

    stepFieldSelection(stageText, resourceName)
    cy.wait(500)
    cy.get('span[icon="warning-sign"]').should('not.exist')
    yamlValidations(stageText, resourceName)
  }

  Object.entries<ValidObject>(stepsData).forEach(([key, value]) => {
    it(`Stage Steps - ${key}`, () => {
      cy.visit(pipelineStudioRoute, { timeout: 30000 })
      cy.wait('@inputSetsTemplateCall')
      cy.wait('@pipelineDetails')
      cy.wait(2000)
      cy.get(`div[data-testid="pipeline-studio"]`, {
        timeout: 5000
      }).should('be.visible')
      cy.contains('p', 'testStage_Cypress').click()
      cy.contains('span', 'Execution').click()
      stepLibrarySelection(key, value?.resourceName, value?.warningCheck)
    })
  })
})

describe('Input Sets', () => {
  beforeEach(() => {
    cy.on('uncaught:exception', () => {
      // returning false here prevents Cypress from
      // failing the test
      return false
    })
    cy.initializeRoute()
    cy.intercept('GET', inputSetsCall, { fixture: 'pipeline/api/inputSet/emptyInputSetsList' }).as('emptyInputSetList')
    cy.intercept('POST', inputSetsTemplateCall, {
      fixture: 'pipeline/api/inputSet/fetchServiceTemplate'
    }).as('fetchServiceTemplate')
    cy.intercept('GET', pipelineDetailsWithRoutingIdCall, {
      fixture: 'pipeline/api/inputSet/fetchPipelineTemplate'
    }).as('fetchPipelineTemplate')
    cy.intercept('POST', pipelineInputSetTemplate, {
      fixture: 'pipeline/api/inputSet/applyTemplates'
    }).as('applyTemplates')
    cy.intercept('GET', servicesCallV2, servicesV2AccessResponse).as('servicesCallV2')
    cy.visit(inputSetsRoute, {
      timeout: 30000
    })
    cy.wait(2000)
  })

  it('Input Set Creation & Deletion', () => {
    cy.wait('@emptyInputSetList')
    cy.wait(1000)
    cy.contains('span', '+ New Input Set').should('be.visible')
    cy.get('.NoDataCard--buttonContainer').contains('span', '+ New Input Set').click()
    // Input Flow - Service
    cy.wait('@servicesCallV2').wait(1000)
    cy.fillField('name', 'testService')
    cy.findByText('Specify Service').should('exist')
    cy.get('input[name="pipeline.stages[0].stage.spec.serviceConfig.serviceRef"]').click()
    cy.contains('p', 'testService').click({ force: true })

    cy.fillField('pipeline.stages[0].stage.spec.infrastructure.infrastructureDefinition.spec.namespace', 'default')
    cy.get('[value="default"]').should('be.visible')

    // Toggle to YAML view
    cy.get('[data-name="toggle-option-two"]').click({ force: true })
    cy.wait(1000)
    // Verify all details in YAML view
    cy.contains('span', 'testService').should('be.visible')
    cy.contains('span', 'project1').should('be.visible')

    cy.contains('span', 'identifier').should('be.visible')
    cy.contains('span', 'testStage_Cypress').should('be.visible')

    cy.contains('span', 'identifier').should('be.visible')
    cy.contains('span', 'testPipeline_Cypress').should('be.visible')

    cy.contains('span', 'serviceRef').should('be.visible')
    cy.contains('span', 'testService').should('be.visible')

    cy.contains('span', 'namespace').should('be.visible')
    cy.contains('span', 'default').should('be.visible')

    cy.contains('span', 'Save').click()
    cy.intercept('GET', inputSetsCall, {
      fixture: 'pipeline/api/inputSet/inputSetsList'
    }).as('inputSetList')
    cy.wait('@inputSetList')
    cy.wait(1000)

    cy.contains('p', 'testService').should('be.visible')
    cy.contains('p', 'Id: testService').should('be.visible')
    cy.contains('span', 'Run Pipeline').should('be.visible')

    cy.get('[data-icon="more"]').should('be.visible')
    cy.get('[data-icon="more"]').first().click()

    cy.contains('div', 'Edit').should('be.visible')
    cy.contains('div', 'Delete').should('be.visible')

    // Delete flow verification
    cy.intercept('GET', inputSetsCall, {
      fixture: 'pipeline/api/inputSet/emptyInputSetsList'
    })
    cy.contains('div', 'Delete').click()
    cy.contains('p', 'Delete Input Set').should('be.visible')
    cy.contains('span', 'Delete').should('be.visible')
    cy.contains('span', 'Delete').click({ force: true })
    cy.contains('span', 'Input Set "testService" deleted').should('be.visible')
    cy.contains('p', 'testService').should('not.exist')
  })
})
