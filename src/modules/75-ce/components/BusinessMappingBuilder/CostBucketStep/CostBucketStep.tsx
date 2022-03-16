import { Collapse } from '@blueprintjs/core'
import { Container, Card, Layout, FlexExpander, Text, Button, FontVariation, ButtonSize } from '@harness/uicore'
import { FieldArray } from 'formik'

import React, { useState } from 'react'
import { EMPTY_PERSPECTIVE_RULE } from '@ce/utils/perspectiveUtils'
import type { CostBucketWidgetType } from '@ce/types'
import { useStrings } from 'framework/strings'
import CostBucketBuilder from '../CostBucketBuilder'
import { getCostBucketTitleMap, getNewBucketButtonText } from '../constants'
import css from './CostBucketStep.module.scss'
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd'
import { onDragEnd } from '@pipeline/components/InputSetSelector/utils'

interface CostBucketStepProps {
  formikProps: any
  fieldValuesList: any
  namespace: string
  value: any
  isSharedCost?: boolean
  widgetType: CostBucketWidgetType
}

const CostBucketStep: (props: CostBucketStepProps) => React.ReactElement = ({
  formikProps,
  fieldValuesList,
  namespace,
  value,
  isSharedCost,
  widgetType
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(true)
  const { getString } = useStrings()
  const titleMap = getCostBucketTitleMap(getString)
  const newBucketButtonText = getNewBucketButtonText(getString)

  const onDragEnd = () => {}
  return (
    <Card className={css.container}>
      <FieldArray
        name={namespace}
        render={arrayHelper => {
          const addNewCostBucket = () => {
            arrayHelper.push({
              name: '',
              rules: [
                {
                  viewConditions: [EMPTY_PERSPECTIVE_RULE]
                }
              ]
            })
          }

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
                    {titleMap[widgetType]}
                  </Text>
                  <FlexExpander />
                  {value.length > 0 ? (
                    <Button
                      icon="plus"
                      text={newBucketButtonText[widgetType]}
                      minimal
                      size={ButtonSize.SMALL}
                      onClick={addNewCostBucket}
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
                  <DragDropContext
                    onDragEnd={(result: DropResult) => {
                      if (!result.destination) {
                        return
                      }
                      const res = Array.from(value)
                      const [removed] = res.splice(result.source.index, 1)
                      res.splice(result.destination.index, 0, removed)
                      formikProps.setFieldValue(namespace, res as any)
                    }}
                  >
                    <Droppable droppableId={`droppable-${namespace}`} type={`cost-bucket-${namespace}`}>
                      {provided => (
                        <div ref={provided.innerRef}>
                          {value.map((value, index) => {
                            const removeCostBucket = () => {
                              arrayHelper.remove(index)
                            }
                            return (
                              <CostBucketBuilder
                                namespace={namespace}
                                key={`${namespace}-${index}`}
                                removeCostBucket={removeCostBucket}
                                value={value}
                                index={index}
                                fieldValuesList={fieldValuesList}
                                setFieldValue={formikProps.setFieldValue}
                                isSharedCost={isSharedCost}
                                widgetType={widgetType}
                              />
                            )
                          })}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                  {value.length < 1 ? (
                    <Button
                      icon="plus"
                      text={newBucketButtonText[widgetType]}
                      minimal
                      margin={{
                        top: 'medium'
                      }}
                      size={ButtonSize.SMALL}
                      onClick={addNewCostBucket}
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
