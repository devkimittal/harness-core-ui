/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, render } from '@testing-library/react'
import { defaultTo } from 'lodash-es'
import { TestWrapper } from '@common/utils/testUtils'
import MonacoEditor from '@common/components/MonacoEditor/__mocks__/MonacoEditor'
import { mockTemplates, mockTemplatesSuccessResponse } from '@templates-library/TemplatesTestHelper'
import { TemplateDetails } from '../TemplateDetails'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')
jest.mock('@wings-software/monaco-yaml/lib/esm/languageservice/yamlLanguageService', () => ({
  getLanguageService: jest.fn()
}))

jest.mock('@common/hooks', () => ({
  ...(jest.requireActual('@common/hooks') as any),
  useMutateAsGet: jest.fn()
}))

jest.mock('@common/hooks', () => ({
  ...(jest.requireActual('@common/hooks') as any),
  useMutateAsGet: jest.fn().mockImplementation(() => mockTemplatesSuccessResponse)
}))

jest.mock('react-monaco-editor', () => ({
  MonacoDiffEditor: MonacoEditor
}))

jest.mock('@common/components/MonacoEditor/MonacoEditor', () => MonacoEditor)

describe('<TemplateDetails /> tests', () => {
  const baseProps = {
    template: defaultTo(mockTemplates?.data?.content?.[0], {})
  }
  test('should match snapshot', async () => {
    const { container } = render(
      <TestWrapper>
        <TemplateDetails {...baseProps} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('should show selected version label', async () => {
    const { getByTestId } = render(
      <TestWrapper>
        <TemplateDetails {...baseProps} allowStableSelection={true} />
      </TestWrapper>
    )
    const dropValue = getByTestId('dropdown-value')
    expect(dropValue).toHaveTextContent('templatesLibrary.alwaysUseStableVersion')
  })

  test('should open template studio on clicking open in template studio', async () => {
    const { getByRole, getByTestId } = render(
      <TestWrapper>
        <TemplateDetails {...baseProps} />
      </TestWrapper>
    )

    await act(async () => {
      fireEvent.click(getByRole('button', { name: 'templatesLibrary.openInTemplateStudio' }))
    })
    expect(getByTestId('location')).toMatchInlineSnapshot(`
      <div
        data-testid="location"
      >
        /account/kmpySmUISimoRrJL6NL73w/home/orgs/default/projects/Templateproject/setup/resources/template-studio/Step/template/manjutesttemplate/?versionLabel=v4
      </div>
    `)
  })
})
