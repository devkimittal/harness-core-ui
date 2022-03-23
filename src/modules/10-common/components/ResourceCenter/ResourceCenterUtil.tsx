/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import moment from 'moment'
import { Button, ButtonVariation, Icon, IconName, Layout, Text } from '@wings-software/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { PopoverInteractionKind, Classes, Position } from '@blueprintjs/core'
import cx from 'classnames'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { useCommunity } from 'framework/LicenseStore/useCommunity'
import { useStrings } from 'framework/strings'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import Feedback from './Feedback'
import css from './ResourceCenter.module.scss'

export const getButton = (
  buttonText: string,
  buttonIcon: IconName,
  link: string,
  iconClassName?: string
): JSX.Element => {
  return (
    <a href={link} rel="noreferrer" target="_blank">
      <Layout.Vertical
        flex={{ align: 'center-center' }}
        spacing="small"
        padding={'small'}
        className={cx(css.bottombutton)}
      >
        <Icon name={buttonIcon} size={24} color={Color.WHITE} className={iconClassName} padding={'small'} />
        <Text
          font={{ variation: FontVariation.BODY2 }}
          padding={{ bottom: 'xsmall' }}
          color={Color.PRIMARY_3}
          className={css.txtAlignCenter}
        >
          {buttonText}
        </Text>
      </Layout.Vertical>
    </a>
  )
}

export const menuItems = ({
  title,
  description,
  onClick
}: {
  title: string
  description: string
  onClick?: (e: React.MouseEvent<Element, MouseEvent>) => void
}): JSX.Element => {
  return (
    <>
      <Layout.Vertical>
        <Text font={{ variation: FontVariation.H4 }} padding={{ bottom: 'xsmall' }} color={Color.PRIMARY_3}>
          {title}
        </Text>
        <Text font={{ variation: FontVariation.BODY2 }} padding={{ bottom: 'xsmall' }} color={Color.WHITE}>
          {description}
        </Text>
      </Layout.Vertical>
      <Layout.Horizontal flex={{ alignItems: 'center' }} spacing={'medium'}>
        <Button
          icon="chevron-right"
          variation={ButtonVariation.ICON}
          iconProps={{ color: Color.PRIMARY_4 }}
          onClick={onClick}
        />
      </Layout.Horizontal>
    </>
  )
}

export const CommunitySubmitTicket = (): React.ReactElement => {
  const { getString } = useStrings()

  const tooltip = (
    <Layout.Vertical className={css.communityTooltip} spacing={'medium'} padding={'medium'}>
      <Text
        icon="flash"
        color={Color.ORANGE_800}
        font={{ variation: FontVariation.FORM_MESSAGE_WARNING, weight: 'bold' }}
        iconProps={{ color: Color.ORANGE_800, size: 25 }}
        padding={{ bottom: 'xsmall' }}
      >
        {getString('common.levelUp')}
      </Text>
      <Text color={Color.WHITE}>{getString('common.resourceCenter.communityLevelUp')}</Text>
      <Button
        variation={ButtonVariation.PRIMARY}
        width={'fit-content'}
        onClick={e => {
          e.preventDefault()
          e.stopPropagation()
          window.open('https://harness.io/pricing/?module=cd', '_blank')
        }}
      >
        {getString('common.explorePlans')}
      </Button>
    </Layout.Vertical>
  )

  return (
    <Layout.Horizontal padding={'xlarge'} className={css.middleregion} flex={{ justifyContent: 'space-between' }}>
      <Layout.Vertical>
        <Text
          font={{ variation: FontVariation.H4 }}
          padding={{ bottom: 'xsmall' }}
          color={Color.GREY_300}
          icon="flash"
          iconProps={{ padding: { right: 'medium' }, size: 25 }}
        >
          {getString('common.resourceCenter.ticketmenu.submit')}
        </Text>
        <Text font={{ variation: FontVariation.BODY2 }} padding={{ bottom: 'xsmall' }} color={Color.GREY_300}>
          {getString('common.resourceCenter.ticketmenu.submitDesc')}
        </Text>
      </Layout.Vertical>
      <Button
        icon="chevron-right"
        variation={ButtonVariation.ICON}
        disabled
        iconProps={{ color: Color.PRIMARY_4 }}
        tooltip={tooltip}
        tooltipProps={{
          position: Position.RIGHT,
          className: Classes.DARK,
          hoverCloseDelay: 50,
          interactionKind: PopoverInteractionKind.HOVER,
          popoverClassName: css.communityPopover
        }}
      />
    </Layout.Horizontal>
  )
}
export const MenuItems = ({ closeResourceCenter }: { closeResourceCenter: () => void }): React.ReactElement => {
  const { getString } = useStrings()
  const isCommunity = useCommunity()
  const { SHOW_NG_REFINER_FEEDBACK } = useFeatureFlags()
  const timestamp = moment.now()
  const { currentUserInfo } = useAppStore()
  const openZendeskSupport = (e: React.MouseEvent<Element, MouseEvent>): void => {
    const url =
      '/sso.html?action=login&brand_id=114095000394&locale_id=1&return_to=https%3A%2F%2Fsupport.harness.io%2Fhc%2Fen-us%2Frequests&src=zendesk&timestamp=' +
      timestamp
    e.stopPropagation()
    e.preventDefault()
    window.open(url)
  }
  const openFileATicket = (e: React.MouseEvent<Element, MouseEvent>): void => {
    e.stopPropagation()
    e.preventDefault()
    closeResourceCenter()
  }

  return isCommunity ? (
    <CommunitySubmitTicket />
  ) : (
    <Layout.Vertical padding={'xlarge'} className={css.middleregion}>
      {SHOW_NG_REFINER_FEEDBACK && <Feedback label={getString('common.resourceCenter.feedback.submit')} />}
      <Layout.Horizontal
        padding={SHOW_NG_REFINER_FEEDBACK ? { top: 'medium', bottom: 'medium' } : { bottom: 'medium' }}
        flex={{ justifyContent: 'space-between' }}
        className={css.bottomBorder}
      >
        {menuItems({
          title: getString('common.resourceCenter.ticketmenu.submit'),
          description: getString('common.resourceCenter.ticketmenu.submitDesc'),
          onClick: e => {
            openFileATicket(e)
          }
        })}
      </Layout.Horizontal>
      <Layout.Horizontal padding={{ top: 'medium' }} flex={{ justifyContent: 'space-between' }}>
        {menuItems({
          title: getString('common.resourceCenter.ticketmenu.tickets'),
          description: getString('common.resourceCenter.ticketmenu.ticketsDesc'),
          onClick: e => {
            openZendeskSupport(e)
          }
        })}
      </Layout.Horizontal>
    </Layout.Vertical>
  )
}
