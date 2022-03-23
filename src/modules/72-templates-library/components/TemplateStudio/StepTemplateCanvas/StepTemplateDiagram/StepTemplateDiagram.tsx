/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, Layout, Text } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import { Color } from '@harness/design-system'
import { noop, set } from 'lodash-es'
import { StepPopover } from '@pipeline/components/PipelineStudio/StepPalette/StepPopover/StepPopover'
import factory from '@pipeline/components/PipelineSteps/PipelineStepFactory'
import type { StepElementConfig } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import type { StepData } from 'services/pipeline-ng'
import { DrawerTypes } from '@templates-library/components/TemplateStudio/TemplateContext/TemplateActions'
import { TemplateContext } from '@templates-library/components/TemplateStudio/TemplateContext/TemplateContext'
import type { TemplateStudioPathProps } from '@common/interfaces/RouteInterfaces'
import { DefaultNewTemplateId } from 'framework/Templates/templates'
import css from './StepTemplateDiagram.module.scss'

export const StepTemplateDiagram = (): JSX.Element => {
  const { getString } = useStrings()
  const [stepData, setStepData] = React.useState<StepData>()
  const {
    state: { template, templateView, gitDetails },
    updateTemplate,
    updateTemplateView
  } = React.useContext(TemplateContext)
  const { templateIdentifier } = useParams<TemplateStudioPathProps>()

  const openStepSelector = () => {
    updateTemplateView({
      ...templateView,
      isDrawerOpened: true,
      drawerData: {
        type: DrawerTypes.AddStep,
        data: {
          paletteData: {
            onSelection: async (step: StepElementConfig) => {
              updateTemplateView({
                ...templateView,
                isDrawerOpened: false,
                drawerData: { type: DrawerTypes.AddStep }
              })
              set(template, 'spec.type', step.type)
              await updateTemplate(template)
            }
          }
        }
      }
    })
  }

  React.useEffect(() => {
    if (!!template.name && !(template.spec as StepElementConfig)?.type) {
      openStepSelector()
    }
  }, [template.name, gitDetails])

  React.useEffect(() => {
    const stepType = (template.spec as StepElementConfig)?.type
    if (stepType) {
      setStepData({ name: factory.getStepName(stepType) || '', type: stepType })
    }
  }, [(template.spec as StepElementConfig)?.type])

  return (
    <Container
      className={css.container}
      background={Color.FORM_BG}
      width={'100%'}
      padding={{ left: 'huge', right: 'huge' }}
    >
      <Layout.Vertical height={'100%'} flex={{ justifyContent: 'center', alignItems: 'flex-start' }} spacing={'small'}>
        <Text font={{ size: 'small', weight: 'semi-bold' }} color={Color.GREY_600}>
          {getString('stepType')}
        </Text>
        <Container>
          <Layout.Horizontal
            spacing={'medium'}
            onClick={templateIdentifier === DefaultNewTemplateId ? openStepSelector : noop}
            flex={{ alignItems: 'center', justifyContent: 'flex-start' }}
          >
            <StepPopover className={css.stepPalette} stepsFactory={factory} stepData={stepData} />
            <Text font={{ size: 'small', weight: 'semi-bold' }} color={Color.GREY_600}>
              {stepData?.name || ''}
            </Text>
          </Layout.Horizontal>
        </Container>
      </Layout.Vertical>
    </Container>
  )
}
