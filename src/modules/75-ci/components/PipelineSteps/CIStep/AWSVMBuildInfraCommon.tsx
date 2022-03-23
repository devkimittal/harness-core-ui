/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import cx from 'classnames'
import { Text, Container, Layout } from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import { Connectors } from '@connectors/constants'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { useStrings } from 'framework/strings'
import { MultiTypeTextField } from '@common/components/MultiTypeText/MultiTypeText'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { useGitScope } from '@pipeline/utils/CIUtils'
import { getOptionalSubLabel } from './CIStepOptionalConfig'
import { AllMultiTypeInputTypesForStep } from './StepUtils'
import css from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

interface AWSVMBuildInfraCommonProps {
  showOptionalSublabel?: boolean
  readonly?: boolean
}

export const AWSVMBuildInfraCommon: React.FC<AWSVMBuildInfraCommonProps> = props => {
  const { showOptionalSublabel, readonly } = props

  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const gitScope = useGitScope()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()

  return (
    <>
      <Container className={css.bottomMargin3}>
        <FormMultiTypeConnectorField
          label={
            <Layout.Horizontal flex={{ justifyContent: 'flex-start', alignItems: 'baseline' }}>
              <Text
                className={css.inpLabel}
                color={Color.GREY_600}
                font={{ size: 'small', weight: 'semi-bold' }}
                style={{ display: 'flex', alignItems: 'center' }}
              >
                {getString('pipelineSteps.connectorLabel')}
              </Text>
              &nbsp;
              {showOptionalSublabel ? getOptionalSubLabel(getString) : null}
            </Layout.Horizontal>
          }
          type={[Connectors.GCP, Connectors.AWS, Connectors.DOCKER]}
          width={385}
          name={`spec.connectorRef`}
          placeholder={getString('select')}
          accountIdentifier={accountId}
          projectIdentifier={projectIdentifier}
          orgIdentifier={orgIdentifier}
          multiTypeProps={{
            expressions,
            allowableTypes: AllMultiTypeInputTypesForStep,
            disabled: readonly
          }}
          gitScope={gitScope}
          setRefValue
        />
      </Container>
      <Container className={cx(css.formGroup, css.lg, css.bottomMargin5)}>
        <MultiTypeTextField
          name={`spec.image`}
          label={
            <Layout.Horizontal flex={{ justifyContent: 'flex-start', alignItems: 'baseline' }}>
              <Text
                className={css.inpLabel}
                color={Color.GREY_600}
                font={{ size: 'small', weight: 'semi-bold' }}
                tooltipProps={
                  showOptionalSublabel
                    ? {}
                    : {
                        dataTooltipId: 'image'
                      }
                }
                placeholder={getString('imagePlaceholder')}
              >
                {getString('imageLabel')}
              </Text>
              &nbsp;
              {showOptionalSublabel ? getOptionalSubLabel(getString, 'image') : null}
            </Layout.Horizontal>
          }
          multiTextInputProps={{
            multiTextInputProps: {
              allowableTypes: AllMultiTypeInputTypesForStep
            }
          }}
        />
      </Container>
    </>
  )
}
