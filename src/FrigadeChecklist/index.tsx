import React, { CSSProperties, useEffect, useState } from 'react'

import { useFlows } from '../api/flows'
import { HeroChecklist, HeroChecklistProps } from '../Checklists/HeroChecklist'
import { StepData } from '../types'
import { ModalChecklist } from '../Checklists/ModalChecklist'
import { COMPLETED_STEP } from '../api/common'
import { primaryCTAClickSideEffects, secondaryCTAClickSideEffects } from '../shared/cta-util'
import { useFlowOpens } from '../api/flow-opens'

export interface FrigadeHeroChecklistProps extends HeroChecklistProps {
  flowId: string
  title?: string
  subtitle?: string
  primaryColor?: string

  onCompleteStep?: (index: number, stepData: StepData) => void
  style?: CSSProperties
  // Optional props
  initialSelectedStep?: number

  className?: string
  type?: 'inline' | 'modal'

  visible?: boolean

  onDismiss?: () => void

  customVariables?: { [key: string]: string | number | boolean }
}

export const FrigadeChecklist: React.FC<FrigadeHeroChecklistProps> = ({
  flowId,
  title,
  subtitle,
  primaryColor,
  style,
  initialSelectedStep,
  className,
  type,
  onDismiss,
  visible,
  customVariables,
}) => {
  const {
    getFlow,
    getFlowSteps,
    markStepCompleted,
    getStepStatus,
    getNumberOfStepsCompleted,
    isLoading,
    targetingLogicShouldHideFlow,
    setCustomVariable,
  } = useFlows()
  const { getOpenFlowState, setOpenFlowState } = useFlowOpens()
  const [selectedStep, setSelectedStep] = useState(initialSelectedStep || 0)
  const [finishedInitialLoad, setFinishedInitialLoad] = useState(false)
  const showModal = visible === undefined ? getOpenFlowState(flowId) : visible

  useEffect(() => {
    if (!isLoading && customVariables) {
      Object.keys(customVariables).forEach((key) => {
        setCustomVariable(key, customVariables[key])
      })
    }
  }, [customVariables, isLoading])

  if (isLoading) {
    return null
  }
  const flow = getFlow(flowId)
  if (!flow) {
    return null
  }

  if (targetingLogicShouldHideFlow(flow)) {
    return null
  }

  const steps = getFlowSteps(flowId)
  if (!steps) {
    return null
  }

  if (!finishedInitialLoad && initialSelectedStep === undefined) {
    const completedSteps = Math.min(getNumberOfStepsCompleted(flowId), steps.length - 1)
    setSelectedStep(completedSteps)
    setFinishedInitialLoad(true)
  }

  function goToNextStepIfPossible() {
    if (selectedStep + 1 >= steps.length) {
      // If modal, close it
      if (type === 'modal') {
        setOpenFlowState(flowId, false)
      }
      return
    }

    setSelectedStep(selectedStep + 1)
  }

  function getSteps() {
    return steps.map((step: StepData) => {
      return {
        handleSecondaryCTAClick: () => {
          // Default to skip behavior for secondary click but allow for override
          goToNextStepIfPossible()
          secondaryCTAClickSideEffects(step)
          if (step.skippable === true) {
            markStepCompleted(flowId, step.id, { skipped: true })
          }
        },
        ...step,
        complete: getStepStatus(flowId, step.id) === COMPLETED_STEP,
        handleCTAClick: () => {
          if (
            !step.completionCriteria &&
            (step.autoMarkCompleted || step.autoMarkCompleted === undefined)
          ) {
            markStepCompleted(flowId, step.id)
            goToNextStepIfPossible()
          }
          if (step.primaryButtonUri && step.primaryButtonUri.trim() == '#' && type === 'modal') {
            setOpenFlowState(flowId, false)
          }
          primaryCTAClickSideEffects(step)
        },
      }
    })
  }

  const commonProps = {
    steps: getSteps(),
    title,
    subtitle,
    primaryColor,
  }

  if (type === 'modal') {
    return (
      <ModalChecklist
        visible={showModal}
        onClose={() => {
          setOpenFlowState(flowId, false)
          if (onDismiss) {
            onDismiss()
          }
        }}
        selectedStep={selectedStep}
        setSelectedStep={setSelectedStep}
        autoExpandNextStep={true}
        {...commonProps}
      />
    )
  }

  return (
    <HeroChecklist
      style={style}
      selectedStep={selectedStep}
      setSelectedStep={setSelectedStep}
      className={className}
      {...commonProps}
    />
  )
}
