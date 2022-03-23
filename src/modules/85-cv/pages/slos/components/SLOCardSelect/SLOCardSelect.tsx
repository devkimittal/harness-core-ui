/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Text } from '@wings-software/uicore'
import { FontVariation } from '@harness/design-system'
import type { RiskCount } from 'services/cv'

interface SLOCardSelectProps extends RiskCount {
  displayColor: string
}

const SLOCardSelect: React.FC<SLOCardSelectProps> = ({ displayName, count, displayColor }) => {
  return (
    <>
      <Text font={{ variation: FontVariation.FORM_HELP }}>{displayName}</Text>
      <Text color={displayColor} font={{ variation: FontVariation.H2 }}>
        {count}
      </Text>
    </>
  )
}

export default SLOCardSelect
