/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import {
  Text,
  Container,
  Formik,
  FormikForm,
  FormInput,
  Layout,
  SelectOption,
  Utils,
  useToaster,
  Button
} from '@wings-software/uicore'
import { PopoverInteractionKind } from '@blueprintjs/core'
import { Color } from '@harness/design-system'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useGetNewRelicApplications, MetricPackDTO, MetricPackValidationResponse } from 'services/cv'
import { Connectors } from '@connectors/constants'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import { useStrings } from 'framework/strings'
import CardWithOuterTitle from '@cv/pages/health-source/common/CardWithOuterTitle/CardWithOuterTitle'
import DrawerFooter from '@cv/pages/health-source/common/DrawerFooter/DrawerFooter'
import MetricsVerificationModal from '@cv/components/MetricsVerificationModal/MetricsVerificationModal'
import ValidationStatus from '@cv/pages/components/ValidationStatus/ValidationStatus'
import { StatusOfValidation } from '@cv/pages/components/ValidationStatus/ValidationStatus.constants'
import useGroupedSideNaveHook from '@cv/hooks/GroupedSideNaveHook/useGroupedSideNaveHook'
import {
  getOptions,
  getInputGroupProps,
  validateMetrics,
  createMetricDataFormik
} from '../MonitoredServiceConnector.utils'

import { HealthSoureSupportedConnectorTypes } from '../MonitoredServiceConnector.constants'
import {
  createNewRelicFormData,
  createNewRelicPayloadBeforeSubmission,
  initializeNonCustomFields,
  setNewRelicApplication,
  validateMapping
} from './NewRelicHealthSource.utils'
import CustomMetric from '../../common/CustomMetric/CustomMetric'
import MetricPackCustom from '../MetricPackCustom'
import NewRelicCustomMetricForm from './components/NewRelicCustomMetricForm/NewRelicCustomMetricForm'
import { initNewRelicCustomFormValue } from './components/NewRelicCustomMetricForm/NewRelicCustomMetricForm.utils'
import css from './NewrelicMonitoredSource.module.scss'

const guid = Utils.randomId()

export default function NewRelicHealthSource({
  data: newRelicData,
  onSubmit,
  onPrevious
}: {
  data: any
  onSubmit: (healthSourcePayload: any) => void
  onPrevious: () => void
}): JSX.Element {
  const { getString } = useStrings()
  const { showError } = useToaster()
  const defailtMetricName = getString('cv.monitoringSources.newRelic.defaultNewRelicMetricName')
  const [selectedMetricPacks, setSelectedMetricPacks] = useState<MetricPackDTO[]>([])
  const [validationResultData, setValidationResultData] = useState<MetricPackValidationResponse[]>()
  const [newRelicValidation, setNewRelicValidation] = useState<{
    status: string
    result: MetricPackValidationResponse[] | []
  }>({
    status: '',
    result: []
  })

  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const connectorIdentifier = newRelicData?.connectorRef?.connector?.identifier || newRelicData?.connectorRef
  const [showCustomMetric, setShowCustomMetric] = useState(!!Array.from(newRelicData?.mappedServicesAndEnvs)?.length)

  const {
    createdMetrics,
    mappedMetrics,
    selectedMetric,
    groupedCreatedMetrics,
    groupedCreatedMetricsList,
    setMappedMetrics,
    setCreatedMetrics,
    setGroupedCreatedMetrics
  } = useGroupedSideNaveHook({
    defaultCustomMetricName: defailtMetricName,
    initCustomMetricData: initNewRelicCustomFormValue(),
    mappedServicesAndEnvs: showCustomMetric ? newRelicData?.mappedServicesAndEnvs : new Map()
  })

  const [nonCustomFeilds, setNonCustomFeilds] = useState(initializeNonCustomFields(newRelicData))

  const {
    data: applicationsData,
    loading: applicationLoading,
    error: applicationError
  } = useGetNewRelicApplications({
    queryParams: {
      accountId,
      connectorIdentifier,
      orgIdentifier,
      projectIdentifier,
      offset: 0,
      pageSize: 10000,
      filter: '',
      tracingId: guid
    }
  })

  const onValidate = async (appName: string, appId: string, metricObject: { [key: string]: any }): Promise<void> => {
    setNewRelicValidation({ status: StatusOfValidation.IN_PROGRESS, result: [] })
    const filteredMetricPack = selectedMetricPacks?.filter(item => metricObject[item.identifier as string])
    const { validationStatus, validationResult } = await validateMetrics(
      filteredMetricPack || [],
      {
        appId,
        appName,
        accountId,
        connectorIdentifier: connectorIdentifier,
        orgIdentifier,
        projectIdentifier,
        requestGuid: guid
      },
      HealthSoureSupportedConnectorTypes.NEW_RELIC
    )
    setNewRelicValidation({
      status: validationStatus as string,
      result: validationResult as MetricPackValidationResponse[]
    })
  }

  const applicationOptions: SelectOption[] = useMemo(
    () =>
      getOptions(applicationLoading, applicationsData?.data, HealthSoureSupportedConnectorTypes.NEW_RELIC, getString),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [applicationLoading]
  )

  useEffect(() => {
    if (!selectedMetric && !mappedMetrics.size) {
      setShowCustomMetric(false)
    }
  }, [mappedMetrics, selectedMetric])

  useEffect(() => {
    if (
      newRelicData.isEdit &&
      selectedMetricPacks.length &&
      newRelicValidation.status !== StatusOfValidation.IN_PROGRESS
    ) {
      onValidate(
        newRelicData?.applicationName,
        newRelicData?.applicationId,
        createMetricDataFormik(newRelicData?.metricPacks)
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMetricPacks, applicationLoading, newRelicData.isEdit])

  const initPayload = useMemo(
    () => createNewRelicFormData(newRelicData, mappedMetrics, selectedMetric, nonCustomFeilds, showCustomMetric),
    [newRelicData, mappedMetrics, selectedMetric, nonCustomFeilds, showCustomMetric]
  )

  if (applicationError) {
    showError(getErrorMessage(applicationError))
  }

  return (
    <Formik
      enableReinitialize
      formName={'newRelicHealthSourceform'}
      isInitialValid={(args: any) =>
        Object.keys(
          validateMapping(
            args.initialValues,
            groupedCreatedMetricsList,
            groupedCreatedMetricsList.indexOf(selectedMetric),
            getString
          )
        ).length === 0
      }
      validate={values => {
        return validateMapping(
          values,
          groupedCreatedMetricsList,
          groupedCreatedMetricsList.indexOf(selectedMetric),
          getString
        )
      }}
      initialValues={initPayload}
      onSubmit={async values => {
        await onSubmit(values)
      }}
    >
      {formik => {
        return (
          <FormikForm className={css.formFullheight}>
            <CardWithOuterTitle title={'Application'}>
              <Layout.Horizontal spacing={'large'} className={css.horizontalCenterAlign}>
                <Container margin={{ bottom: 'small' }} width={'300px'} color={Color.BLACK}>
                  <FormInput.Select
                    className={css.applicationDropdown}
                    onChange={item => {
                      setNonCustomFeilds({
                        ...nonCustomFeilds,
                        newRelicApplication: { label: item?.label, value: item?.value as string }
                      })
                      onValidate(
                        formik?.values?.newRelicApplication?.label,
                        formik?.values?.newRelicApplication?.value,
                        formik.values.metricData
                      )
                    }}
                    value={setNewRelicApplication(formik?.values?.newRelicApplication?.label, applicationOptions)}
                    name={'newRelicApplication'}
                    placeholder={
                      applicationLoading
                        ? getString('loading')
                        : getString('cv.healthSource.connectors.AppDynamics.applicationPlaceholder')
                    }
                    items={applicationOptions}
                    label={getString('cv.healthSource.connectors.NewRelic.applicationLabel')}
                    {...getInputGroupProps(() =>
                      setNonCustomFeilds({
                        ...nonCustomFeilds,
                        newRelicApplication: { label: '', value: '' }
                      })
                    )}
                  />
                </Container>
                <Container width={'300px'} color={Color.BLACK}>
                  {formik.values?.newRelicApplication.label && formik.values.newRelicApplication.value && (
                    <ValidationStatus
                      validationStatus={newRelicValidation?.status as StatusOfValidation}
                      onClick={
                        newRelicValidation.result?.length
                          ? () => setValidationResultData(newRelicValidation.result)
                          : undefined
                      }
                      onRetry={() =>
                        onValidate(
                          formik?.values?.newRelicApplication?.label,
                          formik?.values?.newRelicApplication?.value,
                          formik.values.metricData
                        )
                      }
                    />
                  )}
                </Container>
              </Layout.Horizontal>
            </CardWithOuterTitle>
            <CardWithOuterTitle title={getString('metricPacks')}>
              <Layout.Vertical>
                <Text color={Color.BLACK}>{getString('cv.healthSource.connectors.AppDynamics.metricPackLabel')}</Text>
                <Layout.Horizontal spacing={'large'} className={css.horizontalCenterAlign}>
                  <MetricPackCustom
                    setMetricDataValue={value => {
                      setNonCustomFeilds({
                        ...nonCustomFeilds,
                        metricData: value
                      })
                    }}
                    metricPackValue={formik.values.metricPacks}
                    metricDataValue={formik.values.metricData}
                    setSelectedMetricPacks={setSelectedMetricPacks}
                    connector={HealthSoureSupportedConnectorTypes.NEW_RELIC}
                    onChange={async metricValue => {
                      setNonCustomFeilds({
                        ...nonCustomFeilds,
                        metricData: metricValue
                      })
                      await onValidate(
                        formik?.values?.newRelicApplication?.label,
                        formik?.values?.newRelicApplication?.value,
                        metricValue
                      )
                    }}
                  />
                  {validationResultData && (
                    <MetricsVerificationModal
                      verificationData={validationResultData}
                      guid={guid}
                      onHide={setValidationResultData as () => void}
                      verificationType={Connectors.NEW_RELIC}
                    />
                  )}
                </Layout.Horizontal>
              </Layout.Vertical>
            </CardWithOuterTitle>
            {showCustomMetric ? (
              <CustomMetric
                isValidInput={formik.isValid}
                setMappedMetrics={setMappedMetrics}
                selectedMetric={selectedMetric}
                formikValues={formik.values}
                mappedMetrics={mappedMetrics}
                createdMetrics={createdMetrics}
                groupedCreatedMetrics={groupedCreatedMetrics}
                setCreatedMetrics={setCreatedMetrics}
                setGroupedCreatedMetrics={setGroupedCreatedMetrics}
                defaultMetricName={defailtMetricName}
                tooptipMessage={getString('cv.monitoringSources.gcoLogs.addQueryTooltip')}
                addFieldLabel={getString('cv.monitoringSources.addMetric')}
                initCustomForm={initNewRelicCustomFormValue()}
                shouldBeAbleToDeleteLastMetric
              >
                <NewRelicCustomMetricForm
                  connectorIdentifier={connectorIdentifier}
                  mappedMetrics={mappedMetrics}
                  selectedMetric={selectedMetric}
                  formikValues={formik.values}
                  formikSetField={formik.setFieldValue}
                />
              </CustomMetric>
            ) : (
              <CardWithOuterTitle title={getString('cv.healthSource.connectors.customMetrics')}>
                <Button
                  icon="plus"
                  minimal
                  margin={{ left: 'medium' }}
                  intent="primary"
                  tooltip={getString('cv.healthSource.connectors.customMetricsTooltip')}
                  tooltipProps={{ interactionKind: PopoverInteractionKind.HOVER_TARGET_ONLY }}
                  onClick={() => setShowCustomMetric(true)}
                >
                  {getString('cv.monitoringSources.addMetric')}
                </Button>
              </CardWithOuterTitle>
            )}
            <DrawerFooter
              isSubmit
              onPrevious={onPrevious}
              onNext={() =>
                createNewRelicPayloadBeforeSubmission(
                  formik,
                  mappedMetrics,
                  selectedMetric,
                  groupedCreatedMetricsList.indexOf(selectedMetric),
                  groupedCreatedMetricsList,
                  getString,
                  onSubmit
                )
              }
            />
          </FormikForm>
        )
      }}
    </Formik>
  )
}
