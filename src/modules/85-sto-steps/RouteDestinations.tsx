/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Redirect, useParams } from 'react-router-dom'
import type { SidebarContext } from '@common/navigation/SidebarProvider'
import routes from '@common/RouteDefinitions'
import { RouteWithLayout } from '@common/router'
import { accountPathProps, projectPathProps } from '@common/utils/routeUtils'
import OverviewPage from '@sto-steps/pages/OverviewPage/OverviewPage'
import STOSideNav from '@sto-steps/components/STOSideNav/STOSideNav'
import '@sto-steps/components/PipelineStages/SecurityStage'

const STOSideNavProps: SidebarContext = {
  navComponent: STOSideNav,
  title: 'Security Tests',
  icon: 'sto-color-filled'
}

const RedirectToOverviewPage = (): React.ReactElement => {
  const { accountId } = useParams<{ accountId: string }>()

  return <Redirect to={routes.toSTOOverview({ accountId })} />
}

export default (
  <>
    <RouteWithLayout
      // licenseRedirectData={licenseRedirectData}
      path={routes.toSTO({ ...accountPathProps })}
      exact
    >
      <RedirectToOverviewPage />
    </RouteWithLayout>

    <RouteWithLayout
      // licenseRedirectData={licenseRedirectData}
      sidebarProps={STOSideNavProps}
      path={routes.toSTOOverview({ ...accountPathProps, ...projectPathProps })}
    >
      <OverviewPage />
    </RouteWithLayout>
  </>
)
