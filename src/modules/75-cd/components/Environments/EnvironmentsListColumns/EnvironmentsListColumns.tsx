/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Layout, TagsPopover, Text, Container } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { defaultTo, isEmpty } from 'lodash-es'
import { useConfirmAction } from '@common/hooks/useConfirmAction'
import { useStrings } from 'framework/strings'
import type { EnvironmentResponseDTO } from 'services/cd-ng'
import RbacOptionsMenuButton from '@rbac/components/RbacOptionsMenuButton/RbacOptionsMenuButton'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { EnvironmentType } from '@common/constants/EnvironmentType'
import { withTableData } from '@cd/utils/tableUtils'
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

type EnvData = { environment: EnvironmentResponseDTO }
const withEnvironment = withTableData<EnvironmentResponseDTO, EnvData>(({ row }) => ({ environment: row.original }))
const withActions = withTableData<
  EnvironmentResponseDTO,
  EnvData & { actions: { [P in 'onEdit' | 'onDelete']?: (id: string) => void } }
>(({ row, column }) => ({
  environment: row.original,
  actions: (column as any).actions as { [P in 'onEdit' | 'onDelete']?: (id: string) => void }
}))

export const EnvironmentTypes = withEnvironment(({ environment }) => {
  const { getString } = useStrings()
  return <Text>{getString(environment.type === EnvironmentType.PRODUCTION ? 'production' : 'preProduction')}</Text>
})

export const EnvironmentMenu = withActions(({ environment, actions }) => {
  const { getString } = useStrings()
  const identifier = environment.identifier as string
  const deleteEnvironment = useConfirmAction({
    title: getString('cd.environmentDelete'),
    message: (
      <span
        dangerouslySetInnerHTML={{ __html: getString('cd.environments.delete.message', { name: environment.name }) }}
      />
    ),
    action: () => {
      actions.onDelete?.(identifier)
    }
  })

  return (
    <Layout.Horizontal style={{ alignItems: 'center', justifyContent: 'flex-end' }}>
      <Container
        onClick={(e: React.MouseEvent) => {
          e.stopPropagation()
        }}
      >
        <RbacOptionsMenuButton
          items={[
            {
              icon: 'edit',
              text: getString('edit'),
              onClick: () => actions.onEdit?.(identifier),
              permission: {
                resource: { resourceType: ResourceType.ENVIRONMENT },
                permission: PermissionIdentifier.EDIT_ENVIRONMENT
              }
            },
            {
              icon: 'trash',
              text: getString('delete'),
              onClick: deleteEnvironment,
              permission: {
                resource: { resourceType: ResourceType.ENVIRONMENT },
                permission: PermissionIdentifier.DELETE_ENVIRONMENT
              }
            }
          ]}
        />
      </Container>
    </Layout.Horizontal>
  )
})

export { EnvironmentName, EnvironmentDescription }
