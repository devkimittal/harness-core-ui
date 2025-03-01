/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Dialog, Classes } from '@blueprintjs/core'
import {
  Button,
  Formik,
  Layout,
  NestedAccordionProvider,
  ButtonVariation,
  PageSpinner,
  VisualYamlSelectedView as SelectedView,
  getErrorInfoFromErrorObject,
  SelectOption
} from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import { useModalHook } from '@harness/use-modal'
import cx from 'classnames'
import { useHistory } from 'react-router-dom'
import { parse } from 'yaml'
import { mergeWith, isEmpty, isEqual, defaultTo, keyBy } from 'lodash-es'
import type { FormikErrors } from 'formik'
import type { PipelineInfoConfig, ResponseJsonNode } from 'services/cd-ng'
import {
  useGetPipeline,
  usePostPipelineExecuteWithInputSetYaml,
  useGetTemplateFromPipeline,
  useGetMergeInputSetFromPipelineTemplateWithListInput,
  useRePostPipelineExecuteWithInputSetYaml,
  StageExecutionResponse,
  useRunStagesWithRuntimeInputYaml,
  useRerunStagesWithRuntimeInputYaml,
  useGetStagesExecutionList
} from 'services/pipeline-ng'
import { useToaster } from '@common/exports'
import routes from '@common/RouteDefinitions'
import type { YamlBuilderHandlerBinding, YamlBuilderProps } from '@common/interfaces/YAMLBuilderProps'
import { usePermission } from '@rbac/hooks/usePermission'
import type {
  GitQueryParams,
  InputSetGitQueryParams,
  PipelinePathProps,
  PipelineType
} from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import RbacButton from '@rbac/components/Button/Button'
import {
  ALL_STAGE_VALUE,
  getAllStageData,
  getAllStageItem,
  getFeaturePropsForRunPipelineButton,
  mergeTemplateWithInputSetData,
  POLL_INTERVAL,
  SelectedStageData,
  StageSelectionData
} from '@pipeline/utils/runPipelineUtils'
import { useMutateAsGet, useQueryParams } from '@common/hooks'
import { yamlStringify } from '@common/utils/YamlHelperMethods'
import { PipelineActions } from '@common/constants/TrackingConstants'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { sanitize } from '@common/utils/JSONUtils'
import type { InputSetDTO } from '@pipeline/utils/types'
import { useDeepCompareEffect } from '@common/hooks/useDeepCompareEffect'
import { useGetYamlWithTemplateRefsResolved } from 'services/template-ng'
import {
  clearRuntimeInput,
  validatePipeline,
  getErrorsList,
  mergeWithPipelineCustomizer
} from '../PipelineStudio/StepUtil'
import { PreFlightCheckModal } from '../PreFlightCheckModal/PreFlightCheckModal'
import { YamlBuilderMemo } from '../PipelineStudio/PipelineYamlView/PipelineYamlView'
import type { Values } from '../PipelineStudio/StepCommands/StepCommandTypes'
import factory from '../PipelineSteps/PipelineStepFactory'
import { StepViewType } from '../AbstractSteps/Step'
import SaveAsInputSet from './SaveAsInputSet'
import ReplacedExpressionInputForm from './ReplacedExpressionInputForm'
import {
  KVPair,
  PipelineVariablesContextProvider,
  usePipelineVariables
} from '../PipelineVariablesContext/PipelineVariablesContext'
import type { InputSetSelectorProps } from '../InputSetSelector/InputSetSelector'
import { ApprovalStageInfo, ExpressionsInfo, RequiredStagesInfo } from './RunStageInfoComponents'
import { PipelineInvalidRequestContent } from './PipelineInvalidRequestContent'
import RunModalHeader from './RunModalHeader'
import CheckBoxActions from './CheckBoxActions'
import VisualView from './VisualView'

import css from './RunPipelineForm.module.scss'

export interface RunPipelineFormProps extends PipelineType<PipelinePathProps & GitQueryParams> {
  inputSetSelected?: InputSetSelectorProps['value']
  inputSetYAML?: string
  onClose?: () => void
  executionView?: boolean
  mockData?: ResponseJsonNode
  executionInputSetTemplateYaml?: string
  stagesExecuted?: string[]
  executionIdentifier?: string
}

const yamlBuilderReadOnlyModeProps: YamlBuilderProps = {
  fileName: `run-pipeline.yaml`,
  entityType: 'Pipelines',
  showSnippetSection: false,
  yamlSanityConfig: {
    removeEmptyString: false,
    removeEmptyObject: false,
    removeEmptyArray: false
  }
}

function RunPipelineFormBasic({
  pipelineIdentifier,
  accountId,
  orgIdentifier,
  projectIdentifier,
  onClose,
  inputSetSelected,
  inputSetYAML,
  module,
  executionView,
  branch,
  repoIdentifier,
  executionInputSetTemplateYaml = '',
  stagesExecuted,
  executionIdentifier
}: RunPipelineFormProps & InputSetGitQueryParams): React.ReactElement {
  const [skipPreFlightCheck, setSkipPreFlightCheck] = useState<boolean>(false)
  const [selectedView, setSelectedView] = useState<SelectedView>(SelectedView.VISUAL)
  const [notifyOnlyMe, setNotifyOnlyMe] = useState<boolean>(false)
  const [selectedInputSets, setSelectedInputSets] = useState<InputSetSelectorProps['value']>(inputSetSelected)
  const [formErrors, setFormErrors] = useState<FormikErrors<InputSetDTO>>({})
  const [currentPipeline, setCurrentPipeline] = useState<{ pipeline?: PipelineInfoConfig } | undefined>(
    inputSetYAML ? parse(inputSetYAML) : undefined
  )
  const { trackEvent } = useTelemetry()
  const { showError, showSuccess, showWarning } = useToaster()
  const history = useHistory()
  const { getString } = useStrings()
  const { isGitSyncEnabled } = useAppStore()
  const [runClicked, setRunClicked] = useState(false)
  const [expressionFormState, setExpressionFormState] = useState<KVPair>({})
  const [selectedStageData, setSelectedStageData] = useState<StageSelectionData>({
    allStagesSelected: true,
    selectedStages: [getAllStageData(getString)],
    selectedStageItems: [getAllStageItem(getString)]
  })
  const { setPipeline: updatePipelineInVaribalesContext } = usePipelineVariables()
  const [existingProvide, setExistingProvide] = useState<'existing' | 'provide'>('existing')

  useEffect(() => {
    getTemplateFromPipeline()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [canEdit] = usePermission(
    {
      resourceScope: {
        accountIdentifier: accountId,
        orgIdentifier,
        projectIdentifier
      },
      resource: {
        resourceType: ResourceType.PIPELINE,
        resourceIdentifier: pipelineIdentifier
      },
      permissions: [PermissionIdentifier.EDIT_PIPELINE]
    },
    [accountId, orgIdentifier, projectIdentifier, pipelineIdentifier]
  )

  const stageIdentifiers = useMemo((): string[] => {
    let stageIds: string[] = []
    stageIds = stagesExecuted?.length
      ? stagesExecuted
      : selectedStageData.allStagesSelected
      ? []
      : (selectedStageData.selectedStageItems.map(stageData => stageData.value) as string[])
    if (stageIds.includes(ALL_STAGE_VALUE)) {
      stageIds = []
    }
    return stageIds
  }, [stagesExecuted, selectedStageData])

  const {
    data: template,
    loading: loadingTemplate,
    error: getTemplateError,
    refetch: getTemplateFromPipeline
  } = useMutateAsGet(useGetTemplateFromPipeline, {
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      pipelineIdentifier,
      projectIdentifier,
      repoIdentifier,
      branch
    },
    body: {
      stageIdentifiers
    },
    lazy: true
  })
  const { data: pipelineResponse, loading: loadingPipeline } = useGetPipeline({
    pipelineIdentifier,
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      repoIdentifier,
      branch
    }
  })

  const pipeline: PipelineInfoConfig | undefined = React.useMemo(
    () => parse(defaultTo(pipelineResponse?.data?.yamlPipeline, ''))?.pipeline,
    [pipelineResponse?.data?.yamlPipeline]
  )

  const { data: templateRefsResolvedPipeline, loading: loadingResolvedPipeline } = useMutateAsGet(
    useGetYamlWithTemplateRefsResolved,
    {
      queryParams: {
        accountIdentifier: accountId,
        orgIdentifier,
        pipelineIdentifier,
        projectIdentifier,
        repoIdentifier,
        branch,
        getDefaultFromOtherRepo: true
      },
      body: {
        originalEntityYaml: yamlStringify(pipeline)
      }
    }
  )

  const { mutate: runPipeline, loading: runLoading } = usePostPipelineExecuteWithInputSetYaml({
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      moduleType: module,
      repoIdentifier,
      branch
    },
    identifier: pipelineIdentifier,
    requestOptions: {
      headers: {
        'content-type': 'application/yaml'
      }
    }
  })

  const { mutate: runStage, loading: runStageLoading } = useRunStagesWithRuntimeInputYaml({
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      moduleType: module,
      repoIdentifier,
      branch
    },
    identifier: pipelineIdentifier
  })
  const { executionId } = useQueryParams<{ executionId?: string }>()
  const pipelineExecutionId = executionIdentifier ?? executionId
  const { mutate: reRunPipeline, loading: reRunLoading } = useRePostPipelineExecuteWithInputSetYaml({
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      moduleType: module,
      repoIdentifier,
      branch
    },
    identifier: pipelineIdentifier,
    originalExecutionId: defaultTo(pipelineExecutionId, ''),
    requestOptions: {
      headers: {
        'content-type': 'application/yaml'
      }
    }
  })
  const { mutate: reRunStages, loading: reRunStagesLoading } = useRerunStagesWithRuntimeInputYaml({
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      moduleType: module,
      repoIdentifier,
      branch
    },
    identifier: pipelineIdentifier,
    originalExecutionId: defaultTo(pipelineExecutionId, '')
  })

  const { mutate: mergeInputSet, loading: loadingMergeInputSetUpdate } =
    useGetMergeInputSetFromPipelineTemplateWithListInput({
      queryParams: {
        accountIdentifier: accountId,
        projectIdentifier,
        orgIdentifier,
        pipelineIdentifier,
        ...(!isEmpty(repoIdentifier) && !isEmpty(branch)
          ? {
              pipelineRepoID: repoIdentifier,
              pipelineBranch: branch,
              repoIdentifier,
              branch,
              getDefaultFromOtherRepo: true
            }
          : {})
      }
    })

  const { data: stageExecutionData } = useGetStagesExecutionList({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      pipelineIdentifier,
      branch,
      repoIdentifier
    }
  })

  const executionStageList = useMemo((): SelectOption[] => {
    const executionStages: SelectOption[] =
      stageExecutionData?.data?.map((execStage: StageExecutionResponse) => {
        return {
          label: defaultTo(execStage?.stageName, ''),
          value: defaultTo(execStage?.stageIdentifier, '')
        }
      }) || []
    executionStages.unshift(getAllStageItem(getString))

    if (stagesExecuted?.length) {
      const updatedSelectedStageList: SelectedStageData[] = []
      const updatedSelectedItems: SelectOption[] = []
      stagesExecuted.forEach(stageExecuted => {
        const selectedStage = stageExecutionData?.data?.find(stageData => stageData.stageIdentifier === stageExecuted)
        selectedStage && updatedSelectedStageList.push(selectedStage)
        selectedStage &&
          updatedSelectedItems.push({
            label: selectedStage?.stageName as string,
            value: selectedStage?.stageIdentifier as string
          })
      })

      setSelectedStageData({
        selectedStages: updatedSelectedStageList,
        selectedStageItems: updatedSelectedItems,
        allStagesSelected: false
      })
      setSkipPreFlightCheck(true)
    } else {
      setSelectedStageData({
        selectedStages: [getAllStageData(getString)],
        selectedStageItems: [getAllStageItem(getString)],
        allStagesSelected: true
      })
    }
    return executionStages
  }, [stageExecutionData?.data])

  const yamlTemplate = useMemo(() => {
    return parse(defaultTo(template?.data?.inputSetTemplateYaml, ''))?.pipeline
  }, [template?.data?.inputSetTemplateYaml])

  useEffect(() => {
    const parsedPipelineYaml = parse(defaultTo(template?.data?.inputSetTemplateYaml, '')) || {}
    const toBeUpdated = mergeWith(parsedPipelineYaml, currentPipeline || {}, mergeWithPipelineCustomizer) as {
      pipeline: PipelineInfoConfig
    }

    setCurrentPipeline(toBeUpdated)
  }, [template?.data?.inputSetTemplateYaml])

  useEffect(() => {
    setSelectedInputSets(inputSetSelected)
  }, [inputSetSelected])

  useEffect(() => {
    if (inputSetYAML) {
      const parsedYAML = parse(inputSetYAML)
      setExistingProvide('provide')
      setCurrentPipeline(parsedYAML)
    } else {
      setExistingProvide(template?.data?.hasInputSets ? 'existing' : 'provide')
    }
  }, [inputSetYAML, template?.data?.hasInputSets])

  useEffect(() => {
    if (getTemplateError) {
      showError(getTemplateError.message)
    }
  }, [getTemplateError])

  const shouldMakeMergeInputSetCall = useCallback(() => {
    return !isEmpty(selectedInputSets)
  }, [selectedInputSets])

  const makeMergeInputSetCall = useCallback(
    async (parsedTemplate: { pipeline: PipelineInfoConfig }) => {
      try {
        const data = await mergeInputSet({
          inputSetReferences: selectedInputSets?.map(item => item.value as string),
          stageIdentifiers: selectedStageData.allStagesSelected
            ? []
            : selectedStageData.selectedStageItems.map(stageData => stageData.value as string)
        })
        if (data?.data?.pipelineYaml) {
          const inputSetPortion = parse(data.data.pipelineYaml) as {
            pipeline: PipelineInfoConfig
          }
          const toBeUpdated = mergeTemplateWithInputSetData(parsedTemplate, inputSetPortion)
          setCurrentPipeline(toBeUpdated)
        }
      } catch (e: any) {
        showError(getErrorInfoFromErrorObject(e), undefined, 'pipeline.feth.inputSetTemplateYaml.error')
      }
    },
    [selectedInputSets]
  )

  useDeepCompareEffect(() => {
    if (template?.data?.inputSetTemplateYaml) {
      const parsedTemplate = parse(template?.data?.inputSetTemplateYaml) as { pipeline: PipelineInfoConfig }
      if (shouldMakeMergeInputSetCall()) {
        makeMergeInputSetCall(parsedTemplate)
      } else if (!selectedInputSets?.length && !inputSetYAML?.length) {
        setCurrentPipeline(parsedTemplate)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    template?.data?.inputSetTemplateYaml,
    selectedInputSets,
    accountId,
    projectIdentifier,
    orgIdentifier,
    pipelineIdentifier
  ])

  const resolvedPipeline: PipelineInfoConfig | undefined = parse(
    defaultTo(templateRefsResolvedPipeline?.data?.mergedPipelineYaml, '')
  )

  const valuesPipelineRef = useRef<PipelineInfoConfig>()

  useDeepCompareEffect(() => {
    if (resolvedPipeline) {
      updatePipelineInVaribalesContext(resolvedPipeline)
    }
  }, [resolvedPipeline])

  const [showPreflightCheckModal, hidePreflightCheckModal] = useModalHook(() => {
    return (
      <Dialog
        className={cx(css.preFlightCheckModal, Classes.DIALOG)}
        enforceFocus={false}
        isOpen
        onClose={hidePreflightCheckModal}
      >
        <PreFlightCheckModal
          pipeline={valuesPipelineRef.current}
          module={module}
          accountId={accountId}
          orgIdentifier={orgIdentifier}
          projectIdentifier={projectIdentifier}
          pipelineIdentifier={pipelineIdentifier}
          branch={branch}
          repoIdentifier={repoIdentifier}
          onCloseButtonClick={hidePreflightCheckModal}
          onContinuePipelineClick={() => {
            hidePreflightCheckModal()
            handleRunPipeline(valuesPipelineRef.current, true)
          }}
        />
      </Dialog>
    )
  }, [])

  const handleRunPipeline = useCallback(
    async (valuesPipeline?: PipelineInfoConfig, forceSkipFlightCheck = false) => {
      if (Object.keys(formErrors).length) {
        return
      }

      valuesPipelineRef.current = valuesPipeline
      if (!skipPreFlightCheck && !forceSkipFlightCheck) {
        // Not skipping pre-flight check - open the new modal
        showPreflightCheckModal()
        return
      }
      const expressionValues: KVPair = {}
      Object.entries(expressionFormState).forEach(([key, value]: string[]) => {
        expressionValues[key] = value
      })

      try {
        let response
        if (isEmpty(pipelineExecutionId)) {
          response = selectedStageData.allStagesSelected
            ? await runPipeline(
                !isEmpty(valuesPipelineRef.current)
                  ? (yamlStringify({ pipeline: valuesPipelineRef.current }) as any)
                  : ''
              )
            : await runStage({
                runtimeInputYaml: !isEmpty(valuesPipelineRef.current)
                  ? (yamlStringify({ pipeline: valuesPipelineRef.current }) as any)
                  : '',
                stageIdentifiers: stageIdentifiers,
                expressionValues
              })
        } else {
          response = selectedStageData.allStagesSelected
            ? await reRunPipeline(
                !isEmpty(valuesPipelineRef.current)
                  ? (yamlStringify({ pipeline: valuesPipelineRef.current }) as any)
                  : ''
              )
            : await reRunStages({
                runtimeInputYaml: !isEmpty(valuesPipelineRef.current)
                  ? (yamlStringify({ pipeline: valuesPipelineRef.current }) as any)
                  : '',
                stageIdentifiers: stageIdentifiers,
                expressionValues
              })
        }

        const data = response.data
        const governanceMetadata = data?.planExecution?.governanceMetadata

        if (response.status === 'SUCCESS') {
          if (onClose) {
            onClose()
          }
          if (response.data) {
            showSuccess(getString('runPipelineForm.pipelineRunSuccessFully'))
            history.push({
              pathname: routes.toExecutionPipelineView({
                orgIdentifier,
                pipelineIdentifier,
                projectIdentifier,
                executionIdentifier: defaultTo(data?.planExecution?.uuid, ''),
                accountId,
                module
              }),
              state: {
                shouldShowGovernanceEvaluations:
                  governanceMetadata?.status === 'error' || governanceMetadata?.status === 'warning',
                governanceMetadata
              }
            })
            trackEvent(PipelineActions.StartedExecution, { module })
          }
        }
      } catch (error: any) {
        showWarning(defaultTo(getErrorInfoFromErrorObject(error), getString('runPipelineForm.runPipelineFailed')))
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      runPipeline,
      runStage,
      showWarning,
      showSuccess,
      pipelineIdentifier,
      history,
      orgIdentifier,
      module,
      projectIdentifier,
      onClose,
      accountId,
      skipPreFlightCheck,
      formErrors,
      selectedStageData
    ]
  )

  const [yamlHandler, setYamlHandler] = useState<YamlBuilderHandlerBinding | undefined>()
  const [lastYaml, setLastYaml] = useState({})

  const blockedStagesSelected = useMemo(() => {
    let areDependentStagesSelected = false
    if (selectedStageData.allStagesSelected) {
      return areDependentStagesSelected
    }

    const allRequiredStagesUpdated: string[] = []
    const stagesSelectedMap: { [key: string]: SelectedStageData } = keyBy(
      selectedStageData.selectedStages,
      'stageIdentifier'
    )
    selectedStageData.selectedStages.forEach((stage: StageExecutionResponse) => {
      if (stage.toBeBlocked) {
        allRequiredStagesUpdated.push(...(stage.stagesRequired || []))
      }
    })

    allRequiredStagesUpdated.forEach((stageId: string) => {
      if (!stagesSelectedMap[stageId]) {
        areDependentStagesSelected = true
      }
    })

    return areDependentStagesSelected
  }, [selectedStageData])

  useEffect(() => {
    try {
      if (yamlHandler) {
        const Interval = window.setInterval(() => {
          const parsedYaml = parse(defaultTo(yamlHandler.getLatestYaml(), ''))
          if (!isEqual(lastYaml, parsedYaml)) {
            setCurrentPipeline(parsedYaml as { pipeline: PipelineInfoConfig })
            setLastYaml(parsedYaml)
          }
        }, POLL_INTERVAL)
        return () => {
          window.clearInterval(Interval)
        }
      }
    } catch (e) {
      // Ignore Error
    }
  }, [yamlHandler, lastYaml])

  const updateExpressionValue = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (!e.target) {
      return
    }

    const keyName: string = e.target.name
    const exprValue: string = defaultTo(e.target.value, '').trim()
    setExpressionFormState(
      (oldState: KVPair): KVPair => ({
        ...oldState,
        [keyName]: exprValue
      })
    )
    if (formErrors) {
      const formErrorsUpdated = { ...formErrors }
      if (!(formErrors as any)[keyName] && isEmpty(exprValue)) {
        ;(formErrorsUpdated as any)[keyName] = getString('pipeline.expressionRequired')
      } else if ((formErrors as any)[keyName] && !isEmpty(exprValue)) {
        delete (formErrorsUpdated as any)[keyName]
      }

      setFormErrors(formErrorsUpdated)
    }
  }

  const getFormErrors = async (
    latestPipeline: { pipeline: PipelineInfoConfig },
    latestYamlTemplate: PipelineInfoConfig,
    orgPipeline: PipelineInfoConfig | undefined
  ): Promise<FormikErrors<InputSetDTO>> => {
    let errors = formErrors
    function validateErrors(): Promise<FormikErrors<InputSetDTO>> {
      return new Promise(resolve => {
        setTimeout(() => {
          const validatedErrors =
            (validatePipeline({
              pipeline: { ...clearRuntimeInput(latestPipeline.pipeline) },
              template: latestYamlTemplate,
              originalPipeline: orgPipeline,
              getString,
              viewType: StepViewType.DeploymentForm
            }) as any) || formErrors
          resolve(validatedErrors)
        }, 300)
      })
    }
    if (latestPipeline?.pipeline && latestYamlTemplate && orgPipeline) {
      errors = await validateErrors()
      const expressionErrors: KVPair = {}

      // vaidate replacedExpressions
      if (template?.data?.replacedExpressions?.length) {
        template.data.replacedExpressions.forEach((value: string) => {
          const currValue = defaultTo(expressionFormState[value], '')
          if (currValue.trim() === '') expressionErrors[value] = getString('pipeline.expressionRequired')
        })
      }
      setFormErrors({ ...errors, ...expressionErrors })
    }
    return errors
  }

  const shouldShowPageSpinner = (): boolean => {
    return (
      loadingPipeline ||
      loadingResolvedPipeline ||
      loadingTemplate ||
      runLoading ||
      runStageLoading ||
      reRunLoading ||
      reRunStagesLoading
    )
  }

  const formRefDom = React.useRef<HTMLElement | undefined>()
  const handleValidation = async (values: Values): Promise<void> => {
    // Sanitize any empty objects
    const latestPipeline = sanitize(
      mergeWith(currentPipeline, { pipeline: values as PipelineInfoConfig }, currentValue => {
        // Return empty object if there exists no key in the current pipeline that matches the one in the values passed.
        if (currentValue === undefined) {
          return {}
        } else {
          return undefined
        }
      }),
      {
        removeEmptyArray: false,
        removeEmptyString: false
      }
    ) as {
      pipeline: PipelineInfoConfig
    }
    setCurrentPipeline(latestPipeline)
    const runPipelineFormErrors = await getFormErrors(latestPipeline, yamlTemplate, pipeline)
    // https://github.com/formium/formik/issues/1392
    throw runPipelineFormErrors
  }

  if (shouldShowPageSpinner()) {
    return <PageSpinner />
  }

  const getFormikInitialValues = () => {
    if (isEmpty(yamlTemplate)) {
      return {}
    } else if (pipeline && currentPipeline && template?.data?.inputSetTemplateYaml) {
      if (currentPipeline?.pipeline) {
        return clearRuntimeInput(currentPipeline.pipeline)
      }
      return {}
    } else if (currentPipeline?.pipeline) {
      return clearRuntimeInput(currentPipeline.pipeline)
    }
    return {}
  }

  let runPipelineFormContent: React.ReactElement | null = null

  if (getTemplateError?.message) {
    runPipelineFormContent = <PipelineInvalidRequestContent onClose={onClose} getTemplateError={getTemplateError} />
  } else {
    runPipelineFormContent = (
      <>
        <Formik<Values>
          initialValues={getFormikInitialValues() as Values}
          formName="runPipeline"
          onSubmit={handleRunPipeline as any}
          enableReinitialize
          validate={handleValidation}
        >
          {({ submitForm, values, setFormikState }) => {
            return (
              <Layout.Vertical
                ref={ref => {
                  formRefDom.current = ref as HTMLElement
                }}
              >
                <RunModalHeader
                  pipelineExecutionId={pipelineExecutionId}
                  selectedStageData={selectedStageData}
                  setSelectedStageData={setSelectedStageData}
                  setSkipPreFlightCheck={setSkipPreFlightCheck}
                  setSelectedView={setSelectedView}
                  setCurrentPipeline={setCurrentPipeline}
                  runClicked={runClicked}
                  yamlHandler={yamlHandler}
                  selectedView={selectedView}
                  executionView={executionView}
                  pipelineResponse={pipelineResponse}
                  getTemplateFromPipeline={getTemplateFromPipeline}
                  template={template}
                  formRefDom={formRefDom}
                  formErrors={formErrors}
                  stageExecutionData={stageExecutionData}
                  executionStageList={executionStageList}
                />
                <RequiredStagesInfo
                  selectedStageData={selectedStageData}
                  blockedStagesSelected={blockedStagesSelected}
                  getString={getString}
                />
                <ApprovalStageInfo pipeline={pipeline} selectedStageData={selectedStageData} />
                <ExpressionsInfo template={template} getString={getString} />
                <ReplacedExpressionInputForm
                  updateExpressionValue={updateExpressionValue}
                  expressions={template?.data?.replacedExpressions}
                />
                {selectedView === SelectedView.VISUAL ? (
                  <VisualView
                    executionView={executionView}
                    selectedInputSets={selectedInputSets}
                    existingProvide={existingProvide}
                    setExistingProvide={setExistingProvide}
                    executionInputSetTemplateYaml={executionInputSetTemplateYaml}
                    pipelineIdentifier={pipelineIdentifier}
                    template={template}
                    pipeline={pipeline}
                    currentPipeline={currentPipeline}
                    getTemplateError={getTemplateError}
                    resolvedPipeline={resolvedPipeline}
                    submitForm={submitForm}
                    setRunClicked={setRunClicked}
                    hasInputSets={!!template?.data?.hasInputSets}
                    setSelectedInputSets={setSelectedInputSets}
                    loading={loadingMergeInputSetUpdate}
                    loadingMergeInputSetUpdate={loadingMergeInputSetUpdate}
                  />
                ) : (
                  <div className={css.editor}>
                    <Layout.Vertical className={css.content} padding="xlarge">
                      <YamlBuilderMemo
                        {...yamlBuilderReadOnlyModeProps}
                        existingJSON={{ pipeline: values }}
                        bind={setYamlHandler}
                        schema={{}}
                        invocationMap={factory.getInvocationMap()}
                        height="55vh"
                        width="100%"
                        showSnippetSection={false}
                        isEditModeSupported={canEdit}
                      />
                    </Layout.Vertical>
                  </div>
                )}
                <CheckBoxActions
                  executionView={executionView}
                  notifyOnlyMe={notifyOnlyMe}
                  skipPreFlightCheck={skipPreFlightCheck}
                  setSkipPreFlightCheck={setSkipPreFlightCheck}
                  setNotifyOnlyMe={setNotifyOnlyMe}
                />
                {executionView ? null : (
                  <Layout.Horizontal
                    padding={{ left: 'xlarge', right: 'xlarge', top: 'large', bottom: 'large' }}
                    flex={{ justifyContent: 'space-between', alignItems: 'center' }}
                    className={css.footer}
                  >
                    <Layout.Horizontal className={cx(css.actionButtons)}>
                      <RbacButton
                        variation={ButtonVariation.PRIMARY}
                        intent="success"
                        type="submit"
                        text={getString('runPipeline')}
                        onClick={event => {
                          event.stopPropagation()
                          setRunClicked(true)
                          setFormikState({ submitCount: 1 })
                          if (
                            (!selectedInputSets || selectedInputSets.length === 0) &&
                            existingProvide === 'existing'
                          ) {
                            setExistingProvide('provide')
                          } else {
                            submitForm()
                          }
                        }}
                        featuresProps={getFeaturePropsForRunPipelineButton({
                          modules: template?.data?.modules,
                          getString
                        })}
                        permission={{
                          resource: {
                            resourceIdentifier: pipeline?.identifier as string,
                            resourceType: ResourceType.PIPELINE
                          },
                          permission: PermissionIdentifier.EXECUTE_PIPELINE
                        }}
                        disabled={blockedStagesSelected || (getErrorsList(formErrors).errorCount > 0 && runClicked)}
                      />
                      <div className={css.secondaryButton}>
                        <Button
                          variation={ButtonVariation.TERTIARY}
                          id="cancel-runpipeline"
                          text={getString('cancel')}
                          margin={{ left: 'medium' }}
                          background={Color.GREY_50}
                          onClick={() => {
                            if (onClose) {
                              onClose()
                            }
                          }}
                        />
                      </div>
                    </Layout.Horizontal>
                    <SaveAsInputSet
                      key="saveasinput"
                      pipeline={pipeline}
                      currentPipeline={currentPipeline}
                      values={values}
                      template={template?.data?.inputSetTemplateYaml}
                      canEdit={canEdit}
                      accountId={accountId}
                      projectIdentifier={projectIdentifier}
                      orgIdentifier={orgIdentifier}
                      repoIdentifier={repoIdentifier}
                      branch={branch}
                      isGitSyncEnabled={isGitSyncEnabled}
                      setFormErrors={setFormErrors}
                      refetchParentData={getTemplateFromPipeline}
                    />
                  </Layout.Horizontal>
                )}
              </Layout.Vertical>
            )
          }}
        </Formik>
      </>
    )
  }

  return executionView ? (
    <div className={css.runFormExecutionView}>{runPipelineFormContent}</div>
  ) : (
    <RunPipelineFormWrapper
      accountId={accountId}
      orgIdentifier={orgIdentifier}
      pipelineIdentifier={pipelineIdentifier}
      projectIdentifier={projectIdentifier}
      module={module}
      pipeline={pipeline}
    >
      {runPipelineFormContent}
    </RunPipelineFormWrapper>
  )
}

export interface RunPipelineFormWrapperProps extends PipelineType<PipelinePathProps> {
  children: React.ReactNode
  pipeline?: PipelineInfoConfig
}

export function RunPipelineFormWrapper(props: RunPipelineFormWrapperProps): React.ReactElement {
  const { children } = props

  return (
    <React.Fragment>
      <div className={css.runForm}>{children}</div>
    </React.Fragment>
  )
}

export function RunPipelineForm(props: RunPipelineFormProps & InputSetGitQueryParams): React.ReactElement {
  return (
    <NestedAccordionProvider>
      <PipelineVariablesContextProvider>
        <RunPipelineFormBasic {...props} />
      </PipelineVariablesContextProvider>
    </NestedAccordionProvider>
  )
}
