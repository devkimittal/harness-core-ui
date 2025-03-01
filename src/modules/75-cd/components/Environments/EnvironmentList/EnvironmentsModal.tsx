/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  Button,
  ButtonVariation,
  Formik,
  FormikForm,
  Label,
  Layout,
  VisualYamlSelectedView as SelectedView,
  VisualYamlToggle,
  Container,
  ThumbnailSelect,
  getErrorInfoFromErrorObject
} from '@wings-software/uicore'
import * as Yup from 'yup'
import { defaultTo, isEqual, omit } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { Classes } from '@blueprintjs/core'
import type { FormikProps } from 'formik'
import { parse } from 'yaml'
import cx from 'classnames'
import {
  EnvironmentRequestDTO,
  EnvironmentResponseDTO,
  useUpsertEnvironmentV2,
  useCreateEnvironmentV2
} from 'services/cd-ng'
import { IdentifierSchema, NameSchema } from '@common/utils/Validation'
import { getScopeFromDTO } from '@common/components/EntityReference/EntityReference'
import { useGetSchemaYaml } from 'services/pipeline-ng'
import { NameIdDescriptionTags, PageSpinner } from '@common/components'
import { useStrings } from 'framework/strings'
import YAMLBuilder from '@common/components/YAMLBuilder/YamlBuilder'
import type { YamlBuilderHandlerBinding, YamlBuilderProps } from '@common/interfaces/YAMLBuilderProps'
import { useToaster } from '@common/exports'
import css from './EnvironmentsList.module.scss'

interface NewEditEnvironmentModalProps {
  isEdit: boolean
  data: EnvironmentResponseDTO
  envIdentifier?: string
  onCreateOrUpdate(data: EnvironmentRequestDTO): void
  closeModal?: () => void
}

const yamlBuilderReadOnlyModeProps: YamlBuilderProps = {
  fileName: `environment.yaml`,
  entityType: 'Environment',
  width: '100%',
  height: 220,
  showSnippetSection: false,
  yamlSanityConfig: {
    removeEmptyString: false,
    removeEmptyObject: false,
    removeEmptyArray: false
  }
}

const cleanData = (values: EnvironmentResponseDTO): EnvironmentRequestDTO => {
  const newDescription = values.description?.toString().trim()
  const newId = values.identifier?.toString().trim()
  const newName = values.name?.toString().trim()
  const newType = values.type?.toString().trim()
  return {
    name: newName,
    identifier: newId,
    orgIdentifier: values.orgIdentifier,
    projectIdentifier: values.projectIdentifier,
    description: newDescription,
    tags: values.tags,
    type: newType as 'PreProduction' | 'Production'
  }
}

export const NewEditEnvironmentModalYaml: React.FC<NewEditEnvironmentModalProps> = ({
  isEdit,
  data,
  onCreateOrUpdate,
  closeModal
}): JSX.Element => {
  const { getString } = useStrings()
  const inputRef = React.useRef<HTMLInputElement | null>(null)
  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    orgIdentifier: string
    projectIdentifier: string
    accountId: string
  }>()
  const [yamlHandler, setYamlHandler] = React.useState<YamlBuilderHandlerBinding | undefined>()
  const [selectedView, setSelectedView] = React.useState<SelectedView>(SelectedView.VISUAL)
  const { loading: createLoading, mutate: createEnvironment } = useCreateEnvironmentV2({
    queryParams: {
      accountIdentifier: accountId
    }
  })
  const { loading: updateLoading, mutate: updateEnvironment } = useUpsertEnvironmentV2({
    queryParams: {
      accountIdentifier: accountId
    }
  })
  const { showSuccess, showError, clear } = useToaster()
  const onSubmit = React.useCallback(
    async (value: EnvironmentRequestDTO) => {
      try {
        const values = cleanData(value)
        if (!values.name) {
          showError(getString('fieldRequired', { field: 'Environment' }))
        } else if (!values.identifier) {
          showError(getString('common.validation.fieldIsRequired', { name: 'Identifier' }))
        } else if (!(isEqual(values.type, 'PreProduction') || isEqual(values.type, 'Production'))) {
          showError(getString('cd.typeError'))
        } else if (isEdit && id !== values.identifier) {
          showError(getString('cd.editIdError', { id: id }))
        } else if (isEdit) {
          const response = await updateEnvironment({
            ...omit(values, 'accountId', 'deleted'),
            orgIdentifier,
            projectIdentifier
          })
          if (response.status === 'SUCCESS') {
            clear()
            showSuccess(getString('cd.environmentUpdated'))
            onCreateOrUpdate(values)
          }
        } else {
          const response = await createEnvironment({ ...values, orgIdentifier, projectIdentifier })
          if (response.status === 'SUCCESS') {
            clear()
            showSuccess(getString('cd.environmentCreated'))
            onCreateOrUpdate(values)
          }
        }
      } catch (e) {
        showError(getErrorInfoFromErrorObject(e, true))
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onCreateOrUpdate, orgIdentifier, projectIdentifier, isEdit]
  )
  React.useEffect(() => {
    inputRef.current?.focus()
  }, [])
  const typeList: { label: string; value: string }[] = [
    {
      label: getString('production'),
      value: 'Production'
    },
    {
      label: getString('nonProduction'),
      value: 'PreProduction'
    }
  ]
  const formikRef = React.useRef<FormikProps<EnvironmentResponseDTO>>()
  const id = data.identifier
  const { data: environmentSchema } = useGetSchemaYaml({
    queryParams: {
      entityType: 'Environment',
      projectIdentifier,
      orgIdentifier,
      accountIdentifier: accountId,
      scope: getScopeFromDTO({ accountIdentifier: accountId, orgIdentifier, projectIdentifier })
    }
  })
  const handleModeSwitch = React.useCallback(
    (view: SelectedView) => {
      if (view === SelectedView.VISUAL) {
        const yaml = defaultTo(yamlHandler?.getLatestYaml(), /* istanbul ignore next */ '')
        const envSetYamlVisual = parse(yaml).environment as EnvironmentResponseDTO
        if (envSetYamlVisual) {
          formikRef.current?.setValues({
            ...omit(cleanData(envSetYamlVisual) as EnvironmentResponseDTO)
          })
        }
      }
      setSelectedView(view)
    },
    [yamlHandler?.getLatestYaml, data]
  )
  if (createLoading || updateLoading) {
    return <PageSpinner />
  }
  return (
    <>
      <Container className={css.yamlToggleEnv}>
        <Layout.Horizontal flex={{ justifyContent: 'flex-start' }} padding-top="8px">
          <VisualYamlToggle
            selectedView={selectedView}
            onChange={nextMode => {
              handleModeSwitch(nextMode)
            }}
          />
        </Layout.Horizontal>
      </Container>
      <Layout.Vertical>
        <Formik<EnvironmentRequestDTO>
          initialValues={data as EnvironmentRequestDTO}
          enableReinitialize={false}
          formName="deployEnv"
          onSubmit={values => {
            onSubmit(values)
          }}
          validationSchema={Yup.object().shape({
            name: NameSchema({ requiredErrorMsg: getString?.('fieldRequired', { field: 'Environment' }) }),
            type: Yup.string().required(getString?.('fieldRequired', { field: 'Type' })),
            identifier: IdentifierSchema()
          })}
        >
          {formikProps => {
            formikRef.current = formikProps
            return (
              <>
                {selectedView === SelectedView.VISUAL ? (
                  <FormikForm>
                    <NameIdDescriptionTags
                      formikProps={formikProps}
                      identifierProps={{
                        inputLabel: getString('name'),
                        inputGroupProps: {
                          inputGroup: {
                            inputRef: ref => (inputRef.current = ref)
                          }
                        },
                        isIdentifierEditable: !isEdit
                      }}
                    />
                    <Layout.Vertical spacing={'small'} style={{ marginBottom: 'var(--spacing-medium)' }}>
                      <Label className={cx(Classes.LABEL, css.label)}>{getString('envType')}</Label>
                      <ThumbnailSelect className={css.thumbnailSelect} name={'type'} items={typeList} />
                    </Layout.Vertical>
                    <Layout.Horizontal spacing="small" padding={{ top: 'xlarge' }}>
                      <Button
                        variation={ButtonVariation.PRIMARY}
                        type={'submit'}
                        text={getString('save')}
                        data-id="environment-save"
                      />
                      &nbsp;
                      <Button variation={ButtonVariation.TERTIARY} text={getString('cancel')} onClick={closeModal} />
                    </Layout.Horizontal>
                  </FormikForm>
                ) : (
                  <Container>
                    <YAMLBuilder
                      {...yamlBuilderReadOnlyModeProps}
                      existingJSON={{
                        environment: {
                          ...omit(formikProps?.values),
                          description: defaultTo(formikProps.values.description, ''),
                          tags: defaultTo(formikProps.values.tags, {}),
                          type: defaultTo(formikProps.values.type, '')
                        }
                      }}
                      schema={environmentSchema?.data}
                      bind={setYamlHandler}
                      showSnippetSection={false}
                    />

                    <Layout.Horizontal padding={{ top: 'large' }}>
                      <Button
                        variation={ButtonVariation.PRIMARY}
                        type="submit"
                        text={getString('save')}
                        onClick={() => {
                          const latestYaml = defaultTo(yamlHandler?.getLatestYaml(), /* istanbul ignore next */ '')
                          onSubmit(parse(latestYaml)?.environment)
                        }}
                      />
                      &nbsp; &nbsp;
                      <Button variation={ButtonVariation.TERTIARY} onClick={closeModal} text={getString('cancel')} />
                    </Layout.Horizontal>
                  </Container>
                )}
              </>
            )
          }}
        </Formik>
      </Layout.Vertical>
    </>
  )
}
