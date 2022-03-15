import { DEFAULT_TIME_RANGE } from '@ce/utils/momentUtils'
import {
  Container,
  FlexExpander,
  Icon,
  Layout,
  Button,
  TextInput,
  Card,
  FormInput,
  Color,
  ButtonVariation
} from '@harness/uicore'
import { FieldArray } from 'formik'
import React, { useState } from 'react'
import PerspectiveBuilderFilters from '../PerspectiveBuilderFilters/PerspectiveBuilderFilters'
import css from './CostBucketBuilder.module.scss'

const CostBucketBuilder: () => React.ReactElement = ({
  fieldValuesList,
  value,
  index,
  setFieldValue,
  removeCostBucket
}) => {
  const [isEditOpen, setIsEditOpen] = useState(true)

  return (
    <Card className={css.mainContainer}>
      <Layout.Horizontal
        background={isEditOpen ? Color.PRIMARY_1 : Color.GREY_100}
        className={css.costBucketNameContainet}
      >
        <FormInput.Text
          name={`costTargets[${index}].name`}
          placeholder={'Cost Bucket Name'}
          className={css.nameInput}
        />
        <FlexExpander />
        {isEditOpen ? (
          <>
            <Button
              icon="tick"
              iconProps={{
                size: 20
              }}
              minimal
              intent="primary"
              onClick={() => {
                setIsEditOpen(val => !val)
              }}
            />
            <Button
              icon="cross"
              iconProps={{
                size: 20
              }}
              minimal
              intent="primary"
              onClick={() => {
                removeCostBucket()
              }}
            />
          </>
        ) : (
          <>
            <Button
              icon="Edit"
              iconProps={{
                size: 16
              }}
              minimal
              intent="primary"
              onClick={() => {
                setIsEditOpen(val => !val)
              }}
            />
          </>
        )}
      </Layout.Horizontal>
      {isEditOpen ? (
        <Container
          background={Color.PRIMARY_BG}
          padding={{
            top: 'xsmall',
            left: 'medium',
            right: 'medium',
            bottom: 'medium'
          }}
        >
          <FieldArray
            name={`costTargets[${index}].rules`}
            render={arrayHelper => {
              return (
                <Container>
                  {value.rules.map((rule, index1) => {
                    const indexCopy = index1

                    const removeRow: () => void = () => {
                      arrayHelper.remove(index1)
                    }

                    const setField = (id, data) => {
                      setFieldValue(`costTargets[${index}].rules[${indexCopy}].viewConditions[${id}]`, data)
                    }

                    return (
                      <PerspectiveBuilderFilters
                        key={`rules-${index1}`}
                        index={index1}
                        setFieldValue={setField}
                        removeEntireRow={removeRow}
                        fieldValuesList={fieldValuesList}
                        showAndOperator={true}
                        timeRange={DEFAULT_TIME_RANGE}
                        filterValue={rule.viewConditions}
                        fieldName={`costTargets[${index}].rules[${index1}]viewConditions`}
                      />
                    )
                  })}
                  <Button
                    icon="add"
                    margin={{
                      top: 'small',
                      bottom: 'small'
                    }}
                    variation={ButtonVariation.SECONDARY}
                    text="OR"
                    onClick={() => {
                      arrayHelper.push({
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
                      })
                    }}
                  />
                </Container>
              )
            }}
          />

          {/* {<FieldArray name={`costTargets[${index}]`} render={arrayHelper => {}} />} */}
          {/* <PerspectiveBuilderFilters
          index={index}
          fieldValuesList={fieldValuesList}
          showAndOperator={true}
          timeRange={DEFAULT_TIME_RANGE}
          filterValue={value.rules}
        /> */}
        </Container>
      ) : null}
    </Card>
  )
}

export default CostBucketBuilder
