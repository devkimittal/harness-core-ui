import React from 'react'
import {
  Button,
  Formik,
  FormikForm,
  FormInput,
  Heading,
  Layout,
  Text,
  // ModalErrorHandler,
  StepProps,
  Container
  // Icon
} from '@wings-software/uicore'

// import * as Yup from 'yup'
import cx from 'classnames'

import type { ConnectorInfoDTO } from 'services/cd-ng' //ConnectorConfigDTO
import css from '../../CreateCeAzureConnector.module.scss'

interface BillingForm {
  storageAccount: string
  subscriptionId: string
  storageContainer: string
  storageDir: string
}

const BillingExport: React.FC<StepProps<ConnectorInfoDTO>> = props => {
  const billingExportExists = false

  return (
    <Layout.Vertical className={css.stepContainer}>
      <Heading level={2} className={css.header}>
        Azure Billing Export
      </Heading>
      <Text className={css.subHeader}>
        Billing export is used to get insights into your cloud infrastructure and Azure services such as Storage
        account, Virtual machines, Containers etc.
      </Text>
      {billingExportExists ? <Show /> : <Create {...props} />}
    </Layout.Vertical>
  )
}

const Create: React.FC<StepProps<ConnectorInfoDTO>> = props => {
  const { prevStepData, previousStep } = props

  const handleSubmit = (formData: BillingForm) => {
    // FIX this!
    return { ...formData }
  }

  return (
    <Container>
      <Text
        font="small"
        className={css.info}
        color="primary7"
        inline
        icon="info-sign"
        iconProps={{ size: 15, color: 'primary7' }}
      >
        Please follow the instructions to provide access to the Billing export for the specified tenant ID
      </Text>
      <Container className={css.launchTemplateSection}>
        <Layout.Vertical spacing="xsmall">
          <Button
            type="submit"
            withoutBoxShadow={true}
            className={css.launchTemplateBtn}
            text={'Launch Azure Billing Exports'}
            onClick={() => {
              previousStep?.(prevStepData)
            }}
          />
          <Text font="small" style={{ textAlign: 'center' }}>
            and login to your master account
          </Text>
        </Layout.Vertical>
      </Container>
      <Container>
        <Formik<BillingForm>
          onSubmit={formData => {
            handleSubmit(formData)
          }}
          formName="connectorOverviewForm"
          // validationSchema={Yup.object().shape({
          //   name: NameSchema(),
          //   identifier: IdentifierSchema()
          // })}
          initialValues={{
            storageAccount: props.prevStepData?.spec?.storageAccount || '',
            subscriptionId: props.prevStepData?.spec?.subscriptionId || '',
            storageContainer: props.prevStepData?.spec?.storageContainer || '',
            storageDir: props.prevStepData?.spec?.storageDir || ''
          }}
        >
          {() => {
            return (
              <FormikForm style={{ padding: '10px 0 25px' }}>
                <Container style={{ minHeight: 300 }}>
                  <Container className={cx(css.main, css.dataFields)}>
                    <FormInput.Text name={'storageAccount'} label={'Storage Account Name'} />
                    <FormInput.Text name={'subscriptionId'} label={'Storage Account Subscription ID'} />
                    <FormInput.Text name={'storageContainer'} label={'Storage Container'} />
                    <FormInput.Text name={'storageDir'} label={'Storage Directory'} />
                  </Container>
                </Container>
                <Layout.Horizontal spacing="medium" className={css.continueAndPreviousBtns}>
                  <Button text="Previous" icon="chevron-left" onClick={() => previousStep?.(prevStepData)} />
                  <Button type="submit" intent="primary" rightIcon="chevron-right" disabled={false}>
                    Continue
                  </Button>
                </Layout.Horizontal>
              </FormikForm>
            )
          }}
        </Formik>
      </Container>
    </Container>
  )
}

const MockData = [
  {
    label: 'Tenant ID',
    value: 'jfgoknklsl072977647515'
  },
  {
    label: 'Storage account name',
    value: 'storage-account-name'
  },
  {
    label: 'Storage account Subrscription ID',
    value: 'azure-subscription-name'
  },
  {
    label: 'Storage Container',
    value: 'prod-setup-205416'
  },
  {
    label: 'Storage Directory',
    value: 'billing-prod-all-projects'
  }
]

const Show: React.FC<StepProps<ConnectorInfoDTO>> = props => {
  const { prevStepData, previousStep, nextStep } = props
  return (
    <Container>
      <Text
        font="small"
        className={css.info}
        color="green700"
        inline
        icon="tick-circle"
        iconProps={{ size: 15, color: 'green700' }}
      >
        A Billing Export exists for this account. You may proceed to the next step.
      </Text>
      <Container className={css.billingExportCtn}>
        {MockData.map((data, idx) => {
          return (
            <div key={idx} className={css.billingCredentials}>
              <span>{data.label}</span>
              <span>{data.value}</span>
            </div>
          )
        })}
      </Container>
      <Layout.Horizontal spacing="medium" className={css.continueAndPreviousBtns}>
        <Button text="Previous" icon="chevron-left" onClick={() => previousStep?.(prevStepData)} />
        <Button text="Continue" rightIcon="chevron-right" onClick={() => nextStep?.(prevStepData)} intent="primary" />
      </Layout.Horizontal>
    </Container>
  )
}

export default BillingExport
