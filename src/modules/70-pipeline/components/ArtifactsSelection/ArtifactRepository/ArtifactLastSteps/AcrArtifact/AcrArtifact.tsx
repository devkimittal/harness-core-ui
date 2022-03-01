/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { StepProps } from '@wings-software/uicore'
import type { ConnectorConfigDTO } from 'services/cd-ng'
import type { ImagePathProps } from '@pipeline/components/ArtifactsSelection/ArtifactInterface'
// eslint-disable-next-line react/function-component-definition
export const AcrArtifact: React.FC<StepProps<ConnectorConfigDTO> & ImagePathProps> = (props: ImagePathProps) => {
  return <div {...props} />
}
