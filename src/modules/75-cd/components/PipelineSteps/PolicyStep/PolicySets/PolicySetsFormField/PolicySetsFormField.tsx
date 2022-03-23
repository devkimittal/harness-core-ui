/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { FormikErrors, FormikProps } from 'formik'
import { defaultTo } from 'lodash-es'

import { Button, FormError, FormikTooltipContext, HarnessDocTooltip } from '@harness/uicore'
import { useModalHook } from '@harness/use-modal'
import { FormGroup, IFormGroupProps, Intent } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'

import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'

import type { PolicyStepFormData } from '../../PolicyStepTypes'
import { PolicySetModal } from '../PolicySetModal/PolicySetModal'
import { MiniPolicySetRenderer } from '../PolicySetListRenderer/MiniPolicySetRenderer'

import css from './PolicySetsFormField.module.scss'

interface PolicySetsFormFieldInterface extends Omit<IFormGroupProps, 'label'> {
  name: string
  formikProps?: FormikProps<PolicyStepFormData>
  error?: string | FormikErrors<any>
  stepViewType?: StepViewType
  touched?: boolean
}

function PolicySetsFormField({
  formikProps,
  name,
  error,
  disabled,
  stepViewType,
  touched,
  ...rest
}: PolicySetsFormFieldInterface) {
  const { getString } = useStrings()

  const policySetIds = defaultTo(/* istanbul ignore next */ formikProps?.values?.spec?.policySets, [])

  const [showModal, closeModal] = useModalHook(
    () => (
      <PolicySetModal
        name={name}
        formikProps={formikProps}
        policySetIds={policySetIds}
        closeModal={() => {
          formikProps?.setFieldTouched(name, true)
          closeModal()
        }}
      />
    ),
    [name, formikProps, policySetIds, stepViewType]
  )

  const helperText = touched && error ? <FormError name={name} errorMessage={error} /> : undefined
  const intent = touched && error ? Intent.DANGER : Intent.NONE

  const tooltipContext = React.useContext(FormikTooltipContext)
  const dataTooltipId = tooltipContext?.formName ? `${tooltipContext?.formName}_${name}` : ''

  const deletePolicySet = (policySetId: string) => {
    const newPolicySetIds = policySetIds.filter(id => id !== policySetId)
    formikProps?.setFieldTouched(name, true)
    formikProps?.setFieldValue(name, newPolicySetIds)
  }

  return (
    <FormGroup
      {...rest}
      helperText={helperText}
      intent={intent}
      className={css.formGroup}
      label={<HarnessDocTooltip tooltipId={dataTooltipId} labelText={getString('common.policiesSets.policyset')} />}
    >
      {policySetIds.map(policySetId => {
        return <MiniPolicySetRenderer policySetId={policySetId} key={policySetId} deletePolicySet={deletePolicySet} />
      })}
      <Button
        minimal
        text={getString('common.policiesSets.addOrModifyPolicySet')}
        className={css.addModifyButton}
        withoutCurrentColor={true}
        iconProps={{ size: 14 }}
        disabled={disabled}
        onClick={showModal}
      />
    </FormGroup>
  )
}

export default PolicySetsFormField
