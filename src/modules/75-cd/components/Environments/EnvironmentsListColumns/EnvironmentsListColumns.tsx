/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Layout, TagsPopover, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { defaultTo, isEmpty } from 'lodash-es'

import css from './EnvironmentsListColumns.module.scss'

interface EnvironmentRow {
  row: { original: any }
}

export enum DeploymentStatus {
  SUCCESS = 'success',
  FAILED = 'failed'
}

const EnvironmentName = ({ row }: EnvironmentRow): React.ReactElement => {
  const environment = row.original

  return (
    <div className={css.name}>
      <Layout.Vertical>
        <Text color={Color.BLACK}>{environment?.name}</Text>

        <Layout.Horizontal flex>
          <Text
            margin={{ top: 'xsmall', right: 'medium' }}
            color={Color.GREY_500}
            style={{
              fontSize: '12px',
              lineHeight: '24px',
              wordBreak: 'break-word'
            }}
          >
            Id: {environment?.identifier}
          </Text>

          {!isEmpty(environment?.tags) && (
            <div className={css.tags}>
              <TagsPopover
                className={css.tagsPopover}
                iconProps={{ size: 14, color: Color.GREY_600 }}
                tags={defaultTo(environment?.tags, {})}
              />
            </div>
          )}
        </Layout.Horizontal>
      </Layout.Vertical>
    </div>
  )
}

const EnvironmentDescription = ({ row }: EnvironmentRow): React.ReactElement => {
  const environment = row.original
  return (
    <Layout.Vertical className={css.sourceDestinationWrapper}>
      <div className={css.destination}>
        <Text lineClamp={1} className={css.content}>
          {environment?.description}
        </Text>
      </div>
    </Layout.Vertical>
  )
}

export { EnvironmentName, EnvironmentDescription }
