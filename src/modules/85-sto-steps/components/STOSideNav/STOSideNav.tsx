/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { ProjectSelector } from '@projects-orgs/components/ProjectSelector/ProjectSelector'
import React from 'react'
import { useParams } from 'react-router-dom'
import { Layout } from '@wings-software/uicore'
import { Tabs, Tab } from '@blueprintjs/core'
import routes from '@common/RouteDefinitions'
import type { PipelinePathProps } from '@common/interfaces/RouteInterfaces'
import { SidebarLink } from '@common/navigation/SideNav/SideNav'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { useStrings } from 'framework/strings'
import css from './STOSideNav.module.scss'

export default function STOSideNav(): React.ReactElement {
  const { getString } = useStrings()
  // Telemetry?

  return (
    <Layout.Vertical spacing="small">
      <Tabs id="navTab" selectedTabId={'account'} className={css.sideNavTabs}>
        <Tab id="account" title={getString('account')} panel={<Panel />} />
        <Tabs.Expander />
        <Tab id="project" title={getString('projectLabel')} panel={<Panel isProjectMode />} />
      </Tabs>
    </Layout.Vertical>
  )
}

interface PanelProps {
  isProjectMode?: boolean
}

const Panel: React.FC<PanelProps> = ({ isProjectMode }) => {
  const { accountId } = useParams<PipelinePathProps>()
  const { getString } = useStrings()
  const { updateAppStore } = useAppStore()
  // Telemetry?

  return (
    <Layout.Vertical spacing="small">
      {isProjectMode && (
        <ProjectSelector
          onSelect={data => {
            updateAppStore({ selectedProject: data })
          }}
        />
      )}

      <React.Fragment>
        <SidebarLink label={getString('overview')} to={routes.toSTOOverview({ accountId })} />
      </React.Fragment>
    </Layout.Vertical>
  )
}
