/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import type { Column } from 'react-table'
import { Container, Layout, Text, Icon } from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import ResourceHandlerTable from '@rbac/components/ResourceHandlerTable/ResourceHandlerTable'
import { useGetDelegateGroupsV2, GetDelegatesStatusV2QueryParams, DelegateGroupDetails } from 'services/portal'
import { PageSpinner } from '@common/components'
import type { RbacResourceModalProps } from '@rbac/factories/RbacFactory'
import { useStrings } from 'framework/strings'

type ParsedColumnContent = DelegateGroupDetails & { identifier: string }

const DelegateResourceModalBody: React.FC<RbacResourceModalProps> = ({
  searchTerm = '',
  onSelectChange,
  selectedData,
  resourceScope
}) => {
  const { accountIdentifier, orgIdentifier, projectIdentifier } = resourceScope
  const { getString } = useStrings()
  const queryParams: GetDelegatesStatusV2QueryParams = useMemo(
    () =>
      ({
        searchTerm,
        accountId: accountIdentifier,
        orgId: orgIdentifier,
        projectId: projectIdentifier,
        module
      } as GetDelegatesStatusV2QueryParams),
    [accountIdentifier, searchTerm, orgIdentifier, projectIdentifier]
  )
  const { data, loading } = useGetDelegateGroupsV2({ queryParams })

  const delegateDataContent = data?.resource?.delegateGroupDetails?.map(dataContent => ({
    identifier: dataContent.delegateGroupIdentifier,
    ...dataContent
  }))

  const columns: Column<ParsedColumnContent>[] = useMemo(
    () => [
      {
        Header: getString('delegate.delegateName').toUpperCase(),
        accessor: row => row.groupName,
        id: 'name',
        width: '95%',
        Cell: ({ row }: { row: { original: DelegateGroupDetails } }) => <div>{row.original.groupName}</div>
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  if (loading) return <PageSpinner />
  return !loading && delegateDataContent?.length ? (
    <Container>
      <ResourceHandlerTable
        data={delegateDataContent as ParsedColumnContent[]}
        selectedData={selectedData}
        columns={columns}
        onSelectChange={onSelectChange}
      />
    </Container>
  ) : (
    <Layout.Vertical flex={{ align: 'center-center' }} spacing="small">
      <Icon name="resources-icon" size={20} />
      <Text font="medium" color={Color.BLACK}>
        {getString('noData')}
      </Text>
    </Layout.Vertical>
  )
}

export default DelegateResourceModalBody
