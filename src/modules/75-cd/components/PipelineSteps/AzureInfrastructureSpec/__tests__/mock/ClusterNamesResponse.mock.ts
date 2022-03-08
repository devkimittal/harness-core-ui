/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { UseGetReturnData } from '@common/utils/testUtils'
import type { ResponseGcpResponseDTO } from 'services/cd-ng'

export const ClusterNamesResponse: UseGetReturnData<ResponseGcpResponseDTO> = {
  loading: false,
  refetch: jest.fn(),
  error: null,
  data: {
    status: 'SUCCESS',
    data: {
      clusterNames: ['us-west2/abc', 'us-west1-b/qwe']
    },
    correlationId: '33715e30-e0cd-408c-ad82-a412161733c2'
  }
}
