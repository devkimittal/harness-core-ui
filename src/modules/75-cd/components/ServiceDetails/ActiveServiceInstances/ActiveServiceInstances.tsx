/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Card, Layout, Text } from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import { ActiveServiceInstancesHeader } from '@cd/components/ServiceDetails/ActiveServiceInstances/ActiveServiceInstancesHeader'
import { ActiveServiceInstancesContent } from '@cd/components/ServiceDetails/ActiveServiceInstances/ActiveServiceInstancesContent'
import css from '@cd/components/ServiceDetails/ActiveServiceInstances/ActiveServiceInstances.module.scss'

export const ActiveServiceInstances: React.FC = () => {
  const { getString } = useStrings()
  return (
    <Card className={css.activeServiceInstances}>
      <Layout.Vertical height={'100%'}>
        <Text font={{ weight: 'bold' }} color={Color.GREY_600} margin={{ bottom: 'medium' }}>
          {getString('cd.serviceDashboard.activeServiceInstancesLabel')}
        </Text>
        <ActiveServiceInstancesHeader />
        <ActiveServiceInstancesContent />
      </Layout.Vertical>
    </Card>
  )
}
