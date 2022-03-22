/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { SelectOption } from '@harness/uicore'
import type { HealthSourceDTO } from 'services/cv'
import type { UseStringsReturn } from 'framework/strings'

export function isPositiveNumber(index: unknown): index is number {
  return typeof index === 'number' && index >= 0
}

export function getHealthSourceOptions(
  getString: UseStringsReturn['getString'],
  healthSources?: HealthSourceDTO[]
): SelectOption[] {
  const optionAll: SelectOption = { label: getString('all'), value: '' }

  const healthSourcesOptions =
    healthSources?.map(healthSource => ({
      label: healthSource.name ?? '',
      value: healthSource.identifier ?? ''
    })) ?? []

  return [optionAll, ...healthSourcesOptions]
}
