/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Icon, Layout, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useGitSyncStore } from 'framework/GitRepoStore/GitSyncStoreContext'
import { getRepoDetailsByIndentifier } from '@common/utils/gitSyncUtils'
import type { GitQueryParams } from '@common/interfaces/RouteInterfaces'
import css from './InputSetSelector.module.scss'

export function InputSetGitDetails(props: { gitDetails: GitQueryParams }): JSX.Element {
  const { gitDetails } = props
  const { gitSyncRepos, loadingRepos } = useGitSyncStore()
  return (
    <Layout.Vertical margin={{ left: 'xsmall' }} spacing="small" className={css.inputSetGitDetails}>
      <Layout.Horizontal spacing="xsmall">
        <Icon name="repository" size={12}></Icon>
        <Text
          font={{ size: 'small', weight: 'light' }}
          color={Color.GREY_450}
          title={gitDetails?.repoIdentifier}
          lineClamp={1}
        >
          {(!loadingRepos && getRepoDetailsByIndentifier(gitDetails?.repoIdentifier, gitSyncRepos)?.name) || ''}
        </Text>
      </Layout.Horizontal>
      <Layout.Horizontal spacing="xsmall">
        <Icon size={12} name="git-new-branch"></Icon>
        <Text font={{ size: 'small', weight: 'light' }} color={Color.GREY_450} title={gitDetails?.branch} lineClamp={1}>
          {gitDetails?.branch || ''}
        </Text>
      </Layout.Horizontal>
    </Layout.Vertical>
  )
}
