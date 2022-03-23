/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { connect } from 'formik'
import { Text, getMultiTypeFromValue, MultiTypeInputType, FormikForm, Container, Layout } from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import { isEmpty, startCase } from 'lodash-es'
import cx from 'classnames'
import { useStrings } from 'framework/strings'
import type { StringsMap } from 'stringTypes'
import { ShellScriptMonacoField } from '@common/components/ShellScriptMonaco/ShellScriptMonaco'
import StepCommonFieldsInputSet from '@ci/components/PipelineSteps/StepCommonFields/StepCommonFieldsInputSet'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { FormMultiTypeCheckboxField } from '@common/components'
import { MultiTypeTextField } from '@common/components/MultiTypeText/MultiTypeText'
import { Connectors } from '@connectors/constants'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import type { RunTestsStepProps } from './RunTestsStep'
import { AllMultiTypeInputTypesForInputSet, shouldRenderRunTimeInputView } from '../CIStep/StepUtils'
import { CIStep } from '../CIStep/CIStep'
import { CIStepOptionalConfig, getOptionalSubLabel, renderMultiTypeListInputSet } from '../CIStep/CIStepOptionalConfig'
import css from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export const RunTestsStepInputSetBasic: React.FC<RunTestsStepProps> = ({
  template,
  path,
  readonly,
  stepViewType,
  allowableTypes,
  formik
}) => {
  const { getString } = useStrings()

  const { expressions } = useVariablesExpression()
  const prefix = isEmpty(path) ? '' : `${path}.`
  const stepCss = stepViewType === StepViewType.DeploymentForm ? css.sm : css.lg

  const renderCommandEditor = React.useCallback(
    (fieldName: string, stringKey: keyof StringsMap, tooltipId: string): React.ReactElement => (
      <Container className={cx(css.bottomMargin5, css.fieldsGroup, css.withoutSpacing)}>
        <MultiTypeFieldSelector
          name={fieldName}
          label={
            <Layout.Horizontal flex={{ justifyContent: 'flex-start', alignItems: 'baseline' }}>
              <Text
                className={css.inpLabel}
                color={Color.GREY_600}
                font={{ size: 'small', weight: 'semi-bold' }}
                style={{ display: 'flex', alignItems: 'center' }}
              >
                {getString(stringKey)}
              </Text>
              &nbsp;
              {getOptionalSubLabel(getString, tooltipId)}
            </Layout.Horizontal>
          }
          defaultValueToReset=""
          allowedTypes={allowableTypes}
          expressionRender={() => {
            return (
              <ShellScriptMonacoField
                title={stringKey}
                name={fieldName}
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
            title={getString(stringKey)}
            name={fieldName}
            scriptType="Bash"
            expressions={expressions}
            disabled={readonly}
          />
        </MultiTypeFieldSelector>
      </Container>
    ),
    []
  )

  return (
    <FormikForm className={css.removeBpPopoverWrapperTopMargin}>
      <CIStep
        readonly={readonly}
        stepViewType={stepViewType}
        enableFields={{
          ...(getMultiTypeFromValue(template?.description) === MultiTypeInputType.RUNTIME && {
            description: {}
          }),
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
              tooltipId: 'pluginImageInfo',
              multiTextInputProps: {
                placeholder: getString('pluginImagePlaceholder'),
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
      {getMultiTypeFromValue(template?.spec?.args) === MultiTypeInputType.RUNTIME && (
        <Container className={cx(css.formGroup, stepCss, css.bottomMargin5)}>
          <MultiTypeTextField
            className={css.removeBpLabelMargin}
            name={`${prefix}spec.args`}
            label={
              <Text
                className={css.inpLabel}
                color={Color.GREY_600}
                font={{ size: 'small', weight: 'semi-bold' }}
                tooltipProps={{ dataTooltipId: 'runTestsArgs' }}
              >
                {getString('argsLabel')}
              </Text>
            }
            multiTextInputProps={{
              multiTextInputProps: {
                expressions,
                allowableTypes
              },
              disabled: readonly
            }}
          />
        </Container>
      )}
      {getMultiTypeFromValue(template?.spec?.packages) === MultiTypeInputType.RUNTIME && (
        <Container className={cx(css.formGroup, stepCss, css.bottomMargin5)}>
          <MultiTypeTextField
            className={css.removeBpLabelMargin}
            name={`${prefix}spec.packages`}
            label={
              <Text
                className={css.inpLabel}
                color={Color.GREY_600}
                font={{ size: 'small', weight: 'semi-bold' }}
                tooltipProps={{ dataTooltipId: 'runTestsPackages' }}
              >
                {getString('packagesLabel')}
              </Text>
            }
            multiTextInputProps={{
              multiTextInputProps: {
                expressions,
                allowableTypes
              },
              disabled: readonly
            }}
          />
        </Container>
      )}
      {getMultiTypeFromValue(template?.spec?.runOnlySelectedTests) === MultiTypeInputType.RUNTIME && (
        <Container className={cx(css.formGroup, stepCss, css.bottomMargin5)}>
          <FormMultiTypeCheckboxField
            name={`${prefix}spec.runOnlySelectedTests`}
            label={getString('runOnlySelectedTestsLabel').concat(` (${startCase(getString('common.optionalLabel'))})`)}
            multiTypeTextbox={{
              expressions,
              disabled: readonly,
              allowableTypes
            }}
            setToFalseWhenEmpty={true}
          />
        </Container>
      )}
      {getMultiTypeFromValue(template?.spec?.testAnnotations) === MultiTypeInputType.RUNTIME && (
        <Container className={cx(css.formGroup, stepCss, css.bottomMargin5)}>
          <MultiTypeTextField
            className={css.removeBpLabelMargin}
            name={`${prefix}spec.testAnnotations`}
            label={
              <Layout.Horizontal flex={{ justifyContent: 'flex-start', alignItems: 'baseline' }}>
                <Text className={css.inpLabel} color={Color.GREY_600} font={{ size: 'small', weight: 'semi-bold' }}>
                  {getString('testAnnotationsLabel')}
                </Text>
                &nbsp;
                {getOptionalSubLabel(getString, 'runTestsTestAnnotations')}
              </Layout.Horizontal>
            }
            multiTextInputProps={{
              multiTextInputProps: {
                expressions,
                allowableTypes
              },
              disabled: readonly
            }}
          />
        </Container>
      )}
      {getMultiTypeFromValue(template?.spec?.preCommand) === MultiTypeInputType.RUNTIME &&
        renderCommandEditor(`${prefix}spec.preCommand`, 'ci.preCommandLabel', 'runTestsPreCommand')}
      {getMultiTypeFromValue(template?.spec?.preCommand) === MultiTypeInputType.RUNTIME &&
        renderCommandEditor(`${prefix}spec.postCommand`, 'ci.postCommandLabel', 'runTestsPostCommand')}
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

const RunTestsStepInputSet = connect(RunTestsStepInputSetBasic)
export { RunTestsStepInputSet }
