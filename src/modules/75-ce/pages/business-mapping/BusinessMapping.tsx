/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Button, Layout, PageBody, PageHeader } from '@harness/uicore'
import { Drawer, Position } from '@blueprintjs/core'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import { useStrings } from 'framework/strings'
import BusinessMappingBuilder from '@ce/components/BusinessMappingBuilder/BusinessMappingBuilder'

const BusinessMapping: () => React.ReactElement = () => {
  const { getString } = useStrings()
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false)

  return (
    <>
      <PageHeader breadcrumbs={<NGBreadcrumbs />} title={getString('ce.businessMapping.sideNavText')} />
      <PageBody>
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
            text={'New Business Mapping'}
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
          onClose={() => {
            setDrawerOpen(false)
          }}
        >
          <BusinessMappingBuilder />
        </Drawer>
      </PageBody>
    </>
  )
}

export default BusinessMapping
