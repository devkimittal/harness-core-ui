/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC } from 'react'
import type { SidebarContext } from '@common/navigation/SidebarProvider'
import routes from '@common/RouteDefinitions'
import { RouteWithLayout } from '@common/router'
import { accountPathProps } from '@common/utils/routeUtils'
import STOHomePage from '@sto-steps/pages/STOHomePage'
import '@pipeline/components/CommonPipelineStages/PipelineStage'
import '@sto-steps/components/PipelineStages/SecurityStage'
import STOSideNav from '@sto-steps/components/STOSideNav/STOSideNav'

const STOSideNavProps: SidebarContext = {
  navComponent: STOSideNav,
  title: 'Security Tests',
  icon: 'sto-color-filled'
}

const STORoutes: FC = () => {
  return (
    <>
      <RouteWithLayout
        // licenseRedirectData={licenseRedirectData}
        sidebarProps={STOSideNavProps}
        path={[routes.toSTOHome({ ...accountPathProps })]}
        exact
      >
        <STOHomePage />
      </RouteWithLayout>
    </>
  )
}

export default STORoutes
