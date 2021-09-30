import React, { useState, useEffect, useMemo } from 'react'
import * as moment from 'moment'
import { ButtonVariation, ExpandingSearchInput, Layout, Button, Text, Color, Utils } from '@wings-software/uicore'
import { useParams, useHistory } from 'react-router-dom'
import type { CellProps, Renderer, Column } from 'react-table'
import { useStrings } from 'framework/strings'
import { StringUtils } from '@common/exports'
import { PageHeader } from '@common/components/Page/PageHeader'
import { Page } from '@common/exports'
import { useToaster, useConfirmationDialog } from '@common/exports'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import { Policy, useGetPolicyList, useDeletePolicy } from 'services/pm'
import { setPageNumber } from '@common/utils/utils'
import { OptionsMenuButton } from '@common/components'
import routes from '@common/RouteDefinitions'
import Table from '@common/components/Table/Table'
import PolicyIcon from './Policy.svg'

import css from './Policies.module.scss'

const Policies: React.FC = () => {
  const { accountId } = useParams<ProjectPathProps>()
  const { getString } = useStrings()
  useDocumentTitle(getString('common.policies'))
  const [page, setPage] = useState(0)
  const [searchTerm, setsearchTerm] = useState<string>('')
  const { data: policyList, loading: fetchingPolicies, error, refetch } = useGetPolicyList({}) // TODO: Backend must support accountId
  const history = useHistory()

  useEffect(() => {
    // TODO: Update pageItemsCount per API spec (which is not yet ready)
    setPageNumber({ setPage, page, pageItemsCount: 1000 })
  }, [policyList, page])

  const newUserGroupsBtn = (): JSX.Element => {
    const pathname = routes.toPolicyNewPage({ accountId })

    return (
      <Button
        text={getString('common.policy.newPolicy')}
        variation={ButtonVariation.PRIMARY}
        icon="plus"
        onClick={() => {
          history.push({ pathname })
        }}
      />
    )
  }

  const RenderPolicyName: Renderer<CellProps<Policy>> = ({ row }) => {
    const record = row.original
    return (
      <Layout.Horizontal spacing="small" flex style={{ alignItems: 'center', justifyContent: 'flex-start' }}>
        <img src={PolicyIcon} height="22" />
        <Text color={Color.BLACK} lineClamp={1} font={{ weight: 'semi-bold' }}>
          {record.name}
        </Text>
      </Layout.Horizontal>
    )
  }

  const getValue = (value: number) => {
    return value ? moment.unix(value / 1000).format(StringUtils.DEFAULT_DATE_FORMAT) : null
  }

  const RenderCreatedAt: Renderer<CellProps<Policy>> = ({ row }) => {
    const record = row.original
    return (
      <Text color={Color.BLACK} lineClamp={1}>
        {getValue(record.created || 0)}
      </Text>
    )
  }

  const RenderLastUpdated: Renderer<CellProps<Policy>> = ({ row }) => {
    const record = row.original
    return (
      <Text color={Color.BLACK} lineClamp={1}>
        {getValue(record.updated || 0)}
      </Text>
    )
  }

  const RenderColumnMenu: Renderer<CellProps<Policy>> = ({ row }) => {
    const data = row.original
    const { showSuccess, showError } = useToaster()
    const { mutate: deletePolicy } = useDeletePolicy({})
    const { openDialog: openDeleteDialog } = useConfirmationDialog({
      contentText: 'Are you sure you want to delete Policy?',
      titleText: 'Delete Policy',
      confirmButtonText: getString('delete'),
      cancelButtonText: getString('cancel'),
      onCloseDialog: async didConfirm => {
        if (didConfirm && data) {
          try {
            await deletePolicy(data.id.toString())
            showSuccess('Successfully deleted Policy')
            refetch()
          } catch (err) {
            showError(err?.message)
          }
        }
      }
    })

    return (
      <Layout.Horizontal flex={{ justifyContent: 'flex-end' }} onClick={Utils.stopEvent}>
        <OptionsMenuButton
          items={[
            {
              icon: 'edit',
              text: getString('edit'),
              onClick: () => {
                history.push(routes.toPolicyEditPage({ accountId, policyIdentifier: String(data?.id || '') }))
              }
            },
            {
              icon: 'trash',
              text: getString('delete'),
              onClick: openDeleteDialog
            }
          ]}
        />
      </Layout.Horizontal>
    )
  }

  const columns: Column<Policy>[] = useMemo(
    () => [
      {
        Header: getString('common.policy.table.name'),

        accessor: row => row.name,
        width: '45%',
        Cell: RenderPolicyName
      },
      {
        Header: getString('common.policy.table.createdAt'),

        accessor: row => row.updated,
        width: '25%',
        Cell: RenderCreatedAt
      },
      {
        Header: getString('common.policy.table.lastModified'),

        accessor: row => row.updated,
        width: '25%',
        Cell: RenderLastUpdated
      },
      {
        Header: '',
        id: 'menu',
        accessor: row => row.id,
        width: '5%',
        Cell: RenderColumnMenu,

        disableSortBy: true
      }
    ],
    []
  )

  return (
    <>
      <PageHeader
        title={<Layout.Horizontal>{newUserGroupsBtn()}</Layout.Horizontal>}
        toolbar={
          <Layout.Horizontal margin={{ right: 'small' }} height="xxxlarge">
            <ExpandingSearchInput
              alwaysExpanded
              placeholder={getString('common.policy.policySearch')}
              onChange={text => {
                setsearchTerm(text.trim())
                setPage(0)
              }}
              width={250}
            />
          </Layout.Horizontal>
        }
      />
      <Page.Body
        loading={fetchingPolicies}
        error={(error?.data as Error)?.message || error?.message}
        retryOnError={() => refetch()}
        noData={
          !searchTerm
            ? {
                when: () => !policyList?.length,
                icon: 'nav-project',
                message: getString('common.policy.noPolicy'),
                button: newUserGroupsBtn()
              }
            : {
                when: () => !policyList?.length,
                icon: 'nav-project',
                message: getString('common.policy.noPolicyResult')
              }
        }
      >
        <Table<Policy>
          className={css.table}
          columns={columns}
          data={policyList || []}
          onRowClick={data => {
            history.push(routes.toPolicyEditPage({ accountId, policyIdentifier: String(data?.id || '') }))
          }}
          // TODO: enable when page is ready

          pagination={{
            itemCount: policyList?.length || 0,
            pageSize: 1000, // TODO Backend needs to support pagination
            pageCount: 100, // TODO Backend needs to support pagination
            pageIndex: 0, // TODO Backend needs to support pagination
            gotoPage: (pageNumber: number) => setPage(pageNumber)
          }}
        />
      </Page.Body>
    </>
  )
}

export default Policies
