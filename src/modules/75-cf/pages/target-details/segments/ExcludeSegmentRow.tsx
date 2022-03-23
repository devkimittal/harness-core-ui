/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Text } from '@wings-software/uicore'
import { Intent } from '@harness/design-system'
import { getErrorMessage } from '@cf/utils/CFUtils'
import { useStrings } from 'framework/strings'
import { TargetSegmentParams, useRemoveTargetsFromExcludeList } from '@cf/utils/SegmentUtils'
import type { Target, TargetDetailSegment } from 'services/cf'
import { useConfirmAction } from '@common/hooks'
import { useToaster } from '@common/exports'
import { ItemBriefInfo } from '@cf/components/ItemBriefInfo/ItemBriefInfo'

export const ExcludeSegmentRow: React.FC<{
  target?: Target | null
  segment: TargetDetailSegment
  patchParams: TargetSegmentParams
  refetch: () => void
}> = ({ target, segment, patchParams, refetch }) => {
  const { identifier, name, description } = segment as TargetDetailSegment & { description: string }
  const _useRemoveTargetsFromExcludeList = useRemoveTargetsFromExcludeList(patchParams)
  const { showError } = useToaster()
  const { getString } = useStrings()
  const remove = useConfirmAction({
    title: getString('cf.targetDetail.removeFromExcludeListTitle'),
    message: (
      <Text>
        <span
          dangerouslySetInnerHTML={{
            __html: getString('cf.targetDetail.removeFromExcludeList', {
              targetName: target?.name,
              segmentName: segment.name
            })
          }}
        />
      </Text>
    ),
    intent: Intent.DANGER,
    action: async () => {
      try {
        _useRemoveTargetsFromExcludeList(segment.identifier as string, [target?.identifier as string])
          .then(refetch)
          .catch(error => {
            showError(getErrorMessage(error), 0, 'cf.remove.target.error')
          })
      } catch (error) {
        showError(getErrorMessage(error), 0, 'cf.remove.target.error')
      }
    }
  })

  return <ItemBriefInfo key={identifier} name={name as string} description={description} onRemoveClick={remove} />
}
