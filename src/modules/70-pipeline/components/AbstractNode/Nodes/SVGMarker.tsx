import React from 'react'
import cx from 'classnames'
import css from './Nodes.module.scss'
function SVGMarker({ className }: { className?: string }): React.ReactElement {
  return (
    <defs>
      <marker id="link-port" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5">
        <circle className={cx(css.marker, className)} r="5" cy="5" cx="5" />
      </marker>
    </defs>
  )
}
export default SVGMarker
