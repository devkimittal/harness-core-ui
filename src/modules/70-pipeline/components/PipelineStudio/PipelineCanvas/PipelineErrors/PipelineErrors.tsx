import React from 'react'

interface PropsInterface {
  errors: any
}

var getAdaptErrors = schemaErrors =>
  schemaErrors.reduce(
    (accum, item) => {
      const isPipelineError = !item.stageInfo && !item.stepInfo
      const isStageError = item.stageInfo && !item.stepInfo
      const errorsByStage = accum.errorsByStage
      const addToErrorsByStage = () =>
        isStageError
          ? [item, ...errorsByStage[item.stageInfo.identifier]]
          : [...errorsByStage[item.stageInfo.identifier], item]
      if (isPipelineError) {
      } else {
        if (errorsByStage[item.stageInfo.identifier]) {
          errorsByStage[item.stageInfo.identifier] = addToErrorsByStage()
        } else {
          errorsByStage[item.stageInfo.identifier] = [item]
          accum.stageIds.push(item.stageInfo.identifier)
        }
      }
      return accum
    },
    { stageIds: [], errorsByStage: {} }
  )

const StageErrors = ({ errors }) => {
  const stageName = errors[0].stageInfo.name
  const renderError = error => {
    const { stageInfo, stepInfo } = error
    if (!stageInfo && !stepInfo) return null
    if (stageInfo && !stepInfo) {
      return <div>{`stage error: ${error.message}`}</div>
    }
    if (stageInfo && stepInfo) {
      return <div>{`step error: ${error.message}`}</div>
    }
  }
  return (
    <div>
      <h1>Stage: ${stageName}</h1>
      {errors.map(renderError)}
    </div>
  )
}

const PipelineErrors: React.FC<PropsInterface> = ({ errors: schemaErrors }) => {
  if (!schemaErrors.length) {
    return null
  }
  const { stageIds, errorsByStage } = getAdaptErrors(schemaErrors)
  return (
    <>
      {stageIds.map(stageId => {
        return <StageErrors key={stageId} errors={errorsByStage[stageId]} />
      })}
    </>
  )
}

export default PipelineErrors
