import React from 'react'
import * as Yup from 'yup'
import type { IDialogProps } from '@blueprintjs/core'
import { Dialog, Button, Formik, FormikForm, FormInput, Text } from '@harness/uicore'
import { useModalHook } from '@harness/use-modal'
import { useStrings } from 'framework/strings'
import type {
  EventPreferenceForm,
  EventPreferenceUpdateModalReturn,
  UseEventPreferenceUpdateModalProps
} from './EventPreferenceUpdateModal.type'
import { eventPriorities } from './EventPreferenceUpdateModal.utils'
import css from './EventPreferenceUpdateModal.module.scss'

const useEventPreferenceUpdateModal = (props: UseEventPreferenceUpdateModalProps): EventPreferenceUpdateModalReturn => {
  const { getString } = useStrings()

  const { onSubmitOfEventPreferenceEdit } = props

  const modalPropsLight: IDialogProps = {
    isOpen: true,
    usePortal: true,
    autoFocus: true,
    canEscapeKeyClose: true,
    canOutsideClickClose: true,
    isCloseButtonShown: false,
    enforceFocus: false,
    title: getString('pipeline.verification.logs.eventPreference'),
    style: { width: 600, height: 400, padding: '24px' }
  }

  const [openModal, hideModal] = useModalHook(() => (
    <Dialog onClose={hideModal} {...modalPropsLight}>
      <Formik<EventPreferenceForm>
        formName="eventPreference"
        initialValues={{
          isNotARisk: false,
          reason: '',
          priority: null
        }}
        onSubmit={formValues => {
          onSubmitOfEventPreferenceEdit(formValues)
        }}
        validationSchema={Yup.object().shape({
          reason: Yup.string().trim().required(getString('pipeline.verification.logs.reasonRequired')),
          priority: Yup.string().when('isNotARisk', {
            is: function (isNotARisk) {
              return !isNotARisk
            },
            then: Yup.string().required('it is required')
          })
        })}
      >
        {formikProps => (
          <FormikForm>
            <FormInput.CheckBox name="isNotARisk" label={getString('pipeline.verification.logs.notARiskLabel')} />

            {!formikProps.values.isNotARisk && (
              <FormInput.RadioGroup
                name="priority"
                label={getString('pipeline.verification.logs.eventPriorityLabel')}
                items={eventPriorities.map(priority => ({
                  label: <Text>{priority}</Text>,
                  value: priority
                }))}
                className={css.priorityRadioGroup}
              />
            )}
            <FormInput.TextArea className={css.reasonTextArea} name="reason" label={getString('reason')} />
            <Button
              // disabled={!formikProps.isValid}
              text={getString('submit')}
              margin={{ right: 'small' }}
              type="submit"
              intent="primary"
            />
            <Button text={getString('cancel')} onClick={hideModal} />
          </FormikForm>
        )}
      </Formik>
    </Dialog>
  ))

  return { openEventPreferenceEditModal: openModal, closeEventPreferenceEditModal: hideModal }
}

export default useEventPreferenceUpdateModal
