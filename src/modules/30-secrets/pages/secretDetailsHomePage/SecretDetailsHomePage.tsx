/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { Container, Layout, Text, Icon, TabNavigation } from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import { Page } from '@common/exports'
import routes from '@common/RouteDefinitions'
import type { Module, ModulePathParams, ProjectPathProps, SecretsPathProps } from '@common/interfaces/RouteInterfaces'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import { ResponseSecretResponseWrapper, SecretDTOV2, useGetSecretV2 } from 'services/cd-ng'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import type { UseGetMockData } from '@common/utils/testUtils'
import { getScopeFromDTO } from '@common/components/EntityReference/EntityReference'
import { Scope } from '@common/interfaces/SecretsInterface'

interface OptionalIdentifiers {
  module?: Module
  orgIdentifier: string
  projectIdentifier: string
  accountId: string
}
interface SecretDetailsProps {
  mockSecretDetails?: UseGetMockData<ResponseSecretResponseWrapper>
}

const getProjectUrl = ({ accountId, projectIdentifier, orgIdentifier, module }: OptionalIdentifiers): string => {
  if (module && orgIdentifier && projectIdentifier) {
    return routes.toProjectOverview({ orgIdentifier, projectIdentifier, accountId, module })
  }
  return routes.toProjectDetails({ accountId, orgIdentifier, projectIdentifier })
}

const getSecretsUrl = ({ accountId, orgIdentifier, projectIdentifier, module }: OptionalIdentifiers): string => {
  return routes.toSecrets({ accountId, orgIdentifier, projectIdentifier, module })
}

const SecretDetaislHomePage: React.FC<SecretDetailsProps> = ({ children }, props) => {
  const { accountId, projectIdentifier, orgIdentifier, secretId, module } = useParams<
    ProjectPathProps & SecretsPathProps & ModulePathParams
  >()
  const { selectedProject } = useAppStore()
  const { loading, data, error, refetch } = useGetSecretV2({
    identifier: secretId,
    queryParams: { accountIdentifier: accountId, projectIdentifier: projectIdentifier, orgIdentifier: orgIdentifier },
    mock: props.mockSecretDetails
  })
  const { getString } = useStrings()
  const secretType = data?.data?.secret.type
  const childrenWithProps = React.isValidElement(children)
    ? React.cloneElement(children, { secretData: data, refetch: refetch })
    : children

  const renderBreadCrumb: React.FC = () => {
    const breadCrumbArray = [
      {
        url: getSecretsUrl({ accountId, projectIdentifier, orgIdentifier, module }),
        label: getString('common.secrets')
      }
    ]
    /* istanbul ignore else */ if (projectIdentifier && !module) {
      breadCrumbArray.unshift({
        url: getProjectUrl({ accountId, projectIdentifier, orgIdentifier, module }),
        label: selectedProject ? selectedProject.name : ''
      })
    }

    if (getScopeFromDTO({ accountId, orgIdentifier, projectIdentifier }) === Scope.ACCOUNT) {
      breadCrumbArray.unshift({
        url: routes.toAccountResources({ accountId }),
        label: getString('common.accountResources')
      })
    }

    return <NGBreadcrumbs links={breadCrumbArray} />
  }

  const renderIcon = (type: SecretDTOV2['type']) => {
    switch (type) {
      case 'SecretText':
        return <Icon name="text" size={24} />
      case 'SecretFile':
        return <Icon name="file" size={24} />
      case 'SSHKey':
        return <Icon name="secret-ssh" size={24} />
    }
  }

  return (
    <>
      <Page.Header
        size="large"
        breadcrumbs={renderBreadCrumb(props)}
        title={
          <Layout.Horizontal spacing="small" flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
            {secretType ? renderIcon(secretType) : null}
            <Container>
              <Text color={Color.GREY_800} font="medium">
                {data?.data?.secret.name || ''}
              </Text>
              <Text color={Color.GREY_400} font="small">
                {data?.data?.secret.identifier || ''}
              </Text>
            </Container>
          </Layout.Horizontal>
        }
        toolbar={
          <TabNavigation
            size={'small'}
            links={[
              {
                label: getString('overview'),
                to: routes.toSecretDetailsOverview({
                  accountId,
                  projectIdentifier,
                  orgIdentifier,
                  secretId,
                  module
                })
              },
              {
                label: getString('common.references'),
                to: routes.toSecretDetailsReferences({
                  accountId,
                  projectIdentifier,
                  orgIdentifier,
                  secretId,
                  module
                })
              }
            ]}
          />
        }
      />
      <Page.Body
        loading={loading}
        retryOnError={() => refetch()}
        error={(error?.data as Error)?.message || error?.message}
        noData={{
          when: () => !data?.data,
          icon: 'nav-project',
          message: getString('entityReference.noRecordFound')
        }}
      >
        {childrenWithProps}
      </Page.Body>
    </>
  )
}

export default SecretDetaislHomePage
