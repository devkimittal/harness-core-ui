import React from 'react'
import { useParams } from 'react-router-dom'
import set from 'lodash-es/set'
import {
  Layout,
  Formik,
  Button,
  FormikForm,
  FormInput,
  Container,
  CardSelect,
  Text,
  StepProps,
  SelectOption,
  Tag
} from '@wings-software/uicore'
import * as Yup from 'yup'
import type { FormikProps } from 'formik'
import {
  DelegateSizeDetails,
  useGetDelegateSizes,
  useValidateKubernetesYaml,
  DelegateSetupDetails
} from 'services/portal'

import { useListDelegateProfilesNg } from 'services/cd-ng'
import { useStrings } from 'framework/strings'

import type { DelegateProfile } from '@delegates/DelegateInterface'
import { useToaster } from '@common/exports'

import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { AddDescriptionAndKVTagsWithIdentifier } from '@common/components/AddDescriptionAndTags/AddDescriptionAndTags'

import { DelegateSize } from '@delegates/constants'
import DelegateSizes from '../../components/DelegateSizes/DelegateSizes'

import css from './DelegateSetupStep.module.scss'

interface DelegateSetupStepProps {
  onBack?: any
}

export interface K8sDelegateWizardData {
  delegateYaml?: DelegateSetupDetails
  name: string
  replicas?: number
}

enum k8sPermissionType {
  CLUSTER_ADMIN = 'CLUSTER_ADMIN',
  CLUSTER_VIEWER = 'CLUSTER_VIEWER',
  NAMESPACE_ADMIN = 'NAMESPACE_ADMIN'
}

//this regex is retrieved from kubernetes
const delegateNameRegex = /^[a-z]([-a-z0-9]*[a-z])?(\.[a-z0-9]([-a-z0-9]*[a-z])?)*$/g

const formatProfileList = (data: any): Array<SelectOption> => {
  const profiles: Array<DelegateProfile> = data?.resource?.response

  const options: Array<SelectOption> = profiles
    ? profiles.map((item: DelegateProfile) => {
        return { label: item.name || '', value: item.uuid || '' }
      })
    : [{ label: '', value: '' }]
  return options
}

const getDefaultDelegateConfiguration = (data: any) => {
  const configurations: DelegateProfile[] = data?.resource?.response
  return configurations ? configurations.find((item: DelegateProfile) => item.primary) : null
}

const getProfile = (data: any, configId: any) => {
  const configs: DelegateProfile[] = data?.resource?.response
  const selProfile = configs ? configs.find(item => item.uuid == configId) : null
  return selProfile?.selectors
}

const DelegateSetup: React.FC<StepProps<K8sDelegateWizardData> & DelegateSetupStepProps> = props => {
  let initialValues
  if (props?.prevStepData?.delegateYaml) {
    const tags = {}
    props?.prevStepData?.delegateYaml?.tags?.forEach(tag => set(tags, tag, ''))
    initialValues = {
      ...props?.prevStepData?.delegateYaml,
      tags
    }
  } else {
    initialValues = {
      name: '',
      identifier: '',
      description: '',
      size: DelegateSize.LAPTOP,
      sesssionIdentifier: '',
      k8sConfigDetails: {
        k8sPermissionType: k8sPermissionType.CLUSTER_ADMIN,
        namespace: ''
      }
    }
  }

  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const { getString } = useStrings()

  const { mutate: createKubernetesYaml } = useValidateKubernetesYaml({
    queryParams: { accountId, projectId: projectIdentifier, orgId: orgIdentifier }
  })

  const { data: delegateSizes } = useGetDelegateSizes({
    queryParams: { accountId, orgId: orgIdentifier, projectId: projectIdentifier }
  })

  const { data } = useListDelegateProfilesNg({
    queryParams: { accountId, orgId: orgIdentifier, projectId: projectIdentifier }
  })
  const defaultProfile = getDefaultDelegateConfiguration(data)
  const profileOptions: SelectOption[] = formatProfileList(data)

  React.useEffect(() => {
    if (defaultProfile) {
      formData['delegateConfigurationId'] = defaultProfile?.uuid
      setInitValues({ ...formData })
    }
  }, [defaultProfile])

  const delegateSizeMappings: DelegateSizeDetails[] | undefined = delegateSizes?.resource

  const { showError } = useToaster()

  const [formData, setInitValues] = React.useState<DelegateSetupDetails>(initialValues as DelegateSetupDetails)

  const [selectedPermission, setSelectedPermission] = React.useState<k8sPermissionType>(
    k8sPermissionType[initialValues?.k8sConfigDetails?.k8sPermissionType || k8sPermissionType.CLUSTER_ADMIN]
  )
  const onSubmit = async (values: DelegateSetupDetails) => {
    const createParams = values
    if (createParams.tags) {
      const tagsArray = Object.keys(values.tags || {})
      set(createParams, 'tags', tagsArray)
    }
    if (projectIdentifier) {
      set(createParams, 'projectIdentifier', projectIdentifier)
    }
    if (orgIdentifier) {
      set(createParams, 'orgIdentifier', orgIdentifier)
    }
    set(createParams, 'delegateType', 'KUBERNETES')
    const response = await createKubernetesYaml({
      ...createParams,
      k8sConfigDetails: {
        k8sPermissionType: selectedPermission,
        namespace: selectedPermission === k8sPermissionType.NAMESPACE_ADMIN ? values?.k8sConfigDetails?.namespace : ''
      }
    })
    if ((response as any)?.responseMessages.length) {
      const err = (response as any)?.responseMessages?.[0]?.message
      showError(err)
    } else {
      const delegateYaml = response.resource
      if (delegateSizeMappings) {
        const delegateSize: DelegateSizeDetails =
          delegateSizeMappings.find((item: DelegateSizeDetails) => item.size === values.size) || delegateSizeMappings[0]
        if (delegateSize) {
          const stepPrevData = {
            delegateYaml,
            name: values.name,
            replicas: delegateSize?.replicas
          }
          props?.nextStep?.(stepPrevData)
        }
      }
    }
  }

  return (
    <Layout.Vertical padding="xxlarge">
      <Container padding="small">
        <Formik
          initialValues={formData}
          onSubmit={values => {
            setInitValues(values)
            onSubmit(values)
            /** to do here */
          }}
          formName="delegateSetupStepForm"
          validationSchema={Yup.object().shape({
            name: Yup.string()
              .trim()
              .required(getString('delegate.delegateNameRequired'))
              .max(63)
              .matches(delegateNameRegex, getString('delegates.delegateNameRegexIssue')),
            size: Yup.string().trim().required(getString('delegate.delegateSizeRequired')),
            k8sConfigDetails: Yup.object().shape({
              k8sPermissionType: Yup.string().trim().required(getString('delegates.permissionRequired')),
              namespace:
                selectedPermission === k8sPermissionType.NAMESPACE_ADMIN
                  ? Yup.string().trim().required(getString('delegates.delegateNamespaceRequired'))
                  : Yup.string().trim()
            })
          })}
        >
          {(formikProps: FormikProps<DelegateSetupDetails>) => {
            const selectors: any = getProfile(data, formikProps.values.delegateConfigurationId)
            return (
              <FormikForm>
                <Container className={css.delegateForm}>
                  <Layout.Horizontal className={css.baseContainer}>
                    <Layout.Vertical className={css.leftPanel}>
                      <div className={css.formGroup}>
                        <AddDescriptionAndKVTagsWithIdentifier
                          identifierProps={{
                            inputLabel: getString('delegate.delegateName')
                          }}
                        />
                      </div>
                      {delegateSizeMappings && (
                        <DelegateSizes
                          onSizeSelect={(size: string) => {
                            formikProps.setFieldValue('size', size)
                          }}
                        />
                      )}
                      {profileOptions && profileOptions.length && (
                        <div className={`${css.formGroup} ${css.profileSelect}`}>
                          <FormInput.Select
                            items={profileOptions}
                            label={getString('delegate.delegateConfigurations')}
                            name={'delegateConfigurationId'}
                          />
                        </div>
                      )}

                      {formikProps.values.delegateConfigurationId && selectors && (
                        <Container className={css.profileSelectors}>
                          <Text>{getString('delegate.tagsFromDelegateConfig')}</Text>
                          <div className={css.profileSelectorsItemsContainer}>
                            {selectors.map((item: string) => (
                              <Tag key={item}>{item}</Tag>
                            ))}
                          </div>
                        </Container>
                      )}
                    </Layout.Vertical>
                    <Layout.Vertical className={css.rightPanel}>
                      <div className={css.permissionsTitle}>{getString('delegates.delegatePermissions.title')}</div>
                      <CardSelect
                        cardClassName={css.permissionSelect}
                        cornerSelected={true}
                        selected={selectedPermission}
                        onChange={selected => {
                          setSelectedPermission(selected)
                          formikProps.validateForm()
                        }}
                        style={{
                          display: 'flex',
                          flexDirection: 'column'
                        }}
                        data={[
                          k8sPermissionType.CLUSTER_ADMIN,
                          k8sPermissionType.CLUSTER_VIEWER,
                          k8sPermissionType.NAMESPACE_ADMIN
                        ]}
                        renderItem={item => {
                          let title
                          let subtitle
                          if (item === k8sPermissionType.CLUSTER_ADMIN) {
                            title = getString('delegates.delegatePermissions.clusterWriteTitle')
                            subtitle = getString('delegates.delegatePermissions.clusterWriteContent')
                          } else if (item === k8sPermissionType.CLUSTER_VIEWER) {
                            title = getString('delegates.delegatePermissions.clusterReadTitle')
                            subtitle = getString('delegates.delegatePermissions.clusterReadContent')
                          } else if (item === k8sPermissionType.NAMESPACE_ADMIN) {
                            title = getString('delegates.delegatePermissions.specificNamespaceTitle')
                            subtitle = getString('delegates.delegatePermissions.specificNamespaceContent')
                          }
                          return (
                            <Container>
                              <div className={css.permissionSelectTitle}>{title}</div>
                              <Text className={css.permissionSelectDetails}>{subtitle}</Text>
                              {item === k8sPermissionType.NAMESPACE_ADMIN && (
                                <div className={css.namespace}>
                                  <FormInput.Text
                                    label={getString('common.namespace')}
                                    name="k8sConfigDetails.namespace"
                                  />
                                </div>
                              )}
                            </Container>
                          )
                        }}
                      />
                    </Layout.Vertical>
                  </Layout.Horizontal>
                </Container>
                <Layout.Horizontal>
                  <Button
                    id="delegateSetupBackBtn"
                    className={`${css.backBtn} ${css.footerBtn}`}
                    text={getString('back')}
                    onClick={props.onBack}
                    icon="chevron-left"
                    margin={{ right: 'small' }}
                  />
                  <Button
                    type="submit"
                    className={`${css.submitBtn} ${css.footerBtn}`}
                    text={getString('continue')}
                    intent="primary"
                    rightIcon="chevron-right"
                  />
                </Layout.Horizontal>
              </FormikForm>
            )
          }}
        </Formik>
      </Container>
    </Layout.Vertical>
  )
}

export default DelegateSetup
