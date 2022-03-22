/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { debounce, defaultTo, isEqual, merge, noop, omit, set } from 'lodash-es'
import { useParams } from 'react-router-dom'
import React from 'react'
import { parse } from 'yaml'
import produce from 'immer'
import { Container, Formik, FormikForm, Heading, Layout, PageError } from '@wings-software/uicore'
import { Color } from '@wings-software/design-system'
import * as Yup from 'yup'
import type { FormikProps } from 'formik'
import ErrorsStripBinded from '@pipeline/components/ErrorsStrip/ErrorsStripBinded'
import { IdentifierSchema, NameSchema } from '@common/utils/Validation'
import { useToaster } from '@common/exports'
import { setTemplateInputs, TEMPLATE_INPUT_PATH } from '@pipeline/utils/templateUtils'
import { useQueryParams } from '@common/hooks'
import type { GitQueryParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useGetTemplate, useGetTemplateInputSetYaml } from 'services/template-ng'
import {
  getIdentifierFromValue,
  getScopeBasedProjectPathParams,
  getScopeFromValue
} from '@common/components/EntityReference/EntityReference'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { PageSpinner } from '@common/components'
import { PipelineInputSetFormInternal } from '@pipeline/components/PipelineInputSetForm/PipelineInputSetForm'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import type { Error, PipelineInfoConfig } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { validatePipeline } from '@pipeline/components/PipelineStudio/StepUtil'
import css from './TemplatePipelineSpecifications.module.scss'

export interface PipelineStageValues extends PipelineInfoConfig {
  inputsTemplate?: PipelineInfoConfig
  allValues?: PipelineInfoConfig
}

export function TemplatePipelineSpecifications(): JSX.Element {
  const {
    state: { pipeline },
    allowableTypes,
    updatePipeline,
    isReadonly
  } = usePipelineContext()
  const queryParams = useParams<ProjectPathProps>()
  const { branch, repoIdentifier } = useQueryParams<GitQueryParams>()
  const [formValues, setFormValues] = React.useState<PipelineStageValues>(pipeline as PipelineStageValues)
  const templateRef = getIdentifierFromValue(defaultTo(pipeline.template?.templateRef, ''))
  const scope = getScopeFromValue(defaultTo(pipeline.template?.templateRef, ''))
  const { showError } = useToaster()
  const { getString } = useStrings()

  const onChange = React.useCallback(
    debounce(async (values: PipelineInfoConfig): Promise<void> => {
      await updatePipeline({ ...pipeline, ...values })
    }, 300),
    [pipeline, updatePipeline]
  )

  const {
    data: templateResponse,
    error: templateError,
    refetch: refetchTemplate,
    loading: templateLoading
  } = useGetTemplate({
    templateIdentifier: templateRef,
    queryParams: {
      ...getScopeBasedProjectPathParams(queryParams, scope),
      versionLabel: defaultTo(pipeline.template?.versionLabel, ''),
      repoIdentifier,
      branch,
      getDefaultFromOtherRepo: true
    }
  })

  const {
    data: templateInputSetYaml,
    error: templateInputSetError,
    refetch: refetchTemplateInputSet,
    loading: templateInputSetLoading
  } = useGetTemplateInputSetYaml({
    templateIdentifier: templateRef,
    queryParams: {
      ...getScopeBasedProjectPathParams(queryParams, scope),
      versionLabel: defaultTo(pipeline.template?.versionLabel, ''),
      repoIdentifier,
      branch,
      getDefaultFromOtherRepo: true
    }
  })

  React.useEffect(() => {
    if (!templateLoading && !templateInputSetLoading && templateResponse?.data?.yaml) {
      try {
        const templateInputs = parse(defaultTo(templateInputSetYaml?.data, ''))
        const mergedTemplateInputs = merge({}, templateInputs, pipeline.template?.templateInputs)
        setFormValues(
          produce(pipeline as PipelineStageValues, draft => {
            setTemplateInputs(draft, mergedTemplateInputs)
            draft.inputsTemplate = templateInputs
            draft.allValues = {
              ...parse(defaultTo(templateResponse?.data?.yaml, '')).template.spec,
              identifier: pipeline.identifier
            }
          })
        )
        setTemplateInputs(pipeline, mergedTemplateInputs)
        updatePipeline(pipeline)
      } catch (error) {
        showError(error.message, undefined, 'template.parse.inputSet.error')
      }
    }
  }, [templateLoading, templateResponse?.data && templateInputSetLoading && templateInputSetYaml?.data])

  const validateForm = (values: PipelineStageValues) => {
    if (
      isEqual(values.template?.templateRef, pipeline.template?.templateRef) &&
      isEqual(values.template?.versionLabel, pipeline.template?.versionLabel)
    ) {
      onChange?.(omit(values, 'inputsTemplate', 'allValues'))
      const errorsResponse = validatePipeline({
        pipeline: values.template?.templateInputs as PipelineInfoConfig,
        template: values.inputsTemplate!,
        originalPipeline: pipeline.template?.templateInputs as PipelineInfoConfig,
        getString,
        viewType: StepViewType.DeploymentForm
      })
      return set({}, TEMPLATE_INPUT_PATH, errorsResponse)
    } else {
      return {}
    }
  }

  const refetch = () => {
    refetchTemplate()
    refetchTemplateInputSet()
  }

  return (
    <Container className={css.serviceOverrides} height={'100%'} background={Color.FORM_BG}>
      <ErrorsStripBinded />
      <Layout.Vertical spacing={'xlarge'} className={css.contentSection}>
        <Formik<PipelineStageValues>
          initialValues={formValues}
          formName="templateStageOverview"
          onSubmit={noop}
          validate={validateForm}
          validationSchema={Yup.object().shape({
            name: NameSchema({
              requiredErrorMsg: getString('pipelineSteps.build.create.stageNameRequiredError')
            }),
            identifier: IdentifierSchema()
          })}
          enableReinitialize={true}
        >
          {(formik: FormikProps<PipelineStageValues>) => {
            return (
              <FormikForm>
                <Container className={css.inputsContainer}>
                  {(templateLoading || templateInputSetLoading) && <PageSpinner />}
                  {!templateLoading && !templateInputSetLoading && (templateError || templateInputSetError) && (
                    <Container height={300}>
                      <PageError
                        message={
                          defaultTo((templateError?.data as Error)?.message, templateError?.message) ||
                          defaultTo((templateInputSetError?.data as Error)?.message, templateInputSetError?.message)
                        }
                        onClick={() => refetch()}
                      />
                    </Container>
                  )}
                  {!templateLoading &&
                    !templateInputSetLoading &&
                    !templateError &&
                    !templateInputSetError &&
                    formik.values.inputsTemplate &&
                    formik.values.allValues && (
                      <Layout.Vertical padding={{ bottom: 'large' }} spacing={'xlarge'}>
                        <Heading level={5} color={Color.BLACK}>
                          Template Inputs
                        </Heading>
                        <Container>
                          <PipelineInputSetFormInternal
                            key={`${formik.values.template?.templateRef}-${defaultTo(
                              formik.values.template?.versionLabel,
                              ''
                            )}`}
                            template={formik.values.inputsTemplate}
                            originalPipeline={formik.values.allValues}
                            path={TEMPLATE_INPUT_PATH}
                            readonly={isReadonly}
                            viewType={StepViewType.InputSet}
                            allowableTypes={allowableTypes}
                          />
                        </Container>
                      </Layout.Vertical>
                    )}
                </Container>
              </FormikForm>
            )
          }}
        </Formik>
      </Layout.Vertical>
    </Container>
  )
}
