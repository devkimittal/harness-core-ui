/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, Formik, FormikForm, Button, ButtonVariation, Text } from '@wings-software/uicore'
import { Color } from '@wings-software/design-system'
import * as Yup from 'yup'
import { omit } from 'lodash-es'
import { useParams } from 'react-router-dom'

import { useStrings } from 'framework/strings'
import { loggerFor } from 'framework/logging/logging'
import { ModuleName } from 'framework/types/ModuleName'
import type { PipelineInfoConfig } from 'services/cd-ng'
import { IdentifierSchema, NameSchema } from '@common/utils/Validation'
import { NameIdDescriptionTags } from '@common/components'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { GitSyncStoreProvider } from 'framework/GitRepoStore/GitSyncStoreContext'
import GitContextForm, { IGitContextFormProps } from '@common/components/GitContextForm/GitContextForm'
import type { EntityGitDetails } from 'services/pipeline-ng'
import { getTemplateNameWithLabel } from '@pipeline/utils/templateUtils'
import type { TemplateSummaryResponse } from 'services/template-ng'
import { DefaultNewPipelineId } from '../PipelineContext/PipelineActions'
import css from './PipelineCreate.module.scss'

const logger = loggerFor(ModuleName.CD)

interface PipelineInfoConfigWithGitDetails extends PipelineInfoConfig {
  repo: string
  branch: string
}
export interface PipelineCreateProps {
  afterSave?: (values: PipelineInfoConfig, gitDetails?: EntityGitDetails, template?: TemplateSummaryResponse) => void
  initialValues?: PipelineInfoConfigWithGitDetails
  closeModal?: () => void
  gitDetails?: IGitContextFormProps
  template?: TemplateSummaryResponse
}

export default function CreatePipelines({
  afterSave,
  initialValues = { identifier: '', name: '', description: '', tags: {}, repo: '', branch: '' },
  closeModal,
  gitDetails,
  template
}: PipelineCreateProps): JSX.Element {
  const { getString } = useStrings()
  const { pipelineIdentifier } = useParams<{ pipelineIdentifier: string }>()
  const { isGitSyncEnabled } = useAppStore()

  const identifier = initialValues?.identifier
  if (identifier === DefaultNewPipelineId) {
    initialValues.identifier = ''
  }
  const isEdit = (initialValues?.identifier?.length || '') > 0
  return (
    <Formik<PipelineInfoConfigWithGitDetails>
      initialValues={initialValues}
      formName="pipelineCreate"
      validationSchema={Yup.object().shape({
        name: NameSchema({ requiredErrorMsg: getString('createPipeline.pipelineNameRequired') }),
        identifier: IdentifierSchema(),
        ...(isGitSyncEnabled
          ? {
              repo: Yup.string().trim().required(getString('common.git.validation.repoRequired')),
              branch: Yup.string().trim().required(getString('common.git.validation.branchRequired'))
            }
          : {})
      })}
      onSubmit={values => {
        logger.info(JSON.stringify(values))
        const formGitDetails =
          values.repo && values.repo.trim().length > 0
            ? { repoIdentifier: values.repo, branch: values.branch }
            : undefined
        afterSave && afterSave(omit(values, 'repo', 'branch'), formGitDetails, template)
      }}
    >
      {formikProps => (
        <FormikForm>
          <NameIdDescriptionTags
            formikProps={formikProps}
            identifierProps={{
              isIdentifierEditable: pipelineIdentifier === DefaultNewPipelineId
            }}
            tooltipProps={{ dataTooltipId: 'pipelineCreate' }}
            className={css.pipelineCreateNameIdDescriptionTags}
          />
          {isGitSyncEnabled && (
            <GitSyncStoreProvider>
              <GitContextForm formikProps={formikProps} gitDetails={gitDetails} />
            </GitSyncStoreProvider>
          )}
          {template && (
            <Text
              icon={'template-library'}
              margin={{ top: 'medium', bottom: 'medium' }}
              font={{ size: 'small' }}
              iconProps={{ size: 12, margin: { right: 'xsmall' } }}
              color={Color.BLACK}
            >
              {`Using Template: ${getTemplateNameWithLabel(template)}`}
            </Text>
          )}
          <Container padding={{ top: 'xlarge' }}>
            <Button
              variation={ButtonVariation.PRIMARY}
              type="submit"
              text={isEdit ? getString('save') : getString('start')}
            />
            &nbsp; &nbsp;
            <Button variation={ButtonVariation.TERTIARY} text={getString('cancel')} onClick={closeModal} />
          </Container>
        </FormikForm>
      )}
    </Formik>
  )
}
