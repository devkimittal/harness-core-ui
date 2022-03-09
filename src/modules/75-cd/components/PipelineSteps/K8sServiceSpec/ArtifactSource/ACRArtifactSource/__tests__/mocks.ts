/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const artifacts = {
  sidecars: [
    {
      sidecar: {
        identifier: 'Sidecar',
        type: 'Acr',
        spec: {
          connectorRef: '<+input>',
          subscription: '<+input>',
          registry: '<+input>',
          repository: '<+input>',
          tag: '<+input>'
        }
      }
    }
  ],
  primary: {
    spec: {
      connectorRef: '<+input>',
      subscription: '<+input>',
      registry: '<+input>',
      repository: '<+input>',
      tag: '<+input>'
    },
    type: 'Acr'
  }
}

export const template = {
  artifacts: {
    sidecars: [
      {
        sidecar: {
          identifier: 'Sidecar',
          type: 'Acr',
          spec: {
            connectorRef: '<+input>',
            subscription: '<+input>',
            registry: '<+input>',
            repository: '<+input>',
            tag: '<+input>'
          }
        }
      }
    ],
    primary: {
      spec: {
        connectorRef: '<+input>',
        subscription: '<+input>',
        registry: '<+input>',
        repository: '<+input>',
        tag: '<+input>'
      },
      type: 'Acr'
    }
  }
}

export const mockSubscriptions = [
  { name: 'sub1', label: 'Subscription 1' },
  { name: 'sub2', label: 'Subscription 2' },
  { name: 'sub3', label: 'Subscription 3' }
]

export const mockRegistries = [
  { name: 'reg1', label: 'Region 1' },
  { name: 'reg2', label: 'Region 2' },
  { name: 'reg3', label: 'Region 3' }
]

export const mockRepositories = [
  { name: 'rep1', label: 'Repository 1' },
  { name: 'rep2', label: 'Repository 2' },
  { name: 'rep3', label: 'Repository 3' }
]
