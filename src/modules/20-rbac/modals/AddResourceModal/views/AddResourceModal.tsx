/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Button, ButtonVariation, Container, ExpandingSearchInput, Layout, Text } from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import { useParams } from 'react-router-dom'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import RbacFactory from '@rbac/factories/RbacFactory'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { Page } from '@common/exports'
import css from './AddResourceModal.module.scss'

interface RoleModalData {
  resource: ResourceType
  selectedData: string[]
  onSuccess: (resources: string[]) => void
  onClose: () => void
}

const AddResourceModal: React.FC<RoleModalData> = ({ resource, onSuccess, onClose, selectedData }) => {
  const resourceHandler = RbacFactory.getResourceTypeHandler(resource)
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const { getString } = useStrings()
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [selectedItems, setSelectedItems] = useState<string[]>(selectedData)

  if (!resourceHandler) return <Page.Error />
  const label = resource === ResourceType['DASHBOARDS'] ? resourceHandler.labelOverride : resourceHandler.label

  return (
    <Layout.Vertical padding="xxxlarge">
      <Layout.Vertical>
        <Text color={Color.BLACK} font="medium">
          {`${getString('add')} ${getString(resourceHandler.label)}`}
        </Text>
        <Layout.Horizontal padding={{ top: 'large' }} flex>
          <ExpandingSearchInput
            alwaysExpanded
            onChange={text => {
              setSearchTerm(text.trim())
            }}
          />
          <Text color={Color.PRIMARY_7}>
            {getString('rbac.addResourceModal.selectedText', {
              name: getString(label || resourceHandler.label),
              number: selectedItems.length
            })}
          </Text>
        </Layout.Horizontal>
        <Container className={css.modal}>
          {resourceHandler?.addResourceModalBody?.({
            searchTerm,
            onSelectChange: items => {
              setSelectedItems(items)
            },
            selectedData: selectedItems,
            resourceScope: {
              accountIdentifier: accountId,
              orgIdentifier,
              projectIdentifier
            }
          })}
        </Container>
        <Layout.Horizontal spacing="small">
          <Button
            variation={ButtonVariation.PRIMARY}
            text={`${getString('add')} ${selectedItems.length} ${
              resource === ResourceType['DASHBOARDS']
                ? getString(resourceHandler.labelOverride || 'dashboards.homePage.folders')
                : getString(resourceHandler.label)
            }`}
            onClick={() => onSuccess(selectedItems)}
          />
          <Button text={getString('cancel')} onClick={onClose} />
        </Layout.Horizontal>
      </Layout.Vertical>
    </Layout.Vertical>
  )
}

export default AddResourceModal
