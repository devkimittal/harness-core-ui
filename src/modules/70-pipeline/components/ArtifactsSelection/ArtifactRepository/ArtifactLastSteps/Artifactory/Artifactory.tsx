/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useEffect, useState } from 'react'
import { Menu } from '@blueprintjs/core'
import {
  Formik,
  FormInput,
  getMultiTypeFromValue,
  Layout,
  MultiTypeInputType,
  Button,
  StepProps,
  Text,
  ButtonVariation,
  SelectOption
} from '@wings-software/uicore'
import { FontVariation } from '@harness/design-system'
import { Form } from 'formik'
import * as Yup from 'yup'
import { defaultTo, get, map, memoize, merge } from 'lodash-es'
import { useParams } from 'react-router-dom'
import type { GetDataError } from 'restful-react'
import { useStrings } from 'framework/strings'
import type { GitQueryParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'

import {
  ConnectorConfigDTO,
  DockerBuildDetailsDTO,
  Failure,
  useGetBuildDetailsForArtifactoryArtifact,
  useGetRepositoriesDetailsForArtifactory
} from 'services/cd-ng'
import {
  checkIfQueryParamsisNotEmpty,
  getArtifactFormData,
  getConnectorIdValue,
  getFinalArtifactFormObj,
  repositoryFormat,
  resetTag,
  shouldFetchTags
} from '@pipeline/components/ArtifactsSelection/ArtifactUtils'
import { isServerlessDeploymentType } from '@pipeline/utils/stageHelpers'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import type {
  ArtifactType,
  ImagePathProps,
  ImagePathTypes
} from '@pipeline/components/ArtifactsSelection/ArtifactInterface'
import { EXPRESSION_STRING } from '@pipeline/utils/constants'
import { ArtifactIdentifierValidation, ModalViewFor } from '../../../ArtifactHelper'
import ArtifactImagePathTagView from '../ArtifactImagePathTagView/ArtifactImagePathTagView'
import SideCarArtifactIdentifier from '../SideCarArtifactIdentifier'
import css from '../../ArtifactConnector.module.scss'

function NoRepositoryResults({ error }: { error: GetDataError<Failure | Error> | null }): JSX.Element {
  const { getString } = useStrings()

  return (
    <span className={css.padSmall}>
      <Text lineClamp={1}>
        {get(error, 'data.message', null) || getString('pipeline.artifactsSelection.errors.noRepositories')}
      </Text>
    </span>
  )
}

const getRepositoryValue = (
  formData: ImagePathTypes & { connectorId?: string },
  isServerlessDeploymentTypeSelected = false
): string => {
  if (isServerlessDeploymentTypeSelected) {
    if (formData?.repository?.value) {
      return formData?.repository?.value
    }
    return formData?.repository
  }
  return formData?.repository
}

function Artifactory({
  context,
  handleSubmit,
  expressions,
  allowableTypes,
  prevStepData,
  initialValues,
  previousStep,
  artifactIdentifiers,
  isReadonly = false,
  selectedArtifact,
  selectedDeploymentType
}: StepProps<ConnectorConfigDTO> & ImagePathProps): React.ReactElement {
  const { getString } = useStrings()
  const [lastQueryData, setLastQueryData] = useState({ artifactPath: '', repository: '' })

  const [tagList, setTagList] = useState<DockerBuildDetailsDTO[] | undefined>([])
  const [connectorRepos, setConnectorRepos] = useState<SelectOption[]>([])
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const isServerlessDeploymentTypeSelected = isServerlessDeploymentType(selectedDeploymentType)

  const schemaObject = {
    artifactPath: Yup.string().trim().required(getString('pipeline.artifactsSelection.validation.artifactPath')),
    repository: Yup.string().trim().required(getString('common.git.validation.repoRequired')),
    tagType: Yup.string().required(),
    tagRegex: Yup.string().when('tagType', {
      is: 'regex',
      then: Yup.string().trim().required(getString('pipeline.artifactsSelection.validation.tagRegex'))
    }),
    tag: Yup.mixed().when('tagType', {
      is: 'value',
      then: Yup.mixed().required(getString('pipeline.artifactsSelection.validation.tag'))
    })
  }

  const serverlessArtifactorySchema = {
    repository: Yup.string().trim().required(getString('common.git.validation.repoRequired')),
    artifactDirectory: Yup.string()
      .trim()
      .required(getString('pipeline.artifactsSelection.validation.artifactDirectory')),
    tagType: Yup.string().required(),
    tagRegex: Yup.string().when('tagType', {
      is: 'regex',
      then: Yup.string().trim().required(getString('pipeline.artifactsSelection.validation.artifactPathFilter'))
    }),
    tag: Yup.mixed().when('tagType', {
      is: 'value',
      then: Yup.mixed().required(getString('pipeline.artifactsSelection.validation.artifactPath'))
    })
  }

  const primarySchema = Yup.object().shape(schemaObject)

  const serverlessPrimarySchema = Yup.object().shape(serverlessArtifactorySchema)

  const sidecarSchema = Yup.object().shape({
    ...schemaObject,
    ...ArtifactIdentifierValidation(
      artifactIdentifiers,
      initialValues?.identifier,
      getString('pipeline.uniqueIdentifier')
    )
  })

  const getConnectorRefQueryData = (): string => {
    return defaultTo(prevStepData?.connectorId?.value, prevStepData?.identifier)
  }

  const {
    data: artifactRepoData,
    loading: artifactRepoLoading,
    refetch: getArtifactRepos,
    error: artifactRepoError
  } = useGetRepositoriesDetailsForArtifactory({
    queryParams: {
      connectorRef: prevStepData?.connectorId.value,
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      repositoryType: 'generic'
    },
    lazy: true
  })

  useEffect(() => {
    if (artifactRepoLoading) {
      setConnectorRepos([{ label: 'Loading Repos...', value: 'Loading Repos...' }])
    }
    if ((artifactRepoError?.data as Failure)?.status === 'ERROR') {
      const errorMessage = (artifactRepoError?.data as Failure)?.message as string
      setConnectorRepos([{ label: errorMessage, value: errorMessage }])
    }
  }, [artifactRepoLoading, artifactRepoError])

  useEffect(() => {
    if (getMultiTypeFromValue(prevStepData?.connectorId.value) === MultiTypeInputType.FIXED && !artifactRepoData) {
      getArtifactRepos()
    }
    if (artifactRepoData) {
      setConnectorRepos(map(artifactRepoData.data?.repositories, repo => ({ label: repo, value: repo })))
    }
  }, [artifactRepoData, prevStepData?.connectorId.value])

  const {
    data,
    loading: artifactoryBuildDetailsLoading,
    refetch: refetchArtifactoryTag,
    error: artifactoryTagError
  } = useGetBuildDetailsForArtifactoryArtifact({
    queryParams: {
      artifactPath: lastQueryData.artifactPath,
      repository: lastQueryData.repository,
      repositoryFormat: isServerlessDeploymentTypeSelected ? 'generic' : repositoryFormat,
      connectorRef: getConnectorRefQueryData(),
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      repoIdentifier,
      branch
    },
    lazy: true,
    debounce: 300
  })

  useEffect(() => {
    if (checkIfQueryParamsisNotEmpty(Object.values(lastQueryData))) {
      refetchArtifactoryTag()
    }
  }, [lastQueryData, refetchArtifactoryTag])
  useEffect(() => {
    if (artifactoryTagError) {
      setTagList([])
    } else if (Array.isArray(data?.data?.buildDetailsList)) {
      setTagList(data?.data?.buildDetailsList)
    }
  }, [data?.data?.buildDetailsList, artifactoryTagError])

  const canFetchTags = useCallback(
    (artifactPath: string, repository: string): boolean => {
      return !!(
        (lastQueryData.artifactPath !== artifactPath || lastQueryData.repository !== repository) &&
        shouldFetchTags(prevStepData, [artifactPath, repository])
      )
    },
    [lastQueryData, prevStepData]
  )
  const fetchTags = useCallback(
    (artifactPath = '', repository = ''): void => {
      if (canFetchTags(artifactPath, repository)) {
        setLastQueryData({ artifactPath, repository })
      }
    },
    [canFetchTags]
  )

  const isTagDisabled = useCallback((formikValue): boolean => {
    return !checkIfQueryParamsisNotEmpty([formikValue.artifactPath, formikValue.repository])
  }, [])

  const isArtifactPathDisabled = useCallback((formikValue): boolean => {
    return !checkIfQueryParamsisNotEmpty([formikValue.artifactDirectory, formikValue.repository])
  }, [])

  const getInitialValues = useCallback((): ImagePathTypes => {
    return getArtifactFormData(
      initialValues,
      selectedArtifact as ArtifactType,
      context === ModalViewFor.SIDECAR,
      isServerlessDeploymentTypeSelected
    )
  }, [context, initialValues, selectedArtifact])

  const submitFormData = (formData: ImagePathTypes & { connectorId?: string }): void => {
    const artifactObj = getFinalArtifactFormObj(
      formData,
      context === ModalViewFor.SIDECAR,
      isServerlessDeploymentTypeSelected
    )
    merge(artifactObj.spec, {
      repository: getRepositoryValue(formData, isServerlessDeploymentTypeSelected),
      repositoryUrl: formData?.repositoryUrl,
      repositoryFormat: isServerlessDeploymentTypeSelected ? 'generic' : repositoryFormat
    })
    handleSubmit(artifactObj)
  }

  const itemRenderer = memoize((item: { label: string }, { handleClick }) => (
    <div key={item.label.toString()}>
      <Menu.Item
        text={
          <Layout.Horizontal spacing="small">
            <Text>{item.label}</Text>
          </Layout.Horizontal>
        }
        disabled={artifactRepoLoading || (artifactRepoError?.data as Failure)?.status === 'ERROR'}
        onClick={handleClick}
      />
    </div>
  ))

  const getValidationSchema = useCallback(() => {
    if (context === ModalViewFor.SIDECAR) {
      return sidecarSchema
    }
    if (isServerlessDeploymentTypeSelected) {
      return serverlessPrimarySchema
    }
    return primarySchema
  }, [context, isServerlessDeploymentTypeSelected, primarySchema, serverlessPrimarySchema, sidecarSchema])

  return (
    <Layout.Vertical spacing="medium" className={css.firstep}>
      <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'medium' }}>
        {getString('pipeline.artifactsSelection.artifactDetails')}
      </Text>
      <Formik
        initialValues={getInitialValues()}
        formName="artifactoryArtifact"
        validationSchema={getValidationSchema()}
        onSubmit={formData => {
          submitFormData({
            ...prevStepData,
            ...formData,
            tag: defaultTo(formData?.tag?.value, formData?.tag),
            connectorId: getConnectorIdValue(prevStepData)
          })
        }}
      >
        {formik => (
          <Form>
            <div className={css.connectorForm}>
              {context === ModalViewFor.SIDECAR && <SideCarArtifactIdentifier />}
              {!isServerlessDeploymentTypeSelected && (
                <div className={css.imagePathContainer}>
                  <FormInput.MultiTextInput
                    label={getString('repositoryUrlLabel')}
                    name="repositoryUrl"
                    isOptional
                    placeholder={getString('pipeline.repositoryUrlPlaceholder')}
                    multiTextInputProps={{
                      expressions,
                      allowableTypes
                    }}
                  />

                  {getMultiTypeFromValue(formik.values.repositoryUrl) === MultiTypeInputType.RUNTIME && (
                    <div className={css.configureOptions}>
                      <ConfigureOptions
                        style={{ alignSelf: 'center' }}
                        value={formik.values?.repositoryUrl as string}
                        type={getString('string')}
                        variableName="repositoryUrl"
                        showRequiredField={false}
                        showDefaultField={false}
                        showAdvanced={true}
                        onChange={value => {
                          formik.setFieldValue('repositoryUrl', value)
                        }}
                        isReadonly={isReadonly}
                      />
                    </div>
                  )}
                </div>
              )}

              {isServerlessDeploymentTypeSelected ? (
                <div className={css.imagePathContainer}>
                  <FormInput.MultiTypeInput
                    className={css.tagInputButton}
                    name={'repository'}
                    label={getString('repository')}
                    selectItems={connectorRepos}
                    disabled={isReadonly}
                    multiTypeInputProps={{
                      expressions,
                      allowableTypes,
                      selectProps: {
                        defaultSelectedItem: formik.values?.repository,
                        noResults: <NoRepositoryResults error={artifactRepoError} />,
                        items: connectorRepos,
                        addClearBtn: true,
                        itemRenderer: itemRenderer,
                        allowCreatingNewItems: true
                      },
                      onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
                        if (
                          e?.target?.type !== 'text' ||
                          (e?.target?.type === 'text' && e?.target?.placeholder === EXPRESSION_STRING)
                        ) {
                          return
                        }
                        getArtifactRepos()
                      }
                    }}
                  />

                  {getMultiTypeFromValue(formik.values.repository) === MultiTypeInputType.RUNTIME && (
                    <div className={css.configureOptions}>
                      <ConfigureOptions
                        value={formik.values.repository}
                        type="String"
                        variableName="repository"
                        showRequiredField={false}
                        showDefaultField={false}
                        showAdvanced={true}
                        onChange={value => {
                          formik.setFieldValue('repository', value)
                        }}
                        isReadonly={isReadonly}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className={css.imagePathContainer}>
                  <FormInput.MultiTextInput
                    label={getString('repository')}
                    name="repository"
                    placeholder={getString('pipeline.artifactsSelection.repositoryPlaceholder')}
                    multiTextInputProps={{
                      expressions,
                      allowableTypes
                    }}
                    onChange={() => {
                      tagList?.length && setTagList([])
                      resetTag(formik)
                    }}
                  />

                  {getMultiTypeFromValue(formik.values.repository) === MultiTypeInputType.RUNTIME && (
                    <div className={css.configureOptions}>
                      <ConfigureOptions
                        style={{ alignSelf: 'center' }}
                        value={formik.values?.repository as string}
                        type={getString('string')}
                        variableName="repository"
                        showRequiredField={false}
                        showDefaultField={false}
                        showAdvanced={true}
                        onChange={value => {
                          formik.setFieldValue('repository', value)
                        }}
                        isReadonly={isReadonly}
                      />
                    </div>
                  )}
                </div>
              )}

              {isServerlessDeploymentTypeSelected && (
                <div className={css.imagePathContainer}>
                  <FormInput.MultiTextInput
                    label={getString('pipeline.artifactsSelection.artifactDirectory')}
                    name="artifactDirectory"
                    placeholder={getString('pipeline.artifactsSelection.artifactDirectoryPlaceholder')}
                    multiTextInputProps={{
                      expressions,
                      allowableTypes
                    }}
                    onChange={() => {
                      tagList?.length && setTagList([])
                      resetTag(formik)
                    }}
                  />

                  {getMultiTypeFromValue(formik.values.repository) === MultiTypeInputType.RUNTIME && (
                    <div className={css.configureOptions}>
                      <ConfigureOptions
                        style={{ alignSelf: 'center' }}
                        value={formik.values?.repository as string}
                        type={getString('string')}
                        variableName="artifactDirectory"
                        showRequiredField={false}
                        showDefaultField={false}
                        showAdvanced={true}
                        onChange={value => {
                          formik.setFieldValue('artifactDirectory', value)
                        }}
                        isReadonly={isReadonly}
                      />
                    </div>
                  )}
                </div>
              )}

              <ArtifactImagePathTagView
                selectedArtifact={selectedArtifact as ArtifactType}
                formik={formik}
                expressions={expressions}
                allowableTypes={allowableTypes}
                isReadonly={isReadonly}
                connectorIdValue={getConnectorIdValue(prevStepData)}
                fetchTags={artifactPath => {
                  if (isServerlessDeploymentTypeSelected) {
                    fetchTags(artifactPath, formik?.values?.repository.value)
                  } else {
                    fetchTags(artifactPath, formik?.values?.repository)
                  }
                }}
                buildDetailsLoading={artifactoryBuildDetailsLoading}
                tagError={artifactoryTagError}
                tagList={tagList}
                setTagList={setTagList}
                tagDisabled={
                  isServerlessDeploymentTypeSelected
                    ? isArtifactPathDisabled(formik?.values)
                    : isTagDisabled(formik?.values)
                }
                isArtifactPath={true}
                isServerlessDeploymentTypeSelected={isServerlessDeploymentTypeSelected}
              />
            </div>
            <Layout.Horizontal spacing="medium">
              <Button
                variation={ButtonVariation.SECONDARY}
                text={getString('back')}
                icon="chevron-left"
                onClick={() => previousStep?.(prevStepData)}
              />
              <Button
                variation={ButtonVariation.PRIMARY}
                type="submit"
                text={getString('submit')}
                rightIcon="chevron-right"
              />
            </Layout.Horizontal>
          </Form>
        )}
      </Formik>
    </Layout.Vertical>
  )
}
export default Artifactory
