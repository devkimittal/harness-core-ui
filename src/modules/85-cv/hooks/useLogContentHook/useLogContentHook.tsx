/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { useModalHook } from '@harness/use-modal'
import { Classes } from '@blueprintjs/core'
import { Dialog } from '@harness/uicore'
import ExecutionLog from './views/ExecutionLog/ExecutionLog'
import type { UseLogContentHookProps, UseLogContentHookReturn } from './useLogContentHook.types'
import css from './useLogContentHook.module.scss'

export const useLogContentHook = ({ activityId }: UseLogContentHookProps): UseLogContentHookReturn => {
  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog isOpen enforceFocus={false} onClose={hideModal} className={cx(css.dialog, Classes.DIALOG)}>
        <ExecutionLog activityId={activityId} />
      </Dialog>
    ),
    [activityId]
  )

  return {
    openLogContentHook: showModal,
    closeLogContentHook: hideModal
  }
}
