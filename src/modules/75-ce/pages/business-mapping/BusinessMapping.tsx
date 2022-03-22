/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Button, Layout, PageBody, PageHeader } from '@harness/uicore'
import { useParams } from 'react-router-dom'
import { Drawer, Position } from '@blueprintjs/core'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import { useStrings } from 'framework/strings'
import { useGetBusinessMappingList } from 'services/ce'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import BusinessMappingBuilder from '@ce/components/BusinessMappingBuilder/BusinessMappingBuilder'

const BusinessMapping: () => React.ReactElement = () => {
  const { accountId } = useParams<AccountPathProps>()
  const { getString } = useStrings()
  const { loading } = useGetBusinessMappingList({ queryParams: { accountIdentifier: accountId } })
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false)

  return (
    <>
      <PageHeader breadcrumbs={<NGBreadcrumbs />} title={getString('ce.businessMapping.sideNavText')} />
      <PageBody loading={loading}>
        <Layout.Horizontal
          padding={{
            left: 'large',
            right: 'large',
            top: 'medium',
            bottom: 'medium'
          }}
          background="white"
          border={{
            bottom: true
          }}
        >
          <Button
            icon="plus"
            text={getString('ce.businessMapping.newButton')}
            intent="primary"
            onClick={() => {
              setDrawerOpen(true)
            }}
          />
        </Layout.Horizontal>

        <Drawer
          autoFocus
          enforceFocus
          hasBackdrop
          usePortal
          canOutsideClickClose
          canEscapeKeyClose
          position={Position.RIGHT}
          isOpen={drawerOpen}
          onClose={
            /* istanbul ignore next */ () => {
              setDrawerOpen(false)
            }
          }
        >
          <BusinessMappingBuilder />
        </Drawer>
      </PageBody>
    </>
  )
}

export default BusinessMapping
