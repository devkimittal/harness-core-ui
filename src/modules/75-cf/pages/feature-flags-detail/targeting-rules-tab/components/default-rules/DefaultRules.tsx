/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { ReactElement } from 'react'
import { FontVariation, FormInput, Heading, SelectOption } from '@harness/uicore'
import type { Variation } from 'services/cf'
import { CFVariationColors } from '@cf/constants'
import { useStrings } from 'framework/strings'
import StringWithTooltip from '@common/components/StringWithTooltip/StringWithTooltip'

export interface DefaultRulesProps {
  featureFlagVariations: Variation[]
  isLoading: boolean
}

const DefaultRules = (props: DefaultRulesProps): ReactElement => {
  const { featureFlagVariations, isLoading } = props

  const { getString } = useStrings()
  const variationItems = featureFlagVariations.map<SelectOption>((variation, index) => ({
    label: variation.name || variation.identifier,
    value: variation.identifier,
    icon: { name: 'full-circle', style: { color: CFVariationColors[index] } }
  }))

  return (
    <>
      <Heading level={3} font={{ variation: FontVariation.H6 }} margin={{ bottom: 'medium' }}>
        <StringWithTooltip stringId="cf.featureFlags.rules.whenFlagEnabled" tooltipId="ff_ffDefaultRules_heading" />
      </Heading>
      <Heading level={4} font={{ variation: FontVariation.BODY2 }} margin={{ bottom: 'small' }}>
        {getString('cf.featureFlags.rules.defaultRule')}
      </Heading>
      <FormInput.Select
        disabled={isLoading}
        style={{ marginBottom: '0' }}
        label={getString('cf.featureFlags.serve')}
        inline
        name="onVariation"
        items={variationItems}
      />
    </>
  )
}

export default DefaultRules
