/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams, useHistory } from 'react-router-dom'
import { Layout, Container } from '@wings-software/uicore'
import { useMutate } from 'restful-react'
import { useStrings } from 'framework/strings'
import routes from '@common/RouteDefinitions'
import DashboardForm from './DashboardForm'
import css from './HomePage.module.scss'

const CreateDashboardForm = (props: any): JSX.Element => {
  const { getString } = useStrings()
  const { accountId, folderId } = useParams<{ accountId: string; folderId: string }>()
  const history = useHistory()

  const { mutate: createDashboard, loading } = useMutate({
    verb: 'POST',
    path: folderId ? 'gateway/dashboard/v2/create' : 'gateway/dashboard/create',
    queryParams: { accountId: accountId }
  })

  const submitForm = async (formData: { name: string; description: string; folderId: string }) => {
    const response = await createDashboard(formData)
    return response
  }

  const onSuccess = (data: any) => {
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
  }

  return (
    <Layout.Horizontal flex={{ justifyContent: 'space-evenly' }}>
      <Container width="50%">
        <DashboardForm
          text={{
            title: getString('dashboards.createModal.stepOne'),
            error: getString('dashboards.createModal.submitFail')
          }}
          loading={loading}
          submitForm={submitForm}
          onSuccess={onSuccess}
          hideModal={props.hideModal}
        />
      </Container>
      <Container width="50%" flex={{ align: 'center-center' }} padding="xxlarge" className={css.videoContainer}>
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

export default CreateDashboardForm
