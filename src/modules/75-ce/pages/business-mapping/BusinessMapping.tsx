/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { PageBody, PageHeader } from '@harness/uicore'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import { useStrings } from 'framework/strings'

const BusinessMapping: () => React.ReactElement = () => {
  const { getString } = useStrings()
  return (
    <>
      <PageHeader breadcrumbs={<NGBreadcrumbs />} title={getString('ce.businessMapping.sideNavText')} />
      <PageBody />
    </>
  )
}

export default BusinessMapping
