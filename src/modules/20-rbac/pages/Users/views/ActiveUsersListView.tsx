import React, { useState, useMemo, useEffect } from 'react'
import { Text, Layout, Button, Popover, Avatar, Color, Icon } from '@wings-software/uicore'
import type { CellProps, Renderer, Column } from 'react-table'
import { Classes, Position, Menu } from '@blueprintjs/core'
import { useHistory, useParams } from 'react-router-dom'
import {
  UserAggregate,
  useRemoveUser,
  useGetAggregatedUsers,
  UserGroupDTO,
  UserMetadataDTO,
  RoleAssignmentMetadataDTO,
  useUnlockUser
} from 'services/cd-ng'
import Table from '@common/components/Table/Table'
import { useStrings } from 'framework/strings'
import { useConfirmationDialog, useToaster, Page } from '@common/exports'
import RoleBindingsList from '@rbac/components/RoleBindingsList/RoleBindingsList'
import { PrincipalType, useRoleAssignmentModal } from '@rbac/modals/RoleAssignmentModal/useRoleAssignmentModal'
import { useMutateAsGet } from '@common/hooks'
import type { PipelineType, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import routes from '@common/RouteDefinitions'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import ManagePrincipalButton from '@rbac/components/ManagePrincipalButton/ManagePrincipalButton'
import RbacMenuItem from '@rbac/components/MenuItem/MenuItem'
import RbacButton from '@rbac/components/Button/Button'
import { setPageNumber } from '@common/utils/utils'
import css from './UserListView.module.scss'

interface ActiveUserListViewProps {
  searchTerm?: string
  openRoleAssignmentModal: (
    type?: PrincipalType,
    principalInfo?: UserGroupDTO | UserMetadataDTO,
    roleBindings?: RoleAssignmentMetadataDTO[]
  ) => void
}

const RenderColumnUser: Renderer<CellProps<UserAggregate>> = ({ row }) => {
  const data = row.original.user
  const { getString } = useStrings()

  return (
    <Layout.Horizontal
      spacing="small"
      className={css.overflow}
      flex={{ alignItems: 'center', justifyContent: 'flex-start' }}
      padding={{ right: 'small' }}
    >
      {data.locked ? (
        <Icon
          name="lock"
          border
          className={css.lockIcon}
          width={32}
          height={32}
          color={Color.WHITE}
          background={Color.GREY_300}
          flex={{ align: 'center-center' }}
          margin={{ left: 'xsmall', right: 'xsmall' }}
        />
      ) : (
        <Avatar name={data.name || data.email} email={data.email} hoverCard={false} />
      )}
      <Layout.Vertical width={'100%'}>
        <Text lineClamp={1}>{data.name}</Text>
        {data.locked ? (
          <Text font={'small'} color={Color.GREY_400}>
            {getString('rbac.usersPage.lockedOutLabel')}
          </Text>
        ) : null}
      </Layout.Vertical>
    </Layout.Horizontal>
  )
}
const RenderColumnRoleAssignments: Renderer<CellProps<UserAggregate>> = ({ row, column }) => {
  const data = row.original.roleAssignmentMetadata
  const { getString } = useStrings()

  const handleAddRole = (e: React.MouseEvent<Element, MouseEvent>): void => {
    e.stopPropagation()
    ;(column as any).openRoleAssignmentModal(PrincipalType.USER, row.original.user, row.original.roleAssignmentMetadata)
  }

  return (
    <Layout.Horizontal
      spacing="small"
      flex={{ alignItems: 'center', justifyContent: 'flex-start' }}
      padding={{ right: 'small' }}
    >
      <RoleBindingsList data={data} length={2} />
      <ManagePrincipalButton
        text={getString('common.plusNumber', { number: getString('common.role') })}
        minimal
        intent="primary"
        className={css.roleButton}
        data-testid={`addRole-${row.original.user.uuid}`}
        onClick={handleAddRole}
        resourceIdentifier={row.original.user.uuid}
        resourceType={ResourceType.USER}
      />
    </Layout.Horizontal>
  )
}

const RenderColumnEmail: Renderer<CellProps<UserAggregate>> = ({ row }) => {
  const data = row.original

  return (
    <Layout.Horizontal
      className={css.overflow}
      flex={{ alignItems: 'center', justifyContent: 'flex-start' }}
      padding={{ right: 'small' }}
    >
      <Text>{data.user?.email}</Text>
    </Layout.Horizontal>
  )
}

const RenderColumnMenu: Renderer<CellProps<UserAggregate>> = ({ row, column }) => {
  const data = row.original.user
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const [menuOpen, setMenuOpen] = useState(false)
  const { showSuccess, showError } = useToaster()
  const { getString } = useStrings()
  const { mutate: deleteUser } = useRemoveUser({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    }
  })
  const { mutate: unlockUser } = useUnlockUser({
    userId: data.uuid,
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    }
  })

  const { openDialog: openDeleteDialog } = useConfirmationDialog({
    contentText: getString('rbac.usersPage.deleteConfirmation', { name: data?.name }),
    titleText: getString('rbac.usersPage.deleteTitle'),
    confirmButtonText: getString('delete'),
    cancelButtonText: getString('cancel'),
    onCloseDialog: async didConfirm => {
      if (didConfirm && data) {
        try {
          const deleted = await deleteUser(data.uuid)
          deleted && showSuccess(getString('rbac.usersPage.deleteSuccessMessage', { name: data?.name }))
          ;(column as any).refetchActiveUsers?.()
        } catch (err) {
          showError(err?.data?.message || err?.message)
        }
      }
    }
  })

  const { openDialog: openUnlockDialog } = useConfirmationDialog({
    contentText: getString('rbac.usersPage.unlockConfirmation', { name: data?.name }),
    titleText: getString('rbac.usersPage.unlockTitle'),
    confirmButtonText: getString('confirm'),
    cancelButtonText: getString('cancel'),
    onCloseDialog: async didConfirm => {
      if (didConfirm && data) {
        try {
          const unlocked = await unlockUser()
          unlocked && showSuccess(getString('rbac.usersPage.unlockSuccessMessage', { name: data?.name }))
          ;(column as any).refetchActiveUsers?.()
        } catch (err) {
          showError(err?.data?.message || err?.message)
        }
      }
    }
  })

  const permissionRequest = {
    resourceScope: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    },
    resource: {
      resourceType: ResourceType.USER,
      resourceIdentifier: data.uuid
    },
    permission: PermissionIdentifier.MANAGE_USER
  }

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
          data-testid={`menu-${data.uuid}`}
          onClick={e => {
            e.stopPropagation()
            setMenuOpen(true)
          }}
        />
        <Menu>
          {data.locked ? (
            <RbacMenuItem
              icon="unlock"
              text={getString('rbac.usersPage.unlockTitle')}
              onClick={e => {
                e.stopPropagation()
                setMenuOpen(false)
                openUnlockDialog()
              }}
              permission={permissionRequest}
            />
          ) : null}
          <RbacMenuItem
            icon="trash"
            text={getString('delete')}
            onClick={e => {
              e.stopPropagation()
              setMenuOpen(false)
              openDeleteDialog()
            }}
            permission={permissionRequest}
          />
        </Menu>
      </Popover>
    </Layout.Horizontal>
  )
}

const ActiveUserListView: React.FC<ActiveUserListViewProps> = ({ searchTerm, openRoleAssignmentModal }) => {
  const { getString } = useStrings()
  const history = useHistory()
  const { accountId, orgIdentifier, projectIdentifier, module } = useParams<PipelineType<ProjectPathProps>>()
  const [page, setPage] = useState(0)

  const { data, loading, error, refetch } = useMutateAsGet(useGetAggregatedUsers, {
    body: {},
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      pageIndex: page,
      pageSize: 10,
      searchTerm: searchTerm
    },
    debounce: 300
  })

  useEffect(() => {
    setPageNumber({ setPage, page, pageItemsCount: data?.data?.pageItemCount })
  }, [data?.data])

  const { openRoleAssignmentModal: addRole } = useRoleAssignmentModal({
    onSuccess: refetch
  })

  useEffect(() => {
    if (searchTerm) setPage(0)
  }, [searchTerm])

  const columns: Column<UserAggregate>[] = useMemo(
    () => [
      {
        Header: getString('users'),
        id: 'user',
        accessor: row => row.user?.name,
        width: '30%',
        Cell: RenderColumnUser
      },
      {
        Header: getString('rbac.usersPage.roleBinding'),
        id: 'roleBinding',
        accessor: row => row.roleAssignmentMetadata,
        width: '45%',
        Cell: RenderColumnRoleAssignments,
        openRoleAssignmentModal: addRole
      },
      {
        Header: getString('email'),
        id: 'email',
        accessor: row => row.user?.email,
        width: '20%',
        Cell: RenderColumnEmail
      },
      {
        Header: '',
        id: 'menu',
        accessor: row => row.user?.uuid,
        width: '5%',
        Cell: RenderColumnMenu,
        refetchActiveUsers: refetch,
        disableSortBy: true
      }
    ],
    [openRoleAssignmentModal, refetch]
  )

  return (
    <Page.Body
      loading={loading}
      error={(error as any)?.data?.message || error?.message}
      retryOnError={() => refetch()}
      noData={
        !searchTerm
          ? {
              when: () => !data?.data?.content?.length,
              icon: 'nav-project',
              message: getString('rbac.usersPage.noDataDescription'),
              button: (
                <RbacButton
                  text={getString('rbac.user')}
                  intent="primary"
                  icon="plus"
                  onClick={() => openRoleAssignmentModal()}
                  permission={{
                    resource: {
                      resourceType: ResourceType.USER
                    },
                    permission: PermissionIdentifier.INVITE_USER
                  }}
                />
              )
            }
          : {
              when: () => !data?.data?.content?.length,
              icon: 'nav-project',
              message: getString('rbac.usersPage.noUsersFound')
            }
      }
    >
      <Table<UserAggregate>
        className={css.table}
        columns={columns}
        data={data?.data?.content || []}
        pagination={{
          itemCount: data?.data?.totalItems || 0,
          pageSize: data?.data?.pageSize || 10,
          pageCount: data?.data?.totalPages || 0,
          pageIndex: data?.data?.pageIndex || 0,
          gotoPage: (pageNumber: number) => setPage(pageNumber)
        }}
        onRowClick={user => {
          history.push(
            routes.toUserDetails({
              accountId,
              orgIdentifier,
              projectIdentifier,
              module,
              userIdentifier: user.user.uuid
            })
          )
        }}
      />
    </Page.Body>
  )
}

export default ActiveUserListView
