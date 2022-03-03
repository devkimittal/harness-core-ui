/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { SeriesScatterOptions } from 'highcharts'

export default function getLogAnalysisSpiderChartOptions(series: SeriesScatterOptions[]): Highcharts.Options {
  return {
    chart: {
      polar: true,
      type: 'scatter'
    },
    accessibility: {
      description:
        'A spiderweb chart compares the allocated budget against actual spending within an organization. The spider chart has six spokes. Each spoke represents one of the 6 departments within the organization: sales, marketing, development, customer support, information technology and administration. The chart is interactive, and each data point is displayed upon hovering. The chart clearly shows that 4 of the 6 departments have overspent their budget with Marketing responsible for the greatest overspend of $20,000. The allocated budget and actual spending data points for each department are as follows: Sales. Budget equals $43,000; spending equals $50,000. Marketing. Budget equals $19,000; spending equals $39,000. Development. Budget equals $60,000; spending equals $42,000. Customer support. Budget equals $35,000; spending equals $31,000. Information technology. Budget equals $17,000; spending equals $26,000. Administration. Budget equals $10,000; spending equals $14,000.'
    },
    credits: undefined,
    title: {
      text: ''
    },
    legend: {
      enabled: false
    },
    pane: {
      size: '100%'
    },

    xAxis: {
      labels: { enabled: false },
      //   categories: ['Sales', 'Marketing', 'Development', 'Customer Support', 'Information Technology', 'Administration'],
      tickmarkPlacement: 'on',
      lineWidth: 0,
      tickAmount: 12,
      max: 360,
      min: 0
    },

    yAxis: {
      labels: { enabled: false },
      plotBands: [
        {
          from: 0,
          to: 33000,
          color: '#ffffff'
          // "outerRadius": "105%",
          // "thickness": "50%"
        },
        {
          from: 33000,
          to: 66000,
          color: '#FAFCFF'
          // "outerRadius": "105%",
          // "thickness": "50%"
        },
        {
          from: 66000,
          to: 100000,
          color: '#EFFBFF'
          // "outerRadius": "105%",
          // "thickness": "50%"
        }
      ],
      // "reversed": true,
      // "min": 1,
      //   maximum
      max: 100000,
      allowDecimals: false,
      // "tickInterval": 25000,
      // "tickAmount": 5,
      tickPositions: [0, 33000, 66000, 100000],
      // "tickLength": 25000,
      // "gridLineInterpolation": "polygon",
      gridLineColor: '#ECE6E6',
      // "lineWidth": 1,
      // "tickmarkPlacement": "between",
      tickPixelInterval: 25000
      // "tickPosition": "outside",
      // "labels": {
      //   "enabled": true,
      //   "style": {
      //     "fontWeight": "bold"
      //   },
      // "y": 25
      // }
    },

    tooltip: {
      shared: true,
      pointFormat: '<span style="color:{series.color}">{series.name}: <b>${point.y:,.0f}</b><br/>'
    },

    series: [
      {
        name: 'a',
        data: [{ x: 80, y: 45444 }],
        color: 'red',
        pointPlacement: 'on',
        marker: { symbol: 'circle' }
      },
      {
        name: 'b',
        data: [{ x: 280, y: 12111 }],
        pointPlacement: 'on',
        marker: { symbol: 'circle' }
      },
      {
        name: 'c',
        data: [{ x: 160, y: 30032 }],
        pointPlacement: 'on',
        marker: { symbol: 'circle' }
      },
      {
        name: 'c',
        data: [{ x: 240, y: 80000 }],
        pointPlacement: 'on',
        color: 'red',
        marker: { symbol: 'circle' }
      }
    ],
    plotOptions: {
      series: {
        cursor: 'pointer',
        point: {
          events: {
            click: e => {
              console.log(e)
            }
          }
        }
      }
    }

    // responsive: {
    //   rules: [
    //     {
    //       condition: {
    //         maxWidth: 200
    //       },
    //       chartOptions: {
    //         legend: {
    //           align: 'center',
    //           verticalAlign: 'bottom',
    //           layout: 'horizontal'
    //         },
    //         pane: {
    //           size: '90%'
    //         }
    //       }
    //     }
    //   ]
    // }
  }
}
