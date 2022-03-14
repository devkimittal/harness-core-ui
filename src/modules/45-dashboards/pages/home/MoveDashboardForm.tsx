/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  Button,
  FontVariation,
  Formik,
  FormikForm as Form,
  FormInput,
  Heading,
  Layout,
  SelectOption,
  Text
} from '@wings-software/uicore'
import * as Yup from 'yup'
import { useParams, useHistory } from 'react-router-dom'
import { useGet } from 'restful-react'
import routes from '@common/RouteDefinitions'
import { useStrings } from 'framework/strings'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useMoveDashboard } from '@dashboards/services/CustomDashboardsService'
import css from './HomePage.module.scss'

const MoveDashboardForm = (props: any): JSX.Element => {
  const { getString } = useStrings()
  const { accountId } = useParams<AccountPathProps>()
  const [errorMessage, setErrorMessage] = React.useState('')
  const history = useHistory()
  const { mutate: moveDashboard, loading } = useMoveDashboard(accountId)
  const dashboardId = props.dashboardId

  const submitForm = async (formData: { folderId: string }) => {
    const response = await moveDashboard({ ...formData, dashboardId })
    return response
  }

  const { data: foldersList, loading: loadingFolders } = useGet({
    // Inferred from RestfulProvider in index.js
    path: 'gateway/dashboard/folder',
    queryParams: { accountId: accountId, page: 1, pageSize: 1000 }
  })

  const folderListItems: SelectOption[] = []
  if (foldersList && foldersList?.resource) {
    folderListItems.length = 0
    foldersList?.resource?.map((folder: { id: string; name: string }) => {
      const _f = {
        value: folder?.id,
        label: folder?.name
      }
      folderListItems.push(_f)
    })
  }

  return (
    <Layout.Vertical padding="xxlarge">
      <Heading level={3} font={{ variation: FontVariation.H3 }} padding={{ bottom: 'large' }}>
        {getString('dashboards.moveModal.moveToFolder')}
      </Heading>
      <Formik
        formLoading={loadingFolders ? loadingFolders : undefined}
        initialValues={{ folderId: '' }}
        formName="moveDashboardForm"
        validationSchema={Yup.object().shape({
          folderId: Yup.string().trim().required(getString('dashboards.createFolder.folderNameValidation'))
        })}
        onSubmit={(formData: { folderId: string }) => {
          setErrorMessage('')
          const response = submitForm(formData)
          response
            .then(data => {
              if (data?.resource) {
                history.push({
                  pathname: routes.toViewCustomFolder({
                    folderId: data?.resource,
                    accountId
                  })
                })
                props?.hideModal?.()
              }
            })
            .catch(() => {
              setErrorMessage(getString('dashboards.moveModal.submitFail'))
            })
        }}
      >
        <Form className={css.formContainer}>
          <Layout.Vertical spacing="large">
            <FormInput.Select
              name="folderId"
              items={folderListItems}
              label={getString('name')}
              placeholder={getString('dashboards.resourceModal.folders')}
            />

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
        </Form>
      </Formik>
    </Layout.Vertical>
  )
}

export default MoveDashboardForm
