/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { UseGetReturnData } from '@common/utils/testUtils'
import type { ResponseAzureResponseDTO } from 'services/cd-ng'

export const connectorResponse = {
  loading: false,
  refetch: jest.fn(),
  error: null,
  data: {
    status: 'SUCCESS',
    data: {
      connector: {
        name: 'connectorRef',
        identifier: 'connectorRef',
        description: '',
        tags: {},
        type: 'Azure',
        spec: {
          credential: {
            type: 'ManualConfig',
            spec: {
              masterUrl: 'master',
              auth: { type: 'UsernamePassword', spec: { username: 'usr', passwordRef: 'account.test' } }
            }
          }
        }
      }
    }
  }
}

export const connectorsResponse = {
  loading: false,
  refetch: jest.fn(),
  error: null,
  data: {
    status: 'SUCCESS',
    data: {
      content: [
        {
          connector: {
            name: 'AWS',
            identifier: 'AWS',
            description: '',
            orgIdentifier: 'undefined',
            projectIdentifier: 'undefined',
            tags: {},
            type: 'Aws',
            spec: {
              credential: {
                crossAccountAccess: null,
                type: 'InheritFromDelegate',
                spec: { delegateSelector: 'qwe' }
              }
            }
          },
          createdAt: 1608697269523,
          lastModifiedAt: 1608697269523,
          status: null,
          harnessManaged: false
        },
        {
          connector: {
            name: 'Git CTR',
            identifier: 'Git_CTR',
            description: 'To connect to Git',
            orgIdentifier: 'undefined',
            projectIdentifier: 'undefined',
            tags: { git: '' },
            type: 'Git',
            spec: {
              url: 'https://github.com',
              branchName: '',
              type: 'Http',
              connectionType: 'Repo',
              spec: { username: 'admin', passwordRef: 'account.sec1' },
              gitSync: { enabled: false, customCommitAttributes: null, syncEnabled: false }
            }
          },
          createdAt: 1608679004757,
          lastModifiedAt: 1608679004757,
          status: null,
          harnessManaged: false
        }
      ]
    }
  }
}

export const resourceGroupsResponse: UseGetReturnData<ResponseAzureResponseDTO> = {
  loading: false,
  refetch: jest.fn(),
  error: null,
  data: {
    status: 'SUCCESS',
    data: ['rg1', 'rg2'],
    correlationId: '33715e30-e0cd-408c-ad82-a412161733c2'
  }
}

export const subscriptionsResponse: UseGetReturnData<ResponseAzureResponseDTO> = {
  loading: false,
  refetch: jest.fn(),
  error: null,
  data: {
    status: 'SUCCESS',
    data: ['sub1', 'sub2'],
    correlationId: '33715e30-e0cd-408c-ad82-a412161733c2'
  }
}

export const clustersResponse: UseGetReturnData<ResponseAzureResponseDTO> = {
  loading: false,
  refetch: jest.fn(),
  error: null,
  data: {
    status: 'SUCCESS',
    data: ['us-west2/abc', 'us-west1-b/qwe'],
    correlationId: '33715e30-e0cd-408c-ad82-a412161733c2'
  }
}
