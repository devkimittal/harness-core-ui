/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, Layout, Text, IconName, Icon } from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import { TagsViewer } from '@common/components/TagsViewer/TagsViewer'
import { IdentifierText } from '@cf/components/IdentifierText/IdentifierText'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'

const HEADER_HEIGHT = 145
const HEADER_HEIGHT_NO_TAGS = 120

interface DetailPageTemplateBreadcrumbLink {
  title: string
  url: string
}

export interface DetailPageTemplateProps {
  breadcrumbs: DetailPageTemplateBreadcrumbLink[]
  title: React.ReactNode
  titleIcon?: IconName | React.ReactNode
  subTitle?: string
  tags?: string[] | null | undefined
  identifier?: string

  /** Optional extra components to be added into header (context menu, edit button, etc...)  */
  /** Note: Use absolute position to style it */
  headerExtras?: React.ReactNode
}

export const DetailPageTemplate: React.FC<DetailPageTemplateProps> = ({
  breadcrumbs,
  title,
  titleIcon,
  subTitle,
  tags,
  identifier,
  headerExtras,
  children
}) => {
  const headerHeight = tags?.length ? HEADER_HEIGHT : HEADER_HEIGHT_NO_TAGS

  return (
    <>
      <Container
        height={headerHeight}
        padding={{ top: 'large', right: 'xlarge', bottom: 'large', left: 'xlarge' }}
        style={{
          background: 'rgba(219, 241, 255, .46)',
          position: 'relative',
          borderBottom: '.5px solid rgb(227 224 224 / 50%)'
        }}
      >
        <Layout.Vertical spacing="medium">
          <NGBreadcrumbs
            customPathParams={{ module: 'cf' }}
            links={breadcrumbs.map(({ title: label, url }) => ({ label, url }))}
          />

          <Layout.Horizontal spacing="small" style={{ marginLeft: '-5px' }}>
            <Container style={{ borderRadius: '50%', overflow: 'hidden' }}>
              {typeof titleIcon === 'string' && <Icon name={titleIcon as IconName} size={40} />}
              {typeof titleIcon !== 'string' && <>{titleIcon}</>}
            </Container>
            <Container>
              <Layout.Horizontal spacing="medium">
                <Text style={{ fontSize: '20px', color: 'var(--black)' }}>{title}</Text>
                {identifier && <IdentifierText identifier={identifier} allowCopy style={{ marginBottom: 0 }} />}
              </Layout.Horizontal>
              {subTitle && (
                <Text color={Color.GREY_400} padding={{ top: 'xsmall' }}>
                  {subTitle}
                </Text>
              )}
            </Container>
          </Layout.Horizontal>

          {tags && (
            <Container>
              <TagsViewer tags={tags} style={{ background: '#CDF4FE' }} />
            </Container>
          )}
        </Layout.Vertical>
        {headerExtras}
      </Container>
      <Container style={{ height: `calc(100% - ${headerHeight}px)`, overflow: 'auto', background: '#e4ebf433' }}>
        {children}
      </Container>
    </>
  )
}
