/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { CostBucketWidgetType } from '@ce/types'
import type { UseStringsReturn } from 'framework/strings'

export function getCostBucketTitleMap(getString: UseStringsReturn['getString']): Record<CostBucketWidgetType, string> {
  return {
    [CostBucketWidgetType.CostBucket]: getString('ce.businessMapping.costBucket.title'),
    [CostBucketWidgetType.SharedCostBucket]: getString('ce.businessMapping.sharedCostBucket.title')
  }
}

export function getNewBucketButtonText(getString: UseStringsReturn['getString']): Record<CostBucketWidgetType, string> {
  return {
    [CostBucketWidgetType.CostBucket]: getString('ce.businessMapping.costBucket.newButtonText'),
    [CostBucketWidgetType.SharedCostBucket]: getString('ce.businessMapping.sharedCostBucket.newButtonText')
  }
}

export function getBucketNameText(getString: UseStringsReturn['getString']): Record<CostBucketWidgetType, string> {
  return {
    [CostBucketWidgetType.CostBucket]: getString('ce.businessMapping.costBucket.inputName'),
    [CostBucketWidgetType.SharedCostBucket]: getString('ce.businessMapping.sharedCostBucket.inputName')
  }
}
