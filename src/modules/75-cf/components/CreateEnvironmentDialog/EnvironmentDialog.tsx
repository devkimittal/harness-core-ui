/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { Dialog, Spinner } from '@blueprintjs/core'
import {
  Button,
  ButtonProps,
  CardSelect,
  Collapse,
  Container,
  Formik,
  FormInput,
  IconName,
  Layout,
  Text
} from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import { useModalHook } from '@harness/use-modal'
import * as Yup from 'yup'
import { ResponseEnvironmentResponseDTO, useCreateEnvironment } from 'services/cd-ng'
import { IdentifierSchema, NameSchema } from '@common/utils/Validation'
import { useToaster } from '@common/exports'
import { useEnvStrings } from '@cf/hooks/environment'
import { getErrorMessage } from '@cf/utils/CFUtils'
import { EnvironmentType } from '@common/constants/EnvironmentType'
import RbacButton from '@rbac/components/Button/Button'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import usePlanEnforcement from '@cf/hooks/usePlanEnforcement'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import css from './EnvironmentDialog.module.scss'

const collapseProps = {
  collapsedIcon: 'plus' as IconName,
  expandedIcon: 'minus' as IconName,
  isOpen: false,
  isRemovable: false
}

export interface EnvironmentDialogProps {
  disabled?: boolean
  onCreate: (response?: ResponseEnvironmentResponseDTO) => void
  buttonProps?: ButtonProps
}

interface EnvironmentValues {
  name: string
  identifier: string
  description: string
  tags: string[]
  type: EnvironmentType
}

const identity = (x: any) => x as string

const EnvironmentDialog: React.FC<EnvironmentDialogProps> = ({ disabled, onCreate, buttonProps }) => {
  const { showError } = useToaster()
  const { getString, getEnvString } = useEnvStrings()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<Record<string, string>>()
  const { mutate: createEnv, loading } = useCreateEnvironment({
    queryParams: {
      accountId
    }
  })

  const envTypes = [
    {
      text: getString('production'),
      value: EnvironmentType.PRODUCTION
    },
    {
      text: getString('nonProduction'),
      value: EnvironmentType.NON_PRODUCTION
    }
  ]

  const getTypeOption = (v: string) => envTypes.find(x => x.value === v) || envTypes[0]

  const initialValues: EnvironmentValues = {
    name: '',
    identifier: '',
    description: '',
    type: EnvironmentType.NON_PRODUCTION,
    tags: []
  }

  const handleSubmit = (values: EnvironmentValues) => {
    createEnv({
      name: values.name,
      identifier: values.identifier,
      description: values.description,
      projectIdentifier,
      orgIdentifier,
      type: values.type,
      tags: values.tags.length > 0 ? values.tags.reduce((acc, next) => ({ ...acc, [next]: next }), {}) : {}
    })
      .then(response => {
        hideModal()
        onCreate(response)
      })
      .catch(error => {
        showError(getErrorMessage(error), 0, 'cf.create.env.error')
      })
  }

  const { isPlanEnforcementEnabled } = usePlanEnforcement()

  const planEnforcementProps = isPlanEnforcementEnabled
    ? {
        featuresProps: {
          featuresRequest: {
            featureNames: [FeatureIdentifier.MAUS]
          }
        }
      }
    : undefined

  const [openModal, hideModal] = useModalHook(() => {
    return (
      <Dialog enforceFocus={false} isOpen onClose={hideModal} className={css.dialog}>
        <Formik
          initialValues={initialValues}
          formName="cfEnvDialog"
          onSubmit={handleSubmit}
          onReset={hideModal}
          validationSchema={Yup.object().shape({
            name: NameSchema({ requiredErrorMsg: getString?.('fieldRequired', { field: 'Environment' }) }),
            identifier: IdentifierSchema()
          })}
        >
          {formikProps => {
            return (
              <Container
                padding="xxxlarge"
                style={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  paddingBottom: 'var(--spacing-medium)'
                }}
              >
                <Text font={{ size: 'medium', weight: 'bold' }} color={Color.BLACK}>
                  {getEnvString('create.title')}
                </Text>
                <Text margin={{ top: 'large', bottom: 'large' }}>{getEnvString('create.description')}</Text>
                <Layout.Vertical
                  spacing="small"
                  style={{ minHeight: 415, overflow: 'auto', padding: 'var(--spacing-xsmall)' }}
                >
                  <FormInput.InputWithIdentifier
                    inputName="name"
                    idName="identifier"
                    isIdentifierEditable
                    inputLabel={getEnvString('create.nameLabel')}
                    inputGroupProps={{ inputGroup: { autoFocus: true } }}
                  />
                  <Layout.Vertical>
                    <Container className={css.collapse}>
                      <Collapse
                        {...collapseProps}
                        heading={getString('description')}
                        collapseHeaderClassName={css.collapseHeaderFix}
                      >
                        <FormInput.TextArea name="description" />
                      </Collapse>
                    </Container>
                    <Container className={css.collapse}>
                      <Collapse
                        {...collapseProps}
                        heading={getString('tagsLabel')}
                        collapseHeaderClassName={css.collapseHeaderFix}
                      >
                        <FormInput.TagInput
                          name="tags"
                          label=""
                          items={[]}
                          labelFor={identity}
                          itemFromNewTag={identity}
                          tagInputProps={{
                            showClearAllButton: true,
                            allowNewTag: true,
                            placeholder: 'Tags'
                          }}
                        />
                      </Collapse>
                    </Container>
                  </Layout.Vertical>
                  <Layout.Vertical spacing="small" style={{ margin: 'auto 0' }}>
                    <Text font={{ size: 'normal' }} padding={{ top: 'medium' }}>
                      {getEnvString('create.envTypeLabel')}
                    </Text>
                    <CardSelect
                      cornerSelected
                      data={envTypes}
                      selected={getTypeOption(formikProps.values.type)}
                      className={css.cardSelect}
                      onChange={nextValue => formikProps.setFieldValue('type', nextValue.value)}
                      renderItem={cardData => (
                        <Container
                          flex={{ align: 'center-center', distribution: 'space-between' }}
                          className="cardBody"
                        >
                          {cardData.text}
                        </Container>
                      )}
                    />
                  </Layout.Vertical>
                </Layout.Vertical>
                <Container
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    marginTop: 'auto'
                  }}
                >
                  <Button
                    text={getString('createSecretYAML.create')}
                    onClick={() => formikProps.handleSubmit()}
                    intent="primary"
                    disabled={loading}
                  />
                  <Button text={getString('cancel')} onClick={() => formikProps.handleReset()} minimal />
                  {loading && <Spinner size={16} />}
                </Container>
              </Container>
            )
          }}
        </Formik>
      </Dialog>
    )
  }, [loading])

  return (
    <RbacButton
      disabled={disabled}
      onClick={openModal}
      text={`+ ${getString('environment')}`}
      intent="primary"
      padding={{
        top: 'small',
        bottom: 'small',
        left: 'huge',
        right: 'huge'
      }}
      permission={{
        resource: { resourceType: ResourceType.ENVIRONMENT },
        permission: PermissionIdentifier.EDIT_ENVIRONMENT
      }}
      {...buttonProps}
      {...planEnforcementProps}
    />
  )
}

export default EnvironmentDialog
