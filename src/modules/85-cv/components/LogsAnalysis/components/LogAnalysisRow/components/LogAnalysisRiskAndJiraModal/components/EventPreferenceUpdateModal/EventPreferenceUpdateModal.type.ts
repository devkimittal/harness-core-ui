import type { IDialogProps } from '@blueprintjs/core'

export interface EventPreferenceUpdateModalReturn {
  openEventPreferenceEditModal: (modalProps?: IDialogProps) => void
  closeEventPreferenceEditModal: () => void
}

export interface EventPreferenceForm {
  isNotARisk: boolean
  reason: string
  priority: 'P0' | 'P1' | 'P2' | 'P3' | 'P4' | 'P5' | null
}

export interface EventEditModalInitialValues {
  activityType?: string
}

export interface UseEventPreferenceUpdateModalProps {
  initialModalValue: EventEditModalInitialValues
  onSubmitOfEventPreferenceEdit: (formValues: EventPreferenceForm) => void
}
