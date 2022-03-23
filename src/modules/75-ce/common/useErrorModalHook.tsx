/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Button, Container, Text } from '@wings-software/uicore'
import { useModalHook } from '@harness/use-modal'
import { Color } from '@harness/design-system'
import { Dialog, IDialogProps } from '@blueprintjs/core'
import type { ServiceError } from 'services/lw'
import { useStrings } from 'framework/strings'
import css from './useErrorModalHook.module.scss'

const modalProps: IDialogProps = {
  isOpen: true,
  enforceFocus: false,
  style: {
    width: 750,
    minHeight: 350,
    borderLeft: 0,
    paddingBottom: 0,
    position: 'relative',
    overflow: 'hidden'
  }
}

interface UserErrorModalReturn {
  openErrorModal: (_error: ServiceError[]) => void
  hideErrorModal?: () => void
}

interface UseErrorModalHookProps {
  errorSummary?: string
}

const useErrorModalHook = (props: UseErrorModalHookProps): UserErrorModalReturn => {
  const [error, setError] = useState<ServiceError[]>()

  const { getString } = useStrings()

  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog {...modalProps}>
        <Container height={'100%'} padding="xxlarge">
          <Text font={{ size: 'medium' }} color={Color.BLACK}>
            {getString('errorDetails')}
          </Text>
          <Container padding={{ top: 'large' }}>
            <Text
              icon={'error'}
              iconProps={{ color: Color.RED_500 }}
              color={Color.GREY_900}
              lineClamp={1}
              font={{ size: 'small', weight: 'semi-bold' }}
              margin={{ top: 'small', bottom: 'small' }}
            >
              {props?.errorSummary}
            </Text>
            <div className={css.errorMsg}>
              <pre>{JSON.stringify({ errors: error }, null, ' ')}</pre>
            </div>
          </Container>
        </Container>
        <Button
          minimal
          icon="cross"
          iconProps={{ size: 18 }}
          onClick={() => {
            // props.onClose?.()
            hideModal()
          }}
          className={css.crossIcon}
        />
      </Dialog>
    ),
    [error]
  )

  return {
    openErrorModal: (_error: any) => {
      setError(_error)
      showModal()
    },
    hideErrorModal: hideModal
  }
}

export default useErrorModalHook
