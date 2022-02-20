/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'

import { MultiTypeInputType } from '@harness/uicore'
import { TestWrapper } from '@common/utils/testUtils'

import TemplateInputSetStep from '../TemplateInputSetStep'

describe('<TemplateInputSetStep /> tests', () => {
  test('snapshot test for template input set step', () => {
    const props = {
      allowableTypes: [MultiTypeInputType.FIXED],
      initialValues: {
        identifier: 'template_id_1',
        name: 'template_1',
        type: 'Template',
        template: {
          templateRef: 'template_ref_1',
          templateInputs: {
            identifier: 'template_input_id_1',
            name: 'template_input_1',
            type: 'Template',
            spec: {
              delegateSelectors: false
            }
          }
        }
      },
      path: 'path/to/template',
      template: {
        identifier: 'template_id_2',
        name: 'template_2',
        template: {
          templateRef: 'template_ref_2',
          templateInputs: {
            identifier: 'template_input_id_2',
            name: 'template_input_2',
            type: 'Template',
            spec: {
              delegateSelectors: false
            }
          }
        }
      }
    }
    const { container } = render(
      <TestWrapper>
        <TemplateInputSetStep {...(props as any)} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
