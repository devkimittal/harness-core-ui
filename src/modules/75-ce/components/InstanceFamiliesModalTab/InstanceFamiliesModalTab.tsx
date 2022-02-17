/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, Text, Color } from '@harness/uicore'

// import type { SeriesDetails } from 'services/ce/publicPricingService'

interface TabProps {
  data?: Record<string, string[]>
}

// const Cell = ({ label }: { label: string }) => (
//   <Container>
//     <Text font={{ variation: FontVariation.SMALL_SEMI }}>{label}</Text>
//   </Container>
// )

export const InstanceFamiliesModalTab: React.FC<TabProps> = ({ data }) => {
  // const keys = Object.keys(data).map(item => item)
  // const size = [...data?.map(obj => obj.map(item => item))]

  return (
    <Container background={Color.GREY_100} height="100%">
      <Text>{JSON.stringify(data)}</Text>
      {/* <Text>{JSON.stringify(size)}</Text> */}
    </Container>
  )
}
