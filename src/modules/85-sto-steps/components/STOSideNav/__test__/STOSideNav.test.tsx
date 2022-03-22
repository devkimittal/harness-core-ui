/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import STOSideNav from '../STOSideNav'

const testPathOverview = 'account/:accountId/sto/overview'
// const testPathProjectOverview = '/account/:accountId/ce/orgs/:orgIdentifier/projects/:projectIdentifier/overview/'
const testParams = {
  accountId: 'accountId',
  orgIdentifier: 'orgIdentifier',
  projectIdentifier: 'projectIdentifier',
  module: 'sto'
}

describe('STO side nav tests', () => {
  test('side nav renders without error when no project is selected', () => {
    const { container } = render(
      <TestWrapper path={testPathOverview} pathParams={testParams}>
        <STOSideNav />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  // test('side nav renders without error on project', () => {
  //   const { container } = render(
  //     <TestWrapper path={testPathProjectOverview} pathParams={testParams}>
  //       <STOSideNav />
  //     </TestWrapper>
  //   )
  //   expect(container).toMatchSnapshot()
  // })
})
