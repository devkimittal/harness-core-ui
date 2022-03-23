/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { connect } from 'formik'
import { Text, getMultiTypeFromValue, MultiTypeInputType, FormikForm, Container } from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import { isEmpty, startCase } from 'lodash-es'
import cx from 'classnames'
import { useStrings } from 'framework/strings'
import { ShellScriptMonacoField } from '@common/components/ShellScriptMonaco/ShellScriptMonaco'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { FormMultiTypeCheckboxField } from '@common/components/MultiTypeCheckbox/MultiTypeCheckbox'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import StepCommonFieldsInputSet from '@ci/components/PipelineSteps/StepCommonFields/StepCommonFieldsInputSet'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { Connectors } from '@connectors/constants'
import type { RunStepProps } from './RunStep'
import { CIStep } from '../CIStep/CIStep'
import { CIStepOptionalConfig, renderMultiTypeListInputSet } from '../CIStep/CIStepOptionalConfig'
import { AllMultiTypeInputTypesForInputSet, shouldRenderRunTimeInputView } from '../CIStep/StepUtils'
import css from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export const RunStepInputSetBasic: React.FC<RunStepProps> = ({
  template,
  path,
  readonly,
  stepViewType,
  allowableTypes,
  formik
}) => {
  const { getString } = useStrings()
  const prefix = isEmpty(path) ? '' : `${path}.`

  const { expressions } = useVariablesExpression()

  const stepCss = stepViewType === StepViewType.DeploymentForm ? css.sm : css.lg

  return (
    <FormikForm className={css.removeBpPopoverWrapperTopMargin}>
      <CIStep
        readonly={readonly}
        stepViewType={stepViewType}
        enableFields={{
          ...(getMultiTypeFromValue(template?.description) === MultiTypeInputType.RUNTIME && { description: {} }),
          ...(getMultiTypeFromValue(template?.spec?.connectorRef) === MultiTypeInputType.RUNTIME && {
            'spec.connectorRef': {
              label: (
                <Text
                  className={css.inpLabel}
                  color={Color.GREY_600}
                  font={{ size: 'small', weight: 'semi-bold' }}
                  style={{ display: 'flex', alignItems: 'center' }}
                  tooltipProps={{ dataTooltipId: 'connector' }}
                >
                  {getString('pipelineSteps.connectorLabel')}
                </Text>
              ),
              type: [Connectors.GCP, Connectors.AWS, Connectors.DOCKER]
            }
          }),
          ...(getMultiTypeFromValue(template?.spec?.image) === MultiTypeInputType.RUNTIME && {
            'spec.image': {
              tooltipId: 'image',
              multiTextInputProps: {
                placeholder: getString('imagePlaceholder'),
                disabled: readonly,
                multiTextInputProps: {
                  expressions,
                  allowableTypes
                }
              }
            }
          })
        }}
        path={path || ''}
      />
      {getMultiTypeFromValue(template?.spec?.command) === MultiTypeInputType.RUNTIME && (
        <div className={cx(css.fieldsGroup, css.withoutSpacing, css.topPadding3, css.bottomPadding3, stepCss)}>
          <MultiTypeFieldSelector
            name={`${prefix}spec.command`}
            label={
              <Text
                color={Color.GREY_800}
                font={{ size: 'normal', weight: 'bold' }}
                className={css.inpLabel}
                style={{ display: 'flex', alignItems: 'center' }}
                tooltipProps={{ dataTooltipId: 'runCommand' }}
              >
                {getString('commandLabel')}
              </Text>
            }
            defaultValueToReset=""
            skipRenderValueInExpressionLabel
            allowedTypes={allowableTypes}
            expressionRender={() => {
              return (
                <ShellScriptMonacoField
                  title={getString('commandLabel')}
                  name={`${prefix}spec.command`}
                  scriptType="Bash"
                  expressions={expressions}
                  disabled={readonly}
                />
              )
            }}
            style={{ flexGrow: 1, marginBottom: 0 }}
            disableTypeSelection={readonly}
          >
            <ShellScriptMonacoField
              title={getString('commandLabel')}
              name={`${prefix}spec.command`}
              scriptType="Bash"
              disabled={readonly}
              expressions={expressions}
            />
          </MultiTypeFieldSelector>
        </div>
      )}
      {getMultiTypeFromValue(template?.spec?.privileged) === MultiTypeInputType.RUNTIME && (
        <div className={cx(css.formGroup, css.sm, css.topMargin4, css.bottomMargin5)}>
          <FormMultiTypeCheckboxField
            name={`${prefix}spec.privileged`}
            label={getString('ci.privileged').concat(` (${startCase(getString('common.optionalLabel'))})`)}
            disabled={readonly}
            multiTypeTextbox={{
              expressions,
              allowableTypes
            }}
            tooltipProps={{ dataTooltipId: 'privileged' }}
            setToFalseWhenEmpty={true}
          />
        </div>
      )}
      {shouldRenderRunTimeInputView(template?.spec?.reports?.spec?.paths) && (
        <Container className={cx(css.formGroup, stepCss, css.bottomMargin5)}>
          {renderMultiTypeListInputSet({
            name: `${prefix}spec.reports.spec.paths`,
            tooltipId: 'reportPaths',
            labelKey: 'pipelineSteps.reportPathsLabel',
            allowedTypes: AllMultiTypeInputTypesForInputSet,
            placeholderKey: 'pipelineSteps.reportPathsPlaceholder',
            expressions,
            getString,
            readonly,
            formik
          })}
        </Container>
      )}
      {shouldRenderRunTimeInputView(template?.spec?.outputVariables) && (
        <Container className={cx(css.formGroup, stepCss, css.bottomMargin5)}>
          {renderMultiTypeListInputSet({
            name: `${prefix}spec.outputVariables`,
            tooltipId: 'outputVariables',
            labelKey: 'pipelineSteps.outputVariablesLabel',
            allowedTypes: AllMultiTypeInputTypesForInputSet,
            expressions,
            getString,
            readonly,
            formik
          })}
        </Container>
      )}
      <CIStepOptionalConfig
        stepViewType={stepViewType}
        readonly={readonly}
        enableFields={{
          ...(shouldRenderRunTimeInputView(template?.spec?.envVariables) && {
            'spec.envVariables': { tooltipId: 'environmentVariables' }
          })
        }}
        path={path || ''}
        formik={formik}
        isInputSetView={true}
      />
      <StepCommonFieldsInputSet path={path} readonly={readonly} template={template} stepViewType={stepViewType} />
    </FormikForm>
  )
}

const RunStepInputSet = connect(RunStepInputSetBasic)
export { RunStepInputSet }
