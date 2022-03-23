/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Avatar, Container, Icon, Layout, Text } from '@harness/uicore'
import { noop, defaultTo } from 'lodash-es'
import { FontVariation, Color } from '@harness/design-system'
import cx from 'classnames'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { useGitSyncStore } from 'framework/GitRepoStore/GitSyncStoreContext'
import paths from '@common/RouteDefinitions'
import { useStrings } from 'framework/strings/String'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import type { UserInfo } from 'services/cd-ng'
import css from './SCMCheck.module.scss'

export interface SCMCheckProps {
  profileLinkClickHandler?: () => void // If used inside modal, this can be use to close modal
  title?: string
  className?: string
  validateSCM?: (hasValidSCM: boolean) => void // Can be used to disable the commit
}

const SCMCheck: React.FC<SCMCheckProps> = props => {
  const { currentUserInfo: currentLoggedInUser } = useAppStore()
  const { codeManagers, loadingCodeManagers } = useGitSyncStore()
  const { accountId } = useParams<AccountPathProps>()
  const [currentUserInfo, setCurrentUserInfo] = React.useState('')
  const { getString } = useStrings()
  const { validateSCM = noop, profileLinkClickHandler = noop, className = '', title } = props

  const getUserDisplayName = (userInfo: UserInfo): string => {
    return defaultTo(userInfo?.name, userInfo?.email) || getString('na')
  }

  useEffect(() => {
    const userSpec = codeManagers?.[0]?.authentication?.spec?.spec
    const user = userSpec?.username || userSpec?.usernameRef

    setCurrentUserInfo(user)
    validateSCM(!loadingCodeManagers && user)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codeManagers])

  return (
    <Container className={cx(className)} margin={{ bottom: 'large' }}>
      {currentUserInfo ? (
        <Layout.Horizontal className={css.userInfo} flex={{ alignItems: 'center' }}>
          <Avatar
            size="small"
            name={getUserDisplayName(currentLoggedInUser)}
            backgroundColor={Color.PRIMARY_7}
            hoverCard={false}
          />
          <Text color={Color.GREY_700}>
            {getString('common.git.currentUserLabel', { user: getUserDisplayName(currentLoggedInUser) })}
          </Text>
        </Layout.Horizontal>
      ) : (
        <></>
      )}
      {title ? (
        <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'large', top: 'small' }}>
          {title}
        </Text>
      ) : (
        <></>
      )}

      {!loadingCodeManagers && !currentUserInfo && (
        <Layout.Horizontal className={css.addUserContainer} spacing="small">
          <Icon name="warning-sign" color={Color.ORANGE_700}></Icon>
          <div>
            <Text font={{ variation: FontVariation.SMALL }} color={Color.BLACK}>
              {getString('common.git.noUserLabel')}
            </Text>
            <Link to={paths.toUserProfile({ accountId })} target="_blank" onClick={profileLinkClickHandler}>
              <Text inline font={{ variation: FontVariation.SMALL_BOLD }} color={Color.PRIMARY_7}>
                {getString('common.git.addUserCredentialLabel')}
              </Text>
            </Link>
          </div>
        </Layout.Horizontal>
      )}
    </Container>
  )
}

export default SCMCheck
