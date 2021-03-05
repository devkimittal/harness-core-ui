import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { NewRelicMonitoringSource } from '../NewRelicMonitoringSource'

describe('Unit tests for NewRelicMonitoringSources', () => {
  test('Ensure basic render works', async () => {
    const { container } = render(
      <TestWrapper>
        <NewRelicMonitoringSource />
      </TestWrapper>
    )
    await waitFor(() => expect(container.querySelector('.bp3-tabs')).not.toBeNull())
  })
})
