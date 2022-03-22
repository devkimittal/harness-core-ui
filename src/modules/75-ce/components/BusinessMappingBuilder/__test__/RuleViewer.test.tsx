/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { render } from '@testing-library/react'
import React from 'react'
import { TestWrapper } from '@common/utils/testUtils'
import RuleViewer from '../RuleViewer/RuleViewer'

const RuleValues: any = {
  name: 'Rule1',
  rules: [
    {
      viewConditions: [
        {
          values: ['a', 'b', 'c'],
          viewOperator: 'IN',
          viewField: {
            fieldId: 'product',
            fieldName: 'Product',
            identifier: 'COMMON',
            identifierName: 'Common'
          }
        },
        {
          values: ['d', 'e', 'f'],
          viewOperator: 'IN',
          viewField: {
            fieldId: 'product',
            fieldName: 'Product',
            identifier: 'COMMON',
            identifierName: 'Common'
          }
        }
      ]
    },
    {
      viewConditions: [
        {
          values: ['g', 'h', 'i'],
          viewOperator: 'IN',
          viewField: {
            fieldId: 'product',
            fieldName: 'Product',
            identifier: 'COMMON',
            identifierName: 'Common'
          }
        }
      ]
    }
  ],
  strategy: 'Fixed'
}

describe('test cases for rule viewer', () => {
  test('rule viewer test cases', () => {
    const { container } = render(
      <TestWrapper>
        <RuleViewer isOpen={true} value={RuleValues} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('rule viewer test cases, should not show if field is not defined', () => {
    const newRules: any = {
      name: 'Rule1',
      rules: [
        {
          viewConditions: [
            {
              viewField: {}
            }
          ]
        }
      ],
      strategy: 'Fixed'
    }
    const { container } = render(
      <TestWrapper>
        <RuleViewer isOpen={true} value={newRules} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
