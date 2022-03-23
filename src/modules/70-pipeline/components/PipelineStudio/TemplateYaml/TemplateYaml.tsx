/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, Text, Layout } from '@wings-software/uicore'
import { defaultTo } from 'lodash-es'
import { Color } from '@harness/design-system'
import MonacoEditor from '@common/components/MonacoEditor/MonacoEditor'

import { yamlStringify } from '@common/utils/YamlHelperMethods'
import css from './TemplateYaml.module.scss'

export interface TemplateYamlProps {
  templateYaml: string
  withoutHeader?: boolean
}

export function TemplateYaml({ templateYaml, withoutHeader = false }: TemplateYamlProps): React.ReactElement {
  const [height, setHeight] = React.useState<number>()

  React.useEffect(() => {
    const stringifiedYaml = yamlStringify(templateYaml) as string
    setHeight((defaultTo(stringifiedYaml.match(/\n/g)?.length, 0) + 1) * 20)
  }, [templateYaml])

  return (
    <Container className={css.container}>
      <Layout.Vertical spacing={'medium'}>
        {!withoutHeader ? (
          <Container
            padding={{ top: 'large', right: 'xxlarge', bottom: 'large', left: 'xxlarge' }}
            border={{ bottom: true }}
            background={Color.WHITE}
          >
            <Text font={{ size: 'normal', weight: 'bold' }} color={Color.GREY_800}>
              template.yaml
            </Text>
          </Container>
        ) : null}
        <Container style={{ flexGrow: 1 }}>
          <MonacoEditor
            value={templateYaml}
            language={'yaml'}
            height={height}
            options={
              {
                fontFamily: "'Roboto Mono', monospace",
                fontSize: 13,
                minimap: {
                  enabled: false
                },
                readOnly: true,
                scrollbar: {
                  handleMouseWheel: false
                },
                overviewRulerLanes: 0,
                scrollBeyondLastLine: false
              } as any
            }
          />
        </Container>
      </Layout.Vertical>
    </Container>
  )
}
