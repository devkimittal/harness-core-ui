/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Button, Container, Icon, Text, TextProps, Utils } from '@wings-software/uicore'
import { FontVariation, Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import { useToaster } from '@common/exports'
import css from './IdentifierText.module.scss'
export interface IdentifierTextProps extends TextProps {
  identifier?: string
  allowCopy?: boolean
}

export const IdentifierText: React.FC<IdentifierTextProps> = ({ identifier, style, allowCopy, ...props }) => {
  const { getString } = useStrings()
  const { showSuccess, clear } = useToaster()

  return (
    <Container className={css.identifierContainer}>
      <Text inline font={{ variation: FontVariation.SMALL }} margin={{ right: 'xsmall' }}>
        {getString('idLabel')}
      </Text>
      <Text inline {...props} font={{ variation: FontVariation.SMALL }}>
        {identifier}
      </Text>
      {allowCopy && (
        <Button
          noStyling
          className={css.copyButton}
          title={getString('clickToCopy')}
          onClick={() => {
            Utils.copy(identifier as string)
            clear()
            showSuccess(getString('copiedToClipboard'))
          }}
        >
          <Icon name="duplicate" size={12} color={Color.GREY_350} />
        </Button>
      )}
    </Container>
  )
}
