/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import * as lwServices from 'services/lw'
import type { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import type { CheckFeatureReturn } from 'framework/featureStore/featureStoreUtil'
import { TestWrapper } from '@common/utils/testUtils'
import COGatewayList from '../COGatewayList'

const testpath = '/account/:accountId/ce/orgs/:orgIdentifier/projects/:projectIdentifier/autostopping-rules/create'
const testparams = { accountId: 'accountId', orgIdentifier: 'orgIdentifier', projectIdentifier: 'projectIdentifier' }
const checkFeatureReturnMock = {
  enabled: true
}
const checkFeatureDisabledReturnMock = { featureEnabled: true, disabledFeatureName: null }

jest.mock('highcharts-react-official', () => () => <></>)

// jest.mock()

jest.mock('@common/hooks/useFeatures', () => {
  return {
    useFeature: () => {
      return checkFeatureReturnMock
    },
    useGetFirstDisabledFeature: () => {
      return checkFeatureDisabledReturnMock
    },
    useFeatures: () => {
      return { features: new Map<FeatureIdentifier, CheckFeatureReturn>() }
    }
  }
})

const mockedK8sServiceData = {
  id: 282,
  name: 'ravi-test-13',
  fulfilment: 'kubernetes',
  kind: 'k8s',
  cloud_account_id: 'Lightwing_Non_prod_old',
  idle_time_mins: 15,
  host_name: 'grateful-liger-c40gjtnsbqnjmr91f8n0.gateway.lightwing.io',
  custom_domains: null,
  match_all_subdomains: false,
  disabled: false,
  created_by: 'lv0euRhKRCyiXWzS7pOg6g',
  routing: {
    instance: null,
    lb: null,
    k8s: {
      RuleJson:
        '{"apiVersion":"lightwing.lightwing.io/v1","kind":"AutoStoppingRule","metadata":{"name":"ravi-test-13","annotations":{"harness.io/cloud-connector-id":"Lightwing_Non_prod_old","nginx.ingress.kubernetes.io/configuration-snippet":"more_set_input_headers \\"AutoStoppingRule: undefined-undefined-ravi-test-13\\";"}},"spec":{"idleTimeMins":15,"rules":[{"host":"caddyravi.cedevkubetest1.lightwingtest.com","http":{"paths":[{"path":"/","pathType":"Prefix","backend":{"service":{"name":"caddy","port":{"number":80}}}}]}}]}}'
    },
    ports: []
  },
  health_check: {
    protocol: 'http',
    path: '/',
    port: 80,
    timeout: 30,
    id: ''
  },
  opts: {
    preserve_private_ip: false,
    delete_cloud_resources: false,
    always_use_private_ip: false
  },
  metadata: {
    custom_domain_providers: null,
    target_group_details: null,
    access_details: {
      backgroundTasks: {
        selected: false
      },
      dnsLink: {
        selected: false
      },
      ipaddress: {
        selected: false
      },
      rdp: {
        selected: false
      },
      ssh: {
        selected: false
      }
    },
    cloud_provider_details: {
      name: 'Lightwing Non prod old'
    },
    service_errors: null,
    kubernetes_connector_id: 'Ravi_test_14',
    health_check_details: null
  },
  access_point_id: null,
  status: 'created',
  created_at: '2021-07-28T07:40:38.420773Z',
  updated_at: '2021-07-28T07:40:38.420773Z',
  account_identifier: 'kmpySmUISimoRrJL6NL73w'
}

const mockedInstanceServiceData = {
  id: 6115,
  name: 'test',
  fulfilment: 'ondemand',
  kind: 'instance',
  cloud_account_id: 'Lightwing_Non_Prod',
  idle_time_mins: 15,
  host_name: 'mighty-crawdad-c8e9dq1jlfm8dqjkon8g.sandeep.lightwing.io',
  custom_domains: null,
  match_all_subdomains: false,
  disabled: false,
  created_by: '-R-sOjJhQ7OTaLogtkGWSg',
  routing: {
    instance: {
      filter_text: 'name = ""\nvpc_id = ""\n\n[tags]\n  harnesslightwingrule = "c8e9dq8p8ai13r2j7a3g"',
      scale_group: null
    },
    lb: null,
    k8s: null,
    database: null,
    ports: [
      {
        id: 'arn:aws:elasticloadbalancing:us-east-1:357919113896:listener-rule/app/sandeep-test-lb/e2e95a1016c87ed7/c4638a556aa1655d/aa8d4e8c79f8da6a',
        protocol: 'http',
        target_protocol: 'http',
        port: 80,
        target_port: 80,
        server_name: '',
        action: 'forward',
        redirect_url: '',
        routing_rules: []
      }
    ],
    container_svc: null,
    custom_domain_providers: null
  },
  health_check: {
    protocol: 'http',
    path: '/',
    port: 80,
    timeout: 30,
    id: '',
    status_code_from: 200,
    status_code_to: 299
  },
  opts: {
    preserve_private_ip: false,
    delete_cloud_resources: false,
    always_use_private_ip: false,
    access_details: {
      backgroundTasks: {
        selected: false
      },
      dnsLink: {
        selected: true
      },
      ipaddress: {
        selected: false
      },
      rdp: {
        selected: false
      },
      ssh: {
        selected: false
      }
    },
    hide_progress_page: false
  },
  metadata: {
    target_group_details: {
      '80': 'arn:aws:elasticloadbalancing:us-east-1:357919113896:targetgroup/c8e9dqop8ai13r2j7a40/1168c1f0bf89e4cb'
    },
    access_details: null,
    cloud_provider_details: {
      name: 'Lightwing Non Prod'
    },
    service_errors: null,
    kubernetes_connector_id: '',
    health_check_details: null,
    custom_domain_providers: null,
    port_config: [
      {
        id: 'arn:aws:elasticloadbalancing:us-east-1:357919113896:listener-rule/app/sandeep-test-lb/e2e95a1016c87ed7/c4638a556aa1655d/aa8d4e8c79f8da6a',
        protocol: 'http',
        target_protocol: 'http',
        port: 80,
        target_port: 80,
        server_name: '',
        action: 'forward',
        redirect_url: '',
        routing_rules: []
      }
    ]
  },
  access_point_id: 'ap-c8aupomj83uermckpaa0',
  status: 'created',
  created_at: '2022-02-28T09:33:28.938197Z',
  updated_at: '2022-02-28T09:33:32.887936Z',
  account_identifier: 'wFHXHD0RRQWoO8tIZT5YVw'
}

const listData = {
  response: [mockedK8sServiceData, mockedInstanceServiceData, { ...mockedInstanceServiceData, disabled: true }]
}

const mockedCumulativeSavingsData = {
  actual_cost: [],
  days: [],
  potential_cost: [],
  savings: [],
  savings_percent: 0,
  total_active_services: 1,
  total_cost: 0,
  total_potential: 0,
  total_savings: 0
}

const mockedSavingsData = [
  {
    actual_savings: 10,
    savings_percentage: 50,
    usage_date: Date.now(),
    potential_cost: 120,
    actual_hours: 48,
    idle_hours: 30
  }
]

const mockedSavingsOfServiceData = { response: mockedSavingsData }

jest.mock('services/lw', () => ({
  useAllServiceResources: jest.fn().mockImplementation(() => ({
    data: null,
    loading: false,
    error: null
  })),
  useGetServices: jest.fn().mockImplementation(() => ({
    data: listData,
    loading: false,
    error: null,
    refetch: jest.fn().mockImplementation(() =>
      Promise.resolve({
        data: listData,
        loading: false
      })
    )
  })),
  useHealthOfService: jest.fn().mockImplementation(() => ({
    data: null,
    loading: false
  })),
  useRequestsOfService: jest.fn().mockImplementation(() => ({
    data: null,
    loading: false
  })),
  useSavingsOfService: jest.fn().mockImplementation(() => ({
    data: mockedSavingsOfServiceData,
    loading: false
  })),
  useGetServiceDiagnostics: jest.fn().mockImplementation(() => ({
    data: null
  })),
  useCumulativeServiceSavings: jest.fn().mockImplementation(() => ({
    data: { response: mockedCumulativeSavingsData },
    loading: false
  })),
  useToggleAutostoppingRule: jest.fn().mockImplementation(() => ({
    mutate: jest.fn()
  })),
  useDeleteService: jest.fn().mockImplementation(() => ({
    mutate: jest.fn()
  })),
  useGatewaySessionReport: jest.fn().mockImplementation(() => ({ mutate: Promise.resolve(() => jest.fn()) })),
  useListStaticSchedules: jest.fn().mockImplementation(() => ({
    data: {},
    loading: false,
    refetch: jest.fn(() => Promise.resolve({ response: {} }))
  })),
  useCreateStaticSchedules: jest.fn().mockImplementation(() => ({
    mutate: jest.fn()
  })),
  useDeleteStaticSchedule: jest.fn().mockImplementation(() => ({
    mutate: jest.fn()
  })),
  useRouteDetails: jest.fn().mockImplementation(() => ({
    data: null,
    loading: false,
    refetch: jest.fn()
  }))
}))

afterEach(() => {
  jest.clearAllMocks()
})

describe('Test COGatewayList', () => {
  test('renders without crashing', () => {
    const { container, getByText } = render(
      <TestWrapper path={testpath} pathParams={testparams}>
        <COGatewayList></COGatewayList>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()

    const createAsBtn = getByText('ce.co.newAutoStoppingRule')
    expect('createAsBtn').toBeDefined()
    act(() => {
      fireEvent.click(createAsBtn)
    })
  })

  test('clicking on a row should open info drawer', async () => {
    const { container } = render(
      <TestWrapper path={testpath} pathParams={testparams}>
        <COGatewayList></COGatewayList>
      </TestWrapper>
    )

    const row = container.querySelector('.TableV2--row.TableV2--clickable')
    // const delete =
    expect(row).toBeDefined()
    act(() => {
      fireEvent.click(row!)
    })
    expect(container).toMatchSnapshot()
  })

  test('clicking on refresh button refetch all rules', async () => {
    const { container, getByTestId } = render(
      <TestWrapper path={testpath} pathParams={testparams}>
        <COGatewayList></COGatewayList>
      </TestWrapper>
    )

    const refreshIcon = getByTestId('refreshIconContainer')
    expect(refreshIcon).toBeDefined()
    act(() => {
      fireEvent.click(refreshIcon!)
    })
    expect(container).toMatchSnapshot()
  })

  // eslint-disable-next-line jest/no-disabled-tests
  test.skip('should be able to disable a rule', async () => {
    const { container } = render(
      <TestWrapper path={testpath} pathParams={testparams}>
        <COGatewayList></COGatewayList>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()

    const menuBtn = container.querySelector('span[data-icon="Options"]')
    expect(menuBtn).toBeDefined()
    await waitFor(() => {
      fireEvent.click(menuBtn!)
    })
    const disableBtn = document.querySelector('.bp3-portal ul.bp3-menu li')
    expect(disableBtn).toBeDefined()
    act(() => {
      fireEvent.click(disableBtn!)
    })
    expect(document.querySelector('.bp3-dialog-container')).toBeInTheDocument()

    const confirmDisableBtn = document.querySelector('.bp3-dialog button[type="button"]')
    expect(confirmDisableBtn).toBeDefined()
    act(() => {
      fireEvent.click(confirmDisableBtn!)
    })
  })

  test('able to search through the list', () => {
    const { container } = render(
      <TestWrapper path={testpath} pathParams={testparams}>
        <COGatewayList></COGatewayList>
      </TestWrapper>
    )
    const searchInput = container.querySelector('input[type="search"]') as HTMLInputElement
    expect(searchInput).toBeDefined()
    act(async () => {
      await waitFor(() => {
        fireEvent.change(searchInput, { target: { value: 'test' } })
      })
    })

    expect(searchInput.value).toBe('test')
    expect(container).toMatchSnapshot()
  })

  test('error from services API should show error', () => {
    const servicesSpy = jest.spyOn(lwServices, 'useGetServices')
    servicesSpy.mockImplementation(
      () =>
        ({
          data: null,
          loading: false,
          error: { data: { errors: ['Fetch Service error'] } },
          refetch: jest.fn()
        } as any)
    )
    const { container } = render(
      <TestWrapper path={testpath} pathParams={testparams}>
        <COGatewayList></COGatewayList>
      </TestWrapper>
    )

    act(() => {
      expect(container).toMatchSnapshot()
    })
    servicesSpy.mockClear()
  })

  describe('render based on the content', () => {
    test('render page loader on initial loading', () => {
      const servicesSpy = jest.spyOn(lwServices, 'useGetServices')
      servicesSpy.mockImplementation(
        () =>
          ({
            data: null,
            loading: false,
            error: null,
            refetch: jest.fn()
          } as any)
      )
      const { container } = render(
        <TestWrapper>
          <COGatewayList />
        </TestWrapper>
      )
      expect(container).toMatchSnapshot()
      servicesSpy.mockClear()
    })

    test('render empty page component for no rules created', () => {
      const servicesSpy = jest.spyOn(lwServices, 'useGetServices')
      servicesSpy.mockImplementation(
        () =>
          ({
            data: { response: null },
            loading: false,
            error: null,
            refetch: jest.fn()
          } as any)
      )
      const { container, getByText } = render(
        <TestWrapper>
          <COGatewayList />
        </TestWrapper>
      )
      expect(container).toMatchSnapshot()

      const createAsBtn = getByText('ce.co.newAutoStoppingRule')
      expect('createAsBtn').toBeDefined()
      act(() => {
        fireEvent.click(createAsBtn)
      })
    })

    test('render table loader component when data is loading', () => {
      jest.spyOn(lwServices, 'useGetServices').mockImplementation(
        () =>
          ({
            data: { response: null },
            loading: true,
            error: null,
            refetch: jest.fn()
          } as any)
      )
      const { container } = render(
        <TestWrapper>
          <COGatewayList />
        </TestWrapper>
      )
      expect(container).toMatchSnapshot()
    })

    test('should show error message on receiving error from services API', () => {
      jest.spyOn(lwServices, 'useGetServices').mockImplementation(
        () =>
          ({
            data: { response: null },
            loading: false,
            error: { message: 'Some random error' },
            refetch: jest.fn()
          } as any)
      )
      const { container } = render(
        <TestWrapper>
          <COGatewayList />
        </TestWrapper>
      )
      expect(container).toMatchSnapshot()
    })
  })
})
