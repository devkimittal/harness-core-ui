/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  Button,
  Container,
  FontVariation,
  Formik,
  FormikForm as Form,
  FormInput,
  Heading,
  Layout,
  OverlaySpinner,
  SelectOption,
  Text
} from '@wings-software/uicore'
import * as Yup from 'yup'
import { useParams } from 'react-router-dom'
import { useGet } from 'restful-react'
import { useStrings } from 'framework/strings'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import css from './HomePage.module.scss'

const TAGS_SEPARATOR = ','

const DashboardForm = (props: any): JSX.Element => {
  const { getString } = useStrings()
  const { accountId } = useParams<AccountPathProps>()
  const [errorMessage, setErrorMessage] = React.useState('')
  const [initialValues, setInitialValues] = React.useState({
    folderId: props?.formData?.folderId,
    name: props?.formData?.title,
    description: props?.formData?.description?.split(TAGS_SEPARATOR)
  })
  const [folderListItems, setFolderListItems] = React.useState<SelectOption[]>([])

  const sharedFolder = {
    value: 'shared',
    label: 'Organization Shared Folder'
  }

  const { data: foldersList } = useGet({
    path: 'gateway/dashboard/folder',
    queryParams: { accountId: accountId, page: 1, pageSize: 1000 }
  })

  const isMissingFolderId = (folders: any) => !folders.some((item: any) => item.value === props?.formData?.folderId)

  React.useEffect(() => {
    if (foldersList?.resource) {
      const folders = foldersList?.resource?.map((folder: { id: string; name: string }) => {
        return { value: folder?.id, label: folder?.name }
      })
      if (isMissingFolderId(folders)) {
        setInitialValues({ ...initialValues, folderId: 'shared' })
      }
      setFolderListItems([sharedFolder, ...folders])
    }
  }, [foldersList])

  return (
    <Layout.Vertical padding="xxlarge">
      <Heading level={3} font={{ variation: FontVariation.H3 }} padding={{ bottom: 'large' }}>
        {props?.text?.title}
      </Heading>
      {!folderListItems?.length ? (
        <Container padding="xxxlarge">
          <OverlaySpinner show={true}>
            <></>
          </OverlaySpinner>
        </Container>
      ) : (
        <>
          <Formik
            initialValues={initialValues}
            formName="dashboardForm"
            validationSchema={Yup.object().shape({
              folderId: Yup.string().trim().required(getString('dashboards.createFolder.folderNameValidation')),
              name: Yup.string().trim().required(getString('dashboards.createModal.nameValidation'))
            })}
            onSubmit={(formData: { folderId: string; name: string; description: string[] }) => {
              setErrorMessage('')
              const response = props?.submitForm?.({
                ...formData,
                description: formData.description?.join(TAGS_SEPARATOR)
              })
              response.then(props?.onSuccess).catch(() => {
                setErrorMessage(props?.text?.error)
              })
            }}
          >
            <Form className={css.formContainer}>
              <Layout.Vertical spacing="large">
                <FormInput.Select
                  name="folderId"
                  items={folderListItems}
                  label={getString('dashboards.homePage.folder')}
                  placeholder={getString('dashboards.resourceModal.folders')}
                />
                <FormInput.Text
                  name="name"
                  label={getString('name')}
                  placeholder={getString('dashboards.createModal.namePlaceholder')}
                />
                <FormInput.KVTagInput name="description" label={getString('tagsLabel')} isArray={true} />
                <Button
                  type="submit"
                  intent="primary"
                  width="150px"
                  text={getString('continue')}
                  disabled={props?.loading}
                  className={css.button}
                />
                {errorMessage && <Text intent="danger">{errorMessage}</Text>}
              </Layout.Vertical>
            </Form>
          </Formik>
        </>
      )}
    </Layout.Vertical>
  )
}

export default DashboardForm
