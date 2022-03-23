/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, Icon, Text, CollapseList, CollapseListPanel } from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import cx from 'classnames'
import { useStrings } from 'framework/strings'
import type { GroupedMetric } from './GroupedSideNav.types'
import css from '../../SelectedAppsSideNav.module.scss'

interface GroupedSideNavInterface {
  onSelect?: (selectedMetric: string, index: number) => void
  selectedItem?: string
  onRemoveItem?: (removedItem: string, index: number) => void
  groupedSelectedAppsList: [string, GroupedMetric[]][]
}
export default function GroupedSideNav({
  groupedSelectedAppsList,
  selectedItem,
  onRemoveItem,
  onSelect
}: GroupedSideNavInterface): JSX.Element {
  const { getString } = useStrings()
  return (
    <>
      {groupedSelectedAppsList.map(groupItem => {
        if (!groupItem) {
          return <></>
        }
        const [label, items] = groupItem
        return (
          <CollapseList key={label} defaultOpenIndex={0}>
            <CollapseListPanel
              collapseHeaderProps={{
                heading: (
                  <Text
                    className={cx(css.selectedApp, css.collapseHeading)}
                    color={Color.GREY_900}
                    font={{ weight: 'semi-bold', size: 'normal' }}
                  >
                    {label || getString('cv.addGroupName')}
                  </Text>
                ),
                collapsedIcon: 'main-chevron-right',
                expandedIcon: 'main-chevron-down',
                iconProps: { name: 'main-chevron-right', color: 'primary6' }
              }}
              key={label}
              className={css.collapsePanel}
            >
              {items?.map(selectedApp => {
                return (
                  <Container
                    key={selectedApp.metricName}
                    className={css.seletedAppContainer}
                    onClick={() => {
                      onSelect?.(selectedApp?.metricName || '', selectedApp.index as number)
                    }}
                  >
                    <Text
                      className={cx(
                        css.selectedApp,
                        selectedItem && selectedApp.metricName === selectedItem ? css.isSelected : false
                      )}
                      lineClamp={1}
                    >
                      {selectedApp.metricName}
                    </Text>
                    {onRemoveItem && (
                      <Icon
                        name="main-delete"
                        onClick={e => {
                          e.stopPropagation()
                          if (selectedApp.metricName) {
                            onRemoveItem(selectedApp.metricName, selectedApp.index as number)
                          }
                        }}
                      />
                    )}
                  </Container>
                )
              })}
            </CollapseListPanel>
          </CollapseList>
        )
      })}
    </>
  )
}
