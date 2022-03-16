/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams, useHistory } from 'react-router-dom'
import routes from '@common/RouteDefinitions'
import { useStrings } from 'framework/strings'
import { UpdateDashboard, useUpdateDashboard } from '@dashboards/services/CustomDashboardsService'
import DashboardForm from './DashboardForm'

const UpdateDashboardForm = (props: any): JSX.Element => {
  const { getString } = useStrings()
  const { accountId } = useParams<{ accountId: string; folderId: string }>()
  const history = useHistory()
  const { mutate: updateDashboard, loading } = useUpdateDashboard(accountId)
  const dashboardId = props.formData.id

  const onSubmit = async (formData: UpdateDashboard) => {
    const response = await updateDashboard({ ...formData, dashboardId })
    return response
  }

  const onSuccess = (data: any) => {
    if (data?.resource) {
      props?.hideModal?.()
      if (data?.resource?.resourceIdentifier !== props.formData.resourceIdentifier) {
        history.push({
          pathname: routes.toViewCustomFolder({
            accountId: accountId,
            folderId: data?.resource?.resourceIdentifier
          })
        })
      } else {
        props?.reloadDashboards?.()
      }
    }
  }

  return (
    <DashboardForm
      text={{
        title: getString('dashboards.editModal.editDashboard'),
        error: getString('dashboards.editModal.submitFail')
      }}
      formData={{
        folderId: props.formData.resourceIdentifier,
        title: props.formData.title,
        description: props.formData.description
      }}
      loading={loading}
      submitForm={onSubmit}
      onSuccess={onSuccess}
      hideModal={props.hideModal}
    />
  )
}

export default UpdateDashboardForm
