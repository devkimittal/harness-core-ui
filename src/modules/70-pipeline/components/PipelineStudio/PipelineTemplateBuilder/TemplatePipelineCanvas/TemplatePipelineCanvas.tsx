/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Tag } from '@wings-software/uicore'
import { useStageBuilderCanvasState } from '@pipeline/components/PipelineStudio/StageBuilder/useStageBuilderCanvasState'
import { CanvasWidget, createEngine } from '@pipeline/components/Diagram'
import { StageBuilderModel } from '@pipeline/components/PipelineStudio/StageBuilder/StageBuilderModel'
import type { PipelineInfoConfig } from 'services/cd-ng'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { useStrings } from 'framework/strings'
import { useValidationErrors } from '@pipeline/components/PipelineStudio/PiplineHooks/useValidationErrors'
import { CanvasButtons } from '@pipeline/components/CanvasButtons/CanvasButtons'
import css from './TemplatePipelineCanvas.module.scss'

export interface TemplatePipelineCanvasPops {
  pipeline: PipelineInfoConfig
}

export function TemplatePipelineCanvas({ pipeline }: TemplatePipelineCanvasPops): React.ReactElement {
  const {
    state: { templateTypes },
    stagesMap
  } = usePipelineContext()
  const canvasRef = React.useRef<HTMLDivElement | null>(null)
  const { getString } = useStrings()
  const { errorMap } = useValidationErrors()

  const model = React.useMemo(() => new StageBuilderModel(), [])
  model.addUpdateGraph({
    data: pipeline,
    listeners: {
      nodeListeners: {},
      linkListeners: {}
    },
    zoomLevel: model.getZoomLevel(),
    stagesMap,
    getString,
    isReadonly: true,
    splitPaneSize: canvasRef.current?.offsetHeight,
    parentPath: 'pipeline.stages',
    errorMap,
    templateTypes
  })

  const engine = React.useMemo(() => createEngine({}), [])
  engine.setModel(model)

  useStageBuilderCanvasState(engine, [])

  return (
    <div className={css.canvas} ref={canvasRef}>
      <Tag className={css.readOnlyTag}>READ ONLY</Tag>
      <CanvasWidget engine={engine} />
      <CanvasButtons
        tooltipPosition="left"
        engine={engine}
        callback={() => {
          model.addUpdateGraph({
            data: pipeline,
            listeners: {
              nodeListeners: {},
              linkListeners: {}
            },
            zoomLevel: model.getZoomLevel(),
            stagesMap,
            getString,
            isReadonly: true,
            splitPaneSize: canvasRef.current?.offsetHeight,
            parentPath: 'pipeline.stages',
            errorMap,
            templateTypes
          })
        }}
      />
    </div>
  )
}
