import type { SelectOption } from '@wings-software/uicore'
import type { FormikProps } from 'formik'
import moment from 'moment'
import type { UseStringsReturn } from 'framework/strings'
import type { SLOForm } from '../../CreateSLO.types'
import { dateFormatSLOTarget, PeriodTypeEnum } from './SLOTargetAndBudgetPolicy.constants'

export const getPeriodTypeOptions = (getString: UseStringsReturn['getString']): SelectOption[] => {
  return [
    { label: getString('cv.slos.sloTargetAndBudget.periodTypeOptions.rolling'), value: PeriodTypeEnum.ROLLING },
    { label: getString('cv.slos.sloTargetAndBudget.periodTypeOptions.calendar'), value: PeriodTypeEnum.CALENDAR }
  ]
}

export const getPeriodLengthOptions = (): SelectOption[] => {
  return [{ label: '30', value: '30' }]
}

export const getDefaultDateRange = (formikProps: FormikProps<SLOForm>): [Date | undefined, Date | undefined] => {
  const { startDate, endDate } = formikProps?.values?.target?.spec ?? {}
  return [startDate ? moment(startDate).toDate() : undefined, endDate ? moment(endDate).toDate() : undefined]
}

export function getUpdatedTarget(range: [Date | undefined, Date | undefined], values: SLOForm): SLOForm['target'] {
  const startDate = moment(range[0]).format(dateFormatSLOTarget)
  const endDate = moment(range[1]).format(dateFormatSLOTarget)
  const updatedTarget = { ...values?.target, spec: { ...values?.target?.spec, startDate, endDate } }
  return updatedTarget
}
