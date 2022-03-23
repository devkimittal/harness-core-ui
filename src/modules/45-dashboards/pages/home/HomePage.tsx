/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import cx from 'classnames'

import {
  Layout,
  Text,
  Container,
  Card,
  Button,
  CardBody,
  Heading,
  Icon,
  Formik,
  FormikForm as Form,
  ExpandingSearchInput,
  Pagination,
  SelectOption,
  TableV2,
  FormInput
} from '@wings-software/uicore'
import { useModalHook } from '@harness/use-modal'
import type { Breadcrumb } from '@harness/uicore'
import { FontVariation, Color } from '@harness/design-system'
import { Select } from '@blueprintjs/select'

import { Classes, Menu, Dialog } from '@blueprintjs/core'
import * as Yup from 'yup'
import { useParams, useHistory } from 'react-router-dom'
import { useGet, useMutate } from 'restful-react'
import type { CellProps, Renderer, Column } from 'react-table'

import { Page } from '@common/exports'
import RbacButton from '@rbac/components/Button/Button'
import RbacMenuItem from '@rbac/components/MenuItem/MenuItem'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import ModuleTagsFilter from '@dashboards/components/ModuleTagsFilter/ModuleTagsFilter'

import routes from '@common/RouteDefinitions'

import { useStrings } from 'framework/strings'

import { useDeleteDashboard, useCloneDashboard } from '@dashboards/services/CustomDashboardsService'
import { useDashboardsContext } from '../DashboardsContext'
import FilterTagsSideBar from './FilterTagsSideBar'
import moduleTagCss from '@dashboards/common/ModuleTags.module.scss'
import css from './HomePage.module.scss'

export const PAGE_SIZE = 20

enum LayoutViews {
  LIST,
  GRID
}

const dashboardType: { [key: string]: string } = {
  SHARED: 'SHARED',
  ACCOUNT: 'ACCOUNT'
}

interface DashboardInterface {
  id: string
  type: string
  description: string
  title: string
  view_count: number
  favorite_count: number
  created_at: string
  data_source: string[]
  last_accessed_at: string
  resourceIdentifier: string
}

interface Permission {
  resource: {
    resourceType: ResourceType
    resourceIdentifier?: string
  }
  permission: PermissionIdentifier
}

const DEFAULT_FILTER: { [key: string]: boolean } = {
  HARNESS: false,
  CE: false,
  CD: false,
  CI: false,
  CF: false
}

type CustomColumn<T extends Record<string, any>> = Column<T>

const CustomSelect = Select.ofType<SelectOption>()

const NewDashboardForm = (props: any): JSX.Element => {
  const { getString } = useStrings()
  const { accountId, folderId } = useParams<{ accountId: string; folderId: string }>()

  const [errorMessage, setErrorMessage] = React.useState('')
  const history = useHistory()
  const folderListItems = [
    {
      value: 'shared',
      label: 'Organization Shared Folder'
    }
  ]

  const { data: foldersList } = useGet({
    // Inferred from RestfulProvider in index.js
    path: 'gateway/dashboard/folder',
    queryParams: { accountId: accountId, page: 1, pageSize: 1000 }
  })

  const { mutate: createDashboard, loading } = useMutate({
    verb: 'POST',
    path: folderId ? 'gateway/dashboard/v2/create' : 'gateway/dashboard/create',
    queryParams: { accountId: accountId }
  })

  if (foldersList && foldersList?.resource) {
    foldersList?.resource?.map((folder: { id: string; name: string }) => {
      const _f = {
        value: folder?.id,
        label: folder?.name
      }
      folderListItems.push(_f)
    })
  }

  const submitForm = async (formData: { name: string; description: string; folderId: string }) => {
    const description = Object.keys(formData?.description).toString()
    const cloneFormData = formData
    cloneFormData['description'] = description
    const response = await createDashboard(cloneFormData)
    return response
  }

  return (
    <Layout.Horizontal>
      <Layout.Vertical padding="xxlarge" width="50%">
        <Heading level={3} font={{ variation: FontVariation.H3 }} padding={{ bottom: 'large' }}>
          {getString('dashboards.createModal.stepOne')}
        </Heading>
        <Formik
          formName={'createDashboardForm'}
          initialValues={{ name: '', description: '', folderId: folderId }}
          validationSchema={Yup.object().shape({
            name: Yup.string().trim().required(getString('dashboards.createModal.nameValidation'))
          })}
          onSubmit={(formData: { name: string; description: string; folderId: string }) => {
            setErrorMessage('')
            const response = submitForm(formData)
            response
              .then(data => {
                if (data?.resource) {
                  history.push({
                    pathname: routes.toViewCustomDashboard({
                      viewId: data?.resource,
                      accountId: accountId,
                      folderId
                    })
                  })
                  props?.hideModal?.()
                }
              })
              .catch(() => {
                setErrorMessage(getString('dashboards.createModal.submitFail'))
              })
          }}
        >
          {() => (
            <Form>
              <Layout.Vertical width="100%">
                <FormInput.Select
                  name="folderId"
                  placeholder={getString('dashboards.homePage.chooseTheFolder')}
                  label={getString('dashboards.homePage.folder')}
                  items={folderListItems}
                />
                <FormInput.Text
                  name="name"
                  label={getString('name')}
                  placeholder={getString('dashboards.createModal.namePlaceholder')}
                />

                <FormInput.KVTagInput name="description" label={getString('tagsLabel')} />
                <Layout.Vertical spacing="medium">
                  <Button
                    type="submit"
                    intent="primary"
                    width="150px"
                    text={getString('continue')}
                    disabled={loading}
                    className={css.button}
                  />
                  {errorMessage && <Text intent="danger">{errorMessage}</Text>}
                </Layout.Vertical>
              </Layout.Vertical>
            </Form>
          )}
        </Formik>
      </Layout.Vertical>
      <Container width="50%" flex={{ align: 'center-center' }} className={css.videoContainer}>
        <iframe
          src="//fast.wistia.net/embed/iframe/38m8yricif"
          scrolling="no"
          frameBorder={0}
          allowFullScreen={true}
          className="wistia_embed"
          name="wistia_embed"
          width="350"
          height="200"
        ></iframe>
      </Container>
    </Layout.Horizontal>
  )
}

const TagsRenderer = (data: DashboardInterface) => {
  const { getString } = useStrings()
  return (
    <Container className={css.predefinedTags}>
      {data.type === dashboardType.SHARED && (
        <section className={moduleTagCss.harnessTag}>{getString('dashboards.modules.harness')}</section>
      )}
      {data.data_source.map((tag: string) => {
        if (tag === 'CE') {
          return <section className={moduleTagCss.ceTag}>{getString('common.purpose.ce.cloudCost')}</section>
        }
        if (tag === 'CI') {
          return <section className={moduleTagCss.ciTag}>{getString('buildsText')}</section>
        }
        if (tag === 'CD') {
          return <section className={moduleTagCss.cdTag}>{getString('deploymentsText')}</section>
        }
        if (tag === 'CF') {
          return <section className={moduleTagCss.cfTag}>{getString('common.purpose.cf.continuous')}</section>
        }
        return <></>
      })}
      {data?.description &&
        data.type === dashboardType.ACCOUNT &&
        data?.description.split(',').map((tag: string, index: number) => {
          return (
            <section className={css.customTag} key={tag + index}>
              {tag}
            </section>
          )
        })}
    </Container>
  )
}

const RenderDashboardName: Renderer<CellProps<DashboardInterface>> = ({ row }) => {
  const data = row.original
  const { accountId, folderId } = useParams<{ accountId: string; folderId: string }>()
  const history = useHistory()
  return (
    <Text
      color={Color.BLACK}
      lineClamp={1}
      onClick={() => {
        history.push({
          pathname: routes.toViewCustomDashboard({
            viewId: row.id,
            accountId: accountId,
            folderId: folderId === 'shared' ? 'shared' : data.resourceIdentifier
          })
        })
      }}
    >
      {data.title}
    </Text>
  )
}

const RenderDashboardTags: Renderer<CellProps<DashboardInterface>> = ({ row }) => {
  const data = row.original
  return TagsRenderer(data)
}

const getBreadcrumbLinks = (
  folderDetail: { resource: string },
  accountId: string,
  folderId: string,
  folderString: string
): Breadcrumb[] => {
  if (folderDetail?.resource) {
    return [
      {
        url: routes.toCustomFolderHome({ accountId }),
        label: folderString
      },
      {
        url: routes.toViewCustomFolder({ folderId, accountId }),
        label: folderDetail.resource
      }
    ]
  }
  return []
}

export interface DashboardCardInterface {
  dashboard: DashboardInterface
  clone: (dashboardId: string) => Promise<void>
  deleteById: (dashboardId: string) => Promise<void>
}

const DashboardCard: React.FC<DashboardCardInterface> = ({ dashboard, clone, deleteById }) => {
  const { getString } = useStrings()
  const { accountId, folderId } = useParams<{ accountId: string; folderId: string }>()
  const history = useHistory()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <Card
      interactive
      className={cx(css.dashboardCard)}
      onClick={() => {
        history.push({
          pathname: routes.toViewCustomDashboard({
            viewId: dashboard.id,
            accountId: accountId,
            folderId: folderId === 'shared' ? 'shared' : dashboard?.resourceIdentifier
          })
        })
      }}
    >
      <Container>
        <CardBody.Menu
          menuContent={
            <Menu>
              <RbacMenuItem
                text={getString('projectCard.clone')}
                onClick={e => {
                  e.stopPropagation()
                  setMenuOpen(false)
                  clone(dashboard.id)
                }}
                permission={{
                  permission: PermissionIdentifier.EDIT_DASHBOARD,
                  resource: {
                    resourceType: ResourceType.DASHBOARDS
                  }
                }}
              />
              {dashboard?.type === dashboardType.ACCOUNT && (
                <RbacMenuItem
                  text={getString('delete')}
                  onClick={e => {
                    e.stopPropagation()
                    setMenuOpen(false)
                    deleteById(dashboard.id)
                  }}
                  permission={{
                    permission: PermissionIdentifier.EDIT_DASHBOARD,
                    resource: {
                      resourceType: ResourceType.DASHBOARDS
                    }
                  }}
                />
              )}
            </Menu>
          }
          menuPopoverProps={{
            className: Classes.DARK,
            isOpen: menuOpen,
            onInteraction: nextOpenState => {
              setMenuOpen(nextOpenState)
            }
          }}
        />

        <Layout.Vertical spacing="large">
          <Text font={{ variation: FontVariation.CARD_TITLE }}>{dashboard?.title}</Text>
          {TagsRenderer(dashboard)}

          {dashboard?.type !== dashboardType.SHARED && (
            <Layout.Horizontal spacing="small">
              <Text
                icon="eye-open"
                iconProps={{ padding: { right: 'small' } }}
                font={{ variation: FontVariation.CARD_TITLE }}
              >
                {dashboard?.view_count}
              </Text>
              <Text
                icon="star-empty"
                iconProps={{ padding: { right: 'small' } }}
                font={{ variation: FontVariation.CARD_TITLE }}
              >
                {dashboard?.favorite_count}
              </Text>
            </Layout.Horizontal>
          )}
        </Layout.Vertical>
      </Container>
    </Card>
  )
}

const HomePage: React.FC = () => {
  const { getString } = useStrings()
  const { accountId, folderId } = useParams<{ accountId: string; folderId: string }>()
  const history = useHistory()
  const { includeBreadcrumbs } = useDashboardsContext()
  // const [_dashboardList, _setDashboardList] = React.useState<DashboardInterface[]>([])
  const [filteredDashboardList, setFilteredList] = React.useState<DashboardInterface[]>([])

  const [filteredTags, setFilteredTags] = React.useState<string[]>([])
  const [selectedFilter, setCheckboxFilter] = React.useState(DEFAULT_FILTER)
  const [searchTerm, setSearchTerm] = useState<string | undefined>()
  const [page, setPage] = useState(0)
  const [layoutView, setLayoutView] = useState(LayoutViews.GRID)
  const defaultSortBy: SelectOption = {
    label: 'Select Option',
    value: ''
  }

  const sortingOptions: SelectOption[] = [
    {
      label: 'Name',
      value: 'title'
    },
    {
      label: 'Recently Viewed',
      value: 'last_viewed_at desc'
    },
    {
      label: 'Recently Created',
      value: 'created_at desc'
    },
    {
      label: 'Most Viewed',
      value: 'view_count desc'
    },
    {
      label: 'Most Liked',
      value: 'favorite_count desc'
    }
  ]

  const [sortby, setSortingFilter] = useState<SelectOption>(defaultSortBy)

  const RenderMenu: Renderer<CellProps<DashboardInterface>> = ({ row }) => {
    const data = row.original
    return (
      <CardBody.Menu
        menuContent={
          <Menu>
            <RbacMenuItem
              text={getString('projectCard.clone')}
              onClick={() => clone(data.id)}
              permission={{
                permission: PermissionIdentifier.EDIT_DASHBOARD,
                resource: {
                  resourceType: ResourceType.DASHBOARDS
                }
              }}
            />
            <RbacMenuItem
              text={getString('delete')}
              onClick={() => deleteById(data.id)}
              permission={{
                permission: PermissionIdentifier.EDIT_DASHBOARD,
                resource: {
                  resourceType: ResourceType.DASHBOARDS
                }
              }}
            />
          </Menu>
        }
        menuPopoverProps={{
          className: Classes.DARK
        }}
      />
    )
  }

  const columns: CustomColumn<DashboardInterface>[] = [
    {
      Header: 'Name',
      id: 'name',
      accessor: row => row.title,
      width: '30%',
      Cell: RenderDashboardName
    },
    {
      Header: 'Tags',
      id: 'tags',
      accessor: row => row.description,
      width: '30%',
      Cell: RenderDashboardTags
    },
    {
      Header: 'View Count',
      id: 'view_count',
      accessor: row => row.view_count,
      width: '15%'
    },
    {
      Header: 'Favorite Count',
      id: 'favorite_count',
      accessor: row => row.favorite_count,
      width: '10%'
    },
    {
      Header: '',
      id: 'menu',
      accessor: row => row.id,
      width: '10%',
      Cell: RenderMenu
    }
  ]

  const serialize = (obj: { [key: string]: boolean }) => {
    return new URLSearchParams(Object.entries(obj).map(([k, v]) => [k, v.toString()])).toString()
  }

  const folderIdOrBlank = () => {
    return folderId.replace('shared', '')
  }

  React.useEffect(() => {
    const script = document.createElement('script')

    script.src = 'https://fast.wistia.com/assets/external/E-v1.js'
    script.async = true

    document.body.appendChild(script)
  }, [])

  const {
    data: dashboardList,
    loading,
    refetch,
    error
  } = useGet({
    // Inferred from RestfulProvider in index.js
    path: 'gateway/dashboard/v1/search',
    debounce: true,
    queryParams: {
      accountId: accountId,
      folderId: folderIdOrBlank(),
      searchTerm,
      page: page + 1,
      pageSize: PAGE_SIZE,
      tags: serialize(selectedFilter),
      sortBy: sortby?.value,
      customTag: filteredTags.join('%')
    }
  })

  const { mutate: cloneDashboard, loading: cloning } = useCloneDashboard(accountId)

  const clone = async (dashboardId: string) => {
    const clonedDashboard = await cloneDashboard({ dashboardId })
    if (clonedDashboard) {
      history.push({
        pathname: routes.toViewCustomDashboard({
          viewId: clonedDashboard?.id,
          accountId: accountId,
          folderId: clonedDashboard?.folder_id
        })
      })
    }
  }

  const { mutate: deleteDashboard, loading: deleting } = useDeleteDashboard(accountId)

  const deleteById = async (dashboardId: string) => {
    await deleteDashboard({ dashboardId })
    refetch()
  }

  const { data: folderDetail } = useGet({
    path: 'gateway/dashboard/folderDetail',
    queryParams: { accountId: accountId, folderId: folderIdOrBlank() }
  })

  React.useEffect(() => {
    if (searchTerm || selectedFilter || sortby?.value || filteredTags?.length > 0) setPage(0)
  }, [searchTerm, selectedFilter, sortby?.value, filteredTags])

  const setPredefinedFilter = (filterType: string, isChecked: boolean) => {
    const updatedValue: any = {}
    updatedValue[filterType] = isChecked
    setCheckboxFilter({ ...selectedFilter, ...updatedValue })
  }

  React.useEffect(() => {
    setFilteredList(dashboardList?.resource)
  }, [dashboardList])

  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog
        isOpen={true}
        enforceFocus={false}
        onClose={() => {
          hideModal()
        }}
        className={cx(css.dashboardDialog, Classes.DIALOG, css.create)}
      >
        <NewDashboardForm
          formData={{}}
          handleViewChange={{}}
          hideModal={hideModal}
          name={getString('dashboards.createModal.stepOne')}
        />

        <Button
          minimal
          icon="cross"
          iconProps={{ size: 18 }}
          onClick={() => {
            hideModal()
          }}
          className={css.crossIcon}
        />
      </Dialog>
    ),
    []
  )

  const permissionObj: Permission = {
    permission: PermissionIdentifier.EDIT_DASHBOARD,
    resource: {
      resourceType: ResourceType.DASHBOARDS
    }
  }

  if (folderId !== 'shared') {
    permissionObj['resource']['resourceIdentifier'] = folderId
  }

  React.useEffect(() => {
    includeBreadcrumbs(getBreadcrumbLinks(folderDetail, accountId, folderId, getString('dashboards.homePage.folders')))
  }, [folderDetail, accountId, folderId])

  return (
    <Page.Body loading={loading || cloning || deleting} error={error?.data?.message}>
      <Layout.Horizontal>
        <Layout.Horizontal
          padding="large"
          background={Color.GREY_0}
          spacing="medium"
          flex={{ justifyContent: 'space-between', alignItems: 'center' }}
          border={{ bottom: true, color: 'grey100' }}
          width="100%"
        >
          <RbacButton
            intent="primary"
            text={getString('dashboardLabel')}
            onClick={() => showModal()}
            icon="plus"
            className={css.createButton}
            permission={permissionObj}
          />
          <Container className={cx(css.predefinedTags, css.mainNavTag)}>
            <ModuleTagsFilter selectedFilter={selectedFilter} setPredefinedFilter={setPredefinedFilter} />
          </Container>
          <Layout.Horizontal>
            <CustomSelect
              items={sortingOptions}
              filterable={false}
              itemRenderer={(item, { handleClick }) => <Menu.Item text={item.label} onClick={handleClick} />}
              onItemSelect={item => {
                setSortingFilter(item)
              }}
              popoverProps={{ minimal: true, popoverClassName: '' }}
            >
              <Button
                inline
                round
                rightIcon="chevron-down"
                className={css.customSelect}
                text={
                  <Text color={Color.BLACK}>
                    {getString('dashboards.sortBy')} {sortby?.label}
                  </Text>
                }
              />
            </CustomSelect>
            <Layout.Horizontal>
              <Button
                minimal
                aria-label={getString('dashboards.switchToGridView')}
                icon="grid-view"
                intent={layoutView === LayoutViews.GRID ? 'primary' : 'none'}
                onClick={() => {
                  setLayoutView(LayoutViews.GRID)
                }}
              />
              <Button
                minimal
                aria-label={getString('dashboards.switchToListView')}
                icon="list"
                intent={layoutView === LayoutViews.LIST ? 'primary' : 'none'}
                onClick={() => {
                  setLayoutView(LayoutViews.LIST)
                }}
              />
            </Layout.Horizontal>
          </Layout.Horizontal>
        </Layout.Horizontal>
      </Layout.Horizontal>

      <FilterTagsSideBar setFilteredTags={setFilteredTags} />

      <Layout.Vertical className={css.homeContent}>
        <Layout.Horizontal padding={{ top: 'large', right: 'xxxlarge', bottom: 'large', left: 'xxxlarge' }}>
          <ExpandingSearchInput
            placeholder={getString('dashboards.homePage.searchPlaceholder')}
            onChange={(text: string) => {
              setSearchTerm(text)
            }}
            className={css.search}
          />
        </Layout.Horizontal>
        <Layout.Horizontal
          margin={{ left: 'xxxlarge' }}
          flex={{ justifyContent: 'flex-start', alignItems: 'baseline' }}
        >
          <Container>
            {filteredTags.map((tag: string, index: number) => {
              return (
                <Container className={cx(css.customTag, css.filteredTags)} key={tag + index}>
                  {tag}
                  <Button
                    minimal
                    aria-title={getString('dashboards.homePage.removeTagFromFilter')}
                    icon="cross"
                    className={css.clearTagButton}
                    onClick={() => {
                      const filterTags = filteredTags.filter(v => v !== tag)
                      setFilteredTags(filterTags)
                    }}
                  />
                </Container>
              )
            })}
          </Container>
          {filteredTags?.length > 0 && (
            <Button minimal intent="primary" onClick={() => setFilteredTags([])}>
              {getString('filters.clearAll')}
            </Button>
          )}
        </Layout.Horizontal>
        {!!filteredDashboardList?.length && layoutView === LayoutViews.GRID && (
          <Container className={css.masonry}>
            <Layout.Masonry
              gutter={25}
              items={filteredDashboardList}
              renderItem={(dashboard: DashboardInterface) => (
                <DashboardCard dashboard={dashboard} clone={clone} deleteById={deleteById} />
              )}
              keyOf={dashboard => dashboard?.id}
            />
          </Container>
        )}

        {!!filteredDashboardList?.length && layoutView === LayoutViews.LIST && (
          <Container className={css.masonry}>
            <TableV2<DashboardInterface> className={css.table} columns={columns} data={filteredDashboardList || []} />
          </Container>
        )}

        {!filteredDashboardList?.length && !loading && (
          <Container height="calc(100vh - 226px)" flex={{ align: 'center-center' }}>
            <Layout.Vertical spacing="medium" width={470} flex={{ alignItems: 'center' }} margin={{ top: '-48px' }}>
              <Icon name="dashboard" color={Color.GREY_300} size={35} />
              <Heading level={2} font={{ align: 'center' }} color={Color.GREY_500}>
                {getString('dashboards.homePage.noDashboardsAvailable')}
              </Heading>
            </Layout.Vertical>
          </Container>
        )}
      </Layout.Vertical>

      {!loading && (
        <Layout.Vertical padding={{ left: 'medium', right: 'medium' }}>
          <Pagination
            itemCount={dashboardList?.items || 1}
            pageSize={PAGE_SIZE}
            pageCount={dashboardList?.pages || 1}
            pageIndex={page}
            gotoPage={(pageNumber: number) => setPage(pageNumber)}
          />
        </Layout.Vertical>
      )}
    </Page.Body>
  )
}

export default HomePage
