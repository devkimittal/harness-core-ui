/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
import '@testing-library/cypress/add-commands'
import { getConnectorIconByType } from '../utils/connctors-utils'
import {
  servicesCall,
  servicesResponse,
  environmentsCall,
  environmentResponse
} from './85-cv/monitoredService/constants'

import {
  applyTemplatesCall,
  monitoresServices,
  monitoresServicesResponse,
  pipelineSteps,
  pipelineStepsResponse,
  servicesCall as verifyStepServicesCall,
  strategies,
  strategiesResponse,
  strategiesYamlSnippets,
  strategiesYamlSnippetsResponse,
  variables,
  variablesPostResponse
} from './85-cv/verifyStep/constants'

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    /* eslint-disable @typescript-eslint/no-unused-vars  */
    interface Chainable<Subject> {
      login(username: string, pass: string): void
      visitCreatePipeline(): void
      visitPipelinesList(): void
      visitChangeIntelligence(): void
      fillName(name: string): void
      initializeRoute(): void
      clickSubmit(): void
      fillField(fieldName: string, value: string): void
      addNewMonitoredServiceWithServiceAndEnv(): void
      mapMetricToServices(hasServiceIndentifier?: boolean): void
      addingGroupName(name: string): void
      populateDefineHealthSource(connectorType: string, connectorName: string, healthSourceName: string): void
      selectFeature(featureName: string): void
      visitVerifyStepInPipeline(): void
      apiMocksForVerifyStep(): void
      verifyStepInitialSetup(): void
      verifyStepSelectConnector(): void
      verifyStepChooseRuntimeInput(): void
      verifyStepSelectStrategyAndVerifyStep(): void
    }
  }
}

Cypress.Commands.add('clickSubmit', () => {
  cy.get('[type="submit"]').click()
})

Cypress.Commands.add('fillField', (fieldName: string, value: string) => {
  cy.get(`[name="${fieldName}"]`).clear().type(value)
})

Cypress.Commands.add('login', (emailValue: string, password: string) => {
  cy.visit('#/login')
  cy.get('[data-id="email-0"] input').clear().type(emailValue)
  cy.get('[data-id="password-1"] input').clear().type(password)
  cy.clickSubmit()
})

Cypress.Commands.add('visitPipelinesList', () => {
  cy.contains('p', 'Projects').click()
  cy.contains('p', 'Project 1').click()
  cy.contains('p', 'Delivery').click()
  cy.contains('p', 'Pipelines').click()
})

Cypress.Commands.add('visitCreatePipeline', () => {
  cy.visitPipelinesList()
  cy.contains('span', 'Create a Pipeline').click()
})

Cypress.Commands.add('fillName', (value: string) => {
  cy.fillField('name', value)
})

Cypress.Commands.add('initializeRoute', () => {
  localStorage.setItem('token', 'JTIydG9rZW4lMjI=')
})

Cypress.Commands.add('visitVerifyStepInPipeline', () => {
  cy.contains('p', 'Projects').click()
  cy.contains('p', 'Project 1').click()
  cy.contains('p', 'Delivery').click()
  cy.contains('p', 'Pipelines').click()
  cy.contains('span', 'Create a Pipeline').click()
})

// Change Intelligence commands
Cypress.Commands.add('visitChangeIntelligence', () => {
  cy.contains('span', 'Service Reliability').click()
  cy.contains('p', 'Select a Project').click()
  cy.contains('p', 'Project 1').click()
})

Cypress.Commands.add('addNewMonitoredServiceWithServiceAndEnv', () => {
  cy.intercept('GET', servicesCall, servicesResponse).as('ServiceCall')
  cy.intercept('GET', environmentsCall, environmentResponse).as('EnvCall')

  cy.contains('span', 'New Monitored Service').click()
  cy.wait('@ServiceCall')
  cy.wait('@EnvCall')
  cy.wait(1000)

  // clear any cached values
  cy.get('body').then($body => {
    if ($body.text().includes('Unsaved changes')) {
      cy.contains('span', 'Discard').click()
    }
  })

  cy.contains('div', 'Unsaved changes').should('not.exist')
  cy.get('button').contains('span', 'Discard').parent().should('be.disabled')

  cy.get('button').contains('span', 'Save').click()

  // Check valiadtions
  cy.contains('span', 'Service is required').should('be.visible')
  cy.contains('span', 'Environment is required').should('be.visible')
  cy.contains('span', 'Monitored Service Name is required').should('be.visible')

  cy.get('input[name="service"]').click()
  cy.contains('p', 'Service 101').click({ force: true })

  cy.contains('span', 'Service is required').should('not.exist')

  cy.get('input[name="environment"]').click()
  cy.contains('p', 'QA').click({ force: true })

  cy.contains('span', 'Environment is required').should('not.exist')
  cy.contains('span', 'Monitored Service Name is required').should('not.exist')

  cy.contains('div', 'Unsaved changes').scrollIntoView().should('be.visible')
  cy.get('button').contains('span', 'Discard').parent().should('be.enabled')
})

Cypress.Commands.add('mapMetricToServices', (hasServiceIndentifier = false) => {
  // Triggering validations again
  cy.findByRole('button', { name: /Submit/i }).click()

  // Verifying validation messages for the metric mapping component
  cy.contains('span', 'One selection is required.').should('be.visible')
  cy.get('input[name="sli"]').click({ force: true })
  cy.contains('span', 'One selection is required.').should('not.exist')

  cy.get('input[name="continuousVerification"]').click({ force: true })
  cy.get('input[name="healthScore"]').click({ force: true })

  cy.contains('span', 'Risk Category is required.').should('exist')
  cy.contains('label', 'Errors').click()
  cy.contains('span', 'Risk Category is required.').should('not.exist')

  cy.contains('span', 'One selection is required.').should('exist')
  cy.get('input[name="higherBaselineDeviation"]').click({ force: true })
  cy.contains('span', 'One selection is required.').should('not.exist')

  if (hasServiceIndentifier) {
    cy.get('input[name="serviceInstance"]').click()
    cy.get('.Select--menuItem').first().click()
  }

  cy.findByRole('button', { name: /Submit/i }).click()
})

Cypress.Commands.add('addingGroupName', name => {
  cy.get('input[name="groupName"]').click()
  cy.get('.Select--menuItem').click()
  cy.get('input[name="name"]').last().type(name)
  cy.findAllByRole('button', { name: /Submit/i })
    .last()
    .click()
})

Cypress.Commands.add('populateDefineHealthSource', (connectorType, connectorName, healthSourceName) => {
  cy.contains('span', 'Add New Health Source').click()
  cy.contains('span', 'Next').click()

  // Validate and fill Define HealthSource Ta
  cy.contains('span', 'Next').click()
  cy.contains('span', 'Source selection is required').should('be.visible')
  cy.get(`span[data-icon=${getConnectorIconByType(connectorType)}]`).click()
  cy.contains('span', 'Source selection is required').should('not.exist')

  cy.contains('span', 'Name is required.').should('be.visible')
  cy.get('input[name="healthSourceName"]').type(healthSourceName)
  cy.contains('span', 'Name is required.').should('not.exist')

  cy.contains('span', 'Connector Selection is required.').should('be.visible')
  cy.get('button[data-testid="cr-field-connectorRef"]').click()
  cy.contains('p', connectorName).click()
  cy.contains('span', 'Apply Selected').click()
  cy.contains('span', 'Connector Selection is required.').should('not.exist')
})

Cypress.Commands.add('selectFeature', featureName => {
  cy.contains('span', 'product is a required field').should('be.visible')
  cy.get('input[name="product"]').click({ force: true })
  cy.contains('p', featureName).click()
  cy.contains('span', 'product is a required field').should('not.exist')
})

Cypress.Commands.add('apiMocksForVerifyStep', () => {
  cy.intercept(
    'POST',
    '/pipeline/api/pipelines?accountIdentifier=accountId&projectIdentifier=project1&orgIdentifier=default',
    {
      status: 'SUCCESS',
      message: null,
      correlationId: 'd174366f-e2dd-4e9a-8474-df2d47c12bec',
      detailedMessage: null,
      responseMessages: []
    }
  ).as('pipelineSave')
  cy.intercept('GET', strategies, strategiesResponse).as('strategiesList')
  cy.intercept('GET', strategiesYamlSnippets, strategiesYamlSnippetsResponse).as('strategiesYaml')
  cy.intercept('GET', monitoresServices, monitoresServicesResponse).as('monitoredServices')
  cy.intercept('POST', variables, variablesPostResponse).as('variables')
  cy.intercept('POST', pipelineSteps, pipelineStepsResponse).as('pipelineSteps')
  cy.intercept('GET', verifyStepServicesCall, { fixture: 'ng/api/servicesV2' }).as('service')
})

Cypress.Commands.add('verifyStepInitialSetup', () => {
  cy.apiMocksForVerifyStep()
  cy.get('[icon="plus"]').first().click()
  cy.findByTestId('stage-Deployment').click()

  cy.fillName('testStage_Cypress')
  cy.clickSubmit()
})

Cypress.Commands.add('verifyStepSelectConnector', () => {
  cy.intercept('POST', applyTemplatesCall).as('applyTemplatesCall')
  cy.contains('p', /^Kubernetes$/).click()

  cy.contains('span', 'Select Connector').click({ force: true })
  cy.wait(500)
  cy.contains('p', 'test1111', { timeout: 10000 }).click({ force: true })
  cy.contains('span', 'Apply Selected', { timeout: 10000 }).click({ force: true })

  cy.wait('@applyTemplatesCall')

  cy.get('[name="namespace"]').scrollIntoView()

  cy.fillField('namespace', 'verify-step')
})

Cypress.Commands.add('verifyStepChooseRuntimeInput', () => {
  cy.get('.MultiTypeInput--FIXED').click()
  cy.findByText('Runtime input').click()
})

Cypress.Commands.add('verifyStepSelectStrategyAndVerifyStep', () => {
  cy.intercept('POST', applyTemplatesCall).as('applyTemplatesCall')
  // Execution definition
  cy.findByTestId('execution').click()

  cy.wait('@strategiesList')
  cy.wait('@strategiesYaml')

  cy.wait(1000)

  // choosing deployment strategy
  cy.findByRole('button', { name: /Use Strategy/i }).click()

  cy.wait('@applyTemplatesCall')

  cy.wait(1000)

  // adding new step
  cy.findByText(/Add step/i).click()
  cy.findByTestId('addStepPipeline').click()

  cy.wait('@pipelineSteps')

  // click verify step
  cy.findByText(/Verify/i).click()
})
