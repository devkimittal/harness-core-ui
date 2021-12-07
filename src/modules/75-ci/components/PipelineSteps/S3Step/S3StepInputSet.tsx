import React from 'react'
import { Text, getMultiTypeFromValue, MultiTypeInputType, FormikForm, Color } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import StepCommonFieldsInputSet from '@pipeline/components/StepCommonFields/StepCommonFieldsInputSet'
import { Connectors } from '@connectors/constants'
import type { S3StepProps } from './S3Step'
import { CIStep } from '../CIStep/CIStep'
import { CIStepOptionalConfig } from '../CIStep/CIStepOptionalConfig'
import css from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export const S3StepInputSet: React.FC<S3StepProps> = ({ template, path, readonly, stepViewType, allowableTypes }) => {
  const { getString } = useStrings()

  return (
    <FormikForm className={css.removeBpPopoverWrapperTopMargin}>
      <CIStep
        readonly={readonly}
        stepViewType={stepViewType}
        allowableTypes={allowableTypes}
        enableFields={{
          ...(getMultiTypeFromValue(template?.spec?.connectorRef) === MultiTypeInputType.RUNTIME && {
            'spec.connectorRef': {
              label: (
                <Text
                  className={css.inpLabel}
                  color={Color.GREY_600}
                  font={{ size: 'small', weight: 'semi-bold' }}
                  style={{ display: 'flex', alignItems: 'center' }}
                  tooltipProps={{ dataTooltipId: 'ecrConnector' }}
                >
                  {getString('pipelineSteps.awsConnectorLabel')}
                </Text>
              ),
              type: Connectors.AWS
            }
          }),
          ...(getMultiTypeFromValue(template?.spec?.region) === MultiTypeInputType.RUNTIME && { 'spec.region': {} }),
          ...(getMultiTypeFromValue(template?.spec?.bucket) === MultiTypeInputType.RUNTIME && {
            'spec.bucket': { tooltipId: 's3Bucket' }
          }),
          ...(getMultiTypeFromValue(template?.spec?.sourcePath) === MultiTypeInputType.RUNTIME && {
            'spec.sourcePath': {}
          })
        }}
        path={path || ''}
      />
      <CIStepOptionalConfig
        stepViewType={stepViewType}
        readonly={readonly}
        enableFields={{
          ...(getMultiTypeFromValue(template?.spec?.endpoint) === MultiTypeInputType.RUNTIME && {
            'spec.endpoint': {}
          }),
          ...(getMultiTypeFromValue(template?.spec?.target) === MultiTypeInputType.RUNTIME && {
            'spec.target': { tooltipId: 'gcsS3Target' }
          })
        }}
        allowableTypes={allowableTypes}
        path={path || ''}
      />
      <StepCommonFieldsInputSet
        path={path}
        readonly={readonly}
        template={template}
        allowableTypes={allowableTypes}
        stepViewType={stepViewType}
      />
    </FormikForm>
  )
}
