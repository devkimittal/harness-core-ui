import React from 'react'
import { ButtonVariation, ButtonGroup, Button } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import { ZOOM_INC_DEC_LEVEL, INITIAL_ZOOM_LEVEL } from './constants'
import css from './GraphActions.module.scss'
interface GraphActionProps {
  setGraphScale: (data: number) => void
  graphScale: number
  handleScaleToFit: () => void
}
function GraphActions({ setGraphScale, graphScale, handleScaleToFit }: GraphActionProps): React.ReactElement {
  const { getString } = useStrings()
  return (
    <span className={css.canvasButtons}>
      <div className={css.vertical}>
        <ButtonGroup>
          <Button
            variation={ButtonVariation.TERTIARY}
            icon="canvas-position"
            tooltip={getString('canvasButtons.zoomToFit')}
            onClick={handleScaleToFit}
          />
        </ButtonGroup>
        <ButtonGroup>
          <Button
            variation={ButtonVariation.TERTIARY}
            icon="canvas-selector"
            tooltip={getString('reset')}
            onClick={() => setGraphScale(INITIAL_ZOOM_LEVEL)}
          />
        </ButtonGroup>
        <span className={css.verticalButtons}>
          <ButtonGroup>
            <Button
              variation={ButtonVariation.TERTIARY}
              icon="zoom-in"
              tooltip={getString('canvasButtons.zoomIn')}
              onClick={() => {
                Number(graphScale.toFixed(1)) < 2 && setGraphScale(graphScale + ZOOM_INC_DEC_LEVEL)
              }}
            />
            <Button
              variation={ButtonVariation.TERTIARY}
              icon="zoom-out"
              tooltip={getString('canvasButtons.zoomOut')}
              onClick={() => {
                Number(graphScale.toFixed(1)) > 0.3 && setGraphScale(graphScale - ZOOM_INC_DEC_LEVEL)
              }}
            />
          </ButtonGroup>
        </span>
      </div>
    </span>
  )
}
export default GraphActions
