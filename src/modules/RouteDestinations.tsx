import React from 'react'
import { Switch, Route } from 'react-router-dom'

// import RoutesTemp from 'nav/Routes1'

import delegatesRoutes from '@delegates/RouteDestinations'
import commonRoutes from '@common/RouteDestinations'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'

import { ModalProvider } from '@wings-software/uicore'

import useCreateUpdateSecretModal from '@secrets/modals/CreateSecretModal/useCreateUpdateSecretModal'
import rbacRoutes from '@rbac/RouteDestinations'

import AccessControlRoutes from 'accesscontrol/AccessControlRoutes'
import projectsOrgsRoutes from '@projects-orgs/RouteDestinations'
import connectorRoutes from '@connectors/RouteDestinations'
import userProfileRoutes from '@user-profile/RouteDestinations'
import '@pipeline/RouteDestinations'
import '@templates-library/RouteDestinations'
import CDRoutes from '@cd/RouteDestinations'
import CIRoutes from '@ci/RouteDestinations'
import CVRoutes from '@cv/RouteDestinations'
import CFRoutes from '@cf/RouteDestinations'
import CERoutes from '@ce/RouteDestinations'
import DASHBOARDRoutes from '@dashboards/RouteDestinations'
import AccountSideNav from '@common/components/AccountSideNav/AccountSideNav'
import type { SidebarContext } from '@common/navigation/SidebarProvider'

import NotFoundPage from '@common/pages/404/NotFoundPage'
import { AppStoreContext } from 'framework/AppStore/AppStoreContext'

import UseCreateSecretModalReturn from '@secrets/modals/CreateSecretModal/useCreateUpdateSecretModal'
export const AccountSideNavProps: SidebarContext = {
  navComponent: AccountSideNav,
  icon: 'nav-settings',
  title: 'Account Settings'
}

export default function RouteDestinations(): React.ReactElement {
  const { CDNG_ENABLED, CVNG_ENABLED, CING_ENABLED, CENG_ENABLED, CFNG_ENABLED } = useFeatureFlags()
  console.log('AccessControlRoutes', { AccessControlRoutes })
  return (
    <Switch>
      {...commonRoutes.props.children}
      {...rbacRoutes.props.children}
      {...delegatesRoutes.props.children}
      {...projectsOrgsRoutes.props.children}
      {...DASHBOARDRoutes.props.children}
      {...connectorRoutes.props.children}
      {...userProfileRoutes.props.children}

      {...CING_ENABLED ? CIRoutes.props.children : []}
      {...CDNG_ENABLED ? CDRoutes.props.children : []}
      {...CVNG_ENABLED ? CVRoutes.props.children : []}

      <Route path="/account/:accountId/settingsfd">
        {/* <RoutesTemp contextObj={AppStoreContext} /> */}
        <ModalProvider>
          {console.log('parent', React.version)}
          {AccessControlRoutes({
            params: {
              commonComponents: { secrets: UseCreateSecretModalReturn },
              parentContextObj: { parentContext: { appStoreContext: AppStoreContext } }
            }
          })}
        </ModalProvider>
      </Route>

      {CENG_ENABLED ? (
        <Route path="/account/:accountId/:module(ce)">
          <CERoutes />
        </Route>
      ) : null}
      {...CFNG_ENABLED ? CFRoutes.props.children : []}
      <Route path="*">
        <NotFoundPage />
      </Route>
    </Switch>
  )
}
