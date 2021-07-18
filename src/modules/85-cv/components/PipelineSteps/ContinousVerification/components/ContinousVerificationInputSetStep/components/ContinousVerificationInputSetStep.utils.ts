import { RUNTIME_INPUT_VALUE } from '@wings-software/uicore'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import type { NgPipeline } from 'services/cd-ng'
import type { serviceAndEnvData } from '../types'

export const getInfraAndServiceData = (
  pipeline: { pipeline: NgPipeline } | undefined,
  formik: any
): serviceAndEnvData => {
  const stageFromPipelineHavingVerify = pipeline?.pipeline?.stages?.find(
    (el: any) => !!el?.stage?.spec?.execution?.steps?.find((step: any) => step?.step?.type === StepType.Verify)
  )
  const currentStageFromForm = formik?.values?.stages?.find(
    (el: any) => el?.stage?.identifier === stageFromPipelineHavingVerify?.stage?.identifier
  )
  let serviceIdentifierData = stageFromPipelineHavingVerify?.stage?.spec?.serviceConfig?.serviceRef
  let envIdentifierData = stageFromPipelineHavingVerify?.stage?.spec?.infrastructure?.environmentRef
  if (serviceIdentifierData === RUNTIME_INPUT_VALUE) {
    serviceIdentifierData = currentStageFromForm?.stage?.spec?.serviceConfig?.serviceRef
  }
  if (envIdentifierData === RUNTIME_INPUT_VALUE) {
    envIdentifierData = currentStageFromForm?.stage?.spec?.infrastructure?.environmentRef
  }
  return { serviceIdentifierData, envIdentifierData }
}
