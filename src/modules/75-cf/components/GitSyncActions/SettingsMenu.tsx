/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { ReactElement } from 'react'
import { Text, Layout, Container, Switch } from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
interface SettingsMenuProps {
  isAutoCommitEnabled: boolean
  isGitSyncPaused: boolean
  handleToggleAutoCommit: (setAutoCommit: boolean) => void
  handleGitPause: (newGitPauseValue: boolean) => void
  isLoading: boolean
}

const SettingsMenu = ({
  isAutoCommitEnabled,
  isGitSyncPaused,
  handleToggleAutoCommit,
  handleGitPause,
  isLoading
}: SettingsMenuProps): ReactElement => {
  const { getString } = useStrings()

  return (
    <Layout.Vertical padding="medium" spacing="small" flex={{ alignItems: 'flex-start' }}>
      <Container flex={{ alignItems: 'start' }}>
        <Switch
          data-testid="toggle-git-sync-pause-switch"
          alignIndicator="left"
          checked={!isGitSyncPaused}
          onChange={async event => {
            handleGitPause(event.currentTarget.checked)
          }}
          disabled={isLoading}
        />
        <Text color={Color.BLACK}>{getString('cf.gitSync.toggleGitSyncPause')}</Text>
      </Container>
      <Container flex={{ alignItems: 'start' }}>
        <Switch
          data-testid="auto-commit-switch"
          alignIndicator="left"
          checked={isAutoCommitEnabled}
          onChange={async event => {
            handleToggleAutoCommit(event.currentTarget.checked)
          }}
          disabled={isLoading || isGitSyncPaused}
        />
        <Text color={Color.BLACK}>{getString('cf.gitSync.autoCommitStatusLabel')}</Text>
      </Container>
    </Layout.Vertical>
  )
}

export default SettingsMenu
