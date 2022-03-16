import { CostBucketWidgetType } from '@ce/types'
import type { UseStringsReturn } from 'framework/strings'

export const newBucketButtonText = {
  [CostBucketWidgetType.CostBucket]: 'New Cost Bucket',
  [CostBucketWidgetType.SharedCostBucket]: 'New Shared Bucket'
}

export const bucketNameText = {
  [CostBucketWidgetType.CostBucket]: 'Cost Bucket Name',
  [CostBucketWidgetType.SharedCostBucket]: 'Shared Bucket name'
}

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
