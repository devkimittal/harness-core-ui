import { Button, Container, FlexExpander, Formik, FormikForm, Layout, Accordion, Text, Icon } from '@harness/uicore'
import { FieldArray } from 'formik'
import React from 'react'
import { useFetchViewFieldsQuery, QlceViewFilterWrapperInput, QlceViewFieldIdentifierData } from 'services/ce/services'
import CostBucketBuilder from './CostBucketBuilder'
import CostBucketStep from './CostBucketStep/CostBucketStep'

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
  console.log(fieldValuesList)

  return (
    <Container padding="large">
      <Layout.Horizontal>
        <FlexExpander />
        <Button icon="upload-box" intent="primary" text={'Save Business Mapping'} />
      </Layout.Horizontal>
      <Formik
        formName="createBusinessMapping"
        initialValues={{
          costTargets: []
        }}
        render={formikProps => {
          return (
            <FormikForm>
              <CostBucketStep formikProps={formikProps} fieldValuesList={fieldValuesList} />
            </FormikForm>
          )
        }}
      ></Formik>
    </Container>
  )
}

export default BusinessMappingBuilder
