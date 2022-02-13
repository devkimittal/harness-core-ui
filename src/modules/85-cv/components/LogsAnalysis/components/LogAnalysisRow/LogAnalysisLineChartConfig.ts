/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { SeriesLineOptions } from 'highcharts'

export default function getLogAnalysisLineChartOptions(series: SeriesLineOptions[]): Highcharts.Options {
  return {
    chart: {
      type: 'column',
      renderTo: 'chart',
      margin: [0, 10, 0, 10],
      backgroundColor: 'transparent',
      style: {
        fontFamily: 'var(--font-family)'
      }
    },
    credits: undefined,
    title: {
      text: ''
    },
    legend: {
      enabled: false
    },
    xAxis: {
      labels: { enabled: false },
      // lineWidth: 0,
      tickLength: 0,
      gridLineWidth: 0,
      title: {
        text: ''
      }
    },
    yAxis: {
      labels: { enabled: false },
      lineWidth: 0,
      tickLength: 0,
      gridLineWidth: 0,
      title: {
        text: ''
      }
    },
    plotOptions: {
      series: {
        pointWidth: 15
      }
    },
    tooltip: {
      outside: true,
      useHTML: true,
      formatter: function () {
        return `${this.y}`
      }
    },
    subtitle: undefined,
    series
  }
}
