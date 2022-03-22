/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  Button,
  Container,
  FlexExpander,
  Formik,
  FormikForm,
  Layout,
  FormInput,
  Color,
  useToaster,
  getErrorInfoFromErrorObject
} from '@harness/uicore'
import * as Yup from 'yup'
import { useParams } from 'react-router-dom'
import { get } from 'lodash-es'
import { useFetchViewFieldsQuery, QlceViewFieldIdentifierData } from 'services/ce/services'
import { CostBucketWidgetType, CostTargetType, SharedCostType } from '@ce/types'
import { useCreateBusinessMapping } from 'services/ce'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import CostBucketStep from './CostBucketStep/CostBucketStep'
import Step from './Step/Step'
import ManageUnallocatedCost from './ManageUnallocatedCost/ManageUnallocatedCost'
import css from './BusinessMappingBuilder.module.scss'

interface BusinessMappingForm {
  costTargets: Array<CostTargetType>
  sharedCosts: Array<SharedCostType>
  costTargetsKey?: number
  sharedCostsKey?: number
  accountId?: string
}

const BusinessMappingBuilder: () => React.ReactElement = () => {
  const { accountId } = useParams<AccountPathProps>()
  const { showError } = useToaster()
  const [{ data }] = useFetchViewFieldsQuery({
    variables: {
      filters: []
    }
  })

  const { getString } = useStrings()

  const { mutate } = useCreateBusinessMapping({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const fieldValuesList = get(data, 'perspectiveFields.fieldIdentifierData') as QlceViewFieldIdentifierData[]

  const validationSchema = Yup.object().shape({
    name: Yup.string().trim().required(),
    costTargets: Yup.array().of(
      Yup.object().shape({
        name: Yup.string().trim().required(),
        rules: Yup.array()
          .of(
            Yup.object().shape({
              viewConditions: Yup.array().of(
                Yup.object().shape({
                  viewOperator: Yup.string(),
                  viewField: Yup.object().shape({
                    fieldId: Yup.string().required(),
                    fieldName: Yup.string(),
                    identifier: Yup.string().required(),
                    identifierName: Yup.string().nullable()
                  }),
                  values: Yup.array()
                    .of(Yup.string())
                    .min(1, getString('ce.businessMapping.errorMessages.viewConditions'))
                })
              )
            })
          )
          .required()
      })
    )
  })

  /* istanbul ignore next */
  const handleSubmit: (values: BusinessMappingForm) => void = async values => {
    delete values.costTargetsKey
    delete values.sharedCostsKey

    values.accountId = accountId

    values.costTargets.forEach(costTarget => {
      delete costTarget.isOpen
      delete costTarget.isViewerOpen
      delete (costTarget as SharedCostType).strategy
    })

    values.sharedCosts.forEach(costTarget => {
      delete costTarget.isOpen
      delete costTarget.isViewerOpen
    })

    try {
      await mutate(values, {
        queryParams: {
          accountIdentifier: accountId
        }
      })
    } catch (e) {
      showError(getErrorInfoFromErrorObject(e))
    }
  }

  return (
    <Formik<BusinessMappingForm>
      formName="createBusinessMapping"
      validationSchema={validationSchema}
      initialValues={{
        costTargets: [],
        sharedCosts: [],
        costTargetsKey: 0,
        sharedCostsKey: 0
      }}
      onSubmit={
        /* istanbul ignore next */ values => {
          handleSubmit(values)
        }
      }
      render={formikProps => {
        return (
          <FormikForm>
            <Layout.Horizontal
              padding="large"
              border={{
                bottom: true
              }}
            >
              <FormInput.Text
                name="name"
                placeholder={getString('ce.businessMapping.form.businessMappingPlaceholder')}
              />
              <FlexExpander />
              <Button
                icon="upload-box"
                intent="primary"
                text={getString('ce.businessMapping.form.saveText')}
                type="submit"
              />
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
                stepProps={{
                  color: Color.GREEN_900,
                  background: Color.GREEN_100,
                  total: 3,
                  current: 1,
                  defaultOpen: true
                }}
              />
              <CostBucketStep
                formikProps={formikProps}
                namespace={'sharedCosts'}
                value={formikProps.values.sharedCosts}
                fieldValuesList={fieldValuesList}
                isSharedCost={true}
                widgetType={CostBucketWidgetType.SharedCostBucket}
                stepProps={{
                  color: Color.PURPLE_900,
                  background: Color.PURPLE_100,
                  total: 3,
                  current: 2,
                  defaultOpen: false
                }}
              />
              <Step
                stepProps={{
                  color: Color.YELLOW_900,
                  background: Color.YELLOW_100,
                  total: 3,
                  current: 3,
                  defaultOpen: false
                }}
                title={getString('ce.businessMapping.manageUnallocatedCost.title')}
              >
                <ManageUnallocatedCost />
              </Step>
            </Container>
          </FormikForm>
        )
      }}
    ></Formik>
  )
}

export default BusinessMappingBuilder
