/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, render, fireEvent, getByText } from '@testing-library/react'
import { waitFor } from '@testing-library/dom'
import { findPopoverContainer, TestWrapper } from '@common/utils/testUtils'
import { NewTemplatePopover } from '@templates-library/pages/TemplatesPage/views/NewTemplatePopover/NewTemplatePopover'
import routes from '@common/RouteDefinitions'
import { pipelineModuleParams, projectPathProps } from '@common/utils/routeUtils'

const PATH = routes.toTemplates({ ...projectPathProps, ...pipelineModuleParams })
const PATH_PARAMS = {
  accountId: 'accountId',
  orgIdentifier: 'default',
  projectIdentifier: 'Yogesh_Test',
  module: 'cd'
}

describe('<NewTemplatePopover> tests', () => {
  test('should match snapshot', () => {
    const { container } = render(
      <TestWrapper path={PATH} pathParams={PATH_PARAMS}>
        <NewTemplatePopover />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('should open template studio with correct url when menu item is click', async () => {
    const { getByRole, getByTestId } = render(
      <TestWrapper path={PATH} pathParams={PATH_PARAMS}>
        <NewTemplatePopover />
      </TestWrapper>
    )

    const addTemplateButton = getByRole('button', { name: /templatesLibrary.addNewTemplate/ })
    act(() => {
      fireEvent.click(addTemplateButton)
    })

    const popover = findPopoverContainer() as HTMLElement
    await waitFor(() => popover)

    fireEvent.click(getByText(popover, 'step'))
    expect(getByTestId('location')).toMatchInlineSnapshot(`
      <div
        data-testid="location"
      >
        /account/accountId/cd/orgs/default/projects/Yogesh_Test/setup/resources/template-studio/Step/template/-1/
      </div>
    `)
  })
})
