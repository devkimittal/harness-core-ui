import { Collapse } from '@blueprintjs/core'
import {
  Container,
  Card,
  Layout,
  FlexExpander,
  Icon,
  Text,
  Button,
  Color,
  FontVariation,
  ButtonSize
} from '@harness/uicore'
import { FieldArray } from 'formik'

import React, { useState } from 'react'
import CostBucketBuilder from '../CostBucketBuilder'
import css from './CostBucketStep.module.scss'

const CostBucketStep = ({ formikProps, fieldValuesList }) => {
  const [isOpen, setIsOpen] = useState<boolean>(true)
  return (
    <Card className={css.container}>
      <FieldArray
        name="costTargets"
        render={arrayHelper => {
          const costTargetsValue = formikProps.values.costTargets
          return (
            <Container>
              <Container>
                <Layout.Horizontal className={css.headerContainer}>
                  <Text font={{ variation: FontVariation.SMALL }}>Step 1 of 3</Text>
                  <FlexExpander />
                  <Button
                    icon={isOpen ? 'chevron-up' : 'chevron-down'}
                    iconProps={{
                      size: 20
                    }}
                    minimal
                    intent="primary"
                    onClick={() => {
                      setIsOpen(val => !val)
                    }}
                  />
                </Layout.Horizontal>
                <Layout.Horizontal className={css.headerContainer}>
                  <Text
                    padding={{
                      top: 'small'
                    }}
                    font={{ variation: FontVariation.CARD_TITLE }}
                  >
                    Define Cost Buckets
                  </Text>
                  <FlexExpander />
                  {costTargetsValue.length > 0 ? (
                    <Button
                      icon="plus"
                      text="New Cost Bucket"
                      minimal
                      size={ButtonSize.SMALL}
                      onClick={() => {
                        arrayHelper.push({
                          name: '',
                          rules: [
                            {
                              viewConditions: [
                                {
                                  type: 'VIEW_ID_CONDITION',
                                  viewField: {
                                    fieldId: '',
                                    fieldName: '',
                                    identifier: '',
                                    identifierName: ''
                                  },
                                  viewOperator: 'IN',
                                  values: []
                                }
                              ]
                            }
                          ]
                        })
                      }}
                    />
                  ) : null}
                </Layout.Horizontal>
              </Container>

              <Collapse isOpen={isOpen} keepChildrenMounted>
                <Container
                  margin={{
                    top: 'medium'
                  }}
                  border={{
                    top: true
                  }}
                >
                  {costTargetsValue.map((value, index) => {
                    const removeCostBucket = () => {
                      arrayHelper.remove(index)
                    }
                    return (
                      <CostBucketBuilder
                        key={`cost-filter-${index}`}
                        removeCostBucket={removeCostBucket}
                        value={value}
                        index={index}
                        fieldValuesList={fieldValuesList}
                        setFieldValue={formikProps.setFieldValue}
                      />
                    )
                  })}
                  {costTargetsValue.length < 1 ? (
                    <Button
                      icon="plus"
                      text="New Cost Bucket"
                      minimal
                      margin={{
                        top: 'medium'
                      }}
                      size={ButtonSize.SMALL}
                      onClick={() => {
                        arrayHelper.push({
                          name: '',
                          rules: [
                            {
                              viewConditions: [
                                {
                                  type: 'VIEW_ID_CONDITION',
                                  viewField: {
                                    fieldId: '',
                                    fieldName: '',
                                    identifier: '',
                                    identifierName: ''
                                  },
                                  viewOperator: 'IN',
                                  values: []
                                }
                              ]
                            }
                          ]
                        })
                      }}
                    />
                  ) : null}
                </Container>
              </Collapse>
            </Container>
          )
        }}
      />
    </Card>
  )
}

export default CostBucketStep
