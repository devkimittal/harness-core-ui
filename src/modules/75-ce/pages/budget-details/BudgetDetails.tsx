/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams, useHistory, Link } from 'react-router-dom'
import cx from 'classnames'
import {
  Card,
  Text,
  Icon,
  PageBody,
  PageHeader,
  Button,
  Layout,
  ButtonVariation,
  Container,
  Heading,
  useConfirmationDialog
} from '@wings-software/uicore'
import { Intent } from '@blueprintjs/core'
import { FontVariation, Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import { useToaster } from '@common/components'
import { Budget, useDeleteBudget } from 'services/ce'
import routes from '@common/RouteDefinitions'
import BudgetDetailsSummary from '@ce/components/BudgetDetailsSummary/BudgetDetailsSummary'
import { useFetchBudgetsGridDataQuery, useFetchBudgetSummaryQuery } from 'services/ce/services'
import BudgetDetailsGrid from '@ce/components/BudgetDetailsGrid/BudgetDetailsGrid'
import BudgetDetailsChart from '@ce/components/BudgetDetailsChart/BudgetDetailsChart'
import EmptyView from '@ce/images/empty-state.svg'
import useBudgetModal from '@ce/components/PerspectiveReportsAndBudget/PerspectiveCreateBudget'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import css from './BudgetDetails.module.scss'

const BudgetDetails: () => JSX.Element | null = () => {
  const { accountId, budgetName, budgetId } = useParams<{ accountId: string; budgetName: string; budgetId: string }>()
  const { getString } = useStrings()
  const { showError, showSuccess } = useToaster()
  const history = useHistory()

  const { mutate: deleteBudget, loading } = useDeleteBudget({ queryParams: { accountIdentifier: accountId } })

  const [{ data, fetching }, refetchSummary] = useFetchBudgetSummaryQuery({
    variables: {
      id: budgetId
    }
  })

  const summaryData = data?.budgetSummary

  const [{ data: gridData, fetching: gridFetching }, refetchGrid] = useFetchBudgetsGridDataQuery({
    variables: {
      id: budgetId
    }
  })

  const { openModal, hideModal } = useBudgetModal({
    onSuccess: () => {
      hideModal()
      refetchSummary({ requestPolicy: 'network-only' })
      refetchGrid({ requestPolicy: 'network-only' })
    }
  })

  const { openDialog } = useConfirmationDialog({
    contentText: (
      <Text>
        {getString('ce.budgets.confirmDeleteBudgetMsg', {
          name: budgetName
        })}
      </Text>
    ),
    titleText: getString('ce.budgets.confirmDeleteBudgetTitle'),
    confirmButtonText: getString('delete'),
    cancelButtonText: getString('cancel'),
    intent: Intent.DANGER,
    buttonIntent: Intent.DANGER,
    onCloseDialog: async (isConfirmed: boolean) => {
      if (isConfirmed) {
        try {
          const deletedBudget = await deleteBudget(budgetId, {
            headers: {
              'content-type': 'application/json'
            }
          })
          if (deletedBudget) {
            showSuccess(
              getString('ce.budgets.budgetDeletedTxt', {
                name: budgetName
              })
            )
            history.replace(routes.toCEBudgets({ accountId: accountId }))
          }
        } catch (e) {
          const errMessage = e.data.message
          showError(errMessage)
        }
      }
    }
  })

  const handleEditBudget = () => {
    openModal({
      isEdit: true,
      perspective: summaryData?.perspectiveId,
      selectedBudget: summaryData as unknown as Budget
    })
  }

  const renderBudgetsGridChart = () => {
    if (gridFetching) {
      return <Icon name="spinner" size={26} color={Color.BLUE_500} />
    }

    if (!gridData?.budgetCostData?.costData?.length) {
      return (
        <>
          <Text
            margin={{
              bottom: 'medium'
            }}
            color={Color.GREY_500}
            font={{ variation: FontVariation.H6 }}
          >
            {getString('ce.budgets.detailsPage.budgetHistoryTxt')}
          </Text>
          <Container className={css.empty}>
            <img src={EmptyView} />
            <Text
              margin={{
                top: 'large',
                bottom: 'xsmall'
              }}
              font="small"
              style={{
                fontWeight: 600
              }}
              color={Color.GREY_500}
            >
              {getString('ce.pageErrorMsg.noDataMsg')}
            </Text>
          </Container>
        </>
      )
    }

    return (
      <>
        <Text
          margin={{
            bottom: 'medium'
          }}
          color={Color.GREY_500}
          font={{ variation: FontVariation.H6 }}
        >
          {getString('ce.budgets.detailsPage.budgetHistoryTxt')}
        </Text>
        <BudgetDetailsChart
          chartData={gridData?.budgetCostData as any}
          budgetPeriod={gridData.budgetSummary?.period as any}
        />
        <BudgetDetailsGrid
          budgetPeriod={gridData.budgetSummary?.period as any}
          gridData={gridData?.budgetCostData as any}
        />
      </>
    )
  }

  return (
    <>
      <PageHeader
        title={
          <Layout.Horizontal flex={{ alignItems: 'baseline' }} spacing="xsmall">
            <Heading level={2} color={Color.GREY_800} font={{ weight: 'bold' }}>
              {budgetName}
            </Heading>
            {summaryData?.perspectiveId ? (
              <>
                <Text color={Color.GREY_500} font={{ variation: FontVariation.H6 }}>
                  {getString('common.on')}
                </Text>
                <Link
                  to={routes.toPerspectiveDetails({
                    accountId: accountId,
                    perspectiveId: summaryData.perspectiveId,
                    perspectiveName: summaryData.perspectiveName
                  })}
                  style={{ textDecoration: 'none' }}
                >
                  <Text color={Color.PRIMARY_7} font={{ variation: FontVariation.H6 }}>
                    {summaryData.perspectiveName}
                  </Text>
                </Link>
              </>
            ) : null}
          </Layout.Horizontal>
        }
        toolbar={
          <Layout.Horizontal spacing="medium">
            <Button
              intent="primary"
              icon="edit"
              iconProps={{
                margin: {
                  right: 'small'
                }
              }}
              onClick={handleEditBudget}
            >
              {getString('edit')}
            </Button>
            <Button
              iconProps={{
                margin: {
                  right: 'small'
                }
              }}
              loading={loading}
              variation={ButtonVariation.TERTIARY}
              icon="trash"
              onClick={openDialog}
            >
              {getString('delete')}
            </Button>
          </Layout.Horizontal>
        }
        breadcrumbs={
          <NGBreadcrumbs
            links={[
              {
                url: routes.toCEBudgets({ accountId }),
                label: getString('ce.budgets.sideNavText')
              }
            ]}
          />
        }
      />
      <PageBody loading={fetching}>
        <BudgetDetailsSummary summaryData={summaryData as any} />
        <Card className={cx(css.chartGridContainer, { [css.loadingContainer]: gridFetching })} elevation={1}>
          {renderBudgetsGridChart()}
        </Card>
      </PageBody>
    </>
  )
}

export default BudgetDetails
