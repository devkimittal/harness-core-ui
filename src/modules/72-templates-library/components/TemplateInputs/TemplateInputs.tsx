/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  Container,
  MultiTypeInputType,
  Text,
  Layout,
  Formik,
  getMultiTypeFromValue,
  PageError
} from '@wings-software/uicore'
import { parse } from 'yaml'
import { Color } from '@harness/design-system'
import { defaultTo, noop } from 'lodash-es'
import { useParams } from 'react-router-dom'
import cx from 'classnames'
import { TemplateSummaryResponse, useGetTemplateInputSetYaml } from 'services/template-ng'
import type { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepWidget } from '@pipeline/components/AbstractSteps/StepWidget'
import factory from '@pipeline/components/PipelineSteps/PipelineStepFactory'
import { PageSpinner, useToaster } from '@common/components'
import type { StageElementConfig, StepElementConfig, StageElementWrapperConfig } from 'services/cd-ng'
import type { NGTemplateInfoConfigWithGitDetails } from 'framework/Templates/TemplateConfigModal/TemplateConfigModal'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import MultiTypeDelegateSelector from '@common/components/MultiTypeDelegateSelector/MultiTypeDelegateSelector'
import { useStrings } from 'framework/strings'
import { StageForm } from '@pipeline/components/PipelineInputSetForm/PipelineInputSetForm'
import { TemplateType } from '@templates-library/utils/templatesUtils'
import NoResultsView from '@templates-library/pages/TemplatesPage/views/NoResultsView/NoResultsView'
import { getTemplateNameWithLabel } from '@pipeline/utils/templateUtils'
import css from './TemplateInputs.module.scss'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export interface TemplateInputsProps {
  template: TemplateSummaryResponse | NGTemplateInfoConfigWithGitDetails
}

export const TemplateInputs: React.FC<TemplateInputsProps> = props => {
  const { template } = props
  const [inputSetTemplate, setInputSetTemplate] = React.useState<StepElementConfig | StageElementConfig | null>()
  const [count, setCount] = React.useState<number>(0)
  const { showError } = useToaster()
  const { getString } = useStrings()
  const { accountId } = useParams<AccountPathProps>()
  const allowableTypes = [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION, MultiTypeInputType.RUNTIME]
  const templateEntityType =
    (template as TemplateSummaryResponse).templateEntityType || (template as NGTemplateInfoConfigWithGitDetails).type
  const repo =
    (template as TemplateSummaryResponse).gitDetails?.repoIdentifier ||
    (template as NGTemplateInfoConfigWithGitDetails).repo
  const branch =
    (template as TemplateSummaryResponse).gitDetails?.branch || (template as NGTemplateInfoConfigWithGitDetails).branch

  const {
    data: templateInputYaml,
    error: inputSetError,
    refetch,
    loading
  } = useGetTemplateInputSetYaml({
    templateIdentifier: defaultTo(template.identifier, ''),
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier: template.orgIdentifier,
      projectIdentifier: template.projectIdentifier,
      versionLabel: defaultTo(template.versionLabel, ''),
      repoIdentifier: repo,
      branch: branch,
      getDefaultFromOtherRepo: true
    }
  })

  React.useEffect(() => {
    try {
      const templateInput = parse(templateInputYaml?.data || '')
      setCount((JSON.stringify(templateInput).match(/<\+input>/g) || []).length)
      setInputSetTemplate(templateInput)
    } catch (error) {
      showError(error.message, undefined, 'template.parse.inputSet.error')
    }
  }, [templateInputYaml?.data])

  return (
    <Container
      style={{ overflow: 'auto' }}
      padding={{ top: 'xlarge', left: 'xxlarge', right: 'xxlarge' }}
      className={css.container}
    >
      <Layout.Vertical>
        {loading && <PageSpinner />}
        {!loading && inputSetError && (
          <Container height={300}>
            <PageError
              message={defaultTo((inputSetError.data as Error)?.message, inputSetError.message)}
              onClick={() => refetch()}
            />
          </Container>
        )}
        {!loading && !inputSetError && !inputSetTemplate && (
          <Container height={300}>
            <NoResultsView minimal={true} text={getString('templatesLibrary.noInputsRequired')} />
          </Container>
        )}
        {!loading && !inputSetError && inputSetTemplate && (
          <Container className={css.inputsContainer}>
            <Layout.Vertical spacing={'xlarge'}>
              <Container>
                <Layout.Horizontal flex={{ alignItems: 'center' }} spacing={'xxxlarge'}>
                  <Text font={{ size: 'normal', weight: 'bold' }} color={Color.GREY_800}>
                    {getTemplateNameWithLabel(template)}
                  </Text>
                  <Text className={css.inputsCount} font={{ size: 'small' }}>
                    {getString('templatesLibrary.inputsCount', { count })}
                  </Text>
                </Layout.Horizontal>
              </Container>
              <Formik<StepElementConfig | StageElementWrapperConfig>
                onSubmit={noop}
                initialValues={
                  templateEntityType === TemplateType.Step
                    ? (inputSetTemplate as StepElementConfig)
                    : ({ stage: inputSetTemplate } as StageElementWrapperConfig)
                }
                formName="templateInputs"
                enableReinitialize={true}
              >
                {formikProps => {
                  return (
                    <>
                      {templateEntityType === TemplateType.Stage && (
                        <StageForm
                          template={formikProps.values as StageElementWrapperConfig}
                          allValues={formikProps.values as StageElementWrapperConfig}
                          path={'stage'}
                          readonly={true}
                          viewType={StepViewType.InputSet}
                          allowableTypes={allowableTypes}
                          hideTitle={true}
                          stageClassName={css.stageCard}
                        />
                      )}
                      {templateEntityType === TemplateType.Step && (
                        <Container
                          className={css.inputsCard}
                          background={Color.WHITE}
                          padding={'large'}
                          margin={{ bottom: 'xxlarge' }}
                        >
                          <StepWidget<Partial<StepElementConfig>>
                            factory={factory}
                            initialValues={formikProps.values as StepElementConfig}
                            template={formikProps.values as StepElementConfig}
                            readonly={true}
                            type={(formikProps.values as StepElementConfig)?.type as StepType}
                            stepViewType={StepViewType.InputSet}
                            allowableTypes={allowableTypes}
                          />
                          {getMultiTypeFromValue((formikProps.values as StepElementConfig).spec?.delegateSelectors) ===
                            MultiTypeInputType.RUNTIME && (
                            <div className={cx(stepCss.formGroup, stepCss.sm)}>
                              <MultiTypeDelegateSelector
                                inputProps={{
                                  projectIdentifier: template.projectIdentifier,
                                  orgIdentifier: template.orgIdentifier
                                }}
                                allowableTypes={allowableTypes}
                                label={getString('delegate.DelegateSelector')}
                                name={'spec.delegateSelectors'}
                                disabled={true}
                              />
                            </div>
                          )}
                        </Container>
                      )}
                    </>
                  )
                }}
              </Formik>
            </Layout.Vertical>
          </Container>
        )}
      </Layout.Vertical>
    </Container>
  )
}
