/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Text, Layout, Button } from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import css from '@projects-orgs/components/ProjectSelector/ProjectSelector.module.scss'

interface CreateOrSelectAProjectTemplateProps {
  onCreateProject: () => void
  closeModal?: () => void
  moduleDescription: string
}

export const CreateOrSelectAProjectTemplate: React.FC<CreateOrSelectAProjectTemplateProps> = ({
  onCreateProject,
  moduleDescription,
  closeModal
}) => {
  const { getString } = useStrings()
  function toggleSelectProject(): void {
    const selectProjectButton: HTMLElement = document.getElementsByClassName(css.selectButton)[0] as HTMLElement

    selectProjectButton?.click()
    closeModal?.()
  }

  function handleCreateProject(): void {
    closeModal?.()
    onCreateProject()
  }

  return (
    <Layout.Vertical spacing="small">
      <Text style={{ color: Color.BLACK, fontSize: 'large', fontWeight: 'bold' }}>
        {getString('projectsOrgs.createOrSelectAProject')}
      </Text>
      <Text style={{ color: Color.BLACK, fontSize: 'small' }}>
        {getString('projectsOrgs.getStarted', { moduleDescription })}
      </Text>
      <Layout.Horizontal spacing="small" padding={{ top: 'large' }}>
        <Button
          intent="primary"
          text={getString('projectsOrgs.selectAnExistingProject')}
          onClick={toggleSelectProject}
        />
        <Button intent="none" text={getString('projectsOrgs.createANewProject')} onClick={handleCreateProject} />
      </Layout.Horizontal>
    </Layout.Vertical>
  )
}
