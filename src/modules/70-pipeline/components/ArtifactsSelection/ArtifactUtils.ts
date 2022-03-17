/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { getMultiTypeFromValue, MultiTypeInputType, RUNTIME_INPUT_VALUE } from '@harness/uicore'
import type { FormikValues } from 'formik'
import { defaultTo, get, isEmpty, merge } from 'lodash-es'
import type { ArtifactConfig, ConnectorConfigDTO } from 'services/cd-ng'
import { ENABLED_ARTIFACT_TYPES } from './ArtifactHelper'
import {
  ArtifactTagHelperText,
  ArtifactType,
  ImagePathTypes,
  RepositoryPortOrServer,
  TagTypes
} from './ArtifactInterface'

export enum RegistryHostNames {
  GCR_URL = 'gcr.io',
  US_GCR_URL = 'us.gcr.io',
  ASIA_GCR_URL = 'asia.gcr.io',
  EU_GCR_URL = 'eu.gcr.io',
  MIRROR_GCR_URL = 'mirror.gcr.io',
  K8S_GCR_URL = 'k8s.gcr.io',
  LAUNCHER_GCR_URL = 'launcher.gcr.io'
}

export const repositoryFormat = 'docker'
export const resetTag = (formik: FormikValues): void => {
  formik.values.tagType === 'value' &&
    getMultiTypeFromValue(formik.values.tag?.value) === MultiTypeInputType.FIXED &&
    formik.values.tag?.value?.length &&
    formik.setFieldValue('tag', '')
}

export const getConnectorIdValue = (prevStepData: ConnectorConfigDTO | undefined): string => {
  if (getMultiTypeFromValue(prevStepData?.connectorId) !== MultiTypeInputType.FIXED) {
    return prevStepData?.connectorId
  }
  if (prevStepData?.connectorId?.value) {
    return prevStepData?.connectorId?.value
  }
  return prevStepData?.identifier || ''
}

export const helperTextData = (
  selectedArtifact: ArtifactType,
  formik: FormikValues,
  connectorIdValue: string
): ArtifactTagHelperText => {
  switch (selectedArtifact) {
    case ENABLED_ARTIFACT_TYPES.DockerRegistry:
      return {
        imagePath: formik.values?.imagePath,
        connectorRef: connectorIdValue
      }
    case ENABLED_ARTIFACT_TYPES.Ecr:
      return {
        imagePath: formik.values?.imagePath,
        region: formik.values?.region || '',
        connectorRef: connectorIdValue
      }
    case ENABLED_ARTIFACT_TYPES.Gcr:
      return {
        imagePath: formik.values?.imagePath,
        registryHostname: formik.values?.registryHostname || '',
        connectorRef: connectorIdValue
      }
    case ENABLED_ARTIFACT_TYPES.Nexus3Registry:
      return {
        artifactPath: formik.values?.artifactPath,
        repository: formik.values?.repository,
        repositoryPort: formik.values?.repositoryPort,
        connectorRef: connectorIdValue
      }
    case ENABLED_ARTIFACT_TYPES.ArtifactoryRegistry:
      return {
        artifactPath: formik.values?.artifactPath,
        repository: formik.values?.repository,
        connectorRef: connectorIdValue
      }
    default:
      return {} as ArtifactTagHelperText
  }
}

export const checkIfQueryParamsisNotEmpty = (queryParamList: Array<string | number | undefined>): boolean => {
  return queryParamList.every(querydata => {
    if (typeof querydata !== 'number') {
      return !isEmpty(querydata)
    }
    return querydata !== undefined
  })
}
export const shouldFetchTags = (
  prevStepData: ConnectorConfigDTO | undefined,
  queryParamList: Array<string | number>
): boolean => {
  return (
    !isEmpty(getConnectorIdValue(prevStepData)) &&
    getMultiTypeFromValue(getConnectorIdValue(prevStepData)) === MultiTypeInputType.FIXED &&
    checkIfQueryParamsisNotEmpty(queryParamList) &&
    queryParamList.every(query => getMultiTypeFromValue(query) === MultiTypeInputType.FIXED)
  )
}

export const getFinalArtifactObj = (
  formData: ImagePathTypes & { connectorId?: string },
  isSideCar: boolean
): ArtifactConfig => {
  const tagData =
    formData?.tagType === TagTypes.Value
      ? { tag: defaultTo(formData.tag?.value, formData.tag) }
      : { tagRegex: defaultTo(formData.tagRegex?.value, formData.tagRegex) }

  const artifactObj: ArtifactConfig = {
    spec: {
      connectorRef: formData?.connectorId,
      imagePath: formData?.imagePath,
      ...tagData
    }
  }
  if (isSideCar) {
    merge(artifactObj, { identifier: formData?.identifier })
  }
  return artifactObj
}

export const getFinalArtifactFormObj = (
  formData: ImagePathTypes & { connectorId?: string },
  isSideCar: boolean
): ArtifactConfig => {
  const tagData =
    formData?.tagType === TagTypes.Value
      ? { tag: defaultTo(formData.tag?.value, formData.tag) }
      : { tagRegex: defaultTo(formData.tagRegex?.value, formData.tagRegex) }

  const artifactObj: ArtifactConfig = {
    spec: {
      connectorRef: formData?.connectorId,
      artifactPath: formData?.artifactPath,
      ...tagData
    }
  }
  if (isSideCar) {
    merge(artifactObj, { identifier: formData?.identifier })
  }
  return artifactObj
}

export const getArtifactFormData = (
  initialValues: ImagePathTypes,
  selectedArtifact: ArtifactType,
  isSideCar: boolean
): ImagePathTypes => {
  const specValues = get(initialValues, 'spec', null)

  if (selectedArtifact !== (initialValues as any)?.type || !specValues) {
    return defaultArtifactInitialValues(selectedArtifact)
  }

  const values = {
    ...specValues,
    tagType: specValues.tag ? TagTypes.Value : TagTypes.Regex
  }
  if (specValues?.tag && getMultiTypeFromValue(specValues?.tag) === MultiTypeInputType.FIXED) {
    values.tag = { label: specValues?.tag, value: specValues?.tag }
  }
  if (isSideCar && initialValues?.identifier) {
    merge(values, { identifier: initialValues?.identifier })
  }
  return values
}

export const defaultArtifactInitialValues = (selectedArtifact: ArtifactType): ImagePathTypes => {
  switch (selectedArtifact) {
    case ENABLED_ARTIFACT_TYPES.Gcr:
      return {
        identifier: '',
        imagePath: '',
        tag: RUNTIME_INPUT_VALUE,
        tagType: TagTypes.Value,
        tagRegex: RUNTIME_INPUT_VALUE,
        registryHostname: ''
      }
    case ENABLED_ARTIFACT_TYPES.ArtifactoryRegistry:
      return {
        identifier: '',
        tagType: TagTypes.Value,
        tag: RUNTIME_INPUT_VALUE,
        tagRegex: RUNTIME_INPUT_VALUE
      }
    case ENABLED_ARTIFACT_TYPES.Nexus3Registry:
      return {
        identifier: '',
        tagType: TagTypes.Value,
        tag: RUNTIME_INPUT_VALUE,
        tagRegex: RUNTIME_INPUT_VALUE,
        repositoryPortorRepositoryURL: RepositoryPortOrServer.RepositoryUrl
      }
    case ENABLED_ARTIFACT_TYPES.DockerRegistry:
    case ENABLED_ARTIFACT_TYPES.Ecr:
    default:
      return {
        identifier: '',
        imagePath: '',
        tag: RUNTIME_INPUT_VALUE,
        tagType: TagTypes.Value,
        tagRegex: RUNTIME_INPUT_VALUE
      }
  }
}
