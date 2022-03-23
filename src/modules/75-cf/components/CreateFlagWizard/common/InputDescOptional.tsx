/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Layout, FormInput, Button } from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import css from './InputDescOptional.module.scss'

interface InputDescOptionalProps {
  text: string
  inputName: string
  inputPlaceholder: string | undefined
  isOpen?: boolean
}

const InputDescOptional: React.FC<InputDescOptionalProps> = props => {
  const { text, inputName, inputPlaceholder, isOpen } = props

  const [toggleDescInput, setToggleDescInput] = useState(isOpen)

  const onOpenDesc = (): void => {
    setToggleDescInput(true)
  }

  const onCloseDesc = (): void => {
    setToggleDescInput(false)
  }

  return (
    <Layout.Horizontal>
      {toggleDescInput ? (
        <>
          <FormInput.TextArea
            name={inputName}
            label={text}
            className={css.toggleTextarea}
            placeholder={inputPlaceholder}
          />
          <Button minimal onClick={onCloseDesc} icon="small-cross" />
        </>
      ) : (
        <Button
          minimal
          className={css.toggleDescText}
          icon="small-plus"
          iconProps={{ color: Color.GREY_400 }}
          text={text}
          onClick={onOpenDesc}
        />
      )}
    </Layout.Horizontal>
  )
}

export default InputDescOptional
