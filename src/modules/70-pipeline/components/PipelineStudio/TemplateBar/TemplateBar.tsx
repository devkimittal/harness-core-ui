/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { defaultTo } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { Container, Icon, IconName, Layout, Popover, Text, useConfirmationDialog } from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import { Classes, Dialog, Intent, Menu, Position } from '@blueprintjs/core'
import cx from 'classnames'
import { useStrings } from 'framework/strings'
import { getTemplateNameWithLabel } from '@pipeline/utils/templateUtils'
import { useFeature } from '@common/hooks/useFeatures'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import routes from '@common/RouteDefinitions'
import type { PipelineType, ProjectPathProps, GitQueryParams } from '@common/interfaces/RouteInterfaces'
import { useGetTemplate } from 'services/template-ng'
import { getIdentifierFromValue, getScopeFromValue } from '@common/components/EntityReference/EntityReference'
import { TemplateYaml } from '@pipeline/components/PipelineStudio/TemplateYaml/TemplateYaml'
import { Scope } from '@common/interfaces/SecretsInterface'
import type { TemplateLinkConfig } from 'services/pipeline-ng'
import { useQueryParams } from '@common/hooks'
import css from './TemplateBar.module.scss'

interface TemplateMenuItem {
  icon?: IconName
  label: string
  disabled?: boolean
  onClick: () => void
}

export interface TemplateBarProps {
  templateLinkConfig: TemplateLinkConfig
  onOpenTemplateSelector: () => void
  onRemoveTemplate: () => Promise<void>
  className?: string
}

export function TemplateBar(props: TemplateBarProps): JSX.Element {
  const { templateLinkConfig, onOpenTemplateSelector, onRemoveTemplate, className = '' } = props
  const [menuOpen, setMenuOpen] = React.useState(false)
  const { getString } = useStrings()
  const { accountId, orgIdentifier, projectIdentifier, module } = useParams<PipelineType<ProjectPathProps>>()
  const { branch, repoIdentifier } = useQueryParams<GitQueryParams>()
  const scope = getScopeFromValue(templateLinkConfig.templateRef)
  const { enabled: templatesEnabled } = useFeature({
    featureRequest: {
      featureName: FeatureIdentifier.TEMPLATE_SERVICE
    }
  })

  const [isTemplatePreviewModalOpen, setIsTemplatePreviewModalOpen] = React.useState(false)

  const { data } = useGetTemplate({
    templateIdentifier: getIdentifierFromValue(templateLinkConfig.templateRef),
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier: scope === Scope.PROJECT ? projectIdentifier : undefined,
      orgIdentifier: scope === Scope.PROJECT || scope === Scope.ORG ? orgIdentifier : undefined,
      versionLabel: defaultTo(templateLinkConfig.versionLabel, ''),
      repoIdentifier,
      branch,
      getDefaultFromOtherRepo: true
    }
  })

  const selectedTemplate = data?.data

  const { openDialog: openRemoveTemplateDialog } = useConfirmationDialog({
    intent: Intent.DANGER,
    buttonIntent: Intent.DANGER,
    cancelButtonText: getString('cancel'),
    contentText: getString('pipeline.removeTemplate'),
    titleText: `${getString('common.remove')} ${getTemplateNameWithLabel(selectedTemplate)}?`,
    confirmButtonText: getString('common.remove'),
    onCloseDialog: async isConfirmed => {
      if (isConfirmed) {
        await onRemoveTemplate()
      }
    }
  })

  const openTemplateInNewTab = () => {
    if (selectedTemplate) {
      const templateStudioPath = routes.toTemplateStudio({
        projectIdentifier: selectedTemplate.projectIdentifier,
        orgIdentifier: selectedTemplate.orgIdentifier,
        accountId: defaultTo(selectedTemplate.accountId, ''),
        module,
        templateType: selectedTemplate.templateEntityType,
        templateIdentifier: selectedTemplate.identifier,
        versionLabel: selectedTemplate.versionLabel,
        repoIdentifier: selectedTemplate.gitDetails?.repoIdentifier,
        branch: selectedTemplate.gitDetails?.branch
      })

      window.open(`${window.location.origin}${window.location.pathname}#${templateStudioPath}`, '_blank')
    }
  }

  const onShowTemplateYAMLPreview = () => {
    setIsTemplatePreviewModalOpen(true)
  }

  const getItems = (): TemplateMenuItem[] => {
    return [
      {
        icon: 'command-switch',
        label: getString('pipeline.changeTemplateLabel'),
        disabled: !templatesEnabled,
        onClick: onOpenTemplateSelector
      },
      {
        icon: 'main-trash',
        label: getString('pipeline.removeTemplateLabel'),
        onClick: openRemoveTemplateDialog
      },
      {
        icon: 'main-share',
        label: getString('pipeline.openTemplateInNewTabLabel'),
        disabled: !selectedTemplate,
        onClick: openTemplateInNewTab
      },
      {
        icon: 'main-view',
        label: getString('pipeline.previewTemplateLabel'),
        disabled: !selectedTemplate,
        onClick: onShowTemplateYAMLPreview
      }
    ]
  }

  return (
    <>
      <Container
        padding={{ top: 'small', right: 'medium', bottom: 'small', left: 'medium' }}
        background={Color.PRIMARY_6}
        border={{ radius: 4 }}
        className={cx(css.container, className)}
      >
        <Layout.Horizontal spacing={'small'} flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
          <Icon size={11} color={Color.WHITE} name={'template-library'} />
          <Text style={{ flexGrow: 1 }} font={{ size: 'small' }} color={Color.WHITE}>
            {selectedTemplate ? `Using Template: ${getTemplateNameWithLabel(selectedTemplate)}` : getString('loading')}
          </Text>
          <Popover
            isOpen={menuOpen}
            onInteraction={nextOpenState => {
              setMenuOpen(nextOpenState)
            }}
            position={Position.BOTTOM_RIGHT}
            className={css.main}
            disabled={!selectedTemplate}
            portalClassName={css.popover}
          >
            <Icon
              name={'more'}
              color={Color.WHITE}
              className={css.actionButton}
              onClick={e => {
                e.stopPropagation()
                setMenuOpen(true)
              }}
            />
            <Menu style={{ minWidth: 'unset' }} onClick={e => e.stopPropagation()}>
              {getItems()?.map(item => {
                return (
                  <li
                    key={item.label}
                    className={cx(css.menuItem, { [css.disabled]: item.disabled })}
                    onClick={e => {
                      e.stopPropagation()
                      if (!item.disabled) {
                        item.onClick()
                        setMenuOpen(false)
                      }
                    }}
                  >
                    {item.icon && <Icon name={item.icon} size={12} />}
                    <Text lineClamp={1}>{item.label}</Text>
                  </li>
                )
              })}
            </Menu>
          </Popover>
        </Layout.Horizontal>
      </Container>
      <Dialog
        isOpen={isTemplatePreviewModalOpen}
        enforceFocus={false}
        canEscapeKeyClose
        canOutsideClickClose
        onClose={() => setIsTemplatePreviewModalOpen(false)}
        title={'template.yaml'}
        isCloseButtonShown
        className={Classes.DIALOG}
        usePortal={false}
      >
        <Container className={css.templateYamlPreviewContainer}>
          <TemplateYaml templateYaml={defaultTo(selectedTemplate?.yaml, '')} withoutHeader={true} />
        </Container>
      </Dialog>
    </>
  )
}
