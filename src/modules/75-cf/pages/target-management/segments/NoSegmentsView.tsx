/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { Container } from '@wings-software/uicore'
import { NoData } from '@cf/components/NoData/NoData'
import { useStrings } from 'framework/strings'
import { NewSegmentButton } from './NewSegmentButton'
import imageURL from './segment.svg'

export interface NoSegmentsViewProps {
  hasEnvironment: boolean
  onNewSegmentCreated: (segmentIdentifier: string) => void
}

export const NoSegmentsView: React.FC<NoSegmentsViewProps> = ({ hasEnvironment, onNewSegmentCreated }) => {
  const { projectIdentifier, orgIdentifier, accountId } = useParams<Record<string, string>>()
  const { getString } = useStrings()

  return (
    <Container width="100%" height="100%" flex={{ align: 'center-center' }}>
      <NoData
        imageURL={imageURL}
        message={getString(hasEnvironment ? 'cf.segments.noSegmentForEnv' : 'cf.segments.noSegment')}
      >
        <NewSegmentButton
          accountId={accountId}
          orgIdentifier={orgIdentifier}
          projectIdentifier={projectIdentifier}
          onCreated={onNewSegmentCreated}
        />
      </NoData>
    </Container>
  )
}
