/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { render, fireEvent, waitFor } from '@testing-library/react'
import React from 'react'
import { TestWrapper } from '@common/utils/testUtils'
import { Editions } from '@common/constants/SubscriptionTypes'
import { ResourceCenter } from '../ResourceCenter'

jest.mock('refiner-js', () => {
  return jest.fn().mockImplementation((param, callback) => {
    if (param === 'onComplete') {
      callback()
    }
  })
})

describe('ResourceCenter', () => {
  test('Should render resource center properly', () => {
    const { container } = render(
      <TestWrapper>
        <ResourceCenter />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('should render modal when click on icon', async () => {
    const { getByTestId, getByText } = render(
      <TestWrapper>
        <ResourceCenter />
      </TestWrapper>
    )
    fireEvent.click(getByTestId('question'))
    await waitFor(() => {
      expect(getByText('common.resourceCenter.title')).toBeInTheDocument()
    })
  })

  test('should render feedback when click on icon', async () => {
    const featureFlags = {
      SHOW_NG_REFINER_FEEDBACK: true
    }

    const defaultAppStoreValues = {
      featureFlags
    }

    const { getByTestId, getByText } = render(
      <TestWrapper defaultAppStoreValues={defaultAppStoreValues}>
        <ResourceCenter />
      </TestWrapper>
    )

    fireEvent.click(getByTestId('question'))
    fireEvent.click(getByTestId('feedback'))
    await waitFor(() => {
      expect(getByText('common.resourceCenter.feedback.submit')).toBeInTheDocument()
    })
  })

  test('should render community', async () => {
    const defaultLicenseStoreValues = {
      licenseInformation: {
        CD: {
          edition: Editions.COMMUNITY
        }
      }
    }
    const { getByTestId, getByText, queryByText } = render(
      <TestWrapper defaultLicenseStoreValues={defaultLicenseStoreValues}>
        <ResourceCenter />
      </TestWrapper>
    )
    fireEvent.click(getByTestId('question'))
    await waitFor(() => {
      expect(getByText('common.resourceCenter.ticketmenu.submit')).toBeInTheDocument()
      expect(queryByText('common.resourceCenter.ticketmenu.tickets')).not.toBeInTheDocument()
    })
  })
})
