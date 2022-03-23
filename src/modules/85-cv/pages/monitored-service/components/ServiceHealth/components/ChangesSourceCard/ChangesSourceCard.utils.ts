/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Color } from '@harness/design-system'
import { ChangeSourceCategoryName } from '@cv/pages/ChangeSource/ChangeSourceDrawer/ChangeSourceDrawer.constants'
import type { UseStringsReturn } from 'framework/strings'
import type { CategoryCountDetails, ChangeSummaryDTO } from 'services/cv'
import type { ChangeSourceCardData, CategoryCountMapInterface } from './ChangesSourceCard.types'
import { changeLabel } from './ChangesSourceCard.constants'

const labelByCategory = (categoryType: string, getString: UseStringsReturn['getString']): string => {
  switch (categoryType) {
    case ChangeSourceCategoryName.INFRASTRUCTURE:
      return getString('infrastructureText')
    case ChangeSourceCategoryName.DEPLOYMENT:
      return getString('deploymentText')
    case ChangeSourceCategoryName.ALERT:
      return getString('cv.changeSource.tooltip.incidents')
    case changeLabel:
      return getString('changes')
    default:
      return ''
  }
}

const createChangeSourceCardData = (
  category: CategoryCountDetails,
  categoryType: string,
  getString: UseStringsReturn['getString']
): ChangeSourceCardData => {
  const count = category?.count && isNaN(category?.count) ? 0 : category.count || 0
  const previousCount =
    category?.countInPrecedingWindow && isNaN(category?.countInPrecedingWindow)
      ? 0
      : category?.countInPrecedingWindow || 0
  const categoryPercentage: number = ((count - previousCount) / previousCount) * 100
  return {
    count,
    id: categoryType,
    label: labelByCategory(categoryType, getString),
    percentage: isNaN(categoryPercentage) ? 0 : categoryPercentage === Infinity ? 100 : categoryPercentage
  }
}

export const zeroIfUndefined = (item: number | undefined) => item || 0

export const calculateChangePercentage = (
  changeSummary: ChangeSummaryDTO | undefined,
  getString: UseStringsReturn['getString']
): ChangeSourceCardData[] => {
  if (changeSummary && changeSummary?.categoryCountMap) {
    const { categoryCountMap } = changeSummary
    const { Infrastructure, Deployment, Alert } = categoryCountMap as CategoryCountMapInterface
    const total = {
      count:
        zeroIfUndefined(Infrastructure?.count) + zeroIfUndefined(Deployment?.count) + zeroIfUndefined(Alert?.count),
      countInPrecedingWindow:
        zeroIfUndefined(Infrastructure?.countInPrecedingWindow) +
        zeroIfUndefined(Deployment?.countInPrecedingWindow) +
        zeroIfUndefined(Alert?.countInPrecedingWindow)
    }
    return [
      createChangeSourceCardData(total, changeLabel, getString),
      createChangeSourceCardData(Deployment, ChangeSourceCategoryName.DEPLOYMENT, getString),
      createChangeSourceCardData(Infrastructure, ChangeSourceCategoryName.INFRASTRUCTURE, getString),
      createChangeSourceCardData(Alert, ChangeSourceCategoryName.ALERT, getString)
    ]
  }
  return []
}

export const getTickerColor = (percentage: number): Color => (percentage > -1 ? Color.GREEN_600 : Color.RED_500)
