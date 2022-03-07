/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Button, ButtonSize, ButtonVariation, Color, Container, Icon, Layout, Text } from '@wings-software/uicore'
import templateIllustration from '@templates-library/pages/TemplatesPage/images/templates-illustration.svg'
import { useStrings } from 'framework/strings'
import { NewTemplatePopover } from '../NewTemplatePopover/NewTemplatePopover'

export interface NoResultsViewProps {
  hasSearchParam?: boolean
  onReset?: () => void
  text: string
  minimal?: boolean
}

export default function NoResultsView({
  hasSearchParam = false,
  onReset,
  text,
  minimal = false
}: NoResultsViewProps): React.ReactElement {
  const { getString } = useStrings()
  return (
    <Container height={'100%'}>
      {hasSearchParam ? (
        <Layout.Vertical height={'100%'} spacing={'xlarge'} flex={{ align: 'center-center' }}>
          <Icon color={Color.GREY_400} name="template-library" size={50} />
          <Text font={{ weight: 'bold', size: 'medium' }} color={Color.GREY_400}>
            {getString('common.filters.noMatchingFilterData')}
          </Text>
          <Button
            variation={ButtonVariation.LINK}
            size={ButtonSize.LARGE}
            onClick={onReset}
            text={getString('common.filters.clearFilters')}
          />
        </Layout.Vertical>
      ) : (
        <Layout.Vertical spacing={minimal ? 'large' : 'xxxlarge'} height={'100%'} flex={{ align: 'center-center' }}>
          <img src={templateIllustration} width={minimal ? '117px' : '220px'} />
          <Text font={{ size: minimal ? 'small' : 'normal' }} color={Color.GREY_700}>
            {text}
          </Text>
          {!minimal && <NewTemplatePopover />}
        </Layout.Vertical>
      )}
    </Container>
  )
}
