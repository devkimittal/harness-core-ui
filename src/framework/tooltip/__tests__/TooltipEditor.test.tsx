/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { NGTooltipEditorPortal } from '../TooltipEditor'

const getDefaultProps = (showTooltipEditor: boolean) => ({
  onEditorClose: jest.fn(),
  showTooltipEditor,
  setPreviewDatasetFromLocalStorage: jest.fn()
})

describe('Tooltip editor tests', () => {
  const rootParent = document.createElement('div')
  beforeEach(() => {
    rootParent.id = 'ngTooltipEditorRootParent'
    document.body.appendChild(rootParent)
  })

  afterEach(() => {
    document.body.removeChild(rootParent)
  })

  test('if it renders in portal', async () => {
    const props = getDefaultProps(true)
    const { queryByText } = render(<NGTooltipEditorPortal {...props} />)
    expect(queryByText('No toolip IDs found in the present context.')).toBeTruthy()
  })

  test('if it renders null if flag is toggled', () => {
    const props = getDefaultProps(false)
    const { container } = render(<NGTooltipEditorPortal {...props} />)
    expect(container).toMatchInlineSnapshot('<div />')
  })
})
