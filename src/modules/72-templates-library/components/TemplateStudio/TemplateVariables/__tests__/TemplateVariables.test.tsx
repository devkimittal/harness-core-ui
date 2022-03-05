/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import * as cdng from 'services/cd-ng'
import { factory } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { CustomVariables } from '@pipeline/components/PipelineSteps/Steps/CustomVariables/CustomVariables'
import { branchStatusMock, gitConfigs, sourceCodeManagers } from '@connectors/mocks/mock'
import {
  TemplateContext,
  TemplateContextInterface
} from '@templates-library/components/TemplateStudio/TemplateContext/TemplateContext'
import {
  TemplateVariablesContext,
  TemplateVariablesData
} from '@pipeline/components/TemplateVariablesContext/TemplateVariablesContext'
import TemplateVariablesWrapper from '@templates-library/components/TemplateStudio/TemplateVariables/TemplateVariables'
import variablesTemplate from './variables.json'
import metadataMap from './metadataMap.json'
import template from './template.json'

const getListOfBranchesWithStatus = jest.fn(() => Promise.resolve(branchStatusMock))
const getListGitSync = jest.fn(() => Promise.resolve(gitConfigs))

jest.spyOn(cdng, 'useGetListOfBranchesWithStatus').mockImplementation((): any => {
  return { data: branchStatusMock, refetch: getListOfBranchesWithStatus, loading: false }
})
jest.spyOn(cdng, 'useListGitSync').mockImplementation((): any => {
  return { data: gitConfigs, refetch: getListGitSync, loading: false }
})
jest.spyOn(cdng, 'useGetSourceCodeManagers').mockImplementation((): any => {
  return { data: sourceCodeManagers, refetch: jest.fn(), loading: false }
})

const stepStateMock = {
  template: template,
  originalTemplate: template,
  stableVersion: 'Version1',
  versions: ['Version1', 'Version2', 'Version3'],
  templateIdentifier: 'Test_Stage_Template',
  templateView: { isDrawerOpened: false, isYamlEditable: false, drawerData: { type: 'AddCommand' } },
  isLoading: false,
  isBETemplateUpdated: false,
  isDBInitialized: true,
  isUpdated: false,
  isInitialized: true,
  gitDetails: {},
  error: ''
}

const templateContextMock: TemplateContextInterface = {
  state: stepStateMock as any,
  view: 'VISUAL',
  isReadonly: false,
  setView: () => void 0,
  fetchTemplate: () => new Promise<void>(() => undefined),
  setYamlHandler: () => undefined,
  updateTemplate: jest.fn(),
  updateTemplateView: jest.fn(),
  deleteTemplateCache: () => new Promise<void>(() => undefined),
  setLoading: () => void 0,
  updateGitDetails: () => new Promise<void>(() => undefined)
}

describe('<TemplateVariables /> tests', () => {
  beforeAll(() => {
    factory.registerStep(new CustomVariables())
  })

  test('snapshot test', () => {
    const { container } = render(
      <TestWrapper>
        <TemplateContext.Provider value={templateContextMock}>
          <TemplateVariablesContext.Provider
            value={
              {
                originalTemplate: template,
                variablesTemplate,
                loading: false,
                initLoading: false,
                error: null,
                metadataMap
              } as unknown as TemplateVariablesData
            }
          >
            <TemplateVariablesWrapper />
          </TemplateVariablesContext.Provider>
        </TemplateContext.Provider>
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('renders loader', () => {
    const { container } = render(
      <TestWrapper>
        <TemplateContext.Provider value={templateContextMock}>
          <TemplateVariablesContext.Provider
            value={
              {
                originalTemplate: template,
                variablesTemplate,
                loading: false,
                initLoading: true,
                error: null,
                metadataMap
              } as unknown as TemplateVariablesData
            }
          >
            <TemplateVariablesWrapper />
          </TemplateVariablesContext.Provider>
        </TemplateContext.Provider>
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('renders error', () => {
    const { container } = render(
      <TestWrapper>
        <TemplateContext.Provider value={templateContextMock}>
          <TemplateVariablesContext.Provider
            value={
              {
                originalTemplate: template,
                variablesTemplate,
                loading: false,
                initLoading: false,
                error: { message: 'This is an error message' },
                metadataMap
              } as unknown as TemplateVariablesData
            }
          >
            <TemplateVariablesWrapper />
          </TemplateVariablesContext.Provider>
        </TemplateContext.Provider>
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})
