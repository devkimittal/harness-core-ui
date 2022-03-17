/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, FormInput, Layout, RadioButton } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import css from './ManageUnallocatedCost.module.scss'

const ManageUnallocatedCost: () => React.ReactElement = () => {
  const { getString } = useStrings()
  return (
    <Container>
      <Layout.Horizontal spacing="small" className={css.hContainer}>
        <RadioButton
          label={getString('ce.businessMapping.manageUnallocatedCost.defaultUnallocatedCostLabel')}
          value="default"
        />
        <FormInput.Text
          name="defaultVal"
          placeholder={getString('ce.businessMapping.manageUnallocatedCost.otherPlaceholder')}
          className={css.defaultValInputBox}
          disabled
        />
      </Layout.Horizontal>
      <RadioButton label={getString('ce.businessMapping.manageUnallocatedCost.ignoreCostLabel')} value={'-'} disabled />
      <RadioButton label={getString('ce.businessMapping.manageUnallocatedCost.shareCosts')} value={'-'} disabled />
    </Container>
  )
}

export default ManageUnallocatedCost
