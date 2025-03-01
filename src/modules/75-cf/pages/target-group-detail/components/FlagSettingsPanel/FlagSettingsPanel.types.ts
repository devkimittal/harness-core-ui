/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { Feature, SegmentFlag } from 'services/cf'

export interface TargetGroupFlag extends SegmentFlag {
  flag: Feature
}

export type TargetGroupFlagsMap = Record<string, TargetGroupFlag>

export interface FlagSettingsFormRow {
  identifier: string
  variation: string
}

export interface FlagSettingsFormData {
  flags: Record<string, FlagSettingsFormRow>
}
