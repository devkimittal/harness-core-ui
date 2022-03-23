/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { ButtonVariation, ButtonSize, ButtonProps } from '@wings-software/uicore'
import { useModalHook } from '@harness/use-modal'
import { Color } from '@harness/design-system'
import produce from 'immer'
import { defaultTo, merge, omit } from 'lodash-es'
import { Dialog } from '@blueprintjs/core'
import { useParams } from 'react-router-dom'
import RbacButton from '@rbac/components/Button/Button'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { useStrings } from 'framework/strings'
import { DefaultTemplate } from 'framework/Templates/templates'
import type { NGTemplateInfoConfig } from 'services/template-ng'
import { ModalProps, TemplateConfigModal } from 'framework/Templates/TemplateConfigModal/TemplateConfigModal'
import type { ProjectPathProps, GitQueryParams } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import { useSaveTemplate } from '@pipeline/utils/useSaveTemplate'
import type { JsonNode, StageElementConfig } from 'services/cd-ng'
import type { StepOrStepGroupOrTemplateStepData } from '@pipeline/components/PipelineStudio/StepCommands/StepCommandTypes'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import { AppStoreContext } from 'framework/AppStore/AppStoreContext'
import css from './SaveTemplateButton.module.scss'

export interface SaveTemplateButtonProps {
  data:
    | StepOrStepGroupOrTemplateStepData
    | StageElementConfig
    | (() => Promise<StepOrStepGroupOrTemplateStepData | StageElementConfig>)
  type: 'Step' | 'Stage'
  buttonProps?: ButtonProps
}

export function SaveTemplateButton({ data, buttonProps, type }: SaveTemplateButtonProps): JSX.Element {
  const { getString } = useStrings()
  const { orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const [template, setTemplate] = React.useState<NGTemplateInfoConfig>()
  const [modalProps, setModalProps] = React.useState<ModalProps>()
  const { isGitSyncEnabled } = React.useContext(AppStoreContext)
  const [showConfigModal, hideConfigModal] = useModalHook(
    () => (
      <Dialog enforceFocus={false} isOpen={true} className={css.configDialog}>
        {modalProps && template && (
          <TemplateConfigModal
            initialValues={merge(template, { repo: defaultTo(repoIdentifier, ''), branch: defaultTo(branch, '') })}
            onClose={hideConfigModal}
            modalProps={modalProps}
          />
        )}
      </Dialog>
    ),
    [template, modalProps, repoIdentifier, branch]
  )
  const { saveAndPublish } = useSaveTemplate({
    template: template as NGTemplateInfoConfig,
    gitDetails: { repoIdentifier, branch },
    isPipelineStudio: true
  })

  const onSaveAsTemplate = async () => {
    try {
      const finalData = typeof data === 'function' ? await data() : data
      setTemplate(
        produce(DefaultTemplate, draft => {
          draft.projectIdentifier = projectIdentifier
          draft.orgIdentifier = orgIdentifier
          draft.type = type
          draft.spec = omit(finalData, 'name', 'identifier', 'description', 'tags') as JsonNode
        })
      )
      setModalProps({
        title: getString('common.template.saveAsNewTemplateHeading'),
        promise: saveAndPublish,
        shouldGetComment: !isGitSyncEnabled
      })
      showConfigModal()
    } catch (_error) {
      //Do not do anything as there are error in the form
    }
  }

  return (
    <RbacButton
      withoutCurrentColor
      text={buttonProps?.variation === ButtonVariation.ICON ? undefined : getString('common.saveAsTemplate')}
      className={buttonProps?.variation === ButtonVariation.ICON ? css.iconButton : ''}
      variation={ButtonVariation.SECONDARY}
      size={ButtonSize.SMALL}
      icon="upload-box"
      iconProps={{ color: Color.PRIMARY_7 }}
      onClick={onSaveAsTemplate}
      permission={{
        permission: PermissionIdentifier.EDIT_TEMPLATE,
        resource: {
          resourceType: ResourceType.TEMPLATE
        }
      }}
      featuresProps={{
        featuresRequest: {
          featureNames: [FeatureIdentifier.TEMPLATE_SERVICE]
        }
      }}
      {...buttonProps}
    />
  )
}
