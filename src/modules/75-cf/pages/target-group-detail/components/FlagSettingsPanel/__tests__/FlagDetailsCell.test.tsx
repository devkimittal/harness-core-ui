/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, RenderResult, screen } from '@testing-library/react'
import { cloneDeep, omit } from 'lodash-es'
import { TestWrapper } from '@common/utils/testUtils'
import FlagDetailsCell, { FlagDetailsCellProps } from '../FlagDetailsCell'
import { mockTargetGroupFlagsMap } from './mocks'

const renderComponent = (props: Partial<FlagDetailsCellProps> = {}): RenderResult =>
  render(
    <TestWrapper>
      <FlagDetailsCell flag={mockTargetGroupFlagsMap.f1} {...props} />
    </TestWrapper>
  )

describe('FlagDetailsCell', () => {
  test('it should display the flag name and description', async () => {
    const flag = cloneDeep(mockTargetGroupFlagsMap.f1)
    flag.name = 'TEST FLAG NAME'
    flag.description = 'TEST FLAG DESCRIPTION'

    renderComponent({ flag })

    expect(screen.getByText(flag.name)).toBeInTheDocument()
    expect(screen.getByText(flag.description)).toBeInTheDocument()
  })

  test('it should not display the flag description if it is blank', async () => {
    const flag = omit(mockTargetGroupFlagsMap.f1, 'description')
    flag.name = 'TEST FLAG NAME'

    renderComponent({ flag })

    expect(screen.getByText(flag.name)).toBeInTheDocument()
    expect(document.querySelectorAll('p')).toHaveLength(1)
  })
})
