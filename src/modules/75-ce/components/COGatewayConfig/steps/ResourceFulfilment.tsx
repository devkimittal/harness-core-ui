/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useState } from 'react'
import { get as _get, defaultTo as _defaultTo, debounce as _debounce, isEmpty as _isEmpty } from 'lodash-es'
import * as Yup from 'yup'
import { CardSelect, Container, Formik, FormikForm, FormInput, Layout, Text } from '@wings-software/uicore'
import type { FormikContext } from 'formik'
import type { StringsMap } from 'stringTypes'
import type { GatewayDetails } from '@ce/components/COCreateGateway/models'
import { CONFIG_STEP_IDS, RESOURCES } from '@ce/constants'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { useStrings } from 'framework/strings'
import { Utils } from '@ce/common/Utils'
import { useToaster } from '@common/exports'
import COGatewayConfigStep from '../COGatewayConfigStep'
import { getSubTitle, getTitle } from '../helper'
import odIcon from '../images/ondemandIcon.svg'
import spotIcon from '../images/spotIcon.svg'
import css from '../COGatewayConfig.module.scss'

interface ResourceFulfilmentProps {
  gatewayDetails: GatewayDetails
  setGatewayDetails: (details: GatewayDetails) => void
  setDrawerOpen: (status: boolean) => void
  totalStepsCount: number
  selectedResource?: RESOURCES | null
}

interface CardData {
  text: string
  value: string
  icon: string
  providers?: string[]
}

const instanceTypeCardData: CardData[] = [
  {
    text: 'Spot',
    value: 'spot',
    icon: spotIcon,
    providers: ['aws', 'azure']
  },
  {
    text: 'On demand',
    value: 'ondemand',
    icon: odIcon,
    providers: ['aws', 'azure', 'gcp']
  }
]

const allowedResources = [RESOURCES.INSTANCES, RESOURCES.ASG, RESOURCES.ECS]

const ResourceFulfilment: React.FC<ResourceFulfilmentProps> = props => {
  const { getString } = useStrings()
  const { trackEvent } = useTelemetry()
  const { showError } = useToaster()
  const isGcpProvider = Utils.isProviderGcp(props.gatewayDetails.provider)

  const [selectedInstanceType, setSelectedInstanceType] = useState<CardData | null>(
    _defaultTo(
      instanceTypeCardData[instanceTypeCardData.findIndex(card => card.value === props.gatewayDetails.fullfilment)],
      null
    )
  )

  const handleODChange = (formik: FormikContext<any>, val: string) => {
    if (Utils.isNumber(val)) {
      const numericVal = Number(val)
      formik.setFieldValue('odInstance', numericVal)
      props.gatewayDetails.routing?.instance?.scale_group?.mixed_instance &&
        formik.setFieldValue(
          'spotInstance',
          (props.gatewayDetails.routing.instance.scale_group?.max as number) - numericVal
        )
      const updatedGatewayDetails = { ...props.gatewayDetails }
      // eslint-disable-next-line
      updatedGatewayDetails.routing.instance.scale_group = {
        ...props.gatewayDetails.routing.instance.scale_group,
        desired: Utils.getConditionalResult(
          Boolean(props.gatewayDetails.routing?.instance?.scale_group?.mixed_instance),
          props.gatewayDetails.routing.instance.scale_group?.max,
          numericVal
        ), // desired = od + spot (which is always equal to max capacity)
        on_demand: numericVal, // eslint-disable-line
        ...(props.gatewayDetails.routing?.instance?.scale_group?.mixed_instance && {
          spot: (props.gatewayDetails.routing.instance.scale_group?.max as number) - numericVal // eslint-disable-line
        })
      }
      props.setGatewayDetails(updatedGatewayDetails)
    }
  }

  const handleSpotChange = (formik: FormikContext<any>, val: string) => {
    if (Utils.isNumber(val)) {
      const numericVal = Number(val)
      formik.setFieldValue('spotInstance', numericVal)
      formik.setFieldValue(
        'odInstance',
        (props.gatewayDetails.routing.instance.scale_group?.max as number) - numericVal
      )
      const updatedGatewayDetails = { ...props.gatewayDetails }
      // eslint-disable-next-line
      updatedGatewayDetails.routing.instance.scale_group = {
        ...props.gatewayDetails.routing.instance.scale_group,
        desired: props.gatewayDetails.routing.instance.scale_group?.max, // desired = od + spot (which is always equal to max capacity)
        spot: numericVal,
        on_demand: (props.gatewayDetails.routing.instance.scale_group?.max as number) - numericVal // eslint-disable-line
      }
      props.setGatewayDetails(updatedGatewayDetails)
    }
  }

  const handleAsgInstancesChange = (formik: FormikContext<any>, val: string, instanceType: 'OD' | 'SPOT') => {
    const instanceTypeHandlerMap: Record<string, () => void> = {
      OD: () => {
        handleODChange(formik, val)
      },
      SPOT: () => {
        handleSpotChange(formik, val)
      }
    }
    instanceTypeHandlerMap[instanceType]?.()
  }

  const handleEcsTaskCountUpdate = useCallback(
    _debounce((updatedCount: string) => {
      try {
        const updatedGatewayDetails: GatewayDetails = {
          ...props.gatewayDetails,
          routing: {
            ...props.gatewayDetails.routing,
            container_svc: {
              ...props.gatewayDetails.routing.container_svc,
              task_count: +updatedCount
            }
          }
        }
        props.setGatewayDetails(updatedGatewayDetails)
      } catch (e) {
        showError(getString('ce.co.autoStoppingRule.configuration.step3.invalidValueErrorMsg'))
      }
    }, 500),
    [props.gatewayDetails.routing.container_svc]
  )

  const shouldHide = () => {
    let flag
    if (isGcpProvider && props.selectedResource === RESOURCES.INSTANCES) {
      flag = true
    } else if (props.selectedResource && allowedResources.indexOf(props.selectedResource) === -1) {
      flag = true
    } else {
      flag = false
    }
    return flag
  }

  if (shouldHide()) {
    return null
  }

  return (
    <COGatewayConfigStep
      count={3}
      title={getString(getTitle(props.selectedResource) as keyof StringsMap)}
      onInfoIconClick={() => props.setDrawerOpen(true)}
      subTitle={getString(getSubTitle(props.selectedResource) as keyof StringsMap)}
      totalStepsCount={props.totalStepsCount}
      id={CONFIG_STEP_IDS[2]}
    >
      {(!props.selectedResource || props.selectedResource === RESOURCES.INSTANCES) && (
        <Layout.Vertical>
          <CardSelect
            data={instanceTypeCardData.filter(_instanceType =>
              _instanceType.providers?.includes(props.gatewayDetails.provider.value)
            )}
            className={css.instanceTypeViewGrid}
            onChange={item => {
              setSelectedInstanceType(item)
              props.setGatewayDetails({ ...props.gatewayDetails, fullfilment: (item as CardData).value })
              trackEvent('SelectedInstanceType', { value: _defaultTo(item?.value, '') })
            }}
            renderItem={(item, _) => (
              <Layout.Vertical spacing="large">
                <img src={(item as CardData).icon} alt="" aria-hidden />
              </Layout.Vertical>
            )}
            selected={selectedInstanceType}
            cornerSelected={true}
          ></CardSelect>
          <Layout.Horizontal spacing="small" className={css.instanceTypeNameGrid}>
            {instanceTypeCardData
              .filter(_instanceType => _instanceType.providers?.includes(props.gatewayDetails.provider.value))
              .map(_item => {
                return (
                  <Text font={{ align: 'center' }} style={{ fontSize: 12 }} key={_item.text}>
                    {_item.text}
                  </Text>
                )
              })}
          </Layout.Horizontal>
        </Layout.Vertical>
      )}
      {props.selectedResource === RESOURCES.ASG && (
        <Layout.Horizontal className={css.asgInstanceSelectionContianer}>
          <div className={css.asgInstanceDetails}>
            <Text className={css.asgDetailRow}>
              <span>{`${getString('ce.co.autoStoppingRule.configuration.step3.desiredCapacity')}: `}</span>
              <span>
                {props.gatewayDetails.routing?.instance?.scale_group?.desired ||
                  _defaultTo(props.gatewayDetails.routing.instance.scale_group?.on_demand, 0) +
                    _defaultTo(props.gatewayDetails.routing.instance.scale_group?.spot, 0)}
              </span>
            </Text>
            <Text className={css.asgDetailRow}>
              <span>{`${getString('ce.co.autoStoppingRule.configuration.step3.minCapacity')}: `}</span>
              <span>{props.gatewayDetails.routing?.instance?.scale_group?.min}</span>
            </Text>
            <Text className={css.asgDetailRow}>
              <span>{`${getString('ce.co.autoStoppingRule.configuration.step3.maxCapacity')}: `}</span>
              <span>{props.gatewayDetails.routing?.instance?.scale_group?.max}</span>
            </Text>
          </div>
          <div className={css.asgInstanceFormContainer}>
            <Formik
              initialValues={{
                odInstance: _defaultTo(
                  props.gatewayDetails.routing.instance.scale_group?.on_demand,
                  props.gatewayDetails.routing?.instance?.scale_group?.desired
                ),
                spotInstance: _get(props.gatewayDetails.routing.instance.scale_group, 'spot', 0)
              }}
              formName="odInstance"
              onSubmit={_ => {
                return
              }} // eslint-disable-line
              render={formik => (
                <FormikForm>
                  <Layout.Horizontal style={{ justifyContent: 'space-between' }}>
                    <Layout.Vertical className={css.instanceTypeInput}>
                      <FormInput.Text
                        name={'odInstance'}
                        inputGroup={{ type: 'number', pattern: '[0-9]*' }}
                        label={
                          <Layout.Horizontal>
                            <img src={odIcon} />
                            <Text>On-Demand</Text>
                          </Layout.Horizontal>
                        }
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          handleAsgInstancesChange(formik, e.target.value, 'OD')
                        }
                      />
                    </Layout.Vertical>
                    <Layout.Vertical className={css.instanceTypeInput}>
                      <FormInput.Text
                        name={'spotInstance'}
                        inputGroup={{ type: 'number', pattern: '[0-9]*' }}
                        disabled={!props.gatewayDetails.routing?.instance?.scale_group?.mixed_instance}
                        helperText={
                          !props.gatewayDetails.routing?.instance?.scale_group?.mixed_instance &&
                          getString('ce.co.autoStoppingRule.configuration.step3.policyNotEnabled')
                        }
                        label={
                          <Layout.Horizontal>
                            <img src={spotIcon} />
                            <Text>Spot</Text>
                          </Layout.Horizontal>
                        }
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          handleAsgInstancesChange(formik, e.target.value, 'SPOT')
                        }
                      />
                    </Layout.Vertical>
                  </Layout.Horizontal>
                </FormikForm>
              )}
              validationSchema={Yup.object().shape({
                odInstance: Yup.number()
                  .required()
                  .positive()
                  .min(0)
                  .max(props.gatewayDetails.routing?.instance?.scale_group?.max as number),
                spotInstance: Yup.number()
                  .positive()
                  .min(0)
                  .max(props.gatewayDetails.routing?.instance?.scale_group?.max as number)
              })}
            ></Formik>
          </div>
        </Layout.Horizontal>
      )}
      {props.selectedResource === RESOURCES.ECS && (
        <Container>
          <Formik
            initialValues={{
              taskCount: _defaultTo(props.gatewayDetails.routing.container_svc?.task_count, 1)
            }}
            enableReinitialize
            formName=""
            onSubmit={_ => {
              return
            }}
            validationSchema={Yup.object().shape({
              taskCount: Yup.number()
                .integer(getString('ce.co.autoStoppingRule.configuration.step3.validation.taskCountInteger'))
                .required(getString('ce.co.autoStoppingRule.configuration.step3.validation.taskCountRequired'))
                .positive()
                .min(1, getString('ce.co.autoStoppingRule.configuration.step3.validation.minTaskCount'))
            })}
          >
            {_formikProps => (
              <FormikForm>
                <FormInput.Text
                  name={'taskCount'}
                  inputGroup={{ type: 'number', pattern: '[0-9]*', min: 1 }}
                  label={<Text>{getString('ce.co.autoStoppingRule.configuration.step3.desiredTaskCount')}</Text>}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    _formikProps.setFieldValue('taskCount', +e.target.value)
                    handleEcsTaskCountUpdate(e.target.value)
                  }}
                  style={{ maxWidth: 200 }}
                  disabled={_isEmpty(props.gatewayDetails.routing.container_svc)}
                />
              </FormikForm>
            )}
          </Formik>
        </Container>
      )}
    </COGatewayConfigStep>
  )
}

export default ResourceFulfilment
