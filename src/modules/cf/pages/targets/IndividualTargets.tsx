import React, { useState } from 'react'
import ReactTimeago from 'react-timeago'
import moment from 'moment'
import { Card, Container, Icon, Layout, Popover, Text } from '@wings-software/uikit'
import { Menu, Spinner } from '@blueprintjs/core'
import type { Column } from 'react-table'
import { useStrings } from 'framework/exports'
import Table from '@common/components/Table/Table'
import { Page, useToaster } from '@common/exports'
import { Target, useCreateTarget } from 'services/cf'
import { SharedQueryParams } from '@cf/constants'
import CreateTargetModal, { TargetData } from './CreateTargetModal'
import css from './CFTargetsPage.module.scss'

type CustomColumn<T extends object> = Column<T>
const PlaceholderCell: React.FC<any> = () => <Text>TBD</Text>
const TableCell: React.FC<any> = ({ value }) => <Text>{value}</Text>

const LastUpdatedCell: React.FC<any> = ({ value }: any) => {
  const [open, setOpen] = useState(false)
  const { getString } = useStrings()
  return (
    <Layout.Horizontal flex={{ distribution: 'space-between', align: 'center-center' }}>
      <ReactTimeago date={moment(value).toDate()} />
      <Popover isOpen={open} onInteraction={setOpen}>
        <Icon size={24} name="Options" />
        <Menu>
          <Menu.Item icon="edit" text={getString('edit')} />
          <Menu.Item icon="cross" text={getString('delete')} />
        </Menu>
      </Popover>
    </Layout.Horizontal>
  )
}

interface IndividualProps {
  targets: Target[]
  environment: string
  project: string
  loading?: boolean
  pagination?: {
    itemCount: number
    pageCount: number
    pageIndex: number
    pageSize: number
    gotoPage: (pageNumber: number) => void
  }
  onCreateTargets: () => void
}

type CreateTargetResult = {
  status: 'rejected' | 'fulfilled'
  which: any
}

const IndividualTargets: React.FC<IndividualProps> = ({
  targets,
  loading,
  project,
  environment,
  pagination,
  onCreateTargets
}) => {
  const { getString } = useStrings()
  const getPageString = (key: string) => getString(`cf.targets.${key}`)
  const { showError } = useToaster()

  const { mutate: createTarget, loading: loadingCreateTarget } = useCreateTarget({
    queryParams: SharedQueryParams
  })

  const columnDefs: CustomColumn<Target>[] = [
    {
      Header: getPageString('name').toLocaleUpperCase(),
      accessor: 'name',
      width: '20%',
      Cell: TableCell
    },
    {
      Header: getPageString('ID'),
      accessor: 'identifier',
      width: '20%',
      Cell: TableCell
    },
    {
      Header: getPageString('targetSegment').toLocaleUpperCase(),
      width: '20%',
      Cell: PlaceholderCell
    },
    {
      Header: getString('featureFlagsText').toLocaleUpperCase(),
      width: '20%',
      Cell: PlaceholderCell
    },
    {
      Header: getPageString('lastActivity').toLocaleUpperCase(),
      accessor: () => new Date(),
      width: '20%',
      Cell: LastUpdatedCell
    }
  ]

  const handleTargetCreation = (ts: TargetData[], hideModal: () => void) => {
    Promise.all(
      ts.map(t => {
        return createTarget({
          identifier: t.identifier,
          name: t.name,
          anonymous: false,
          attributes: {},
          environment,
          project,
          ...SharedQueryParams
        })
          .then(() => ({
            status: 'fulfilled',
            which: t
          }))
          .catch(() => ({
            status: 'rejected',
            which: t
          })) as Promise<CreateTargetResult>
      })
    )
      .then(results => {
        if (results.every(res => res.status === 'rejected')) {
          return Promise.reject(results)
        }
        results
          .filter(res => res.status === 'rejected')
          .forEach((res: CreateTargetResult) => {
            showError(`Error creating target with id ${res.which.identifier}`)
          })
      })
      .then(hideModal)
      .then(onCreateTargets)
      .catch(results => {
        results.forEach((res: CreateTargetResult) => {
          showError(`Error creating target with id ${res.which.identifier}`)
        })
      })
  }

  if (loading) {
    return (
      <Container flex style={{ justifyContent: 'center', height: '100%' }}>
        <Spinner size={50} />
      </Container>
    )
  }

  return (
    <Page.Body>
      <Card style={{ width: '100%' }}>
        <CreateTargetModal loading={loadingCreateTarget} onSubmitTargets={handleTargetCreation} />
      </Card>
      <Container flex padding="medium">
        <Table<Target> className={css.table} columns={columnDefs} data={targets} pagination={pagination} />
      </Container>
    </Page.Body>
  )
}

export default IndividualTargets
