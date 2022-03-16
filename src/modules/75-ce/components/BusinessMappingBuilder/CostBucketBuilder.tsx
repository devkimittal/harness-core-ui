import { Container, FlexExpander, Layout, Button, Card, FormInput, Color, Icon, ButtonVariation } from '@harness/uicore'
import { FieldArray } from 'formik'
import React, { useState } from 'react'
import { Draggable } from 'react-beautiful-dnd'
import { DEFAULT_TIME_RANGE } from '@ce/utils/momentUtils'
import { EMPTY_PERSPECTIVE_RULE } from '@ce/utils/perspectiveUtils'
import type { CostBucketWidgetType } from '@ce/types'
import { useStrings } from 'framework/strings'
import PerspectiveBuilderFilters from '../PerspectiveBuilderFilters/PerspectiveBuilderFilters'
import { getBucketNameText } from './constants'
import css from './CostBucketBuilder.module.scss'

interface CostBucketBuilderProps {
  fieldValuesList: any
  value: any
  index: number
  setFieldValue: any
  removeCostBucket: any
  namespace: string
  isSharedCost?: boolean
  widgetType: CostBucketWidgetType
}

const CostBucketBuilder: (props: CostBucketBuilderProps) => React.ReactElement = ({
  fieldValuesList,
  value,
  index,
  setFieldValue,
  removeCostBucket,
  namespace,
  isSharedCost,
  widgetType
}) => {
  const [isEditOpen, setIsEditOpen] = useState(true)
  const { getString } = useStrings()
  const bucketNameText = getBucketNameText(getString)

  return (
    <Draggable key={`draggable-${namespace}-${index}`} draggableId={`${namespace}-${index}`} index={index}>
      {provided => (
        <Container ref={provided.innerRef} {...provided.draggableProps} className={css.drag}>
          <Card className={css.mainContainer}>
            <Layout.Horizontal
              background={isEditOpen ? Color.PRIMARY_1 : Color.GREY_100}
              className={css.costBucketNameContainet}
            >
              <Container {...provided.dragHandleProps}>
                <Icon
                  name="drag-handle-vertical"
                  margin={{
                    top: 'xsmall'
                  }}
                  size={24}
                  color={Color.GREY_300}
                />
              </Container>
              <FormInput.Text
                name={`${namespace}[${index}].name`}
                placeholder={bucketNameText[widgetType]}
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
                  name={`${namespace}[${index}].rules`}
                  render={arrayHelper => {
                    return (
                      <Container>
                        {value.rules.map((rule, index1) => {
                          const indexCopy = index1

                          const removeRow: () => void = () => {
                            arrayHelper.remove(index1)
                          }

                          const setField = (id, data) => {
                            setFieldValue(`${namespace}[${index}].rules[${indexCopy}].viewConditions[${id}]`, data)
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
                              fieldName={`${namespace}[${index}].rules[${index1}]viewConditions`}
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
                              viewConditions: [EMPTY_PERSPECTIVE_RULE]
                            })
                          }}
                        />
                      </Container>
                    )
                  }}
                />

                {isSharedCost ? (
                  <Container
                    border={{
                      top: true
                    }}
                    margin={{
                      top: 'medium'
                    }}
                    padding={{
                      top: 'medium'
                    }}
                  >
                    <FormInput.RadioGroup
                      name={`${namespace}[${index}].strategy`}
                      label="Sharing Strategy"
                      items={[
                        {
                          label: getString('ce.businessMapping.sharedCostBucket.sharingStrategy.equal'),
                          value: 'FIXED'
                        },
                        {
                          label: getString('ce.businessMapping.sharedCostBucket.sharingStrategy.proportional'),
                          value: 'PROPORTIONAL'
                        },
                        {
                          label: getString('ce.businessMapping.sharedCostBucket.sharingStrategy.fixed'),
                          value: '-',
                          disabled: true
                        }
                      ]}
                    />
                  </Container>
                ) : null}
              </Container>
            ) : null}
          </Card>
        </Container>
      )}
    </Draggable>
  )
}

export default CostBucketBuilder
