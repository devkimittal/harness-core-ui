/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Container, FormInput, Layout, RadioButton } from '@harness/uicore'
import React from 'react'
import css from './ManageUnallocatedCost.module.scss'

const ManageUnallocatedCost: () => React.ReactElement = () => {
  return (
    <Container>
      <Layout.Horizontal spacing="small" className={css.hContainer}>
        <RadioButton label={'Show Unallocated Values as'} value="default" />
        <FormInput.Text name="defaultVal" placeholder={'Others'} className={css.defaultValInputBox} disabled />
      </Layout.Horizontal>
      <RadioButton label={'Ignore Unallocated Values (Coming Soon)'} value={'-'} disabled />
      <RadioButton label={'Share Default Costs among Cost Buckets (Coming Soon)'} value={'-'} disabled />
    </Container>
  )
}

export default ManageUnallocatedCost
