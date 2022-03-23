/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useMemo, ReactNode, useEffect } from 'react'
import cronstrue from 'cronstrue'
import { isEmpty } from 'lodash-es'
import { useHistory, useParams } from 'react-router-dom'
import type { Column, CellProps, Renderer } from 'react-table'
import {
  Button,
  Container,
  Text,
  Layout,
  Icon,
  FlexExpander,
  useToaster,
  ButtonSize,
  ButtonVariation,
  Link
} from '@wings-software/uicore'
import { FontVariation, Color } from '@harness/design-system'
import { Popover, Position, Classes, PopoverInteractionKind } from '@blueprintjs/core'
import { DEFAULT_GROUP_BY } from '@ce/utils/perspectiveUtils'
import routes from '@common/RouteDefinitions'
import { QlceViewFieldInputInput, ViewChartType, AlertThreshold } from 'services/ce/services'
import {
  CEView,
  CEReportSchedule,
  useGetReportSetting,
  useListBudgetsForPerspective,
  useDeleteBudget,
  useDeleteReportSetting,
  Budget
} from 'services/ce'
import { useStrings } from 'framework/strings'
import formatCost from '@ce/utils/formatCost'

import { useTelemetry } from '@common/hooks/useTelemetry'
import { USER_JOURNEY_EVENTS } from '@ce/TrackingEventsConstants'
import Table from './Table'
import PerspectiveBuilderPreview from '../PerspectiveBuilderPreview/PerspectiveBuilderPreview'
import useCreateReportModal from './PerspectiveCreateReport'
import useBudgetModal from './PerspectiveCreateBudget'
import css from './PerspectiveReportsAndBudgets.module.scss'

interface ListProps {
  grid: ReactNode
  buttonText: string
  hasData: boolean
  loading: boolean
  meta?: ReactNode
  showCreateButton?: boolean
  onButtonClick: () => void
}

interface TableActionsProps {
  onClickEdit: () => void
  onClickDelete: () => void
}

interface ReportsAndBudgetsProps {
  values?: CEView
  onPrevButtonClick: () => void
}

export interface UrlParams {
  perspectiveId: string
  accountId: string
}

const ReportsAndBudgets: React.FC<ReportsAndBudgetsProps> = ({ values, onPrevButtonClick }) => {
  const [groupBy, setGroupBy] = useState<QlceViewFieldInputInput>(() => {
    return (values?.viewVisualization?.groupBy as QlceViewFieldInputInput) || DEFAULT_GROUP_BY
  })

  useEffect(() => {
    values?.viewVisualization?.groupBy && setGroupBy(values?.viewVisualization?.groupBy as QlceViewFieldInputInput)
  }, [values?.viewVisualization?.groupBy])

  const [chartType, setChartType] = useState<ViewChartType>(() => {
    return (values?.viewVisualization?.chartType as ViewChartType) || ViewChartType.StackedLineChart
  })

  const history = useHistory()
  const { trackEvent } = useTelemetry()
  const { getString } = useStrings()
  const { perspectiveId, accountId } = useParams<UrlParams>()

  const savePerspective = (): void => {
    history.push(
      routes.toPerspectiveDetails({
        accountId,
        perspectiveId,
        perspectiveName: perspectiveId
      })
    )
  }

  return (
    <Container className={css.mainContainer}>
      <Container className={css.innerContainer}>
        <Layout.Vertical
          spacing="xxlarge"
          height="100%"
          padding={{
            left: 'large',
            right: 'xxlarge',
            bottom: 'xxlarge',
            top: 'xxlarge'
          }}
          style={{ overflowY: 'auto' }}
        >
          <ScheduledReports />
          <Budgets perspectiveName={values?.name || ''} />
          <FlexExpander />
          <Layout.Horizontal padding={{ top: 'medium' }} spacing="large">
            <Button icon="chevron-left" text={getString('previous')} onClick={onPrevButtonClick} />
            <Button
              intent="primary"
              text={getString('ce.perspectives.save')}
              onClick={() => {
                trackEvent(USER_JOURNEY_EVENTS.SAVE_PERSPECTIVE, {})
                savePerspective()
              }}
            />
          </Layout.Horizontal>
        </Layout.Vertical>
        {values && (
          <PerspectiveBuilderPreview
            setGroupBy={(gBy: QlceViewFieldInputInput) => setGroupBy(gBy)}
            groupBy={groupBy}
            chartType={chartType}
            setChartType={(type: ViewChartType) => {
              setChartType(type)
            }}
            formValues={values}
          />
        )}
      </Container>
    </Container>
  )
}

const useFetchReports = (accountId: string, perspectiveId: string) => {
  const { data, loading, refetch } = useGetReportSetting({
    accountIdentifier: accountId,
    queryParams: { perspectiveId }
  })
  return { reports: data?.data || [], loading, refetch }
}

const ScheduledReports: React.FC = () => {
  const { getString } = useStrings()
  const { accountId, perspectiveId } = useParams<UrlParams>()
  const { trackEvent } = useTelemetry()
  const { reports, loading, refetch } = useFetchReports(accountId, perspectiveId)
  const { mutate: deleteReport } = useDeleteReportSetting({})
  const { openModal, hideModal } = useCreateReportModal({
    onSuccess: () => {
      hideModal()
      refetch()
    }
  })
  const { showSuccess, showError } = useToaster()

  const handleDelete = async (report: CEReportSchedule) => {
    try {
      const deleted = await deleteReport(accountId, {
        queryParams: { reportId: report?.uuid },
        headers: {
          'content-type': 'application/json'
        }
      })
      if (deleted) {
        showSuccess(
          getString('ce.perspectives.reports.reportDeletedTxt', {
            name: report.name
          })
        )
        refetch()
      }
    } catch (err) {
      showError(err?.data?.message || err?.message)
    }
  }

  const columns: Column<CEReportSchedule>[] = useMemo(
    () => [
      {
        Header: getString('ce.perspectives.reports.reportName'),
        accessor: 'name'
      },
      {
        Header: getString('ce.perspectives.reports.frequency'),
        accessor: 'userCron',
        Cell: RenderReportFrequency
      },
      {
        Header: getString('ce.perspectives.reports.recipients'),
        accessor: 'recipients',
        Cell: ({ row }: CellProps<CEReportSchedule>) => {
          const recipients = [...(row.original.recipients || [])]
          return <RenderEmailAddresses emailAddresses={recipients} />
        }
      },
      {
        id: 'edit-delete-action-column',
        Cell: ({ row }: CellProps<CEReportSchedule>) => (
          <RenderEditDeleteActions
            onClickEdit={() => openModal({ isEdit: true, selectedReport: row.original })}
            onClickDelete={() => handleDelete(row.original)}
          />
        )
      }
    ],
    []
  )

  const openCreateReportModal = () => {
    trackEvent(USER_JOURNEY_EVENTS.CREATE_PERSPECTIVE_ADD_NEW_REPORT, {})
    openModal()
  }

  return (
    <Container>
      <Layout.Horizontal>
        <Container>
          <Text color={Color.GREY_800} font={{ variation: FontVariation.H4 }}>
            {getString('ce.perspectives.reports.title', {
              count: reports.length || 0
            })}
          </Text>
        </Container>
        <FlexExpander />
        {reports.length ? (
          <Link
            onClick={openCreateReportModal}
            size={ButtonSize.SMALL}
            padding="none"
            margin="none"
            font={FontVariation.SMALL}
            variation={ButtonVariation.LINK}
            icon="plus"
            iconProps={{
              size: 10
            }}
          >
            {getString('ce.perspectives.reports.addReportSchedule')}
          </Link>
        ) : null}
      </Layout.Horizontal>
      <Text padding={{ top: 'large', bottom: 'large' }} color={Color.GREY_800} font="small">
        {`${getString('ce.perspectives.reports.desc')} ${
          !reports.length ? getString('ce.perspectives.reports.msg') : ''
        }`}
      </Text>
      <List
        buttonText={getString('ce.perspectives.reports.createNew')}
        onButtonClick={openCreateReportModal}
        showCreateButton={!reports.length}
        hasData={!!reports.length}
        loading={loading}
        grid={<Table<CEReportSchedule> data={reports} columns={columns} />}
      />
    </Container>
  )
}

const useFetchBudget = (accountId: string, perspectiveId: string) => {
  const { data, loading, refetch } = useListBudgetsForPerspective({
    queryParams: { accountIdentifier: accountId, perspectiveId: perspectiveId }
  })
  return { budgets: data?.data || [], loading, refetch }
}

const Budgets = ({ perspectiveName }: { perspectiveName: string }): JSX.Element => {
  const { getString } = useStrings()
  const { accountId, perspectiveId } = useParams<UrlParams>()
  const { mutate: deleteBudget } = useDeleteBudget({ queryParams: { accountIdentifier: accountId } })
  const { budgets, loading, refetch } = useFetchBudget(accountId, perspectiveId)
  const { trackEvent } = useTelemetry()
  const { openModal, hideModal } = useBudgetModal({
    onSuccess: () => {
      hideModal()
      refetch()
    }
  })
  const { showSuccess, showError } = useToaster()

  const handleDeleteBudget: (budget: Budget) => void = async budget => {
    try {
      const deleted = await (budget?.uuid &&
        deleteBudget(budget.uuid, {
          headers: {
            'content-type': 'application/json'
          }
        }))
      if (deleted) {
        showSuccess(
          getString('ce.budgets.budgetDeletedTxt', {
            name: budget.name
          })
        )
        refetch()
      }
    } catch (err) {
      showError(err?.data?.message || err?.message)
    }
  }

  const columns: Column<AlertThreshold>[] = useMemo(
    () => [
      {
        Header: getString('ce.perspectives.budgets.configureAlerts.basedOn'),
        accessor: 'basedOn',
        Cell: RenderBasedOn
      },
      {
        Header: getString('ce.perspectives.budgets.configureAlerts.percent'),
        accessor: 'percentage',
        Cell: RenderAlertThresholds
      },
      {
        Header: getString('ce.perspectives.reports.recipientLabel'),
        accessor: 'emailAddresses',
        Cell: ({ row }: CellProps<AlertThreshold>) => {
          const emailAddresses = [...(row.original.emailAddresses || [])] as string[]
          return <RenderEmailAddresses emailAddresses={emailAddresses} />
        }
      }
    ],
    []
  )

  const renderMeta: (budget: Budget, index: number) => JSX.Element = (budget, index) => {
    const { budgetAmount = 0, growthRate } = budget

    return (
      <Container>
        <Text font={{ variation: FontVariation.H6 }}>
          {growthRate
            ? getString('ce.perspectives.budgets.budgetTextWithGrowthRate', {
                index: index + 1,
                amount: formatCost(budgetAmount),
                growth: growthRate
              })
            : getString('ce.perspectives.budgets.budgetText', {
                index: index + 1,
                amount: formatCost(budgetAmount)
              })}
        </Text>
      </Container>
    )
  }

  const renderGrid: (budget: Budget) => JSX.Element = budget => {
    const { alertThresholds = [] } = budget

    return (
      <Container>
        <Layout.Horizontal
          margin={{ top: 'large', bottom: 'medium' }}
          spacing="small"
          style={{
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Text font="small" color={Color.GREY_800}>
            {getString('ce.perspectives.budgets.sendAlerts')}
          </Text>
          <Container margin={{ right: 'large' }}>
            <RenderEditDeleteActions
              onClickEdit={() =>
                openModal({
                  perspectiveName: perspectiveName,
                  perspective: perspectiveId,
                  isEdit: true,
                  selectedBudget: budget
                })
              }
              onClickDelete={() => handleDeleteBudget(budget)}
            />
          </Container>
        </Layout.Horizontal>
        <Table<AlertThreshold> columns={columns} data={(alertThresholds || []) as any} />
      </Container>
    )
  }

  const openCreateNewBudgetModal = (): void => {
    trackEvent(USER_JOURNEY_EVENTS.CREATE_PERSPECTIVE_ADD_NEW_BUDGET, {})
    openModal({
      isEdit: false,
      perspectiveName: perspectiveName,
      perspective: perspectiveId,
      selectedBudget: {}
    })
  }

  return (
    <Container>
      <Layout.Horizontal>
        <Text color={Color.GREY_800} font={{ variation: FontVariation.H4 }}>
          {getString('ce.perspectives.budgets.perspectiveCreateBudgetTitle', {
            count: budgets.length || 0
          })}
        </Text>
        <FlexExpander />
        {budgets.length ? (
          <Link
            size={ButtonSize.SMALL}
            padding="none"
            margin="none"
            font={FontVariation.SMALL}
            variation={ButtonVariation.LINK}
            icon="plus"
            iconProps={{
              size: 10
            }}
            onClick={openCreateNewBudgetModal}
          >
            {getString('ce.budgets.addNewBudget')}
          </Link>
        ) : null}
      </Layout.Horizontal>
      <Text padding={{ top: 'large', bottom: 'large' }} color={Color.GREY_800} font="small">
        {getString('ce.perspectives.budgets.desc')}
      </Text>
      {budgets.map((budget, idx) => {
        return (
          <List
            key={budget.uuid}
            buttonText={getString('ce.perspectives.budgets.createNew')}
            onButtonClick={openCreateNewBudgetModal}
            hasData={!isEmpty(budget)}
            loading={loading}
            // Show create budget button only when there's no exisiting budget.
            // A user can create only 1 budget at a time. To create a new, they
            // have to delete the existing one, or just edit it.
            showCreateButton={isEmpty(budget)}
            meta={renderMeta(budget, idx)}
            grid={renderGrid(budget)}
          />
        )
      })}
      {!budgets.length ? (
        <List
          grid={null}
          loading={loading}
          onButtonClick={openCreateNewBudgetModal}
          buttonText={getString('ce.perspectives.budgets.createNew')}
          hasData={false}
          showCreateButton={true}
        />
      ) : null}
    </Container>
  )
}

const List = (props: ListProps): JSX.Element => {
  const { grid, buttonText, hasData, onButtonClick, loading, meta, showCreateButton } = props

  const renderLoader = (): JSX.Element => {
    return (
      <Container className={css.loader}>
        <Icon name="spinner" color={Color.BLUE_500} size={30} />
      </Container>
    )
  }

  const renderCreateNewButton = () => {
    return (
      <Layout.Horizontal
        spacing="small"
        style={{
          justifyContent: hasData ? 'flex-end' : 'center',
          alignItems: 'center'
        }}
      >
        <Button
          type="submit"
          withoutBoxShadow={true}
          className={css.createBtn}
          text={buttonText}
          onClick={onButtonClick}
        />
      </Layout.Horizontal>
    )
  }

  return (
    <Container
      margin={{
        bottom: 'xlarge'
      }}
    >
      {loading && renderLoader()}
      {!loading && hasData && (
        <>
          {meta}
          {grid}
        </>
      )}
      {!loading && showCreateButton && renderCreateNewButton()}
    </Container>
  )
}

const RenderReportFrequency: Renderer<CellProps<CEReportSchedule>> = ({ row }) => {
  const cron = row.original.userCron || ''
  return <span>{cronstrue.toString(cron)}</span>
}

const RenderBasedOn: Renderer<CellProps<AlertThreshold>> = ({ row }) => {
  const { getString } = useStrings()
  const basedOn = row.original.basedOn!
  const map: Record<string, string> = useMemo(
    () => ({
      ACTUAL_COST: getString('ce.perspectives.budgets.actualSpend'),
      FORECASTED_COST: getString('ce.perspectives.budgets.forecastedCost')
    }),
    []
  )

  return <span>{map[basedOn]}</span>
}

const RenderEmailAddresses = ({ emailAddresses = [] }: { emailAddresses: string[] }) => {
  const email = emailAddresses.shift()
  const remainingEmailsCount = emailAddresses.length ? `(+${emailAddresses.length})` : ''

  return (
    <Layout.Horizontal spacing="xsmall">
      <Text color={Color.GREY_700} font="small">
        {email}
      </Text>
      {emailAddresses.length ? (
        <Popover
          popoverClassName={Classes.DARK}
          position={Position.BOTTOM}
          interactionKind={PopoverInteractionKind.HOVER}
          content={
            <div className={css.popoverContent}>
              <ul>
                {emailAddresses.map((em, idx) => (
                  <li key={idx}>{em}</li>
                ))}
              </ul>
            </div>
          }
        >
          <Text color="primary7" font="small">
            {remainingEmailsCount}
          </Text>
        </Popover>
      ) : null}
    </Layout.Horizontal>
  )
}

const RenderEditDeleteActions = (props: TableActionsProps): JSX.Element => {
  const { onClickEdit, onClickDelete } = props
  return (
    <Layout.Horizontal
      spacing="medium"
      style={{
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <Icon size={14} name={'Edit'} color="primary7" onClick={onClickEdit} className={css.icon} />
      <Icon size={14} name={'trash'} color="primary7" onClick={onClickDelete} className={css.icon} />
    </Layout.Horizontal>
  )
}

const RenderAlertThresholds: Renderer<CellProps<AlertThreshold>> = ({ row }) => {
  const percentage = row.original.percentage
  return <span>{percentage}%</span>
}

export default ReportsAndBudgets
