/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { Container, Text, Layout, FlexExpander, Icon, TextInput } from '@wings-software/uicore'
import cx from 'classnames'
import { FontVariation } from '@harness/design-system'
import { Menu, MenuItem, Popover, Position } from '@blueprintjs/core'
import { noop } from 'lodash-es'
import { useStrings } from 'framework/strings'
import type { CEView } from 'services/ce'
import {
  useFetchViewFieldsQuery,
  QlceViewFilterWrapperInput,
  useFetchPerspectiveFiltersValueQuery,
  QlceViewFieldInputInput,
  ViewFieldIdentifier,
  ViewChartType,
  useFetchPerspectiveTimeSeriesQuery,
  QlceViewTimeGroupType,
  useFetchperspectiveGridQuery,
  ViewTimeRangeType,
  Maybe,
  QlceViewFieldIdentifierData,
  QlceViewField
} from 'services/ce/services'
import CloudCostInsightChart from '@ce/components/CloudCostInsightChart/CloudCostInsightChart'
import {
  normalizeViewRules,
  getRuleFilters,
  getGroupByFilter,
  getTimeRangeFilter,
  getTimeFilters,
  getViewFilterForId,
  perspectiveDefaultTimeRangeMapper
} from '@ce/utils/perspectiveUtils'
import { CCM_CHART_TYPES } from '@ce/constants'
import { DAYS_FOR_TICK_INTERVAL } from '@ce/components/CloudCostInsightChart/Chart'
import { CE_DATE_FORMAT_INTERNAL, getGMTEndDateTime, getGMTStartDateTime } from '@ce/utils/momentUtils'
import type { TimeRangeFilterType } from '@ce/types'
import { AGGREGATE_FUNCTION } from '../PerspectiveGrid/Columns'
import PerspectiveGrid from '../PerspectiveGrid/PerspectiveGrid'
import css from './PerspectiveBuilderPreview.module.scss'

interface GroupByViewSubMenuProps {
  labelData: Maybe<Maybe<string>[]>
  field: QlceViewFieldIdentifierData
  setGroupBy: (groupBy: QlceViewFieldInputInput) => void
}

const GroupByViewSubMenu: (props: GroupByViewSubMenuProps) => JSX.Element | null = ({
  field,
  labelData,
  setGroupBy
}) => {
  const { getString } = useStrings()
  const [searchText, setSearchText] = React.useState('')

  const filteredLabelData = (labelData || []).filter(label => {
    if (!label) {
      return false
    }
    return label.toLocaleLowerCase().indexOf(searchText.toLocaleLowerCase()) < 0 ? false : true
  })

  const renderLabels: (value: QlceViewField) => void = value => {
    return (
      <MenuItem className={css.menuItem} key={value.fieldId} text={value.fieldName}>
        <div className={css.groupByLabel}>
          <TextInput
            value={searchText}
            onChange={(e: any) => {
              setSearchText(e.target.value)
            }}
            placeholder={getString('ce.perspectives.createPerspective.filters.searchText')}
          />
          <Container className={css.labelValueContainer}>
            {filteredLabelData.map(label => (
              <MenuItem
                className={css.menuItem}
                key={label}
                text={label}
                onClick={() =>
                  setGroupBy({
                    identifier: ViewFieldIdentifier.Label,
                    fieldId: 'labels.value',
                    fieldName: label || '',
                    identifierName: 'Label'
                  })
                }
              />
            ))}
          </Container>
        </div>
      </MenuItem>
    )
  }

  if (field.values.length) {
    return (
      <>
        {field.values.map(value => {
          if (value) {
            if (value.fieldId === 'label') {
              return renderLabels(value)
            }
            return (
              <MenuItem
                className={css.menuItem}
                key={value.fieldId}
                text={value.fieldName}
                onClick={() =>
                  setGroupBy({
                    fieldId: value.fieldId,
                    fieldName: value.fieldName,
                    identifier: field.identifier,
                    identifierName: field.identifierName
                  })
                }
              />
            )
          }
          return null
        })}
      </>
    )
  }
  return null
}

interface GroupByViewProps {
  groupBy: QlceViewFieldInputInput
  setGroupBy: (groupBy: QlceViewFieldInputInput) => void
  chartType: ViewChartType
  setChartType: (type: ViewChartType) => void
  timeRange: TimeRangeFilterType
}

const GroupByView: React.FC<GroupByViewProps> = ({ groupBy, setGroupBy, chartType, setChartType, timeRange }) => {
  const { perspectiveId } = useParams<{ perspectiveId: string }>()

  const { getString } = useStrings()

  const [result] = useFetchViewFieldsQuery({
    variables: {
      filters: [{ viewMetadataFilter: { viewId: perspectiveId, isPreview: true } } as QlceViewFilterWrapperInput]
    }
  })
  const { data, fetching } = result

  const [labelResult] = useFetchPerspectiveFiltersValueQuery({
    variables: {
      filters: [
        ...getTimeFilters(getGMTStartDateTime(timeRange.from), getGMTEndDateTime(timeRange.to)),
        {
          idFilter: {
            field: {
              fieldId: 'labels.key',
              fieldName: '',
              identifier: 'LABEL'
            },
            operator: 'IN',
            values: []
          }
        } as unknown as QlceViewFilterWrapperInput
      ],
      offset: 0,
      limit: 100
    }
  })

  const { data: labelResData } = labelResult

  const labelData = labelResData?.perspectiveFilters?.values

  const fieldIdentifierData = data?.perspectiveFields?.fieldIdentifierData

  const PopoverContent =
    fieldIdentifierData && fieldIdentifierData.length ? (
      <Menu>
        {fieldIdentifierData.map(field => {
          if (field) {
            return (
              <MenuItem className={css.menuItem} key={field.identifier} text={field.identifierName}>
                <GroupByViewSubMenu setGroupBy={setGroupBy} labelData={labelData || []} field={field} />
              </MenuItem>
            )
          }
          return null
        })}
      </Menu>
    ) : undefined

  return (
    <Layout.Horizontal
      spacing="small"
      style={{
        alignItems: 'center'
      }}
    >
      <Text font="small" color="grey400">
        {getString('ce.perspectives.createPerspective.preview.groupBy')}
      </Text>
      <Popover
        disabled={fetching}
        position={Position.BOTTOM_LEFT}
        modifiers={{
          arrow: { enabled: false },
          flip: { enabled: true },
          keepTogether: { enabled: true },
          preventOverflow: { enabled: true }
        }}
        content={PopoverContent}
      >
        <Container background="grey100" className={cx(css.groupBySelect, { [css.groupBySelectLoading]: fetching })}>
          {fetching ? (
            <Icon name="spinner" />
          ) : (
            <Text font="small" background="grey100" rightIcon="chevron-down">
              {groupBy.fieldName}
            </Text>
          )}
        </Container>
      </Popover>
      <FlexExpander />
      <Container>{/* <Text font="small">Aggregation</Text> */}</Container>
      <Icon
        name="timeline-bar-chart"
        size={18}
        onClick={() => {
          setChartType(ViewChartType.StackedTimeSeries)
        }}
        color={chartType === ViewChartType.StackedTimeSeries ? 'primary6' : 'grey500'}
      />
      <Icon
        name="timeline-area-chart"
        size={20}
        onClick={() => {
          setChartType(ViewChartType.StackedLineChart)
        }}
        color={chartType === ViewChartType.StackedLineChart ? 'primary6' : 'grey500'}
      />
    </Layout.Horizontal>
  )
}

interface PerspectiveBuilderPreviewProps {
  groupBy: QlceViewFieldInputInput
  setGroupBy: (groupBy: QlceViewFieldInputInput) => void
  chartType: ViewChartType
  setChartType: (type: ViewChartType) => void
  formValues: CEView
}

const PerspectiveBuilderPreview: React.FC<PerspectiveBuilderPreviewProps> = ({
  groupBy,
  setGroupBy,
  chartType,
  setChartType,
  formValues
}) => {
  const { perspectiveId } = useParams<{ perspectiveId: string }>()

  const timeRangeMapper = perspectiveDefaultTimeRangeMapper

  const timeRange = formValues.viewTimeRange?.viewTimeRangeType || ViewTimeRangeType.Last_7

  const dateRange = timeRangeMapper[timeRange]

  const timeRangeObj: TimeRangeFilterType = {
    to: dateRange[1].format(CE_DATE_FORMAT_INTERNAL),
    from: dateRange[0].format(CE_DATE_FORMAT_INTERNAL)
  }

  const [chartResult] = useFetchPerspectiveTimeSeriesQuery({
    variables: {
      filters: [
        getViewFilterForId(perspectiveId, true),
        ...getTimeFilters(getGMTStartDateTime(timeRangeObj.from), getGMTEndDateTime(timeRangeObj.to)),
        ...getRuleFilters(normalizeViewRules(formValues.viewRules))
      ],
      limit: 12,
      groupBy: [
        getTimeRangeFilter(
          (formValues.viewVisualization?.granularity as QlceViewTimeGroupType) || QlceViewTimeGroupType.Day
        ),
        getGroupByFilter(groupBy)
      ]
    }
  })

  const [gridResults] = useFetchperspectiveGridQuery({
    variables: {
      aggregateFunction: AGGREGATE_FUNCTION.DEFAULT,
      filters: [
        getViewFilterForId(perspectiveId, true),
        ...getTimeFilters(dateRange[0].valueOf(), dateRange[1].valueOf()),
        ...getRuleFilters(normalizeViewRules(formValues.viewRules))
      ],
      limit: 100,
      offset: 0,
      isClusterOnly: false,
      groupBy: [getGroupByFilter(groupBy)]
    }
  })

  const { data: gridData, fetching: gridFetching } = gridResults
  const { data: chartData, fetching } = chartResult

  const { getString } = useStrings()
  return (
    <Container padding="xxlarge" background="white" className={css.previewMainContainer}>
      <Layout.Vertical spacing="xlarge">
        <Container>
          <Text font={{ variation: FontVariation.H4 }} margin={{ bottom: 'medium' }}>
            {getString('ce.perspectives.createPerspective.preview.title')}
          </Text>
          <GroupByView
            timeRange={timeRangeObj}
            setGroupBy={setGroupBy}
            groupBy={groupBy}
            chartType={chartType}
            setChartType={setChartType}
          />

          <CloudCostInsightChart
            chartType={chartType === ViewChartType.StackedLineChart ? CCM_CHART_TYPES.AREA : CCM_CHART_TYPES.COLUMN}
            columnSequence={[]}
            setFilterUsingChartClick={() => {
              noop
            }}
            fetching={fetching}
            showLegends={false}
            data={chartData?.perspectiveTimeSeriesStats as any}
            aggregation={
              (formValues.viewVisualization?.granularity as QlceViewTimeGroupType) || QlceViewTimeGroupType.Day
            }
            xAxisPointCount={chartData?.perspectiveTimeSeriesStats?.stats?.length || DAYS_FOR_TICK_INTERVAL + 1}
          />
        </Container>
        <Container width="100%">
          <Text color="grey900">Cost Breakdown</Text>
          {gridData?.perspectiveGrid?.data && (
            <PerspectiveGrid
              gridFetching={gridFetching}
              gridData={gridData?.perspectiveGrid?.data as any}
              groupBy={groupBy}
              showColumnSelector={false}
              tempGridColumns={true}
              showPagination={false}
            />
          )}
        </Container>
      </Layout.Vertical>
    </Container>
  )
}

export default PerspectiveBuilderPreview
