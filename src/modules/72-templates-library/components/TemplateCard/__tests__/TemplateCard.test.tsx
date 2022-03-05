/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { defaultTo, noop, set } from 'lodash-es'
import produce from 'immer'
import { mockTemplates } from '@templates-library/TemplatesTestHelper'
import { TestWrapper } from '@common/utils/testUtils'
import { TemplateCard, TemplateCardProps } from '@templates-library/components/TemplateCard/TemplateCard'

const baseProps: TemplateCardProps = {
  template: defaultTo(mockTemplates.data?.content?.[0], {})
}

jest.mock(
  '@templates-library/pages/TemplatesPage/views/TemplateListCardContextMenu/TemplateListCardContextMenu',
  () => ({
    ...(jest.requireActual(
      '@templates-library/pages/TemplatesPage/views/TemplateListCardContextMenu/TemplateListCardContextMenu'
    ) as any),
    TemplateListCardContextMenu: () => {
      return <div className={'template-list-card-context-mock'}></div>
    }
  })
)

describe('<TemplateCard /> tests', () => {
  test('should match snapshot test with git sync enabled', async () => {
    const props = produce(baseProps, draft => {
      set(draft, 'template.gitDetails', {
        repoIdentifier: 'some repo',
        branch: 'some branch'
      })
    })
    const { container } = render(
      <TestWrapper defaultAppStoreValues={{ isGitSyncEnabled: true }}>
        <TemplateCard {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('should have menu icon', async () => {
    const { container } = render(
      <TestWrapper>
        <TemplateCard {...baseProps} onPreview={noop} onOpenEdit={noop} onOpenSettings={noop} onDelete={noop} />
      </TestWrapper>
    )

    const menuBtn = container.querySelector('[class*="template-list-card-context-mock"]')
    expect(menuBtn).toBeTruthy()
  })

  test('should not have menu icon', async () => {
    const template = mockTemplates.data?.content?.[0] || {}
    const { container } = render(
      <TestWrapper>
        <TemplateCard template={template} />
      </TestWrapper>
    )

    const menuBtn = container.querySelector('[class*="template-list-card-context-mock"]')
    expect(menuBtn).not.toBeTruthy()
  })
})
