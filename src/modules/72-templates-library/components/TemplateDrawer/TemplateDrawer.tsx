/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback } from 'react'
import { Drawer, Position } from '@blueprintjs/core'
import { Button } from '@wings-software/uicore'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { TemplateDrawerTypes } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineActions'
import { TemplateSelector } from '../TemplateSelector/TemplateSelector'
import css from './TemplateDrawer.module.scss'

export const TemplateDrawer: React.FC = (): JSX.Element => {
  const {
    state: {
      isLoading,
      templateView: {
        isTemplateDrawerOpened,
        templateDrawerData: { type }
      }
    },
    updateTemplateView
  } = usePipelineContext()

  const closeTemplateView = useCallback(() => {
    updateTemplateView({
      isTemplateDrawerOpened: false,
      templateDrawerData: { type: TemplateDrawerTypes.UseTemplate }
    })
  }, [updateTemplateView])

  if (isLoading || !isTemplateDrawerOpened) {
    return <></>
  }

  return (
    <Drawer
      onClose={closeTemplateView}
      usePortal={true}
      autoFocus={true}
      canEscapeKeyClose={true}
      canOutsideClickClose={true}
      enforceFocus={false}
      hasBackdrop={true}
      size={'1287px'}
      isOpen={isTemplateDrawerOpened}
      position={Position.RIGHT}
      data-type={type}
    >
      <Button
        minimal
        className={css.almostFullScreenCloseBtn}
        icon="cross"
        withoutBoxShadow
        onClick={closeTemplateView}
      />
      <TemplateSelector />
    </Drawer>
  )
}
