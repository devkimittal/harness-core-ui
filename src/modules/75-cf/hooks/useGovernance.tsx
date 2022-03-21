/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { useParams } from 'react-router-dom'
import React, { useMemo, useState } from 'react'
import { useModalHook } from '@harness/use-modal'
import { EvaluationModal } from '@governance/EvaluationModal'
import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { FeatureFlag } from '@common/featureFlags'
import { useStrings } from 'framework/strings'

export interface UseGovernance {
  isGovernanceEnabled: boolean
  governanceError: any
  handleError: (error: any) => void
}

export const useGovernance = (): UseGovernance => {
  const { getString } = useStrings()

  const OPA_FF_GOVERNANCE = useFeatureFlag(FeatureFlag.OPA_FF_GOVERNANCE)

  const isGovernanceEnabled = useMemo<boolean>(() => !!OPA_FF_GOVERNANCE, [OPA_FF_GOVERNANCE])

  const { accountId: accountIdentifier } = useParams<ProjectPathProps & ModulePathParams>()

  const [governanceError, setGovernanceError] = useState<any>()

  const handleError = (error: any): void => {
    setGovernanceError(error.details?.governanceMetadata)
    showErrorModal()
  }

  const [showErrorModal] = useModalHook(
    () => (
      <EvaluationModal
        accountId={accountIdentifier}
        key={governanceError.id}
        module={'cf'}
        metadata={governanceError}
        headingErrorMessage={getString('cf.policyEvaluations.failedToSave')}
      />
    ),
    [governanceError]
  )

  return {
    isGovernanceEnabled,
    governanceError,
    handleError
  }
}
