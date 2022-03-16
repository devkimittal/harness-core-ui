import React from 'react'
import {
  Button,
  Container,
  FlexExpander,
  Formik,
  FormikForm,
  Layout,
  Accordion,
  Text,
  Icon,
  FormInput
} from '@harness/uicore'
import { useFetchViewFieldsQuery, QlceViewFilterWrapperInput, QlceViewFieldIdentifierData } from 'services/ce/services'
import { CostBucketWidgetType } from '@ce/types'
import CostBucketStep from './CostBucketStep/CostBucketStep'
import css from './BusinessMappingBuilder.module.scss'

/**
 * 
 export interface BusinessMapping {
  accountId?: string
  costTargets?: CostTarget[]
  createdAt?: number
  createdBy?: EmbeddedUser
  lastUpdatedAt?: number
  lastUpdatedBy?: EmbeddedUser
  name?: string
  sharedCosts?: SharedCost[]
  uuid?: string
}
 */

const BusinessMappingBuilder: () => React.ReactElement = () => {
  const [{ data }] = useFetchViewFieldsQuery({
    variables: {
      filters: [
        { viewMetadataFilter: { viewId: 'EUbryakiRBa59e0yXv_tww', isPreview: true } } as QlceViewFilterWrapperInput
      ]
    }
  })

  const fieldValuesList = data?.perspectiveFields?.fieldIdentifierData as QlceViewFieldIdentifierData[]

  return (
    <Formik
      formName="createBusinessMapping"
      initialValues={{
        costTargets: [],
        sharedCosts: []
      }}
      render={formikProps => {
        return (
          <FormikForm>
            <Layout.Horizontal
              padding="large"
              border={{
                bottom: true
              }}
            >
              <FormInput.Text name="name" placeholder="Enter Business Mapping Name" />
              <FlexExpander />
              <Button icon="upload-box" intent="primary" text={'Save Business Mapping'} />
            </Layout.Horizontal>
            <Container
              className={css.container}
              padding={{
                left: 'large',
                right: 'large',
                bottom: 'large'
              }}
            >
              <CostBucketStep
                formikProps={formikProps}
                namespace={'costTargets'}
                value={formikProps.values.costTargets}
                fieldValuesList={fieldValuesList}
                widgetType={CostBucketWidgetType.CostBucket}
              />
              <CostBucketStep
                formikProps={formikProps}
                namespace={'sharedCosts'}
                value={formikProps.values.sharedCosts}
                fieldValuesList={fieldValuesList}
                isSharedCost={true}
                widgetType={CostBucketWidgetType.SharedCostBucket}
              />
            </Container>
          </FormikForm>
        )
      }}
    ></Formik>
  )
}

export default BusinessMappingBuilder
