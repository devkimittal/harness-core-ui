/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { ReactElement, useState } from 'react'
import { Layout, PageError } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import { GetFeatureFlagQueryParams, useGetFeatureFlag } from 'services/cf'
import { getErrorMessage } from '@cf/utils/CFUtils'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import { useStrings } from 'framework/strings'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import FlagActivation from '@cf/components/FlagActivation/FlagActivation'
import FlagActivationDetails from '@cf/components/FlagActivation/FlagActivationDetails'
import useActiveEnvironment from '@cf/hooks/useActiveEnvironment'
import GitSyncActions from '@cf/components/GitSyncActions/GitSyncActions'
import { useGitSync } from '@cf/hooks/useGitSync'
import css from './FeatureFlagsDetailPage.module.scss'

const FeatureFlagsDetailPage: React.FC = () => {
  const { getString } = useStrings()
  const [skipLoading, setSkipLoading] = useState(false)
  const {
    orgIdentifier,
    projectIdentifier,
    featureFlagIdentifier,
    accountId: accountIdentifier
  } = useParams<Record<string, string>>()
  const { activeEnvironment: environmentIdentifier } = useActiveEnvironment()

  useDocumentTitle(getString('featureFlagsText'))

  const queryParams = {
    projectIdentifier,
    environmentIdentifier,
    accountIdentifier,
    orgIdentifier
  } as GetFeatureFlagQueryParams

  const {
    data: featureFlag,
    loading,
    error,
    refetch
  } = useGetFeatureFlag({
    identifier: featureFlagIdentifier as string,
    queryParams
  })

  const gitSync = useGitSync()

  if (loading && !skipLoading) {
    return <ContainerSpinner className={css.spinner} />
  }

  if (error) {
    return (
      <PageError
        message={getErrorMessage(error)}
        onClick={() => {
          refetch()
        }}
      />
    )
  }

  const refetchFlag = async (): Promise<void> => {
    setSkipLoading(true)
    await refetch({
      queryParams: {
        ...queryParams,
        environmentIdentifier
      }
    }).finally(() => {
      setSkipLoading(false)
    })
  }

  const GitSyncActionsComponent = (): ReactElement => (
    <GitSyncActions
      isLoading={gitSync.gitSyncLoading}
      branch={gitSync.gitRepoDetails?.branch || ''}
      repository={gitSync.gitRepoDetails?.repoIdentifier || ''}
      isAutoCommitEnabled={gitSync.isAutoCommitEnabled}
      isGitSyncPaused={gitSync.isGitSyncPaused}
      handleToggleAutoCommit={gitSync.handleAutoCommit}
      handleGitPause={gitSync.handleGitPause}
    />
  )

  return (
    <div className={css.pageLayout}>
      <section>
        <Layout.Vertical className={css.flagActivationDetailsLayout}>
          {featureFlag && (
            <FlagActivationDetails
              featureFlag={featureFlag}
              refetchFlag={refetch}
              gitSyncActionsComponent={gitSync?.isGitSyncActionsEnabled ? <GitSyncActionsComponent /> : undefined}
              gitSync={gitSync}
            />
          )}
        </Layout.Vertical>
      </section>
      <section>
        {featureFlag && (
          <FlagActivation
            refetchFlag={refetchFlag}
            refetchFlagLoading={loading}
            gitSync={gitSync}
            projectIdentifier={projectIdentifier as string}
            flagData={featureFlag}
          />
        )}
      </section>
    </div>
  )
}

export default FeatureFlagsDetailPage
