/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { SeriesScatterOptions } from 'highcharts'
import { getEventTypeChartColor } from '@cv/utils/CommonUtils'
import type { MinMaxAngleState } from './LogAnalysisRadarChart.types'

export function getRadarChartSeries(data: any[]): SeriesScatterOptions['data'] {
  return data.map(marker => {
    return {
      name: marker.angle,
      data: [{ x: marker.angle, y: marker.radius === 'UNKNOWN' ? 90 : 45 }],
      color: getEventTypeChartColor(marker.radius),
      pointPlacement: 'on',
      marker: { symbol: 'circle' }
    }
  })
}

export default function getLogAnalysisSpiderChartOptions(
  series: SeriesScatterOptions['data'],
  minMaxAngle: MinMaxAngleState
): Highcharts.Options {
  return {
    chart: {
      polar: true,
      type: 'scatter',
      height: 400,
      marginTop: 20,
      marginBottom: 20
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
      labels: { enabled: true },
      // categories: [0, 15, 30, 45],
      tickmarkPlacement: 'on',
      lineWidth: 0,
      tickAmount: 13,
      max: minMaxAngle.max,
      min: minMaxAngle.min
      // tickInterval: 10
    },

    yAxis: {
      labels: { enabled: false },
      plotBands: [
        {
          from: 0,
          to: 30,
          color: '#ffffff'
          // "outerRadius": "105%",
          // "thickness": "50%"
        },
        {
          from: 30,
          to: 60,
          color: '#FAFCFF'
          // "outerRadius": "105%",
          // "thickness": "50%"
        },
        {
          from: 60,
          to: 100,
          color: '#EFFBFF'
          // "outerRadius": "105%",
          // "thickness": "50%"
        }
      ],
      // "reversed": true,
      // "min": 1,
      //   maximum
      max: 100,
      allowDecimals: false,
      // "tickInterval": 25000,
      // "tickAmount": 5,
      tickPositions: [0, 30, 60, 100],
      // "tickLength": 25000,
      // "gridLineInterpolation": "polygon",
      gridLineColor: '#ECE6E6',
      // "lineWidth": 1,
      // "tickmarkPlacement": "between",
      tickPixelInterval: 25
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

    series,
    plotOptions: {
      series: {
        // events: {
        //   click: (...e) => {
        //     console.log('click ', e)
        //   },
        //   mouseOver: (...e) => {
        //     console.log('mouseover', e)
        //   }
        // },
        cursor: 'pointer',
        point: {
          events: {
            click: e => {
              console.log(e)
            }
          }
        }
      }
      // dataLabels: {
      //   enabled: true,
      //   format: '<span class="wheel-label" style="color: red">name</span>',
      //   style: {
      //     textShadow: false,
      //     width: 150,
      //     fontSize: '16px'
      //   }
      // }
    }

    // responsive: {
    //   rules: [
    //     {
    //       // callback: () => {}
    //       condition: {
    //         height: 400,
    //         callback: () => {}
    //       },
    //       chartOptions: {
    //         // legend: {
    //         //   align: 'center',
    //         //   verticalAlign: 'bottom',
    //         //   layout: 'horizontal'
    //         // },
    //         pane: {
    //           size: '70%'
    //         }
    //       }
    //     }
    //   ]
    // }
  }
}
