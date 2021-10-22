import React, { useCallback, useEffect, useMemo } from 'react'
import { Color, FormInput, Text } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'

import CardWithOuterTitle from '@cv/pages/health-source/common/CardWithOuterTitle/CardWithOuterTitle'
import { useGetMonitoredService, useListMonitoredService } from 'services/cv'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import type { SLIProps } from './SLI.types'
import {
  getHealthSourcesOptions,
  getMonitoredServicesOptions,
  getSliMetricOptions,
  getSliTypeOptions
} from './SLI.utils'
import { SLIMetricEnum } from './SLI.constants'
import RatioMetricType from './components/RatioMetricType/RatioMetricType'
import ThresholdMetricType from './components/ThresholdMetricType/ThresholdMetricType'
import css from './SLI.module.scss'

export default function SLI(props: SLIProps): JSX.Element {
  const {
    formikProps: { values },
    children
  } = props
  const { getString } = useStrings()
  const { orgIdentifier, projectIdentifier, accountId } = useParams<ProjectPathProps & { identifier: string }>()

  const paramsForGetMonitoredService = useMemo(() => {
    return {
      identifier: values?.monitoredServiecRef,
      queryParams: {
        orgIdentifier,
        projectIdentifier,
        accountId
      },
      lazy: true
    }
  }, [accountId, values?.monitoredServiecRef, orgIdentifier, projectIdentifier])

  // This will be replaced by the new endpoint once it is available
  const {
    data: monitoredServicesData,
    loading: monitoredServicesLoading,
    refetch: fetchMonitoredServices
  } = useListMonitoredService({
    queryParams: {
      offset: 0,
      pageSize: 100,
      orgIdentifier,
      projectIdentifier,
      accountId
    },
    lazy: true
  })

  // Api to fetch details for a monitored service
  const {
    data: monitoredServiceDataById,
    refetch: fetchMonitoredServiceData,
    loading: getMonitoredServiceLoading
  } = useGetMonitoredService(paramsForGetMonitoredService)

  useEffect(() => {
    fetchMonitoredServices()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // fetching monitored service details whenever monitored service is selected
  useEffect(() => {
    if (values?.monitoredServiecRef) {
      fetchMonitoredServiceData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values?.monitoredServiecRef])

  const renderSelectedMetricTypeLayout = useCallback(() => {
    if (values?.serviceLevelIndicators?.spec?.type === SLIMetricEnum.RATIO) {
      return <RatioMetricType />
    }
    return <ThresholdMetricType />
  }, [values?.serviceLevelIndicators?.spec?.type])

  const monitoredServicesOptions = useMemo(
    () => getMonitoredServicesOptions(monitoredServicesData),
    [monitoredServicesData]
  )

  const healthSourcesOptions = useMemo(
    () => getHealthSourcesOptions(monitoredServiceDataById),
    [monitoredServiceDataById]
  )

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const sliMetricOptions = useMemo(() => getSliMetricOptions(getString), [])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const sliTypeOptions = useMemo(() => getSliTypeOptions(getString), [])

  return (
    <>
      <Text color={Color.BLACK} className={css.label}>
        {getString('connectors.cdng.monitoredService.label')}
      </Text>
      <CardWithOuterTitle className={css.sliElement}>
        <FormInput.Select
          name="monitoredServiecRef"
          label={<Text font={{ size: 'small' }}>{getString('cv.slos.selectMonitoredServiceForSlo')}</Text>}
          placeholder={monitoredServicesLoading ? getString('loading') : getString('cv.slos.selectMonitoredService')}
          items={monitoredServicesOptions}
          className={css.dropdown}
        />
      </CardWithOuterTitle>
      <Text color={Color.BLACK} className={css.label}>
        {getString('cv.slos.healthSourceForSLI')}
      </Text>
      <CardWithOuterTitle className={css.sliElement}>
        <FormInput.Select
          name="healthSourceRef"
          placeholder={getMonitoredServiceLoading ? getString('loading') : getString('cv.slos.selectHealthsource')}
          items={healthSourcesOptions}
          className={css.dropdown}
        />
      </CardWithOuterTitle>
      <Text color={Color.BLACK} className={css.label}>
        {getString('cv.slos.sliType')}
      </Text>
      <CardWithOuterTitle className={css.sliElement}>
        <FormInput.RadioGroup name="serviceLevelIndicators.type" radioGroup={{ inline: true }} items={sliTypeOptions} />
        <Text font={{ size: 'small' }}>{getString('cv.slos.latencySLI')}</Text>
      </CardWithOuterTitle>

      <Text color={Color.BLACK} className={css.label}>
        {getString('cv.slos.pickMetricsSLI')}
      </Text>
      <CardWithOuterTitle className={css.sliElement}>
        <FormInput.RadioGroup
          name="serviceLevelIndicators.spec.type"
          radioGroup={{ inline: true }}
          items={sliMetricOptions}
        />
        {renderSelectedMetricTypeLayout()}
      </CardWithOuterTitle>
      {children}
    </>
  )
}
