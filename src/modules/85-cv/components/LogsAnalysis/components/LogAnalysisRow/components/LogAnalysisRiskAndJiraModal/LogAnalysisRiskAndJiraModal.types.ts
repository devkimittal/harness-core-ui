/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export interface LogAnalysisRiskAndJiraModalProps {
  count: number
  activityType?: string
  trendData?: Highcharts.Options
  onHide: (data?: any) => void
  logMessage: string
  feedback?: { risk: string; message?: string }
}

export interface RiskAndMessageFormProps {
  handleSubmit: () => void
  hasSubmitted?: boolean
}

export interface ActivityHeadingContentProps {
  count: number
  trendData?: Highcharts.Options
  activityType?: string
}

export interface SampleDataProps {
  logMessage?: string
}
