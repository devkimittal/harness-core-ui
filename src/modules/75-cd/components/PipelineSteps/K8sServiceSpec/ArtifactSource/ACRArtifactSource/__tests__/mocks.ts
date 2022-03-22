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

export const artifactsTagRegex = {
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
          tagRegex: '<+input>'
        }
      }
    }
  ]
}

export const templateTagRegex = {
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
            tagRegex: '<+input>'
          }
        }
      }
    ]
  }
}

export const artifactsWithValues = {
  sidecars: [
    {
      sidecar: {
        identifier: 'Sidecar',
        type: 'Acr',
        spec: {
          connectorRef: 'connectorRef',
          subscription: 'subscription',
          registry: 'registry',
          repository: 'repository',
          tag: '<+input>'
        }
      }
    }
  ],
  primary: {
    spec: {
      connectorRef: 'connectorRef',
      subscription: 'subscription',
      registry: 'registry',
      repository: 'repository',
      tag: '<+input>'
    },
    type: 'Acr'
  }
}

export const templateWithValues = {
  artifacts: {
    sidecars: [
      {
        sidecar: {
          identifier: 'Sidecar',
          type: 'Acr',
          spec: {
            connectorRef: 'connectorRef',
            subscription: 'subscription',
            registry: 'registry',
            repository: 'repository',
            tag: '<+input>'
          }
        }
      }
    ],
    primary: {
      spec: {
        connectorRef: 'connectorRef',
        subscription: 'subscription',
        registry: 'registry',
        repository: 'repository',
        tag: '<+input>'
      },
      type: 'Acr'
    }
  }
}

export const mockSubscriptions = {
  resource: [
    { value: 'sub1', label: 'Subscription 1' },
    { value: 'sub2', label: 'Subscription 2' },
    { value: 'sub3', label: 'Subscription 3' }
  ]
}

export const mockRegistries = {
  resource: [
    { value: 'reg1', label: 'Region 1' },
    { value: 'reg2', label: 'Region 2' },
    { value: 'reg3', label: 'Region 3' }
  ]
}

export const mockRepositories = {
  resource: [
    { value: 'rep1', label: 'Repository 1' },
    { value: 'rep2', label: 'Repository 2' },
    { value: 'rep3', label: 'Repository 3' }
  ]
}

export const path = 'stages[0].stage.spec.serviceConfig.serviceDefinition.spec'
