/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { unset } from 'lodash-es'
import type { StringKeys } from 'framework/strings'
import { stageTemplateMock } from '@templates-library/components/TemplateStudio/__tests__/stateMock'
import { getScopeBasedQueryParams, getVersionLabelText } from '@templates-library/utils/templatesUtils'
import { Scope } from '@common/interfaces/SecretsInterface'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'

function getString(key: StringKeys): StringKeys {
  return key
}

describe('templateUtils tests', () => {
  test('Test getVersionLabelText method', () => {
    expect(getVersionLabelText(stageTemplateMock, getString)).toEqual('v1')
    expect(getVersionLabelText({ ...stageTemplateMock, stableTemplate: true }, getString)).toEqual(
      'templatesLibrary.stableVersion'
    )
    unset(stageTemplateMock, 'versionLabel')
    expect(getVersionLabelText(stageTemplateMock, getString)).toEqual('templatesLibrary.alwaysUseStableVersion')
  })

  test('Test getScopeBasedQueryParams method', () => {
    const queryParams: ProjectPathProps = {
      accountId: 'accountId',
      projectIdentifier: 'projectIdentifier',
      orgIdentifier: 'orgIdentifier'
    }
    expect(getScopeBasedQueryParams(queryParams, Scope.PROJECT)).toEqual({
      accountIdentifier: 'accountId',
      projectIdentifier: 'projectIdentifier',
      orgIdentifier: 'orgIdentifier'
    })
    expect(getScopeBasedQueryParams(queryParams, Scope.ORG)).toEqual({
      accountIdentifier: 'accountId',
      orgIdentifier: 'orgIdentifier'
    })
    expect(getScopeBasedQueryParams(queryParams, Scope.ACCOUNT)).toEqual({
      accountIdentifier: 'accountId'
    })
  })
})
