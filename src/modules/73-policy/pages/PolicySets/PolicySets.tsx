//
// TODO: This file is just a place-holder
//
import React, { useState, useEffect, useMemo } from 'react'
import * as moment from 'moment'
import {
  ButtonVariation,
  ExpandingSearchInput,
  Layout,
  Toggle,
  Button,
  Text,
  Color,
  Popover,
  useModalHook
} from '@wings-software/uicore'
import { Classes, Position, Menu, Dialog, IDialogProps } from '@blueprintjs/core'
import { useParams } from 'react-router-dom'
import { useGet } from 'restful-react'
import type { CellProps, Renderer, Column } from 'react-table'
import { useToaster, useConfirmationDialog } from '@common/exports'
import { useUpdatePolicySet, useDeletePolicySet } from 'services/pm'

import { useStrings } from 'framework/strings'
import { StringUtils } from '@common/exports'
import { PageHeader } from '@common/components/Page/PageHeader'
import { Page } from '@common/exports'

import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'

import { setPageNumber } from '@common/utils/utils'
import Table from '@common/components/Table/Table'
import PolicySetWizard from './components/PolicySetWizard'
import PolicyIcon from './PolicySetIcon.svg'
import css from './PolicySets.module.scss'

export interface PoliciesSetDTO {
  account_id?: number
  action: string
  created: number
  enabled: boolean
  id: number
  name: string
  org_id?: string
  project_id: string
  type: string
  updated: number
}

const PolicyEvaluations: React.FC = () => {
  const { accountId } = useParams<ProjectPathProps>()
  const { getString } = useStrings()
  useDocumentTitle(getString('common.policies'))
  const [page, setPage] = useState(0)
  const [searchTerm, setsearchTerm] = useState<string>('')

  const modalProps: IDialogProps = {
    isOpen: true,
    enforceFocus: false,
    style: {
      width: 1000,
      borderLeft: 0,
      paddingBottom: 0,
      position: 'relative',
      overflow: 'auto'
    }
  }

  const {
    data: policyList,
    loading: fetchingPolicieSets,
    error,
    refetch
  } = useGet({
    path: 'policy-mgmt/pm/api/v1/policysets',
    queryParams: {
      accountId: accountId
    }
  })

  useEffect(() => {
    setPageNumber({ setPage, page, pageItemsCount: policyList?.pageCount || 1000 })
  }, [policyList])

  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog {...modalProps}>
        <PolicySetWizard hideModal={hideModal} refetch={refetch}></PolicySetWizard>
        <Button
          minimal
          className={css.closeIcon}
          icon="cross"
          iconProps={{ size: 18 }}
          onClick={() => {
            refetch()
            hideModal()
          }}
        />
      </Dialog>
    ),
    []
  )

  const newUserGroupsBtn = (): JSX.Element => (
    <Button
      text={getString('common.policiesSets.newPolicyset')}
      variation={ButtonVariation.PRIMARY}
      icon="plus"
      onClick={() => showModal()}
    />
  )

  const RenderPolicyName: Renderer<CellProps<PoliciesSetDTO>> = ({ row }) => {
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

  const RenderCreatedAt: Renderer<CellProps<PoliciesSetDTO>> = ({ row }) => {
    const record = row.original
    return (
      <Text color={Color.BLACK} lineClamp={1}>
        {getValue(record.created)}
      </Text>
    )
  }

  const RenderLastUpdated: Renderer<CellProps<PoliciesSetDTO>> = ({ row }) => {
    const record = row.original
    return (
      <Text color={Color.BLACK} lineClamp={1}>
        {getValue(record.updated)}
      </Text>
    )
  }

  const RenderEntityType: Renderer<CellProps<PoliciesSetDTO>> = ({ row }) => {
    const record = row.original
    return (
      <Text color={Color.BLACK} lineClamp={1}>
        {record.type}
      </Text>
    )
  }

  const RenderEnforced: Renderer<CellProps<PoliciesSetDTO>> = ({ row }) => {
    const record = row.original
    const id = '' + row.original.id
    const { mutate: updatePolicySet } = useUpdatePolicySet({ policyset: id })

    return (
      <Toggle
        checked={record.enabled}
        onToggle={value => {
          const updatePayload = {
            action: row.original.action,
            enabled: value,
            name: row.original.name,
            type: row.original.type
          }
          updatePolicySet(updatePayload)
          refetch()
        }}
      />
    )
  }

  const RenderColumnMenu: Renderer<CellProps<PoliciesSetDTO>> = ({ row }) => {
    const data = row.original

    const [menuOpen, setMenuOpen] = useState(false)
    const { showSuccess, showError } = useToaster()

    const { mutate: deletePolicySet } = useDeletePolicySet({})

    const { openDialog: openDeleteDialog } = useConfirmationDialog({
      contentText: 'Are you sure you want to delete Policy Set?',
      titleText: 'Delete Policy Set',
      confirmButtonText: getString('delete'),
      cancelButtonText: getString('cancel'),
      onCloseDialog: async didConfirm => {
        if (didConfirm && data) {
          try {
            await deletePolicySet(data.id.toString())
            showSuccess('Successfully deleted Policy Set')
            refetch()
          } catch (err) {
            showError(err?.message)
          }
        }
      }
    })

    return (
      <Layout.Horizontal flex={{ justifyContent: 'flex-end' }}>
        <Popover
          isOpen={menuOpen}
          onInteraction={nextOpenState => {
            setMenuOpen(nextOpenState)
          }}
          className={Classes.DARK}
          position={Position.BOTTOM_RIGHT}
        >
          <Button
            minimal
            icon="Options"
            withoutBoxShadow
            data-testid={`menu-${data.id}`}
            onClick={e => {
              e.stopPropagation()
              setMenuOpen(true)
            }}
          />
          <Menu>
            <Button
              icon="trash"
              style={{ color: 'var(--white) !important' }}
              inline={true}
              variation={ButtonVariation.LINK}
              text={getString('delete')}
              onClick={e => {
                e.stopPropagation()
                setMenuOpen(false)
                openDeleteDialog()
              }}
            />
          </Menu>
        </Popover>
      </Layout.Horizontal>
    )
  }

  const columns: Column<PoliciesSetDTO>[] = useMemo(
    () => [
      {
        Header: getString('pipeline.policyEvaluations.policySet'),

        accessor: row => row.name,
        width: '35%',
        Cell: RenderPolicyName
      },
      {
        Header: getString('common.policiesSets.table.enforced'),

        accessor: row => row.enabled,
        width: '10%',
        Cell: RenderEnforced
      },
      {
        Header: getString('common.policiesSets.table.entityType'),

        accessor: row => row.type,
        width: '10%',
        Cell: RenderEntityType
      },
      {
        Header: getString('common.policy.table.createdAt'),

        accessor: row => row.updated,
        width: '20%',
        Cell: RenderCreatedAt
      },
      {
        Header: getString('common.policy.table.lastModified'),

        accessor: row => row.updated,
        width: '20%',
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
              placeholder={getString('common.policiesSets.policySetSearch')}
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
        loading={fetchingPolicieSets}
        error={(error?.data as Error)?.message || error?.message}
        retryOnError={() => refetch()}
        noData={
          !searchTerm
            ? {
                when: () => !policyList?.length,
                icon: 'nav-project',
                message: getString('common.policiesSets.noPolicySet'),
                button: newUserGroupsBtn()
              }
            : {
                when: () => !policyList?.length,
                icon: 'nav-project',
                message: getString('common.policiesSets.noPolicySetResult')
              }
        }
      >
        <Table<PoliciesSetDTO>
          className={css.table}
          columns={columns}
          data={policyList || []}
          // TODO: enable when page is ready

          pagination={{
            itemCount: policyList?.length || 0,
            pageSize: policyList?.pageSize || 1000,
            pageCount: policyList?.pageCount || 0,
            pageIndex: policyList?.pageIndex || 0,
            gotoPage: (pageNumber: number) => setPage(pageNumber)
          }}
        />
      </Page.Body>
    </>
  )
}

export default PolicyEvaluations
