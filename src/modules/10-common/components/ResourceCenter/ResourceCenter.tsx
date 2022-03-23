/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Button, ButtonVariation, Icon, Layout, Text } from '@wings-software/uicore'
import { Color, FontVariation } from '@harness/design-system'

import { Drawer, Position } from '@blueprintjs/core'
import cx from 'classnames'
import { useStrings } from 'framework/strings'
import { getButton, MenuItems } from './ResourceCenterUtil'
import resourceImage from './images/resource-center.png'
import css from './ResourceCenter.module.scss'

export const ResourceCenter = (): React.ReactElement => {
  const { getString } = useStrings()

  const [show, setShow] = useState<boolean>(false)

  if (!show) {
    return (
      <Icon
        name={'nav-help'}
        onClick={e => {
          e.stopPropagation()
          e.preventDefault()
          setShow(true)
        }}
        size={30}
        data-testid="question"
        className={css.helpCenterIcon}
      />
    )
  }

  return (
    <Drawer
      autoFocus
      enforceFocus
      hasBackdrop
      usePortal
      canOutsideClickClose
      canEscapeKeyClose
      position={Position.LEFT}
      isOpen={show}
      onClose={() => {
        setShow(false)
      }}
      className={css.resourceCenter}
    >
      <Layout.Vertical>
        <Layout.Vertical padding={'xlarge'} flex={{ alignItems: 'baseline' }}>
          <Layout.Horizontal
            padding={{ bottom: 'medium' }}
            className={css.title}
            flex={{ justifyContent: 'space-between', alignItems: 'baseline' }}
          >
            <Text color={Color.WHITE}>{getString('common.resourceCenter.title')}</Text>
            <Button
              icon={'cross'}
              variation={ButtonVariation.ICON}
              onClick={e => {
                e.stopPropagation()
                e.preventDefault()
                setShow(false)
              }}
            />
          </Layout.Horizontal>
          <img src={resourceImage} height={106} alt={'Resource center image'} />
        </Layout.Vertical>
        <MenuItems />
        <Layout.Vertical padding={'xlarge'}>
          <Text font={{ variation: FontVariation.BODY2 }} padding={{ bottom: 'medium' }} color={Color.WHITE}>
            {getString('common.resourceCenter.bottomlayout.desc')}
          </Text>
          <Layout.Horizontal flex={{ justifyContent: 'space-around' }}>
            {getButton(getString('search'), 'thinner-search', 'https://harness.io/search/', css.iconSize)}
            {getButton(
              getString('common.resourceCenter.bottomlayout.university'),
              'university',
              'https://university.harness.io/',
              css.university
            )}
            {getButton(
              getString('common.community'),
              'resource-center-community-icon',
              'https://community.harness.io/'
            )}
            {getButton(
              getString('common.resourceCenter.communitySlack'),
              'service-slack',
              'https://join.slack.com/t/harnesscommunity/shared_invite/zt-y4hdqh7p-RVuEQyIl5Hcx4Ck8VCvzBw',
              cx(css.iconSize, css.marginTop)
            )}
          </Layout.Horizontal>
          <Layout.Horizontal flex={{ justifyContent: 'space-around' }} padding={{ top: 'small' }}>
            {getButton(
              getString('common.resourceCenter.bottomlayout.docs'),
              'resource-center-docs-icon',
              'https://ngdocs.harness.io/'
            )}
            {getButton(
              getString('common.resourceCenter.bottomlayout.apiDocs'),
              'api-docs',
              'https://harness.io/docs/api/'
            )}
            {getButton(
              getString('common.resourceCenter.bottomlayout.changeLog'),
              'change-log',
              'https://changelog.harness.io/'
            )}
            {getButton(
              getString('common.resourceCenter.bottomlayout.sitestatus'),
              'right-bar-notification',
              'https://status.harness.io/'
            )}
          </Layout.Horizontal>
        </Layout.Vertical>
      </Layout.Vertical>
    </Drawer>
  )
}
