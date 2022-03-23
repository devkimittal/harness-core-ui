/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { get, isEmpty, isUndefined } from 'lodash-es'
import { FormInput, MultiTypeInputType, Container, Layout, Text, Radio, Icon } from '@wings-software/uicore'
import { FontVariation } from '@harness/design-system'
import { connect, FormikContext } from 'formik'
import { useStrings } from 'framework/strings'
import { getIdentifierFromValue, getScopeFromValue } from '@common/components/EntityReference/EntityReference'
import { Scope } from '@common/interfaces/SecretsInterface'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { ConnectorInfoDTO, PipelineInfoConfig, useGetConnector } from 'services/cd-ng'

export interface CICodebaseInputSetFormProps {
  path: string
  readonly?: boolean
  formik?: FormikContext<any>
  originalPipeline: PipelineInfoConfig
}

type CodeBaseType = 'branch' | 'tag' | 'PR'

const inputNames = {
  branch: 'branch',
  tag: 'tag',
  PR: 'number'
}

const defaultValues = {
  branch: '<+trigger.branch>',
  tag: '<+trigger.tag>',
  PR: '<+trigger.prNumber>'
}

const placeholderValues = {
  branch: defaultValues['branch'],
  tag: defaultValues['tag'],
  PR: defaultValues['PR']
}

function CICodebaseInputSetFormInternal({
  path,
  readonly,
  formik,
  originalPipeline
}: CICodebaseInputSetFormProps): JSX.Element {
  const { triggerIdentifier, accountId, projectIdentifier, orgIdentifier } = useParams<Record<string, string>>()

  const [isInputTouched, setIsInputTouched] = useState(false)
  const [connectorType, setConnectorType] = useState<ConnectorInfoDTO['type']>()
  const [connectorId, setConnectorId] = useState<string>('')
  const [connectorRef, setConnectorRef] = useState<string>('')
  const [codeBaseType, setCodeBaseType] = useState<CodeBaseType>()

  const savedValues = useRef<Record<string, string>>({
    branch: '',
    tag: '',
    PR: ''
  })

  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const formattedPath = isEmpty(path) ? '' : `${path}.`
  const codeBaseTypePath = `${formattedPath}properties.ci.codebase.build.type`
  const buildSpecPath = `${formattedPath}properties.ci.codebase.build.spec`

  const radioLabels = {
    branch: getString('gitBranch'),
    tag: getString('gitTag'),
    PR: getString('pipeline.gitPullRequest')
  }

  const inputLabels = {
    branch: getString('common.branchName'),
    tag: getString('common.tagName'),
    PR: getString('pipeline.ciCodebase.pullRequestNumber')
  }

  const codeBaseInputFieldFormName = {
    branch: `${formattedPath}properties.ci.codebase.build.spec.branch`,
    tag: `${formattedPath}properties.ci.codebase.build.spec.tag`,
    PR: `${formattedPath}properties.ci.codebase.build.spec.number`
  }

  const {
    data: connectorDetails,
    loading: loadingConnectorDetails,
    refetch: getConnectorDetails
  } = useGetConnector({
    identifier: connectorId,
    lazy: true
  })

  useEffect(() => {
    if (connectorId) {
      const connectorScope = getScopeFromValue(connectorRef)
      getConnectorDetails({
        pathParams: {
          identifier: connectorId
        },
        queryParams: {
          accountIdentifier: accountId,
          orgIdentifier: connectorScope === Scope.ORG || connectorScope === Scope.PROJECT ? orgIdentifier : undefined,
          projectIdentifier: connectorScope === Scope.PROJECT ? projectIdentifier : undefined
        }
      })
    }
  }, [connectorId])

  useEffect(() => {
    if (!loadingConnectorDetails && !isUndefined(connectorDetails)) {
      setConnectorType(get(connectorDetails, 'data.connector.type', '') as ConnectorInfoDTO['type'])
    }
  }, [loadingConnectorDetails, connectorDetails])

  useEffect(() => {
    const type = get(formik?.values, codeBaseTypePath) as CodeBaseType
    if (type) {
      setCodeBaseType(type)
    }
    const typeOfConnector = get(formik?.values, 'connectorRef.connector.type', '') as ConnectorInfoDTO['type']
    if (typeOfConnector) {
      setConnectorType(typeOfConnector)
    } else {
      const ctrRef = get(originalPipeline, 'properties.ci.codebase.connectorRef') as string
      setConnectorRef(ctrRef)
      setConnectorId(getIdentifierFromValue(ctrRef))
    }
  }, [formik?.values])

  useEffect(() => {
    // OnEdit Case, persists saved ciCodebase build spec
    if (codeBaseType) {
      savedValues.current = Object.assign(savedValues.current, {
        [codeBaseType]: get(
          formik?.values,
          `${formattedPath}properties.ci.codebase.build.spec.${inputNames[codeBaseType]}`,
          ''
        )
      })
      formik?.setFieldValue(buildSpecPath, { [inputNames[codeBaseType]]: savedValues.current[codeBaseType] })
    }
  }, [codeBaseType])

  const handleTypeChange = (newType: CodeBaseType): void => {
    formik?.setFieldValue(codeBaseTypePath, newType)

    if (!isInputTouched && triggerIdentifier) {
      formik?.setFieldValue(buildSpecPath, { [inputNames[newType]]: defaultValues[newType] })
    } else {
      formik?.setFieldValue(buildSpecPath, { [inputNames[newType]]: savedValues.current[newType] })
    }
  }

  const renderCodeBaseTypeInput = (type: CodeBaseType): JSX.Element => {
    return (
      <Container>
        <FormInput.MultiTextInput
          label={<Text font={{ variation: FontVariation.FORM_LABEL }}>{inputLabels[type]}</Text>}
          name={codeBaseInputFieldFormName[type]}
          multiTextInputProps={{
            expressions,
            allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED]
          }}
          placeholder={triggerIdentifier ? placeholderValues[type] : ''}
          disabled={readonly}
          onChange={() => setIsInputTouched(true)}
        />
      </Container>
    )
  }

  return (
    <Layout.Vertical spacing="small">
      {loadingConnectorDetails ? (
        <Container flex={{ justifyContent: 'end' }}>
          <Icon name="steps-spinner" size={25} />
        </Container>
      ) : (
        <>
          <Layout.Horizontal
            flex={{ justifyContent: 'start' }}
            padding={{ top: 'small', left: 'xsmall', bottom: 'xsmall' }}
            margin={{ left: 'large' }}
            spacing="huge"
          >
            <Radio
              label={radioLabels['branch']}
              onClick={() => handleTypeChange('branch')}
              checked={codeBaseType === 'branch'}
              disabled={readonly}
              font={{ variation: FontVariation.FORM_LABEL }}
              key="branch-radio-option"
            />
            <Radio
              label={radioLabels['tag']}
              onClick={() => handleTypeChange('tag')}
              checked={codeBaseType === 'tag'}
              disabled={readonly}
              font={{ variation: FontVariation.FORM_LABEL }}
              key="tag-radio-option"
            />
            {connectorType && connectorType !== 'Codecommit' ? (
              <Radio
                label={radioLabels['PR']}
                onClick={() => handleTypeChange('PR')}
                checked={codeBaseType === 'PR'}
                disabled={readonly}
                font={{ variation: FontVariation.FORM_LABEL }}
                key="pr-radio-option"
              />
            ) : null}
          </Layout.Horizontal>
          {codeBaseType === 'branch' ? renderCodeBaseTypeInput('branch') : null}
          {codeBaseType === 'tag' ? renderCodeBaseTypeInput('tag') : null}
          {codeBaseType === 'PR' ? renderCodeBaseTypeInput('PR') : null}
        </>
      )}
    </Layout.Vertical>
  )
}

export const CICodebaseInputSetForm = connect(CICodebaseInputSetFormInternal)
