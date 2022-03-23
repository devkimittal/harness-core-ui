/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Color } from '@harness/design-system'

export const HistoricalTrendChartOption = {
  title: {
    text: ''
  },
  credits: {
    enabled: false
  },
  xAxis: {
    visible: false,
    startOnTick: false,
    endOnTick: false
  },
  yAxis: {
    visible: false,
    startOnTick: false,
    endOnTick: false
  },
  legend: {
    enabled: false
  },
  series: [],
  tooltip: {
    enabled: false
  },
  chart: {
    width: 175,
    height: 31,
    spacing: [0, 0, 0, 0],
    renderTo: 'container',
    backgroundColor: 'rgba(0,0,0,0)'
  },
  plotOptions: {
    series: {
      marker: {
        enabled: false
      },
      enableMouseTracking: false
    }
  }
}

export const DefaultChangePercentage = {
  color: Color.BLACK_100,
  percentage: 0
}
