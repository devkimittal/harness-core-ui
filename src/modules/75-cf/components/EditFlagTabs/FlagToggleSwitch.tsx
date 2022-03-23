/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { ReactElement } from 'react'
import { Text } from '@wings-software/uicore'
import { FontVariation } from '@harness/design-system'
import { Classes, Switch } from '@blueprintjs/core'
import cx from 'classnames'
import { usePermission } from '@rbac/hooks/usePermission'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import RBACTooltip from '@rbac/components/RBACTooltip/RBACTooltip'
import { FeatureFlagActivationStatus } from '@cf/utils/CFUtils'
import { useStrings } from 'framework/strings'
import type { FeatureState } from 'services/cf'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import { FeatureWarningTooltip } from '@common/components/FeatureWarning/FeatureWarningWithTooltip'
import usePlanEnforcement from '@cf/hooks/usePlanEnforcement'
import { useFeature } from '@common/hooks/useFeatures'
import useActiveEnvironment from '@cf/hooks/useActiveEnvironment'
import css from '../FlagActivation/FlagActivation.module.scss'

export interface FlagToggleSwitchProps {
  currentState: string
  currentEnvironmentState?: FeatureState
  handleToggle: () => void
  disabled?: boolean
}

const FlagToggleSwitch = (props: FlagToggleSwitchProps): ReactElement => {
  const { currentEnvironmentState, handleToggle, currentState, disabled } = props

  const { activeEnvironment } = useActiveEnvironment()
  const { getString } = useStrings()

  const isFlagSwitchChanged = currentEnvironmentState !== currentState
  const switchOff = (currentState || FeatureFlagActivationStatus.OFF) === FeatureFlagActivationStatus.OFF

  const [canToggle] = usePermission(
    {
      resource: {
        resourceType: ResourceType.ENVIRONMENT,
        resourceIdentifier: activeEnvironment
      },
      permissions: [PermissionIdentifier.TOGGLE_FF_FEATUREFLAG]
    },
    [activeEnvironment]
  )

  const { isPlanEnforcementEnabled, isFreePlan } = usePlanEnforcement()

  const { enabled } = useFeature({
    featureRequest: {
      featureName: FeatureIdentifier.MAUS
    }
  })

  const disabledByPlanEnforcement = isPlanEnforcementEnabled && !enabled && isFreePlan

  const getTooltip = (): ReactElement | undefined => {
    if (!canToggle) {
      return (
        <RBACTooltip permission={PermissionIdentifier.TOGGLE_FF_FEATUREFLAG} resourceType={ResourceType.ENVIRONMENT} />
      )
    } else if (disabledByPlanEnforcement) {
      return <FeatureWarningTooltip featureName={FeatureIdentifier.MAUS} />
    }

    return undefined
  }

  return (
    <>
      <Text tooltip={getTooltip()}>
        <Switch
          labelElement={
            <Text inline font={{ variation: FontVariation.FORM_INPUT_TEXT }}>
              {isFlagSwitchChanged
                ? getString(switchOff ? 'cf.featureFlags.flagWillTurnOff' : 'cf.featureFlags.flagWillTurnOn')
                : getString(switchOff ? 'cf.featureFlags.flagOff' : 'cf.featureFlags.flagOn')}
            </Text>
          }
          data-testid="flag-status-switch"
          onChange={handleToggle}
          alignIndicator="left"
          className={cx(Classes.LARGE, css.switch)}
          checked={currentState === FeatureFlagActivationStatus.ON}
          disabled={disabledByPlanEnforcement || !canToggle || disabled}
        />
      </Text>
    </>
  )
}

export default FlagToggleSwitch
