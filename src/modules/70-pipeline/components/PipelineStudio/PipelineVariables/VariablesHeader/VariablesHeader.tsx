/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { ExpandingSearchInput, Icon, Layout, Text } from '@wings-software/uicore'
import { FontVariation, Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import { usePipelineVariables } from '@pipeline/components/PipelineVariablesContext/PipelineVariablesContext'
import css from '@pipeline/components/PipelineStudio/PipelineVariables/PipelineVariables.module.scss'

export interface VariablesHeaderProps {
  enableSearch?: boolean
}

export function VariablesHeader({ enableSearch = true }: VariablesHeaderProps): JSX.Element {
  const {
    onSearchInputChange,
    searchIndex = 0,
    searchResults = [],
    goToNextSearchResult,
    goToPrevSearchResult
  } = usePipelineVariables()

  const { getString } = useStrings()
  return (
    <>
      <div className={css.variablePanelHeader}>
        <div className={css.variableTitle}>
          <Layout.Horizontal>
            <Icon name="pipeline-variables" size={24} color={Color.PRIMARY_7} />
            <Text font={{ variation: FontVariation.H4 }} tooltipProps={{ dataTooltipId: 'pipelineVariables' }}>
              {getString('variablesText')}
            </Text>
          </Layout.Horizontal>
        </div>
        <div>
          {enableSearch && (
            <ExpandingSearchInput
              alwaysExpanded
              width={450}
              onChange={onSearchInputChange}
              showPrevNextButtons
              fixedText={`${Math.min((searchIndex || 0) + 1, searchResults?.length)} / ${searchResults?.length}`}
              onNext={goToNextSearchResult}
              onPrev={goToPrevSearchResult}
              onEnter={goToNextSearchResult}
              placeholder={getString('search')}
            />
          )}
        </div>
      </div>
      <div className={css.variableListHeader}>
        <Text font={{ variation: FontVariation.SMALL_BOLD }} color={Color.GREY_600}>
          {getString('variableLabel')}{' '}
        </Text>
        <Text font={{ variation: FontVariation.SMALL_BOLD }} color={Color.GREY_600}>
          {getString('common.input')}{' '}
        </Text>
      </div>
    </>
  )
}
