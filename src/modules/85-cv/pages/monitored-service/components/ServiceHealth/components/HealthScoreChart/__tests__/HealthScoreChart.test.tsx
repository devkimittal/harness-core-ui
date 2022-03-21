/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor } from '@testing-library/react'
import type { UseGetReturn } from 'restful-react'
import { TestWrapper } from '@common/utils/testUtils'
import * as cvService from 'services/cv'
import HealthScoreChart from '../HealthScoreChart'
import type { HealthScoreChartProps } from '../HealthScoreChart.types'
import { TimePeriodEnum } from '../../../ServiceHealth.constants'
import { mockedHealthScoreData, mockedSeriesData } from './HealthScoreChart.mock'
import { getSeriesData } from '../HealthScoreChart.utils'

const WrapperComponent = (props: HealthScoreChartProps): JSX.Element => {
  return (
    <TestWrapper>
      <HealthScoreChart {...props} />
    </TestWrapper>
  )
}

const fetchHealthScore = jest.fn()

describe('Unit tests for HealthScoreChart', () => {
  test('Verify if all the fields are rendered correctly inside HealthScoreChart', async () => {
    jest.spyOn(cvService, 'useGetMonitoredServiceOverAllHealthScore').mockReturnValue({
      data: mockedHealthScoreData,
      refetch: fetchHealthScore as unknown
    } as UseGetReturn<any, any, any, any>)
    const props = {
      monitoredServiceIdentifier: 'monitored_service_identifier',
      duration: { value: TimePeriodEnum.TWENTY_FOUR_HOURS, label: 'twenty_four_hours' }
    }
    const { container } = render(<WrapperComponent {...props} />)
    expect(container).toMatchSnapshot()
  })

  test('Ensure that api is called with endtime', async () => {
    jest.spyOn(cvService, 'useGetMonitoredServiceOverAllHealthScore').mockReturnValue({
      data: mockedHealthScoreData,
      refetch: fetchHealthScore as unknown
    } as UseGetReturn<any, any, any, any>)
    render(
      <WrapperComponent
        monitoredServiceIdentifier="monitored_service_identifier"
        duration={{ value: TimePeriodEnum.TWENTY_FOUR_HOURS, label: 'twenty_four_hours' }}
        endTime={23234}
      />
    )

    await waitFor(() =>
      expect(cvService.useGetMonitoredServiceOverAllHealthScore).toHaveBeenLastCalledWith({
        identifier: 'monitored_service_identifier',
        queryParams: {
          accountId: undefined,
          duration: 'TWENTY_FOUR_HOURS',
          endTime: 23234,
          orgIdentifier: undefined,
          projectIdentifier: undefined
        }
      })
    )
  })

  test('Verify hasTimelineIntegration flag set to true', async () => {
    jest.spyOn(cvService, 'useGetMonitoredServiceOverAllHealthScore').mockReturnValue({
      data: {},
      refetch: fetchHealthScore as unknown
    } as UseGetReturn<any, any, any, any>)
    const propsWithTimelineIntegration = {
      monitoredServiceIdentifier: 'monitored_service_identifier',
      hasTimelineIntegration: true,
      duration: { value: TimePeriodEnum.TWENTY_FOUR_HOURS, label: 'twenty_four_hours' }
    }
    const { container, getByText } = render(<WrapperComponent {...propsWithTimelineIntegration} />)
    await waitFor(() =>
      expect(getByText('cv.monitoredServices.serviceHealth.pleaseSelectAnotherTimeWindow')).toBeTruthy()
    )
    await waitFor(() =>
      expect(container.querySelector('.NoDataCard--noDataCard')?.textContent).toEqual(
        'cv.monitoredServices.serviceHealth.noDataAvailableForHealthScorecv.monitoredServices.serviceHealth.pleaseSelectAnotherTimeWindow'
      )
    )
  })

  test('Verify hasTimelineIntegration flag set to false', async () => {
    jest.spyOn(cvService, 'useGetMonitoredServiceOverAllHealthScore').mockReturnValue({
      data: {},
      refetch: fetchHealthScore as unknown
    } as UseGetReturn<any, any, any, any>)

    const propsWithOutTimelineIntegration = {
      monitoredServiceIdentifier: 'monitored_service_identifier',
      hasTimelineIntegration: false,
      duration: { value: TimePeriodEnum.TWENTY_FOUR_HOURS, label: 'twenty_four_hours' }
    }
    const { container } = render(<WrapperComponent {...propsWithOutTimelineIntegration} />)
    await waitFor(() =>
      expect(container.querySelector('.NoDataCard--noDataCard')?.textContent).toEqual(
        'cv.monitoredServices.serviceHealth.noDataAvailableForHealthScore'
      )
    )
  })

  test('Verify if correct series is returned for the health score bar graph', async () => {
    expect(getSeriesData(mockedHealthScoreData.healthScores as cvService.RiskData[])).toEqual(mockedSeriesData)
  })

  test('Verify useGetMonitoredServiceOverAllHealthScore is called with monitored service identifier', async () => {
    jest.spyOn(cvService, 'useGetMonitoredServiceOverAllHealthScore').mockReturnValue({
      data: mockedHealthScoreData,
      refetch: fetchHealthScore as unknown
    } as UseGetReturn<any, any, any, any>)

    render(
      <WrapperComponent
        monitoredServiceIdentifier="monitored_service_identifier"
        duration={{ value: TimePeriodEnum.TWENTY_FOUR_HOURS, label: 'twenty_four_hours' }}
        endTime={23234}
      />
    )

    await waitFor(() =>
      expect(cvService.useGetMonitoredServiceOverAllHealthScore).toHaveBeenLastCalledWith({
        identifier: 'monitored_service_identifier',
        queryParams: {
          accountId: undefined,
          orgIdentifier: undefined,
          projectIdentifier: undefined,
          duration: 'TWENTY_FOUR_HOURS',
          endTime: 23234
        }
      })
    )
  })
})
