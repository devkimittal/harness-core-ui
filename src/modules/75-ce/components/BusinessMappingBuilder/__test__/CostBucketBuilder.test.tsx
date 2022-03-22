/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import { Provider } from 'urql'
import { fromValue } from 'wonka'
import { Droppable, DragDropContext } from 'react-beautiful-dnd'
import { TestWrapper } from '@common/utils/testUtils'
import { CostBucketWidgetType } from '@ce/types'
import CostBucketBuilder from '../CostBucketBuilder'

const setFieldValue = jest.fn()
const removeCostBucket = jest.fn()

const props: any = {
  index: 0,
  value: {
    isOpen: true,
    isViewerOpen: false,
    name: 'Rule1',
    rules: [
      {
        viewConditions: [
          {
            values: ['d', 'e', 'f'],
            viewOperator: 'IN',
            viewField: {
              fieldId: 'product',
              fieldName: 'Product',
              identifier: 'COMMON',
              identifierName: 'Common'
            }
          }
        ]
      }
    ],
    strategy: 'Fixed'
  },
  namespace: 'costBucket',
  isSharedCost: true,
  widgetType: CostBucketWidgetType.SharedCostBucket,
  validateField: jest.fn(),
  setFieldValue: setFieldValue,
  removeCostBucket: removeCostBucket
}

describe('test cases for Cost Bucket Builder', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  test('should be able to render', () => {
    const responseState = {
      executeQuery: () => {
        return fromValue({})
      }
    }

    const { container } = render(
      <TestWrapper>
        <Provider value={responseState as any}>
          <DragDropContext onDragEnd={jest.fn()}>
            <Droppable droppableId="test">
              {provided => (
                <div ref={provided.innerRef}>
                  <CostBucketBuilder {...props} />{' '}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </Provider>
      </TestWrapper>
    )
    expect(container.querySelector('[class*="operandSelectorContainer"]')).toBeInTheDocument()
  })

  test('should be able to render and close it when tick icon clicked', () => {
    const responseState = {
      executeQuery: () => {
        return fromValue({})
      }
    }

    const { container } = render(
      <TestWrapper>
        <Provider value={responseState as any}>
          <DragDropContext onDragEnd={jest.fn()}>
            <Droppable droppableId="test">
              {provided => (
                <div ref={provided.innerRef}>
                  <CostBucketBuilder {...props} />{' '}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </Provider>
      </TestWrapper>
    )
    fireEvent.click(container.querySelector('[icon="tick"]')!)
    expect(setFieldValue).toBeCalledWith('costBucket[0].isOpen', false)
  })

  test('should be able to render and remove the item', () => {
    const responseState = {
      executeQuery: () => {
        return fromValue({})
      }
    }

    const { container } = render(
      <TestWrapper>
        <Provider value={responseState as any}>
          <DragDropContext onDragEnd={jest.fn()}>
            <Droppable droppableId="test">
              {provided => (
                <div ref={provided.innerRef}>
                  <CostBucketBuilder {...props} />{' '}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </Provider>
      </TestWrapper>
    )
    fireEvent.click(container.querySelector('[icon="cross"]')!)
    expect(removeCostBucket).toBeCalledTimes(1)
  })

  test('should be able to render when edit mode is false', () => {
    const responseState = {
      executeQuery: () => {
        return fromValue({})
      }
    }

    const newProps = {
      ...props,
      value: {
        ...props.value,
        isOpen: false
      }
    }

    const { container } = render(
      <TestWrapper>
        <Provider value={responseState as any}>
          <DragDropContext onDragEnd={jest.fn()}>
            <Droppable droppableId="test">
              {provided => (
                <div ref={provided.innerRef}>
                  <CostBucketBuilder {...newProps} />
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </Provider>
      </TestWrapper>
    )
    fireEvent.click(container.querySelector('[data-icon="Edit"]')!)
    expect(setFieldValue).toBeCalledWith('costBucket[0].isOpen', true)
  })

  test('should be able to render when edit mode is false and should be able to open rule viewer', () => {
    const responseState = {
      executeQuery: () => {
        return fromValue({})
      }
    }

    const newProps = {
      ...props,
      value: {
        ...props.value,
        isOpen: false
      }
    }

    const { container } = render(
      <TestWrapper>
        <Provider value={responseState as any}>
          <DragDropContext onDragEnd={jest.fn()}>
            <Droppable droppableId="test">
              {provided => (
                <div ref={provided.innerRef}>
                  <CostBucketBuilder {...newProps} />
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </Provider>
      </TestWrapper>
    )
    fireEvent.click(container.querySelector('[data-icon="chevron-down"]')!)
    expect(setFieldValue).toBeCalledWith('costBucket[0].isViewerOpen', true)
  })

  test('should be able to render when edit mode is false and viewer is open and should be able to close it', () => {
    const responseState = {
      executeQuery: () => {
        return fromValue({})
      }
    }

    const newProps = {
      ...props,
      value: {
        ...props.value,
        isOpen: false,
        isViewerOpen: true
      }
    }

    const { container } = render(
      <TestWrapper>
        <Provider value={responseState as any}>
          <DragDropContext onDragEnd={jest.fn()}>
            <Droppable droppableId="test">
              {provided => (
                <div ref={provided.innerRef}>
                  <CostBucketBuilder {...newProps} />
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </Provider>
      </TestWrapper>
    )
    fireEvent.click(container.querySelector('[data-icon="chevron-up"]')!)
    expect(setFieldValue).toBeCalledWith('costBucket[0].isViewerOpen', false)
  })
})
