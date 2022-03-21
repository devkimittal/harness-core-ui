/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Layout } from '@wings-software/uicore'
import { Tabs, Tab } from '@blueprintjs/core'
import { useTelemetry } from '@common/hooks/useTelemetry'
import routes from '@common/RouteDefinitions'
import type { PipelinePathProps } from '@common/interfaces/RouteInterfaces'
import { SidebarLink } from '@common/navigation/SideNav/SideNav'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { useStrings } from 'framework/strings'
import css from './STOSideNav.module.scss'

export default function STOSideNav(): React.ReactElement {
  const { currentUserInfo } = useAppStore()
  const { getString } = useStrings()
  const { identifyUser } = useTelemetry()

  useEffect(() => {
    identifyUser(currentUserInfo.email)
  }, [])
  useTelemetry({ pageName: 'STOPage' })
  return (
    <Layout.Vertical spacing="small">
      <Tabs id="navTab" selectedTabId={'account'} className={css.sideNavTabs}>
        <Tab id="account" title={getString('account')} panel={<AccountPanel />} />
        <Tabs.Expander />
        <Tab id="project" title={getString('projectLabel')} panel={<ProjectPanel />} />
      </Tabs>
    </Layout.Vertical>
  )
}

const AccountPanel = () => {
  const { accountId } = useParams<PipelinePathProps>()
  const { getString } = useStrings()
  // const { trackEvent } = useTelemetry()

  return (
    <Layout.Vertical spacing="small">
      <React.Fragment>
        <SidebarLink label={getString('overview')} to={routes.toSTOOverview({ accountId })} />
      </React.Fragment>
    </Layout.Vertical>
  )
}

const ProjectPanel = () => {
  const { accountId } = useParams<PipelinePathProps>()
  const { getString } = useStrings()
  // const { trackEvent } = useTelemetry()

  return (
    <Layout.Vertical spacing="small">
      <React.Fragment>
        <SidebarLink label={getString('overview')} to={routes.toSTOOverview({ accountId })} />
      </React.Fragment>
    </Layout.Vertical>
  )
}
