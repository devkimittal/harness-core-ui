/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import { defaultTo, get } from 'lodash-es'

import {
  FormInput,
  getMultiTypeFromValue,
  Layout,
  MultiTypeInputType,
  SelectOption,
  Text
} from '@wings-software/uicore'
import { ArtifactSourceBase, ArtifactSourceRenderProps } from '@cd/factory/ArtifactSourceFactory/ArtifactSourceBase'
import { yamlStringify } from '@common/utils/YamlHelperMethods'
import { useMutateAsGet } from '@common/hooks'
import { SidecarArtifact, useGetBuildDetailsForAcrWithYaml } from 'services/cd-ng'
import { useListAzureRegistries, useListAzureRepositories, useListAzureSubscriptions } from 'services/portal'
import { ArtifactToConnectorMap, ENABLED_ARTIFACT_TYPES } from '@pipeline/components/ArtifactsSelection/ArtifactHelper'
import { TriggerDefaultFieldList } from '@triggers/pages/triggers/utils/TriggersWizardPageUtils'
import { useStrings } from 'framework/strings'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import ExperimentalInput from '../../K8sServiceSpecForms/ExperimentalInput'
import { isFieldRuntime } from '../../K8sServiceSpecHelper'
import { getYamlData, isArtifactSourceRuntime, isFieldfromTriggerTabDisabled, resetTags } from '../artifactSourceUtils'
import ArtifactTagRuntimeField from '../ArtifactSourceRuntimeFields/ArtifactTagRuntimeField'
import css from '../../K8sServiceSpec.module.scss'

interface ACRRenderContent extends ArtifactSourceRenderProps {
  isTagsSelectionDisabled: (data: ArtifactSourceRenderProps) => boolean
}

const Content = (props: ACRRenderContent): JSX.Element => {
  const {
    isPrimaryArtifactsRuntime,
    isSidecarRuntime,
    template,
    formik,
    path,
    initialValues,
    accountId,
    projectIdentifier,
    orgIdentifier,
    readonly,
    repoIdentifier,
    pipelineIdentifier,
    branch,
    stageIdentifier,
    isTagsSelectionDisabled,
    allowableTypes,
    fromTrigger,
    artifact,
    isSidecar,
    artifactPath
  } = props

  const { getString } = useStrings()
  const isPropagatedStage = path?.includes('serviceConfig.stageOverrides')
  const { expressions } = useVariablesExpression()
  const [subscriptions, setSubscriptions] = React.useState<SelectOption[]>([])
  const [registries, setRegistries] = React.useState<SelectOption[]>([])
  const [repositories, setRepositories] = React.useState<SelectOption[]>([])

  const {
    data: acrTagsData,
    loading: fetchingTags,
    refetch: fetchTags,
    error: fetchTagsError
  } = useMutateAsGet(useGetBuildDetailsForAcrWithYaml, {
    body: yamlStringify(getYamlData(formik?.values)),
    requestOptions: {
      headers: {
        'content-type': 'application/json'
      }
    },
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      repoIdentifier,
      branch,
      connectorRef:
        getMultiTypeFromValue(artifact?.spec?.connectorRef) !== MultiTypeInputType.RUNTIME
          ? artifact?.spec?.connectorRef
          : get(initialValues?.artifacts, `${artifactPath}.spec.connectorRef`, ''),
      subscription:
        getMultiTypeFromValue(artifact?.spec?.subscription) !== MultiTypeInputType.RUNTIME
          ? artifact?.spec?.subscription
          : get(initialValues, `artifacts.${artifactPath}.spec.subscription`, ''),
      registry:
        getMultiTypeFromValue(artifact?.spec?.registry) !== MultiTypeInputType.RUNTIME
          ? artifact?.spec?.registry
          : get(initialValues, `artifacts.${artifactPath}.spec.registry`, ''),
      repository:
        getMultiTypeFromValue(artifact?.spec?.repository) !== MultiTypeInputType.RUNTIME
          ? artifact?.spec?.repository
          : get(initialValues, `artifacts.${artifactPath}.spec.repository`, ''),
      pipelineIdentifier: defaultTo(pipelineIdentifier, formik?.values?.identifier),
      fqnPath: isPropagatedStage
        ? `pipeline.stages.${stageIdentifier}.spec.serviceConfig.stageOverrides.artifacts.${artifactPath}.spec.tag`
        : `pipeline.stages.${stageIdentifier}.spec.serviceConfig.serviceDefinition.spec.artifacts.${artifactPath}.spec.tag`
    },
    lazy: true
  })

  const { data } = useListAzureSubscriptions({
    queryParams: {
      accountId
    }
  })
  useEffect(() => {
    const subscriptionValues = defaultTo(data?.resource, []).map(subsciption => ({
      value: subsciption.value,
      label: subsciption.name
    }))
    setSubscriptions(subscriptionValues as SelectOption[])
  }, [data?.resource])

  const {
    data: registiresData,
    refetch: refetchRegistries,
    loading: loadingRegistries,
    error: registriesError
  } = useListAzureRegistries({
    lazy: true,
    debounce: 300
  })

  useEffect(() => {
    if (
      getMultiTypeFromValue(artifact?.spec?.subscription) === MultiTypeInputType.FIXED &&
      getMultiTypeFromValue(artifact?.spec?.registry) === MultiTypeInputType.FIXED
    ) {
      refetchRegistries({
        queryParams: {
          accountId,
          subscription: formik.values?.subscription
        }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [artifact?.spec?.subscription, artifact?.spec?.registry])

  useEffect(() => {
    const options =
      defaultTo(registiresData?.resource, []).map(name => ({ label: name.value, value: name.value })) || []
    setRegistries(options)
  }, [registiresData])

  const {
    data: repositoriesData,
    refetch: refetchRepositories,
    loading: loadingRepositories,
    error: repositoriesError
  } = useListAzureRepositories({
    lazy: true,
    debounce: 300
  })

  useEffect(() => {
    if (
      getMultiTypeFromValue(artifact?.spec?.subscription) === MultiTypeInputType.FIXED &&
      getMultiTypeFromValue(artifact?.spec?.registry) === MultiTypeInputType.FIXED &&
      getMultiTypeFromValue(artifact?.spec?.repository) === MultiTypeInputType.FIXED
    ) {
      refetchRepositories({
        queryParams: {
          accountId,
          subscription: formik.values.subscription,
          registry: formik.values.registry
        }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [artifact?.spec?.subscription, artifact?.spec?.registry, artifact?.spec?.repository])

  useEffect(() => {
    const options =
      defaultTo(repositoriesData?.resource, []).map(name => ({ label: name.value, value: name.value })) || []
    setRepositories(options)
  }, [repositoriesData])

  const isFieldDisabled = (fieldName: string, isTag = false): boolean => {
    if (
      readonly ||
      isFieldfromTriggerTabDisabled(
        fieldName,
        formik,
        stageIdentifier,
        fromTrigger,
        isSidecar ? (artifact as SidecarArtifact)?.identifier : undefined
      )
    ) {
      return true
    }
    if (isTag) {
      return isTagsSelectionDisabled(props)
    }
    return false
  }
  const isRuntime = isArtifactSourceRuntime(isPrimaryArtifactsRuntime, isSidecarRuntime, isSidecar as boolean)

  return (
    <>
      {isRuntime && (
        <Layout.Vertical key={artifactPath} className={css.inputWidth}>
          {isFieldRuntime(`artifacts.${artifactPath}.spec.connectorRef`, template) && (
            <FormMultiTypeConnectorField
              name={`${path}.artifacts.${artifactPath}.spec.connectorRef`}
              label={getString('pipelineSteps.deploy.inputSet.artifactServer')}
              selected={get(initialValues, `artifacts.${artifactPath}.spec.connectorRef`, '')}
              placeholder={''}
              accountIdentifier={accountId}
              projectIdentifier={projectIdentifier}
              orgIdentifier={orgIdentifier}
              width={391}
              setRefValue
              disabled={isFieldDisabled(`artifacts.${artifactPath}.spec.connectorRef`)}
              multiTypeProps={{
                allowableTypes,
                expressions
              }}
              onChange={() => resetTags(formik, `${path}.artifacts.${artifactPath}.spec.tag`)}
              className={css.connectorMargin}
              type={ArtifactToConnectorMap[defaultTo(artifact?.type, '')]}
              gitScope={{
                repo: defaultTo(repoIdentifier, ''),
                branch: defaultTo(branch, ''),
                getDefaultFromOtherRepo: true
              }}
            />
          )}
          {isFieldRuntime(`artifacts.${artifactPath}.spec.subscription`, template) && (
            <ExperimentalInput
              formik={formik}
              multiTypeInputProps={{
                onChange: () => resetTags(formik, `${path}.artifacts.${artifactPath}.spec.tag`),
                selectProps: {
                  usePortal: true,
                  addClearBtn: !readonly,
                  items: subscriptions
                },
                expressions,
                allowableTypes
              }}
              useValue
              disabled={isFieldDisabled(`artifacts.${artifactPath}.spec.subscription`)}
              selectItems={subscriptions}
              label={getString('connectors.ACR.subscription')}
              name={`${path}.artifacts.${artifactPath}.spec.subscription`}
            />
          )}

          {isFieldRuntime(`artifacts.${artifactPath}.spec.registry`, template) && (
            <ExperimentalInput
              formik={formik}
              multiTypeInputProps={{
                onChange: () => resetTags(formik, `${path}.artifacts.${artifactPath}.spec.tag`),
                selectProps: {
                  usePortal: true,
                  addClearBtn: !(loadingRegistries || readonly),
                  noResults: (
                    <Text padding={'small'}>
                      {get(registriesError, 'data.message', null) || getString('connectors.ACR.registryError')}
                    </Text>
                  )
                },
                expressions,
                allowableTypes
              }}
              useValue
              disabled={isFieldDisabled(`artifacts.${artifactPath}.spec.registry`)}
              selectItems={registries}
              label={getString('connectors.ACR.registry')}
              name={`${path}.artifacts.${artifactPath}.spec.registry`}
            />
          )}

          {isFieldRuntime(`artifacts.${artifactPath}.spec.repository`, template) && (
            <ExperimentalInput
              formik={formik}
              multiTypeInputProps={{
                onChange: () => resetTags(formik, `${path}.artifacts.${artifactPath}.spec.tag`),
                selectProps: {
                  usePortal: true,
                  addClearBtn: !(loadingRepositories || readonly),
                  items: repositories,
                  noResults: (
                    <Text padding={'small'}>
                      {get(repositoriesError, 'data.message', null) || getString('connectors.ACR.repositoryError')}
                    </Text>
                  )
                },
                expressions,
                allowableTypes
              }}
              useValue
              disabled={isFieldDisabled(`artifacts.${artifactPath}.spec.repository`)}
              selectItems={repositories}
              label={getString('repository')}
              name={`${path}.artifacts.${artifactPath}.spec.repository`}
            />
          )}
          {!!fromTrigger && isFieldRuntime(`artifacts.${artifactPath}.spec.tag`, template) && (
            <FormInput.MultiTextInput
              label={getString('tagLabel')}
              multiTextInputProps={{
                expressions,
                value: TriggerDefaultFieldList.build,
                allowableTypes
              }}
              disabled={true}
              name={`${path}.artifacts.${artifactPath}.spec.tag`}
            />
          )}

          {!fromTrigger && isFieldRuntime(`artifacts.${artifactPath}.spec.tag`, template) && (
            <ArtifactTagRuntimeField
              {...props}
              isFieldDisabled={() => isFieldDisabled(`artifacts.${artifactPath}.spec.tag`, true)}
              fetchingTags={fetchingTags}
              buildDetailsList={acrTagsData?.data?.buildDetailsList}
              fetchTagsError={fetchTagsError}
              fetchTags={fetchTags}
              expressions={expressions}
              stageIdentifier={stageIdentifier}
            />
          )}

          {isFieldRuntime(`artifacts.${artifactPath}.spec.tagRegex`, template) && (
            <FormInput.MultiTextInput
              disabled={isFieldDisabled(`artifacts.${artifactPath}.spec.tagRegex`)}
              multiTextInputProps={{
                expressions,
                allowableTypes
              }}
              label={getString('tagRegex')}
              name={`${path}.artifacts.${artifactPath}.spec.tagRegex`}
            />
          )}
        </Layout.Vertical>
      )}
    </>
  )
}

export class ACRArtifactSource extends ArtifactSourceBase<ArtifactSourceRenderProps> {
  protected artifactType = ENABLED_ARTIFACT_TYPES.Acr
  protected isSidecar = false

  isTagsSelectionDisabled(props: ArtifactSourceRenderProps): boolean {
    const { initialValues, artifactPath, artifact } = props

    const isConnectorPresent =
      getMultiTypeFromValue(artifact?.spec?.connectorRef) !== MultiTypeInputType.RUNTIME
        ? artifact?.spec?.connectorRef
        : get(initialValues?.artifacts, `${artifactPath}.spec.connectorRef`, '')
    const isSubscriptionPresent =
      getMultiTypeFromValue(artifact?.spec?.subscription) !== MultiTypeInputType.RUNTIME
        ? artifact?.spec?.subscription
        : get(initialValues, `artifacts.${artifactPath}.spec.subscription`, '')
    const isRegistryPresent =
      getMultiTypeFromValue(artifact?.spec?.registry) !== MultiTypeInputType.RUNTIME
        ? artifact?.spec?.registry
        : get(initialValues, `artifacts.${artifactPath}.spec.registry`, '')
    const isRepositoryPresent =
      getMultiTypeFromValue(artifact?.spec?.repository) !== MultiTypeInputType.RUNTIME
        ? artifact?.spec?.repository
        : get(initialValues, `artifacts.${artifactPath}.spec.repository`, '')

    return !(isConnectorPresent && isSubscriptionPresent && isRegistryPresent && isRepositoryPresent)
  }

  renderContent(props: ArtifactSourceRenderProps): JSX.Element | null {
    if (!props.isArtifactsRuntime) {
      return null
    }

    this.isSidecar = defaultTo(props.isSidecar, false)

    return <Content {...props} isTagsSelectionDisabled={this.isTagsSelectionDisabled.bind(this)} />
  }
}
