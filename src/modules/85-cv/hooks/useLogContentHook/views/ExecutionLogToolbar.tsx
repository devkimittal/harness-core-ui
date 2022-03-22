/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  Button,
  ButtonVariation,
  Color,
  Container,
  ExpandingSearchInput,
  ExpandingSearchInputHandle,
  Layout
} from '@harness/uicore'
import { useStrings } from 'framework/strings'
import { useGlobalEventListener } from '@common/hooks'
import type { ExecutionLogToolbarProps } from '../useLogContentHook.types'

const ExecutionLogToolbar: React.FC<ExecutionLogToolbarProps> = ({ state, actions, isFullScreen, setIsFullScreen }) => {
  const { getString } = useStrings()
  const searchRef = React.useRef<ExpandingSearchInputHandle>()
  const { currentIndex, linesWithResults } = state.searchData

  const handleSearchChange = (term: string): void => {
    if (term) {
      actions.search(term)
    } else {
      actions.resetSearch()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>): void => {
    /* istanbul ignore else */
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      actions.goToPrevSearchResult()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      actions.goToNextSearchResult()
    }
  }

  const getKeyDownListener = (e: KeyboardEvent): void => {
    const isMetaKey = navigator.userAgent.includes('Mac') ? e.metaKey : e.ctrlKey

    if (e.key === 'f' && isMetaKey && searchRef.current) {
      e.preventDefault()
      searchRef.current.focus()
    }
  }

  /* istanbul ignore next */
  useGlobalEventListener('keydown', getKeyDownListener)

  /* istanbul ignore next */
  const handleDownloadLogs = (): void => {
    const data = state.data.map(log => log.text)
    const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(JSON.stringify(data))}`
    const link = document.createElement('a')

    link.href = jsonString
    link.download = `execution-logs-${Date.now()}.json`
    link.click()
  }

  return (
    <Container
      flex
      padding="small"
      background={Color.PRIMARY_10}
      border={{ bottom: true, color: Color.GREY_700 }}
      onKeyDown={handleKeyDown}
    >
      <div></div>
      <Layout.Horizontal spacing="medium">
        <ExpandingSearchInput
          flip
          theme="dark"
          ref={searchRef}
          showPrevNextButtons
          onChange={handleSearchChange}
          fixedText={`${Math.min(currentIndex + 1, linesWithResults.length)} / ${linesWithResults.length}`}
          onNext={/* istanbul ignore next */ () => actions.goToNextSearchResult()}
          onPrev={/* istanbul ignore next */ () => actions.goToPrevSearchResult()}
          onEnter={/* istanbul ignore next */ () => actions.goToNextSearchResult()}
        />
        <Button
          withoutCurrentColor
          variation={ButtonVariation.ICON}
          icon={isFullScreen ? 'full-screen-exit' : 'full-screen'}
          iconProps={{ size: 22, color: Color.GREY_200 }}
          onClick={() => setIsFullScreen(_isFullScreen => !_isFullScreen)}
        />
        <Container border={{ left: true, color: Color.GREY_700 }} />
        <Button
          text={getString('cv.download')}
          icon="command-install"
          variation={ButtonVariation.LINK}
          onClick={handleDownloadLogs}
        />
      </Layout.Horizontal>
    </Container>
  )
}

export default ExecutionLogToolbar
