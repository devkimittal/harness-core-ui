import { Utils, Color } from '@wings-software/uicore'
import type { UseStringsReturn } from 'framework/strings'

export function getChartsConfigForDrawer(
  series?: Highcharts.SeriesOptionsType[],
  trendDataLength?: number,
  getString?: UseStringsReturn['getString']
): Highcharts.Options {
  return {
    title: {
      text: ''
    },
    subtitle: undefined,
    legend: {
      enabled: false
    },
    xAxis: {
      title: {
        text: getString('pipeline.verification.logs.eventCountPerMin'),
        style: {
          color: Utils.getRealCSSColor(Color.GREY_350)
        }
      },
      categories: Array.from({ length: trendDataLength as number }).map((_, i) => String(++i))
    },
    yAxis: {
      title: {
        text: getString('pipeline.verification.logs.frequency'),
        style: {
          color: Utils.getRealCSSColor(Color.GREY_350)
        }
      }
    },
    credits: {
      enabled: false
    },
    plotOptions: {
      series: {
        pointWidth: 20
      }
    },
    series
  }
}
